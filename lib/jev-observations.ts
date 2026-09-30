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

// ponytail: fixed bars, untuned — set from a labelled synthetic eval once there is traffic.
const UNSUPPORTED_BELOW = 0.5;
const RESCUE_AT = 0.7;
const CATEGORY_AT = 0.7;

export type TaskCategoryJudgment = TaskCategory | "other";

const CATEGORY_CRITERIA: Record<TaskCategoryJudgment, string> = {
  sampling: "a blood, urine or other sample to send, or a lab test to repeat or chase",
  radiology: "an imaging study to arrange, repeat or review: X-ray, ultrasound, CT, MRI, Doppler, echo",
  procedure: "a bedside procedure: drain, dressing, sutures, catheter, tube, aspiration, shifting the patient",
  consent: "consent paperwork to obtain or complete",
  other: "any other job: a review, a referral, a drug change, discharge, counselling, monitoring",
};

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
      questions[`open_${i}`] = {
        type: "noul",
        instructions: `Does \`observations[${i}].value\` contain a job someone still has to do, as opposed to only a treatment already given or simply being continued?`,
        criteria: {
          true: "At least one unfinished future action (repeat, send, arrange, review, remove…)",
          false: "Only a record of treatment already given, done or continued unchanged",
        },
      };
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
