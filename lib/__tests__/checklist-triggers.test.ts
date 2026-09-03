import { describe, it, expect } from "vitest";
import { evaluateTrigger, matchesUnnegated, type TriggerContext } from "@/lib/checklist-triggers";

const baseCtx = (over: Partial<TriggerContext> = {}): TriggerContext => ({
  values: "",
  postOpDay: null,
  hoursSinceSurgery: null,
  hoursSinceAdmission: null,
  hasValue: () => false,
  labs: [],
  ...over,
});

describe("matchesUnnegated", () => {
  it("matches a plain mention", () => {
    expect(matchesUnnegated("known case of CAD, HTN", /cad/i)).toBe(true);
  });
  it("ignores a negated mention", () => {
    expect(matchesUnnegated("no past jaundice, denies chills", /past jaundice/i)).toBe(false);
    expect(matchesUnnegated("denies chills", /chills/i)).toBe(false);
  });
  it("matches when the same term appears both negated and not", () => {
    expect(matchesUnnegated("no fever on day 1; fever with chills on day 3", /fever with chills/i)).toBe(true);
  });
});

describe("evaluateTrigger", () => {
  it("no trigger → always active", () => {
    expect(evaluateTrigger(null, baseCtx())).toEqual({ active: true, forceCore: false });
    expect(evaluateTrigger({ when: [] }, baseCtx())).toEqual({ active: true, forceCore: false });
  });

  it("history condition", () => {
    const t = { when: [{ type: "history" as const, pattern: "pancreatitis|dilated cbd" }] };
    expect(evaluateTrigger(t, baseCtx({ values: "USG: multiple calculi, dilated CBD 9mm" })).active).toBe(true);
    expect(evaluateTrigger(t, baseCtx({ values: "USG: multiple calculi, CBD normal" })).active).toBe(false);
  });

  it("lab threshold", () => {
    const t = { when: [{ type: "lab" as const, analyte: "hb", op: "lt" as const, value: 8 }] };
    expect(evaluateTrigger(t, baseCtx({ labs: [{ name: "hb", value: 7.2 }] })).active).toBe(true);
    expect(evaluateTrigger(t, baseCtx({ labs: [{ name: "hb", value: 11 }] })).active).toBe(false);
  });

  it("time based: post-op day", () => {
    const t = { when: [{ type: "pod_gte" as const, days: 2 }], effect: "core" as const };
    expect(evaluateTrigger(t, baseCtx({ postOpDay: 3 }))).toEqual({ active: true, forceCore: true });
    expect(evaluateTrigger(t, baseCtx({ postOpDay: 1 })).active).toBe(false);
    // pre-op: postOpDay null, never fires
    expect(evaluateTrigger(t, baseCtx({ postOpDay: null })).active).toBe(false);
  });

  it("AND across conditions — no flatus by POD 2", () => {
    const t = {
      when: [
        { type: "pod_gte" as const, days: 2 },
        { type: "item_absent" as const, label: "flatus" },
      ],
      effect: "core" as const,
    };
    expect(evaluateTrigger(t, baseCtx({ postOpDay: 2, hasValue: () => false })).active).toBe(true);
    expect(evaluateTrigger(t, baseCtx({ postOpDay: 2, hasValue: (l) => l === "flatus" })).active).toBe(false);
  });

  it("day_of_surgery", () => {
    const t = { when: [{ type: "day_of_surgery" as const }] };
    expect(evaluateTrigger(t, baseCtx({ postOpDay: 0 })).active).toBe(true);
    expect(evaluateTrigger(t, baseCtx({ postOpDay: 1 })).active).toBe(false);
  });

  it("not", () => {
    const t = { when: [{ type: "not" as const, cond: { type: "history" as const, pattern: "diabetes" } }] };
    expect(evaluateTrigger(t, baseCtx({ values: "hypertension" })).active).toBe(true);
    expect(evaluateTrigger(t, baseCtx({ values: "type 2 diabetes" })).active).toBe(false);
  });
});
