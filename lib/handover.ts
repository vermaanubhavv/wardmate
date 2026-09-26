import { createClient } from "@/lib/supabase/server";
import { compareBeds, dayLabel, managementLabel, patientName } from "@/lib/patients";
import {
  getTemplateForPatient,
  getProcedureLabels,
  procedureFor,
  type CareTemplate,
} from "@/lib/templates";
import { derivePatientState, type Observation, type PatientState } from "@/lib/patient-state";
import { getSpecialtyPack, type SpecialtyPack } from "@/lib/specialty";
import { getWardSpecialtyStored } from "@/lib/ward";
import { effectiveUrgency, istDate, URGENCY_META } from "@/lib/urgency";

/** One line of what actually happened today — a resulted investigation, the operation if
 *  done today, or a job ticked off. Deliberately NOT "everything recorded today": routine
 *  vitals and medication-administration entries are excluded on purpose, so a WhatsApp
 *  update stays scannable rather than becoming the whole chart. See deriveDoneToday(). */
export type DoneTodayItem = { id: string; text: string };

export type HandoverPatient = {
  id: string;
  display_name: string;
  age_years: number | null;
  sex: string | null;
  bed: string;
  primary_diagnosis: string | null;
  post_op_day: number | null;
  admission_day: number;
  regimen: string | null;
  cycle_number: number | null;
  cycle_day: number | null;
  template: CareTemplate | null;
  /** The operation recorded against this patient, for those who have had one. */
  procedure: string | null;
  surgery_date: string | null;
  management: string | null;
  state: PatientState;
  doneToday: DoneTodayItem[];
};

/**
 * What counts as a "meaningful clinical event" for the day, rather than everything the
 * chart grew by: a resulted investigation (kind "lab"), the operation itself if it
 * happened today (kind "procedure_done" — see lib/apply-procedure-done.ts), and any job
 * actually ticked off today (state.doneTasks, filtered to today's done_at). Vitals and
 * medication-administration entries are recorded constantly through the day and would
 * drown the two or three things worth telling a consultant about, so neither kind is
 * included here — see the confirmed scope in the plan this was built from.
 */
export function deriveDoneToday(rawObservations: Observation[], doneTasks: Observation[], todayKey: string): DoneTodayItem[] {
  const items: DoneTodayItem[] = [];

  for (const o of rawObservations) {
    if (o.kind === "lab" && istDate(o.recorded_at) === todayKey) {
      items.push({ id: o.id, text: `${o.label}${o.value_text ? `: ${o.value_text}` : ""}` });
    } else if (o.kind === "procedure_done" && istDate(o.recorded_at) === todayKey) {
      items.push({ id: o.id, text: `Operated: ${o.value_text ?? o.label}` });
    }
  }

  for (const t of doneTasks) {
    if (t.done_at && istDate(t.done_at) === todayKey) {
      items.push({ id: t.id, text: t.value_text ?? t.label });
    }
  }

  return items;
}

export type WardHandover = {
  ward: { id: string; name: string };
  /** The unit's specialty pack — it decides how each patient's day is named below. */
  pack: SpecialtyPack;
  patients: HandoverPatient[];
  generated_at: string;
};

/**
 * The whole ward's current state in one pass, for reading off at end of round rather than
 * opening every patient in turn. Reuses exactly the logic the bedside screen uses per patient
 * (derivePatientState) so the two never disagree about what counts as outstanding.
 */
const BASE_PATIENT_COLUMNS =
  "id, display_name, age_years, sex, bed, primary_diagnosis, post_op_day, admission_day, surgery_date, template_family, template_variant, procedure_text, management";

/** The chemotherapy columns patch 0060 adds. Only ever asked for when the unit is an oncology
 *  unit — and a unit can only BE an oncology unit if 0060 has run, so naming them can never
 *  reject the query on a database that has not been migrated. */
const CHEMO_PATIENT_COLUMNS = ", regimen, cycle_number, cycle_day";

/** The burn columns patch 0085 adds, asked for on a burns unit only — same reasoning as the
 *  chemotherapy ones above. Without them a burns handover would print hospital days beside
 *  patients the ward counts in post-burn days. */
