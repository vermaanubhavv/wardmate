import { describe, it, expect } from "vitest";
import { evaluateCard, type EvaluateContext } from "../engine";
import { validatePathwayDefinition } from "../schema";
import type { CardDefinition } from "../types";
import { ctx, input } from "./helpers";
import { mannheimPeritonitisIndexV1 } from "../definitions/mannheim-peritonitis-index.v1";
import { lrinecV1 } from "../definitions/lrinec.v1";
import { heartScoreV1 } from "../definitions/heart-score.v1";
import { ciwaArV1 } from "../definitions/ciwa-ar.v1";
import { childPughV1 } from "../definitions/child-pugh.v1";
import { kdigoAkiV1 } from "../definitions/kdigo-aki.v1";

const cardOf = (def: { cards: CardDefinition[] }, id: string): CardDefinition =>
  def.cards.find((c) => c.cardId === id)!;
const comp = (r: ReturnType<typeof evaluateCard>, id: string) => {
  const c = r.components.find((x) => x.componentId === id);
  if (!c) throw new Error(`no ${id}: ${r.components.map((x) => x.componentId)}`);
  return c;
};
const assessed = (
  m: Record<string, { satisfied: boolean; points?: number }>
): EvaluateContext["assessedComponents"] =>
  Object.fromEntries(Object.entries(m).map(([k, v]) => [k, { ...v, text: "x", at: "x", by: "u" }]));

const ALL = [mannheimPeritonitisIndexV1, lrinecV1, heartScoreV1, ciwaArV1, childPughV1, kdigoAkiV1];

describe("batch 2 — every definition validates", () => {
  for (const def of ALL) {
    it(`${def.pathwayId}`, () => {
      expect(validatePathwayDefinition(def)).toEqual({ ok: true, issues: [] });
    });
    it(`${def.pathwayId} is active, signed off, with a scheduled re-review`, () => {
      expect(def.status).toBe("active");
      expect(def.clinicalOwner).toMatch(/signed off/i);
      expect(def.clinicalOwner).toMatch(/review due/i);
      expect(def.reviewDueAt).toBeTruthy();
    });
  }
});

// ── LRINEC safeguard — the non-negotiable one ───────────────────────────────
describe("LRINEC low-score safeguard", () => {
  const card = cardOf(lrinecV1, "lrinec");

  it("EVERY interpretation band is 'attention' — there is no reassuring/green state", () => {
    expect(card.interpretationBands.every((b) => b.tone === "attention")).toBe(true);
  });

  it("a LOW score (< 6) reads as 'does not exclude', never 'ruled out' / 'low risk'", () => {
    const r = evaluateCard(
      card,
      ctx([
        input("crp", 40, null, 2),
        input("wbc", 9000, "cells/mm3", 2),
        input("hb", 14, null, 2),
        input("sodium", 140, null, 2),
        input("creatinine", 0.9, "mg/dL", 2),
        input("glucose", 100, "mg/dL", 2),
      ])
    );
    expect(r.total).toBe(0);
    expect(r.interpretation?.tone).toBe("attention");
    expect(r.interpretation?.text).toMatch(/does not exclude/i);
    expect(r.interpretation?.text).not.toMatch(/\b(low risk|rule[ds]? out|excluded|reassur)/i);
  });

  it("the pathway carries an immediate senior-review task independent of the score", () => {
    const t = lrinecV1.tasks.find((x) => /senior surgical review/i.test(x.action));
    expect(t).toBeTruthy();
    expect(t!.action).toMatch(/do not wait/i);
  });
});

// ── HEART score ────────────────────────────────────────────────────────────
describe("HEART score", () => {
  const card = cardOf(heartScoreV1, "heart");
  it("age bands: <45 → 0, 45–64 → 1, ≥65 → 2", () => {
    expect(comp(evaluateCard(card, ctx([input("age_years", 44, "years", 0)])), "heart.age").points).toBe(0);
    expect(comp(evaluateCard(card, ctx([input("age_years", 45, "years", 0)])), "heart.age").points).toBe(1);
    expect(comp(evaluateCard(card, ctx([input("age_years", 65, "years", 0)])), "heart.age").points).toBe(2);
  });
  it("full high score = 10, high-risk band", () => {
    const r = evaluateCard(
      card,
      ctx([input("age_years", 70, "years", 0)], {
        assessedComponents: assessed({
          "heart.history": { satisfied: true, points: 2 },
          "heart.ecg": { satisfied: true, points: 2 },
          "heart.risk_factors": { satisfied: true, points: 2 },
          "heart.troponin": { satisfied: true, points: 2 },
        }),
      })
    );
    expect(r.total).toBe(10);
    expect(r.interpretation?.text).toMatch(/high risk/i);
  });
});

