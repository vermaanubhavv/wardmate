import { describe, it, expect } from "vitest";
import { evaluateCard, type EvaluateContext } from "../engine";
import { validatePathwayDefinition } from "../schema";
import { ctx, input } from "./helpers";
import { canadianCtHeadV1 } from "../definitions/canadian-ct-head.v1";
import { centorV1 } from "../definitions/centor.v1";
import { cowsV1 } from "../definitions/cows.v1";

const assessed = (m: Record<string, { satisfied: boolean; points?: number }>): EvaluateContext["assessedComponents"] =>
  Object.fromEntries(Object.entries(m).map(([k, v]) => [k, { ...v, text: "x", at: "x", by: "u" }]));
const allNo = (ids: string[]) => Object.fromEntries(ids.map((id) => [id, { satisfied: false }]));

describe("dept scores B — every definition validates and is signed off", () => {
  for (const def of [canadianCtHeadV1, centorV1, cowsV1]) {
    it(def.pathwayId, () => {
      expect(validatePathwayDefinition(def)).toEqual({ ok: true, issues: [] });
      expect(def.status).toBe("active");
      expect(def.clinicalOwner).toMatch(/signed off/i);
      expect(def.clinicalOwner).toMatch(/review due/i);
    });
  }
});

describe("Canadian CT Head Rule", () => {
  const card = canadianCtHeadV1.cards[0];
  const assessedIds = card.inputs.filter((i) => i.clinicianAssessed).map((i) => i.componentId);

  it("age 66 alone → high", () => {
    const r = evaluateCard(card, ctx([input("age_years", 66, "years", 0)], { assessedComponents: assessed(allNo(assessedIds)) }));
    expect(r.classification).toBe("high");
    expect(r.state).toBe("complete_unverified");
    expect(r.interpretation?.text).toMatch(/^Rule positive — high-risk/);
  });

  it("dangerous mechanism alone → medium", () => {
    const r = evaluateCard(
      card,
      ctx([input("age_years", 40, "years", 0)], {
        assessedComponents: assessed({ ...allNo(assessedIds), "cch.mechanism": { satisfied: true } }),
      })
    );
    expect(r.classification).toBe("medium");
    expect(r.interpretation?.text).toMatch(/medium-risk criterion; CT head is indicated/);
  });

  it("everything recorded, nothing positive → not_met, phrased as what the rule says", () => {
    const r = evaluateCard(card, ctx([input("age_years", 40, "years", 0)], { assessedComponents: assessed(allNo(assessedIds)) }));
    expect(r.classification).toBe("not_met");
    expect(r.state).toBe("complete_unverified");
    expect(r.interpretation?.text).toMatch(/the rule does not indicate CT/);
    expect(r.interpretation?.text).not.toMatch(/not needed/i);
  });

  it("a required unknown in a higher tier keeps a medium result incomplete", () => {
    const { ["cch.vomiting"]: _omit, ...rest } = allNo(assessedIds);
    const r = evaluateCard(
      card,
      ctx([input("age_years", 40, "years", 0)], {
        assessedComponents: assessed({ ...rest, "cch.mechanism": { satisfied: true } }),
      })
    );
    expect(r.classification).toBe("medium");
    expect(r.state).toBe("incomplete");
  });
});

describe("Centor", () => {
  const card = centorV1.cards[0];
  const noncough = (sat: boolean) => assessed({ "centor.no_cough": { satisfied: sat }, "centor.nodes": { satisfied: sat }, "centor.exudate": { satisfied: sat } });

  it("0 → ≈ 2.5 %, a probability not a diagnosis", () => {
    const r = evaluateCard(card, ctx([input("temp", 37, "C", 1)], { assessedComponents: noncough(false) }));
    expect(r.total).toBe(0);
    expect(r.interpretation?.text).toMatch(/2\.5 %.*a probability, not a diagnosis/i);
  });

  it("4 → ≈ 56 %", () => {
    const r = evaluateCard(card, ctx([input("temp", 39, "C", 1)], { assessedComponents: noncough(true) }));
    expect(r.total).toBe(4);
    expect(r.interpretation?.text).toMatch(/56 %/);
  });

  it("fever 38.0 is not counted, 38.1 is", () => {
    expect(evaluateCard(card, ctx([input("temp", 38.0, "C", 1)], { assessedComponents: noncough(false) })).total).toBe(0);
    expect(evaluateCard(card, ctx([input("temp", 38.1, "C", 1)], { assessedComponents: noncough(false) })).total).toBe(1);
  });
});

describe("COWS", () => {
  const card = cowsV1.cards[0];
  const itemIds = card.inputs.filter((i) => i.clinicianAssessed).map((i) => i.componentId);
  const pulsePts = (hr: number) =>
    evaluateCard(card, ctx([input("hr", hr, "/min", 1)])).components.find((c) => c.componentId === "cows.pulse")!.points;

  it("pulse band boundaries: 80 → 0, 81 → 1, 120 → 2, 121 → 4", () => {
    expect([80, 81, 120, 121].map(pulsePts)).toEqual([0, 1, 2, 4]);
  });

  it("all zero → 0, below the mild range", () => {
    const r = evaluateCard(card, ctx([input("hr", 72, "/min", 1)], { assessedComponents: assessed(allNo(itemIds)) }));
    expect(r.total).toBe(0);
    expect(r.interpretation?.text).toMatch(/below the mild range/);
  });

  it("moderate example: pulse 104 (2) + sweat 2 + restless 3 + pupils 2 + aches 2 + rhinorrhoea 2 + GI 2 = 15", () => {
    const r = evaluateCard(
      card,
      ctx([input("hr", 104, "/min", 1)], {
        assessedComponents: assessed({
          ...allNo(itemIds),
          "cows.sweating": { satisfied: true, points: 2 },
          "cows.restlessness": { satisfied: true, points: 3 },
          "cows.pupils": { satisfied: true, points: 2 },
          "cows.aches": { satisfied: true, points: 2 },
          "cows.rhinorrhoea": { satisfied: true, points: 2 },
          "cows.gi": { satisfied: true, points: 2 },
        }),
      })
    );
    expect(r.total).toBe(15);
    expect(r.interpretation?.text).toBe("COWS 13–24 — moderate opioid withdrawal.");
  });

  it("band texts cover 0–48 without gaps", () => {
    const b = card.interpretationBands;
    expect(b.map((x) => [x.min, x.max])).toEqual([[0, 4], [5, 12], [13, 24], [25, 36], [37, 48]]);
    expect(card.inputs.reduce((s, i) => s + i.points, 0)).toBe(48);
    expect(b.map((x) => x.text).join(" ")).toMatch(/mild.*moderate.*moderately severe.*severe/);
  });
});
