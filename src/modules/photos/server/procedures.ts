import z from "zod";
import { db } from "@/db";
import {
  createTRPCRouter,
  baseProcedure,
  protectedProcedure,
} from "@/trpc/init";
import { and, eq, desc, sql, ilike, count } from "drizzle-orm";
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
import { s3Client } from "@/lib/s3";

export const photosRouter = createTRPCRouter({
  create: protectedProcedure
    .input(photosInsertSchema)
    .mutation(async ({ input }) => {
      const values = input;

      try {
        const [insertedPhoto] = await db
          .insert(photos)
          .values(values)
          .returning();

        const cityName =
          values.countryCode === "JP" || values.countryCode === "TW"
            ? values.region
            : values.city;

        if (insertedPhoto.country && cityName && insertedPhoto.countryCode) {
          await db
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

          const updatedCitySet = await db
            .select()
            .from(citySets)
            .where(
              sql`${citySets.country} = ${insertedPhoto.country} AND ${citySets.city} = ${insertedPhoto.city}`
            );

          console.log("Updated city set:", updatedCitySet);
        } else {
          console.log(
            "No geo information available for photo:",
            insertedPhoto.id
          );
        }

        return insertedPhoto;
      } catch {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create photo",
        });
      }
    }),
  remove: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
      })
    )
    .mutation(async ({ input }) => {
      const { id } = input;

      if (!id) {
        throw new TRPCError({ code: "BAD_REQUEST" });
      }

      try {
        const [photo] = await db.select().from(photos).where(eq(photos.id, id));

        if (!photo) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Photo not found",
          });
        }

        console.log("🗑️ Deleting photo:", photo.id, photo.title);

        // city set related
        if (photo.country && photo.city) {
          console.log("📍 Processing city set:", photo.country, photo.city);
          const [citySet] = await db
            .select()
            .from(citySets)
            .where(
              and(
                eq(citySets.country, photo.country),
                eq(citySets.city, photo.city)
              )
            );

          if (citySet) {
            // if city set photo count is 1, delete the city set
            if (citySet.photoCount === 1) {
              await db.delete(citySets).where(eq(citySets.id, citySet.id));
            } else if (citySet.coverPhotoId === photo.id) {
              // if this is the cover photo, find a new cover photo
              const [newCoverPhoto] = await db
                .select()
                .from(photos)
                .where(
                  and(
                    eq(photos.country, photo.country),
                    eq(photos.city, photo.city),
                    sql`${photos.id} != ${photo.id}`
                  )
                );

              // Update citySet with new cover photo or just decrease count
              await db
                .update(citySets)
                .set({
                  photoCount: sql`${citySets.photoCount} - 1`,
                  ...(newCoverPhoto ? { coverPhotoId: newCoverPhoto.id } : {}),
                  updatedAt: new Date(),
                })
                .where(
                  and(
                    eq(citySets.country, photo.country),
                    eq(citySets.city, photo.city)
                  )
                );
            } else {
              // not a cover photo, just update the count
              await db
                .update(citySets)
                .set({
                  photoCount: sql`${citySets.photoCount} - 1`,
                  updatedAt: new Date(),
                })
                .where(
                  and(
                    eq(citySets.country, photo.country),
                    eq(citySets.city, photo.city)
                  )
                );
            }
          }
        }

        // delete cloudflare r2 file & database record
        try {
          // photo.url is stored as S3 key directly in database
          const key = photo.url;
          console.log("🔑 S3 Key:", key);

          const command = new DeleteObjectCommand({
            Bucket: process.env.S3_BUCKET_NAME,
            Key: key,
          });
          await s3Client.send(command);
          console.log("✅ S3 file deleted");

          await db.delete(photos).where(eq(photos.id, id));
          console.log("✅ Photo record deleted from database");
        } catch (error) {
          if (error instanceof Error) {
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: error.message,
            });
          }
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to delete photo",
          });
        }

        return photo;
      } catch (error) {
        console.error("Photo deletion error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete photo",
        });
      }
    }),
  update: protectedProcedure
    .input(photosUpdateSchema)
    .mutation(async ({ input }) => {
      const { id } = input;

      if (!id) {
        throw new TRPCError({ code: "BAD_REQUEST" });
      }

      const [updatedPhoto] = await db
        .update(photos)
        .set({
          ...input,
        })
        .where(eq(photos.id, id))
        .returning();

      if (!updatedPhoto) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      return updatedPhoto;
    }),
  getOne: baseProcedure
    .input(
      z.object({
        id: z.string().uuid(),
      })
    )
    .query(async ({ input }) => {
      const { id } = input;

      const [photo] = await db.select().from(photos).where(eq(photos.id, id));

      return photo;
    }),
  getMany: baseProcedure
    .input(
      z.object({
        page: z.number().default(DEFAULT_PAGE),
        pageSize: z
          .number()
          .min(MIN_PAGE_SIZE)
          .max(MAX_PAGE_SIZE)
          .default(DEFAULT_PAGE_SIZE),
        search: z.string().nullish(),
      })
    )
    .query(async ({ input }) => {
      const { page, pageSize, search } = input;

      const data = await db
        .select()
        .from(photos)
        .where(search ? ilike(photos.title, `%${search}%`) : undefined)
        .orderBy(desc(photos.createdAt), desc(photos.id))
        .limit(pageSize)
        .offset((page - 1) * pageSize);

      const [total] = await db
        .select({
          count: count(),
        })
        .from(photos)
        .where(search ? ilike(photos.title, `%${search}%`) : undefined);

      const totalPages = Math.ceil(total.count / pageSize);

      return {
        items: data,
        total: total.count,
        totalPages,
      };
    }),
});
