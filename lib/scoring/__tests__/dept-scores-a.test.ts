import { describe, it, expect } from "vitest";
import { evaluateCard, type EvaluateContext } from "../engine";
import { validatePathwayDefinition } from "../schema";
import { detectTriggers } from "../triggers";
import type { CardDefinition, EngineInput } from "../types";
import { ctx, input } from "./helpers";
import { masccV1 } from "../definitions/mascc.v1";
import { scortenV1 } from "../definitions/scorten.v1";
import { absiV1 } from "../definitions/absi.v1";

const comp = (r: ReturnType<typeof evaluateCard>, id: string) => r.components.find((x) => x.componentId === id)!;
const assessed = (
  m: Record<string, { satisfied: boolean; points?: number }>
): EvaluateContext["assessedComponents"] =>
  Object.fromEntries(Object.entries(m).map(([k, v]) => [k, { ...v, text: "x", at: "x", by: "u" }]));
const sex = (s: string) => input("sex", null, null, 0, { text: s });

describe("dept scores A — definitions validate and stay draft", () => {
  for (const def of [masccV1, scortenV1, absiV1]) {
    it(def.pathwayId, () => {
      expect(validatePathwayDefinition(def)).toEqual({ ok: true, issues: [] });
      expect(def.status).toBe("draft");
      expect(def.clinicalOwner).toMatch(/PENDING CLINICIAN REVIEW/);
    });
  }
});

// ── MASCC ──────────────────────────────────────────────────────────────────
describe("MASCC", () => {
  const card: CardDefinition = masccV1.cards[0];
  const best = assessed({
    "mascc.burden": { satisfied: true, points: 5 },
    "mascc.no_copd": { satisfied: true, points: 4 },
    "mascc.tumour_fungal": { satisfied: true, points: 4 },
    "mascc.no_dehydration": { satisfied: true, points: 3 },
    "mascc.outpatient": { satisfied: true, points: 3 },
  });
  const run = (sbp: number, age: number, a = best) =>
    evaluateCard(card, ctx([input("sbp", sbp, "mmHg", 1), input("age_years", age, "years", 0)], { assessedComponents: a }));

  it("all best → 26, low-risk band that still reads as a prompt", () => {
    const r = run(120, 45);
    expect(r.total).toBe(26);
    expect(r.interpretation?.text).toMatch(/low risk on MASCC — still a prompt, not a decision about outpatient care/);
    expect(r.interpretation?.tone).toBe("neutral");
  });

  it("all worst → 0, higher-risk band", () => {
    const r = run(85, 70, assessed({
      "mascc.burden": { satisfied: false },
      "mascc.no_copd": { satisfied: false },
      "mascc.tumour_fungal": { satisfied: false },
      "mascc.no_dehydration": { satisfied: false },
      "mascc.outpatient": { satisfied: false },
    }));
    expect(r.total).toBe(0);
    expect(r.interpretation?.tone).toBe("attention");
  });

  it("threshold 20 vs 21", () => {
    // moderate burden 3 + SBP 5 + no COPD 4 + tumour 4 + no dehydration 3 + inpatient 0 + age < 60 2 = 21
    const a21 = assessed({
      "mascc.burden": { satisfied: true, points: 3 },
      "mascc.no_copd": { satisfied: true, points: 4 },
      "mascc.tumour_fungal": { satisfied: true, points: 4 },
      "mascc.no_dehydration": { satisfied: true, points: 3 },
      "mascc.outpatient": { satisfied: false },
    });
    expect(run(120, 59, a21).total).toBe(21);
    expect(run(120, 59, a21).interpretation?.tone).toBe("neutral");
    const a20 = { ...best!, "mascc.no_copd": { satisfied: false, text: "x", at: "x", by: "u" }, "mascc.burden": { satisfied: true, points: 3, text: "x", at: "x", by: "u" } };
    // 3 + 5 + 0 + 4 + 3 + 3 + 2 = 20
    expect(run(120, 59, a20).total).toBe(20);
    expect(run(120, 59, a20).interpretation?.text).toMatch(/higher risk/);
  });

  it("SBP 90 scores 0, 91 scores 5; lowest reading in the window is used", () => {
    expect(comp(run(90, 45), "mascc.no_hypotension").points).toBe(0);
    expect(comp(run(91, 45), "mascc.no_hypotension").points).toBe(5);
    const r = evaluateCard(card, ctx([input("sbp", 130, "mmHg", 1), input("sbp", 88, "mmHg", 3), input("age_years", 45, "years", 0)], { assessedComponents: best }));
    expect(comp(r, "mascc.no_hypotension").points).toBe(0);
  });

  it("age 59 → 2, 60 → 0", () => {
    expect(comp(run(120, 59), "mascc.age").points).toBe(2);
    expect(comp(run(120, 60), "mascc.age").points).toBe(0);
  });

  it("missing SBP keeps the total null (never 0)", () => {
    const r = evaluateCard(card, ctx([input("age_years", 45, "years", 0)], { assessedComponents: best }));
    expect(r.total).toBeNull();
    expect(r.provisionalTotal).toBeNull();
  });

  it("assessments pending → provisional total from objective items only", () => {
    const r = evaluateCard(card, ctx([input("sbp", 120, "mmHg", 1), input("age_years", 45, "years", 0)]));
    expect(r.total).toBeNull();
    expect(r.provisionalTotal).toBe(7);
    expect(r.assumedComponentIds).toHaveLength(5);
  });
});

