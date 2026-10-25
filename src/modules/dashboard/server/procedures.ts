import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { photos, citySets } from "@/db/schema";
import { sql } from "drizzle-orm";
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
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      const years = input?.years ?? 3;

      // Calculate the start date (years ago from now)
      const startDate = new Date();
      startDate.setFullYear(startDate.getFullYear() - years);

      const result = await ctx.db
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

  getVisitedCountries: protectedProcedure.query(async ({ ctx }) => {
    const result = await ctx.db
      .select({
        country: photos.country,
        countryCode: photos.countryCode,
        photoCount: sql<number>`COUNT(*)::int`,
        firstVisit: sql<Date>`MIN(${photos.dateTimeOriginal})`,
        lastVisit: sql<Date>`MAX(${photos.dateTimeOriginal})`,
      })
      .from(photos)
      .where(
        sql`${photos.country} IS NOT NULL AND ${photos.countryCode} IS NOT NULL`,
      )
      .groupBy(photos.country, photos.countryCode)
      .orderBy(sql`COUNT(*) DESC`);
    return result;
  }),

  getVisitedCountriesWithGeoJson: protectedProcedure.query(async ({ ctx }) => {
    // Aggregate visited countries with counts and dates
    const countries = await ctx.db
      .select({
        country: photos.country,
        countryCode: photos.countryCode,
        photoCount: sql<number>`COUNT(*)::int`,
        firstVisit: sql<Date>`MIN(${photos.dateTimeOriginal})`,
        lastVisit: sql<Date>`MAX(${photos.dateTimeOriginal})`,
      })
      .from(photos)
      .where(
        sql`${photos.country} IS NOT NULL AND ${photos.countryCode} IS NOT NULL`,
      )
      .groupBy(photos.country, photos.countryCode)
      .orderBy(sql`COUNT(*) DESC`);

    const visitedSet = new Set(
      countries.map((c) => c.countryCode as string).filter(Boolean),
    );

    const world = await loadWorldGeoJson();

    const features = world.features.filter((feature) => {
      const id = String(feature.id ?? "");
      return visitedSet.has(id);
    });

    return {
      countries,
      geoJson: {
        ...world,
        features,
      } as GeoJSON.FeatureCollection,
    };
  }),

  getVisitedCountriesGeoJson: protectedProcedure.query(async ({ ctx }) => {
    const visited = await ctx.db
      .select({
        countryCode: photos.countryCode,
      })
      .from(photos)
      .where(sql`${photos.countryCode} IS NOT NULL`)
      .groupBy(photos.countryCode);

    const visitedSet = new Set(
      visited.map((c) => c.countryCode as string).filter(Boolean),
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

  getDashboardStats: protectedProcedure.query(async ({ ctx }) => {
    const currentYear = new Date().getFullYear();
    const yearStart = new Date(currentYear, 0, 1);
    const nextYearStart = new Date(currentYear + 1, 0, 1);
    const lastYearStart = new Date(currentYear - 1, 0, 1);

    const [photoStatsResult, cityStatsResult] = await Promise.all([
      ctx.db
        .select({
          totalPhotos: sql<number>`COUNT(*)::int`,
          thisYearPhotos: sql<number>`COUNT(*) FILTER (
            WHERE ${photos.dateTimeOriginal} >= ${yearStart}
              AND ${photos.dateTimeOriginal} < ${nextYearStart}
          )::int`,
          lastYearPhotos: sql<number>`COUNT(*) FILTER (
            WHERE ${photos.dateTimeOriginal} >= ${lastYearStart}
              AND ${photos.dateTimeOriginal} < ${yearStart}
          )::int`,
          totalCountries: sql<number>`COUNT(DISTINCT ${photos.countryCode}) FILTER (
            WHERE ${photos.countryCode} IS NOT NULL
          )::int`,
          thisYearCountries: sql<number>`COUNT(DISTINCT ${photos.countryCode}) FILTER (
            WHERE ${photos.countryCode} IS NOT NULL
              AND ${photos.dateTimeOriginal} >= ${yearStart}
              AND ${photos.dateTimeOriginal} < ${nextYearStart}
          )::int`,
          lastYearCountries: sql<number>`COUNT(DISTINCT ${photos.countryCode}) FILTER (
            WHERE ${photos.countryCode} IS NOT NULL
              AND ${photos.dateTimeOriginal} >= ${lastYearStart}
              AND ${photos.dateTimeOriginal} < ${yearStart}
          )::int`,
        })
        .from(photos),
      ctx.db
        .select({
          totalCities: sql<number>`COUNT(*)::int`,
          thisYearCities: sql<number>`COUNT(*) FILTER (
            WHERE ${citySets.createdAt} >= ${yearStart}
              AND ${citySets.createdAt} < ${nextYearStart}
          )::int`,
          lastYearCities: sql<number>`COUNT(*) FILTER (
            WHERE ${citySets.createdAt} >= ${lastYearStart}
              AND ${citySets.createdAt} < ${yearStart}
          )::int`,
        })
        .from(citySets),
    ]);

    const photoStats = photoStatsResult[0];
    const cityStats = cityStatsResult[0];
    const percentChange = (current: number, previous: number) =>
      previous === 0
        ? current > 0
          ? 100
          : 0
        : Math.round(((current - previous) / previous) * 100);

    const totalPhotos = photoStats?.totalPhotos ?? 0;
    const thisYearPhotos = photoStats?.thisYearPhotos ?? 0;
    const lastYearPhotos = photoStats?.lastYearPhotos ?? 0;
    const totalCountries = photoStats?.totalCountries ?? 0;
    const thisYearCountries = photoStats?.thisYearCountries ?? 0;
    const lastYearCountries = photoStats?.lastYearCountries ?? 0;
    const totalCities = cityStats?.totalCities ?? 0;
    const thisYearCities = cityStats?.thisYearCities ?? 0;
    const lastYearCities = cityStats?.lastYearCities ?? 0;
    const thisYearPercentChange = percentChange(
      thisYearPhotos,
      lastYearPhotos,
    );
    const countriesPercentChange = percentChange(
      thisYearCountries,
      lastYearCountries,
    );
    const citiesPercentChange = percentChange(thisYearCities, lastYearCities);

    return {
      totalPhotos,
      thisYearPhotos,
      thisYearPercentChange,
      totalCountries,
      thisYearCountries,
      lastYearCountries,
      countriesPercentChange,
      totalCities,
      thisYearCities,
      lastYearCities,
      citiesPercentChange,
    };
  }),
});
