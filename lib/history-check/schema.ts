/**
 * Strict validator for a complaint tree. Hand-rolled, like lib/scoring/schema.ts — this
 * project has no schema library, and a tree is small enough that a checklist reads better
 * than a DSL.
 *
 * Every tree is validated when the registry loads (lib/history-check/trees.ts), so a broken
 * content file fails at import — in tests and at build — rather than on a ward.
 *
 * Rejects:
 *  - a missing or malformed id / version / complaint / setting / review status
 *  - no triggers, no slots, no red flags, no differentials
 *  - a duplicate slot id, a slot with no terms, an uppercase term
 *  - a slot "question" that is not phrased as a question, or that reads as an instruction
 *  - any dose, drug-regimen or treatment wording anywhere in the clinical text
 *  - a differential that points at a slot that does not exist
 *  - an output order that names a slot that does not exist, or a non-value duration slot
 */

import { SLOT_GROUPS, SLOT_STATES, type HistoryTree, type Slot } from "./types";

export type ValidationIssue = { path: string; message: string };
export type ValidationResult = { ok: boolean; issues: ValidationIssue[] };

/** A gap must be a question to consider, never a diagnosis or an order. */
const INSTRUCTION = /^(start|give|prescribe|administer|order|send|do|stop|treat|refer|admit|shift|transfuse|intubate)\b/i;

/**
 * Wording that would turn history content into treatment advice. A tree may name a drug
 * class as something to ASK about ("any antibiotics taken outside?"), but never a dose, a
 * frequency, or an instruction to give one.
 */
const TREATMENT_ADVICE =
  /\b(\d+\s?(mg|mcg|g|ml|iu|units?)\b|\b(od|bd|tds|qid|hs|stat)\b|\b(prescribe|administer|dose of|start(ing)? (on )?(iv|oral|tab)|should be (given|started|treated)|give (iv|oral|tab|inj))\b)/i;

export function validateHistoryTree(tree: unknown): ValidationResult {
  const issues: ValidationIssue[] = [];
  const add = (path: string, message: string) => issues.push({ path, message });

  if (typeof tree !== "object" || tree === null) {
    return { ok: false, issues: [{ path: "$", message: "tree must be an object" }] };
  }
  const t = tree as Partial<HistoryTree>;

  if (!t.id || typeof t.id !== "string" || !/^[a-z][a-z0-9_]*$/.test(t.id)) {
    add("$.id", "required; lowercase snake_case");
  }
  if (!t.version || typeof t.version !== "string" || !/^\d+\.\d+\.\d+$/.test(t.version)) {
    add("$.version", "must be semantic version x.y.z");
  }
  for (const f of ["complaint", "setting"] as const) {
    if (!t[f] || typeof t[f] !== "string") add(`$.${f}`, "required non-empty string");
  }
  if (t.reviewStatus !== "pending_clinician_review" && t.reviewStatus !== "reviewed") {
    add("$.reviewStatus", "must be pending_clinician_review or reviewed");
  }
  if (t.reviewStatus === "reviewed" && !t.reviewedBy) {
    add("$.reviewedBy", "a reviewed tree must name its reviewer");
  }
  if (!Array.isArray(t.triggers) || t.triggers.length === 0) {
    add("$.triggers", "at least one trigger word required");
  } else {
    t.triggers.forEach((w, i) => {
      if (typeof w !== "string" || !w.trim() || w !== w.toLowerCase()) {
        add(`$.triggers[${i}]`, "must be a lowercase word or phrase");
      }
    });
  }

  // Slots ------------------------------------------------------------------
  const ids = new Set<string>();
  const slots = Array.isArray(t.slots) ? t.slots : [];
  if (slots.length === 0) add("$.slots", "at least one slot required");
  slots.forEach((s, i) => validateSlot(s, `$.slots[${i}]`, add, ids));
  if (!slots.some((s) => s?.group === "red_flag")) {
    add("$.slots", "at least one red_flag slot required (must-not-miss questions)");
  }

  // Differentials --------------------------------------------------------
  const diffs = Array.isArray(t.differentials) ? t.differentials : [];
  if (diffs.length === 0) add("$.differentials", "at least one differential required");
  const diffIds = new Set<string>();
  diffs.forEach((d, i) => {
    const p = `$.differentials[${i}]`;
    if (!d?.id || typeof d.id !== "string") add(`${p}.id`, "required");
    else if (diffIds.has(d.id)) add(`${p}.id`, `duplicate differential id '${d.id}'`);
    diffIds.add(d?.id ?? "");
    if (!d?.name || typeof d.name !== "string") add(`${p}.name`, "required");
    else if (TREATMENT_ADVICE.test(d.name)) add(`${p}.name`, "treatment wording is not allowed");
    for (const f of ["pointers", "discriminators"] as const) {
      if (!Array.isArray(d?.[f])) {
        add(`${p}.${f}`, "must be an array of slot ids");
        continue;
      }
      d[f].forEach((id, j) => {
        if (!ids.has(id)) add(`${p}.${f}[${j}]`, `unknown slot '${id}'`);
      });
    }
    if (Array.isArray(d?.discriminators) && d.discriminators.length === 0) {
      add(`${p}.discriminators`, "a differential with nothing to ask cannot order the gap list");
    }
    if (d?.appliesWhen !== undefined && d.appliesWhen !== "post_op") {
      add(`${p}.appliesWhen`, "only 'post_op' is understood");
    }
  });

  // Output -----------------------------------------------------------------
  if (!t.output || typeof t.output !== "object") {
    add("$.output", "required");
  } else {
    const dur = slots.find((s) => s?.id === t.output?.durationSlot);
    if (!dur) add("$.output.durationSlot", `unknown slot '${t.output.durationSlot}'`);
    else if (dur.kind !== "value") add("$.output.durationSlot", "must be a value slot");
    if (!Array.isArray(t.output.hpiOrder) || t.output.hpiOrder.length === 0) {
      add("$.output.hpiOrder", "required, non-empty");
    } else {
      const seen = new Set<string>();
      t.output.hpiOrder.forEach((id, i) => {
        if (!ids.has(id)) add(`$.output.hpiOrder[${i}]`, `unknown slot '${id}'`);
        if (seen.has(id)) add(`$.output.hpiOrder[${i}]`, `duplicate '${id}'`);
        seen.add(id);
      });
    }
  }

  return { ok: issues.length === 0, issues };
}

