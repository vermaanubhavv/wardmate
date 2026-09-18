/**
 * The shape of a complaint tree — the DATA a "History check" runs against.
 *
 * A tree is content, not code. Everything the engine needs to map a dictation onto a
 * complaint, decide what has not been asked, and lay the history out in long-case order lives
 * in one versioned file under content/history-trees/. Adding a complaint means adding a file
 * and one registry line (content/history-trees/index.ts); nothing in lib/history-check/
 * knows what fever is.
 *
 * The three slot states are the whole point of the feature and are spelled out here so they
 * cannot drift between the prompt, the validator and the screen:
 *
 *   positive  the resident said the item is present / gave it a value
 *   negative  the resident EXPLICITLY said it is absent ("no vomiting")
 *   unasked   the dictation does not mention it at all
 *
 * "Unasked" is never rendered or stored as a negative. A negative with no negation in its own
 * quote is downgraded to unasked by lib/history-check/validate.ts, in code, after the model
 * has answered — the same "the prompt asks, the code guarantees" split lib/extract.ts uses.
 */

export const SLOT_STATES = ["positive", "negative", "unasked"] as const;
export type SlotState = (typeof SLOT_STATES)[number];

/**
 * Where a slot sits in the tree, which decides where its gap is listed and where its answer
 * is printed. Red flags always show in the gap list regardless of the leading differential —
 * that is the anti-anchoring rule from the brief, and the group is how the engine knows.
 */
export const SLOT_GROUPS = ["informant", "hpi", "associated", "red_flag", "exposure"] as const;
export type SlotGroup = (typeof SLOT_GROUPS)[number];

export type Slot = {
  /** Stable id, snake_case, unique within the tree. Stored with every result, so renaming one
   *  is a new tree version. */
  id: string;
  group: SlotGroup;
  /** Short label used in the printed history: "Onset", "Rigors". */
  label: string;
  /** The gap-list wording. Always a question to consider, never an instruction — see
   *  lib/history-check/schema.ts, which refuses anything else. */
  question: string;
  /**
   * "value" slots carry a verbatim phrase from the dictation (onset, duration, pattern).
   * "yes_no" slots are present / explicitly absent / not mentioned, and are what the
   * pertinent positives and negatives are built from.
   */
  kind: "value" | "yes_no";
  /**
   * Words the item is commonly dictated as. Two jobs: they tell the model what to look for,
   * and the validator requires one of them inside the quote of any NEGATIVE — "no vomiting"
   * can only be a negative for a slot whose terms include "vomiting". Lowercase.
   */
  terms: string[];
  /** A value that is usually a number (days, degrees). Rendered amber and marked unconfirmed,
   *  the same convention every other number in the app follows until a resident confirms it. */
  numeric?: boolean;
  /**
   * How much of the tree a mode shows. "core" is what a ward round needs; "detailed" is what a
   * long case adds on top. Red flags are shown in every mode whatever this says — the engine
   * ignores the tier for the red_flag group. Absent means "core".
   *
   * The mode is applied on READ, when the gap list and history are built. Extraction always
   * fills the whole tree, so switching mode never triggers another model call.
   */
  tier?: "core" | "detailed";
  /**
   * One sentence on why the question is worth asking, shown under the gap in academic mode.
   * Held to the same rules as every other clinical text here: a reason to ask, never a
   * diagnosis, never a treatment. Left empty until a clinician writes it.
   */
  teach?: string;
};

export type Differential = {
  id: string;
  name: string;
  /** Slot ids whose POSITIVE state raises this differential when picking the leading ones.
   *  Never used to suggest a diagnosis to the resident — only to order the gap list. */
  pointers: string[];
  /** Slot ids whose answer would help tell this differential apart. Unasked ones are listed
   *  in the "discriminating questions" band of the gap list. */
  discriminators: string[];
  /** Only considered when the patient's record says so — "post_op" needs a surgery date. */
  appliesWhen?: "post_op";
};

/**
 * Where a tree's content came from. Every tree names at least one; the academic view shows
 * them so a student can go and read the primary source rather than trust the app.
 */
export type Reference = {
  title: string;
  /** Journal, book or guideline body: "JAMA (Rational Clinical Examination)", "NCVBDC". */
  source: string;
  year?: number;
  /** PubMed id when the source is indexed there. Digits only. */
  pmid?: string;
  url?: string;
};

export type HistoryTree = {
  /** "fever" — the file is named after it. */
  id: string;
  /** Semantic version. Any change to slot ids, terms or output order is a new version. */
  version: string;
  /** Display name: "Fever". */
  complaint: string;
  /** Words in the recorded chief complaints that suggest this tree (lowercase). */
  triggers: string[];
  /** Who the tree was written for. Printed on the card so nobody uses it off its ward. */
  setting: string;
  /** Clinical content is authored by the app and must be signed off by a clinician before the
   *  tree is used on a ward. The flag is data so the card can say so. */
  reviewStatus: "pending_clinician_review" | "reviewed";
  reviewedBy: string | null;
  /** Primary sources the questions were drawn from. Required — see Reference. */
  references: Reference[];
  slots: Slot[];
  differentials: Differential[];
  output: {
    /** The slot whose verbatim value goes on the chief-complaint line ("Fever x 5 days"). */
    durationSlot: string;
    /** Slot ids, in the order the HPI is written. Slots not listed are still printed, after
     *  these, in tree order — nothing recorded is dropped. */
    hpiOrder: string[];
  };
};
