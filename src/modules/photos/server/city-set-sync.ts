import { and, eq, sql } from "drizzle-orm";
import type { DatabaseExecutor } from "@/db/atomic-execute";
import {
  getCitySetName,
  getCitySetPhotoNameColumn,
  type CitySetLocation,
} from "@/modules/cities/city-set-location";
import { citySets, photos } from "@/db/schema";

type Photo = typeof photos.$inferSelect;
type CitySetPhoto = CitySetLocation & {
  id: string;
  country?: string | null;
};

function getPhotoCityColumn(photo: CitySetLocation) {
  return getCitySetPhotoNameColumn(photo.countryCode);
}

export function buildCitySetUpsertQuery(
  database: DatabaseExecutor,
  photo: CitySetPhoto,
) {
  const cityName = getCitySetName(photo);
  if (!photo.country || !photo.countryCode || !cityName) return null;

  return database
    .insert(citySets)
    .values({
      country: photo.country,
      countryCode: photo.countryCode,
      city: cityName,
      photoCount: 1,
      coverPhotoId: photo.id,
    })
    .onConflictDoUpdate({
      target: [citySets.country, citySets.city],
      set: {
        countryCode: photo.countryCode,
        photoCount: sql`${citySets.photoCount} + 1`,
        coverPhotoId: sql`COALESCE(${citySets.coverPhotoId}, ${photo.id})`,
        updatedAt: new Date(),
      },
    });
}

export async function addPhotoToCitySet(
  database: DatabaseExecutor,
  photo: CitySetPhoto,
) {
  const query = buildCitySetUpsertQuery(database, photo);
  if (query) await query;
}

export function buildCitySetRemovalQueries(
  database: DatabaseExecutor,
  photo: Photo,
) {
  const cityName = getCitySetName(photo);
  const hasCity = Boolean(photo.country && cityName);
  const cityCondition = hasCity
    ? and(eq(citySets.country, photo.country!), eq(citySets.city, cityName!))
    : sql`false`;
  const photoCityColumn = getPhotoCityColumn(photo);
  const replacementCoverPhoto = hasCity
    ? sql`(
        SELECT ${photos.id}
        FROM ${photos}
        WHERE ${photos.country} = ${photo.country}
          AND ${photoCityColumn} = ${cityName}
          AND ${photos.id} != ${photo.id}
        LIMIT 1
      )`
    : sql`${citySets.coverPhotoId}`;

  return [
    database
      .delete(citySets)
      .where(sql`${cityCondition} AND ${citySets.photoCount} <= 1`),
    database
      .update(citySets)
      .set({
        photoCount: sql`${citySets.photoCount} - 1`,
        coverPhotoId: sql`CASE
          WHEN ${citySets.coverPhotoId} = ${photo.id}
          THEN COALESCE(${replacementCoverPhoto}, ${citySets.coverPhotoId})
          ELSE ${citySets.coverPhotoId}
        END`,
        updatedAt: new Date(),
      })
      .where(sql`${cityCondition} AND ${citySets.photoCount} > 1`),
  ] as const;
}

export async function removePhotoFromCitySet(
  database: DatabaseExecutor,
  photo: Photo,
) {
  const [deleteCitySet, updateCitySet] = buildCitySetRemovalQueries(
    database,
    photo,
  );
  await deleteCitySet;
  await updateCitySet;
}

export function buildPhotoRemovalBatch(
  database: DatabaseExecutor,
  photo: Photo,
) {
  const [deleteCitySet, updateCitySet] = buildCitySetRemovalQueries(
    database,
    photo,
  );

  return [
    deleteCitySet,
    updateCitySet,
    database.delete(photos).where(eq(photos.id, photo.id)).returning(),
  ] as const;
}

export function buildCitySetSyncQueries(
  database: DatabaseExecutor,
  previousPhoto: Photo,
  updatedPhoto: Photo,
) {
  const previousCity = getCitySetName(previousPhoto);
  const updatedCity = getCitySetName(updatedPhoto);
  const isSameCity =
    previousPhoto.country === updatedPhoto.country &&
    previousCity === updatedCity;

  if (isSameCity) {
    if (
      updatedPhoto.country &&
      updatedCity &&
      updatedPhoto.countryCode &&
      previousPhoto.countryCode !== updatedPhoto.countryCode
    ) {
      return [
        database
          .update(citySets)
          .set({
            countryCode: updatedPhoto.countryCode,
            updatedAt: new Date(),
          })
          .where(
            and(
              eq(citySets.country, updatedPhoto.country),
              eq(citySets.city, updatedCity),
            ),
          ),
      ];
    }
    return [];
  }

  const addCitySet = buildCitySetUpsertQuery(database, updatedPhoto);
  return [
    ...buildCitySetRemovalQueries(database, previousPhoto),
    ...(addCitySet ? [addCitySet] : []),
  ];
}

export async function syncPhotoCitySet(
  database: DatabaseExecutor,
  previousPhoto: Photo,
  updatedPhoto: Photo,
) {
  for (const query of buildCitySetSyncQueries(
    database,
    previousPhoto,
    updatedPhoto,
  )) {
    await query;
  }
}
