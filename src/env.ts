import { z } from "zod";

const serverSchema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  DATABASE_PROVIDER: z.enum(["local", "neon"]).optional(),

  // S3
  S3_ENDPOINT: z.string().min(1, "S3_ENDPOINT is required"),
  S3_BUCKET_NAME: z.string().min(1, "S3_BUCKET_NAME is required"),
  S3_ACCESS_KEY_ID: z.string().min(1, "S3_ACCESS_KEY_ID is required"),
  S3_SECRET_ACCESS_KEY: z.string().min(1, "S3_SECRET_ACCESS_KEY is required"),

  // Auth
  BETTER_AUTH_SECRET: z.string().min(1, "BETTER_AUTH_SECRET is required"),
  BETTER_AUTH_URL: z.string().min(1, "BETTER_AUTH_URL is required"),

  // Upstash Redis (optional — rate limiting is disabled when unset)
  UPSTASH_REDIS_REST_URL: z.string().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),
}).refine(
  (env) =>
    Boolean(env.UPSTASH_REDIS_REST_URL) ===
    Boolean(env.UPSTASH_REDIS_REST_TOKEN),
  {
    message:
      "UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN must be set together",
  },
);

/**
 * Validate server-side environment variables.
 * Call this once during server startup to fail fast with clear errors.
 * Throws ZodError with details of all missing/invalid variables.
 */
export function validateServerEnv() {
  return serverSchema.parse(process.env);
}
