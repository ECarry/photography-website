import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { db } from "@/db";
import { photos, citySets } from "@/db/schema";
import { sql, and, gte } from "drizzle-orm";
import { z } from "zod";
import fs from "fs/promises";
import path from "path";

let worldGeoJsonCache: GeoJSON.FeatureCollection | null = null;

const loadWorldGeoJson = async (): Promise<GeoJSON.FeatureCollection> => {
  if (worldGeoJsonCache) return worldGeoJsonCache;

  const filePath = path.join(process.cwd(), "public", "world.geojson");
  const raw = await fs.readFile(filePath, "utf-8");
  const parsed = JSON.parse(raw) as GeoJSON.FeatureCollection;

  worldGeoJsonCache = parsed;
  return parsed;
};

export const dashboardRouter = createTRPCRouter({
  getPhotosCountByMonth: protectedProcedure
    .input(
      z
        .object({
          years: z.number().min(1).max(10).default(3),
        })
        .optional()
    )
    .query(async ({ input }) => {
      const years = input?.years ?? 3;

      // Calculate the start date (years ago from now)
      const startDate = new Date();
      startDate.setFullYear(startDate.getFullYear() - years);

      const result = await db
        .select({
          month: sql<string>`TO_CHAR(${photos.dateTimeOriginal}, 'YYYY-MM')`,
          count: sql<number>`COUNT(*)::int`,
        })
        .from(photos)
        .where(sql`${photos.dateTimeOriginal} >= ${startDate}`)
        .groupBy(sql`TO_CHAR(${photos.dateTimeOriginal}, 'YYYY-MM')`)
        .orderBy(sql`TO_CHAR(${photos.dateTimeOriginal}, 'YYYY-MM')`);

      // Fill in missing months with 0 count
      const monthlyData: { month: string; count: number }[] = [];
      const currentDate = new Date(startDate);
      const endDate = new Date();

      while (currentDate <= endDate) {
        const monthKey = currentDate.toISOString().slice(0, 7); // YYYY-MM format
        const existingData = result.find((item) => item.month === monthKey);

        monthlyData.push({
          month: monthKey,
          count: existingData?.count ?? 0,
        });

        currentDate.setMonth(currentDate.getMonth() + 1);
      }

      return monthlyData;
    }),

  getVisitedCountries: protectedProcedure.query(async () => {
    // First, let's check what data we have
    const samplePhotos = await db
      .select({
        country: photos.country,
        countryCode: photos.countryCode,
        latitude: photos.latitude,
        longitude: photos.longitude,
      })
      .from(photos)
      .limit(10);

    console.log("Sample photos data:", samplePhotos);

    const result = await db
      .select({
        country: photos.country,
        countryCode: photos.countryCode,
        photoCount: sql<number>`COUNT(*)::int`,
        firstVisit: sql<Date>`MIN(${photos.dateTimeOriginal})`,
        lastVisit: sql<Date>`MAX(${photos.dateTimeOriginal})`,
      })
      .from(photos)
      .where(
        sql`${photos.country} IS NOT NULL AND ${photos.countryCode} IS NOT NULL`
      )
      .groupBy(photos.country, photos.countryCode)
      .orderBy(sql`COUNT(*) DESC`);

    console.log("Visited countries result:", result);

    return result;
  }),

  getVisitedCountriesGeoJson: protectedProcedure.query(async () => {
    const visited = await db
      .select({
        countryCode: photos.countryCode,
      })
      .from(photos)
      .where(sql`${photos.countryCode} IS NOT NULL`)
      .groupBy(photos.countryCode);

    const visitedSet = new Set(
      visited.map((c) => c.countryCode as string).filter(Boolean)
    );

    if (visitedSet.size === 0) {
      const world = await loadWorldGeoJson();
      return {
        ...world,
        features: [],
      } as GeoJSON.FeatureCollection;
    }

    const world = await loadWorldGeoJson();

    const features = world.features.filter((feature) => {
      const id = String(feature.id ?? "");
      return visitedSet.has(id);
    });

    return {
      ...world,
      features,
    } as GeoJSON.FeatureCollection;
  }),

  getDashboardStats: protectedProcedure.query(async () => {
    // Get total photo count
    const totalPhotosResult = await db
      .select({ count: sql<number>`COUNT(*)::int` })
      .from(photos)
      .where(sql`${photos.dateTimeOriginal} IS NOT NULL`);

    const totalPhotos = totalPhotosResult[0]?.count ?? 0;

    // Get current year photo count
    const currentYear = new Date().getFullYear();
    const yearStart = new Date(currentYear, 0, 1);
    const thisYearPhotosResult = await db
      .select({ count: sql<number>`COUNT(*)::int` })
      .from(photos)
      .where(
        and(
          gte(photos.dateTimeOriginal, yearStart),
          sql`${photos.dateTimeOriginal} IS NOT NULL`
        )
      );

    const thisYearPhotos = thisYearPhotosResult[0]?.count ?? 0;

    // Get last year photo count
    const lastYearStart = new Date(currentYear - 1, 0, 1);
    const lastYearEnd = new Date(currentYear, 0, 1);
    const lastYearPhotosResult = await db
      .select({ count: sql<number>`COUNT(*)::int` })
      .from(photos)
      .where(
        and(
          gte(photos.dateTimeOriginal, lastYearStart),
          sql`${photos.dateTimeOriginal} < ${lastYearEnd}`,
          sql`${photos.dateTimeOriginal} IS NOT NULL`
        )
      );

    const lastYearPhotos = lastYearPhotosResult[0]?.count ?? 0;

    // Calculate year-over-year percentage change for photos
    const thisYearPercentChange =
      lastYearPhotos === 0
        ? thisYearPhotos > 0
          ? 100
          : 0
        : Math.round(
            ((thisYearPhotos - lastYearPhotos) / lastYearPhotos) * 100
          );

    // Get total countries visited
    const countriesResult = await db
      .selectDistinct({ country: photos.country })
      .from(photos)
      .where(sql`${photos.country} IS NOT NULL`);

    const totalCountries = countriesResult.length;

    // Get last year countries visited
    const lastYearCountriesResult = await db
      .selectDistinct({ country: photos.country })
      .from(photos)
      .where(
        and(
          gte(photos.dateTimeOriginal, lastYearStart),
          sql`${photos.dateTimeOriginal} < ${lastYearEnd}`,
          sql`${photos.country} IS NOT NULL`
        )
      );

    const lastYearCountries = lastYearCountriesResult.length;

    // Calculate year-over-year percentage change for countries
    const countriesPercentChange =
      lastYearCountries === 0
        ? totalCountries > 0
          ? 100
          : 0
        : Math.round(
            ((totalCountries - lastYearCountries) / lastYearCountries) * 100
          );

    // Get total cities
    const citiesResult = await db
      .selectDistinct({ city: citySets.city })
      .from(citySets);

    const totalCities = citiesResult.length;

    // Get last year cities
    const lastYearCitiesResult = await db
      .selectDistinct({ city: citySets.city })
      .from(citySets)
      .where(
        and(
          gte(citySets.createdAt, lastYearStart),
          sql`${citySets.createdAt} < ${lastYearEnd}`
        )
      );

    const lastYearCities = lastYearCitiesResult.length;

    // Calculate year-over-year percentage change for cities
    const citiesPercentChange =
      lastYearCities === 0
        ? totalCities > 0
          ? 100
          : 0
        : Math.round(((totalCities - lastYearCities) / lastYearCities) * 100);

    return {
      totalPhotos,
      thisYearPhotos,
      thisYearPercentChange,
      totalCountries,
      countriesPercentChange,
      totalCities,
      citiesPercentChange,
    };
  }),
});
