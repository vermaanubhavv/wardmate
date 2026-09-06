/**
 * Internal-medicine scoring definitions — computation and safety-wording checks.
 * All seven ship `status: "active"` (pilot activation) and are only offered to a unit whose
 * specialty pack lists the pathwayId (lib/specialty/internal-medicine.ts).
 */

import { describe, it, expect } from "vitest";
import { evaluateCard } from "../engine";
import { ctx, input } from "./helpers";
import { validatePathwayDefinition } from "../schema";
import { curb65V1 } from "../definitions/curb-65.v1";
import { qsofaV1 } from "../definitions/qsofa.v1";
import { cha2ds2VascV1 } from "../definitions/cha2ds2-vasc.v1";
import { hasBledV1 } from "../definitions/has-bled.v1";
import { wellsDvtV1 } from "../definitions/wells-dvt.v1";
import { wellsPeV1 } from "../definitions/wells-pe.v1";
import { dkaSeverityV1 } from "../definitions/dka-severity.v1";

const comp = (r: ReturnType<typeof evaluateCard>, id: string) => {
  const c = r.components.find((x) => x.componentId === id);
  if (!c) throw new Error(`no component ${id}: ${r.components.map((x) => x.componentId)}`);
  return c;
};

describe("every medicine definition validates and is draft", () => {
  for (const def of [curb65V1, qsofaV1, cha2ds2VascV1, hasBledV1, wellsDvtV1, wellsPeV1, dkaSeverityV1]) {
    it(`${def.pathwayId} passes the schema validator`, () => {
      const res = validatePathwayDefinition(def);
      expect(res.issues).toEqual([]);
      expect(res.ok).toBe(true);
    });
    it(`${def.pathwayId} is active for the pilot with a review still on the books`, () => {
      // Activated on the product owner's direction 2026-09-04; runtime is still gated by
      // NEXT_PUBLIC_SCORING_ENGINE + a per-ward ward_scoring_engine row + the pack scoringKeys.
      expect(def.status).toBe("active");
      expect(def.clinicalOwner).toMatch(/review pending/i);
      expect(def.reviewDueAt).toBeTruthy();
    });
  }
});

describe("CURB-65", () => {
  const card = curb65V1.cards[0];

  it("urea is a strict > 42: exactly 42 does not score, 42.1 does", () => {
    expect(comp(evaluateCard(card, ctx([input("urea", 42, "mg/dL", 2)])), "curb.urea").points).toBe(0);
    expect(comp(evaluateCard(card, ctx([input("urea", 42.1, "mg/dL", 2)])), "curb.urea").points).toBe(1);
  });

  it("RR ≥ 30 and age ≥ 65 are inclusive boundaries", () => {
    expect(comp(evaluateCard(card, ctx([input("rr", 30, "/min", 2)])), "curb.rr").status).toBe("satisfied");
    expect(comp(evaluateCard(card, ctx([input("age_years", 65, "years", 0)])), "curb.age").status).toBe("satisfied");
    expect(comp(evaluateCard(card, ctx([input("age_years", 64, "years", 0)])), "curb.age").status).toBe("not_satisfied");
  });

  it("full house scores 5 and shows the high-severity band without prescribing", () => {
    const r = evaluateCard(
      card,
      ctx([
        input("mental_status", 0, "flag", 2, { text: "GCS 13" }),
        input("urea", 60, "mg/dL", 2),
        input("rr", 34, "/min", 2),
        input("sbp", 84, "mmHg", 2),
        input("age_years", 78, "years", 0),
      ])
    );
    expect(r.total).toBe(5);
    expect(r.interpretation?.text).toMatch(/high severity/i);
    expect(r.interpretation?.text).toMatch(/assess for/i);
    expect(r.interpretation?.text).not.toMatch(/\bgive\b|\bstart\b|\bprescribe\b/i);
  });

  it("a missing criterion is unknown, never zero", () => {
    const r = evaluateCard(card, ctx([input("urea", 20, "mg/dL", 2)]));
    expect(comp(r, "curb.rr").status).toBe("unknown");
    expect(comp(r, "curb.confusion").status).toBe("unknown");
  });
});

