import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { createAuthMiddleware, APIError } from "better-auth/api";

import { db } from "@/db";
import * as schema from "@/db/schema";
import { nextCookies } from "better-auth/next-js";
import { count } from "drizzle-orm";

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

  plugins: [nextCookies()],

  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      if (ctx.path !== "/sign-up/email") return;

      try {
        const result = await db.select({ value: count() }).from(schema.user);
        const userCount = result[0]?.value ?? 0;

        if (userCount > 0) {
            throw new APIError(
                "UNAUTHORIZED",
                {
                    message: "Registration is currently disabled.",
                }
            );
        }
      } catch (error) {
          console.error("DB Hook Error:", error);
          throw error;
      }

    })
  }
});
