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

    return data;
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

      return {
        ...citySet,
        photos: cityPhotos,
      };
    }),
});