// ── SCORTEN ────────────────────────────────────────────────────────────────
describe("SCORTEN", () => {
  const card: CardDefinition = scortenV1.cards[0];
  const labs = (o: Partial<Record<"age" | "hr" | "urea" | "bicarb" | "glucose", number>> = {}): EngineInput[] => [
    input("age_years", o.age ?? 30, "years", 0),
    input("hr", o.hr ?? 90, "/min", 2),
    input("urea", o.urea ?? 30, "mg/dL", 2),
    input("bicarbonate", o.bicarb ?? 24, null, 2),
    input("glucose", o.glucose ?? 110, "mg/dL", 2),
  ];
  const none = assessed({ "scorten.malignancy": { satisfied: false }, "scorten.bsa": { satisfied: false } });
  const run = (o = {}, a = none) => evaluateCard(card, ctx(labs(o), { assessedComponents: a }));

  it("all best → 0, 3.2 % band", () => {
    const r = run();
    expect(r.total).toBe(0);
    expect(r.interpretation?.text).toMatch(/3\.2 %/);
  });

  it("all worst → 7, ≥ 5 band (90 %)", () => {
    const r = run({ age: 65, hr: 130, urea: 90, bicarb: 15, glucose: 300 }, assessed({
      "scorten.malignancy": { satisfied: true },
      "scorten.bsa": { satisfied: true },
    }));
    expect(r.total).toBe(7);
    expect(r.interpretation?.text).toMatch(/90 %/);
  });

  it("band text for 2, 3 and 4", () => {
    expect(run({ age: 40, hr: 120 }).interpretation?.text).toMatch(/12\.1 %/);
    expect(run({ age: 40, hr: 120, bicarb: 19 }).interpretation?.text).toMatch(/35\.3 %/);
    expect(run({ age: 40, hr: 120, bicarb: 19, glucose: 300 }).interpretation?.text).toMatch(/58\.3 %/);
  });

  it("boundaries: age 39/40, HR 119/120, urea 60.06/60.1, bicarbonate 20/19.9, glucose 14 mmol/L exactly / above", () => {
    expect(comp(run({ age: 39 }), "scorten.age").points).toBe(0);
    expect(comp(run({ age: 40 }), "scorten.age").points).toBe(1);
    expect(comp(run({ hr: 119 }), "scorten.hr").points).toBe(0);
    expect(comp(run({ hr: 120 }), "scorten.hr").points).toBe(1);
    expect(comp(run({ urea: 60.06 }), "scorten.urea").points).toBe(0);
    expect(comp(run({ urea: 60.1 }), "scorten.urea").points).toBe(1);
    expect(comp(run({ bicarb: 20 }), "scorten.bicarbonate").points).toBe(0);
    expect(comp(run({ bicarb: 19.9 }), "scorten.bicarbonate").points).toBe(1);
    expect(comp(run({ glucose: 14 * 18.016 }), "scorten.glucose").points).toBe(0);
    expect(comp(run({ glucose: 253 }), "scorten.glucose").points).toBe(1);
  });

  it("a lab after the first 24 hours is outside the window → total null", () => {
    const inputs = labs().filter((i) => i.key !== "urea").concat(input("urea", 90, "mg/dL", 30));
    const r = evaluateCard(card, ctx(inputs, { assessedComponents: none }));
    expect(comp(r, "scorten.urea").missingReason).toBe("outside_time_window");
    expect(r.total).toBeNull();
  });

  it("missing bicarbonate keeps the total null; pending assessments give a provisional total", () => {
    expect(evaluateCard(card, ctx(labs().filter((i) => i.key !== "bicarbonate"), { assessedComponents: none })).total).toBeNull();
    const p = evaluateCard(card, ctx(labs({ age: 50 })));
    expect(p.total).toBeNull();
    expect(p.provisionalTotal).toBe(1);
  });

  it("trigger: bare 'TEN' is not a pattern, so hypertension never fires it", () => {
    const active = { ...scortenV1, status: "active" as const };
    expect(detectTriggers({ text: "Stevens-Johnson syndrome" }, [active])).toHaveLength(1);
    expect(detectTriggers({ text: "Essential hypertension" }, [active])).toHaveLength(0);
  });
});

