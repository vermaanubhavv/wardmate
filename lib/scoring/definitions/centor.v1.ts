/**
 * Sore throat — pathway definition v1.0.0. ONE score: the Centor criteria.
 *
 * One point each: fever > 38 °C, absence of cough, tender anterior cervical lymphadenopathy,
 * tonsillar exudate or swelling. Total 0–4. The bands give the approximate probability of a
 * group A streptococcal (GAS) throat culture reported in the original adult emergency-room
 * derivation (≈ 2.5 / 6.5 / 15 / 32 / 56 % for 0–4). McIsaac's age modification (−1 at ≥ 45,
 * +1 at 3–14) is deliberately NOT applied — the engine does not score negative points.
 *
 * A probability, not a diagnosis. Fever is auto-read from charted temperature only; a history
 * of fever without a recorded reading does not score here.
 *
 * STATUS: active — signed off for pilot use by Dr Anubhav Verma, 2026-09-28 (single-clinician sign-off;
 * departmental review due 2027-09-01). Source: Centor RM et al., Med Decis Making 1981;1:239–46.
 */

import type { CardDefinition, PathwayDefinition, TimeWindow } from "../types";

const W: TimeWindow = { anchor: "admission", startHours: -12, label: "since presentation" };

const yn = (componentId: string, label: string, question: string, yes: string, no: string) => ({
  componentId,
  label,
  inputKey: componentId.replace("centor.", "centor_"),
  canonicalUnit: null,
  window: W,
  selector: "first" as const,
  points: 1,
  rule: { op: "present" as const },
  required: true,
  noAutoTask: true,
  clinicianAssessed: true,
  assess: {
    question,
    recordLabel: label,
    options: [
      { label: no, record: no.toLowerCase(), satisfied: false, normal: true },
      { label: yes, record: yes.toLowerCase(), satisfied: true },
    ],
  },
});

const TAIL = "A probability, not a diagnosis; throat swab / RADT per unit practice.";

const centorCard: CardDefinition = {
  cardId: "centor",
  title: "Centor criteria — streptococcal pharyngitis",
  shortName: "Centor",
  citation:
    "Centor criteria — Centor RM et al., Med Decis Making 1981;1:239–46. One point each for fever > 38 °C, absence of cough, tender anterior cervical lymphadenopathy, tonsillar exudate/swelling. Approximate probability of a positive GAS throat culture in the adult derivation cohort: 0 ≈ 2.5 %, 1 ≈ 6.5 %, 2 ≈ 15 %, 3 ≈ 32 %, 4 ≈ 56 %. McIsaac age adjustment not applied.",
  type: "calculator",
  timingLabel: "at presentation",
  calculation: { kind: "sum_points" },
  recomputeOn: ["new_observation", "manual"],
  interpretationBands: [
    { min: 0, max: 0, text: `Centor 0 — approximate probability of group A streptococcal pharyngitis ≈ 2.5 %. ${TAIL}`, tone: "neutral" },
    { min: 1, max: 1, text: `Centor 1 — approximate probability of group A streptococcal pharyngitis ≈ 6.5 %. ${TAIL}`, tone: "neutral" },
    { min: 2, max: 2, text: `Centor 2 — approximate probability of group A streptococcal pharyngitis ≈ 15 %. ${TAIL}`, tone: "neutral" },
    { min: 3, max: 3, text: `Centor 3 — approximate probability of group A streptococcal pharyngitis ≈ 32 %. ${TAIL}`, tone: "attention" },
    { min: 4, max: 4, text: `Centor 4 — approximate probability of group A streptococcal pharyngitis ≈ 56 %. ${TAIL}`, tone: "attention" },
  ],
  inputs: [
    {
      componentId: "centor.fever",
      label: "Fever > 38 °C",
      inputKey: "temp",
      canonicalUnit: "C",
      window: W,
      selector: "highest",
      points: 1,
      rule: { op: "gt", value: 38 },
      required: true,
    },
    yn("centor.no_cough", "Absence of cough", "Is cough absent?", "No cough", "Cough present"),
    yn("centor.nodes", "Tender anterior cervical lymphadenopathy", "Tender anterior cervical lymph nodes?", "Tender nodes present", "Not present"),
    yn("centor.exudate", "Tonsillar exudate or swelling", "Tonsillar exudate or swelling?", "Exudate / swelling present", "Not present"),
  ],
};

export const centorV1: PathwayDefinition = {
  pathwayId: "centor",
  pathwayVersion: "1.0.0",
  title: "Sore throat",
  status: "active",
  clinicalOwner: "Reviewed against the cited source and signed off for pilot use by Dr Anubhav Verma — 2026-09-28. Single-clinician sign-off; departmental review due 2027-09-01.",
  sourceReferences: [
    { label: "Centor RM et al., Med Decis Making 1981", citation: "The diagnosis of strep throat in adults in the emergency room. Med Decis Making 1981;1:239–46." },
  ],
  reviewDueAt: "2027-09-01",
  diagnosisTriggers: {
    codes: [],
    textPatterns: ["sore throat", "pharyngitis", "tonsillitis", "throat infection"],
    excludePatterns: ["peritonsillar abscess", "quinsy"],
  },
  eligibility: { minAgeYears: 15, notes: ["Derived in adults with sore throat. A probability of GAS pharyngitis, not a diagnosis."] },
  exclusions: ["Peritonsillar abscess, epiglottitis or airway compromise — assess directly, not by score."],
  cards: [centorCard],
  tasks: [],
  checkpoints: [],
  recomputePolicy: ["new_observation", "manual"],
  institutionalToggles: {},
};
