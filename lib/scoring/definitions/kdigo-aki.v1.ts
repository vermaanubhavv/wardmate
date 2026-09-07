/**
 * Acute kidney injury — pathway definition v1.0.0. ONE grading: KDIGO AKI stage (1–3).
 *
 * The stage is the WORST of the creatinine criterion, the urine-output criterion and dialysis
 * (`max_points`), never their sum. The creatinine-vs-baseline comparison and the urine-output
 * assessment are clinician taps — the app does not hold a reliable pre-morbid baseline. Absolute
 * creatinine ≥ 4.0 mg/dL (with a recent rise) fills from the renal profile.
 *
 * STATUS: draft — not yet offered to any unit pending clinician review. Source: KDIGO Clinical
 * Practice Guideline for Acute Kidney Injury, Kidney Int Suppl 2012;2:1–138.
 */

import type { CardDefinition, PathwayDefinition, TimeWindow } from "../types";

const W: TimeWindow = { anchor: "admission", startHours: -48, label: "over the last 48 h – 7 days" };

const kdigoCard: CardDefinition = {
  cardId: "kdigo_aki",
  title: "KDIGO AKI stage",
  shortName: "KDIGO",
  citation:
    "KDIGO AKI Guideline 2012, Kidney Int Suppl 2012;2:1–138. Stage = worst of: creatinine (1.5–1.9× baseline or ≥ 0.3 mg/dL rise in 48 h = 1; 2.0–2.9× = 2; ≥ 3× or ≥ 4.0 mg/dL or RRT = 3) and urine output (< 0.5 mL/kg/h for 6–12 h = 1; ≥ 12 h = 2; < 0.3 mL/kg/h ≥ 24 h or anuria ≥ 12 h = 3). Stage guides monitoring, nephrotoxin review, fluid assessment and referral — it is not a dialysis instruction.",
  type: "calculator",
  timingLabel: "re-stage with each creatinine / urine-output review",
  calculation: { kind: "max_points" },
  recomputeOn: ["new_lab", "new_observation", "deterioration", "manual"],
  interpretationBands: [
    { min: 0, max: 0, text: "Not stageable / no AKI criterion met on what is recorded. Confirm the creatinine trend against the patient's baseline.", tone: "neutral" },
    { min: 1, max: 1, text: "KDIGO Stage 1. Review and stop nephrotoxins, assess volume status, treat the cause, monitor creatinine and urine output at least daily.", tone: "attention" },
    { min: 2, max: 2, text: "KDIGO Stage 2. As Stage 1 plus closer monitoring, review all drug doses for renal clearance, and involve the medical / nephrology team.", tone: "attention" },
    { min: 3, max: 3, text: "KDIGO Stage 3. Nephrology review; assess for indications for renal replacement therapy (refractory fluid overload, hyperkalaemia, acidosis, uraemic complications).", tone: "attention" },
  ],
  inputs: [
    {
      componentId: "kdigo.creatinine_ratio",
      label: "Creatinine vs baseline",
      inputKey: "kdigo_creatinine_ratio",
      canonicalUnit: null,
      window: W,
      selector: "worst",
      points: 3,
      rule: { op: "present" },
      required: true,
      noAutoTask: true,
      clinicianAssessed: true,
      assess: {
        question: "Serum creatinine compared with the patient's baseline?",
        recordLabel: "Creatinine vs baseline (KDIGO)",
        options: [
          { label: "< 1.5× baseline, no ≥ 0.3 rise", record: "creatinine < 1.5× baseline and no ≥ 0.3 mg/dL rise", satisfied: false, normal: true },
          { label: "1.5–1.9× baseline, or ≥ 0.3 mg/dL rise in 48 h", record: "creatinine 1.5–1.9× baseline, or ≥ 0.3 mg/dL rise within 48 h", satisfied: true, points: 1 },
          { label: "2.0–2.9× baseline", record: "creatinine 2.0–2.9× baseline", satisfied: true, points: 2 },
          { label: "≥ 3× baseline, or ≥ 4.0 mg/dL", record: "creatinine ≥ 3× baseline or ≥ 4.0 mg/dL with an acute rise", satisfied: true, points: 3 },
        ],
      },
    },
    {
      componentId: "kdigo.creatinine_abs",
      label: "Creatinine ≥ 4.0 mg/dL (auto)",
      inputKey: "creatinine",
      canonicalUnit: "mg/dL",
      window: W,
      selector: "highest",
      points: 3,
      rule: { op: "gte", value: 4.0 },
      required: false,
      noAutoTask: true,
    },
    {
      componentId: "kdigo.urine_output",
      label: "Urine output",
      inputKey: "kdigo_urine_output",
      canonicalUnit: null,
      window: W,
      selector: "worst",
      points: 3,
      rule: { op: "present" },
      required: false,
      noAutoTask: true,
      clinicianAssessed: true,
      assess: {
        question: "Urine output (weight-adjusted, over a sustained period)?",
        recordLabel: "Urine output (KDIGO)",
        options: [
          { label: "≥ 0.5 mL/kg/h", record: "urine output ≥ 0.5 mL/kg/h", satisfied: false, normal: true },
          { label: "< 0.5 mL/kg/h for 6–12 h", record: "urine output < 0.5 mL/kg/h for 6–12 h", satisfied: true, points: 1 },
          { label: "< 0.5 mL/kg/h for ≥ 12 h", record: "urine output < 0.5 mL/kg/h for ≥ 12 h", satisfied: true, points: 2 },
          { label: "< 0.3 mL/kg/h ≥ 24 h, or anuria ≥ 12 h", record: "urine output < 0.3 mL/kg/h for ≥ 24 h, or anuria ≥ 12 h", satisfied: true, points: 3 },
        ],
      },
    },
    {
      componentId: "kdigo.rrt",
      label: "Renal replacement therapy started for this AKI",
      inputKey: "kdigo_rrt",
      canonicalUnit: null,
      window: W,
      selector: "first",
      points: 3,
      rule: { op: "present" },
      required: false,
      noAutoTask: true,
      clinicianAssessed: true,
      assess: {
        question: "Has renal replacement therapy (dialysis) been started for this AKI?",
        recordLabel: "RRT for AKI",
        options: [
          { label: "No", record: "no renal replacement therapy", satisfied: false, normal: true },
          { label: "Yes", record: "renal replacement therapy started for this AKI", satisfied: true, points: 3 },
        ],
      },
    },
  ],
};

