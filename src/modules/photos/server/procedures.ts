import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { and, eq, asc, sql, ilike, count, inArray, or } from "drizzle-orm";
import {
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
  MIN_PAGE_SIZE,
} from "@/constants";
import {
  citySets,
  photos,
  photosUpdateSchema,
  photosInsertSchema,
} from "@/db/schema";
import { TRPCError } from "@trpc/server";
import type { NeonHttpDatabase } from "drizzle-orm/neon-http";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { s3Client } from "@/modules/s3/lib/server-client";
import { escapeLike } from "@/lib/escape-like";
import { logger } from "@/lib/logger";

type AppDatabase = typeof import("@/db").db;
type DatabaseExecutor = Pick<AppDatabase, "select" | "insert" | "update" | "delete">;

function getCitySetName(photo: {
  city?: string | null;
  region?: string | null;
  countryCode?: string | null;
}) {
  return photo.countryCode === "JP" || photo.countryCode === "TW"
    ? photo.region
    : photo.city;
}

async function removePhotoFromCitySet(
  database: DatabaseExecutor,
  photo: typeof photos.$inferSelect,
) {
  const cityName = getCitySetName(photo);
  if (!photo.country || !cityName) return;

  const [citySet] = await database
    .select()
    .from(citySets)
    .where(
      and(
        eq(citySets.country, photo.country),
        eq(citySets.city, cityName),
      ),
    );

  if (!citySet) return;

  if (citySet.photoCount <= 1) {
    await database
      .delete(citySets)
      .where(
        and(
          eq(citySets.id, citySet.id),
          sql`${citySets.photoCount} <= 1`,
        ),
      );
    return;
  }

  const cityPhotoColumn =
    photo.countryCode === "JP" || photo.countryCode === "TW"
      ? photos.region
      : photos.city;
  const newCoverPhotoId =
    citySet.coverPhotoId === photo.id
      ? (
          await database
            .select({ id: photos.id })
            .from(photos)
            .where(
              and(
                eq(photos.country, photo.country),
                eq(cityPhotoColumn, cityName),
                sql`${photos.id} != ${photo.id}`,
              ),
            )
            .limit(1)
        )[0]?.id
      : undefined;

  await database
    .update(citySets)
    .set({
      photoCount: sql`${citySets.photoCount} - 1`,
      ...(newCoverPhotoId ? { coverPhotoId: newCoverPhotoId } : {}),
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(citySets.id, citySet.id),
        sql`${citySets.photoCount} > 1`,
      ),
    );
}

function buildPhotoRemovalBatch(
  database: DatabaseExecutor,
  photo: typeof photos.$inferSelect,
) {
  const cityName = getCitySetName(photo);
  const hasCity = Boolean(photo.country && cityName);
  const cityCondition = hasCity
    ? sql`${citySets.country} = ${photo.country} AND ${citySets.city} = ${cityName}`
    : sql`false`;
  const photoCityColumn =
    photo.countryCode === "JP" || photo.countryCode === "TW"
      ? photos.region
      : photos.city;
  const replacementCoverPhoto = hasCity
    ? sql`(
        SELECT ${photos.id}
        FROM ${photos}
        WHERE ${photos.country} = ${photo.country}
          AND ${photoCityColumn} = ${cityName}
          AND ${photos.id} != ${photo.id}
        LIMIT 1
      )`
    : sql`${citySets.coverPhotoId}`;

  return [
    database
      .delete(citySets)
      .where(sql`${cityCondition} AND ${citySets.photoCount} <= 1`),
    database
      .update(citySets)
      .set({
        photoCount: sql`${citySets.photoCount} - 1`,
        coverPhotoId: sql`CASE
          WHEN ${citySets.coverPhotoId} = ${photo.id}
          THEN ${replacementCoverPhoto}
          ELSE ${citySets.coverPhotoId}
        END`,
        updatedAt: new Date(),
      })
      .where(sql`${cityCondition} AND ${citySets.photoCount} > 1`),
    database.delete(photos).where(eq(photos.id, photo.id)).returning(),
  ] as const;
}

async function addPhotoToCitySet(
  database: DatabaseExecutor,
  photo: typeof photos.$inferSelect,
) {
  const cityName = getCitySetName(photo);
  if (!photo.country || !photo.countryCode || !cityName) return;

  await database
    .insert(citySets)
    .values({
      country: photo.country,
      countryCode: photo.countryCode,
      city: cityName,
      photoCount: 1,
      coverPhotoId: photo.id,
    })
    .onConflictDoUpdate({
      target: [citySets.country, citySets.city],
      set: {
        countryCode: photo.countryCode,
        photoCount: sql`${citySets.photoCount} + 1`,
        coverPhotoId: sql`COALESCE(${citySets.coverPhotoId}, ${photo.id})`,
        updatedAt: new Date(),
      },
    });
}