function validateSlot(
  s: Slot | undefined,
  p: string,
  add: (path: string, message: string) => void,
  ids: Set<string>
) {
  if (!s || typeof s !== "object") {
    add(p, "slot must be an object");
    return;
  }
  if (!s.id || typeof s.id !== "string" || !/^[a-z][a-z0-9_]*$/.test(s.id)) {
    add(`${p}.id`, "required; lowercase snake_case");
  } else if (ids.has(s.id)) {
    add(`${p}.id`, `duplicate slot id '${s.id}'`);
  }
  if (s.id) ids.add(s.id);

  if (!SLOT_GROUPS.includes(s.group)) add(`${p}.group`, `must be one of ${SLOT_GROUPS.join(", ")}`);
  if (s.kind !== "value" && s.kind !== "yes_no") add(`${p}.kind`, "must be value or yes_no");
  if (!s.label || typeof s.label !== "string") add(`${p}.label`, "required");

  if (!s.question || typeof s.question !== "string") {
    add(`${p}.question`, "required");
  } else {
    if (!s.question.trim().endsWith("?")) add(`${p}.question`, "must be phrased as a question");
    if (INSTRUCTION.test(s.question.trim())) add(`${p}.question`, "reads as an instruction, not a question");
    if (TREATMENT_ADVICE.test(s.question)) add(`${p}.question`, "treatment wording is not allowed");
  }

  if (!Array.isArray(s.terms) || s.terms.length === 0) {
    add(`${p}.terms`, "at least one term required (the validator needs it to accept a negative)");
  } else {
    s.terms.forEach((w, i) => {
      if (typeof w !== "string" || !w.trim()) add(`${p}.terms[${i}]`, "must be a non-empty string");
      else if (w !== w.toLowerCase()) add(`${p}.terms[${i}]`, "terms are matched lowercase");
      else if (TREATMENT_ADVICE.test(w)) add(`${p}.terms[${i}]`, "treatment wording is not allowed");
    });
  }
  if (s.numeric !== undefined && typeof s.numeric !== "boolean") add(`${p}.numeric`, "must be boolean");
  if (s.numeric && s.kind !== "value") add(`${p}.numeric`, "only a value slot can be numeric");
}

/** Exported for the tests that prove the three states are the only ones the engine knows. */
export const KNOWN_STATES = SLOT_STATES;
