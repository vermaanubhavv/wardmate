/**
 * Auto-triggers for checklist items.
 *
 * A checklist item can carry a `trigger` rule (stored as JSON on the protocol item — see
 * supabase/patches/0058_checklist_item_trigger.sql). Until the rule's conditions are met the
 * item is hidden entirely — no grey reminder, because for a patient it does not apply to the
 * line is only noise over the real gaps. When the conditions are met the item appears, and can
 * be raised to `core` (an orange "not recorded" gap) at the same time.
 *
 * Two families of condition, both of which the ward asked for:
 *   - history / entry based — something is already in the record (a diagnosis, a drug, a lab
 *     over a threshold, another checklist line answered)
 *   - time based — the post-op day, or hours since surgery / admission, has reached a point
 *
 * Pure. The caller builds a `TriggerContext` from the patient's observations and dates.
 */

export type TriggerCondition =
  /** A regex (case-insensitive) matches somewhere in the recorded values, NOT immediately
   *  preceded by a negation — "no past jaundice" does not count. */
  | { type: "history"; pattern: string }
  /** A recorded lab for `analyte` (matched loosely against label + value text) compares to
   *  `value`. */
  | { type: "lab"; analyte: string; op: "gt" | "lt" | "gte" | "lte"; value: number }
  /** Post-op day ≥ / ≤ n. Only ever true once the patient is actually post-op. */
  | { type: "pod_gte"; days: number }
  | { type: "pod_lte"; days: number }
  /** The operation is today (POD 0). */
  | { type: "day_of_surgery" }
  | { type: "hours_since_surgery_gte"; hours: number }
  | { type: "hours_since_admission_gte"; hours: number }
  /** Another checklist line has a value recorded / has nothing recorded. `label` is matched
   *  case-insensitively against item labels and their aliases. */
  | { type: "item_present"; label: string }
  | { type: "item_absent"; label: string }
  /** Invert a condition. */
  | { type: "not"; cond: TriggerCondition };

export type ItemTrigger = {
  /** Every condition must hold (AND). An empty list means "always" — the same as no trigger. */
  when: TriggerCondition[];
  /** What firing does. "show" (default) just reveals the item; "core" also makes it a gap. */
  effect?: "show" | "core";
};

export type TriggerContext = {
  /** Recorded values (not the template's own labels) joined into one string. */
  values: string;
  /** Post-op day, or null when the patient is not post-op yet. */
  postOpDay: number | null;
  hoursSinceSurgery: number | null;
  hoursSinceAdmission: number | null;
  /** True when any observation was recorded for a label / alias. */
  hasValue: (labelOrAlias: string) => boolean;
  /** Numeric readings keyed by a normalised analyte name. */
  labs: { name: string; value: number }[];
};

const NEG_BEFORE = /\b(no|not|nil|non|never|denies?|without|absent|negative for)\b[\s:,-]*$/;

/** `re` matches text at a spot not immediately preceded by a negation word. */
export function matchesUnnegated(text: string, re: RegExp): boolean {
  const g = new RegExp(re.source, re.flags.includes("g") ? re.flags : re.flags + "g");
  let m: RegExpExecArray | null;
  while ((m = g.exec(text)) !== null) {
    const before = text.slice(Math.max(0, m.index - 20), m.index).toLowerCase();
    if (!NEG_BEFORE.test(before)) return true;
    if (m.index === g.lastIndex) g.lastIndex++;
  }
  return false;
}

function evalCondition(c: TriggerCondition, ctx: TriggerContext): boolean {
  switch (c.type) {
    case "history":
      try {
        return matchesUnnegated(ctx.values, new RegExp(c.pattern, "i"));
      } catch {
        return false; // a malformed pattern must never crash a ward round
      }
    case "lab": {
      const hits = ctx.labs.filter((l) => l.name.includes(normAnalyte(c.analyte)));
      if (hits.length === 0) return false;
      return hits.some((l) => {
        if (c.op === "gt") return l.value > c.value;
        if (c.op === "lt") return l.value < c.value;
        if (c.op === "gte") return l.value >= c.value;
        return l.value <= c.value;
      });
    }
    case "pod_gte":
      return ctx.postOpDay !== null && ctx.postOpDay >= c.days;
    case "pod_lte":
      return ctx.postOpDay !== null && ctx.postOpDay <= c.days;
    case "day_of_surgery":
      return ctx.postOpDay === 0;
    case "hours_since_surgery_gte":
      return ctx.hoursSinceSurgery !== null && ctx.hoursSinceSurgery >= c.hours;
    case "hours_since_admission_gte":
      return ctx.hoursSinceAdmission !== null && ctx.hoursSinceAdmission >= c.hours;
    case "item_present":
      return ctx.hasValue(c.label);
    case "item_absent":
      return !ctx.hasValue(c.label);
    case "not":
      return !evalCondition(c.cond, ctx);
    default:
      return false;
  }
}

export function normAnalyte(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]/g, "");
}

/**
 * Evaluate an item's trigger. `null` / `undefined` trigger → always active, never forced core.
 */
export function evaluateTrigger(
  trigger: ItemTrigger | null | undefined,
  ctx: TriggerContext
): { active: boolean; forceCore: boolean } {
  if (!trigger || !Array.isArray(trigger.when) || trigger.when.length === 0) {
    return { active: true, forceCore: false };
  }
  const active = trigger.when.every((c) => evalCondition(c, ctx));
  return { active, forceCore: active && trigger.effect === "core" };
}

/** Parse whatever came out of the JSON column into an ItemTrigger, or null if it is not one. */
export function coerceTrigger(raw: unknown): ItemTrigger | null {
  if (!raw || typeof raw !== "object") return null;
  const t = raw as { when?: unknown; effect?: unknown };
  if (!Array.isArray(t.when)) return null;
  return {
    when: t.when as TriggerCondition[],
    effect: t.effect === "core" ? "core" : "show",
  };
}
