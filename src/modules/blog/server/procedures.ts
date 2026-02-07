import { createTRPCRouter, baseProcedure } from "@/trpc/init";
import { desc, eq, and } from "drizzle-orm";
import { posts } from "@/db/schema";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

export const blogRouter = createTRPCRouter({
  getMany: baseProcedure.query(async ({ ctx }) => {
    const data = await ctx.db
      .select()
      .from(posts)
      .where(eq(posts.visibility, "public"))
      .orderBy(desc(posts.updatedAt))
      .limit(10);

    return data;
  }),
  getOne: baseProcedure
    .input(
      z.object({
        slug: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const [data] = await ctx.db
        .select()
        .from(posts)
        .where(and(eq(posts.slug, input.slug), eq(posts.visibility, "public")));

      if (!data) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      return data;
    }),
});
