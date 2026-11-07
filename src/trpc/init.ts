import { db } from "@/db";
import { cache } from "react";
import superjson from "superjson";
import { initTRPC, TRPCError } from "@trpc/server";
import { getSession } from "@/modules/auth/lib/get-session";
import { parseClientIp, publicRatelimit } from "@/lib/ratelimit";
import { logger } from "@/lib/logger";

export const createTRPCContext = cache(async () => {
  return { db, clientIp: null };
});

/**
 * Context for HTTP requests hitting the tRPC route handler.
 * Carries the client IP so public procedures can be rate limited.
 */
export async function createHTTPTRPCContext(opts: { req: Request }) {
  return {
    db,
    clientIp: parseClientIp((name) => opts.req.headers.get(name)),
  };
}

type Context = {
  db: typeof db;
  clientIp: string | null;
};

const t = initTRPC.context<Context>().create({
  transformer: superjson,
});

export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;
export const baseProcedure = t.procedure;

/**
 * Public procedure with per-IP rate limiting (60 req/min, sliding window).
 * - Only HTTP requests are limited; server-side (RSC) calls carry no IP and
 *   are exempt so public pages stay statically renderable (ISR).
 * - Disabled when Upstash Redis is not configured; fail-closed on Redis errors.
 */
export const publicProcedure = t.procedure.use(
  t.middleware(async ({ ctx, next, path }) => {
    const ip = ctx.clientIp;
    if (!publicRatelimit || ip === null) return next();

    let success: boolean;
    try {
      ({ success } = await publicRatelimit.limit(ip));
    } catch (error) {
      logger.error("Rate limit check failed", error, { path });
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Rate limit check failed",
      });
    }

    if (!success) {
      throw new TRPCError({
        code: "TOO_MANY_REQUESTS",
        message: "Too many requests, please try again later",
      });
    }

    return next();
  })
);
export const protectedProcedure = t.procedure.use(
  t.middleware(async ({ ctx, next }) => {
    const session = await getSession();

    if (!session) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
      });
    }

    return next({
      ctx: {
        ...ctx,
        auth: session.user,
      },
    });
  })
);
