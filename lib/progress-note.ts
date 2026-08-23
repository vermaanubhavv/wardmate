import { dayLabel, managementLabel, stripPatientHonorific } from "@/lib/patients";
import { summariseObjective, type ObjectiveSummary } from "@/lib/exam-summary";
import type { Observation } from "@/lib/patient-state";

/** What the app cannot know and must not invent: a label and a blank to write on — the same
 *  convention lib/discharge.ts uses, so a printed page never looks like it is missing a field
 *  by accident. */
const BLANK = "________________";

export type ProgressNotePatient = {
  display_name: string;
  age_years: number | null;
  sex: string | null;
  bed: string;
  uhid_ip_no: string | null;
  mrd_no: string | null;
  admitted_on: string;
};

export type ProgressNote = {
  header: {
    name: string;
    ageSex: string;
    /** Split out from ageSex, for a form whose "Age" and "Sex" are separate boxes. */
    age: string;
    sex: string;
    uhid: string | null;
    doa: string;
    unit: string | null;
    bed: string;
    ipd: string | null;
  };
  dateTime: string;
  diagnosis: string | null;
  /** The Observation column, one line each. Empty array means nothing was said today. */
  observation: string[];
  /** The Investigation/Treatment/Management column. */
  plan: string[];
};

const istDay = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  });

/**
 * Today's entry in the paper form's own shape: Observation on one side, what was
 * decided/ordered on the other.
 *
 * Scoped deliberately to observations recorded TODAY, not the patient's running state — a
 * progress sheet is a record of one day's round, and pulling in a value from three days ago
 * because nothing newer exists would misdate it. A day nobody rounded on this patient prints an
 * empty note rather than yesterday's, which is the honest answer: nobody wrote anything today.
 *
 * Nothing here is composed into a sentence the resident did not say. Every line is either the
 * exam summary this app already shows on Current progress (same function, same rules) or one
 * finding/plan per line, in the words recorded. The blank lines under each section are for the
 * resident to fill by hand — this is a form, not a finished note.
 */
export function buildProgressNote(
  patient: ProgressNotePatient,
  todaysObservations: Observation[],
  diagnosis: string | null,
  options?: { wardName?: string | null; sex?: string | null }
): ProgressNote {
  const now = new Date();

  const subjective = todaysObservations.filter(
    (o) => o.kind === "note" && !/comorbid/i.test(o.label)
  );
  const examLike = todaysObservations.filter((o) =>
    ["vital", "exam", "drain", "intake_output", "lab"].includes(o.kind)
  );
  const plans = todaysObservations.filter((o) => o.kind === "plan");
  const meds = todaysObservations.filter((o) => o.kind === "medication");

  const exam: ObjectiveSummary = summariseObjective(
    examLike.map((o) => ({
      id: o.id,
      label: o.label,
      value: o.value_text,
      refLow: o.ref_low,
      refHigh: o.ref_high,
      refText: o.ref_text,
    })),
    { sex: options?.sex ?? patient.sex }
  );

  const observation: string[] = [];
  for (const o of subjective) observation.push(o.value_text ?? o.label);
  if (exam.vitals.length > 0) {
    observation.push(exam.vitals.map((v) => `${v.label} ${v.value}`).join("  "));
  }
  if (exam.piccle) observation.push(exam.piccle.text);
  for (const f of exam.findings) observation.push(`${f.label}: ${f.value}`);
  for (const l of exam.labs) {
    observation.push(`${l.label} ${l.value}${l.flag ? ` (${l.flag})` : ""}`);
  }
  // Examined and plainly normal — "P/Abd: Soft, Non tender, NAD" on the physical form this
  // follows. Without this line a clean exam prints as though it was never done at all, which
  // is a worse gap than the line itself being terse.
  if (exam.normalCount > 0) observation.push("Rest — NAD");

  const planLines: string[] = [];
  for (const m of meds) planLines.push(m.value_text ?? m.label);
  for (const p of plans) planLines.push(p.value_text ?? p.label);

  return {
    header: {
      name: stripPatientHonorific(patient.display_name).toUpperCase(),
      ageSex:
        [patient.age_years !== null ? `${patient.age_years}` : null, sexWord(patient.sex)]
          .filter(Boolean)
          .join(" / ") || "",
      age: patient.age_years !== null ? `${patient.age_years}` : "",
      sex: sexWord(patient.sex),
      uhid: patient.uhid_ip_no,
      doa: istDay(patient.admitted_on),
      unit: options?.wardName ?? null,
      bed: patient.bed,
      ipd: patient.mrd_no,
    },
    dateTime: now.toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }),
    diagnosis,
    observation,
    plan: planLines,
  };
}

function sexWord(sex: string | null): string {
  if (!sex) return "";
  const s = sex.toLowerCase();
  return s === "male" || s === "m" ? "M" : s === "female" || s === "f" ? "F" : sex;
}

/** The plain-text version, for pasting into WhatsApp or an EMR field that only takes text. */
export function formatProgressNoteText(note: ProgressNote): string {
  const out: string[] = [];
  out.push(`${note.header.name}  ${note.header.ageSex}${note.header.bed ? `  Bed ${note.header.bed}` : ""}`);
  if (note.header.uhid) out.push(`UHID: ${note.header.uhid}`);
  out.push(`${note.dateTime}`);
  out.push("");
  if (note.diagnosis) out.push(`Dx: ${note.diagnosis}`);
  if (note.observation.length > 0) {
    out.push(...note.observation);
  } else {
    out.push(BLANK);
  }
  out.push("");
  out.push("Plan:");
  if (note.plan.length > 0) {
    out.push(...note.plan.map((l) => `- ${l}`));
  } else {
    out.push(`- ${BLANK}`);
  }
  out.push("");
  out.push("Signature: " + BLANK);
  out.push("");
  out.push(
    "* This note is generated from what was recorded in WardMate. It is not valid until signed by the treating doctor."
  );
  return out.join("\n");
}

export { BLANK };
