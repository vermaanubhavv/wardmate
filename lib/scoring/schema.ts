/**
 * Strict validator for a pathway definition. Hand-rolled (this project has no schema library
 * and no ORM — see CONTEXT.md §3) but exhaustive: it is the gate the DOCX asks for.
 *
 * Rejects:
 *  - duplicate component identifiers (within a card and across cards)
 *  - a component / card with no time window
 *  - an unsupported canonical unit
 *  - an unknown / non-allow-listed operator
 *  - an unsafe autonomous action in a task (prescribe / transfer / order / operate …)
 *  - a component missing its provenance requirement (inputKey + selector)
 *  - an invalid card state / status value
 *  - a checkpoint referenced by a card that is not defined
 *  - a task dedup key that is not unique
 */

import { ALLOWED_OPERATORS } from "./operators";
import { SUPPORTED_ANALYTES, canonicalUnitFor } from "./units";
import type {
  CardDefinition,
  ComponentInput,
  PathwayDefinition,
  TimeWindow,
} from "./types";

export type ValidationIssue = { path: string; message: string };
export type ValidationResult = { ok: boolean; issues: ValidationIssue[] };

const VALID_CARD_TYPES = ["calculator", "structured_classification", "documentation_only"];
const VALID_STATUSES = ["active", "draft", "unavailable", "retired"];
const VALID_ANCHORS = ["admission", "symptom_onset", "activation", "checkpoint"];
const VALID_SELECTORS = [
  "admission",
  "first",
  "worst",
  "highest",
  "lowest",
  "change_from_baseline",
  "at_checkpoint",
];
const VALID_CALC_KINDS = [
  "sum_points",
  "sirs",
  "modified_marshall",
  "revised_atlanta",
  "structured_extraction",
];
const VALID_RECOMPUTE = [
  "new_lab",
  "new_observation",
  "new_imaging",
  "scheduled_checkpoint",
  "deterioration",
  "manual",
];
const VALID_ROLES = ["resident", "nursing", "senior", "radiology"];
const VALID_PRIORITIES = ["routine", "soon", "urgent"];

/**
 * Verbs that would make a generated task an autonomous clinical action. A task may only ever
 * ask a clinician to review / send a test / monitor — never to give a drug, transfuse,
 * transfer, or operate (DOCX safety rules; MVP spec §7 "Rules do not … order, prescribe").
 */
const UNSAFE_ACTION = /\b(prescribe|administer|give|start\s+(antibiotic|antibiotics|noradrenaline|inotrope)|transfuse|transfusion|transfer\s+to\s+icu|shift\s+to\s+icu|book\s+(ot|theatre)|take\s+to\s+theatre|perform\s+ercp|intubate|commence\s+vasopressor)\b/i;

