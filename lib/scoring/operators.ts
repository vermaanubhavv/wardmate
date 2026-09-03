/**
 * The complete, allow-listed set of deterministic operators a pathway definition may use.
 *
 * There is NO general expression evaluator, NO `eval`, NO dynamic code. A definition can only
 * reference an operator name from this file; `lib/scoring/schema.ts` rejects any other.
 */

import type { ComparisonOperator, ComponentRule } from "./types";

export const ALLOWED_OPERATORS: readonly ComparisonOperator[] = [
  "gt",
  "gte",
  "lt",
  "lte",
  "eq",
  "present",
  "absent",
  "in_range",
];

export type RuleEvaluation = "met" | "not_met" | "not_evaluable";

/**
 * Evaluate one component rule against a resolved value.
 *  - `numeric` is the engine-normalised number (or null).
 *  - `text` is the categorical / boolean value as recorded (or null).
 *  - A null on the side the operator needs yields `not_evaluable` (→ component `unknown`),
 *    never `not_met`.
 */
export function evaluateRule(
  rule: ComponentRule,
  numeric: number | null,
  text: string | null
): RuleEvaluation {
  switch (rule.op) {
    case "present":
      if (text == null && numeric == null) return "not_evaluable";
      return isTruthyPresence(text) ? "met" : "not_met";
    case "absent":
      if (text == null && numeric == null) return "not_evaluable";
      return isTruthyPresence(text) ? "not_met" : "met";
    case "eq": {
      if (rule.value == null) return "not_evaluable";
      if (typeof rule.value === "string") {
        if (text == null) return "not_evaluable";
        return text.trim().toLowerCase() === rule.value.trim().toLowerCase() ? "met" : "not_met";
      }
      if (numeric == null) return "not_evaluable";
      return numeric === rule.value ? "met" : "not_met";
    }
    case "gt":
    case "gte":
    case "lt":
    case "lte": {
      if (numeric == null || typeof rule.value !== "number") return "not_evaluable";
      const v = rule.value;
      const ok =
        rule.op === "gt"
          ? numeric > v
          : rule.op === "gte"
            ? numeric >= v
            : rule.op === "lt"
              ? numeric < v
              : numeric <= v;
      return ok ? "met" : "not_met";
    }
    case "in_range": {
      if (numeric == null || !rule.range) return "not_evaluable";
      const [lo, hi] = rule.range;
      return numeric >= lo && numeric <= hi ? "met" : "not_met";
    }
    default:
      return "not_evaluable";
  }
}

const PRESENT = /\b(present|yes|positive|true|seen|noted|documented|confirmed)\b/i;
const ABSENT = /\b(absent|no|none|negative|false|nil|not seen|not present|ruled out)\b/i;

function isTruthyPresence(text: string | null): boolean {
  if (text == null) return false;
  if (ABSENT.test(text)) return false;
  if (PRESENT.test(text)) return true;
  // A bare non-empty categorical (e.g. "left pleural effusion") counts as present.
  return text.trim().length > 0;
}
