import { z } from "zod";

export const postFormSchema = z.object({
  title: z.string().trim().min(1, {
    message: "Title is required",
  }),
  slug: z.string().trim().min(1, {
    message: "Slug is required",
  }).regex(/^[\p{L}\p{N}_-]+$/u, {
    message: "Use letters, numbers, hyphens or underscores, without spaces or slashes",
  }),
  content: z.string().optional(),
  visibility: z.enum(["public", "private"]),
  coverImage: z.string().optional(),
  tags: z.array(z.string()),
  description: z.string().optional(),
});
