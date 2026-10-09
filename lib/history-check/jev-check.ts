import { askJev, chosenProbability, type JevAnswers } from "@/lib/jev";
import { redactFor, type PatientIdentifiers } from "@/lib/jev-observations";
import { log } from "@/lib/observability";
import type { CheckResult } from "@/lib/history-check/sources";
import type { HistoryTree } from "@/lib/history-check/types";

/**
 * Jev reads each surviving quote for MEANING, after lib/history-check/validate.ts has checked
 * it for EXISTENCE. The validator cannot tell "no fever earlier, fever now" from a denial, and
 * accepts a positive from any real span — "no vomiting" cited as vomiting present passes it.
 *
 * Runs after the validator, never instead of it: the validator stays the deterministic
 * guarantee, and this can only take a slot DOWN to unasked (the safe default), recorded as a
 * rejection so the stored run still says what the model claimed. It never promotes a slot.
 * No key, an error or a timeout: the validated result is stored unchanged.
 */

// ponytail: fixed bar, untuned — a downgrade only on a confident disagreement; set it from the
// eval set (lib/history-check/evals/cases.ts) once Jev runs against it.
const DISAGREE_AT = 0.8;

const MEANING = {
  present: "the quote says the patient has this, or gives its value",
  denied: "the quote explicitly says the patient does NOT have this",
  not_stated: "the quote does not say either way about this item",
};

export async function jevCrossCheck(
  tree: HistoryTree,
  result: CheckResult,
  /** The patient: their name and bed are kept out of the quotes Jev is sent. */
  who?: PatientIdentifiers
): Promise<void> {
  const labels = new Map(tree.slots.map((s) => [s.id, s.label]));
  const items = result.slots
    .map((s, i) => ({ i, s }))
    .filter(({ s }) => s.state !== "unasked" && s.evidence);
  if (items.length === 0) return;

  const questions: Record<string, unknown> = {};
  const state = items.map(({ s }) => ({ item: labels.get(s.id) ?? s.id, quote: redactFor(s.evidence!.quote, who) }));
  items.forEach((_, k) => {
    questions[`meaning_${k}`] = {
      type: "choice",
      instructions: `A doctor dictated \`items[${k}].quote\` while taking a history. What does it say about \`items[${k}].item\`?`,
      criteria: MEANING,
    };
  });

  const jev = await askJev({ items: state }, questions);
  if ("fallback" in jev) {
    if (jev.fallback !== "no key") log.info("history check: Jev unavailable", { reason: jev.fallback });
    return;
  }
  applyMeanings(result, items.map(({ i }) => i), jev.answers);
}

/** Pure: downgrade slots Jev confidently reads the other way. Exported for the test. */
export function applyMeanings(result: CheckResult, slotIndexes: number[], answers: JevAnswers): void {
  slotIndexes.forEach((i, k) => {
    const slot = result.slots[i];
    const a = answers[`meaning_${k}`];
    const agrees = (slot.state === "positive" && a?.choice === "present") || (slot.state === "negative" && a?.choice === "denied");
    if (!a?.choice || agrees || chosenProbability(a) < DISAGREE_AT) return;
    result.rejections.push({
      slotId: slot.id,
      claimed: slot.state,
      becomes: "unasked",
      reason: "quote_means_otherwise",
      quote: slot.evidence?.quote ?? null,
    });
    result.slots[i] = { id: slot.id, state: "unasked", evidence: null, value: null, conflict: null };
  });
}
