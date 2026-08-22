import { matchTemplate, type CareTemplate, type MatchedItem } from "@/lib/templates";
import { effectiveUrgency, urgencyRank, type Urgency } from "@/lib/urgency";
import { dedupeTasks } from "@/lib/dedupe-tasks";
import { isActionableTask } from "@/lib/task-classification";

export type Observation = {
  id: string;
  kind: string;
  label: string;
  value_text: string | null;
  /** The number the resident actually said, when they said one. Extraction fills this only
   *  from a spoken figure — it is never derived from anything else. */
  value_num: number | null;
  unit: string | null;
  source_quote: string;
  needs_confirmation: boolean;
  confirmed_at: string | null;
  conflict_note: string | null;
  done_at: string | null;
  urgency: Urgency;
  graded_at: string | null;
  recorded_at: string;
  /** PAC rows only — see supabase/patches/0042_pac_status.sql. Null on everything else. */
  pac_verdict?: PacVerdict;
  /** The reference range printed beside this result on the report it was read from — see
   *  supabase/patches/0043_lab_reference_ranges.sql. Null for anything not off a report. */
  ref_low?: number | null;
  ref_high?: number | null;
  ref_text?: string | null;
};

export type PacVerdict = "fit" | "fit_with_conditions" | "unfit" | "pending" | null;

/** An outstanding job, with how many earlier sayings of it are folded underneath. */
export type OpenTask = Observation & { repeats: number };

export type PatientState = {
  matched: MatchedItem[];
  missing: MatchedItem[];
  extra: Observation[];
  /** The newest value for every thing recorded, template or not — what a discharge summary
   *  is built from, where `extra` is only what the checklist did not ask about. */
  latest: Observation[];
  openTasks: OpenTask[];
  doneTasks: Observation[];
  pending: Observation[];
  /** Every PAC verdict ever recorded for this patient, newest first. A patient found unfit,
   *  optimised and then cleared has three of these, and the history is the point — it is how
   *  you see what had to happen to get them to fit. Empty when nobody has recorded one. */
  pac: Observation[];
};

/**
 * Where a patient stands right now, worked out the same way for the bedside screen and the
 * end-of-round handover: against the template if one applies, plus whatever was said that the
 * template didn't ask for. `observations` must be newest-first — callers already fetch entries
 * that way, and "latest wins" here relies on it.
 */
export function derivePatientState(
  observations: Observation[],
  template: CareTemplate | null
): PatientState {
  // Keyed on normalised kind+label so "ALP" and "alp" collapse to the same row instead of
  // sitting side by side because the extraction step phrased one of them differently.
  const latest = new Map<string, Observation>();
  for (const obs of observations) {
    const key = `${obs.kind}:${obs.label.toLowerCase().trim()}`;
    if (!latest.has(key)) latest.set(key, obs);
  }

  const pending = observations.filter((o) => o.needs_confirmation && !o.confirmed_at);

  const allPlans = observations.filter((o) => o.kind === "plan" && isActionableTask(o.value_text ?? o.label));

  // Repeats folded together first, newest kept — observations arrive newest first, which is
  // what dedupeTasks relies on. Then sorted on what the colour means TODAY rather than on the
  // day it was spoken, so a "tomorrow" job that has come due does not sit below jobs it now
  // outranks. Deduping before sorting matters: the newest saying carries the urgency that
  // decides the order.
  const openTasks: OpenTask[] = dedupeTasks(allPlans.filter((o) => !o.done_at))
    .map(({ task, repeats }) => ({ ...task, repeats: repeats.length }))
    .sort(
      (a, b) =>
        urgencyRank(effectiveUrgency(a).urgency) - urgencyRank(effectiveUrgency(b).urgency)
    );
  const doneTasks = allPlans.filter((o) => o.done_at);

  const matched = template ? matchTemplate(template, observations) : [];
  const missing = matched.filter((m) => m.missing);

  // Jobs already have the To do section above. Without excluding "plan" here, a to-do like
  // "check fresh ALP" sits in this table right next to the actual ALP result, and a completed
  // one never leaves — this table doesn't look at done_at — so ticked-off jobs kept piling up
  // as stale rows. "note" is excluded for the same reason it always was: free text with no
  // place of its own on this screen.
  const templateLabels = new Set(
    matched.flatMap((m) => [m.item.label.toLowerCase(), ...m.item.aliases.map((a) => a.toLowerCase())])
  );
  // "pac_status" is excluded for the same reason "plan" is: it has a section of its own, with
  // the verdict spelled out and the history under it, so a second bare row here would be the
  // same fact twice. A templated patient still gets their "fitness" checklist row filled,
  // because matchTemplate reads every observation rather than this list.
  const extra = [...latest.values()].filter(
    (o) =>
      o.kind !== "note" &&
      o.kind !== "pac_status" &&
      (o.kind !== "plan" || !isActionableTask(o.value_text ?? o.label)) &&
      !templateLabels.has(o.label.toLowerCase())
  );

  // Newest first, which the caller relies on: the head is where the patient stands now and the
  // tail is how they got there. Input order is already newest-first.
  const pac = observations.filter((o) => o.kind === "pac_status");

  return {
    matched,
    missing,
    extra,
    latest: [...latest.values()],
    openTasks,
    doneTasks,
    pending,
    pac,
  };
}

