import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

/**
 * Server components (the Learn pages) call statusChip() directly. A function exported from a
 * "use client" module cannot be called on the server — when card-kit became a client module
 * every Learn history and examination page crashed in production. This pins the split.
 */
describe("server-callable UI helpers", () => {
  it("status-chip stays a server-safe module, and the Learn pages import it from there", () => {
    expect(readFileSync("app/patients/[id]/status-chip.tsx", "utf8")).not.toMatch(/^\s*["']use client["']/m);
    for (const page of ["app/learn/history/[treeId]/page.tsx", "app/learn/examination/[id]/page.tsx"]) {
      expect(readFileSync(page, "utf8"), page).toContain('from "@/app/patients/[id]/status-chip"');
    }
  });
});
