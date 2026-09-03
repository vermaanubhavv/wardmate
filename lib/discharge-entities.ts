/**
 * The structured discharge summary — the shape of every entity in protocol section 19, and the
 * ordered section list that drives both the review workspace and the printable document.
 *
 * TWO RULES, the same two the rest of WardMate follows:
 *
 *   Nothing is invented. Every non-AI section is COMPILED from data already on the record (see
 *   lib/discharge-compile.ts). The two AI sections — Clinical Course and Relevant
 *   Investigations — are generated from a digest built only from stored observations, and
 *   cannot be finalised until the resident has approved them (see lib/discharge-checks.ts).
 *
 *   Absence is shown, not filled. A field the app was never told prints blank on the summary,
 *   never a plausible value.
 *
 * `source` on a section object records where its current content came from:
 *   "compiled" — derived from observations by lib/discharge-compile.ts, never touched by a human
 *   "ai"       — produced by lib/discharge-ai.ts
 *   "resident" — typed or edited by the resident
 * Editing an "ai" section flips it to "resident" and clears `approvedAt` (see discharge-store).
 */

export type SectionSource = "compiled" | "ai" | "resident";

/** Provenance + approval carried by every AI-generatable section. */
export type SectionMeta = {
  source: SectionSource;
  /** The model id, when this content was AI-generated. */
  model?: string | null;
  generatedAt?: string | null;
  /** Set when the resident has reviewed and approved this section. Cleared on any later edit. */
  approvedAt?: string | null;
  approvedBy?: string | null;
};

// --- 3. Indication for Admission -------------------------------------------------------------

export type IndicationForAdmission = SectionMeta & {
  /** "Patient admitted with [presentation] requiring [inpatient management/…]." Never a repeat
   *  of the final diagnosis. */
  text: string;
};

// --- 2. Encounter Details ------------------------------------------------------------------

export type EncounterDetails = {
  admittedAt: string | null;
  dischargedAt: string | null;
  department: string | null;
  specialty: string | null;
  ward: string | null;
  bed: string | null;
  consultant: string | null;
  unit: string | null;
  admissionType: string | null;
};

// --- 4. Diagnoses ------------------------------------------------------------------------

export type DiagnosisCategory = "primary" | "secondary" | "complication" | "comorbidity";

export type Diagnosis = {
  id: string;
  category: DiagnosisCategory;
  text: string;
  source: SectionSource;
  /** When the primary was derived from the operation rather than recorded — shown, never hidden. */
  derivedFrom?: string | null;
};

// --- 5. Operation / Procedures ---------------------------------------------------------------

export type Procedure = {
  id: string;
  name: string;
  /** ISO date (yyyy-mm-dd) or null. */
  date: string | null;
  indication: string | null;
  anaesthesia: string | null;
  findings: string | null;
  drains: string | null;
  complications: string | null;
  outcome: string | null;
  source: SectionSource;
};

// --- 6. Clinical Course (AI, mandatory) ----------------------------------------------------

export type ClinicalCourse = SectionMeta & {
  text: string;
  /** Contradictions the model spotted and did NOT resolve — surfaced to the resident
   *  (AI Safety Rule 4). */
  uncertainPoints: string[];
};

// --- 7. Relevant Investigations (AI-heavy) -----------------------------------------------

export type RelevantInvestigation = {
  id: string;
  /** "CBC", "LFT", "Ultrasound Abdomen", "Blood Culture" … */
  group: string;
  /** The finding / trend line, e.g. "TLC fell from 16,400 to 8,900/mm³ before discharge". */
  text: string;
  /** The resident-editable reading of it. Optional. */
  interpretation: string | null;
  /** True once the resident keeps this line. AI proposals start false. */
  accepted: boolean;
  source: SectionSource;
  /** Observation ids this line was built from — the route drops any AI line not grounded in
   *  the digest it was given (the "the model's word alone is not enough" rule from
   *  lib/extract.ts). */
  sourceObservationIds: string[];
};

