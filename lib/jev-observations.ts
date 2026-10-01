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

// ponytail: untuned — give these an eval like the rescue's (scripts/eval-task-open.ts).
const UNSUPPORTED_BELOW = 0.5;
// Rescue bar from scripts/eval-task-open.ts (2026-10-02, jev-1.13.0, 3 runs, ±0.03 run to run):
// every job scored >= 0.47 and every non-job <= 0.41 ("MRCP done") across the tuning and
// held-out sets. A missed job stays hidden while a wrong rescue is one extra line to tick, so
// the bar sits nearer the non-jobs: "MRCP done" is sometimes rescued, no job is ever missed.
const RESCUE_AT = 0.4;
const CATEGORY_AT = 0.7;

export type TaskCategoryJudgment = TaskCategory | "other";

const CATEGORY_CRITERIA: Record<TaskCategoryJudgment, string> = {
  sampling: "a blood, urine or other sample to send, or a lab test to repeat or chase",
  radiology: "an imaging study to arrange, repeat or review: X-ray, ultrasound, CT, MRI, Doppler, echo",
  procedure: "a bedside procedure: drain, dressing, sutures, catheter, tube, aspiration, shifting the patient",
  consent: "consent paperwork to obtain or complete",
  other: "any other job: a review, a referral, a drug change, discharge, counselling, monitoring",
};

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
      questions[`supported_${i}`] = {
        type: "noul",
        instructions: `Does \`observations[${i}].quote\` (words a doctor dictated on a ward round) actually state \`observations[${i}].value\` as the \`observations[${i}].label\`?`,
        criteria: {
          true: "The quote says this, in these or equivalent words — including a stated absence when the value is a negative",
          false: "The quote says something different, the opposite, or does not mention it",
        },
      };
    }
    if (o.kind !== "plan") return;
    if (!isActionableTask(o.value_text || o.label)) {
      questions[`open_${i}`] = openQuestion(`observations[${i}].value`);
    }
    questions[`category_${i}`] = {
      type: "choice",
      instructions: `Who carries out the ward job in \`observations[${i}].value\`?`,
      criteria: CATEGORY_CRITERIA,
    };
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
