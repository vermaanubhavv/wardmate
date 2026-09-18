import type { HistoryTree, SlotState } from "@/lib/history-check/types";
import type { CheckResult, Evidence, HistorySource, Rejection, SlotResult } from "@/lib/history-check/sources";

/**
 * THE GUARANTEE. Deterministic, no model, no network.
 *
 * The prompt in lib/history-check/extract.ts asks the model to answer every slot as positive,
 * negative or unasked with a verbatim quote. This file is what makes that true. For each slot
 * the model returned:
 *
 *   1. A positive or negative must cite a source index that exists and a quote that is a
 *      literal substring of that source (case and whitespace normalised, nothing else).
 *      Otherwise it becomes unasked.
 *   2. A negative must ALSO contain, inside its own quote, an explicit negation word AND one of
 *      the slot's own terms. "no vomiting" is a negative for the vomiting slot. "no headache,
 *      vomiting present" cited for the vomiting slot is not: the negation is there but it
 *      belongs to another item, and the term check alone would pass — so both are required,
 *      and the negation must come BEFORE the term within the quote.
 *      Otherwise it becomes unasked.
 *   3. A positive value slot must carry a value that is itself a literal substring of the
 *      cited source. Otherwise it becomes unasked.
 *   4. A slot the model did not return is unasked. A slot id the tree does not know is dropped.
 *   5. Unasked carries no quote, no value, no conflict — whatever the model attached is stripped.
 *   6. A conflict quote goes through check 1 as well; a conflict that fails is dropped without
 *      touching the slot's state.
 *
 * Every downgrade is recorded, so the stored run says what the model tried to claim.
 *
 * The one thing this cannot catch is a NEGATIVE the model chose for a sentence that does
 * contain a negation and the term but means the opposite ("no fever earlier, fever now").
 * That is why the eval set (lib/history-check/evals/cases.ts) has such a case, and why
 * negatives still show their quote on the card.
 */

/** What the model returns per slot, before validation. Loose on purpose — it is checked. */
export type RawSlot = {
  id: string;
  state: string;
  quote?: string | null;
  source?: number | null;
  value?: string | null;
  conflict?: { quote?: string | null; source?: number | null } | null;
};

export type RawExtraction = {
  slots: RawSlot[];
  wrong_patient?: { quote?: string | null; source?: number | null } | null;
};

/**
 * Words that make a phrase an explicit denial. English only — this ward dictates in English
 * (a resident, never the patient), and every extra token here WIDENS what is accepted as a
 * negative, which is the unsafe direction. Add with care and with a test.
 */
