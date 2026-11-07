import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/trpc/init";
import { desc, eq, and } from "drizzle-orm";
import { citySets, photos } from "@/db/schema";
import { TRPCError } from "@trpc/server";
import { db } from "@/db";
import { CACHE_TAGS, createCachedQuery } from "@/lib/cache";

const getManyLikePhotosCached = createCachedQuery(
  async (limit: number) => {
    return db
      .select()
      .from(photos)
      .where(and(eq(photos.isFavorite, true), eq(photos.visibility, "public")))
      .orderBy(desc(photos.updatedAt))
      .limit(limit);
  },
  ["home.getManyLikePhotos"],
  { tags: [CACHE_TAGS.photos] },
);

const getCitySetsCached = createCachedQuery(
  async (limit: number) => {
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
      .orderBy(desc(citySets.updatedAt))
      .limit(limit);
  },
  ["home.getCitySets"],
  { tags: [CACHE_TAGS.photos] },
);

const getPhotoByIdCached = createCachedQuery(
  async (id: string) => {
    const data = await db.query.photos.findFirst({
      where: and(eq(photos.id, id), eq(photos.visibility, "public")),
    });

    return data ?? null;
  },
  ["home.getPhotoById"],
  { tags: [CACHE_TAGS.photos] },
);

export const homeRouter = createTRPCRouter({
  getManyLikePhotos: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(10).default(10),
      }),
    )
    .query(async ({ input }) => {
      return getManyLikePhotosCached(input.limit);
    }),
  getCitySets: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(10),
      }),
    )
    .query(async ({ input }) => {
      return getCitySetsCached(input.limit);
    }),
  getPhotoById: publicProcedure
    .input(
      z.object({
        id: z.uuid(),
      }),
    )
    .query(async ({ input }) => {
      const data = await getPhotoByIdCached(input.id);

      if (!data) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Photo not found",
        });
      }

      return data;
    }),
});