export const kdigoAkiV1: PathwayDefinition = {
  pathwayId: "kdigo_aki",
  pathwayVersion: "1.0.0",
  title: "Acute kidney injury — stage",
  status: "draft",
  clinicalOwner: "PENDING — awaiting single-clinician review (Internal Medicine / Nephrology).",
  sourceReferences: [
    { label: "KDIGO AKI Guideline 2012", citation: "KDIGO Clinical Practice Guideline for Acute Kidney Injury. Kidney Int Suppl 2012;2:1–138." },
  ],
  reviewDueAt: "2027-09-30",
  diagnosisTriggers: {
    codes: ["N17", "N17.9", "N17.0", "N17.1", "N17.2"],
    textPatterns: ["acute kidney injury", "aki", "acute renal failure", "arf", "rising creatinine", "acute on chronic kidney disease", "prerenal aki", "atn", "acute tubular necrosis"],
    excludePatterns: ["chronic kidney disease stable", "ckd stage", "end stage renal disease on maintenance", "esrd on mhd", "aki resolved", "recovering renal function"],
  },
  eligibility: { minAgeYears: 16, notes: ["Staging needs the creatinine trend against the patient's own baseline — a clinician judgement, entered on the card. Acute-on-chronic AKI is staged the same way against the pre-admission baseline."] },
  exclusions: ["Stable CKD or ESRD on maintenance dialysis without a new acute change."],
  cards: [kdigoCard],
  tasks: [
    {
      key: "kdigo_workup",
      cardId: "kdigo_aki",
      componentId: null,
      action: "Send renal profile with electrolytes, urine dipstick and microscopy; chart strict fluid balance and hourly urine output; review the drug chart for nephrotoxins and renally-cleared drugs",
      reason: "Creatinine and urine output define the KDIGO stage; nephrotoxin review and volume assessment are the first management steps at every stage.",
      priority: "urgent",
      responsibleRole: "resident",
      institutionalToggle: null,
      linkKey: "creatinine",
    },
  ],
  checkpoints: [
    { key: "kdigo_restage_12h", dueFrom: "admission", dueAtHours: 12, label: "Re-stage after the next creatinine / urine-output review", recomputeCards: ["kdigo_aki"] },
  ],
  recomputePolicy: ["new_lab", "new_observation", "deterioration", "scheduled_checkpoint", "manual"],
  institutionalToggles: {},
};