const NEGATION =
  /(^|[^a-z])(no|not|nil|none|never|denies|denied|denying|absent|absence of|without|negative for|negative|nor|didn't|doesn't|hasn't|wasn't|isn't|did not|does not|has not|was not|is not|-ve)(?=$|[^a-z])/i;

export function normalise(s: string): string {
  return s.toLowerCase().replace(/\s+/g, " ").trim();
}

function containsTerm(haystack: string, term: string): number {
  const re = new RegExp(`(^|[^a-z])${escape(normalise(term))}(?=$|[^a-z])`);
  const m = re.exec(haystack);
  return m ? m.index + m[1].length : -1;
}

function escape(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Words that, next to the item, say it is PRESENT — which ends a denial's reach. "no headache,
 * vomiting present" denies headache only. Kept short; every entry narrows what is accepted.
 */
const AFFIRMATION = /(^|[^a-z])(present|positive|\+ve|complains of|c\/o|has|having|since|started|for \d|x \d|\d+ (day|days|week|weeks))(?=$|[^a-z])/i;

/**
 * Does the quote deny THIS item? Three things must hold:
 *   - a negation word appears, and one of the slot's terms appears AT OR AFTER it (order
 *     matters: "vomiting present, no headache" cited for vomiting has both words, but the
 *     denial is not about vomiting);
 *   - nothing between the negation and the term affirms something ("no headache, has
 *     vomiting" — the "has" ends the denial before it reaches vomiting);
 *   - nothing in the term's own clause (up to the next . ; ,) affirms it ("no headache,
 *     vomiting present").
 * Denial lists — "no vomiting, loose stools, rash" — keep their commas and pass, because a
 * comma alone is how such a list is dictated.
 */
export function quoteNegatesItem(quote: string, terms: string[]): boolean {
  const q = normalise(quote);
  const neg = NEGATION.exec(q);
  if (!neg) return false;
  const negAt = neg.index + neg[1].length;
  return terms.some((t) => {
    const at = containsTerm(q, t);
    if (at < 0 || at < negAt) return false;
    const between = q.slice(negAt, at);
    if (AFFIRMATION.test(between)) return false;
    const clauseEnd = q.slice(at).search(/[.;,]/);
    const clause = clauseEnd < 0 ? q.slice(at) : q.slice(at, at + clauseEnd);
    return !AFFIRMATION.test(clause);
  });
}

/** Quote is a literal span of the cited source. */
function checkEvidence(
  quote: string | null | undefined,
  source: number | null | undefined,
  sources: HistorySource[]
): { ok: true; evidence: Evidence } | { ok: false; reason: Rejection["reason"] } {
  if (!quote || !normalise(quote)) return { ok: false, reason: "quote_missing" };
  if (source == null || !Number.isInteger(source) || source < 0 || source >= sources.length) {
    return { ok: false, reason: "source_index_invalid" };
  }
  if (!normalise(sources[source].text).includes(normalise(quote))) {
    return { ok: false, reason: "quote_not_in_source" };
  }
  return { ok: true, evidence: { quote: quote.trim(), source } };
}

export function validateExtraction(
  tree: HistoryTree,
  raw: RawExtraction,
  sources: HistorySource[]
): CheckResult {
  const rejections: Rejection[] = [];
  const byId = new Map<string, RawSlot>();
  for (const r of raw.slots ?? []) {
    if (!tree.slots.some((s) => s.id === r.id)) {
      rejections.push({ slotId: r.id, claimed: asState(r.state), becomes: "unasked", reason: "unknown_slot", quote: r.quote ?? null });
      continue;
    }
    // Duplicate ids: the first wins, the rest are ignored rather than trusted.
    if (!byId.has(r.id)) byId.set(r.id, r);
  }

  const unasked = (id: string): SlotResult => ({ id, state: "unasked", evidence: null, value: null, conflict: null });

  const slots: SlotResult[] = tree.slots.map((slot) => {
    const r = byId.get(slot.id);
    if (!r) return unasked(slot.id);
    const claimed = asState(r.state);
    if (claimed === "unasked") return unasked(slot.id);

    const reject = (reason: Rejection["reason"]): SlotResult => {
      rejections.push({ slotId: slot.id, claimed, becomes: "unasked", reason, quote: r.quote ?? null });
      return unasked(slot.id);
    };

    const ev = checkEvidence(r.quote, r.source, sources);
    if (!ev.ok) return reject(ev.reason);

    if (claimed === "negative" && !quoteNegatesItem(ev.evidence.quote, slot.terms)) {
      // Say which half failed, for the log: is the item even named in the quote?
      const named = slot.terms.some((t) => containsTerm(normalise(ev.evidence.quote), t) >= 0);
      return reject(named ? "no_negation_in_quote" : "term_not_in_quote");
    }

    let value: string | null = null;
    if (slot.kind === "value" && claimed === "positive") {
      const v = (r.value ?? "").trim();
      if (!v) return reject("value_missing");
      if (!normalise(sources[ev.evidence.source].text).includes(normalise(v))) return reject("value_not_in_source");
      value = v;
    }

    let conflict: Evidence | null = null;
    if (r.conflict) {
      const c = checkEvidence(r.conflict.quote, r.conflict.source, sources);
      if (c.ok) conflict = c.evidence;
      else rejections.push({ slotId: slot.id, claimed, becomes: claimed, reason: "conflict_quote_not_in_source", quote: r.conflict.quote ?? null });
    }

    return { id: slot.id, state: claimed, evidence: ev.evidence, value, conflict };
  });

  let wrongPatient: Evidence | null = null;
  if (raw.wrong_patient) {
    const w = checkEvidence(raw.wrong_patient.quote, raw.wrong_patient.source, sources);
    if (w.ok) wrongPatient = w.evidence;
    else rejections.push({ slotId: "__wrong_patient", claimed: "positive", becomes: "unasked", reason: w.reason, quote: raw.wrong_patient.quote ?? null });
  }

  return { slots, rejections, wrongPatient };
}

/** Anything that is not exactly positive or negative is unasked. The safe default. */
function asState(s: unknown): SlotState {
  return s === "positive" || s === "negative" ? s : "unasked";
}
