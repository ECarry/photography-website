import z from "zod";
import { db } from "@/db";
import { createTRPCRouter, baseProcedure } from "@/trpc/init";
import { desc, eq, and } from "drizzle-orm";
import { citySets, photos } from "@/db/schema";
import { TRPCError } from "@trpc/server";

export const homeRouter = createTRPCRouter({
  getManyLikePhotos: baseProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(10).default(10),
      })
    )
    .query(async ({ input }) => {
      const { limit } = input;

      const data = await db
        .select()
        .from(photos)
        .where(
          and(eq(photos.isFavorite, true), eq(photos.visibility, "public"))
        )
        .orderBy(desc(photos.updatedAt))
        .limit(limit);

      return data;
    }),
  getCitySets: baseProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(10),
      })
    )
    .query(async ({ input }) => {
      const { limit } = input;

      const data = await db.query.citySets.findMany({
        with: {
          coverPhoto: true,
          photos: true,
        },
        orderBy: [desc(citySets.updatedAt)],
        limit: limit,
      });

      return data;
    }),
  getPhotoById: baseProcedure
    .input(
      z.object({
        id: z.uuid(),
      })
    )
    .query(async ({ input }) => {
      const { id } = input;

      const data = await db.query.photos.findFirst({
        where: and(eq(photos.id, id), eq(photos.visibility, "public")),
      });

      if (!data) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Photo not found",
        });
      }

      return data;
    }),
});
