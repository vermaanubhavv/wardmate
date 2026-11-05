import { describe, expect, it } from "vitest";
import { needsRecompute } from "../checkpoints";

const now = "2026-11-04T10:00:00Z";
const inst = (updated_at: string, next_checkpoint_at: string | null = null) => ({ updated_at, next_checkpoint_at });

describe("needsRecompute", () => {
  it("skips when nothing changed since the last compute and no checkpoint is due", () => {
    expect(
      needsRecompute({ force: false, changedAt: "2026-11-04T08:00:00Z", instances: [inst("2026-11-04T09:00:00Z")], now })
    ).toBe(false);
  });

  it("recomputes when an observation changed after the last compute", () => {
    expect(
      needsRecompute({ force: false, changedAt: "2026-11-04T09:30:00Z", instances: [inst("2026-11-04T09:00:00Z")], now })
    ).toBe(true);
  });

  it("recomputes when a checkpoint has fallen due", () => {
    expect(
      needsRecompute({ force: false, changedAt: null, instances: [inst("2026-11-04T09:00:00Z", "2026-11-04T09:59:00Z")], now })
    ).toBe(true);
  });

  it("always recomputes when forced or when the database has no marker yet", () => {
    expect(needsRecompute({ force: true, changedAt: null, instances: [inst(now)], now })).toBe(true);
    expect(needsRecompute({ force: false, changedAt: undefined, instances: [inst(now)], now })).toBe(true);
  });

  it("has nothing to recompute with no open instances", () => {
    expect(needsRecompute({ force: false, changedAt: now, instances: [], now })).toBe(false);
  });
});
