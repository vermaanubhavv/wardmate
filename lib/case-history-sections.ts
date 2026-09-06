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
  // Medical oncology. A surgical or medicine unit never shows these cards and its routing
  // prompt is never told about them, so nothing can be filed into one there.
  "onco_disease",
  "onco_treatment",
  "onco_cycle",
  "onco_toxicity",
  "performance",
  "onco_nodes",
  "onco_mucosa_line",
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
  onco_disease: "oncological history",
  onco_treatment: "treatment received",
  onco_cycle: "current cycle",
  onco_toxicity: "toxicity since last cycle",
  performance: "performance status",
  onco_nodes: "lymph node survey",
  onco_mucosa_line: "mucosa, skin and vascular access",
};

/**
 * The extra clerking cards a specialty adds, in the order they are walked.
 *
 * An oncology clerking asks four questions a surgical one has no place for, and asks them
 * BEFORE the general background: what the cancer is, what has already been given for it, what
 * is running now, and what the last cycle did to the patient. That order is the order an
 * oncologist actually takes a history in — the disease, then the treatment, then the damage.
 *
 * Performance status sits with the examination rather than the history, because it is
 * something you judge from the patient in front of you, not something you are told.
 */
export const SPECIALTY_HISTORY_SECTIONS: Record<string, RoutableSection[]> = {
  medical_oncology: ["onco_disease", "onco_treatment", "onco_cycle", "onco_toxicity"],
};

export const SPECIALTY_EXAM_SECTIONS: Record<string, RoutableSection[]> = {
  // NCCN/ASCO-style oncology survey: what a routine surgical exam has no place to record —
  // node-station-by-node-station findings, mucositis and skin toxicity, and the line the
  // chemotherapy actually goes through. Performance status sits with these because, like them,
  // it is judged by looking at the patient rather than taken as history.
  medical_oncology: ["performance", "onco_nodes", "onco_mucosa_line"],
};

/** Every section this unit's clerking can file into — the base set plus its specialty's. */
export function sectionsForSpecialty(specialty: string | null | undefined): RoutableSection[] {
  const key = (specialty ?? "").trim();
  const extra = [
    ...(SPECIALTY_HISTORY_SECTIONS[key] ?? []),
    ...(SPECIALTY_EXAM_SECTIONS[key] ?? []),
  ];
  const specialtyOwned = new Set<RoutableSection>([
    ...Object.values(SPECIALTY_HISTORY_SECTIONS).flat(),
    ...Object.values(SPECIALTY_EXAM_SECTIONS).flat(),
  ]);
  // Base = everything not owned by SOME specialty, so adding a pack never widens another
  // unit's routing by accident.
  return [...ROUTABLE_SECTIONS.filter((s) => !specialtyOwned.has(s)), ...extra];
}

/** The three free-text examination cards — one value each, so these are appended in place. */
export const EXAM_SECTION_LABEL: Record<string, string> = {
  abdomen: "per abdomen",
  chest: "chest",
  local: "local examination",
};

/** Sorted but not written — the resident places these (structured toggles, or the
 *  AI-proposal-and-approve flow). The overlay shows them for review. */
export const HELD_SECTIONS = new Set<RoutableSection>(["examination", "diagnosis", "plan"]);
