import type { SlotResult } from "@/lib/history-check/sources";
import type { HistoryTree } from "@/lib/history-check/types";

/**
 * SAFETY LEVEL 0-4 — how completely the must-not-miss questions have been covered, and how
 * many of them came back positive.
 *
 * WHAT THIS IS NOT, AND STILL IS NOT AFTER SIGN-OFF. This is not a validated clinical score,
 * it is not a triage category, and it does not predict anything. No published instrument was
 * used to derive the thresholds below; they are a reading of the tree's own red-flag slots,
 * chosen by the app. It must never be rendered as a severity score, a priority, or an
 * instruction to act.
 *
 * The thresholds were reviewed and signed off on 2026-09-26 (see
 * `SAFETY_LEVEL_REVIEW_STATUS`). READ THAT NARROWLY: a clinician agreeing the mapping is
 * sensible is not the same claim as the number having been validated against outcomes, and
 * nothing here has been. The paragraph above survives the sign-off unchanged — it describes
 * what the number is, not what was pending about it.
 *
 * THE ONE RULE THAT MATTERS. "Not asked" is not reassurance. A level of 0 is reachable ONLY
 * when every red-flag slot in the tree has actually been asked and every one came back
 * explicitly negative. While any red flag remains unasked the level cannot fall below 1,
 * however calm the rest of the history looks. This is the whole point of the number: it is a
 * completeness meter that also counts positives, not a measure of how sick the patient is.
 *
 * The mapping, given the red-flag slots of one complaint tree:
 *
 *   positives >= 3  -> 4
 *   positives == 2  -> 3
 *   positives == 1  -> 2
 *   positives == 0, any unasked -> 1   (nothing positive, but the sweep is incomplete)
 *   positives == 0, none unasked -> 0  (every red flag asked, every one negative)
 *
 * Red-flag slots ignore the ward/academic tier everywhere else in this module's neighbours,
 * and they are ignored here too: every red_flag slot counts, whatever its tier.
 */

export const SAFETY_LEVEL_MIN = 0;
export const SAFETY_LEVEL_MAX = 4;

/**
 * Mirrors the trees' own flag. Anything that surfaces the level must surface this beside it,
 * so a reader takes "reviewed" for what it is — see the header: reviewed is not validated.
 *
 * Nothing reads either const today; the card computes `assessSafety` through view.ts and does
 * not render it. They are the record of the sign-off, and what a renderer must show when one
 * is built.
 */
export const SAFETY_LEVEL_REVIEW_STATUS = "reviewed" as const;
export const SAFETY_LEVEL_REVIEWED_BY = "Dr. Anubhav, General Surgery — 2026-09-26";

export type SafetyLevel = 0 | 1 | 2 | 3 | 4;

export type SafetyAssessment = {
  level: SafetyLevel;
  /** Red-flag slot ids that came back positive, in tree order. */
  positives: string[];
  /** Red-flag slot ids never mentioned, in tree order. These are why a level is not 0. */
  unasked: string[];
  /** Red-flag slot ids explicitly denied, in tree order. */
  negatives: string[];
  /** False while any red flag is unasked. The card must not present a complete-looking number. */
  complete: boolean;
  /** Short, neutral wording for the chip. Never an instruction and never a diagnosis. */
  summary: string;
};

/**
 * Score one complaint tree against its validated slot results.
 *
 * A tree with no red-flag slots cannot happen (the schema validator requires at least one),
 * but if one ever did, it scores 0 with `complete` false rather than pretending to be safe.
 */
export function assessSafety(tree: HistoryTree, results: SlotResult[]): SafetyAssessment {
  const byId = new Map(results.map((r) => [r.id, r]));
  const redFlags = tree.slots.filter((s) => s.group === "red_flag");

  const positives: string[] = [];
  const negatives: string[] = [];
  const unasked: string[] = [];

  for (const slot of redFlags) {
    // A red flag with no result at all is unasked, not negative. Absence of an entry and an
    // explicit "no" are different facts, and only one of them is reassuring.
    const state = byId.get(slot.id)?.state ?? "unasked";
    if (state === "positive") positives.push(slot.id);
    else if (state === "negative") negatives.push(slot.id);
    else unasked.push(slot.id);
  }

  const level = levelFor(positives.length, unasked.length);
  const complete = redFlags.length > 0 && unasked.length === 0;

  return { level, positives, unasked, negatives, complete, summary: summarise(level, positives.length, unasked.length) };
}

function levelFor(positives: number, unasked: number): SafetyLevel {
  if (positives >= 3) return 4;
  if (positives === 2) return 3;
  if (positives === 1) return 2;
  return unasked > 0 ? 1 : 0;
}

/** Plain counts. No advice, no urgency wording, no diagnosis. */
function summarise(level: SafetyLevel, positives: number, unasked: number): string {
  const p = positives === 1 ? "1 red flag positive" : `${positives} red flags positive`;
  const u = unasked === 1 ? "1 not asked" : `${unasked} not asked`;
  if (positives === 0 && unasked === 0) return "All red flags asked, none positive";
  if (positives === 0) return `No red flag positive, ${u}`;
  return unasked > 0 ? `${p}, ${u}` : p;
}

/**
 * Worst level across several complaints, for the summary page. Returns null when there is
 * nothing to score, so the caller shows nothing rather than a reassuring zero.
 */
export function worstSafety(assessments: SafetyAssessment[]): SafetyAssessment | null {
  if (assessments.length === 0) return null;
  return assessments.reduce((worst, a) => (a.level > worst.level ? a : worst));
}