export function validatePathwayDefinition(def: unknown): ValidationResult {
  const issues: ValidationIssue[] = [];
  const add = (path: string, message: string) => issues.push({ path, message });

  if (typeof def !== "object" || def === null) {
    return { ok: false, issues: [{ path: "$", message: "definition must be an object" }] };
  }
  const d = def as Partial<PathwayDefinition>;

  for (const f of ["pathwayId", "pathwayVersion", "title", "clinicalOwner", "reviewDueAt"] as const) {
    if (!d[f] || typeof d[f] !== "string") add(`$.${f}`, "required non-empty string");
  }
  if (!d.status || !VALID_STATUSES.includes(d.status)) {
    add("$.status", `must be one of ${VALID_STATUSES.join(", ")}`);
  }
  if (d.pathwayVersion && !/^\d+\.\d+\.\d+$/.test(d.pathwayVersion)) {
    add("$.pathwayVersion", "must be semantic version x.y.z");
  }
  if (!Array.isArray(d.sourceReferences) || d.sourceReferences.length === 0) {
    add("$.sourceReferences", "at least one source reference required (provenance)");
  }
  if (!d.diagnosisTriggers || typeof d.diagnosisTriggers !== "object") {
    add("$.diagnosisTriggers", "required");
  } else {
    const t = d.diagnosisTriggers;
    if (!Array.isArray(t.textPatterns) && !Array.isArray(t.codes)) {
      add("$.diagnosisTriggers", "need at least codes[] or textPatterns[]");
    }
    if (!Array.isArray(t.excludePatterns)) add("$.diagnosisTriggers.excludePatterns", "must be an array");
  }

  // Cards ------------------------------------------------------------------
  const allComponentIds = new Set<string>();
  const definedCheckpoints = new Set((d.checkpoints ?? []).map((c) => c.key));

  if (!Array.isArray(d.cards) || d.cards.length === 0) {
    add("$.cards", "at least one card required");
  } else {
    d.cards.forEach((card, ci) => validateCard(card, `$.cards[${ci}]`, add, allComponentIds, definedCheckpoints));
  }

  // Checkpoints ----------------------------------------------------------
  (d.checkpoints ?? []).forEach((cp, i) => {
    if (!cp.key) add(`$.checkpoints[${i}].key`, "required");
    if (!VALID_ANCHORS.includes(cp.dueFrom)) add(`$.checkpoints[${i}].dueFrom`, "invalid anchor");
    if (typeof cp.dueAtHours !== "number") add(`$.checkpoints[${i}].dueAtHours`, "required number");
    (cp.recomputeCards ?? []).forEach((cardId) => {
      if (!(d.cards ?? []).some((c) => c.cardId === cardId)) {
        add(`$.checkpoints[${i}].recomputeCards`, `unknown card '${cardId}'`);
      }
    });
  });

  // Tasks --------------------------------------------------------------
  const taskKeys = new Set<string>();
  (d.tasks ?? []).forEach((task, i) => {
    const p = `$.tasks[${i}]`;
    if (!task.key) add(`${p}.key`, "required");
    if (task.key && taskKeys.has(task.key)) add(`${p}.key`, `duplicate task key '${task.key}'`);
    taskKeys.add(task.key);
    if (!task.action) add(`${p}.action`, "required");
    if (!task.reason) add(`${p}.reason`, "required (every task must be explainable)");
    if (task.action && UNSAFE_ACTION.test(task.action)) {
      add(`${p}.action`, `unsafe autonomous action: "${task.action}"`);
    }
    if (!VALID_ROLES.includes(task.responsibleRole)) add(`${p}.responsibleRole`, "invalid role");
    if (!VALID_PRIORITIES.includes(task.priority)) add(`${p}.priority`, "invalid priority");
    if (task.cardId && !(d.cards ?? []).some((c) => c.cardId === task.cardId)) {
      add(`${p}.cardId`, `unknown card '${task.cardId}'`);
    }
  });

  if (!Array.isArray(d.recomputePolicy) || d.recomputePolicy.length === 0) {
    add("$.recomputePolicy", "at least one recompute trigger required");
  }

  return { ok: issues.length === 0, issues };
}

