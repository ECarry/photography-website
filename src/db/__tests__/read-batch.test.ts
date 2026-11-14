import { afterEach, describe, expect, it, vi } from "vitest";
import type { BatchItem } from "drizzle-orm/batch";
import { readBatch } from "../read-batch";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("readBatch", () => {
  it("runs local queries concurrently", async () => {
    vi.stubEnv("DATABASE_PROVIDER", "local");
    const database = {} as Parameters<typeof readBatch>[0];
    const queries = [
      Promise.resolve(["items"]),
      Promise.resolve([{ count: 1 }]),
    ] as unknown as [BatchItem<"pg">, BatchItem<"pg">];

    await expect(readBatch(database, queries)).resolves.toEqual([
      ["items"],
      [{ count: 1 }],
    ]);
  });

  it("uses Neon batch to send read queries in one request", async () => {
    vi.stubEnv("DATABASE_PROVIDER", "neon");
    const batch = vi.fn().mockResolvedValue([["items"], [{ count: 1 }]]);
    const database = { batch } as unknown as Parameters<typeof readBatch>[0];
    const queries = [{}, {}] as const;

    await expect(readBatch(database, queries as never)).resolves.toEqual([
      ["items"],
      [{ count: 1 }],
    ]);
    expect(batch).toHaveBeenCalledOnce();
    expect(batch).toHaveBeenCalledWith(queries);
  });
});
