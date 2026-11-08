import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/trpc/init";
import { desc, eq, and } from "drizzle-orm";
import { citySets, photos } from "@/db/schema";
import { TRPCError } from "@trpc/server";
import { db } from "@/db";
import { CACHE_TAGS, createCachedQuery } from "@/lib/cache";
import { getCitySetPhotoNameColumn } from "@/modules/cities/city-set-location";

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
  async (citySetId: string) => {
    // Get city set info
    const [citySet] = await db
      .select()
      .from(citySets)
      .where(eq(citySets.id, citySetId));

    if (!citySet) {
      return null;
    }

    // Match the same city/region field used when this city set was created.
    const photoCityColumn = getCitySetPhotoNameColumn(citySet.countryCode);
    const cityPhotos = await db
      .select()
      .from(photos)
      .where(
        and(
          eq(photos.country, citySet.country),
          eq(photos.countryCode, citySet.countryCode),
          eq(photoCityColumn, citySet.city),
          eq(photos.visibility, "public"),
        ),
      )
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
  resolveLegacyCity: publicProcedure
    .input(
      z.object({
        city: z.string().trim().min(1),
      }),
    )
    .query(async ({ input }) => {
      const matches = (await getCitySetsCached()).filter(
        (citySet) => citySet.city === input.city,
      );

      if (matches.length === 0) {
        return { status: "not-found" as const };
      }
      if (matches.length > 1) {
        return { status: "ambiguous" as const };
      }

      return {
        status: "found" as const,
        citySetId: matches[0].id,
        city: matches[0].city,
      };
    }),
  getOne: publicProcedure
    .input(
      z.object({
        citySetId: z.uuid(),
      }),
    )
    .query(async ({ input }) => {
      const data = await getOneCached(input.citySetId);

      if (!data) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "City not found",
        });
      }

      return data;
    }),
});
