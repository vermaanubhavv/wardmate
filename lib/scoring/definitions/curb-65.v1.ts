/**
 * Community-acquired pneumonia — pathway definition v1.0.0. ONE score: CURB-65.
 *
 * One point each for Confusion, Urea > 7 mmol/L (≈ 42 mg/dL, or BUN > 19 mg/dL), Respiratory
 * rate ≥ 30/min, low Blood pressure (SBP < 90 or DBP ≤ 60 mmHg), and age ≥ 65. 0–1 → consider
 * outpatient management; 2 → short inpatient / supervised outpatient; 3–5 → manage as severe,
 * assess for critical care.
 *
 * STATUS: draft — clinical governance sign-off pending. First internal-medicine score, added
 * with the specialty pack (docs/specialty-packs.md §8). Sources: BTS/NICE CAP guidance;
 * Lim WS et al., Thorax 2003;58:377–82.
 */

import type { CardDefinition, PathwayDefinition, TimeWindow } from "../types";

const W: TimeWindow = { anchor: "admission", startHours: -12, endHours: 24, label: "at presentation" };

// Every CURB-65 criterion is objective — a recorded observation or the patient's age — so this
// card has no clinician-assessed yes/no components. New confusion is read from the mental-status
// flag the adapter derives from the round ("patient disoriented", "GCS 13").

const curbCard: CardDefinition = {
  cardId: "curb_65",
  title: "CURB-65 — pneumonia severity",
  shortName: "CURB-65",
  citation:
    "CURB-65 — Lim WS et al., Thorax 2003;58:377–82; BTS/NICE community-acquired pneumonia guidance. 0–1 low severity (consider home treatment); 2 moderate (short inpatient stay or supervised outpatient); 3–5 high severity (manage in hospital, assess for critical care). A clinical adjunct — always combine with oxygenation, comorbidity, social circumstances and judgement.",
  type: "calculator",
  timingLabel: "at presentation",
  calculation: { kind: "sum_points" },
  recomputeOn: ["new_lab", "new_observation", "manual"],
  interpretationBands: [
    { min: 0, max: 1, text: "CURB-65 0–1 — low severity. Outpatient management may be appropriate if oxygenation, comorbidity and social circumstances allow.", tone: "neutral" },
    { min: 2, max: 2, text: "CURB-65 2 — moderate severity. Consider a short inpatient stay or closely supervised outpatient treatment.", tone: "attention" },
    { min: 3, max: 5, text: "CURB-65 3–5 — high severity. Manage in hospital; assess for high-dependency or critical care.", tone: "attention" },
  ],
  inputs: [
    {
      componentId: "curb.confusion",
      label: "New confusion (disorientation in person, place or time)",
      inputKey: "mental_status",
      canonicalUnit: null,
      window: W,
      selector: "worst",
      points: 1,
      // The adapter records mental status as a flag: 0 = impaired, 1 = intact.
      rule: { op: "eq", value: 0 },
      required: true,
    },
    {
      componentId: "curb.urea",
      label: "Urea > 42 mg/dL (> 7 mmol/L)",
      inputKey: "urea",
      canonicalUnit: "mg/dL",
      window: W,
      selector: "highest",
      points: 1,
      rule: { op: "gt", value: 42 },
      required: true,
    },
    {
      componentId: "curb.rr",
      label: "Respiratory rate ≥ 30 /min",
      inputKey: "rr",
      canonicalUnit: "/min",
      window: W,
      selector: "highest",
      points: 1,
      rule: { op: "gte", value: 30 },
      required: true,
    },
    {
      componentId: "curb.bp",
      label: "Systolic BP < 90 mmHg (or diastolic ≤ 60)",
      inputKey: "sbp",
      canonicalUnit: "mmHg",
      window: W,
      selector: "lowest",
      points: 1,
      rule: { op: "lt", value: 90 },
      required: true,
    },
    {
      componentId: "curb.age",
      label: "Age ≥ 65 years",
      inputKey: "age_years",
      canonicalUnit: null,
      window: W,
      selector: "admission",
      points: 1,
      rule: { op: "gte", value: 65 },
      required: true,
      noAutoTask: true,
    },
  ],
};

export const curb65V1: PathwayDefinition = {
  pathwayId: "curb_65",
  pathwayVersion: "1.0.0",
  title: "Community-acquired pneumonia",
  // Activated for the internal-medicine pilot on the product owner's direction (2026-09-04).
  // Still triple-gated at runtime (NEXT_PUBLIC_SCORING_ENGINE + a per-ward ward_scoring_engine
  // row + the pack's scoringKeys). Formal governance review is still due — see reviewDueAt.
  status: "active",
  clinicalOwner: "Internal Medicine unit (pilot activation 2026-09-04; formal review pending)",
  sourceReferences: [
    { label: "Lim WS et al., Thorax 2003", citation: "Defining community acquired pneumonia severity on presentation to hospital. Thorax 2003;58:377–82." },
    { label: "BTS/NICE CAP guidance", citation: "NICE NG138 / BTS community-acquired pneumonia in adults." },
  ],
  reviewDueAt: "2027-09-01",
  diagnosisTriggers: {
    codes: ["J13", "J15", "J18", "J18.9"],
    textPatterns: [
      "community-acquired pneumonia",
      "community acquired pneumonia",
      "cap ",
      "lobar pneumonia",
      "bronchopneumonia",
      "pneumonia",
      "lower respiratory tract infection",
      "lrti",
    ],
    excludePatterns: [
      "hospital-acquired pneumonia",
      "ventilator-associated pneumonia",
      "aspiration pneumonia",
      "pneumonitis",
    ],
  },
  eligibility: { minAgeYears: 16, notes: ["Adult community-acquired pneumonia only. Not validated for hospital-acquired or aspiration pneumonia, or for the immunosuppressed."] },
  exclusions: ["Hospital-acquired / ventilator-associated pneumonia.", "Severe immunosuppression — interpret with specialist input."],
  cards: [curbCard],
  tasks: [
    {
      key: "curb_urea",
      cardId: "curb_65",
      componentId: "curb.urea",
      action: "Send urea / renal function",
      reason: "Urea is one of the five CURB-65 criteria.",
      priority: "soon",
      responsibleRole: "resident",
      institutionalToggle: null,
      linkKey: "urea",
    },
    {
      key: "curb_obs",
      cardId: "curb_65",
      componentId: null,
      action: "Chart a full set of observations including respiratory rate and blood pressure",
      reason: "Respiratory rate, blood pressure and mental state are three of the five CURB-65 criteria.",
      priority: "soon",
      responsibleRole: "nursing",
      institutionalToggle: null,
    },
  ],
  checkpoints: [
    { key: "curb_review_24h", dueFrom: "admission", dueAtHours: 24, label: "Reassess severity and response at 24 hours", recomputeCards: ["curb_65"] },
  ],
  recomputePolicy: ["new_lab", "new_observation", "scheduled_checkpoint", "manual"],
  institutionalToggles: {},
};
