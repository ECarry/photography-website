import z from "zod";
import { db } from "@/db";
import { createTRPCRouter, baseProcedure } from "@/trpc/init";
import { desc } from "drizzle-orm";
import { citySets } from "@/db/schema";

export const travelRouter = createTRPCRouter({
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
});
