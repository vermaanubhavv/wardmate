/**
 * Collapsing a to-do list that says the same thing twice.
 *
 * A job survives being said again. "Remove the drain tomorrow" spoken on Monday and repeated
 * on Tuesday is one job, not two, and a list showing both is a list nobody trusts to be the
 * count of what is left.
 *
 * Nothing is deleted to achieve this. The earlier observations stay exactly where they are,
 * with their quotes and their entries intact — this only decides what the LIST shows. That
 * distinction matters: the repetitions are evidence of what was said on a round, and the app
 * has never destroyed those. The newest is shown because it carries the current wording and
 * the current urgency; the ones underneath it are counted, not discarded.
 */

const STOPWORDS = new Set([
  "the", "a", "an", "to", "for", "of", "and", "please", "kindly", "his", "her", "their",
  "patient", "patients", "is", "be", "will", "should", "can", "we", "let", "us", "him",
]);

/**
 * A comparable form of a job's wording.
 *
 * Timeframes are stripped deliberately. "Discharge tomorrow" said yesterday and "discharge
 * today" said this morning are the same discharge, and leaving the day in would show them as
 * two separate jobs on the list — the exact duplication this exists to remove. When they
 * differ, urgency is what carries it, and that comes from the newest one.
 */
/**
 * The one place different words are treated as the same word.
 *
 * Kept deliberately tiny, and only for taking something out, because that is the job a ward
 * says most variously — "drain out", "remove the drain", "drain off" are one job. The risk is
 * not symmetrical: merging two jobs that are actually different HIDES one, while failing to
 * merge two identical ones only leaves the list untidy. So nothing goes in here unless the
 * words are genuinely interchangeable in a surgical instruction.
 */
const SYNONYMS: Record<string, string> = {
  out: "remove",
  off: "remove",
  removal: "remove",
  remove: "remove",
};

export function taskKey(text: string): string {
  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => SYNONYMS[w] ?? w)
    .filter((w) => !STOPWORDS.has(w))
    .filter(
      (w) =>
        ![
          "today", "tomorrow", "tonight", "morning", "evening", "afternoon", "now",
          "later", "asap", "stat", "urgently", "immediately", "soon",
        ].includes(w)
    );

  // Sorted, so "drain out" and "out drain" collapse together — speech reorders freely, and
  // the order of two words is not a second job.
  return [...new Set(words)].sort().join(" ");
}

export type Deduped<T> = {
  task: T;
  /** The older sayings of the same job, newest first. Kept, never deleted. */
  repeats: T[];
};

/**
 * Group repeats of the same job, newest kept.
 *
 * `tasks` must be newest-first, which every caller already has: the newest wording and the
 * newest urgency are the ones that should be acted on.
 *
 * A job whose wording is entirely stopwords and timeframes — "do it tomorrow" — produces an
 * empty key and is never merged with anything. Two vague jobs are not evidence of one job,
 * and silently combining them would lose one.
 */
export function dedupeTasks<T extends { value_text: string | null; label: string }>(
  tasks: T[]
): Deduped<T>[] {
  const groups = new Map<string, Deduped<T>>();
  const ungrouped: Deduped<T>[] = [];

  for (const task of tasks) {
    const key = taskKey(task.value_text ?? task.label);

    if (!key) {
      ungrouped.push({ task, repeats: [] });
      continue;
    }

    const existing = groups.get(key);
    if (existing) existing.repeats.push(task);
    else groups.set(key, { task, repeats: [] });
  }

  return [...groups.values(), ...ungrouped];
}