export type RelevantInvestigations = {
  items: RelevantInvestigation[];
  approvedAt: string | null;
  approvedBy: string | null;
  /** Set when the list was last (re)proposed by the AI. */
  model?: string | null;
  generatedAt?: string | null;
};

// --- 8. Histopathology (separate section, always) ----------------------------------------

export type HistopathologyStatus = "pending" | "preliminary" | "final";

export type HistopathologySpecimen = {
  id: string;
  specimen: string;
  dateSent: string | null;
  status: HistopathologyStatus;
  result: string | null;
  reviewPlan: string | null;
  source: SectionSource;
};

// --- 9. Medications on Discharge --------------------------------------------------------

export type MedicationStatus =
  | "new"
  | "continue"
  | "changed"
  | "stopped"
  | "temporary"
  | "prn";

export const MEDICATION_STATUSES: { value: MedicationStatus; label: string }[] = [
  { value: "new", label: "New" },
  { value: "continue", label: "Continue" },
  { value: "changed", label: "Changed" },
  { value: "stopped", label: "Stopped" },
  { value: "temporary", label: "Temporary" },
  { value: "prn", label: "PRN" },
];

export type DischargeMedication = {
  id: string;
  generic: string;
  strength: string | null;
  dose: string | null;
  route: string | null;
  frequency: string | null;
  duration: string | null;
  indication: string | null;
  status: MedicationStatus;
  /** Reason a chronic drug was started / stopped / dose-changed, where clinically relevant. */
  reason: string | null;
  /** The lookup key for the ward formulary mapping — see lib/drug-key.ts. */
  drugKey: string;
  source: SectionSource;
};

// --- 10. Condition at Discharge ---------------------------------------------------------

export type ConditionVariableKey =
  | "haemodynamic"
  | "afebrile"
  | "ambulation"
  | "oralIntake"
  | "urine"
  | "bowel"
  | "pain"
  | "wound"
  | "drain";

export const CONDITION_VARIABLES: {
  key: ConditionVariableKey;
  label: string;
  /** The concise phrase used when the resident marks this variable satisfactory. */
  satisfactory: string;
}[] = [
  { key: "haemodynamic", label: "Haemodynamic status", satisfactory: "haemodynamically stable" },
  { key: "afebrile", label: "Temperature", satisfactory: "afebrile" },
  { key: "ambulation", label: "Ambulation", satisfactory: "ambulatory" },
  { key: "oralIntake", label: "Oral intake", satisfactory: "tolerating oral diet" },
  { key: "urine", label: "Urine", satisfactory: "passing urine" },
  { key: "bowel", label: "Bowel / flatus", satisfactory: "passing stools and flatus" },
  { key: "pain", label: "Pain control", satisfactory: "adequate pain control" },
  { key: "wound", label: "Wound", satisfactory: "healthy surgical wounds" },
  { key: "drain", label: "Drain", satisfactory: "drain removed" },
];

/** null = not assessed, true = satisfactory, string = the resident's own note for it. */
export type ConditionVariableValue = null | true | string;

export type ConditionAtDischarge = {
  vars: Record<ConditionVariableKey, ConditionVariableValue>;
  /** The concise prose built from the satisfactory variables. Regenerated whenever vars change,
   *  unless the resident has hand-edited it. */
  prose: string;
  proseEdited: boolean;
  /** Free text for anything the variables cannot represent. */
  freeText: string | null;
};

// --- 13. Advice ----------------------------------------------------------------------

export const ADVICE_MODULES = [
  "Wound care",
  "Diet",
  "Mobilisation",
  "Physiotherapy",
  "Activity restrictions",
  "Lifting restrictions",
  "Drain care",
  "Catheter care",
  "Stoma care",
  "Feeding jejunostomy care",
  "Arm care (lymphoedema prevention)",
  "Medication instructions",
  "Return-to-work advice",
] as const;

export type AdviceItem = { id: string; module: string; text: string };

export type Advice = {
  items: AdviceItem[];
  /** Advice is optional — the resident decides whether the section appears. */
  included: boolean;
};

