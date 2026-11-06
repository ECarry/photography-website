import { db } from "@/db";
import { cache } from "react";
import superjson from "superjson";
import { initTRPC, TRPCError } from "@trpc/server";
import { getSession } from "@/modules/auth/lib/get-session";
import { getClientIp, publicRatelimit } from "@/lib/ratelimit";
import { logger } from "@/lib/logger";

export const createTRPCContext = cache(async () => {
  return { db };
});

type Context = {
  db: typeof db;
};

const t = initTRPC.context<Context>().create({
  transformer: superjson,
});

export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;
export const baseProcedure = t.procedure;

/**
 * Public procedure with per-IP rate limiting (60 req/min, sliding window).
 * Disabled when Upstash Redis is not configured; fail-closed on Redis errors.
 */
export const publicProcedure = t.procedure.use(
  t.middleware(async ({ next, path }) => {
    if (!publicRatelimit) return next();

    const ip = await getClientIp();

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
