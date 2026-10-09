import type { Supa } from "@/lib/supabase/server";
import type { ExtractedObservation } from "@/lib/extract";
import type { ReadLabValue } from "@/lib/read-lab-photo";

type DayPatient = { post_op_day: number | null; admission_day: number };

/**
 * A stated day number is stored as said, and flagged when it disagrees with the day computed
 * from the dates on record. Neither one silently wins — the resident decides.
 */
export function dayConflict(
  o: { kind: string; value_num: number | null },
  patient: DayPatient,
  verb: "said" | "wrote" = "said"
): string | null {
  if (o.kind !== "day_number" || o.value_num === null) return null;

  const computed = patient.post_op_day ?? patient.admission_day;
  const label = patient.post_op_day !== null ? "post-op day" : "day of admission";

  if (Math.round(o.value_num) === computed) return null;
  return `You ${verb} day ${o.value_num}; recorded dates give ${label} ${computed}.`;
}

/**
 * Stores an entry's extracted values, each tied to the entry and its verbatim quote. forceConfirm
 * holds every row amber regardless of what the extractor said. Returns the insert error, or null.
 */
export async function insertObservations(
  supabase: Supa,
  entryId: string,
  patientId: string,
  patient: DayPatient,
  observations: ExtractedObservation[],
  opts: { forceConfirm?: boolean; verb?: "said" | "wrote" } = {}
): Promise<string | null> {
  if (observations.length === 0) return null;
  const rows = observations.map((o) => ({
    entry_id: entryId,
    patient_id: patientId,
    kind: o.kind,
    label: o.label,
    value_text: o.value_text,
    value_num: o.value_num,
    unit: o.unit,
    source_quote: o.source_quote,
    needs_confirmation: opts.forceConfirm || o.needs_confirmation,
    urgency: o.urgency,
    pac_verdict: o.pac_verdict,
    task_open: o.task_open ?? null,
    task_category: o.task_category ?? null,
    conflict_note: dayConflict(o, patient, opts.verb),
  }));
  const { error } = await supabase.from("observations").insert(rows);
  return error?.message ?? null;
}

/**
 * The fields a value read off a lab-report photo is stored with. Every one needs confirming —
 * these are numbers, with no automatic check behind them — and an unclear one says so. The
 * range is the one printed beside this very result.
 */
export function labRow(v: ReadLabValue) {
  return {
    label: v.label,
    value_text: v.value_text,
    value_num: v.value_num,
    unit: v.unit,
    source_quote: v.source_quote,
    needs_confirmation: true,
    ref_low: v.ref_low,
    ref_high: v.ref_high,
    ref_text: v.ref_text,
    conflict_note: v.uncertain ? "Printing was unclear — check against the photo." : null,
  };
}
