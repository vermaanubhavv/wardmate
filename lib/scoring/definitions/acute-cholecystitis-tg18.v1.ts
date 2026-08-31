/**
 * Acute cholecystitis — pathway definition v1.0.0. ONE grading: Tokyo Guidelines 2018 severity
 * (Grade I / II / III). Modelled as a tiered classification: Grade III if any organ-dysfunction
 * criterion is met, else Grade II if any Grade-II criterion is met, else Grade I.
 *
 * STATUS: draft — clinical governance sign-off pending. Sources: [6], [7].
 * LICENSING: TG18 severity criteria are freely published; the diagnostic-criteria wording is
 * reproduced in summary only.
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

const tg18Card: CardDefinition = {
  cardId: "tg18_cholecystitis",
  title: "Tokyo Guidelines 2018 severity",
  shortName: "Tokyo grade",
  citation:
    "Tokyo Guidelines 2018 — Yokoe M et al., J Hepatobiliary Pancreat Sci 2018;25:41–54. Grade III = organ dysfunction; Grade II = marked local inflammation / high WBC / RUQ mass / symptoms > 72 h; Grade I = neither. Re-grade on new organ dysfunction or imaging.",
  type: "structured_classification",
  timingLabel: "dynamic — re-grade on change",
  calculation: {
    kind: "tiered_classification",
    tiers: ["grade_iii", "grade_ii"],
    fallback: "grade_i",
  },
  requiresConfirmation: true,
  recomputeOn: ["new_lab", "new_observation", "new_imaging", "deterioration", "manual"],
  interpretationBands: [
    { min: 0, class: "grade_i", text: "Grade I (mild) — no organ dysfunction, mild inflammation. Early cholecystectomy pathway where appropriate.", tone: "neutral" },
    { min: 0, class: "grade_ii", text: "Grade II (moderate) — marked local inflammation. Early senior review; management per local pathway.", tone: "attention" },
    { min: 0, class: "grade_iii", text: "Grade III (severe) — organ dysfunction. Urgent senior review and organ support per local policy.", tone: "attention" },
  ],
  inputs: [
    // --- Grade III: organ dysfunction ---
    { componentId: "tg18c.hypotension", label: "Hypotension requiring vasopressors", inputKey: "vasopressor", canonicalUnit: null, window: W, selector: "first", points: 0, rule: { op: "present" }, required: true, tier: "grade_iii", noAutoTask: true, clinicianAssessed: true, assess: yn("Vasopressor-requiring hypotension", "Hypotension needing vasopressors?") },
    { componentId: "tg18c.consciousness", label: "Altered level of consciousness", inputKey: "altered_consciousness", canonicalUnit: null, window: W, selector: "first", points: 0, rule: { op: "present" }, required: true, tier: "grade_iii", noAutoTask: true, clinicianAssessed: true, assess: yn("Altered consciousness", "Altered level of consciousness?") },
    { componentId: "tg18c.respiratory", label: "PaO₂/FiO₂ < 300", inputKey: "pf_ratio", canonicalUnit: null, window: W, selector: "lowest", points: 0, rule: { op: "lt", value: 300 }, required: false, tier: "grade_iii" },
    { componentId: "tg18c.renal", label: "Creatinine > 2 mg/dL", inputKey: "creatinine", canonicalUnit: "mg/dL", window: W, selector: "highest", points: 0, rule: { op: "gt", value: 2 }, required: false, tier: "grade_iii" },
    { componentId: "tg18c.hepatic", label: "INR > 1.5", inputKey: "inr", canonicalUnit: null, window: W, selector: "highest", points: 0, rule: { op: "gt", value: 1.5 }, required: false, tier: "grade_iii" },
    { componentId: "tg18c.haematologic", label: "Platelets < 100,000/mm³", inputKey: "platelets", canonicalUnit: null, window: W, selector: "lowest", points: 0, rule: { op: "lt", value: 100000 }, required: false, tier: "grade_iii" },
    // --- Grade II ---
    { componentId: "tg18c.wbc", label: "WBC > 18,000/mm³", inputKey: "wbc", canonicalUnit: "cells/mm3", window: W, selector: "highest", points: 0, rule: { op: "gt", value: 18000 }, required: false, tier: "grade_ii" },
    { componentId: "tg18c.mass", label: "Palpable tender RUQ mass", inputKey: "ruq_mass", canonicalUnit: null, window: W, selector: "first", points: 0, rule: { op: "present" }, required: true, tier: "grade_ii", noAutoTask: true, clinicianAssessed: true, assess: yn("Palpable tender RUQ mass", "Palpable tender RUQ mass?") },
    { componentId: "tg18c.duration", label: "Symptoms > 72 hours", inputKey: "symptoms_72h", canonicalUnit: null, window: W, selector: "first", points: 0, rule: { op: "present" }, required: true, tier: "grade_ii", noAutoTask: true, clinicianAssessed: true, assess: yn("Symptom duration > 72 h", "Symptoms present for more than 72 hours?") },
    { componentId: "tg18c.local", label: "Marked local inflammation (gangrene / abscess / emphysematous / biliary peritonitis)", inputKey: "marked_local_inflammation", canonicalUnit: null, window: W, selector: "first", points: 0, rule: { op: "present" }, required: true, tier: "grade_ii", noAutoTask: true, clinicianAssessed: true, assess: yn("Marked local inflammation", "Gangrene, abscess, emphysematous cholecystitis or biliary peritonitis?") },
  ],
};

export const cholecystitisTg18V1: PathwayDefinition = {
  pathwayId: "acute_cholecystitis",
  pathwayVersion: "1.0.0",
  title: "Acute cholecystitis",
  status: "draft",
  clinicalOwner: "PENDING_CLINICAL_OWNER (General Surgery + HPB)",
  sourceReferences: [
    { label: "TG18 diagnosis & severity", citation: "Yokoe M et al. J Hepatobiliary Pancreat Sci 2018;25:41–54." },
    { label: "TG18 initial management", citation: "Miura F et al. J Hepatobiliary Pancreat Sci 2018;25:31–40." },
  ],
  reviewDueAt: "2027-09-01",
  diagnosisTriggers: {
    codes: ["K81.0", "K80.00", "K80.10"],
    textPatterns: ["acute cholecystitis", "acute calculous cholecystitis", "acute acalculous cholecystitis", "? cholecystitis", "cholecystitis"],
    excludePatterns: ["chronic cholecystitis", "post cholecystectomy", "h/o cholecystectomy", "gallbladder cancer"],
  },
  eligibility: { minAgeYears: 16, notes: ["Suspected vs definite TG18 diagnosis is a clinician judgement; this card grades severity once cholecystitis is the working diagnosis."] },
  exclusions: ["Gallbladder malignancy.", "Post-cholecystectomy collection."],
  cards: [tg18Card],
  tasks: [
    {
      key: "tg18c_bloods",
      cardId: "tg18_cholecystitis",
      componentId: null,
      action: "Send CBC, CRP, LFT with bilirubin, KFT, and PT/INR if unwell or intervention likely",
      reason: "WBC, creatinine, INR and platelets feed the Tokyo Guidelines severity grading; LFT identifies a biliary obstruction component.",
      priority: "soon",
      responsibleRole: "resident",
      institutionalToggle: null,
      linkKey: "wbc",
    },
    {
      key: "tg18c_usg",
      cardId: null,
      componentId: null,
      action: "Arrange ultrasound abdomen",
      reason: "Confirms the diagnosis and shows gangrene / pericholecystic collection that raise the grade.",
      priority: "soon",
      responsibleRole: "resident",
      institutionalToggle: null,
    },
  ],
  checkpoints: [
    { key: "tg18c_reassess_24h", dueFrom: "admission", dueAtHours: 24, label: "Re-grade Tokyo severity at 24 hours", recomputeCards: ["tg18_cholecystitis"] },
  ],
  recomputePolicy: ["new_lab", "new_observation", "new_imaging", "deterioration", "scheduled_checkpoint", "manual"],
  institutionalToggles: {},
};
