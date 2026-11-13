import { Redis } from "@upstash/redis";
import type { BetterAuthOptions } from "better-auth";

type SecondaryStorage = NonNullable<BetterAuthOptions["secondaryStorage"]>;

const KEY_PREFIX = "auth:";

/**
 * Upstash Redis-backed secondary storage for better-auth.
 *
 * Used for auth rate limiting (brute-force protection on /sign-in) and session
 * caching. Returns null when Upstash is not configured (local/self-hosted),
 * in which case better-auth falls back to in-memory rate limiting.
 *
 * NOTE: `automaticDeserialization` must be disabled — better-auth stores JSON
 * strings and expects raw strings back; Upstash's default JSON auto-parsing
 * would corrupt them.
 */
export function createSecondaryStorage(): SecondaryStorage | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) return null;

  const redis = new Redis({ url, token, automaticDeserialization: false });

  return {
    get: async (key) => {
      const value = await redis.get<string>(`${KEY_PREFIX}${key}`);
      return value ?? null;
    },
    set: async (key, value, ttl) => {
      if (ttl) {
        await redis.set(`${KEY_PREFIX}${key}`, value, { ex: ttl });
      } else {
        await redis.set(`${KEY_PREFIX}${key}`, value);
      }
    },
    delete: async (key) => {
      await redis.del(`${KEY_PREFIX}${key}`);
    },
  };
}
