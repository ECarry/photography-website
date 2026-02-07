import { vi } from "vitest";

// Mock React cache — it doesn't exist in test environment
// Just pass through the function as-is
vi.mock("react", () => ({
  cache: (fn: Function) => fn,
}));

// Mock next/headers — not available outside Next.js
vi.mock("next/headers", () => ({
  headers: vi.fn(() => new Headers()),
}));

// Mock S3 client — we don't want real S3 calls in tests
vi.mock("@/modules/s3/lib/server-client", () => ({
  s3Client: {
    send: vi.fn().mockResolvedValue({}),
  },
}));

// Mock getSession — will be overridden per test via vi.mocked()
vi.mock("@/modules/auth/lib/get-session", () => ({
  getSession: vi.fn().mockResolvedValue({
    user: {
      id: "test-user-id",
      name: "Test User",
      email: "test@example.com",
    },
    session: {
      id: "test-session-id",
      token: "test-token",
    },
  }),
}));
