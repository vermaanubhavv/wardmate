import type { ExtractedObservation } from "@/lib/extract";
import { askJev, chosenProbability, type JevAnswers } from "@/lib/jev";
import { log } from "@/lib/observability";
import { isActionableTask } from "@/lib/task-classification";
import type { TaskCategory } from "@/lib/task-category";

/**
 * Jev's second look at what extraction produced, before anything is stored. One request per
 * dictation, three kinds of question:
 *
 *   supported_i  Does the quote actually SAY this value? lib/extract.ts already guarantees the
 *                quote is a real span of the transcript; nothing checked that the span means
 *                the value stored beside it. A "no" turns the row amber (needs_confirmation)
 *                for the resident — never deleted, never the other way: Jev can make a row
 *                amber, it cannot make an amber row green.
 *   open_i       Plans the keyword filter would HIDE only (lib/task-classification.ts): is this
 *                still a job? "Continue IV antibiotics, repeat CBC tomorrow" says "continue"
 *                and was vanishing from the to-do list. A yes rescues it; Jev is never asked
 *                about a plan the filter already shows, so it cannot hide one.
 *   category_i   Which /todo "By type" bucket a plan belongs to. Stored; the keyword match stays
 *                the fallback wherever this is null.
 *
 * No key, an error or a timeout: every observation goes through exactly as before.
 */

// Amber bar from scripts/eval-supported.ts (2026-10-02, jev-1.13.0, 3 runs, one row per
// request): every unsupported row (25/25, tuning and held-out) scored < 0.3, every supported
// row >= 0.55 but one plan ("drain can come out tomorrow" -> "remove drain", ~0.25, amber).
// A wrong value left green is the dangerous miss, so the bar sits well above the wrong rows.
const UNSUPPORTED_BELOW = 0.5;
// Rescue bar from scripts/eval-task-open.ts (2026-10-02, jev-1.13.0, 3 runs, ±0.03 run to run):
// every job scored >= 0.47 and every non-job <= 0.41 ("MRCP done") across the tuning and
// held-out sets. A missed job stays hidden while a wrong rescue is one extra line to tick, so
// the bar sits nearer the non-jobs: "MRCP done" is sometimes rescued, no job is ever missed.
const RESCUE_AT = 0.4;
// Category bar from scripts/eval-task-category.ts (2026-10-02, jev-1.13.0, 3 runs): 38/38 tuning
// and 25/25 held-out at 0.7-0.8, against 27/38 and 17/25 for the keywords alone. Its one
// confident mistake ("discuss goals of care" as consent) scored 0.61-0.68, so 0.8 keeps it out;
// below the bar the keywords decide, as before.
const CATEGORY_AT = 0.8;

export type TaskCategoryJudgment = TaskCategory | "other";

export const CATEGORY_CRITERIA: Record<TaskCategoryJudgment, string> = {
  sampling: "collecting a specimen or sending, repeating or chasing a lab test: blood, urine, body fluid, swab, culture, bedside glucose",
  radiology: "an imaging study to arrange, repeat or review: X-ray, ultrasound, CT, MRI, MRCP, Doppler, echo",
  procedure: "a hands-on task done to the patient: removing or inserting a drain, tube, catheter or sutures, a dressing, a tap, debridement, incision and drainage, shifting to OT",
  consent: "taking or completing a consent",
  other: "anything else: a review, a referral, a drug or diet change, discharge, counselling, charting or monitoring, mobilising",
};

/** The amber question, about the {label, value, quote} row at `row` in the state. Exported
 *  so scripts/eval-supported.ts scores exactly what production asks. */
export function supportedQuestion(row: string) {
  return {
    type: "noul",
    instructions: `\`${row}.quote\` is what a doctor dictated on a ward round; \`${row}.value\` is what was recorded from it as the \`${row}.label\`. Would a careful resident reading only the quote record that value?`,
    criteria: {
      true: "Yes: the quote says it, in the same words, shorthand or a paraphrase — including a stated absence when the value is a negative",
      false: "No: the quote denies it, names a different side or site, only suspects it (rule out, ?), says it of someone else, puts it at a different time (planned, earlier, not yet), adds a condition the value drops, or is about something else",
    },
  };
}

/** The "By type" question, about the plan text at `path`. Exported so
 *  scripts/eval-task-category.ts scores exactly what production asks. */
export function categoryQuestion(path: string) {
  return {
    type: "choice",
    instructions: `\`${path}\` is a job from a surgical ward-round plan. Which ward work-stream does the job itself belong to? Judge by the action to be done, not by a word mentioned in passing.`,
    criteria: CATEGORY_CRITERIA,
  };
}

/** The rescue question, about the plan text at `path` in the state. Exported so
 *  scripts/eval-task-open.ts scores exactly what production asks. */
export function openQuestion(path: string) {
  return {
    type: "noul",
    instructions: `A surgical resident dictated \`${path}\` as part of a ward-round plan. Does it leave anything for the ward team to do, check or follow up?`,
    criteria: {
      true: "Something is still to be done or watched: a test to send or repeat, a report awaited or to review, a tube, drain, catheter or sutures to remove, a diet to change, charting or monitoring to keep up, someone to inform on a condition, a shift to OT",
      false: "It only records what was given, done, started or simply goes on unchanged — a drug, fluid, transfusion or dressing — with nothing further for anyone to do or check",
    },
  };
}

export async function judgeObservations(observations: ExtractedObservation[]): Promise<void> {
  const questions: Record<string, unknown> = {};
  observations.forEach((o, i) => {
    if (!o.needs_confirmation) {
      questions[`supported_${i}`] = supportedQuestion(`observations[${i}]`);
    }
    if (o.kind !== "plan") return;
    if (!isActionableTask(o.value_text || o.label)) {
      questions[`open_${i}`] = openQuestion(`observations[${i}].value`);
    }
    questions[`category_${i}`] = categoryQuestion(`observations[${i}].value`);
  });

  const state = {
    observations: observations.map((o) => ({ label: o.label, value: o.value_text, quote: o.source_quote })),
  };
  const jev = await askJev(state, questions);
  if ("fallback" in jev) {
    if (jev.fallback !== "no key") log.info("extract: Jev unavailable", { reason: jev.fallback });
    return;
  }
  applyJudgments(observations, jev.answers);
}

/** Pure: write Jev's answers onto the observations. Exported for the test. */
export function applyJudgments(observations: ExtractedObservation[], answers: JevAnswers): void {
  observations.forEach((o, i) => {
    const supported = answers[`supported_${i}`]?.noul;
    if (supported != null && supported < UNSUPPORTED_BELOW) o.needs_confirmation = true;
    if (o.kind !== "plan") return;
    const open = answers[`open_${i}`]?.noul;
    if (open != null && open >= RESCUE_AT) o.task_open = true;
    const category = answers[`category_${i}`];
    if (category?.choice && category.choice in CATEGORY_CRITERIA && chosenProbability(category) >= CATEGORY_AT) {
      o.task_category = category.choice as TaskCategoryJudgment;
    }
  });
}
