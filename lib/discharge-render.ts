import type { DischargeContext } from "@/lib/discharge-data";
import type {
  AdviceItem,
  DischargeDraft,
  DischargeMedication,
  HistopathologySpecimen,
  Procedure,
} from "@/lib/discharge-entities";
import { CONDITION_VARIABLES } from "@/lib/discharge-entities";
import { stripPatientHonorific } from "@/lib/patients";

/**
 * The discharge summary as a fully-resolved, protocol-ordered document — the single structure
 * both the printed page (app/patients/[id]/discharge/sheet.tsx) and the Word export render
 * from, so a change to the document is made once.
 *
 * Generic NABH/ABDM terminology, per the protocol: "Indication for Admission", Histopathology
 * as its own section, an Authentication block. No ESIC identifier fields and no ESIC
 * prescription-code columns in the body — those live behind the separate "Copy for hospital
 * system" button.
 *
 * A field the record never held prints blank (the BLANK ruled line), never a guess.
 */

export const BLANK = "____________________";

const istDay = (iso: string | null): string | null =>
  iso
    ? new Date(iso).toLocaleString("en-GB", {
        timeZone: "Asia/Kolkata",
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : null;

const istDateTime = (iso: string | null): string | null =>
  iso
    ? new Date(iso).toLocaleString("en-GB", {
        timeZone: "Asia/Kolkata",
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

/**
 * Does the unit's heading already name the unit on a line of its own? If so the sheet does not
 * also print a "UNIT – X" line under it. Whole lines only, case-insensitive.
 */
export function letterheadNamesUnit(letterheadLines: string[], unitName: string | null): boolean {
  const unit = (unitName ?? "").trim().toLowerCase();
  if (!unit) return false;
  return letterheadLines.some((line) => line.trim().toLowerCase() === unit);
}

function sexWord(sex: string | null): string {
  if (sex === "M") return "Male";
  if (sex === "F") return "Female";
  if (sex === "other") return "Other";
  return "";
}

export type DischargeDocument = {
  letterheadLines: string[];
  logoUrl: string | null;
  unitName: string | null;
  patient: {
    name: string;
    uhid: string | null;
    abha: string | null;
    age: string | null;
    sex: string;
    contact: string | null;
  };
  encounter: { label: string; value: string | null }[];
  indication: string | null;
  diagnoses: { primary: string[]; secondary: string[]; comorbidities: string[]; complications: string[] };
  procedures: Procedure[];
  clinicalCourse: string | null;
  clinicalCourseApproved: boolean;
  clinicalCourseUncertain: string[];
  investigations: { group: string; text: string; interpretation: string | null }[];
  investigationsApproved: boolean;
  histopathology: HistopathologySpecimen[];
  medications: DischargeMedication[];
  /** drugKey -> the ward formulary's confirmed wording. Plain object so the document survives
   *  JSON (the one-off flow ships it through a route response). */
  medicationFormulary: Record<string, string>;
  condition: string | null;
  primaryCareActions: string[];
  patientActions: string[];
  advice: AdviceItem[] | null;
  redFlags: string[] | null;
  authentication: {
    name: string | null;
    designation: string | null;
    department: string | null;
    completedAt: string | null;
    seniorReviewer: string | null;
  };
  status: "draft" | "finalised";
};

export function buildDischargeDocument(
  draft: DischargeDraft,
  context: DischargeContext
): DischargeDocument {
  const { patient } = context;

  const diagnoses = {
    primary: draft.diagnoses.filter((d) => d.category === "primary").map((d) => d.text),
    secondary: draft.diagnoses.filter((d) => d.category === "secondary").map((d) => d.text),
    comorbidities: draft.diagnoses.filter((d) => d.category === "comorbidity").map((d) => d.text),
    complications: draft.diagnoses.filter((d) => d.category === "complication").map((d) => d.text),
  };

  const e = draft.encounter;
  const encounter: { label: string; value: string | null }[] = [
    { label: "Date & time of admission", value: istDateTime(e.admittedAt) },
    { label: "Date & time of discharge", value: istDateTime(e.dischargedAt) },
    { label: "Department", value: e.department },
    { label: "Specialty", value: e.specialty },
    { label: "Ward", value: e.ward },
    { label: "Bed", value: e.bed },
    { label: "Consultant", value: e.consultant },
    { label: "Unit", value: e.unit },
    { label: "Admission type", value: e.admissionType },
  ];

  const investigations = draft.relevantInvestigations.items
    .filter((i) => i.accepted || !draft.relevantInvestigations.items.some((x) => x.accepted))
    .map((i) => ({ group: i.group, text: i.text, interpretation: i.interpretation }));

  const conditionParts: string[] = [];
  if (draft.conditionAtDischarge.prose.trim()) conditionParts.push(draft.conditionAtDischarge.prose.trim());
  else {
    const set = CONDITION_VARIABLES.map((v) => {
      const val = draft.conditionAtDischarge.vars[v.key];
      if (val === true) return v.satisfactory;
      if (typeof val === "string" && val.trim()) return `${v.label.toLowerCase()}: ${val.trim()}`;
      return null;
    }).filter(Boolean) as string[];
    if (set.length) conditionParts.push(`${set.join("; ")}.`);
  }
  if (draft.conditionAtDischarge.freeText?.trim()) conditionParts.push(draft.conditionAtDischarge.freeText.trim());

  return {
    letterheadLines: (context.letterhead ?? "")
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean),
    logoUrl: context.logoUrl,
    unitName: (context.wardName ?? "").trim() || null,
    patient: {
      name: stripPatientHonorific(patient.display_name),
      uhid: patient.uhid_ip_no,
      abha: null,
      age: patient.age_years !== null ? `${patient.age_years} years` : null,
      sex: sexWord(patient.sex),
      contact: null,
    },
    encounter,
    indication: draft.indicationForAdmission.text.trim() || null,
    diagnoses,
    procedures: draft.procedures,
    clinicalCourse: draft.clinicalCourse.text.trim() || null,
    clinicalCourseApproved: !!draft.clinicalCourse.approvedAt,
    clinicalCourseUncertain: draft.clinicalCourse.uncertainPoints,
    investigations,
    investigationsApproved: !!draft.relevantInvestigations.approvedAt,
    histopathology: draft.histopathology,
    medications: draft.medications,
    medicationFormulary: Object.fromEntries(context.formularyMappings),
    condition: conditionParts.join(" ") || null,
    primaryCareActions: draft.primaryCareActions,
    patientActions: draft.patientActions,
    advice: draft.advice.included ? draft.advice.items : null,
    redFlags: draft.redFlags.included ? draft.redFlags.items : null,
    authentication: {
      name: draft.authentication.doctorName,
      designation: draft.authentication.designation,
      department: draft.authentication.department,
      completedAt: istDateTime(draft.authentication.completedAt),
      seniorReviewer: draft.authentication.seniorReviewer,
    },
    status: draft.status,
  };
}

function medLine(m: DischargeMedication): string {
  const parts = [
    m.generic,
    m.strength,
    m.dose,
    m.route,
    m.frequency,
    m.duration ? `for ${m.duration}` : null,
  ].filter(Boolean);
  const tail = [m.indication ? `(${m.indication})` : null, `Status: ${m.status}`, m.reason ? `Reason: ${m.reason}` : null]
    .filter(Boolean)
    .join("  ");
  return `${parts.join(" ")}${tail ? ` — ${tail}` : ""}`;
}

function procedureLines(p: Procedure): string[] {
  const out = [`${p.name}${p.date ? ` — ${istDay(p.date)}` : ""}`];
  const field = (label: string, value: string | null) => {
    if (value?.trim()) out.push(`  ${label}: ${value.trim()}`);
  };
  field("Indication", p.indication);
  field("Anaesthesia", p.anaesthesia);
  field("Significant findings", p.findings);
  field("Drains", p.drains);
  field("Complications", p.complications);
  field("Outcome", p.outcome);
  return out;
}

/** The plain-text version, for the copy button and any EMR field that only takes text. */
export function formatDischargePlainText(doc: DischargeDocument): string {
  const out: string[] = [];
  const rule = () => out.push("");
  const heading = (t: string) => {
    out.push("");
    out.push(t.toUpperCase());
  };

  for (const l of doc.letterheadLines) out.push(l);
  if (doc.unitName && !letterheadNamesUnit(doc.letterheadLines, doc.unitName)) out.push(`UNIT – ${doc.unitName}`);
  rule();
  out.push("DISCHARGE SUMMARY");
  rule();

  out.push(`Name: ${doc.patient.name}`);
  out.push(`UHID: ${doc.patient.uhid || BLANK}`);
  if (doc.patient.abha) out.push(`ABHA: ${doc.patient.abha}`);
  out.push(`Age: ${doc.patient.age || BLANK}    Sex: ${doc.patient.sex || BLANK}`);
  out.push(`Contact: ${doc.patient.contact || BLANK}`);

  heading("Encounter details");
  for (const row of doc.encounter) out.push(`  ${row.label}: ${row.value || BLANK}`);

  heading("Indication for admission");
  out.push(`  ${doc.indication || BLANK}`);

  heading("Diagnoses");
  const dxBlock = (title: string, items: string[]) => {
    if (items.length === 0) return;
    out.push(`  ${title}:`);
    for (const i of items) out.push(`    - ${i}`);
  };
  dxBlock("Primary", doc.diagnoses.primary.length ? doc.diagnoses.primary : []);
  if (doc.diagnoses.primary.length === 0) out.push(`  Primary: ${BLANK}`);
  dxBlock("Secondary", doc.diagnoses.secondary);
  dxBlock("Relevant comorbidities", doc.diagnoses.comorbidities);
  dxBlock("Complications", doc.diagnoses.complications);

  if (doc.procedures.length > 0) {
    heading("Operation / procedures");
    for (const p of doc.procedures) for (const l of procedureLines(p)) out.push(`  ${l}`);
  }

  heading("Clinical course");
  out.push(`  ${doc.clinicalCourse || BLANK}`);
  if (!doc.clinicalCourseApproved && doc.clinicalCourse) out.push("  [not yet approved by the resident]");

  if (doc.investigations.length > 0) {
    heading("Relevant investigations and results");
    for (const i of doc.investigations)
      out.push(`  ${i.group}: ${i.text}${i.interpretation ? ` — ${i.interpretation}` : ""}`);
  }

  if (doc.histopathology.length > 0) {
    heading("Histopathology");
    for (const h of doc.histopathology) {
      out.push(`  Specimen: ${h.specimen}`);
      if (h.dateSent) out.push(`    Date sent: ${istDay(h.dateSent)}`);
      out.push(`    Status: ${h.status}`);
      if (h.result) out.push(`    Result: ${h.result}`);
      if (h.reviewPlan) out.push(`    Review plan: ${h.reviewPlan}`);
    }
  }

  heading("Medications on discharge");
  if (doc.medications.length === 0) out.push(`  ${BLANK}`);
  doc.medications.forEach((m, i) => out.push(`  ${i + 1}. ${medLine(m)}`));

  heading("Condition at discharge");
  out.push(`  ${doc.condition || BLANK}`);

  heading("Primary care actions");
  if (doc.primaryCareActions.length === 0) out.push("  None.");
  for (const a of doc.primaryCareActions) out.push(`  - ${a}`);

  heading("Patient actions");
  if (doc.patientActions.length === 0) out.push("  None.");
  for (const a of doc.patientActions) out.push(`  - ${a}`);

  if (doc.advice && doc.advice.length > 0) {
    heading("Advice");
    for (const a of doc.advice) out.push(`  ${a.module}: ${a.text}`);
  }

  if (doc.redFlags && doc.redFlags.length > 0) {
    heading("When to seek medical attention");
    for (const r of doc.redFlags) out.push(`  - ${r}`);
  }

  heading("Authentication");
  out.push(`  ${doc.authentication.name || BLANK}`);
  if (doc.authentication.designation) out.push(`  ${doc.authentication.designation}`);
  if (doc.authentication.department) out.push(`  ${doc.authentication.department}`);
  out.push(`  Completed: ${doc.authentication.completedAt || BLANK}`);
  if (doc.authentication.seniorReviewer) out.push(`  Senior reviewer: ${doc.authentication.seniorReviewer}`);

  return out.join("\n");
}

export { istDay as dischargeDocIstDay, istDateTime as dischargeDocIstDateTime, medLine, procedureLines };
