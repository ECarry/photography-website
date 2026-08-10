import { defineConfig } from "vitest/config";
import { loadEnv } from "vite";
import path from "path";

Object.assign(process.env, loadEnv("test", process.cwd(), ""));

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/__tests__/**/*.test.ts"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
