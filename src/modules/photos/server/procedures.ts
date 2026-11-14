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
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { s3Client } from "@/modules/s3/lib/server-client";
import { escapeLike } from "@/lib/escape-like";
import { logger } from "@/lib/logger";
import { revalidatePhotoCaches } from "@/lib/cache";
import {
  atomicExecute,
  type DatabaseExecutor,
} from "@/db/atomic-execute";
import { readBatch } from "@/db/read-batch";
import {
  addPhotoToCitySet,
  buildCitySetSyncQueries,
  buildPhotoRemovalBatch,
  buildCitySetUpsertQuery,
  removePhotoFromCitySet,
  syncPhotoCitySet,
} from "./city-set-sync";

async function validatePhotoUpdate(
  database: DatabaseExecutor,
  previousPhoto: typeof photos.$inferSelect,
  input: z.infer<typeof photosUpdateSchema>,
) {
  if (
    input.visibility === "private" &&
    previousPhoto.visibility === "public"
  ) {
    const [coveringCity] = await database
      .select({ id: citySets.id })
      .from(citySets)
      .where(eq(citySets.coverPhotoId, previousPhoto.id))
      .limit(1);

    if (coveringCity) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message:
          "Choose another public cover photo before making this photo private",
      });
    }
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
  const hasCompleteLocation = locationFields.every((field) =>
    Object.prototype.hasOwnProperty.call(input, field),
  );

  if (coordinatesChanged && !hasCompleteLocation) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Location metadata is required when coordinates change",
    });
  }
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
        const insertedPhoto = await atomicExecute(ctx.db, {
          local: async (transaction) => {
            const [newPhoto] = await transaction
              .insert(photos)
              .values(values)
              .returning();
            await addPhotoToCitySet(transaction, newPhoto);
            return newPhoto;
          },
          neon: async (neonDatabase) => {
            const insertQuery = neonDatabase
              .insert(photos)
              .values(values)
              .returning();
            const citySetQuery = buildCitySetUpsertQuery(
              neonDatabase,
              values,
            );

            if (citySetQuery) {
              const [insertedPhotos] = await neonDatabase.batch([
                insertQuery,
                citySetQuery,
              ]);
              return insertedPhotos[0];
            }

            const [insertedPhotos] = await neonDatabase.batch([insertQuery]);
            return insertedPhotos[0];
          },
        });

        revalidatePhotoCaches();
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
        const photo = await atomicExecute(ctx.db, {
          local: async (transaction) => {
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
          },
          neon: async (neonDatabase) => {
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

            const [, , deletedPhotos] = await neonDatabase.batch(
              buildPhotoRemovalBatch(neonDatabase, existingPhoto),
            );
            const [deletedPhoto] = deletedPhotos as
              | (typeof photos.$inferSelect)[]
              | [];

            if (!deletedPhoto) {
              throw new TRPCError({
                code: "NOT_FOUND",
                message: "Photo not found",
              });
            }
            return deletedPhoto;
          },
        });

        revalidatePhotoCaches();

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

      const updatedPhoto = await atomicExecute(ctx.db, {
        local: async (transaction) => {
          const [previousPhoto] = await transaction
            .select()
            .from(photos)
            .where(eq(photos.id, id));

          if (!previousPhoto) {
            throw new TRPCError({ code: "NOT_FOUND" });
          }

          await validatePhotoUpdate(transaction, previousPhoto, input);
          const [updatedPhoto] = await transaction
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

          await syncPhotoCitySet(transaction, previousPhoto, updatedPhoto);
          return updatedPhoto;
        },
        neon: async (neonDatabase) => {
          const [previousPhoto] = await ctx.db
            .select()
            .from(photos)
            .where(eq(photos.id, id));

          if (!previousPhoto) {
            throw new TRPCError({ code: "NOT_FOUND" });
          }

          await validatePhotoUpdate(ctx.db, previousPhoto, input);
          const updatedAt = new Date();
          const updateQuery = neonDatabase
            .update(photos)
            .set({
              ...input,
              updatedAt,
            })
            .where(eq(photos.id, id))
            .returning();
          const updatedPhotoValues = {
            ...previousPhoto,
            ...input,
            updatedAt,
          };
          const citySetQueries = buildCitySetSyncQueries(
            neonDatabase,
            previousPhoto,
            updatedPhotoValues,
          );
          const results = await neonDatabase.batch([
            updateQuery,
            ...citySetQueries,
          ]);
          const [updatedPhoto] = results[0] as
            | (typeof photos.$inferSelect)[]
            | [];

          if (!updatedPhoto) {
            throw new TRPCError({ code: "NOT_FOUND" });
          }

          return updatedPhoto;
        },
      });

      revalidatePhotoCaches();

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
      if (visibility === "private") {
        const coveredPhotos = await ctx.db
          .select({ id: citySets.coverPhotoId })
          .from(citySets)
          .innerJoin(photos, eq(photos.id, citySets.coverPhotoId))
          .where(
            and(
              inArray(citySets.coverPhotoId, ids),
              eq(photos.visibility, "public"),
            ),
          );

        if (coveredPhotos.length > 0) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message:
              "Choose another public cover photo before making it private",
          });
        }
      }

      const updated = await ctx.db
        .update(photos)
        .set({
          ...(visibility !== undefined ? { visibility } : {}),
          ...(isFavorite !== undefined ? { isFavorite } : {}),
          updatedAt: new Date(),
        })
        .where(inArray(photos.id, ids))
        .returning();

      revalidatePhotoCaches();

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

      const dataQuery = ctx.db
        .select({
          id: photos.id,
          url: photos.url,
          title: photos.title,
          description: photos.description,
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

      const countQuery = ctx.db
        .select({
          count: count(),
        })
        .from(photos)
        .where(where);
      const [data, [total]] = await readBatch(ctx.db, [
        dataQuery,
        countQuery,
      ]);

      const totalPages = Math.ceil(total.count / pageSize);

      return {
        items: data,
        total: total.count,
        totalPages,
      };
    }),
});
