import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/trpc/init";
import { desc, eq, and } from "drizzle-orm";
import { citySets, photos } from "@/db/schema";
import { TRPCError } from "@trpc/server";
import { db } from "@/db";
import { CACHE_TAGS, createCachedQuery } from "@/lib/cache";

const getCitySetsCached = createCachedQuery(
  async () => {
    return db
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
  },
  ["travel.getCitySets"],
  { tags: [CACHE_TAGS.photos] },
);

const getOneCached = createCachedQuery(
  async (city: string) => {
    // Get city set info
    const [citySet] = await db
      .select()
      .from(citySets)
      .where(and(eq(citySets.city, city)));

    if (!citySet) {
      return null;
    }

    // Get all photos in this city
    const cityPhotos = await db
      .select()
      .from(photos)
      .where(and(eq(photos.city, city), eq(photos.visibility, "public")))
      .orderBy(desc(photos.dateTimeOriginal), desc(photos.createdAt));

    if (cityPhotos.length === 0) {
      return null;
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
  },
  ["travel.getOne"],
  { tags: [CACHE_TAGS.photos] },
);

export const travelRouter = createTRPCRouter({
  getCitySets: publicProcedure.query(async () => {
    return getCitySetsCached();
  }),
  getOne: publicProcedure
    .input(
      z.object({
        city: z.string(),
      }),
    )
    .query(async ({ input }) => {
      const data = await getOneCached(input.city);

      if (!data) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "City not found",
        });
      }

      return data;
    }),
});
