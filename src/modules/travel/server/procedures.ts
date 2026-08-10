import { z } from "zod";
import { createTRPCRouter, baseProcedure } from "@/trpc/init";
import { desc, eq, and } from "drizzle-orm";
import { citySets, photos } from "@/db/schema";
import { TRPCError } from "@trpc/server";

export const travelRouter = createTRPCRouter({
  getCitySets: baseProcedure.query(async ({ ctx }) => {
    return ctx.db
      .select({
        id: citySets.id,
        country: citySets.country,
        countryCode: citySets.countryCode,
        city: citySets.city,
        coverPhotoId: citySets.coverPhotoId,
        coverPhoto: {
          url: photos.url,
          title: photos.title,
          blurData: photos.blurData,
        },
      })
      .from(citySets)
      .innerJoin(
        photos,
        and(
          eq(photos.id, citySets.coverPhotoId),
          eq(photos.visibility, "public"),
        ),
      )
      .orderBy(desc(citySets.updatedAt));
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
