import type * as schema from "@/db/schema";
import type { NeonHttpDatabase } from "drizzle-orm/neon-http";

type AppDatabase = typeof import("@/db").db;

export type DatabaseExecutor = Pick<
  AppDatabase,
  "select" | "insert" | "update" | "delete"
>;

type NeonDatabase = NeonHttpDatabase<typeof schema>;

interface AtomicExecution<T> {
  local: (transaction: DatabaseExecutor) => Promise<T>;
  neon: (database: NeonDatabase) => Promise<T>;
}

/** Dispatch a database operation to a local transaction or a Neon batch. */
export function atomicExecute<T>(
  database: AppDatabase,
  operations: AtomicExecution<T>,
): Promise<T> {
  if (process.env.DATABASE_PROVIDER === "local") {
    return database.transaction((transaction) =>
      operations.local(transaction),
    );
  }

  return operations.neon(database as NeonDatabase);
}
