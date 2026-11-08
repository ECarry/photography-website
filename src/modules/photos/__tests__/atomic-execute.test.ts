import { afterEach, describe, expect, it, vi } from "vitest";
import { atomicExecute } from "@/db/atomic-execute";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("atomicExecute", () => {
  it("runs local writes inside a transaction", async () => {
    vi.stubEnv("DATABASE_PROVIDER", "local");
    const localTransaction = vi.fn(
      async (callback: (transaction: unknown) => Promise<string>) =>
        callback({}),
    );
    const database = {
      transaction: localTransaction,
    } as unknown as Parameters<typeof atomicExecute>[0];
    const local = vi.fn(async () => "local");
    const neon = vi.fn(async () => "neon");

    await expect(
      atomicExecute(database, { local, neon }),
    ).resolves.toBe("local");
    expect(localTransaction).toHaveBeenCalledOnce();
    expect(local).toHaveBeenCalledOnce();
    expect(neon).not.toHaveBeenCalled();
  });

  it("uses the Neon batch handler for serverless databases", async () => {
    vi.stubEnv("DATABASE_PROVIDER", "neon");
    const database = {} as Parameters<typeof atomicExecute>[0];
    const local = vi.fn(async () => "local");
    const neon = vi.fn(async () => "neon");

    await expect(
      atomicExecute(database, { local, neon }),
    ).resolves.toBe("neon");
    expect(local).not.toHaveBeenCalled();
    expect(neon).toHaveBeenCalledOnce();
  });
});
