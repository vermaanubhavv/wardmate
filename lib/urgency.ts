export const URGENCY_ORDER = ["red", "yellow", "green", null] as const;

export type Urgency = "red" | "yellow" | "green" | null;

export const URGENCY_META: Record<
  "red" | "yellow" | "green",
  { label: string; meaning: string; dot: string; chip: string; border: string }
> = {
  red: {
    label: "Now",
    meaning: "Within hours, or today",
    dot: "bg-red-400",
    chip: "bg-red-400/15 text-red-200",
    border: "border-red-400/40",
  },
  yellow: {
    label: "Soon",
    meaning: "Today or tomorrow",
    dot: "bg-amber-400",
    chip: "bg-amber-400/15 text-amber-200",
    border: "border-amber-400/40",
  },
  green: {
    label: "Has time",
    meaning: "No hurry",
    dot: "bg-emerald-400",
    chip: "bg-emerald-400/15 text-emerald-200",
    border: "border-emerald-400/40",
  },
};

/**
 * Tapping a job walks red -> yellow -> green -> ungraded -> red. Ungraded stays in the cycle
 * deliberately: a colour set by mistake has to be removable, and "nobody has decided yet" is
 * a real state the list shows separately rather than a gap to be filled with a guess.
 */
export function nextUrgency(current: Urgency): Urgency {
  const i = URGENCY_ORDER.indexOf(current as never);
  return URGENCY_ORDER[(i + 1) % URGENCY_ORDER.length] as Urgency;
}

/** Calendar date in Indian time — the same reason day numbers are counted in IST. */
export function istDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
}

/** Whole days between two instants, by IST calendar date rather than elapsed hours: a job
 *  said at 11pm and read at 8am the next morning is one day old, not zero. */
export function daysApart(fromIso: string, toIso: string): number {
  const from = new Date(`${istDate(fromIso)}T00:00:00Z`).getTime();
  const to = new Date(`${istDate(toIso)}T00:00:00Z`).getTime();
  return Math.round((to - from) / 86_400_000);
}

export type EffectiveUrgency = {
  urgency: Urgency;
  /** True when the passage of days moved it, not the words or a tap. */
  escalated: boolean;
  /** Days since it was graded. 0 means graded today. */
  age: number;
  /** Said in the round's own words: "due today", "2 days overdue". */
  note: string | null;
};

/**
 * What a job's colour means TODAY, rather than on the day it was spoken.
 *
 * "Remove the drain tomorrow" is yellow when said — but tomorrow arrives whether or not
 * anyone reopens the app, and on that morning it is a job for today. Computed fresh on every
 * read for exactly the reason post-op day is: a stored answer would be wrong by morning, and
 * wrong in the direction that makes an outstanding job look less pressing than it is.
 *
 * Nothing is written back. The resident's grade stays what it was, and the escalation is
 * shown as what it is — the calendar moving, not someone changing their mind.
 *
 * Only yellow climbs. Yellow means "today or tomorrow", so a day's passing spends it. Green
 * was a positive judgement that there is time ("before discharge", "no hurry") and no number
 * of days turns that into an emergency on its own. Ungraded never climbs either: nobody has
 * judged it yet, and inventing a grade from a date would be the same fabrication as reading
 * one out of a sentence that had none.
 */
export function effectiveUrgency(
  task: { urgency: Urgency; graded_at?: string | null; recorded_at: string },
  now: string = new Date().toISOString()
): EffectiveUrgency {
  // Counted from the last deliberate act: a tap if there was one, otherwise the words.
  const since = task.graded_at ?? task.recorded_at;
  const age = daysApart(since, now);

  if (task.urgency === "yellow" && age >= 1) {
    return {
      urgency: "red",
      escalated: true,
      age,
      note: age === 1 ? "due today" : `${age - 1} ${age === 2 ? "day" : "days"} overdue`,
    };
  }

  if (task.urgency === "red" && age >= 1) {
    return {
      urgency: "red",
      escalated: false,
      age,
      note: `${age} ${age === 1 ? "day" : "days"} overdue`,
    };
  }

  return { urgency: task.urgency, escalated: false, age, note: null };
}

/** Red first, then yellow, then ungraded, then green. Ungraded sits above green because an
 *  ungraded job might be urgent and nobody has looked — green is the only one that has been
 *  positively judged safe to leave. */
export function urgencyRank(u: Urgency): number {
  if (u === "red") return 0;
  if (u === "yellow") return 1;
  if (u === null) return 2;
  return 3;
}
