import { z } from "zod";

export const postInsertSchema = z.object({
  title: z.string().min(1, {
    message: "Title is required",
  }),
  slug: z.string().min(1, {
    message: "Slug is required",
  }),
  description: z.string().optional(),
  coverImage: z.string().optional(),
});