function validateCard(
  card: CardDefinition,
  p: string,
  add: (path: string, m: string) => void,
  allComponentIds: Set<string>,
  definedCheckpoints: Set<string>
) {
  if (!card.cardId) add(`${p}.cardId`, "required");
  if (!VALID_CARD_TYPES.includes(card.type)) add(`${p}.type`, "invalid card type");
  if (!card.calculation || !VALID_CALC_KINDS.includes(card.calculation.kind)) {
    add(`${p}.calculation`, `kind must be one of ${VALID_CALC_KINDS.join(", ")}`);
  }
  if (!Array.isArray(card.recomputeOn) || card.recomputeOn.some((r) => !VALID_RECOMPUTE.includes(r))) {
    add(`${p}.recomputeOn`, "invalid recompute event");
  }
  if (card.lockedUntilCheckpoint && !definedCheckpoints.has(card.lockedUntilCheckpoint)) {
    add(`${p}.lockedUntilCheckpoint`, `unknown checkpoint '${card.lockedUntilCheckpoint}'`);
  }
  if (!Array.isArray(card.inputs) || card.inputs.length === 0) {
    add(`${p}.inputs`, "at least one input required");
    return;
  }
  const localIds = new Set<string>();
  card.inputs.forEach((inp, i) => {
    const ip = `${p}.inputs[${i}]`;
    validateComponent(inp, ip, add);
    if (localIds.has(inp.componentId)) add(`${ip}.componentId`, `duplicate within card: '${inp.componentId}'`);
    if (allComponentIds.has(inp.componentId)) {
      add(`${ip}.componentId`, `duplicate across pathway: '${inp.componentId}'`);
    }
    localIds.add(inp.componentId);
    allComponentIds.add(inp.componentId);
  });

  if (!Array.isArray(card.interpretationBands)) add(`${p}.interpretationBands`, "must be an array");
}

function validateComponent(
  inp: ComponentInput,
  p: string,
  add: (path: string, m: string) => void
) {
  if (!inp.componentId) add(`${p}.componentId`, "required");
  if (!inp.label) add(`${p}.label`, "required");
  if (!inp.inputKey) add(`${p}.inputKey`, "required (provenance: what value feeds this)");
  if (!VALID_SELECTORS.includes(inp.selector)) add(`${p}.selector`, "invalid selector");
  if (inp.selector === "change_from_baseline" && !inp.baselineWindow) {
    add(`${p}.baselineWindow`, "required for change_from_baseline");
  }
  validateWindow(inp.window, `${p}.window`, add);
  if (inp.baselineWindow) validateWindow(inp.baselineWindow, `${p}.baselineWindow`, add);

  if (inp.canonicalUnit != null) {
    // The unit must be one the engine can actually normalise to.
    const known = SUPPORTED_ANALYTES.map((a) => canonicalUnitFor(a)).filter(Boolean);
    if (!known.includes(inp.canonicalUnit) && inp.canonicalUnit !== "%" && inp.canonicalUnit !== "score") {
      add(`${p}.canonicalUnit`, `unsupported canonical unit '${inp.canonicalUnit}'`);
    }
  }

  if (!inp.rule || !ALLOWED_OPERATORS.includes(inp.rule.op)) {
    add(`${p}.rule.op`, `operator must be one of ${ALLOWED_OPERATORS.join(", ")}`);
  } else {
    if (["gt", "gte", "lt", "lte"].includes(inp.rule.op) && typeof inp.rule.value !== "number") {
      add(`${p}.rule.value`, "numeric threshold required for this operator");
    }
    if (inp.rule.op === "in_range" && (!Array.isArray(inp.rule.range) || inp.rule.range.length !== 2)) {
      add(`${p}.rule.range`, "[low, high] required for in_range");
    }
  }
  if (typeof inp.points !== "number" || inp.points < 0) add(`${p}.points`, "non-negative number required");
  if (typeof inp.required !== "boolean") add(`${p}.required`, "boolean required");
}

function validateWindow(w: TimeWindow | undefined, p: string, add: (path: string, m: string) => void) {
  if (!w || typeof w !== "object") {
    add(p, "time window is mandatory (no window = silent mixing of time periods)");
    return;
  }
  if (!VALID_ANCHORS.includes(w.anchor)) add(`${p}.anchor`, "invalid anchor");
  if (!w.label) add(`${p}.label`, "required (shown in the evidence drawer)");
  if (w.startHours != null && typeof w.startHours !== "number") add(`${p}.startHours`, "must be a number");
  if (w.endHours != null && typeof w.endHours !== "number") add(`${p}.endHours`, "must be a number");
  if (w.startHours != null && w.endHours != null && w.endHours < w.startHours) {
    add(p, "endHours before startHours");
  }
}