describe("qSOFA + SIRS", () => {
  const qsofa = qsofaV1.cards.find((c) => c.cardId === "qsofa")!;
  const sirs = qsofaV1.cards.find((c) => c.cardId === "sirs")!;

  it("qSOFA ≥ 2 shows the escalation prompt, not a diagnosis of sepsis", () => {
    const r = evaluateCard(
      qsofa,
      ctx([
        input("rr", 24, "/min", 1),
        input("sbp", 96, "mmHg", 1),
        input("mental_status", 1, "flag", 1, { text: "alert / oriented" }),
      ])
    );
    expect(r.total).toBe(2);
    expect(r.interpretation?.text).toMatch(/senior review/i);
    expect(r.interpretation?.text).toMatch(/blood cultures before antibiotics/i);
  });

  it("qSOFA boundaries: RR 22 and SBP 100 score, RR 21 and SBP 101 do not", () => {
    expect(comp(evaluateCard(qsofa, ctx([input("rr", 22, "/min", 1)])), "qsofa.rr").status).toBe("satisfied");
    expect(comp(evaluateCard(qsofa, ctx([input("rr", 21, "/min", 1)])), "qsofa.rr").status).toBe("not_satisfied");
    expect(comp(evaluateCard(qsofa, ctx([input("sbp", 100, "mmHg", 1)])), "qsofa.sbp").status).toBe("satisfied");
    expect(comp(evaluateCard(qsofa, ctx([input("sbp", 101, "mmHg", 1)])), "qsofa.sbp").status).toBe("not_satisfied");
  });

  it("SIRS computes present from two vitals and stays not_evaluable on one", () => {
    const two = evaluateCard(sirs, ctx([input("temp", 38.5, "C", 1), input("hr", 104, "/min", 1)]));
    expect(two.classification).toBe("present");
    const one = evaluateCard(sirs, ctx([input("temp", 38.5, "C", 1)]));
    expect(one.classification).toBe("not_evaluable");
  });
});

describe("CHA₂DS₂-VASc", () => {
  const card = cha2ds2VascV1.cards[0];

  it("age bands: ≥ 75 scores 2, 65–74 scores 1, < 65 scores 0", () => {
    expect(comp(evaluateCard(card, ctx([input("age_years", 80, "years", 0)])), "chadsv.age").points).toBe(2);
    expect(comp(evaluateCard(card, ctx([input("age_years", 70, "years", 0)])), "chadsv.age").points).toBe(1);
    expect(comp(evaluateCard(card, ctx([input("age_years", 60, "years", 0)])), "chadsv.age").points).toBe(0);
  });

  it("sex category female scores 1, male scores 0", () => {
    expect(comp(evaluateCard(card, ctx([input("sex", null, null, 0, { text: "female" })])), "chadsv.sex").points).toBe(1);
    expect(comp(evaluateCard(card, ctx([input("sex", null, null, 0, { text: "male" })])), "chadsv.sex").points).toBe(0);
  });

  it("clinician-assessed history criteria come from the recorded assessment", () => {
    const r = evaluateCard(
      card,
      ctx([input("age_years", 68, "years", 0), input("sex", null, null, 0, { text: "female" })], {
        assessedComponents: {
          "chadsv.chf": { satisfied: true, text: "yes", at: "2026-01-10T01:00:00+05:30", by: "u1" },
          "chadsv.stroke": { satisfied: true, text: "yes", at: "2026-01-10T01:00:00+05:30", by: "u1" },
        },
      })
    );
    // age 1 + female 1 + CHF 1 + stroke 2 = 5. The three untouched history criteria are still
    // pending assessment, so this is a provisional total (assumption shown, not stored).
    expect(r.total).toBeNull();
    expect(r.provisionalTotal).toBe(5);
    expect(r.assumedComponentIds).toEqual(
      expect.arrayContaining(["chadsv.htn", "chadsv.dm", "chadsv.vascular"])
    );
    expect(r.interpretation?.text).toMatch(/weighing bleeding risk/i);
  });
});

