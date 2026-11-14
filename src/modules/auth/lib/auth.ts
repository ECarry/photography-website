import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { createAuthMiddleware, APIError } from "better-auth/api";

import { db } from "@/db";
import * as schema from "@/db/schema";
import { nextCookies } from "better-auth/next-js";
import { logger } from "@/lib/logger";
import { createSecondaryStorage } from "./secondary-storage";
import { isFirstUserRegistrationAvailable } from "./registration";

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
  // The one-time initial account endpoint is public until the first user exists.
  rateLimit: {
    window: 60,
    max: 60,
    ...(secondaryStorage ? { storage: "secondary-storage" as const } : {}),
    customRules: {
      "/sign-in/email": { window: 60, max: 5 },
      "/sign-up/email": { window: 60, max: 5 },
    },
  },

  plugins: [nextCookies()],

  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      if (!ctx.path.endsWith("/sign-up/email")) return;

      try {
        if (!(await isFirstUserRegistrationAvailable())) {
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
