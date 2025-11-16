import { z } from "zod";

export const postFormSchema = z.object({
  title: z.string().min(1, {
    message: "Title is required",
  }),
  slug: z.string().min(1, {
    message: "Slug is required",
  }),
  content: z.string().optional(),
  visibility: z.enum(["public", "private"]),
  coverImage: z.string().optional(),
  tags: z.array(z.string()),
  description: z.string().optional(),
});
