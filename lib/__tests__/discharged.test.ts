import { describe, it, expect, vi, afterEach } from "vitest";
import { DISCHARGE_UNDO_WINDOW_HOURS, dischargeCutoffIso, visibleDischargedFilter } from "@/lib/discharged";

afterEach(() => {
  vi.useRealTimers();
});

describe("dischargeCutoffIso", () => {
  it("is exactly DISCHARGE_UNDO_WINDOW_HOURS before now", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-09-19T12:00:00.000Z"));

    expect(dischargeCutoffIso()).toBe("2026-09-17T12:00:00.000Z");
    expect(DISCHARGE_UNDO_WINDOW_HOURS).toBe(48);
  });
});

describe("visibleDischargedFilter", () => {
  it("filters to just the undo window when nobody has a finalised summary", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-09-19T12:00:00.000Z"));

    expect(visibleDischargedFilter([])).toBe("discharged_at.gte.2026-09-17T12:00:00.000Z");
  });

  it("also includes anyone with a finalised summary, regardless of the window", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-09-19T12:00:00.000Z"));

    expect(visibleDischargedFilter(["p1", "p2"])).toBe(
      "discharged_at.gte.2026-09-17T12:00:00.000Z,id.in.(p1,p2)"
    );
  });
});
