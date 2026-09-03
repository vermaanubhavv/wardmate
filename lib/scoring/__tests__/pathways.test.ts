import { describe, it, expect } from "vitest";
import { evaluateCard } from "../engine";
import { validatePathwayDefinition } from "../schema";
import { ctx, input } from "./helpers";
import { appendicitisAirV1 } from "../definitions/appendicitis-air.v1";
import { cholecystitisTg18V1 } from "../definitions/acute-cholecystitis-tg18.v1";
import { cholangitisTg18V1 } from "../definitions/acute-cholangitis-tg18.v1";
import { upperGiBleedGbsV1 } from "../definitions/upper-gi-bleed-gbs.v1";
import { acutePancreatitisV1 } from "../definitions/acute-pancreatitis.v1";
import type { EvaluateContext } from "../engine";

const cardOf = (def: { cards: { cardId: string }[] }, id: string) =>
  def.cards.find((c) => c.cardId === id)! as never;

const comp = (r: ReturnType<typeof evaluateCard>, id: string) => {
  const c = r.components.find((x) => x.componentId === id);
  if (!c) throw new Error(`no ${id}: ${r.components.map((x) => x.componentId)}`);
  return c;
};

describe("all shipped pathways pass the schema", () => {
  for (const def of [acutePancreatitisV1, appendicitisAirV1, cholecystitisTg18V1, cholangitisTg18V1, upperGiBleedGbsV1]) {
    it(`${def.pathwayId}`, () => {
      expect(validatePathwayDefinition(def)).toEqual({ ok: true, issues: [] });
    });
  }
});

// ── AIR (banded objective criteria + graded clinician assessment) ────────────
describe("AIR score", () => {
  const air = cardOf(appendicitisAirV1, "air");

  it("neutrophils band: 70–84 % → 1, ≥ 85 % → 2, < 70 → 0", () => {
    for (const [pct, pts] of [[68, 0], [75, 1], [90, 2]] as const) {
      const r = evaluateCard(air, ctx([input("neutrophil_percent", pct, "%", 2)]));
      expect(comp(r, "air.neutrophils").points).toBe(pts);
    }
  });

  it("WBC band uses cells/mm³ thresholds", () => {
    const mid = evaluateCard(air, ctx([input("wbc", 12000, "cells/mm3", 2)]));
    expect(comp(mid, "air.wbc").points).toBe(1);
    const high = evaluateCard(air, ctx([input("wbc", 16000, "cells/mm3", 2)]));
    expect(comp(high, "air.wbc").points).toBe(2);
  });

  it("guarding is a graded clinician assessment (moderate → 2)", () => {
    const assessed: EvaluateContext["assessedComponents"] = {
      "air.guarding": { satisfied: true, points: 2, text: "moderate guarding", at: "2026-01-10T02:00:00Z", by: "u1" },
    };
    const r = evaluateCard(air, ctx([input("neutrophil_percent", 90, "%", 2)], { assessedComponents: assessed }));
    expect(comp(r, "air.guarding").points).toBe(2);
  });

  it("provisional total: objective criteria known, history criteria assumed absent", () => {
    // temp, neutrophils, WBC, CRP known; vomiting/RIF pain/guarding pending.
    const r = evaluateCard(
      air,
      ctx([
        input("temp", 39, "C", 2),
        input("neutrophil_percent", 90, "%", 2), // +2
        input("wbc", 16000, "cells/mm3", 2), // +2
        input("crp", 80, null, 2), // +2
      ])
    );
    expect(r.total).toBeNull(); // not complete
    expect(r.provisionalTotal).toBe(7); // 1 + 2 + 2 + 2, history assumed 0
    expect(r.assumedComponentIds.sort()).toEqual(["air.guarding", "air.rif_pain", "air.vomiting"]);
  });
});

// ── Glasgow-Blatchford (all-banded) ────────────────────────────────────────
describe("Glasgow-Blatchford Score", () => {
  const gbs = cardOf(upperGiBleedGbsV1, "gbs");

  it("urea bands (mg/dL, converted from mmol/L)", () => {
    for (const [mgdl, pts] of [[15, 0], [20, 2], [25, 3], [40, 4], [80, 6]] as const) {
      const r = evaluateCard(gbs, ctx([input("bun", mgdl, "mg/dL", 1)]));
      expect(comp(r, "gbs.urea").points).toBe(pts);
    }
  });

  it("Hb and SBP bands", () => {
    const r = evaluateCard(gbs, ctx([input("hb", 11, null, 1), input("sbp", 95, "mmHg", 1)]));
    expect(comp(r, "gbs.hb").points).toBe(3);
    expect(comp(r, "gbs.sbp").points).toBe(2);
  });

  it("GBS 0 when everything is in the reassuring band", () => {
    const r = evaluateCard(
      gbs,
      ctx([
        input("bun", 15, "mg/dL", 1),
        input("hb", 14, null, 1),
        input("sbp", 120, "mmHg", 1),
        input("hr", 80, "/min", 1),
      ], {
        assessedComponents: {
          "gbs.melaena": { satisfied: false, text: "absent", at: "x", by: "u" },
          "gbs.syncope": { satisfied: false, text: "absent", at: "x", by: "u" },
          "gbs.hepatic": { satisfied: false, text: "absent", at: "x", by: "u" },
          "gbs.cardiac": { satisfied: false, text: "absent", at: "x", by: "u" },
        },
      })
    );
    expect(r.total).toBe(0);
    expect(r.missingRequiredCount).toBe(0);
    expect(r.interpretation?.text).toMatch(/very low risk/i);
  });
});

