import { describe, it, expect } from "vitest";
import { assessSafety, worstSafety } from "@/lib/history-check/safety";
import { listTrees, getTree } from "@/lib/history-check/trees";
import type { SlotResult } from "@/lib/history-check/sources";
import type { HistoryTree, SlotState } from "@/lib/history-check/types";

const res = (id: string, state: SlotState): SlotResult => ({ id, state, evidence: null, value: null, conflict: null });

const redFlagIds = (t: HistoryTree) => t.slots.filter((s) => s.group === "red_flag").map((s) => s.id);

/** Every red flag answered with the given state. */
const allRedFlags = (t: HistoryTree, state: SlotState) => redFlagIds(t).map((id) => res(id, state));

describe("safety level", () => {
  const fever = getTree("fever")!;

  it("is 0 only when every red flag was asked and every one was negative", () => {
    const a = assessSafety(fever, allRedFlags(fever, "negative"));
    expect(a.level).toBe(0);
    expect(a.complete).toBe(true);
    expect(a.positives).toEqual([]);
    expect(a.summary).toBe("All red flags asked, none positive");
  });

  it("never reads silence as reassurance — an empty history is 1, not 0", () => {
    const a = assessSafety(fever, []);
    expect(a.level).toBe(1);
    expect(a.complete).toBe(false);
    expect(a.unasked).toEqual(redFlagIds(fever));
  });

  it("a single unasked red flag keeps the level off 0 however calm the rest looks", () => {
    const ids = redFlagIds(fever);
    const results = ids.slice(1).map((id) => res(id, "negative"));
    const a = assessSafety(fever, results);
    expect(a.level).toBe(1);
    expect(a.complete).toBe(false);
    expect(a.unasked).toEqual([ids[0]]);
    expect(a.negatives).toEqual(ids.slice(1));
  });

  it("rises with the number of positives", () => {
    const ids = redFlagIds(fever);
    const withPositives = (n: number) =>
      assessSafety(
        fever,
        ids.map((id, i) => res(id, i < n ? "positive" : "negative"))
      ).level;
    expect(withPositives(0)).toBe(0);
    expect(withPositives(1)).toBe(2);
    expect(withPositives(2)).toBe(3);
    expect(withPositives(3)).toBe(4);
    expect(withPositives(4)).toBe(4);
  });

  it("a positive outranks incompleteness rather than being masked by it", () => {
    const ids = redFlagIds(fever);
    // One positive, everything else never asked.
    const a = assessSafety(fever, [res(ids[0], "positive")]);
    expect(a.level).toBe(2);
    expect(a.complete).toBe(false);
    expect(a.summary).toMatch(/1 red flag positive/);
    expect(a.summary).toMatch(/not asked/);
  });

  it("an unknown or missing slot result counts as unasked, never as negative", () => {
    // A result for a slot that is not a red flag must not be credited to the red-flag sweep.
    const a = assessSafety(fever, [res("not_a_real_slot", "negative")]);
    expect(a.level).toBe(1);
    expect(a.negatives).toEqual([]);
    expect(a.unasked).toEqual(redFlagIds(fever));
  });

  it("only red-flag slots count, whatever their tier", () => {
    const nonRedFlag = fever.slots.filter((s) => s.group !== "red_flag").map((s) => s.id);
    const a = assessSafety(fever, [
      ...allRedFlags(fever, "negative"),
      ...nonRedFlag.map((id) => res(id, "positive")),
    ]);
    expect(a.level).toBe(0);
  });

  it("scores every shipped tree without throwing, and never returns 0 for an empty history", () => {
    for (const t of listTrees()) {
      const empty = assessSafety(t, []);
      expect(empty.level).toBeGreaterThanOrEqual(1);
      expect(empty.complete).toBe(false);
      const clear = assessSafety(t, allRedFlags(t, "negative"));
      expect(clear.level).toBe(0);
      expect(clear.complete).toBe(true);
    }
  });

  it("worstSafety takes the highest level, and returns null when there is nothing to score", () => {
    const calm = assessSafety(fever, allRedFlags(fever, "negative"));
    const alarming = assessSafety(fever, redFlagIds(fever).map((id, i) => res(id, i < 2 ? "positive" : "negative")));
    expect(worstSafety([calm, alarming])?.level).toBe(3);
    expect(worstSafety([alarming, calm])?.level).toBe(3);
    expect(worstSafety([])).toBeNull();
  });
});
