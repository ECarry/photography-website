import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { createAuthMiddleware, APIError } from "better-auth/api";

import { db } from "@/db";
import * as schema from "@/db/schema";
import { nextCookies } from "better-auth/next-js";
import { count } from "drizzle-orm";
import { logger } from "@/lib/logger";
import { createSecondaryStorage } from "./secondary-storage";

const secondaryStorage = createSecondaryStorage();

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      ...schema,
    },
  }),
  emailAndPassword: {
    enabled: true,
  },

  // Redis-backed storage keeps rate limit counters shared across instances
  // and persistent across restarts. Sessions stay in the database so the
  // profile page can keep listing active sessions.
  ...(secondaryStorage
    ? {
        secondaryStorage,
        session: {
          storeSessionInDatabase: true,
        },
      }
    : {}),

  // Brute-force protection for auth endpoints (enabled in production by
  // default; in-memory fallback when Upstash is not configured).
  // Single-admin site: sign-up is already blocked outside development by the
  // hook below, and password reset is not offered — only sign-in needs a
  // strict rule.
  rateLimit: {
    window: 60,
    max: 60,
    ...(secondaryStorage ? { storage: "secondary-storage" as const } : {}),
    customRules: {
      "/sign-in/email": { window: 60, max: 5 },
    },
  },

  plugins: [nextCookies()],

  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      if (!ctx.path.endsWith("/sign-up/email")) return;

      if (process.env.NODE_ENV !== "development") {
        throw new APIError("UNAUTHORIZED", {
          message: "Registration is currently disabled.",
        });
      }

      try {
        const result = await db.select({ value: count() }).from(schema.user);
        const userCount = result[0]?.value ?? 0;

        if (userCount > 0) {
          throw new APIError("UNAUTHORIZED", {
            message: "Registration is currently disabled.",
          });
        }
      } catch (error) {
        if (!(error instanceof APIError)) {
          logger.error("Auth database hook failed", error);
        }
        throw error;
      }
    }),
  },
});
