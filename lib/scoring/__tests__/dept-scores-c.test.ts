import { describe, it, expect } from "vitest";
import { evaluateCard, type EvaluateContext } from "../engine";
import { validatePathwayDefinition } from "../schema";
import { ctx, input } from "./helpers";
import { meowsV1 } from "../definitions/meows.v1";
import { pewsV1 } from "../definitions/pews.v1";

const assessed = (m: Record<string, { satisfied: boolean; points?: number }>): EvaluateContext["assessedComponents"] =>
  Object.fromEntries(Object.entries(m).map(([k, v]) => [k, { ...v, text: "x", at: "x", by: "u" }]));

describe("dept scores C — definitions validate and are signed off", () => {
  for (const def of [meowsV1, pewsV1]) {
    it(def.pathwayId, () => {
      expect(validatePathwayDefinition(def)).toEqual({ ok: true, issues: [] });
      expect(def.status).toBe("active");
      expect(def.clinicalOwner).toMatch(/signed off/i);
      expect(def.clinicalOwner).toMatch(/review due/i);
      expect(def.tasks).toEqual([]);
    });
  }
});

describe("MEOWS", () => {
  const card = meowsV1.cards[0];
  const AVPU_ALERT = assessed({ "meows.avpu_red": { satisfied: false }, "meows.avpu_yellow": { satisfied: false } });
  const NORMAL: Record<string, [number, string | null]> = {
    temp: [37, "C"], sbp: [120, "mmHg"], dbp: [75, "mmHg"], hr: [85, "/min"], rr: [16, "/min"], spo2: [98, null],
  };
  const run = (over: Record<string, number> = {}, assessedComponents = AVPU_ALERT) =>
    evaluateCard(
      card,
      ctx(
        Object.entries(NORMAL).map(([k, [v, u]]) => input(k, over[k] ?? v, u, 2)),
        { assessedComponents }
      )
    );

  it("all normal → no_trigger, complete", () => {
    const r = run();
    expect(r.classification).toBe("no_trigger");
    expect(r.state).toBe("complete_unverified");
    expect(r.interpretation?.tone).toBe("neutral");
  });

  it("one red (SpO₂ 94) → red trigger, prompt obstetric review", () => {
    const r = run({ spo2: 94 });
    expect(r.classification).toBe("red");
    expect(r.interpretation?.text).toMatch(/prompt review by the obstetric team/);
  });

  it("two yellows (HR 110 + RR 25) → yellow trigger", () => {
    const r = run({ hr: 110, rr: 25 });
    expect(r.classification).toBe("yellow");
    expect(r.interpretation?.text).toMatch(/two or more yellow/);
  });

  it("one yellow alone → no_trigger", () => {
    expect(run({ hr: 110 }).classification).toBe("no_trigger");
  });

  it("AVPU voice counts as a yellow", () => {
    const r = run({ hr: 110 }, assessed({ "meows.avpu_red": { satisfied: false }, "meows.avpu_yellow": { satisfied: true } }));
    expect(r.classification).toBe("yellow");
  });

  it.each([
    ["hr", 120, "no_trigger", "meows.hr_high_yellow"],
    ["hr", 121, "red", "meows.hr_high_red"],
    ["sbp", 160, "no_trigger", "meows.sbp_high_yellow"],
    ["sbp", 161, "red", "meows.sbp_high_red"],
    ["temp", 38.0, "no_trigger", null],
    ["temp", 38.1, "red", "meows.temp_high_red"],
    ["temp", 35.0, "no_trigger", "meows.temp_low_yellow"],
    ["temp", 34.9, "red", "meows.temp_low_red"],
  ] as const)("boundary %s %d → %s", (key, v, cls, satisfiedId) => {
    const r = run({ [key]: v });
    expect(r.classification).toBe(cls);
    const sat = r.components.filter((c) => c.status === "satisfied").map((c) => c.componentId);
    expect(sat).toEqual(satisfiedId ? [satisfiedId] : []);
  });

  it("a missing vital keeps the card incomplete, but a red still classifies red", () => {
    const noSpo2 = evaluateCard(card, ctx([input("hr", 85, "/min", 2), input("temp", 37, "C", 2)], { assessedComponents: AVPU_ALERT }));
    expect(noSpo2.classification).toBe("no_trigger");
    expect(noSpo2.state).toBe("incomplete");
    const red = evaluateCard(card, ctx([input("hr", 130, "/min", 2)]));
    expect(red.classification).toBe("red");
  });
});

describe("PEWS (Brighton)", () => {
  const card = pewsV1.cards[0];
  const all0 = { "pews.behaviour": { satisfied: false }, "pews.cardiovascular": { satisfied: false }, "pews.respiratory": { satisfied: false }, "pews.nebulisers": { satisfied: false }, "pews.postop_vomiting": { satisfied: false } };
  const run = (m: Record<string, { satisfied: boolean; points?: number }>) =>
    evaluateCard(card, ctx([], { assessedComponents: assessed({ ...all0, ...m }) }));

  it("all 0 → total 0, routine", () => {
    const r = run({});
    expect(r.total).toBe(0);
    expect(r.interpretation?.tone).toBe("neutral");
  });

  it("a single domain scoring 3 → total 3, band text flags the any-single-3 rule", () => {
    const r = run({ "pews.respiratory": { satisfied: true, points: 3 } });
    expect(r.total).toBe(3);
    expect(r.interpretation?.text).toMatch(/nurse in charge/);
    expect(r.interpretation?.text).toMatch(/single domain scoring 3.*review by the doctor/);
  });

  it("nebulisers + post-op vomiting add 4 → doctor-review band", () => {
    const r = run({ "pews.behaviour": { satisfied: true, points: 1 }, "pews.nebulisers": { satisfied: true }, "pews.postop_vomiting": { satisfied: true } });
    expect(r.total).toBe(5);
    expect(r.interpretation?.text).toMatch(/≥ 4 — prompts review by the doctor/);
  });
});
