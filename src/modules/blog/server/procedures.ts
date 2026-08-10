import { createTRPCRouter, baseProcedure } from "@/trpc/init";
import { desc, eq, and } from "drizzle-orm";
import { posts } from "@/db/schema";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import sanitizeHtml from "sanitize-html";

function sanitizeBlogContent(content: string | null): string {
  return sanitizeHtml(content ?? "", {
    allowedTags: [...sanitizeHtml.defaults.allowedTags, "iframe"],
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      "*": [
        "class",
        "id",
        "data-type",
        "data-markers",
        "data-zoom",
        "data-scroll-zoom",
        "data-double-click-zoom",
        "data-drag-rotate",
      ],
      img: ["src", "alt", "title", "width", "height"],
      iframe: [
        "src",
        "width",
        "height",
        "allow",
        "allowfullscreen",
        "frameborder",
      ],
    },
    allowedIframeHostnames: ["www.youtube-nocookie.com", "www.youtube.com"],
  });
}

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

      return {
        ...data,
        content: sanitizeBlogContent(data.content),
      };
    }),
});
