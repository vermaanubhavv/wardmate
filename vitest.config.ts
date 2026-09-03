import { defineConfig } from "vitest/config";
import { resolve } from "node:path";

/**
 * Tests for server-side library code. Pure logic only — no jsdom or Next runtime. The `@/`
 * alias mirrors tsconfig.json so test imports match app imports.
 */
export default defineConfig({
  resolve: {
    alias: { "@": resolve(__dirname, ".") },
  },
  test: {
    include: ["lib/**/__tests__/**/*.test.ts"],
    environment: "node",
  },
});
