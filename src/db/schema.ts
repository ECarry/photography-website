import { InferSelectModel, relations, sql } from "drizzle-orm";
import {
  boolean,
  timestamp,
  pgTable,
  text,
  real,
  varchar,
  integer,
  uuid,
  uniqueIndex,
  index,
  pgEnum,
} from "drizzle-orm/pg-core";
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";
import { z } from "zod";

// ⌚️ Reusable timestamps - Define once, use everywhere!
export const timestamps = {
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
};

/***************
 ****************
 *  User Table  *
 ****************
 ***************/

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull(),
  image: text("image"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at"),
  updatedAt: timestamp("updated_at"),
});

/***************
 ****************
 *  Photo Table *
 ****************
 ***************/

export const photoVisibility = pgEnum("photo_visibility", [
  "public",
  "private",
]);

export const photos = pgTable(
  "photos",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    url: text("url").notNull(),
    title: text("title").notNull(),
    description: text("description").notNull(),
    isFavorite: boolean("is_favorite").default(false).notNull(),
    visibility: photoVisibility("visibility").default("private").notNull(),
    aspectRatio: real("aspect_ratio").notNull(),
    width: real("width").notNull(),
    height: real("height").notNull(),
    blurData: text("blur_data").notNull(),

    country: text("country"),
    countryCode: text("country_code"),
    region: text("region"),
    city: text("city"),
    district: text("district"),

    fullAddress: text("full_address"),
    placeFormatted: text("place_formatted"),

    make: varchar("make", { length: 255 }),
    model: varchar("model", { length: 255 }),
    lensModel: varchar("lens_model", { length: 255 }),
    focalLength: real("focal_length"),
    focalLength35mm: real("focal_length_35mm"),
    fNumber: real("f_number"),
    iso: integer("iso"),
    exposureTime: real("exposure_time"),
    exposureCompensation: real("exposure_compensation"),
    latitude: real("latitude"),
    longitude: real("longitude"),
    gpsAltitude: real("gps_altitude"),
    dateTimeOriginal: timestamp("datetime_original"),

    ...timestamps,
  },
  (t) => [
    index("year_idx").on(sql`DATE_TRUNC('year', ${t.dateTimeOriginal})`),
    index("city_idx").on(t.city),
  ]
);

export const citySets = pgTable(
  "city_sets",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    description: text("description"),

    // GEO DATA
    country: text("country").notNull(),
    countryCode: text("country_code").notNull(),
    city: text("city").notNull(),

    // COVER PHOTO
    coverPhotoId: uuid("cover_photo_id")
      .references(() => photos.id)
      .notNull(),

    photoCount: integer("photo_count").default(0).notNull(),

    // META DATA
    ...timestamps,
  },
  (t) => [uniqueIndex("unique_city_set").on(t.country, t.city)]
);

// Soft relations
export const citySetsRelations = relations(citySets, ({ one, many }) => ({
  coverPhoto: one(photos, {
    fields: [citySets.coverPhotoId],
    references: [photos.id],
  }),
  photos: many(photos),
}));

export const photosRelations = relations(photos, ({ one }) => ({
  citySet: one(citySets, {
    fields: [photos.country, photos.city],
    references: [citySets.country, citySets.city],
  }),
}));

// Schema
export const photosInsertSchema = createInsertSchema(photos).extend({
  title: z.string().min(1, { message: "Title is required" }),
  description: z.string().min(1, { message: "Description is required" }),
});
export const photosSelectSchema = createSelectSchema(photos);
export const photosUpdateSchema = createUpdateSchema(photos)
  .pick({
    id: true,
    title: true,
    description: true,
    isFavorite: true,
    latitude: true,
    longitude: true,
    visibility: true,
  })
  .partial();

// Types
export type Photo = InferSelectModel<typeof photos>;
export type CitySet = InferSelectModel<typeof citySets>;
// with photos & cover photo
export type CitySetWithPhotos = CitySet & { photos: Photo[] } & {
  coverPhoto: Photo;
};

/***************
 ****************
 *  Post Table  *
 ****************
 ***************/

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
