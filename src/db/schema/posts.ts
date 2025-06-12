import { InferSelectModel } from "drizzle-orm";
import {
  timestamp,
  pgTable,
  text,
  integer,
  uuid,
  index,
  pgEnum,
} from "drizzle-orm/pg-core";
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";

// ⌚️ Reusable timestamps - Define once, use everywhere!
export const timestamps = {
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
};

export const categories = pgTable("categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
});

export const postVisibility = pgEnum("post_visibility", ["public", "private"]);

export const posts = pgTable(
  "posts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    title: text("title").notNull(),
    slug: text("slug").notNull().unique(),
    categoryId: uuid("category_id").references(() => categories.id),
    visibility: postVisibility("visibility").default("private").notNull(),
    tags: text("tags").array(),
    coverImage: text("cover_image"),
    description: text("description"),
    content: text("content"),
    readingTimeMinutes: integer("reading_time_minutes"),

    ...timestamps,
  },
  (t) => [
    index("category_idx").on(t.categoryId),
    index("tags_idx").on(t.tags),
    index("slug_idx").on(t.slug),
  ]
);

// Types
export type Post = InferSelectModel<typeof posts>;

// Schema
export const postsInsertSchema = createInsertSchema(posts);
export const postsSelectSchema = createSelectSchema(posts);
export const postsUpdateSchema = createUpdateSchema(posts);