const BURN_PATIENT_COLUMNS = ", burn_date, burn_day";

/** The row those columns come back as. Written out because the column list is chosen at
 *  runtime, which is more than the Supabase client's select-string typing can follow. */
type HandoverRow = {
  id: string;
  display_name: string;
  age_years: number | null;
  sex: string | null;
  bed: string;
  primary_diagnosis: string | null;
  post_op_day: number | null;
  admission_day: number;
  surgery_date: string | null;
  template_family: string | null;
  template_variant: string | null;
  procedure_text: string | null;
  management: string | null;
  regimen?: string | null;
  cycle_number?: number | null;
  cycle_day?: number | null;
  burn_date?: string | null;
  burn_day?: number | null;
};

export async function getWardHandover(ward: { id: string; name: string }): Promise<WardHandover> {
  const generated_at = new Date().toISOString();
  const supabase = await createClient();

  const pack = getSpecialtyPack(await getWardSpecialtyStored(ward.id));
  const PATIENT_COLUMNS =
    BASE_PATIENT_COLUMNS +
    (pack.key === "general_surgery" ? "" : CHEMO_PATIENT_COLUMNS) +
    (pack.key === "burns_plastic_surgery" ? BURN_PATIENT_COLUMNS : "");

  const { data: patients } = await supabase
    .from("current_patients")
    .select(
      PATIENT_COLUMNS
    )
    .eq("ward_id", ward.id)
    .eq("status", "active");

  const rows = ((patients ?? []) as unknown as HandoverRow[])
    .slice()
    .sort((a, b) => compareBeds(a.bed, b.bed));
  if (rows.length === 0) return { ward, pack, patients: [], generated_at };

  // Every observation on the ward in one query, newest first, so grouping by patient below
  // preserves the newest-first order derivePatientState relies on to pick the latest value.
  const { data: entries } = await supabase
    .from("entries")
    .select(
      "patient_id, observations(id, kind, label, value_text, unit, source_quote, needs_confirmation, confirmed_at, conflict_note, done_at, urgency, graded_at, recorded_at)"
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
  const todayKey = istDate(generated_at);

  const out: HandoverPatient[] = [];
  for (const p of rows) {
    const template = await getTemplateForPatient(p);
    const rawObs = byPatient.get(p.id) ?? [];
    const state = derivePatientState(
      rawObs,
      template,
      pack.dayCount(p).n,
      {
        surgeryDate: p.surgery_date,
        cycleDay: p.cycle_day,
        onRegimen: Boolean(p.regimen),
      }
    );
    out.push({
      regimen: null,
      cycle_number: null,
      cycle_day: null,
      ...p,
      template,
      procedure: procedureFor(p, procedures),
      state,
      doneToday: deriveDoneToday(rawObs, state.doneTasks, todayKey),
    });
  }

  return { ward, pack, patients: out, generated_at };
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
      `${p.bed} · ${patientName(p)} · ${dayLabel(p, handover.pack)}${p.procedure ? ` ${p.procedure}` : ""} · ${p.primary_diagnosis || "no diagnosis recorded"}${management ? ` · ${management}` : ""}`
    );

    for (const d of p.doneToday) {
      lines.push(`  Today: ${d.text}`);
    }

    const { openTasks, pending, missing } = p.state;
    if (openTasks.length === 0 && pending.length === 0 && missing.length === 0) {
      lines.push("  Nothing outstanding.");
    } else {
      for (const t of openTasks) {
        // Urgency is spelt out rather than coloured: a handover message has no colours, and
        // "NOW" carries in plain text where a red dot would simply be lost. Graded as of
        // today, so a job that has come due hands over as due.
        const effective = effectiveUrgency(t);
        const mark = effective.urgency
          ? `[${URGENCY_META[effective.urgency].label.toUpperCase()}] `
          : "";
        const note = effective.note ? ` (${effective.note})` : "";
        lines.push(`  To do: ${mark}${t.value_text ?? t.label}${note}`);
      }
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
