/**
 * Which clinical bucket a to-do's own words put it in, for the /todo page's "By type" view.
 *
 * This is a re-slice of the same jobs the urgency grouping already sorts (lib/urgency.ts) —
 * nothing here changes what is outstanding or how urgent it is, it only answers "who walks
 * this one": a nurse doing the sampling round, radiology, a bedside procedure, or consent
 * paperwork. A short, keyword-based match against the job's own text, the same shape as
 * isActionableTask (lib/task-classification.ts) — no new data, nothing recorded differently.
 *
 * Ordered so a more specific match wins first: "send consent form" should read as a consent,
 * not a sample, even though "send" appears in both patterns.
 */
export type TaskCategory = "consent" | "radiology" | "procedure" | "sampling";

const CONSENT = /\bconsent\b/i;

const RADIOLOGY =
  /\b(x-?ray|ultrasound|usg|sonograph\w*|ct\s?(scan)?|mri|doppler|echo(cardiogram)?|imaging|radiograph\w*)\b/i;

const PROCEDURE =
  /\b(drain|dressing|suture|stitch(es)?|catheter|remove|reinsert|shift(ed)?\s+to|debridement|aspirat\w*|tap\b|incision)\b/i;

const SAMPLING =
  /\b(cbc|lft|kft|rft|crp|abg|vbg|hba1c|hb\b|tlc\b|electrolytes?|se\b|blood|sample|send\s+(routine\s+)?investigations?|labs?\b|culture)\b/i;

export function classifyTaskCategory(text: string | null | undefined): TaskCategory | null {
  const value = (text ?? "").trim();
  if (!value) return null;
  if (CONSENT.test(value)) return "consent";
  if (RADIOLOGY.test(value)) return "radiology";
  if (PROCEDURE.test(value)) return "procedure";
  if (SAMPLING.test(value)) return "sampling";
  return null;
}

export const TASK_CATEGORY_META: Record<TaskCategory, { label: string }> = {
  sampling: { label: "Sampling" },
  radiology: { label: "Radiology" },
  procedure: { label: "Procedure" },
  consent: { label: "Consents" },
};

/** The order categories are shown in on the "By type" view — sampling and radiology first,
 *  the two a resident is most often clearing before/after a round. */
export const TASK_CATEGORY_ORDER: TaskCategory[] = ["sampling", "radiology", "procedure", "consent"];
