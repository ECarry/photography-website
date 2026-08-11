import { defineConfig } from "vitest/config";
import { loadEnv } from "vite";
import path from "path";

Object.assign(process.env, loadEnv("test", process.cwd(), ""));

if (process.env.ALLOW_TEST_DATABASE_RESET !== "true") {
  throw new Error(
    "Refusing to run database-backed tests. Set ALLOW_TEST_DATABASE_RESET=true in .env.test only for a dedicated test database.",
  );
}

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/server/**/__tests__/**/*.test.ts"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
