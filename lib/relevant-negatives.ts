import { suggestTrees } from "@/lib/history-check/trees";

/**
 * The Relevant-negatives card's Yes / No list, straight after HOPI: the associated symptoms and
 * red flags of each complaint's history tree (content/history-trees/) that the complaints and
 * HOPI have not already covered. Plain word matching, no model call, so it is there the moment
 * HOPI is done — no diagnosis needed.
 *
 * Each answer is one sentence in the card's own text, so a tapped answer, a typed sentence and
 * an AI draft are the same record, and reopening the card reads the answers back out of it. An
 * item never tapped writes nothing — "not asked" is never stored as a negative.
 */

const MAX_ITEMS = 16;

export function negativeChecklist(complaints: string[], hopiText: string): string[] {
  const said = ` ${[...complaints, hopiText].join(" ").toLowerCase()} `;
  const mentioned = (t: string) => new RegExp(`[^a-z]${t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}[^a-z]`).test(said);
  const slots = suggestTrees(complaints).flatMap((t) => t.slots).filter((s) => s.kind === "yes_no" && !s.terms.some(mentioned));
  // Associated symptoms first, every tier (haematemesis and melena are "detailed" on the
  // abdominal-pain tree yet belong on any surgical HOPI), then the core red flags.
  const labels = [
    ...slots.filter((s) => s.group === "associated"),
    ...slots.filter((s) => s.group === "red_flag" && s.tier !== "detailed"),
  ].map((s) => s.label);
  return [...new Set(labels)].slice(0, MAX_ITEMS);
}

// "Jaundice / dark urine" reads "jaundice / dark urine" mid-sentence; "NSAID use" stays as is.
const inSentence = (label: string) => (/^[A-Z][a-z]/.test(label) ? label[0].toLowerCase() + label.slice(1) : label);
const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const sentenceFor = (label: string, a: "yes" | "no") =>
  a === "no" ? `There is no history of ${inSentence(label)}.` : `There is history of ${inSentence(label)}.`;
const reFor = (label: string, a: "yes" | "no") =>
  new RegExp(`(^|\\n)\\s*${esc(sentenceFor(label, a))}\\s*(?=\\n|$)`, "i");

export function answerOf(text: string, label: string): "yes" | "no" | null {
  if (reFor(label, "no").test(text)) return "no";
  if (reFor(label, "yes").test(text)) return "yes";
  return null;
}

/** Set (or, tapped again, clear) one answer — one point per line. */
export function setAnswer(text: string, label: string, a: "yes" | "no"): string {
  const was = answerOf(text, label);
  const cleared = text.replace(reFor(label, "no"), "").replace(reFor(label, "yes"), "").replace(/^\n+/, "");
  if (was === a) return cleared;
  return [cleared.replace(/\s+$/, ""), sentenceFor(label, a)].filter(Boolean).join("\n");
}
