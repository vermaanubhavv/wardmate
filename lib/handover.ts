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
import { readsChemoColumns, usesBurnClock } from "@/lib/specialty/clocks";
import { hasOperationClock } from "@/lib/specialty/intake";
import { effectiveUrgency, istDate, jobTitle, URGENCY_META } from "@/lib/urgency";
import { displayValue, isUnreadable } from "@/lib/display-value";
import { classifyLab, type SuppliedRange } from "@/lib/lab-ranges";

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
export function deriveDoneToday(
  rawObservations: Observation[],
  doneTasks: Observation[],
  todayKey: string,
  /** A unit that operates says "Operated"; a chemoport or a tap on a medical unit is not one. */
  operative = true
): DoneTodayItem[] {
  const items: DoneTodayItem[] = [];

  for (const o of rawObservations) {
    if (o.kind === "lab" && istDate(o.recorded_at) === todayKey) {
      items.push({ id: o.id, text: `${o.label}${o.value_text ? `: ${displayValue(o.value_text)}` : ""}` });
    } else if (o.kind === "procedure_done" && istDate(o.recorded_at) === todayKey) {
      items.push({ id: o.id, text: `${operative ? "Operated" : "Procedure done"}: ${o.value_text ?? o.label}` });
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
    (readsChemoColumns(pack) ? CHEMO_PATIENT_COLUMNS : "") +
    (usesBurnClock(pack) ? BURN_PATIENT_COLUMNS : "");

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

  // The entries, the operation names and each patient's checklist need only the rows, so they
  // go out together rather than one after another — and the checklists not one patient at a
  // time: patients on the same operation share one read (getTemplateForPatient is cached per
  // request on family/variant/phase).
  const [{ data: entries }, procedures, templates] = await Promise.all([
    // Every observation on the ward in one query, newest first, so grouping by patient below
    // preserves the newest-first order derivePatientState relies on to pick the latest value.
    supabase
      .from("entries")
      .select(
        "patient_id, observations(id, kind, label, value_text, unit, source_quote, needs_confirmation, confirmed_at, conflict_note, done_at, urgency, graded_at, recorded_at, ref_low, ref_high, ref_text)"
      )
      .in(
        "patient_id",
        rows.map((p) => p.id)
      )
      .order("recorded_at", { ascending: false }),
    getProcedureLabels(pack.key),
    Promise.all(rows.map((p) => getTemplateForPatient(p))),
  ]);

  const byPatient = new Map<string, Observation[]>();
  for (const entry of (entries ?? []) as unknown as {
    patient_id: string;
    observations: Observation[];
  }[]) {
    const list = byPatient.get(entry.patient_id) ?? [];
    list.push(...entry.observations);
    byPatient.set(entry.patient_id, list);
  }

  const todayKey = istDate(generated_at);

  const out: HandoverPatient[] = [];
  for (const [i, p] of rows.entries()) {
    const template = templates[i];
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
      doneToday: deriveDoneToday(rawObs, state.doneTasks, todayKey, hasOperationClock(pack)),
    });
  }

  return { ward, pack, patients: out, generated_at };
}

/**
 * The handover in three groups, so it can be read aloud at shift change in a couple of minutes:
 *
 * - Watch tonight: a job that is red as of today (graded Now, or a Soon that has come due), or
 *   a value still waiting to be checked.
 * - Jobs open, none due: jobs outstanding, nothing pressing — one line each.
 * - Nothing outstanding: no jobs, nothing to check — a single line of beds.
 *
 * Template gaps alone do not put a patient on watch: nearly every patient has one, so ranking
 * on them would sort nothing. Beds keep their order within each group.
 */
export function handoverGroups(patients: HandoverPatient[]) {
  const watch = patients.filter(needsWatch);
  const rest = patients.filter((p) => !needsWatch(p));
  return {
    watch,
    jobsOpen: rest.filter((p) => p.state.openTasks.length > 0),
    clear: rest.filter((p) => p.state.openTasks.length === 0),
  };
}

function needsWatch(p: HandoverPatient): boolean {
  return p.state.pending.length > 0 || p.state.openTasks.some((t) => effectiveUrgency(t).urgency === "red");
}

/**
 * A patient's values waiting to be checked, said in one line rather than one line each: one
 * blood count used to turn into fifteen orange lines and push every other patient off the
 * screen. Only values the report itself flagged high or low (against its printed range, or the
 * built-in one) are named, as printed; the rest are counted. An unreadable value is counted as
 * such, never shown as a number.
 */
