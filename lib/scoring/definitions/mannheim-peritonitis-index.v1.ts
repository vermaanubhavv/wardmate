/**
 * Secondary / perforation peritonitis — pathway definition v1.0.0. ONE score: the Mannheim
 * Peritonitis Index (MPI).
 *
 * Nine weighted adverse factors, 0–47. Several are operative findings, so the score is only
 * complete after laparotomy — the admission subset (age, sex, organ failure, malignancy,
 * pre-operative duration) is shown provisionally, with the operative findings as clinician taps
 * completed post-op. The threshold for "high risk" varies by cohort; Indian series commonly use
 * ~26. It is a prognostic index, NOT a surgical-indication score — source control is never
 * delayed for it.
 *
 * STATUS: draft — not yet offered to any unit (absent from every pack's scoringKeys) pending
 * clinician review. Source: Linder MM et al., Chirurg 1987;58:84–92; Singh R et al. (Indian
 * cohort), PMC11057927.
 */

import type { CardDefinition, PathwayDefinition, TimeWindow } from "../types";

const W: TimeWindow = { anchor: "admission", startHours: -12, label: "admission → operative findings" };

const yn = (recordLabel: string, question: string, points: number) => ({
  question,
  recordLabel,
  options: [
    { label: "No", record: "absent", satisfied: false, normal: true },
    { label: "Yes", record: "present", satisfied: true, points },
  ],
});

const mpiCard: CardDefinition = {
  cardId: "mpi",
  title: "Mannheim Peritonitis Index",
  shortName: "MPI",
  citation:
    "Mannheim Peritonitis Index — Linder MM et al., Chirurg 1987;58:84–92. Range 0–47; many cohorts (incl. Indian series, PMC11057927) treat ~26 as the high-risk cut-off, but the threshold is cohort-dependent — confirm your unit's. A prognostic index, not a surgical-indication score; source control is not delayed for it.",
  type: "calculator",
  timingLabel: "admission, completed from operative findings",
  calculation: { kind: "sum_points" },
  recomputeOn: ["new_lab", "new_observation", "deterioration", "manual"],
  interpretationBands: [
    { min: 0, max: 25, text: "MPI < 26 — lower predicted risk on this index. Interpret with physiology and the operative picture, not this number alone.", tone: "neutral" },
    { min: 26, max: 47, text: "MPI ≥ 26 — higher predicted mortality in most cohorts. Escalate monitoring / critical-care planning; repeat SOFA if organ dysfunction persists.", tone: "attention" },
  ],
  inputs: [
    { componentId: "mpi.age", label: "Age > 50 years", inputKey: "age_years", canonicalUnit: null, window: { anchor: "admission", startHours: -12, endHours: 24, label: "at admission" }, selector: "admission", points: 5, rule: { op: "gt", value: 50 }, required: true, noAutoTask: true },
    { componentId: "mpi.female", label: "Female sex", inputKey: "sex", canonicalUnit: null, window: W, selector: "admission", points: 5, rule: { op: "eq", value: "female" }, required: true, noAutoTask: true },
    { componentId: "mpi.organ_failure", label: "Organ failure present", inputKey: "mpi_organ_failure", canonicalUnit: null, window: W, selector: "first", points: 7, rule: { op: "present" }, required: true, noAutoTask: true, clinicianAssessed: true, assess: yn("Organ failure", "Organ failure (renal / respiratory / circulatory / GI per MPI definition)?", 7) },
    { componentId: "mpi.malignancy", label: "Malignancy", inputKey: "mpi_malignancy", canonicalUnit: null, window: W, selector: "first", points: 4, rule: { op: "present" }, required: true, noAutoTask: true, clinicianAssessed: true, assess: yn("Malignancy", "Underlying malignancy?", 4) },
    { componentId: "mpi.duration", label: "Pre-operative duration of peritonitis > 24 h", inputKey: "mpi_preop_gt_24h", canonicalUnit: null, window: W, selector: "first", points: 4, rule: { op: "present" }, required: true, noAutoTask: true, clinicianAssessed: true, assess: yn("Pre-op duration > 24 h", "Peritonitis present for more than 24 hours before surgery?", 4) },
    { componentId: "mpi.non_colonic", label: "Origin of sepsis not colonic", inputKey: "mpi_non_colonic", canonicalUnit: null, window: W, selector: "first", points: 4, rule: { op: "present" }, required: true, noAutoTask: true, clinicianAssessed: true, assess: yn("Non-colonic origin", "Is the source NOT the colon (operative finding)?", 4) },
    { componentId: "mpi.generalised", label: "Generalised (diffuse) peritonitis", inputKey: "mpi_generalised", canonicalUnit: null, window: W, selector: "first", points: 6, rule: { op: "present" }, required: true, noAutoTask: true, clinicianAssessed: true, assess: yn("Generalised peritonitis", "Generalised rather than localised peritonitis (operative finding)?", 6) },
    { componentId: "mpi.exudate", label: "Exudate — clear (0) / cloudy-purulent (6) / faeculent (12)", inputKey: "mpi_exudate", canonicalUnit: null, window: W, selector: "first", points: 12, rule: { op: "present" }, required: true, noAutoTask: true, clinicianAssessed: true, assess: {
      question: "Peritoneal exudate at operation?",
      recordLabel: "Peritoneal exudate",
      options: [
        { label: "Clear / serous", record: "clear serous exudate", satisfied: false, normal: true },
        { label: "Cloudy / purulent", record: "cloudy purulent exudate", satisfied: true, points: 6 },
        { label: "Faeculent", record: "faeculent exudate", satisfied: true, points: 12 },
      ],
    } },
  ],
};

