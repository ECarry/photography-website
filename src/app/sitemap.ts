import type { MetadataRoute } from "next";
import { and, eq, inArray, notInArray, or } from "drizzle-orm";
import { db } from "@/db";
import { citySets, photos, posts } from "@/db/schema";
import { getPublicImageUrl } from "@/lib/seo";
import { getTravelCityPath } from "@/modules/travel/city-url";

export const revalidate = 3600;

const siteUrl =
  process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
const absoluteUrl = (path: string) => new URL(path, siteUrl).toString();

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const regionalCountryCodes = ["JP", "TW"];
  const photoCityMatches = or(
    and(
      inArray(citySets.countryCode, regionalCountryCodes),
      eq(photos.region, citySets.city),
    ),
    and(
      notInArray(citySets.countryCode, regionalCountryCodes),
      eq(photos.city, citySets.city),
    ),
  );

  const [publicPhotos, publicPosts, publicCityPhotos] = await Promise.all([
    db
      .select({
        id: photos.id,
        url: photos.url,
        updatedAt: photos.updatedAt,
      })
      .from(photos)
      .where(eq(photos.visibility, "public")),
    db
      .select({
        slug: posts.slug,
        coverImage: posts.coverImage,
        updatedAt: posts.updatedAt,
      })
      .from(posts)
      .where(eq(posts.visibility, "public")),
    db
      .select({
        id: citySets.id,
        city: citySets.city,
        citySetUpdatedAt: citySets.updatedAt,
        photoUpdatedAt: photos.updatedAt,
      })
      .from(citySets)
      .innerJoin(
        photos,
        and(
          eq(photos.country, citySets.country),
          eq(photos.countryCode, citySets.countryCode),
          eq(photos.visibility, "public"),
          photoCityMatches,
        ),
      ),
  ]);

  const cityPages = new Map<string, { city: string; updatedAt: Date }>();
  for (const row of publicCityPhotos) {
    const updatedAt =
      row.photoUpdatedAt > row.citySetUpdatedAt
        ? row.photoUpdatedAt
        : row.citySetUpdatedAt;
    const current = cityPages.get(row.id);

    if (!current || updatedAt > current.updatedAt) {
      cityPages.set(row.id, { city: row.city, updatedAt });
    }
  }

  const staticPages = ["/", "/about", "/discover", "/travel", "/blog"];
  const staticEntries: MetadataRoute.Sitemap = staticPages.map((path) => ({
    url: absoluteUrl(path),
  }));
  const photoEntries: MetadataRoute.Sitemap = publicPhotos.map((photo) => {
    const imageUrl = getPublicImageUrl(photo.url);
    return {
      url: absoluteUrl(`/p/${photo.id}`),
      lastModified: photo.updatedAt,
      ...(imageUrl
        ? { images: [new URL(imageUrl, siteUrl).toString()] }
        : {}),
    };
  });
  const postEntries: MetadataRoute.Sitemap = publicPosts.map((post) => {
    const imageUrl = getPublicImageUrl(post.coverImage);
    return {
      url: absoluteUrl(`/blog/${encodeURIComponent(post.slug)}`),
      lastModified: post.updatedAt,
      ...(imageUrl
        ? { images: [new URL(imageUrl, siteUrl).toString()] }
        : {}),
    };
  });
  const cityEntries: MetadataRoute.Sitemap = Array.from(
    cityPages,
    ([citySetId, cityPage]) => ({
      url: absoluteUrl(getTravelCityPath(citySetId, cityPage.city)),
      lastModified: cityPage.updatedAt,
    }),
  );

  return [
    ...staticEntries,
    ...photoEntries,
    ...postEntries,
    ...cityEntries,
  ];
}
