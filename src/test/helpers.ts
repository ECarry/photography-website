import { appRouter } from "@/trpc/routers/_app";
import { createCallerFactory } from "@/trpc/init";
import { db } from "@/db";

const createCaller = createCallerFactory(appRouter);

/**
 * Creates an authenticated test caller.
 * Uses the real database — make sure TEST_DATABASE_URL is set.
 */
export const createAuthedCaller = () => createCaller({ db });

/**
 * Helper to build a minimal valid photo input for testing.
 * Override any field by passing partial values.
 */
export function buildPhotoInput(overrides: Record<string, unknown> = {}) {
  return {
    url: "photos/test-photo.jpg",
    title: "Test Photo",
    description: "A test photo",
    aspectRatio: 1.5,
    width: 1500,
    height: 1000,
    blurData: "data:image/png;base64,test",
    visibility: "public" as const,
    ...overrides,
  };
}
