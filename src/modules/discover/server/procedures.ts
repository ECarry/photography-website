import { z } from "zod";
import { createTRPCRouter, baseProcedure } from "@/trpc/init";
import { and, desc, eq, gte, isNotNull, lte, or } from "drizzle-orm";
import { photos } from "@/db/schema";

const discoverBoundsSchema = z
  .object({
    west: z.number().min(-180).max(180),
    south: z.number().min(-85).max(85),
    east: z.number().min(-180).max(180),
    north: z.number().min(-85).max(85),
  })
  .refine((bounds) => bounds.south <= bounds.north);

export const discoverRouter = createTRPCRouter({
  getManyPhotos: baseProcedure.input(z.object({})).query(async ({ ctx }) => {
    const data = await ctx.db
      .select({
        id: photos.id,
        url: photos.url,
        title: photos.title,
        latitude: photos.latitude,
        longitude: photos.longitude,
        blurData: photos.blurData,
        width: photos.width,
        height: photos.height,
        dateTimeOriginal: photos.dateTimeOriginal,
      })
      .from(photos)
      .where(
        and(
          eq(photos.visibility, "public"),
          isNotNull(photos.latitude),
          isNotNull(photos.longitude),
        ),
      )
      .orderBy(desc(photos.updatedAt));

    return data;
  }),

  getPhotosInBounds: baseProcedure
    .input(discoverBoundsSchema)
    .query(async ({ ctx, input }) => {
      const longitudeFilter =
        input.west <= input.east
          ? and(
              gte(photos.longitude, input.west),
              lte(photos.longitude, input.east),
            )
          : or(
              gte(photos.longitude, input.west),
              lte(photos.longitude, input.east),
            );

      return ctx.db
        .select({
          id: photos.id,
          url: photos.url,
          title: photos.title,
          latitude: photos.latitude,
          longitude: photos.longitude,
          blurData: photos.blurData,
          width: photos.width,
          height: photos.height,
          dateTimeOriginal: photos.dateTimeOriginal,
        })
        .from(photos)
        .where(
          and(
            eq(photos.visibility, "public"),
            isNotNull(photos.latitude),
            isNotNull(photos.longitude),
            gte(photos.latitude, input.south),
            lte(photos.latitude, input.north),
            longitudeFilter,
          ),
        )
        .orderBy(desc(photos.updatedAt));
    }),
});