// --- 14. Red Flags -------------------------------------------------------------------

export type RedFlags = {
  items: string[];
  /** Optional section — off until the resident confirms which warnings are relevant. */
  included: boolean;
};

/** Procedure-specific suggestions offered (never auto-inserted) for post-operative patients. */
export const RED_FLAG_SUGGESTIONS = [
  "Persistent fever",
  "Increasing wound redness",
  "Purulent wound discharge",
  "Worsening abdominal pain",
  "Persistent vomiting",
  "Abdominal distension",
  "Jaundice",
  "Breathlessness",
  "Inability to tolerate oral intake",
] as const;

// --- 15. Authentication --------------------------------------------------------------

export type Authentication = {
  doctorName: string | null;
  designation: string | null;
  department: string | null;
  completedAt: string | null;
  seniorReviewer: string | null;
};

// --- The whole thing --------------------------------------------------------------------

export type DischargeDraft = {
  patientId: string;
  wardId: string;
  status: "draft" | "finalised";
  finalisedAt: string | null;

  indicationForAdmission: IndicationForAdmission;
  encounter: EncounterDetails;
  diagnoses: Diagnosis[];
  procedures: Procedure[];
  clinicalCourse: ClinicalCourse;
  relevantInvestigations: RelevantInvestigations;
  histopathology: HistopathologySpecimen[];
  medications: DischargeMedication[];
  conditionAtDischarge: ConditionAtDischarge;
  primaryCareActions: string[];
  patientActions: string[];
  advice: Advice;
  redFlags: RedFlags;
  authentication: Authentication;
};

/** The editable / approvable section ids, in protocol order. Drives the workspace and the
 *  printable document so a section added to one cannot be forgotten in the other. */
export type DischargeSectionId =
  | "indication"
  | "encounter"
  | "diagnoses"
  | "procedures"
  | "clinicalCourse"
  | "relevantInvestigations"
  | "histopathology"
  | "medications"
  | "conditionAtDischarge"
  | "primaryCareActions"
  | "patientActions"
  | "advice"
  | "redFlags"
  | "authentication";

export const DISCHARGE_SECTIONS: {
  id: DischargeSectionId;
  title: string;
  /** AI can generate a first draft for this section. */
  aiGenerated: boolean;
  /** Must hold content, and (for AI sections) be approved, before the summary can be finalised. */
  required: boolean;
}[] = [
  { id: "indication", title: "Indication for Admission", aiGenerated: true, required: false },
  { id: "encounter", title: "Encounter Details", aiGenerated: false, required: false },
  { id: "diagnoses", title: "Diagnoses", aiGenerated: false, required: true },
  { id: "procedures", title: "Operation / Procedures", aiGenerated: false, required: false },
  { id: "clinicalCourse", title: "Clinical Course", aiGenerated: true, required: true },
  { id: "relevantInvestigations", title: "Relevant Investigations and Results", aiGenerated: true, required: false },
  { id: "histopathology", title: "Histopathology", aiGenerated: false, required: false },
  { id: "medications", title: "Medications on Discharge", aiGenerated: false, required: false },
  { id: "conditionAtDischarge", title: "Condition at Discharge", aiGenerated: false, required: true },
  { id: "primaryCareActions", title: "Primary Care Actions", aiGenerated: false, required: false },
  { id: "patientActions", title: "Patient Actions", aiGenerated: false, required: false },
  { id: "advice", title: "Advice", aiGenerated: false, required: false },
  { id: "redFlags", title: "Red Flags / When to Seek Medical Attention", aiGenerated: false, required: false },
  { id: "authentication", title: "Authentication", aiGenerated: false, required: true },
];

/** A stable id for a compiled row, from its section and position — deterministic so the same
 *  record compiles to the same draft every time (a plain React key, nothing depends on it
 *  being unique across sections). New rows added in the client use crypto.randomUUID(). */
export function compiledRowId(prefix: string, index: number): string {
  return `${prefix}-${index}`;
}
