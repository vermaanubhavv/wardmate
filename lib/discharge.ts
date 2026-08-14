import { dayLabel, managementLabel, patientName } from "@/lib/patients";
import type { PatientState } from "@/lib/patient-state";

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

/**
 * The discharge brief, assembled from what is on the record.
 *
 * Deliberately assembled rather than written. Nothing here is generated: every line is a
 * value the resident said or photographed, laid out in the order a discharge note is read.
 * That is not a shortcut — a discharge summary is the one document from a ward round that
 * leaves the hospital with the patient, and a model writing prose over these values would be
 * free to smooth over the gaps. The gaps are the useful part: a brief that says "not
 * recorded" is telling the resident what to go and check before anybody signs it.
 *
 * So this is a starting point to correct and paste, never a finished summary.
 */
export function buildDischargeBrief(
  patient: DischargePatient,
  state: PatientState,
  medications: { label: string; value_text: string | null }[],
  procedure: string | null
): string {
  const lines: string[] = [];

  const dates = (iso: string) =>
    new Date(iso).toLocaleDateString("en-IN", {
      timeZone: "Asia/Kolkata",
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  lines.push(patientName(patient));
  lines.push(`Bed ${patient.bed}`);
  lines.push("");

  lines.push(`Diagnosis: ${patient.primary_diagnosis || "not recorded"}`);
  if (procedure) {
    lines.push(
      `Operation: ${procedure}${patient.surgery_date ? ` on ${dates(patient.surgery_date)}` : ""}`
    );
  }
  const management = managementLabel(patient);
  if (management) lines.push(`Management: ${management}`);
  lines.push(`Admitted: ${dates(patient.admitted_on)}`);
  lines.push(`Today: ${dayLabel(patient)}`);
  lines.push("");

  // Where the patient stands, in the operation's own order where there is a template.
  lines.push("On discharge:");
  const stand = [
    ...state.matched.filter((m) => m.value).map((m) => `  ${m.item.label}: ${m.value}`),
    ...state.extra
      .filter((o) => o.kind !== "medication")
      .map((o) => `  ${o.label}: ${o.value_text}`),
  ];
  lines.push(stand.length > 0 ? stand.join("\n") : "  nothing recorded");
  lines.push("");

  if (medications.length > 0) {
    lines.push("Medications recorded:");
    for (const m of medications) lines.push(`  ${m.label}${m.value_text ? `: ${m.value_text}` : ""}`);
    lines.push("");
  }

  // What is still outstanding. On a discharge brief these read as what has to happen before
  // the patient goes, or as what follow-up they leave with — either way they belong here
  // rather than being quietly dropped because the admission is ending.
  if (state.openTasks.length > 0) {
    lines.push("Still outstanding:");
    for (const t of state.openTasks) lines.push(`  ${t.value_text ?? t.label}`);
    lines.push("");
  }

  if (state.pending.length > 0) {
    lines.push(`${state.pending.length} value(s) never confirmed — check before signing:`);
    for (const o of state.pending) {
      lines.push(`  ${o.label}${o.value_text ? `: ${o.value_text}` : ""}`);
    }
    lines.push("");
  }

  if (state.missing.length > 0) {
    lines.push(`Never recorded: ${state.missing.map((m) => m.item.label).join(", ")}`);
    lines.push("");
  }

  lines.push("Assembled from what was recorded on the round. Check before signing.");

  return lines.join("\n").trimEnd();
}