export const mannheimPeritonitisIndexV1: PathwayDefinition = {
  pathwayId: "perforation_peritonitis",
  pathwayVersion: "1.0.0",
  title: "Perforation / secondary peritonitis",
  status: "draft",
  clinicalOwner: "PENDING — awaiting single-clinician review (General Surgery).",
  sourceReferences: [
    { label: "Linder MM et al., Chirurg 1987", citation: "Der Mannheimer Peritonitis-Index. Chirurg 1987;58:84–92." },
    { label: "Singh R et al. (Indian cohort)", citation: "Comparative evaluation of MPI in a geographically diverse Indian population. PMC11057927." },
  ],
  reviewDueAt: "2027-09-30",
  diagnosisTriggers: {
    codes: ["K65", "K65.0", "K65.1", "K65.9", "K63.1"],
    textPatterns: ["perforation peritonitis", "hollow viscus perforation", "secondary peritonitis", "generalised peritonitis", "faecal peritonitis", "biliary peritonitis", "duodenal perforation", "ileal perforation", "gastric perforation", "pneumoperitoneum", "perforated peptic ulcer"],
    excludePatterns: ["primary peritonitis", "spontaneous bacterial peritonitis", "sbp", "tuberculous peritonitis", "peritoneal dialysis peritonitis"],
  },
  eligibility: { minAgeYears: 16, notes: ["Secondary peritonitis from a hollow-viscus perforation or anastomotic leak. Several factors are operative — the score completes after laparotomy."] },
  exclusions: ["Primary / spontaneous bacterial peritonitis (different pathophysiology).", "Tuberculous peritonitis."],
  cards: [mpiCard],
  tasks: [
    {
      key: "mpi_sepsis_bloods",
      cardId: "mpi",
      componentId: null,
      action: "Send sepsis bloods — CBC, CRP, renal & liver profile, electrolytes, coagulation, lactate, blood group & crossmatch; cultures if they will not delay antibiotics",
      reason: "Defines organ dysfunction (an MPI factor) and readies the patient for theatre.",
      priority: "urgent",
      responsibleRole: "resident",
      institutionalToggle: null,
      linkKey: "lactate",
    },
    {
      key: "mpi_postop_complete",
      cardId: "mpi",
      componentId: null,
      action: "Complete the MPI from operative findings (source, extent, exudate) and repeat SOFA if organ dysfunction persists",
      reason: "Four MPI factors are only known at operation; the admission score is provisional until then.",
      priority: "soon",
      responsibleRole: "resident",
      institutionalToggle: null,
      dueFromAnchor: "admission",
      dueAtHours: 24,
    },
  ],
  checkpoints: [
    { key: "mpi_postop_24h", dueFrom: "admission", dueAtHours: 24, label: "Complete MPI from operative findings", recomputeCards: ["mpi"] },
  ],
  recomputePolicy: ["new_lab", "new_observation", "deterioration", "scheduled_checkpoint", "manual"],
  institutionalToggles: {},
};