// ── Child-Pugh — the score has a FLOOR of 5, not 0 ─────────────────────────
describe("Child-Pugh", () => {
  const card = cardOf(childPughV1, "child_pugh");
  it("all criteria normal → 5 (Class A), never 0", () => {
    const r = evaluateCard(
      card,
      ctx([input("bilirubin", 1, null, 2), input("albumin", 4, null, 2), input("inr", 1.1, null, 2)], {
        assessedComponents: assessed({
          "child.ascites": { satisfied: true, points: 1 },
          "child.encephalopathy": { satisfied: true, points: 1 },
        }),
      })
    );
    expect(r.total).toBe(5);
    expect(r.interpretation?.text).toMatch(/Child-Pugh A/);
  });
  it("all criteria worst → 15 (Class C)", () => {
    const r = evaluateCard(
      card,
      ctx([input("bilirubin", 5, null, 2), input("albumin", 2, null, 2), input("inr", 3, null, 2)], {
        assessedComponents: assessed({
          "child.ascites": { satisfied: true, points: 3 },
          "child.encephalopathy": { satisfied: true, points: 3 },
        }),
      })
    );
    expect(r.total).toBe(15);
    expect(r.interpretation?.text).toMatch(/Child-Pugh C/);
  });
  it("bilirubin band boundaries: 1.9 → 1, 2 → 2, 3.1 → 3", () => {
    for (const [v, p] of [[1.9, 1], [2, 2], [3.1, 3]] as const) {
      expect(comp(evaluateCard(card, ctx([input("bilirubin", v, null, 2)])), "child.bilirubin").points).toBe(p);
    }
  });
});

// ── KDIGO — max_points, the stage is the WORST criterion not the sum ───────
describe("KDIGO AKI stage", () => {
  const card = cardOf(kdigoAkiV1, "kdigo_aki");
  it("creatinine 2.0–2.9× AND on RRT → stage 3, not 5", () => {
    const r = evaluateCard(
      card,
      ctx([], {
        assessedComponents: assessed({
          "kdigo.creatinine_ratio": { satisfied: true, points: 2 },
          "kdigo.rrt": { satisfied: true, points: 3 },
        }),
      })
    );
    expect(r.total).toBe(3);
  });
  it("only a stage-1 creatinine change → stage 1", () => {
    const r = evaluateCard(
      card,
      ctx([], {
        assessedComponents: assessed({ "kdigo.creatinine_ratio": { satisfied: true, points: 1 } }),
      })
    );
    expect(r.total).toBe(1);
    expect(r.interpretation?.text).toMatch(/Stage 1/);
  });
  it("absolute creatinine ≥ 4.0 auto-scores stage 3", () => {
    const r = evaluateCard(
      card,
      ctx([input("creatinine", 4.2, "mg/dL", 2)], {
        assessedComponents: assessed({ "kdigo.creatinine_ratio": { satisfied: false } }),
      })
    );
    expect(comp(r, "kdigo.creatinine_abs").points).toBe(3);
    expect(r.total).toBe(3);
  });
});

// ── MPI ──────────────────────────────────────────────────────────────────
describe("Mannheim Peritonitis Index", () => {
  const card = cardOf(mannheimPeritonitisIndexV1, "mpi");
  it("age > 50 (5) + female (5) with operative taps pending → provisional 10", () => {
    const r = evaluateCard(card, ctx([input("age_years", 60, "years", 0), input("sex", null, null, 0, { text: "female" })]));
    expect(r.total).toBeNull();
    expect(r.provisionalTotal).toBe(10);
  });
  it("faeculent exudate scores 12", () => {
    const r = evaluateCard(
      card,
      ctx([input("age_years", 40, "years", 0), input("sex", null, null, 0, { text: "male" })], {
        assessedComponents: assessed({ "mpi.exudate": { satisfied: true, points: 12 } }),
      })
    );
    expect(comp(r, "mpi.exudate").points).toBe(12);
  });
});

// ── CIWA-Ar ─────────────────────────────────────────────────────────────
describe("CIWA-Ar", () => {
  const card = cardOf(ciwaArV1, "ciwa_ar");
  it("all items minimal → 0, minimal-withdrawal band", () => {
    const r = evaluateCard(
      card,
      ctx([], { assessedComponents: assessed(Object.fromEntries(card.inputs.map((i) => [i.componentId, { satisfied: false }]))) })
    );
    expect(r.total).toBe(0);
    expect(r.interpretation?.text).toMatch(/minimal withdrawal/i);
  });
  it("crosses into the ≥ 15 band (seizure / DT risk)", () => {
    const r = evaluateCard(
      card,
      ctx([], {
        assessedComponents: assessed({
          ...Object.fromEntries(card.inputs.map((i) => [i.componentId, { satisfied: false }])),
          "ciwa.tremor": { satisfied: true, points: 7 },
          "ciwa.sweats": { satisfied: true, points: 7 },
          "ciwa.agitation": { satisfied: true, points: 4 },
        }),
      })
    );
    expect(r.total).toBe(18);
    expect(r.interpretation?.text).toMatch(/seizures|delirium tremens/i);
  });
});
