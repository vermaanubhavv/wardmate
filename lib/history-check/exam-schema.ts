import { DIAGNOSIS_CLAIM, TREATMENT_ADVICE, validateReference, type ValidationResult } from "@/lib/history-check/schema";
import type { ExamChecklist, ExamItem, ExamSection } from "@/lib/history-check/exam-types";

const ID = /^[a-z][a-z0-9_]*$/;

/**
 * Same posture as the tree validator: the content is data, and data is checked before it
 * is shown. Rejects doses / treatment wording anywhere, "how" text that does not read as a
 * method, and significance text that states a diagnosis.
 */
export function validateExamChecklist(list: unknown): ValidationResult {
  const issues: { path: string; message: string }[] = [];
  const add = (path: string, message: string) => issues.push({ path, message });
  if (typeof list !== "object" || list === null) {
    return { ok: false, issues: [{ path: "$", message: "checklist must be an object" }] };
  }
  const c = list as Partial<ExamChecklist>;
  if (!c.id || !ID.test(c.id)) add("$.id", "required, lowercase snake_case");
  if (!c.version || !/^\d+\.\d+\.\d+$/.test(c.version)) add("$.version", "semver required");
  if (!c.title) add("$.title", "required");
  if (!c.setting) add("$.setting", "required");
  if (c.reviewStatus !== "pending_clinician_review" && c.reviewStatus !== "reviewed") {
    add("$.reviewStatus", "must be pending_clinician_review or reviewed");
  }
  if (c.reviewStatus === "reviewed" && !c.reviewedBy) add("$.reviewedBy", "a reviewed checklist must name its reviewer");
  if (!Array.isArray(c.references) || c.references.length === 0) add("$.references", "at least one reference required");
  else c.references.forEach((r, i) => validateReference(r, `$.references[${i}]`, add));

  if (!Array.isArray(c.sections) || c.sections.length === 0) {
    add("$.sections", "at least one section required");
    return { ok: issues.length === 0, issues };
  }
  const seenSection = new Set<string>();
  const seenItem = new Set<string>();
  c.sections.forEach((s, i) => validateSection(s, `$.sections[${i}]`, add, seenSection, seenItem));
  return { ok: issues.length === 0, issues };
}

function validateSection(
  s: ExamSection | undefined,
  p: string,
  add: (path: string, message: string) => void,
  seenSection: Set<string>,
  seenItem: Set<string>
) {
  if (!s || typeof s !== "object") {
    add(p, "section must be an object");
    return;
  }
  if (!s.id || !ID.test(s.id)) add(`${p}.id`, "required, lowercase snake_case");
  else if (seenSection.has(s.id)) add(`${p}.id`, `duplicate section id "${s.id}"`);
  else seenSection.add(s.id);
  if (!s.title) add(`${p}.title`, "required");
  if (s.intro !== undefined) checkProse(s.intro, `${p}.intro`, add);
  if (!Array.isArray(s.items) || s.items.length === 0) {
    add(`${p}.items`, "at least one item required");
    return;
  }
  s.items.forEach((it, i) => validateItem(it, `${p}.items[${i}]`, add, seenItem));
}

function validateItem(
  it: ExamItem | undefined,
  p: string,
  add: (path: string, message: string) => void,
  seenItem: Set<string>
) {
  if (!it || typeof it !== "object") {
    add(p, "item must be an object");
    return;
  }
  if (!it.id || !ID.test(it.id)) add(`${p}.id`, "required, lowercase snake_case");
  else if (seenItem.has(it.id)) add(`${p}.id`, `duplicate item id "${it.id}"`);
  else seenItem.add(it.id);
  if (!it.label) add(`${p}.label`, "required");
  if (!it.how || it.how.length < 20) add(`${p}.how`, "explain how to elicit the sign (at least a sentence)");
  else checkProse(it.how, `${p}.how`, add);
  if (!it.significance || it.significance.length < 10) add(`${p}.significance`, "say what the finding is associated with");
  else checkProse(it.significance, `${p}.significance`, add);
  if (it.normal !== undefined) checkProse(it.normal, `${p}.normal`, add);
  if (it.tier !== undefined && it.tier !== "core" && it.tier !== "detailed") add(`${p}.tier`, "tier must be core or detailed");
}

function checkProse(text: string, p: string, add: (path: string, message: string) => void) {
  if (TREATMENT_ADVICE.test(text)) add(p, "treatment wording is not allowed");
  if (DIAGNOSIS_CLAIM.test(text)) add(p, "must not state a diagnosis");
}
