import { defineConfig } from "vitest/config";
import { resolve } from "node:path";

/**
 * Tests for the clinical scoring engine (lib/scoring). Pure logic only — no jsdom, no Next
 * runtime. The `@/` alias mirrors tsconfig.json so test imports match app imports.
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
