import { createClient } from "@/lib/supabase/server";
import { compareBeds, dayLabel, managementLabel, patientName } from "@/lib/patients";
import {
  getTemplateForPatient,
  getProcedureLabels,
  procedureKey,
  type CareTemplate,
} from "@/lib/templates";
import { derivePatientState, type Observation, type PatientState } from "@/lib/patient-state";

export type HandoverPatient = {
  id: string;
  display_name: string;
  age_years: number | null;
  sex: string | null;
  bed: string;
  primary_diagnosis: string | null;
  post_op_day: number | null;
  admission_day: number;
  template: CareTemplate | null;
  /** The operation recorded against this patient, for those who have had one. */
  procedure: string | null;
  surgery_date: string | null;
  management: string | null;
  state: PatientState;
};

export type WardHandover = {
  ward: { id: string; name: string };
  patients: HandoverPatient[];
  generated_at: string;
};

/**
 * The whole ward's current state in one pass, for reading off at end of round rather than
 * opening every patient in turn. Reuses exactly the logic the bedside screen uses per patient
 * (derivePatientState) so the two never disagree about what counts as outstanding.
 */
export async function getWardHandover(ward: { id: string; name: string }): Promise<WardHandover> {
  const generated_at = new Date().toISOString();
  const supabase = await createClient();

  const { data: patients } = await supabase
    .from("current_patients")
    .select(
      "id, display_name, age_years, sex, bed, primary_diagnosis, post_op_day, admission_day, surgery_date, template_family, template_variant, management"
    )
    .eq("ward_id", ward.id)
    .eq("status", "active");

  const rows = (patients ?? []).slice().sort((a, b) => compareBeds(a.bed, b.bed));
  if (rows.length === 0) return { ward, patients: [], generated_at };

  // Every observation on the ward in one query, newest first, so grouping by patient below
  // preserves the newest-first order derivePatientState relies on to pick the latest value.
  const { data: entries } = await supabase
    .from("entries")
    .select(
      "patient_id, observations(id, kind, label, value_text, unit, source_quote, needs_confirmation, confirmed_at, conflict_note, done_at, recorded_at)"
    )
    .in(
      "patient_id",
      rows.map((p) => p.id)
    )
    .order("recorded_at", { ascending: false });

  const byPatient = new Map<string, Observation[]>();
  for (const entry of (entries ?? []) as unknown as {
    patient_id: string;
    observations: Observation[];
  }[]) {
    const list = byPatient.get(entry.patient_id) ?? [];
    list.push(...entry.observations);
    byPatient.set(entry.patient_id, list);
  }

  const procedures = await getProcedureLabels();

  const out: HandoverPatient[] = [];
  for (const p of rows) {
    const template = await getTemplateForPatient(p);
    const state = derivePatientState(byPatient.get(p.id) ?? [], template);
    const key = procedureKey(p);
    const procedure = p.post_op_day !== null && key ? (procedures.get(key) ?? null) : null;
    out.push({ ...p, template, procedure, state });
  }

  return { ward, patients: out, generated_at };
}

/**
 * A plain-text version of the same handover, in the order it's read off the screen — meant to
 * be copied straight into the unit's handover message. Deliberately only the things that need
 * someone's attention (jobs, unconfirmed values, template gaps), the same filter the ward list
 * badges already use, not a full reproduction of every value on the chart.
 */
export function formatHandoverText(handover: WardHandover): string {
  const when = new Date(handover.generated_at).toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });

  const lines: string[] = [`${handover.ward.name} — ward round`, when, ""];

  if (handover.patients.length === 0) {
    lines.push("No active patients.");
    return lines.join("\n");
  }

  for (const p of handover.patients) {
    const management = managementLabel(p);
    lines.push(
      `${p.bed} · ${patientName(p)} · ${dayLabel(p)}${p.procedure ? ` ${p.procedure}` : ""} · ${p.primary_diagnosis || "no diagnosis recorded"}${management ? ` · ${management}` : ""}`
    );

    const { openTasks, pending, missing } = p.state;
    if (openTasks.length === 0 && pending.length === 0 && missing.length === 0) {
      lines.push("  Nothing outstanding.");
    } else {
      for (const t of openTasks) lines.push(`  To do: ${t.value_text ?? t.label}`);
      for (const o of pending) {
        lines.push(`  Confirm: ${o.label}${o.value_text ? ` — ${o.value_text}` : ""}`);
      }
      if (missing.length > 0) {
        lines.push(`  Not yet recorded: ${missing.map((m) => m.item.label).join(", ")}`);
      }
    }
    lines.push("");
  }

  return lines.join("\n").trimEnd();
}
