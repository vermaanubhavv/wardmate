/**
 * Diabetic ketoacidosis — pathway definition v1.0.0. ONE grading: severity (mild / moderate /
 * severe), by the ADA / Joint British Diabetes Societies criteria.
 *
 * Severe = pH < 7.00, or bicarbonate < 10 mEq/L, or stupor/coma.
 * Moderate = pH 7.00–7.24, or bicarbonate 10–14.9 mEq/L, or drowsy but arousable.
 * Mild = none of the above (the default once DKA is diagnosed: pH 7.25–7.30, bicarbonate
 * 15–18 mEq/L, alert).
 *
 * This grades DKA itself, once diagnosed — it does not distinguish DKA from HHS, which is a
 * separate clinical judgement (glucose, ketones and pH pattern together), not a severity
 * ladder, and is deliberately left to the resident rather than a wrong single number.
 *
 * STATUS: active for the internal-medicine pilot (2026-09-05) — formal governance review still
 * due. Source: Kitabchi AE et al. (ADA consensus), Diabetes Care 2009;32:1335–43; Joint British
 * Diabetes Societies (JBDS) DKA guideline.
 */

import type { CardDefinition, PathwayDefinition, TimeWindow } from "../types";

const W: TimeWindow = { anchor: "admission", startHours: -12, label: "since admission (dynamic)" };

const yn = (recordLabel: string, question: string) => ({
  question,
  recordLabel,
  options: [
    { label: "No", record: "absent", satisfied: false, normal: true },
    { label: "Yes", record: "present", satisfied: true },
  ],
});

const card: CardDefinition = {
  cardId: "dka_severity",
  title: "DKA severity",
  shortName: "DKA severity",
  citation:
    "ADA consensus (Kitabchi AE et al., Diabetes Care 2009;32:1335–43) / JBDS DKA guideline. Severe: pH < 7.00, bicarbonate < 10, or stupor/coma. Moderate: pH 7.00–7.24, bicarbonate 10–14.9, or drowsy. Mild: neither — the default once DKA is diagnosed. Grades severity only; does not itself distinguish DKA from HHS.",
  type: "structured_classification",
  timingLabel: "dynamic — re-grade on change",
  calculation: {
    kind: "tiered_classification",
    tiers: ["severe", "moderate"],
    fallback: "mild",
  },
  requiresConfirmation: true,
  recomputeOn: ["new_lab", "new_observation", "deterioration", "manual"],
  interpretationBands: [
    { min: 0, class: "mild", text: "Mild DKA — pH 7.25–7.30 / bicarbonate 15–18, alert. Standard protocol: fixed-rate insulin infusion, fluids, hourly glucose.", tone: "neutral" },
    { min: 0, class: "moderate", text: "Moderate DKA — closer review; senior input on fluid and insulin rate.", tone: "attention" },
    { min: 0, class: "severe", text: "Severe DKA — pH < 7.00 / bicarbonate < 10 / stupor or coma. Senior / critical-care review; consider HDU/ICU.", tone: "attention" },
  ],
  inputs: [
    // --- Severe ---
    { componentId: "dka.ph_severe", label: "pH < 7.00", inputKey: "ph", canonicalUnit: null, window: W, selector: "lowest", points: 0, rule: { op: "lt", value: 7.0 }, required: true, tier: "severe" },
    { componentId: "dka.bicarb_severe", label: "Bicarbonate < 10 mEq/L", inputKey: "bicarbonate", canonicalUnit: null, window: W, selector: "lowest", points: 0, rule: { op: "lt", value: 10 }, required: true, tier: "severe" },
    { componentId: "dka.consciousness_severe", label: "Stupor or coma", inputKey: "stupor_or_coma", canonicalUnit: null, window: W, selector: "worst", points: 0, rule: { op: "present" }, required: true, tier: "severe", noAutoTask: true, clinicianAssessed: true, assess: yn("Stupor / coma", "Stupor or coma?") },
    // --- Moderate ---
    { componentId: "dka.ph_moderate", label: "pH 7.00–7.24", inputKey: "ph", canonicalUnit: null, window: W, selector: "lowest", points: 0, rule: { op: "in_range", range: [7.0, 7.249] }, required: false, tier: "moderate" },
    { componentId: "dka.bicarb_moderate", label: "Bicarbonate 10–14.9 mEq/L", inputKey: "bicarbonate", canonicalUnit: null, window: W, selector: "lowest", points: 0, rule: { op: "in_range", range: [10, 14.9] }, required: false, tier: "moderate" },
    { componentId: "dka.consciousness_moderate", label: "Drowsy but arousable (not stupor / coma)", inputKey: "drowsy", canonicalUnit: null, window: W, selector: "worst", points: 0, rule: { op: "present" }, required: false, tier: "moderate", noAutoTask: true, clinicianAssessed: true, assess: yn("Drowsy", "Drowsy but arousable (not stupor / coma)?") },
  ],
};

export const dkaSeverityV1: PathwayDefinition = {
  pathwayId: "dka_severity",
  pathwayVersion: "1.0.0",
  title: "Diabetic ketoacidosis — severity",
  status: "active",
  clinicalOwner: "Internal Medicine unit (pilot activation 2026-09-05; formal review pending)",
  sourceReferences: [
    { label: "Kitabchi AE et al. (ADA consensus), Diabetes Care 2009", citation: "Hyperglycemic crises in adult patients with diabetes. Diabetes Care 2009;32:1335–43." },
    { label: "Joint British Diabetes Societies DKA guideline", citation: "The management of diabetic ketoacidosis in adults." },
  ],
  reviewDueAt: "2027-09-01",
  diagnosisTriggers: {
    codes: ["E10.10", "E11.10"],
    textPatterns: ["diabetic ketoacidosis", "dka", "ketoacidosis"],
    excludePatterns: ["dka resolved", "dka resolving", "post dka", "euglycaemic dka on sglt2"],
  },
  eligibility: { minAgeYears: 12, notes: ["Grades DKA once diagnosed. Does not itself diagnose DKA or distinguish it from HHS."] },
  exclusions: ["HHS without significant ketosis/acidosis — a separate clinical picture, not this ladder."],
  cards: [card],
  tasks: [
    {
      key: "dka_gas",
      cardId: "dka_severity",
      componentId: null,
      action: "Send venous blood gas (pH, bicarbonate) and repeat per protocol",
      reason: "pH and bicarbonate are two of the three severity criteria and the ongoing response measure.",
      priority: "urgent",
      responsibleRole: "resident",
      institutionalToggle: null,
      linkKey: "ph",
    },
  ],
  checkpoints: [
    { key: "dka_reassess_2h", dueFrom: "admission", dueAtHours: 2, label: "Re-grade DKA severity at 2 hours", recomputeCards: ["dka_severity"] },
  ],
  recomputePolicy: ["new_lab", "new_observation", "deterioration", "scheduled_checkpoint", "manual"],
  institutionalToggles: {},
};
