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

// ⌚️ Reusable timestamps - Define once, use everywhere!
export const timestamps = {
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
};

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

// Types
export type Photo = InferSelectModel<typeof photos>;
export type CitySet = InferSelectModel<typeof citySets>;
// with photos & cover photo
export type CitySetWithPhotos = CitySet & { photos: Photo[] } & {
  coverPhoto: Photo;
};
