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

/** Red first, then yellow, then ungraded, then green. Ungraded sits above green because an
 *  ungraded job might be urgent and nobody has looked — green is the only one that has been
 *  positively judged safe to leave. */
export function urgencyRank(u: Urgency): number {
  if (u === "red") return 0;
  if (u === "yellow") return 1;
  if (u === null) return 2;
  return 3;
}
