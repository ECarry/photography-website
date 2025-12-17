import { z } from "zod";
import { db } from "@/db";
import { createTRPCRouter, baseProcedure } from "@/trpc/init";
import { desc, eq, isNotNull, and } from "drizzle-orm";
import { photos } from "@/db/schema";

export const discoverRouter = createTRPCRouter({
  getManyPhotos: baseProcedure.input(z.object({})).query(async () => {
    const data = await db
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
          isNotNull(photos.longitude)
        )
      )
      .orderBy(desc(photos.updatedAt));

    return data;
  }),
});