describe("HAS-BLED", () => {
  const card = hasBledV1.cards[0];

  it("uncontrolled hypertension is SBP > 160, and ≥ 3 shows the caution wording", () => {
    const r = evaluateCard(
      card,
      ctx([input("sbp", 176, "mmHg", 1), input("age_years", 72, "years", 0)], {
        assessedComponents: {
          "hasbled.bleeding": { satisfied: true, text: "yes", at: "2026-01-10T01:00:00+05:30", by: "u1" },
        },
      })
    );
    expect(comp(r, "hasbled.htn").points).toBe(1);
    expect(comp(r, "hasbled.elderly").points).toBe(1);
    // htn + elderly + bleeding = 3; the other history criteria are still pending → provisional.
    expect(r.provisionalTotal).toBe(3);
    expect(r.interpretation?.text).toMatch(/Not a contraindication by itself/i);
  });

  it("SBP exactly 160 does not score", () => {
    expect(comp(evaluateCard(card, ctx([input("sbp", 160, "mmHg", 1)])), "hasbled.htn").status).toBe("not_satisfied");
  });
});

describe("Wells DVT", () => {
  const card = wellsDvtV1.cards[0];

  it("scores 3 for cancer + tenderness + swelling, and the override is 0 points but visible", () => {
    const r = evaluateCard(
      card,
      ctx([], {
        assessedComponents: {
          "wells_dvt.cancer": { satisfied: true, text: "yes", at: "2026-01-10T01:00:00+05:30", by: "u1" },
          "wells_dvt.tenderness": { satisfied: true, text: "yes", at: "2026-01-10T01:00:00+05:30", by: "u1" },
          "wells_dvt.leg_swollen": { satisfied: true, text: "yes", at: "2026-01-10T01:00:00+05:30", by: "u1" },
          "wells_dvt.paralysis": { satisfied: false, text: "no", at: "2026-01-10T01:00:00+05:30", by: "u1" },
          "wells_dvt.bedridden": { satisfied: false, text: "no", at: "2026-01-10T01:00:00+05:30", by: "u1" },
          "wells_dvt.calf_swelling": { satisfied: false, text: "no", at: "2026-01-10T01:00:00+05:30", by: "u1" },
          "wells_dvt.pitting_edema": { satisfied: false, text: "no", at: "2026-01-10T01:00:00+05:30", by: "u1" },
          "wells_dvt.collateral_veins": { satisfied: false, text: "no", at: "2026-01-10T01:00:00+05:30", by: "u1" },
          "wells_dvt.prior_dvt": { satisfied: false, text: "no", at: "2026-01-10T01:00:00+05:30", by: "u1" },
          "wells_dvt.alt_diagnosis": { satisfied: false, text: "no", at: "2026-01-10T01:00:00+05:30", by: "u1" },
        },
      })
    );
    expect(r.total).toBe(3);
    expect(comp(r, "wells_dvt.alt_diagnosis").points).toBe(0);
    expect(r.interpretation?.text).toMatch(/DVT likely/i);
    expect(r.interpretation?.text).toMatch(/marked at least as likely, treat as unlikely/i);
  });
});