export function checkSummary(pending: Observation[], sex: string | null) {
  const flagged: string[] = [];
  let unreadable = 0;
  for (const o of pending) {
    if (isUnreadable(o.value_text)) {
      unreadable++;
      continue;
    }
    if (o.kind !== "lab") continue;
    const supplied: SuppliedRange | null =
      o.ref_low != null || o.ref_high != null
        ? { low: o.ref_low ?? null, high: o.ref_high ?? null, text: o.ref_text ?? null, source: "report" }
        : null;
    const reading = classifyLab(o.label, o.value_text, sex, supplied);
    if (reading?.flag === "low" || reading?.flag === "high") {
      flagged.push(`${o.label} ${reading.value}${o.unit ? ` ${o.unit}` : ""} ${reading.flag === "low" ? "L" : "H"}`);
    }
  }
  return { total: pending.length, flagged, unreadable };
}

/** "21 values to check — flagged on the report: Hb 9.8 L, …; 2 unreadable". */
export function checkSummaryText(s: ReturnType<typeof checkSummary>): string {
  const parts = [`${s.total} ${s.total === 1 ? "value" : "values"} to check`];
  if (s.flagged.length > 0) parts.push(`flagged: ${s.flagged.join(", ")}`);
  if (s.unreadable > 0) parts.push(`${s.unreadable} unreadable`);
  return parts.join(" — ");
}

/** A job as the handover says it: the words, and when it was due if it has come due. */
function jobLine(t: Observation): string {
  const effective = effectiveUrgency(t);
  // Urgency is spelt out rather than coloured: a handover message has no colours, and "NOW"
  // carries in plain text where a red dot would simply be lost.
  const mark = effective.urgency ? `[${URGENCY_META[effective.urgency].label.toUpperCase()}] ` : "";
  const note = effective.note ? ` (${effective.note})` : "";
  return `${mark}${jobTitle(t.value_text ?? t.label, t.recorded_at)}${note}`;
}

/**
 * The plain-text handover, for the unit's WhatsApp group — the same three groups as the screen,
 * so what is read off the phone and what is pasted say the same thing.
 */
export function formatHandoverText(handover: WardHandover): string {
  const when = new Date(handover.generated_at).toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });

  const n = handover.patients.length;
  const lines: string[] = [`*${handover.ward.name} handover*, ${when}`, `${n} ${n === 1 ? "patient" : "patients"}`];

  if (n === 0) {
    lines.push("", "No active patients.");
    return lines.join("\n");
  }

  const { watch, jobsOpen, clear } = handoverGroups(handover.patients);
  const heading = (p: HandoverPatient) => {
    const management = managementLabel(p, handover.pack);
    return `Bed ${p.bed} · ${patientName(p)} · ${dayLabel(p, handover.pack)}${p.procedure ? ` ${p.procedure}` : ""} · ${p.primary_diagnosis || "no diagnosis recorded"}${management ? ` · ${management}` : ""}`;
  };

  if (watch.length > 0) {
    lines.push("", "*WATCH TONIGHT*");
    for (const p of watch) {
      lines.push(heading(p));
      for (const d of p.doneToday) lines.push(`- Today: ${d.text}`);
      for (const t of p.state.openTasks) lines.push(`- ${jobLine(t)}`);
      if (p.state.pending.length > 0) lines.push(`- ${checkSummaryText(checkSummary(p.state.pending, p.sex))}`);
      if (p.state.missing.length > 0) {
        lines.push(`- Not yet recorded: ${p.state.missing.map((m) => m.item.label).join(", ")}`);
      }
      lines.push("");
    }
    lines.pop();
  }

  if (jobsOpen.length > 0) {
    lines.push("", "*JOBS OPEN, NONE DUE*");
    for (const p of jobsOpen) {
      lines.push(`Bed ${p.bed} · ${patientName(p)}`);
      for (const t of p.state.openTasks) lines.push(`- ${jobLine(t)}`);
    }
  }

  if (clear.length > 0) {
    lines.push("", `*NOTHING OUTSTANDING (${clear.length})*`);
    lines.push(clear.map((p) => `${p.bed} ${patientName(p)}`).join(" · "));
  }

  return lines.join("\n").trimEnd();
}
