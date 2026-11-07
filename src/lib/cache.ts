import "server-only";
import { unstable_cache } from "next/cache";
import { revalidateTag } from "next/cache";
import superjson from "superjson";

/**
 * Cache tags for public (unauthenticated) data.
 * - photos: anything derived from photos / city sets (home, travel, /p/[id])
 */
export const CACHE_TAGS = {
  photos: "photos",
} as const;

/** Default revalidation window for cached public queries (seconds). */
export const PUBLIC_CACHE_REVALIDATE_SECONDS = 3600;

/**
 * Wrap an async query with Next.js' data cache (`unstable_cache`).
 *
 * Results are round-tripped through superjson so non-JSON values (e.g. `Date`
 * columns from drizzle) survive cache serialization intact.
 *
 * @param fn Query to cache. Its arguments become part of the cache key and
 *   must be JSON-serializable.
 * @param keyParts Unique identifier for this query (e.g. ["home.getCitySets"]).
 * @param options Cache tags and optional revalidation window.
 */
export function createCachedQuery<TArgs extends unknown[], TResult>(
  fn: (...args: TArgs) => Promise<TResult>,
  keyParts: string[],
  options: { tags: string[]; revalidate?: number },
) {
  const cached = unstable_cache(
    async (...args: TArgs) => superjson.stringify(await fn(...args)),
    keyParts,
    {
      tags: options.tags,
      revalidate: options.revalidate ?? PUBLIC_CACHE_REVALIDATE_SECONDS,
    },
  );

  return async (...args: TArgs): Promise<TResult> =>
    superjson.parse<TResult>(await cached(...args));
}

/**
 * Expire all cached public photo/city data immediately.
 * Call after any mutation that affects public photos or city sets.
 */
export function revalidatePhotoCaches() {
  revalidateTag(CACHE_TAGS.photos, { expire: 0 });
}
