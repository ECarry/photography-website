import { z } from "zod";
import { createTRPCRouter, baseProcedure } from "@/trpc/init";
import { desc, eq, and } from "drizzle-orm";
import { citySets, photos } from "@/db/schema";
import { TRPCError } from "@trpc/server";

export const travelRouter = createTRPCRouter({
  getCitySets: baseProcedure.query(async ({ ctx }) => {
    const data = await ctx.db.query.citySets.findMany({
      with: {
        coverPhoto: true,
        photos: true,
      },
      orderBy: [desc(citySets.updatedAt)],
    });

    return data.flatMap((citySet) => {
      const publicPhotos = citySet.photos.filter(
        (photo) => photo.visibility === "public",
      );
      const coverPhoto =
        citySet.coverPhoto.visibility === "public"
          ? citySet.coverPhoto
          : publicPhotos[0];

      if (!coverPhoto) return [];

      return [
        {
          ...citySet,
          coverPhoto,
          photos: publicPhotos,
          photoCount: publicPhotos.length,
        },
      ];
    });
  }),
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
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "City not found",
        });
      }

      // Get all photos in this city
      const cityPhotos = await ctx.db
        .select()
        .from(photos)
        .where(and(eq(photos.city, city), eq(photos.visibility, "public")))
        .orderBy(desc(photos.dateTimeOriginal), desc(photos.createdAt));

      if (cityPhotos.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "City not found",
        });
      }

      const publicCoverPhoto =
        cityPhotos.find((photo) => photo.id === citySet.coverPhotoId) ??
        cityPhotos[0];

      return {
        ...citySet,
        coverPhotoId: publicCoverPhoto.id,
        photoCount: cityPhotos.length,
        photos: cityPhotos,
      };
    }),
});
