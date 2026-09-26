import type { HistoryTree, SlotState } from "@/lib/history-check/types";

/**
 * What the check reads, and what every quote is checked against.
 *
 * One source per case-history entry. A voice or photo entry's source is its transcript, exactly
 * as stored. The review workspace's manual entry has no transcript — each typed line there is
 * its own evidence (the workspace stores value_text as source_quote, see
 * app/patients/[id]/case-history/actions.ts) — so its source is those lines, one per line.
 *
 * The validator only ever accepts a quote that is a literal substring of the source it cites.
 * That is why sources are numbered and kept verbatim: the model is given exactly this text,
 * and anything it returns that is not in it does not survive.
 */
export type HistorySource = {
  /** 0-based position, which is what the model cites. */
  index: number;
  entryId: string;
  kind: "voice" | "photo" | "manual";
  recordedAt: string;
  text: string;
};

export type SourceEntry = {
  id: string;
  source: string;
  transcript: string | null;
  recorded_at: string;
  observations: { value_text: string | null; label: string }[];
};

/** Case-history entries → numbered sources, oldest first, empty ones dropped. */
export function buildSources(entries: SourceEntry[]): HistorySource[] {
  const out: HistorySource[] = [];
  const sorted = [...entries].sort((a, b) => a.recorded_at.localeCompare(b.recorded_at));
  for (const e of sorted) {
    let text: string;
    let kind: HistorySource["kind"];
    if (e.source === "manual") {
      kind = "manual";
      text = e.observations
        .map((o) => (o.value_text ?? "").trim())
        .filter(Boolean)
        .join("\n");
    } else {
      kind = e.source === "photo" ? "photo" : "voice";
      text = (e.transcript ?? "").trim();
    }
    if (!text) continue;
    out.push({ index: out.length, entryId: e.id, kind, recordedAt: e.recorded_at, text });
  }
  return out;
}

/** A quote and where it came from. Every positive and negative carries exactly one. */
export type Evidence = {
  quote: string;
  /** Source index the quote was checked against. */
  source: number;
};

/**
 * One slot's validated answer. Every slot of the tree gets one, in tree order, so a consumer
 * never has to ask "what about the slots the model forgot" — they are unasked.
 */
export type SlotResult = {
  id: string;
  state: SlotState;
  /** Present on positive and negative only. */
  evidence: Evidence | null;
  /** Value slots, positive only: the verbatim phrase. */
  value: string | null;
  /** Set when a second statement contradicts the first (attendant vs patient, two entries).
   *  The state is then the FIRST statement's and the card asks the resident to resolve it. */
  conflict: Evidence | null;
};

export type Rejection = {
  slotId: string;
  /** What the model claimed. */
  claimed: SlotState;
  /** What it was downgraded to. Always "unasked" today; typed so a log reader can tell. */
  becomes: SlotState;
  reason:
    | "quote_not_in_source"
    | "quote_missing"
    | "source_index_invalid"
    | "no_negation_in_quote"
    | "term_not_in_quote"
    | "value_not_in_source"
    | "value_missing"
    | "unknown_slot"
    | "conflict_quote_not_in_source";
  quote: string | null;
};

/** The whole validated output of one run — what gets stored. */
export type CheckResult = {
  slots: SlotResult[];
  rejections: Rejection[];
  /** The model read the dictation as being about someone else, and the quote survived the
   *  substring check. The card shows this first and asks the resident to resolve it. */
  wrongPatient: Evidence | null;
};

/** Convenience: the tree's slots keyed by id. */
export function slotIndex(tree: HistoryTree) {
  return new Map(tree.slots.map((s) => [s.id, s]));
}
