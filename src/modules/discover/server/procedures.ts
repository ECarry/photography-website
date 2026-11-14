import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/trpc/init";
import {
  and,
  desc,
  eq,
  gte,
  inArray,
  isNotNull,
  lte,
  or,
} from "drizzle-orm";
import { photos } from "@/db/schema";
import {
  capDiscoverMapPoints,
  DISCOVER_DETAILS_PAGE_SIZE,
  DISCOVER_MAP_POINT_LIMIT,
} from "@/modules/discover/lib/photo-payload";

const discoverBoundsSchema = z
  .object({
    west: z.number().min(-180).max(180),
    south: z.number().min(-85).max(85),
    east: z.number().min(-180).max(180),
    north: z.number().min(-85).max(85),
  })
  .refine((bounds) => bounds.south <= bounds.north);

const discoverPhotosInputSchema = z.object({
  bounds: discoverBoundsSchema.optional(),
});

export const discoverRouter = createTRPCRouter({
  getManyPhotos: publicProcedure
    .input(discoverPhotosInputSchema)
    .query(async ({ ctx, input }) => {
      const bounds = input.bounds;
      const longitudeFilter = bounds
        ? bounds.west <= bounds.east
          ? and(
              gte(photos.longitude, bounds.west),
              lte(photos.longitude, bounds.east),
            )
          : or(
              gte(photos.longitude, bounds.west),
              lte(photos.longitude, bounds.east),
            )
        : undefined;

      const rows = await ctx.db
        .select({
          id: photos.id,
          latitude: photos.latitude,
          longitude: photos.longitude,
        })
        .from(photos)
        .where(
          and(
            eq(photos.visibility, "public"),
            isNotNull(photos.latitude),
            isNotNull(photos.longitude),
            bounds ? gte(photos.latitude, bounds.south) : undefined,
            bounds ? lte(photos.latitude, bounds.north) : undefined,
            longitudeFilter,
          ),
        )
        .orderBy(desc(photos.updatedAt))
        .limit(DISCOVER_MAP_POINT_LIMIT + 1);

      return capDiscoverMapPoints(rows);
    }),
  getScreensaverPhotos: publicProcedure.query(({ ctx }) =>
    ctx.db
      .select({
        id: photos.id,
        url: photos.url,
        title: photos.title,
        blurData: photos.blurData,
      })
      .from(photos)
      .where(eq(photos.visibility, "public"))
      .orderBy(desc(photos.updatedAt))
      .limit(DISCOVER_MAP_POINT_LIMIT),
  ),
  getPhotosByIds: publicProcedure
    .input(
      z.object({
        ids: z
          .array(z.uuid())
          .min(1)
          .max(DISCOVER_DETAILS_PAGE_SIZE),
      }),
    )
    .query(async ({ ctx, input }) =>
      ctx.db
        .select({
          id: photos.id,
          url: photos.url,
          title: photos.title,
          blurData: photos.blurData,
          width: photos.width,
          height: photos.height,
          dateTimeOriginal: photos.dateTimeOriginal,
        })
        .from(photos)
        .where(
          and(
            inArray(photos.id, input.ids),
            eq(photos.visibility, "public"),
          ),
        ),
    ),
});
