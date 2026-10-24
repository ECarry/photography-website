import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { and, eq, asc, sql, ilike, count } from "drizzle-orm";
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
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { s3Client } from "@/modules/s3/lib/server-client";
import { escapeLike } from "@/lib/escape-like";
import { logger } from "@/lib/logger";

type AppDatabase = typeof import("@/db").db;

function getCitySetName(photo: {
  city: string | null;
  region: string | null;
  countryCode: string | null;
}) {
  return photo.countryCode === "JP" || photo.countryCode === "TW"
    ? photo.region
    : photo.city;
}

async function removePhotoFromCitySet(
  database: AppDatabase,
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

async function addPhotoToCitySet(
  database: AppDatabase,
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
  database: AppDatabase,
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
      const values = input;

      try {
        const [insertedPhoto] = await ctx.db
          .insert(photos)
          .values(values)
          .returning();

        const cityName = getCitySetName(insertedPhoto);

        if (insertedPhoto.country && cityName && insertedPhoto.countryCode) {
          await ctx.db
            .insert(citySets)
            .values({
              country: insertedPhoto.country,
              countryCode: insertedPhoto.countryCode,
              city: cityName,
              photoCount: 1,
              coverPhotoId: insertedPhoto.id,
            })
            .onConflictDoUpdate({
              target: [citySets.country, citySets.city],
              set: {
                countryCode: insertedPhoto.countryCode,
                photoCount: sql`${citySets.photoCount} + 1`,
                coverPhotoId: sql`COALESCE(${citySets.coverPhotoId}, ${insertedPhoto.id})`,
                updatedAt: new Date(),
              },
            });
        }

        return insertedPhoto;
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

        await removePhotoFromCitySet(ctx.db, photo);

        // delete photo record first, then S3
        await ctx.db.delete(photos).where(eq(photos.id, id));

        // S3 delete after DB — orphan file is acceptable, inconsistent DB is not
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
      }),
    )
    .query(async ({ ctx, input }) => {
      const { page, pageSize, search, orderBy } = input;

      const data = await ctx.db
        .select()
        .from(photos)
        .where(
          search ? ilike(photos.title, `%${escapeLike(search)}%`) : undefined,
        )
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
        .where(
          search ? ilike(photos.title, `%${escapeLike(search)}%`) : undefined,
        );

      const totalPages = Math.ceil(total.count / pageSize);

      return {
        items: data,
        total: total.count,
        totalPages,
      };
    }),
});