async function syncPhotoCitySet(
  database: DatabaseExecutor,
  previousPhoto: typeof photos.$inferSelect,
  updatedPhoto: typeof photos.$inferSelect,
) {
  const previousCity = getCitySetName(previousPhoto);
  const updatedCity = getCitySetName(updatedPhoto);
  const isSameCity =
    previousPhoto.country === updatedPhoto.country &&
    previousCity === updatedCity;

  if (isSameCity) {
    if (
      updatedPhoto.country &&
      updatedCity &&
      updatedPhoto.countryCode &&
      previousPhoto.countryCode !== updatedPhoto.countryCode
    ) {
      await database
        .update(citySets)
        .set({ countryCode: updatedPhoto.countryCode, updatedAt: new Date() })
        .where(
          and(
            eq(citySets.country, updatedPhoto.country),
            eq(citySets.city, updatedCity),
          ),
        );
    }
    return;
  }

  await removePhotoFromCitySet(database, previousPhoto);
  await addPhotoToCitySet(database, updatedPhoto);
}

export const photosRouter = createTRPCRouter({
  create: protectedProcedure
    .input(photosInsertSchema)
    .mutation(async ({ ctx, input }) => {
      const values = {
        ...input,
        id: input.id ?? crypto.randomUUID(),
      };

      try {
        if (process.env.DATABASE_PROVIDER === "local") {
          return await ctx.db.transaction(async (transaction) => {
            const [insertedPhoto] = await transaction
              .insert(photos)
              .values(values)
              .returning();
            await addPhotoToCitySet(transaction, insertedPhoto);
            return insertedPhoto;
          });
        }

        const insertQuery = ctx.db
          .insert(photos)
          .values(values)
          .returning();
        const neonDatabase = ctx.db as NeonHttpDatabase<
          typeof import("@/db/schema")
        >;
        const cityName = getCitySetName(values);

        if (values.country && values.countryCode && cityName) {
          const citySetQuery = ctx.db
            .insert(citySets)
            .values({
              country: values.country,
              countryCode: values.countryCode,
              city: cityName,
              photoCount: 1,
              coverPhotoId: values.id,
            })
            .onConflictDoUpdate({
              target: [citySets.country, citySets.city],
              set: {
                countryCode: values.countryCode,
                photoCount: sql`${citySets.photoCount} + 1`,
                coverPhotoId: sql`COALESCE(${citySets.coverPhotoId}, ${values.id})`,
                updatedAt: new Date(),
              },
            });
          const [insertedPhotos] = await neonDatabase.batch([
            insertQuery,
            citySetQuery,
          ]);
          return insertedPhotos[0];
        }

        const [insertedPhotos] = await neonDatabase.batch([insertQuery]);
        return insertedPhotos[0];
      } catch (error) {
        logger.error("Photo creation failed", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create photo",
        });
      }
    }),
  remove: protectedProcedure
    .input(
      z.object({
        id: z.uuid(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id } = input;

      if (!id) {
        throw new TRPCError({ code: "BAD_REQUEST" });
      }

      try {
        let photo: typeof photos.$inferSelect;
        if (process.env.DATABASE_PROVIDER === "local") {
          photo = await ctx.db.transaction(async (transaction) => {
            const [existingPhoto] = await transaction
              .select()
              .from(photos)
              .where(eq(photos.id, id));

            if (!existingPhoto) {
              throw new TRPCError({
                code: "NOT_FOUND",
                message: "Photo not found",
              });
            }

            await removePhotoFromCitySet(transaction, existingPhoto);
            const [deletedPhoto] = await transaction
              .delete(photos)
              .where(eq(photos.id, id))
              .returning();

            if (!deletedPhoto) {
              throw new TRPCError({
                code: "NOT_FOUND",
                message: "Photo not found",
              });
            }
            return deletedPhoto;
          });
        } else {
          const [existingPhoto] = await ctx.db
            .select()
            .from(photos)
            .where(eq(photos.id, id));

          if (!existingPhoto) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "Photo not found",
            });
          }

          const neonDatabase = ctx.db as NeonHttpDatabase<
            typeof import("@/db/schema")
          >;
          await neonDatabase.batch(
            buildPhotoRemovalBatch(ctx.db, existingPhoto),
          );
          photo = existingPhoto;
        }

        // Delete the object only after the database changes commit.
        try {
          const command = new DeleteObjectCommand({
            Bucket: process.env.S3_BUCKET_NAME,
            Key: photo.url,
          });
          await s3Client.send(command);
        } catch (error) {
          logger.error("S3 photo deletion failed; orphan file may remain", error, {
            photoId: photo.id,
            key: photo.url,
          });
        }

        return photo;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        logger.error("Photo deletion failed", error, { photoId: id });
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete photo",
        });
      }
    }),
  update: protectedProcedure
    .input(photosUpdateSchema)
    .mutation(async ({ ctx, input }) => {
      const { id } = input;

      if (!id) {
        throw new TRPCError({ code: "BAD_REQUEST" });
      }

      const [previousPhoto] = await ctx.db
        .select()
        .from(photos)
        .where(eq(photos.id, id));

      if (!previousPhoto) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      const coordinatesChanged =
        (input.latitude !== undefined &&
          input.latitude !== previousPhoto.latitude) ||
        (input.longitude !== undefined &&
          input.longitude !== previousPhoto.longitude);
      const locationFields = [
        "country",
        "countryCode",
        "region",
        "city",
        "district",
        "fullAddress",
        "placeFormatted",
      ] as const;
      const hasCompleteLocation =
        locationFields.every((field) =>
          Object.prototype.hasOwnProperty.call(input, field),
        );

      if (coordinatesChanged && !hasCompleteLocation) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Location metadata is required when coordinates change",
        });
      }

      const [updatedPhoto] = await ctx.db
        .update(photos)
        .set({
          ...input,
          updatedAt: new Date(),
        })
        .where(eq(photos.id, id))
        .returning();

      if (!updatedPhoto) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      await syncPhotoCitySet(ctx.db, previousPhoto, updatedPhoto);

      return updatedPhoto;
    }),
  bulkUpdate: protectedProcedure
    .input(
      z
        .object({
          ids: z.array(z.uuid()).min(1).max(100),
          visibility: z.enum(["public", "private"]).optional(),
          isFavorite: z.boolean().optional(),
        })
        .refine(
          ({ visibility, isFavorite }) =>
            visibility !== undefined || isFavorite !== undefined,
          "At least one field must be updated",
        ),
    )
    .mutation(async ({ ctx, input }) => {
      const { ids, visibility, isFavorite } = input;
      const updated = await ctx.db
        .update(photos)
        .set({
          ...(visibility !== undefined ? { visibility } : {}),
          ...(isFavorite !== undefined ? { isFavorite } : {}),
          updatedAt: new Date(),
        })
        .where(inArray(photos.id, ids))
        .returning();

      return { updatedCount: updated.length };
    }),
  getOne: protectedProcedure
    .input(
      z.object({
        id: z.uuid(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { id } = input;

      const [photo] = await ctx.db
        .select()
        .from(photos)
        .where(eq(photos.id, id));

      if (!photo) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Photo not found",
        });
      }

      return photo;
    }),
  getMany: protectedProcedure
    .input(
      z.object({
        page: z.number().int().min(1).default(DEFAULT_PAGE),
        orderBy: z.enum(["asc", "desc"] as const).default("desc"),
        pageSize: z
          .number()
          .min(MIN_PAGE_SIZE)
          .max(MAX_PAGE_SIZE)
          .default(DEFAULT_PAGE_SIZE),
        search: z.string().nullish(),
        visibility: z.enum(["all", "public", "private"]).default("all"),
        favorite: z
          .enum(["all", "favorites", "not-favorites"])
          .default("all"),
        city: z.string().trim().max(120).default(""),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { page, pageSize, search, orderBy, visibility, favorite, city } =
        input;
      const where = and(
        search
          ? or(
              ilike(photos.title, `%${escapeLike(search)}%`),
              ilike(photos.description, `%${escapeLike(search)}%`),
              ilike(photos.city, `%${escapeLike(search)}%`),
              ilike(photos.region, `%${escapeLike(search)}%`),
              ilike(photos.country, `%${escapeLike(search)}%`),
            )
          : undefined,
        visibility === "all"
          ? undefined
          : eq(photos.visibility, visibility),
        favorite === "all"
          ? undefined
          : eq(photos.isFavorite, favorite === "favorites"),
        city
          ? or(
              ilike(photos.city, `%${escapeLike(city)}%`),
              ilike(photos.region, `%${escapeLike(city)}%`),
            )
          : undefined,
      );

      const data = await ctx.db
        .select({
          id: photos.id,
          url: photos.url,
          title: photos.title,
          blurData: photos.blurData,
          dateTimeOriginal: photos.dateTimeOriginal,
          city: photos.city,
          region: photos.region,
          countryCode: photos.countryCode,
          isFavorite: photos.isFavorite,
          visibility: photos.visibility,
        })
        .from(photos)
        .where(where)
        .orderBy(
          orderBy === "asc"
            ? sql`${photos.dateTimeOriginal} ASC NULLS LAST`
            : sql`${photos.dateTimeOriginal} DESC NULLS LAST`,
          asc(photos.id),
        )
        .limit(pageSize)
        .offset((page - 1) * pageSize);

      const [total] = await ctx.db
        .select({
          count: count(),
        })
        .from(photos)
        .where(where);

      const totalPages = Math.ceil(total.count / pageSize);

      return {
        items: data,
        total: total.count,
        totalPages,
      };
    }),
});
