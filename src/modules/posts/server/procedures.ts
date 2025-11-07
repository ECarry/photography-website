import z from "zod";
import { db } from "@/db";
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

export const postsRouter = createTRPCRouter({
  create: protectedProcedure
    .input(postsInsertSchema)
    .mutation(async ({ input }) => {
      const values = input;

      const existingPost = await db
        .select()
        .from(posts)
        .where(eq(posts.slug, values.slug));

      if (existingPost.length > 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Post with this slug already exists",
        });
      }

      const [newPost] = await db.insert(posts).values(values).returning();

      return newPost;
    }),
  remove: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      const [data] = await db
        .delete(posts)
        .where(eq(posts.id, input.id))
        .returning();

      if (!data) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Post not found",
        });
      }

      return data;
    }),
  update: protectedProcedure
    .input(postsUpdateSchema)
    .mutation(async ({ input }) => {
      const { id } = input;

      if (!id) {
        throw new TRPCError({ code: "BAD_REQUEST" });
      }

      const [updatedPost] = await db
        .update(posts)
        .set({
          ...input,
        })
        .where(eq(posts.id, id))
        .returning();

      if (!updatedPost) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      return updatedPost;
    }),
  getOne: protectedProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const [data] = await db
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
      })
    )
    .query(async ({ input }) => {
      const { page, pageSize, search } = input;

      const data = await db
        .select()
        .from(posts)
        .where(search ? ilike(posts.title, `%${search}%`) : undefined)
        .orderBy(desc(posts.createdAt), desc(posts.id))
        .limit(pageSize)
        .offset((page - 1) * pageSize);

      const [total] = await db
        .select({
          count: count(),
        })
        .from(posts)
        .where(search ? ilike(posts.title, `%${search}%`) : undefined);

      const totalPages = Math.ceil(total.count / pageSize);

      return {
        items: data,
        total: total.count,
        totalPages,
      };
    }),
});
