import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { count, desc, eq, ilike } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import {
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
  MIN_PAGE_SIZE,
} from "@/constants";
import { posts, postsInsertSchema, postsUpdateSchema } from "@/db/schema";
import { escapeLike } from "@/lib/escape-like";
import { revalidatePath } from "next/cache";
import { readBatch } from "@/db/read-batch";

/** Expire the ISR cache for the public blog pages. */
function revalidateBlogPages() {
  revalidatePath("/blog");
  revalidatePath("/blog/[slug]", "page");
  revalidatePath("/sitemap.xml");
}

function isUniqueViolation(error: unknown): boolean {
  if (typeof error !== "object" || error === null) return false;

  if ("code" in error && error.code === "23505") return true;

  return "cause" in error && isUniqueViolation(error.cause);
}

export const postsRouter = createTRPCRouter({
  create: protectedProcedure
    .input(postsInsertSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const [newPost] = await ctx.db.insert(posts).values(input).returning();

        revalidateBlogPages();

        return newPost;
      } catch (error) {
        if (isUniqueViolation(error)) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Post with this slug already exists",
          });
        }

        throw error;
      }
    }),
  remove: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const [data] = await ctx.db
        .delete(posts)
        .where(eq(posts.id, input.id))
        .returning();

      if (!data) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Post not found",
        });
      }

      revalidateBlogPages();

      return data;
    }),
  update: protectedProcedure
    .input(postsUpdateSchema)
    .mutation(async ({ ctx, input }) => {
      const { id } = input;

      if (!id) {
        throw new TRPCError({ code: "BAD_REQUEST" });
      }

      try {
        const [updatedPost] = await ctx.db
          .update(posts)
          .set({
            ...input,
          })
          .where(eq(posts.id, id))
          .returning();

        if (!updatedPost) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }

        revalidateBlogPages();

        return updatedPost;
      } catch (error) {
        if (isUniqueViolation(error)) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Post with this slug already exists",
          });
        }

        throw error;
      }
    }),
  getOne: protectedProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ ctx, input }) => {
      const [data] = await ctx.db
        .select()
        .from(posts)
        .where(eq(posts.slug, input.slug));

      if (!data) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Post not found",
        });
      }

      return data;
    }),
  getMany: protectedProcedure
    .input(
      z.object({
        page: z.number().default(DEFAULT_PAGE),
        pageSize: z
          .number()
          .min(MIN_PAGE_SIZE)
          .max(MAX_PAGE_SIZE)
          .default(DEFAULT_PAGE_SIZE),
        search: z.string().nullish(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { page, pageSize, search } = input;

      const where = search
        ? ilike(posts.title, `%${escapeLike(search)}%`)
        : undefined;
      const dataQuery = ctx.db
        .select()
        .from(posts)
        .where(where)
        .orderBy(desc(posts.createdAt), desc(posts.id))
        .limit(pageSize)
        .offset((page - 1) * pageSize);

      const countQuery = ctx.db
        .select({
          count: count(),
        })
        .from(posts)
        .where(where);
      const [data, [total]] = await readBatch(ctx.db, [
        dataQuery,
        countQuery,
      ]);

      const totalPages = Math.ceil(total.count / pageSize);

      return {
        items: data,
        total: total.count,
        totalPages,
      };
    }),
});
