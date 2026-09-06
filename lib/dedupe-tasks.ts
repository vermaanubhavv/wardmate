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
  // Words a spoken instruction leans on that name nothing: "do it tomorrow" is a job with no
  // content, and this file has always said such a job must never be folded into another one.
  "do", "it", "this", "that",
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

/**
 * The word, reduced to the part that carries its meaning.
 *
 * A ward says one job in every tense it has. "Continue antibiotics", "continued the
 * antibiotic", "continuing antibiotics" are one instruction, and before this they produced
 * three different keys and three rows on a list whose whole purpose is to be the count of what
 * is left. Only endings are cut — plural, past, progressive, the silent e — so this can merge
 * two forms of the same word and cannot merge two different words. That asymmetry is the same
 * one SYNONYMS above is held to: failing to merge leaves the list untidy, merging wrongly hides
 * a job.
 *
 * It is deliberately not a real stemmer. Porter and its kin fold "operate" and "operation"
 * together, which on a surgical ward is two different things being said.
 */
function stem(word: string): string {
  let w = word;

  if (w.length > 4 && w.endsWith("ies")) w = w.slice(0, -3) + "y";
  else if (w.length > 3 && w.endsWith("s") && !w.endsWith("ss") && !w.endsWith("us")) {
    w = w.slice(0, -1);
  }

  if (w.length > 5 && w.endsWith("ing")) w = w.slice(0, -3);
  else if (w.length > 4 && w.endsWith("ed")) w = w.slice(0, -2);

  // "planned" → "plann" → "plan", so it meets "plan". Not for l/s/z, where the double letter is
  // usually the word itself ("still", "pass", "buzz").
  const last = w[w.length - 1];
  if (w.length > 3 && last === w[w.length - 2] && !"lsz".includes(last)) w = w.slice(0, -1);

  // The silent e, so "remove" meets "removed" → "remov" and "dose" meets "doses" → "dos".
  if (w.length > 4 && w.endsWith("e")) w = w.slice(0, -1);

  return w;
}

/** Filler that says when, not what. Two sayings of one job rarely agree on the day. */
const TIMEFRAMES = new Set([
  "today", "tomorrow", "tonight", "morning", "evening", "afternoon", "now",
  "later", "asap", "stat", "urgently", "immediately", "soon",
]);

export function taskKey(text: string): string {
  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    // Synonyms, then the words that carry nothing, and only then the endings. Dropping the
    // filler first matters: stemming would cut "evening" to "even" and "please" to "pleas",
    // and neither would match the list it is supposed to be removed by.
    .map((w) => SYNONYMS[w] ?? w)
    .filter((w) => !STOPWORDS.has(w))
    .filter((w) => !TIMEFRAMES.has(w))
    .map(stem);

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

/**
 * Whether showing the words a job came from tells the resident anything.
 *
 * The quote is there so a job is never only the app's paraphrase — that matters when the
 * sentence was long and the job is a summary of it. But most plans are extracted almost
 * verbatim, so the quote repeats the job word for word, doubling the height of every row in a
 * list of twenty to say the same thing twice.
 *
 * Compared after the same normalisation used for folding repeats, so punctuation and casing do
 * not make an identical sentence look different.
 */
export function quoteAddsNothing(text: string, quote: string): boolean {
  const t = taskKey(text);
  const q = taskKey(quote);
  if (!t || !q) return true;
  // Contained either way: "discharge tomorrow" against "plan is to discharge tomorrow" adds
  // only filler, and the job is the part that matters.
  return t === q || q.includes(t);
}
