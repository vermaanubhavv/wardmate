import { describe, it, expect } from "vitest";
import { DISCHARGE_RETENTION_DAYS, daysUntilDeletion, retentionCutoffIso } from "@/lib/retention";

const NOW = new Date("2026-11-25T06:00:00Z");

describe("discharge retention", () => {
  it("keeps a patient for 90 days after discharge", () => {
    expect(DISCHARGE_RETENTION_DAYS).toBe(90);
    expect(retentionCutoffIso(NOW)).toBe("2026-08-27T06:00:00.000Z");
  });

  it("counts down whole days and never goes negative", () => {
    expect(daysUntilDeletion("2026-11-25T06:00:00Z", NOW)).toBe(90);
    expect(daysUntilDeletion("2026-11-24T18:00:00Z", NOW)).toBe(90); // part day rounds up
    expect(daysUntilDeletion("2026-08-27T06:00:00Z", NOW)).toBe(0);
    expect(daysUntilDeletion("2026-01-01T00:00:00Z", NOW)).toBe(0);
  });
});