export const SITTING_GAP_MS = 30 * 60 * 1000;

/**
 * A single visit to a bedside usually produces several entries a minute apart — you speak,
 * photograph a report, then speak again — and listing each under its own timestamp makes one
 * examination look like three. Consecutive entries less than 30 minutes apart are shown as
 * one sitting, stamped with the time the first of them was recorded.
 *
 * The gap is measured between neighbours, not from the start, so a long round that keeps
 * returning to the same patient stays one sitting rather than splitting on the half hour.
 * Entries must arrive newest-first; groups and their contents come back in that same order.
 */
export function groupIntoSittings<T extends { recorded_at: string }>(
  entries: T[]
): { recorded_at: string; entries: T[] }[] {
  const sittings: T[][] = [];

  for (const entry of entries) {
    const current = sittings[sittings.length - 1];
    const previous = current?.[current.length - 1];
    const apart = previous
      ? new Date(previous.recorded_at).getTime() - new Date(entry.recorded_at).getTime()
      : Infinity;

    if (current && apart < SITTING_GAP_MS) current.push(entry);
    else sittings.push([entry]);
  }

  // Newest-first input means the last entry in a group is its earliest — the time the sitting
  // began, which is what gets shown.
  return sittings.map((group) => ({
    recorded_at: group[group.length - 1].recorded_at,
    entries: group,
  }));
}

/** The calendar day an instant falls on in IST — the day the round actually happened, which
 *  is not the same as the UTC day for anything recorded after 5.30am. */
export function istDayKey(iso: string): string {
  return new Date(iso).toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
}

/**
 * Sittings gathered into the day they happened on.
 *
 * A patient a week into an admission has a long record, and what a resident wants from it is
 * almost always one day — today's note, or the day the drain came out. Days are the unit that
 * question is asked in, so they are the unit the record collapses by.
 *
 * Order is preserved: newest-first in, newest-first out, both for the days and within them.
 */
export function groupByDay<T extends { recorded_at: string }>(
  sittings: T[]
): { day: string; recorded_at: string; sittings: T[] }[] {
  const days: { day: string; recorded_at: string; sittings: T[] }[] = [];

  for (const sitting of sittings) {
    const day = istDayKey(sitting.recorded_at);
    const current = days[days.length - 1];

    if (current && current.day === day) current.sittings.push(sitting);
    else days.push({ day, recorded_at: sitting.recorded_at, sittings: [sitting] });
  }

  return days;
}
