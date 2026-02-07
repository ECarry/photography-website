import { z } from "zod";
import {
  createTRPCRouter,
  baseProcedure,
  protectedProcedure,
} from "@/trpc/init";
import { citySets, photos } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const cityRouter = createTRPCRouter({
  // Get all city sets
  getMany: baseProcedure.query(async ({ ctx }) => {
    const data = await ctx.db
      .select({
        id: citySets.id,
        country: citySets.country,
        countryCode: citySets.countryCode,
        city: citySets.city,
        description: citySets.description,
        photoCount: citySets.photoCount,
        coverPhotoId: citySets.coverPhotoId,
        createdAt: citySets.createdAt,
        updatedAt: citySets.updatedAt,
        // Join with cover photo
        coverPhotoUrl: photos.url,
        coverPhotoBlurData: photos.blurData,
        coverPhotoTitle: photos.title,
      })
      .from(citySets)
      .innerJoin(photos, eq(citySets.coverPhotoId, photos.id))
      .orderBy(desc(citySets.updatedAt), desc(citySets.createdAt));

    return data;
  }),

  // Get one city set with all photos
  getOne: baseProcedure
    .input(
      z.object({
        city: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { city } = input;

      // Get city set info
      const [citySet] = await ctx.db
        .select()
        .from(citySets)
        .where(and(eq(citySets.city, city)));

      if (!citySet) {
        return null;
      }

      // Get all photos in this city
      const cityPhotos = await ctx.db
        .select()
        .from(photos)
        .where(and(eq(photos.city, city), eq(photos.visibility, "public")))
        .orderBy(desc(photos.dateTimeOriginal), desc(photos.createdAt));

      return {
        ...citySet,
        photos: cityPhotos,
      };
    }),

  // Update city cover photo
  updateCoverPhoto: protectedProcedure
    .input(
      z.object({
        cityId: z.uuid(),
        photoId: z.uuid(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { cityId, photoId } = input;

      // Verify the photo exists
      const [photo] = await ctx.db
        .select()
        .from(photos)
        .where(eq(photos.id, photoId));

      if (!photo) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Photo not found",
        });
      }

      // Verify the city set exists
      const [citySet] = await ctx.db
        .select()
        .from(citySets)
        .where(eq(citySets.id, cityId));

      if (!citySet) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "City not found",
        });
      }

      // Verify the photo belongs to this city
      if (photo.city !== citySet.city) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Photo does not belong to this city",
        });
      }

      // Update the cover photo
      const [updatedCitySet] = await ctx.db
        .update(citySets)
        .set({
          coverPhotoId: photoId,
          updatedAt: new Date(),
        })
        .where(eq(citySets.id, cityId))
        .returning();

      return updatedCitySet;
    }),

  // Update city description
  updateDescription: protectedProcedure
    .input(
      z.object({
        cityId: z.uuid(),
        description: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { cityId, description } = input;

      // Verify the city set exists
      const [citySet] = await ctx.db
        .select()
        .from(citySets)
        .where(eq(citySets.id, cityId));

      if (!citySet) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "City not found",
        });
      }

      // Update the description
      const [updatedCitySet] = await ctx.db
        .update(citySets)
        .set({
          description,
          updatedAt: new Date(),
        })
        .where(eq(citySets.id, cityId))
        .returning();

      return updatedCitySet;
    }),
});
