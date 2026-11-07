import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { logger } from "@/lib/logger";

/**
 * Extract the client IP from request headers.
 * Pure helper so it can be unit tested without a Next.js request scope.
 *
 * NOTE: Do not read `next/headers` here — rate limiting only applies to HTTP
 * requests hitting the tRPC route handler. Server-side (RSC) invocations pass
 * no IP and are exempt, which keeps public pages statically renderable (ISR).
 */
export function parseClientIp(getHeader: (name: string) => string | null): string {
  const forwardedFor = getHeader("x-forwarded-for");
  if (forwardedFor) {
    const [firstIp] = forwardedFor.split(",");
    if (firstIp?.trim()) return firstIp.trim();
  }

  const realIp = getHeader("x-real-ip");
  if (realIp?.trim()) return realIp.trim();

  return "unknown";
}

/**
 * Rate limiter for public (unauthenticated) tRPC procedures.
 *
 * - Disabled (null) when Upstash Redis is not configured, e.g. local dev or
 *   self-hosted docker deployments without Redis.
 * - When configured, failures to reach Redis are treated as fail-closed by the
 *   tRPC middleware that consumes this limiter.
 */
function createPublicRatelimit(): Ratelimit | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    if (process.env.NODE_ENV === "production") {
      logger.warn(
        "Upstash Redis is not configured; public API rate limiting is disabled",
      );
    }
    return null;
  }

  return new Ratelimit({
    redis: new Redis({ url, token }),
    limiter: Ratelimit.slidingWindow(60, "1 m"),
    prefix: "ratelimit:public",
    // Short-circuits repeat offenders in-memory, skipping the Redis round trip
    ephemeralCache: new Map(),
  });
}

// Cache on globalThis so HMR in dev doesn't recreate the limiter (and re-log)
const globalForRatelimit = globalThis as unknown as {
  publicRatelimit?: Ratelimit | null;
};
export const publicRatelimit = (globalForRatelimit.publicRatelimit ??=
  createPublicRatelimit());
