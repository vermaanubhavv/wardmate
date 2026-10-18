import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/supabase/server", () => ({ createClient: vi.fn() }));
import { aiDraftIsStale } from "@/lib/discharge-data";

describe("aiDraftIsStale", () => {
  const draftAt = "2026-10-07T10:00:00.5+00:00";
  const history = [{ recorded_at: "2026-10-07T10:05:00.123456+00:00" }];

  it("redrafts a warm-up written before the case history", () => {
    expect(aiDraftIsStale(draftAt, false, history)).toBe(true);
  });
  it("keeps a warm-up newer than the record", () => {
    expect(aiDraftIsStale("2026-10-07T10:06:00+00:00", false, history)).toBe(false);
  });
  it("never touches a draft someone worked on, or an unknown one", () => {
    expect(aiDraftIsStale(draftAt, true, history)).toBe(false);
    expect(aiDraftIsStale(draftAt, undefined, history)).toBe(false);
  });
});