// ── Tokyo Guidelines — tiered classification ───────────────────────────────
describe("Tokyo Guidelines cholecystitis severity", () => {
  const tg = cardOf(cholecystitisTg18V1, "tg18_cholecystitis");
  const normalAssess: EvaluateContext["assessedComponents"] = Object.fromEntries(
    ["tg18c.hypotension", "tg18c.consciousness", "tg18c.mass", "tg18c.duration", "tg18c.local"].map((id) => [
      id,
      { satisfied: false, text: "absent", at: "x", by: "u" },
    ])
  );

  it("Grade I when nothing is met", () => {
    const r = evaluateCard(tg, ctx([input("creatinine", 0.9, "mg/dL", 4), input("wbc", 9000, "cells/mm3", 4)], { assessedComponents: normalAssess }));
    expect(r.classification).toBe("grade_i");
    expect(r.missingRequiredCount).toBe(0);
  });

  it("Grade II on a single Grade-II criterion (WBC > 18,000)", () => {
    const r = evaluateCard(tg, ctx([input("wbc", 20000, "cells/mm3", 4), input("creatinine", 0.9, "mg/dL", 4)], { assessedComponents: normalAssess }));
    expect(r.classification).toBe("grade_ii");
  });

  it("Grade III overrides — any organ dysfunction", () => {
    const r = evaluateCard(tg, ctx([input("creatinine", 3, "mg/dL", 4), input("wbc", 20000, "cells/mm3", 4)], { assessedComponents: normalAssess }));
    expect(r.classification).toBe("grade_iii");
  });

  it("provisional/incomplete while a Grade-III clinician criterion is unknown", () => {
    const r = evaluateCard(tg, ctx([input("wbc", 9000, "cells/mm3", 4), input("creatinine", 0.9, "mg/dL", 4)]));
    // Grade III assessments pending → cannot be sure it isn't grade III
    expect(r.state).toBe("incomplete");
    expect(r.missingRequiredCount).toBeGreaterThan(0);
  });
});

describe("Tokyo Guidelines cholangitis — Grade II needs ANY TWO", () => {
  const tg = cardOf(cholangitisTg18V1, "tg18_cholangitis");
  const noG3: EvaluateContext["assessedComponents"] = {
    "tg18ch.hypotension": { satisfied: false, text: "absent", at: "x", by: "u" },
    "tg18ch.consciousness": { satisfied: false, text: "absent", at: "x", by: "u" },
  };

  it("one Grade-II criterion is still Grade I", () => {
    const r = evaluateCard(tg, ctx([input("temp", 39.5, "C", 3), input("creatinine", 0.9, "mg/dL", 3)], { assessedComponents: noG3, now: undefined }));
    expect(r.classification).toBe("grade_i");
  });

  it("two Grade-II criteria → Grade II", () => {
    const r = evaluateCard(
      tg,
      ctx([input("temp", 39.5, "C", 3), input("bilirubin", 7, null, 3), input("creatinine", 0.9, "mg/dL", 3)], { assessedComponents: noG3 })
    );
    expect(r.classification).toBe("grade_ii");
  });
});

// ── Pancreatitis card is still one BISAP + provisional confirm ──────────────
describe("BISAP with the streamlined provisional flow", () => {
  const bisap = cardOf(acutePancreatitisV1, "bisap");

  it("objective criteria in → provisional score assuming mental status & effusion normal", () => {
    const r = evaluateCard(
      bisap,
      ctx([
        input("bun", 30, "mg/dL", 4), // +1
        input("age_years", 72, "years", 0), // +1
        input("temp", 39, "C", 3),
        input("hr", 120, "/min", 3), // SIRS +1
      ])
    );
    expect(r.total).toBeNull();
    expect(r.provisionalTotal).toBe(3);
    expect(r.assumedComponentIds.sort()).toEqual(["bisap.mental_status", "bisap.pleural_effusion"]);
    expect(r.interpretation?.tone).toBe("attention"); // ≥ 3
  });

  it("confirming both assessments as normal completes the card at the same number", () => {
    const r = evaluateCard(
      bisap,
      ctx(
        [
          input("bun", 30, "mg/dL", 4),
          input("age_years", 72, "years", 0),
          input("temp", 39, "C", 3),
          input("hr", 120, "/min", 3),
        ],
        {
          assessedComponents: {
            "bisap.mental_status": { satisfied: false, text: "alert", at: "x", by: "u" },
            "bisap.pleural_effusion": { satisfied: false, text: "none", at: "x", by: "u" },
          },
        }
      )
    );
    expect(r.total).toBe(3);
    expect(r.missingRequiredCount).toBe(0);
  });
});
