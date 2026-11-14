import type { BatchItem, BatchResponse } from "drizzle-orm/batch";
import type * as schema from "@/db/schema";
import type { NeonHttpDatabase } from "drizzle-orm/neon-http";

type AppDatabase = typeof import("@/db").db;
type NeonDatabase = NeonHttpDatabase<typeof schema>;

/** Combine read queries into one HTTP request when using Neon HTTP. */
export function readBatch<
  const T extends readonly [BatchItem<"pg">, ...BatchItem<"pg">[]],
>(database: AppDatabase, queries: T): Promise<BatchResponse<T>> {
  if (process.env.DATABASE_PROVIDER === "local") {
    return Promise.all(queries) as Promise<BatchResponse<T>>;
  }

  return (database as NeonDatabase).batch(queries);
}
