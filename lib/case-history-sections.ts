/**
 * The case-sheet sections a spoken fragment can be sorted into by the live-dictation flow,
 * and where each one is stored. No dependencies — safe to import from client components, the
 * server action, and the test alike (lib/case-history-routing.ts pulls in the model SDK, so
 * the shared constants live here instead).
 */

export const ROUTABLE_SECTIONS = [
  "complaints",
  "hopi",
  "past",
  "family",
  "medication",
  "surgical",
  "obstetric",
  "abdomen",
  "chest",
  "local",
  "examination", // general / PICCLE / vitals narrative — held for the resident to place
  "diagnosis",
  "plan",
] as const;

export type RoutableSection = (typeof ROUTABLE_SECTIONS)[number];

export type RoutedSegment = {
  section: RoutableSection;
  /** For `hopi` only — which complaint this detail is about. */
  complaint?: string;
  /** The resident's words, lightly cleaned. Never rewritten beyond that. */
  text: string;
};

/** Case-history observation label each history section is appended under. `hopi` is special —
 *  its rows are stored as "<complaint>: <detail>", which is how the workspace reads them back. */
export const HISTORY_SECTION_LABEL: Record<string, string> = {
  complaints: "chief complaints",
  past: "past history",
  family: "family history",
  medication: "medication history",
  surgical: "surgical history",
  obstetric: "menstrual and obstetric history",
};

/** The three free-text examination cards — one value each, so these are appended in place. */
export const EXAM_SECTION_LABEL: Record<string, string> = {
  abdomen: "per abdomen",
  chest: "chest",
  local: "local examination",
};

/** Sorted but not written — the resident places these (structured toggles, or the
 *  AI-proposal-and-approve flow). The overlay shows them for review. */
export const HELD_SECTIONS = new Set<RoutableSection>(["examination", "diagnosis", "plan"]);
