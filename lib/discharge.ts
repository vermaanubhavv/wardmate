import { dayLabel, managementLabel } from "@/lib/patients";
import type { Observation, PatientState } from "@/lib/patient-state";

export type DischargePatient = {
  display_name: string;
  age_years: number | null;
  sex: string | null;
  bed: string;
  primary_diagnosis: string | null;
  admitted_on: string;
  surgery_date: string | null;
  post_op_day: number | null;
  admission_day: number;
  management: string | null;
};

/** What the app cannot know and must not invent: a label and a blank to write on. */
const BLANK = "____________________";

const istDay = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  });

/**
 * The discharge summary, in the unit's own layout.
 *
 * Built from the unit's actual form rather than a generic one, because a summary that has to be
 * retyped into the real format has saved nobody anything. The order, the headings and the
 * wording of the labels are the unit's.
 *
 * Two rules run through it, the same two the rest of the app follows.
 *
 * Nothing is invented. Every value printed was said or photographed on a round. The narrative
 * sections of a real summary — the history, the course in hospital — are the work of a doctor
 * who saw the patient, so they print as headings with the round's own notes beneath, to be
 * written up. A model composing "patient presented with complaints of…" out of four vitals
 * would be writing fiction into a document that leaves the hospital with the patient.
 *
 * Nothing absent is hidden. A field with no value prints as a blank line rather than as
 * silence, so what still needs filling is visible before signing rather than discovered by
 * whoever reads it next.
 *
 * The identifiers are deliberately blank. Insurance number, MRD number and IP/family are on
 * the form and this app does not hold them, by design — it stores a name and a bed. That is
 * worth keeping even at the cost of three lines of handwriting per discharge.
 */
export function buildDischargeBrief(
  patient: DischargePatient,
  state: PatientState,
  medications: Observation[],
  procedure: string | null,
  options?: { letterhead?: string | null; wardName?: string | null }
): string {
  const out: string[] = [];
  const today = new Date().toISOString();

  if (options?.letterhead?.trim()) out.push(options.letterhead.trim(), "");

  out.push("DISCHARGE SUMMARY", "");

  out.push(`NAME – ${patient.display_name.toUpperCase()}`);
  out.push(`AGE – ${patient.age_years !== null ? `${patient.age_years} YEARS` : BLANK}`);
  out.push(`SEX – ${sexWord(patient.sex)}`);
  out.push(`INS. NO./EMP ID – ${BLANK}`);
  out.push(`MRD NO. ${BLANK}`);
  out.push(`IP/FAMILY – ${BLANK}`);
  out.push(`WARD – ${(options?.wardName ?? "GENERAL SURGERY").toUpperCase()}`);
  out.push(`D.O.A – ${istDay(patient.admitted_on)}`);
  out.push(`D.O.D – ${istDay(today)}`);
  out.push("");

  out.push(`FINAL DIAGNOSIS: ${(patient.primary_diagnosis || BLANK).toUpperCase()}`);
  if (procedure) {
    out.push(
      `PROCEDURE: ${procedure.toUpperCase()}${
        patient.surgery_date ? ` ON ${istDay(patient.surgery_date)}` : ""
      }`
    );
  }
  out.push("");

  out.push("HISTORY AND COURSE IN HOSPITAL");
  const notes = kinds(state, ["note", "diagnosis"]);
  if (notes.length > 0) {
    out.push("  Recorded on the round — to be written up:");
    for (const o of notes) out.push(`  · ${o.value_text ?? o.label}`);
  } else {
    out.push(`  ${BLANK}`);
  }
  out.push("");

  out.push("CONDITION AT DISCHARGE –");
  const vitals = kinds(state, ["vital"]);
  const exam = kinds(state, ["exam", "drain", "intake_output"]);
  if (vitals.length > 0) {
    out.push("  " + vitals.map((o) => `${o.label.toUpperCase()} ${o.value_text}`).join("   "));
  } else {
    out.push(`  BP – ${BLANK}   PR – ${BLANK}`);
  }
  if (exam.length > 0) {
    for (const o of exam) out.push(`  ${o.label.toUpperCase()} – ${o.value_text}`);
  } else {
    out.push(`  P/ABD – ${BLANK}`);
  }
  out.push("");

  // Grouped by the day they were recorded, which is how the form's table is read across.
  out.push("INVESTIGATIONS DONE DURING STAY");
  const labs = kinds(state, ["lab"]);
  if (labs.length === 0) {
    out.push(`  ${BLANK}`);
  } else {
    const byDate = new Map<string, Observation[]>();
    for (const o of labs) {
      const d = istDay(o.recorded_at);
      byDate.set(d, [...(byDate.get(d) ?? []), o]);
    }
    for (const [date, rows] of byDate) {
      out.push(`  ${date}   ${rows.map((o) => `${o.label} ${o.value_text}`).join("   ")}`);
    }
  }
  out.push("");

  out.push("ADVICE ON DISCHARGE");
  if (medications.length > 0) {
    // As said. The form has columns for dose, frequency and duration, and splitting "one gram
    // twice daily for five days" between them would be the app deciding which part is which.
    for (const m of medications) {
      out.push(`  ${m.label.toUpperCase()}   ${m.value_text ?? ""}`.trimEnd());
    }
  } else {
    out.push(`  ${BLANK}`);
  }
  out.push("");

  // Plans spoken on a round are follow-up advice at a discharge, so they belong here rather
  // than being dropped because the admission is ending.
  if (state.openTasks.length > 0) {
    out.push("FOLLOW UP — still outstanding on the round:");
    for (const t of state.openTasks) out.push(`  · ${t.value_text ?? t.label}`);
    out.push("");
  }

  out.push(`REVIEW IN OPD ON ${BLANK}`);
  out.push("");

  // Anything a signature would be vouching for that nobody has checked.
  if (state.pending.length > 0) {
    out.push(`!! ${state.pending.length} value(s) here were never confirmed — check first:`);
    for (const o of state.pending) {
      out.push(`   ${o.label}${o.value_text ? `: ${o.value_text}` : ""}`);
    }
    out.push("");
  }
  if (state.missing.length > 0) {
    out.push(`!! Never recorded: ${state.missing.map((m) => m.item.label).join(", ")}`);
    out.push("");
  }

  out.push("NAME AND SIGNATURE OF DOCTOR");
  out.push("");

  const management = managementLabel(patient);
  out.push(
    `— Assembled from what was recorded on the round (${dayLabel(patient)}${
      management ? `, ${management}` : ""
    }). Blanks are things the app was never told. Check before signing.`
  );

  return out.join("\n");
}

function sexWord(sex: string | null): string {
  if (sex === "M") return "MALE";
  if (sex === "F") return "FEMALE";
  if (sex === "other") return "OTHER";
  return BLANK;
}

/**
 * The newest value for each thing of the given kinds.
 *
 * From `latest` rather than `extra`: `extra` holds only what the operation's checklist did not
 * ask about, so building a summary from it would silently omit every value the template DOES
 * expect — the haemoglobin and the drain output, which is most of what a discharge needs.
 */
function kinds(state: PatientState, wanted: string[]): Observation[] {
  return state.latest.filter((o) => wanted.includes(o.kind));
}
