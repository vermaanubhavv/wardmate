import type { MedicalLexiconEntry } from "./types";
import { CORE } from "./core";
import { INDIA } from "./india";
import { DEVICES } from "./devices";
import { INVESTIGATIONS } from "./investigations";
import { RADIOLOGY } from "./radiology";
import { DIAGNOSES } from "./diagnoses";
import { PROCEDURES } from "./procedures";
import { SURGICAL_ANATOMY } from "./surgery";
import { MEDICATIONS } from "./medications";
import { SCORES } from "./scores";
import { ONCOLOGY } from "./oncology";
import { INTERNAL_MEDICINE } from "./internal-medicine";
import { OBSTETRICS_GYNAECOLOGY } from "./obstetrics-gynaecology";
import { PULMONARY_MEDICINE } from "./pulmonary-medicine";

export * from "./types";

/**
 * The WardMate master medical lexicon — every category merged into one list.
 *
 * This is large by design and is NEVER sent whole to Deepgram. `selectMedicalKeyterms` reads
 * it and returns the 20–50 terms that matter for one patient. Adding vocabulary means editing
 * one category file; nothing else changes. See docs/medical-dictation-keyterms.md.
 */
export const MASTER_LEXICON: readonly MedicalLexiconEntry[] = Object.freeze([
  ...CORE,
  ...INDIA,
  ...DEVICES,
  ...INVESTIGATIONS,
  ...RADIOLOGY,
  ...DIAGNOSES,
  ...PROCEDURES,
  ...SURGICAL_ANATOMY,
  ...MEDICATIONS,
  ...SCORES,
  ...ONCOLOGY,
  ...INTERNAL_MEDICINE,
  ...OBSTETRICS_GYNAECOLOGY,
  ...PULMONARY_MEDICINE,
]);

/**
 * Merge custom entries onto a base lexicon.
 *
 * A custom entry whose `term` matches a base entry (case-insensitively) REPLACES it — this is
 * how a hospital corrects or re-prioritises a shared term. Everything else is appended.
 */
export function mergeLexicon(
  base: readonly MedicalLexiconEntry[],
  custom: readonly MedicalLexiconEntry[] = []
): MedicalLexiconEntry[] {
  if (custom.length === 0) return [...base];

  const overrideByTerm = new Map(custom.map((e) => [e.term.toLowerCase().trim(), e]));
  const merged: MedicalLexiconEntry[] = base.map(
    (e) => overrideByTerm.get(e.term.toLowerCase().trim()) ?? e
  );

  const baseTerms = new Set(base.map((e) => e.term.toLowerCase().trim()));
  for (const e of custom) {
    if (!baseTerms.has(e.term.toLowerCase().trim())) merged.push(e);
  }
  return merged;
}

/** Count of distinct seed terms, for the docs and the debug view. */
export const MASTER_LEXICON_SIZE = MASTER_LEXICON.length;
