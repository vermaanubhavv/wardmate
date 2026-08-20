export const URGENCY_ORDER = ["red", "yellow", "green", null] as const;

export type Urgency = "red" | "yellow" | "green" | null;

export const URGENCY_META: Record<
  "red" | "yellow" | "green",
  { label: string; meaning: string; dot: string; chip: string; border: string }
> = {
  red: {
    label: "Now",
    meaning: "Within hours, or today",
    dot: "bg-red-500",
    chip: "bg-red-100 text-red-700",
    border: "border-red-300",
  },
  yellow: {
    label: "Soon",
    meaning: "Today or tomorrow",
    dot: "bg-amber-500",
    chip: "bg-amber-100 text-amber-700",
    border: "border-amber-300",
  },
  green: {
    label: "Has time",
    meaning: "No hurry",
    dot: "bg-emerald-500",
    chip: "bg-emerald-100 text-emerald-700",
    border: "border-emerald-300",
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

/**
 * The one relative-day word in a plan's text, and how many days ahead of when it was SAID it
 * points. Ordered longest-phrase-first so "tomorrow morning" wins over the bare "tomorrow"
 * inside it. Deliberately a short, fixed list: each entry has exactly one meaning, so rewriting
 * it is never a guess — anything not on this list is left completely alone.
 */
const RELATIVE_DAY_WORDS: [RegExp, number][] = [
  [/\bday after tomorrow\b/i, 2],
  [/\btomorrow morning\b/i, 1],
  [/\bcoming morning\b/i, 1],
  [/\bnext morning\b/i, 1],
  [/\btomorrow\b/i, 1],
  [/\bthis evening\b/i, 0],
  [/\btonight\b/i, 0],
  [/\btoday\b/i, 0],
];

function addDays(dateKey: string, n: number): string {
  const d = new Date(`${dateKey}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

/** "20 Aug" — enough to identify the day without a year nobody needs mid-admission. */
function shortDate(dateKey: string): string {
  return new Date(`${dateKey}T00:00:00Z`).toLocaleDateString("en-GB", {
    timeZone: "UTC",
    day: "numeric",
    month: "short",
  });
}

/**
 * A plan's words, read as of right now rather than frozen at the moment they were spoken.
 *
 * "Send fresh investigations tomorrow morning" is correct when said and wrong the day after —
 * tomorrow has already happened, and the sentence does not know that. Nothing here is invented:
 * the ONLY thing rewritten is one word from a fixed, unambiguous list (see RELATIVE_DAY_WORDS),
 * and only ever relative to the calendar date the plan was actually recorded on.
 *
 * - Still ahead: the word is kept and the calendar date is appended — "tomorrow (20 Aug)" — so
 *   what was relative becomes checkable at a glance, which is what a resident scanning ten
 *   plans across ten different admission days actually needs.
 * - Arrived: rewritten to "today". This is the case the colour escalation was already handling
 *   silently (yellow -> red overnight) with nothing said about it in the words themselves.
 * - Already passed: the word is dropped rather than left lying. "N days overdue" already says
 *   how late it is elsewhere on the row; a plan that still said "today" a week on would be a
 *   second, contradicting answer to the same question.
 *
 * A plan carrying none of these words is returned completely unchanged — this only ever touches
 * text it is certain about.
 */
export function describeWhen(text: string, recordedAtIso: string, now: string = new Date().toISOString()): string {
  for (const [pattern, offset] of RELATIVE_DAY_WORDS) {
    const match = text.match(pattern);
    if (!match || match.index === undefined) continue;

    const saidOn = istDate(recordedAtIso);
    const referenced = addDays(saidOn, offset);
    const todayKey = istDate(now);

    if (referenced < todayKey) {
      return text
        .slice(0, match.index)
        .concat(text.slice(match.index + match[0].length))
        .replace(/\s{2,}/g, " ")
        .replace(/\s+([.,])/g, "$1")
        .trim();
    }

    const replacement = referenced === todayKey ? "today" : `${match[0]} (${shortDate(referenced)})`;
    return (text.slice(0, match.index) + replacement + text.slice(match.index + match[0].length)).trim();
  }

  return text;
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