// ── ABSI ───────────────────────────────────────────────────────────────────
describe("ABSI", () => {
  const card: CardDefinition = absiV1.cards[0];
  const a = (inh: boolean, ft: boolean, tbsa: number) =>
    assessed({
      "absi.inhalation": { satisfied: inh },
      "absi.full_thickness": { satisfied: ft },
      "absi.tbsa": { satisfied: true, points: tbsa },
    });
  const run = (s: string, age: number, as = a(false, false, 1)) =>
    evaluateCard(card, ctx([sex(s), input("age_years", age, "years", 0)], { assessedComponents: as }));

  it("all best → 2 (male, age ≤ 20, TBSA 1–10 %), very-low band", () => {
    const r = run("male", 18);
    expect(r.total).toBe(2);
    expect(r.interpretation?.text).toMatch(/very low threat.*≥ 99 %/);
  });

  it("all worst → 18, maximum band", () => {
    const r = run("female", 85, a(true, true, 10));
    expect(r.total).toBe(18);
    expect(r.interpretation?.text).toMatch(/maximum threat.*≤ 10 %/);
  });

  it("age band boundaries 20→1, 21→2, 40→2, 41→3, 60→3, 61→4, 80→4, 81→5", () => {
    for (const [age, p] of [[20, 1], [21, 2], [40, 2], [41, 3], [60, 3], [61, 4], [80, 4], [81, 5]] as const) {
      expect(comp(run("male", age), "absi.age").points).toBe(p);
    }
  });

  it("female sex scores 1; band texts at 6 and 8", () => {
    expect(comp(run("female", 30), "absi.sex").points).toBe(1);
    // female 1 + age 41–60 3 + TBSA 2 = 6
    expect(run("female", 50, a(false, false, 2)).interpretation?.text).toMatch(/moderately severe.*80–90 %/);
    // 1 + 3 + 1 + 1 + 2 = 8
    expect(run("female", 50, a(true, true, 2)).interpretation?.text).toMatch(/serious.*50–70 %/);
  });

  it("missing sex keeps the total null; pending TBSA gives only a provisional total", () => {
    const r = evaluateCard(card, ctx([input("age_years", 30, "years", 0)], { assessedComponents: a(false, false, 3) }));
    expect(r.total).toBeNull();
    const p = evaluateCard(card, ctx([sex("male"), input("age_years", 30, "years", 0)]));
    expect(p.total).toBeNull();
    expect(p.provisionalTotal).toBe(2);
    expect(p.assumedComponentIds).toContain("absi.tbsa");
  });

  it("trigger: burns fire, heartburn does not", () => {
    const active = { ...absiV1, status: "active" as const };
    expect(detectTriggers({ text: "Flame burns 30% TBSA" }, [active])).toHaveLength(1);
    expect(detectTriggers({ text: "Heartburn" }, [active])).toHaveLength(0);
  });
});