describe("Wells PE", () => {
  const card = wellsPeV1.cards[0];

  it("half-point weights sum correctly: tachycardia + immobilisation = 3, which is ≤ 4 (unlikely)", () => {
    const r = evaluateCard(
      card,
      ctx([], {
        assessedComponents: {
          "wells_pe.tachycardia": { satisfied: true, text: "yes", at: "2026-01-10T01:00:00+05:30", by: "u1" },
          "wells_pe.immobilisation": { satisfied: true, text: "yes", at: "2026-01-10T01:00:00+05:30", by: "u1" },
          "wells_pe.dvt_signs": { satisfied: false, text: "no", at: "2026-01-10T01:00:00+05:30", by: "u1" },
          "wells_pe.pe_most_likely": { satisfied: false, text: "no", at: "2026-01-10T01:00:00+05:30", by: "u1" },
          "wells_pe.prior_vte": { satisfied: false, text: "no", at: "2026-01-10T01:00:00+05:30", by: "u1" },
          "wells_pe.haemoptysis": { satisfied: false, text: "no", at: "2026-01-10T01:00:00+05:30", by: "u1" },
          "wells_pe.malignancy": { satisfied: false, text: "no", at: "2026-01-10T01:00:00+05:30", by: "u1" },
        },
      })
    );
    expect(r.total).toBe(3);
    expect(r.interpretation?.text).toMatch(/PE unlikely/i);
  });

  it("PE-most-likely + DVT signs = 6, which is > 4 (likely)", () => {
    const r = evaluateCard(
      card,
      ctx([], {
        assessedComponents: {
          "wells_pe.dvt_signs": { satisfied: true, text: "yes", at: "2026-01-10T01:00:00+05:30", by: "u1" },
          "wells_pe.pe_most_likely": { satisfied: true, text: "yes", at: "2026-01-10T01:00:00+05:30", by: "u1" },
          "wells_pe.tachycardia": { satisfied: false, text: "no", at: "2026-01-10T01:00:00+05:30", by: "u1" },
          "wells_pe.immobilisation": { satisfied: false, text: "no", at: "2026-01-10T01:00:00+05:30", by: "u1" },
          "wells_pe.prior_vte": { satisfied: false, text: "no", at: "2026-01-10T01:00:00+05:30", by: "u1" },
          "wells_pe.haemoptysis": { satisfied: false, text: "no", at: "2026-01-10T01:00:00+05:30", by: "u1" },
          "wells_pe.malignancy": { satisfied: false, text: "no", at: "2026-01-10T01:00:00+05:30", by: "u1" },
        },
      })
    );
    expect(r.total).toBe(6);
    expect(r.interpretation?.text).toMatch(/PE likely/i);
  });
});

describe("DKA severity", () => {
  const card = dkaSeverityV1.cards[0];

  it("pH < 7.00 grades severe even with everything else missing", () => {
    const r = evaluateCard(card, ctx([input("ph", 6.9, null, 1)]));
    expect(r.classification).toBe("severe");
    expect(r.interpretation?.text).toMatch(/Severe DKA/i);
  });

  it("pH 7.15 (in the moderate band) grades moderate, not severe", () => {
    const r = evaluateCard(card, ctx([input("ph", 7.15, null, 1)]));
    expect(r.classification).toBe("moderate");
  });

  it("pH 7.28, bicarbonate 16, alert — the fallback mild grade", () => {
    const r = evaluateCard(
      card,
      ctx([input("ph", 7.28, null, 1), input("bicarbonate", 16, null, 1)], {
        assessedComponents: {
          "dka.consciousness_severe": { satisfied: false, text: "no", at: "2026-01-10T01:00:00+05:30", by: "u1" },
          "dka.consciousness_moderate": { satisfied: false, text: "no", at: "2026-01-10T01:00:00+05:30", by: "u1" },
        },
      })
    );
    expect(r.classification).toBe("mild");
    expect(r.interpretation?.text).toMatch(/Mild DKA/i);
  });

  it("stupor/coma alone grades severe even with a mild-range pH", () => {
    const r = evaluateCard(
      card,
      ctx([input("ph", 7.28, null, 1)], {
        assessedComponents: {
          "dka.consciousness_severe": { satisfied: true, text: "yes", at: "2026-01-10T01:00:00+05:30", by: "u1" },
        },
      })
    );
    expect(r.classification).toBe("severe");
  });
});
