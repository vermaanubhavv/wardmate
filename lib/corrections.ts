/**
 * Fixing what the speech engine misheard — and nothing else.
 *
 * A general-purpose speech model has never met a surgical ward. It writes "lab chole" for lap
 * chole and "PAS" for PAC, every time, because those are the ordinary English words nearest to
 * the sounds. The engine is given a vocabulary hint first (see lib/stt/types.ts) and this
 * catches what still gets through.
 *
 * THE LINE THIS DOES NOT CROSS. It only ever corrects the MACHINE's hearing of a term, never a
 * doctor's own words. That is why it runs on transcripts and not on anything typed: if a
 * resident writes something themselves, that is what they meant, and the app has no business
 * tidying it. It is also why the list is spelling only — a mishearing of a fixed term maps to
 * exactly one right answer, so nothing here has to make a clinical judgement.
 *
 * Numbers, doses, units and drug names are deliberately absent. "Fifteen" heard for "fifty" is
 * not a spelling error and cannot be fixed by a lookup table; guessing at one would be inventing
 * a clinical value, which is the one thing this app never does. Those stay as heard and are
 * flagged for the resident to confirm, exactly as before.
 *
 * NOTHING IS LOST. The raw transcript is kept in entries.original_transcript and shown behind
 * the (i) whenever it differs, so a resident can always read what was actually heard and see
 * what the app changed. A correction here is a suggestion on the record, not a rewriting of it.
 */

export type Correction = { from: string; to: string };

/**
 * Each rule is a word-boundary, case-insensitive match mapping a known mishearing to the term
 * the unit actually uses. Order matters only where one phrase contains another — longer
 * phrases are listed first so they win.
 *
 * To add one: put the misheard spelling on the left, exactly as the engine writes it.
 */
const RULES: { pattern: RegExp; to: string }[] = [
  // The operation this unit does most, and the phrase the engine gets wrong most.
  [/\blap(?:\s|-)?(?:chole|choley|coley|coli|collie|cole)\b/gi, "lap chole"],
  [/\blab(?:\s|-)?(?:chole|choley|coley|coli|collie|cole)\b/gi, "lap chole"],
  [/\b(?:coli|collie|coley)\s*cystectomy\b/gi, "cholecystectomy"],
  [/\blaparoscopic\s+(?:coli|collie|coley)\w*ectomy\b/gi, "laparoscopic cholecystectomy"],

  // Pre-anaesthetic checkup. "PAS" is what a general model writes for it; on a surgical ward
  // PAC is the overwhelmingly likelier word, and the raw text is kept either way.
  [/\bp\.?\s?a\.?\s?s\.?(?=\s|$)/gi, "PAC"],
  [/\bpack\s+review\b/gi, "PAC review"],
  [/\bpac\b/gi, "PAC"],

  // Appendix, and the two spellings that come back for it.
  [/\bappendic?[ei]ctomy\b/gi, "appendicectomy"],
  [/\bappendix\s*ectomy\b/gi, "appendicectomy"],

  // Nasogastric tube, named after Ryle. Only the spelled-out form: "RT" is left alone, because
  // it is radiotherapy as readily as it is a Ryle's tube and this cannot tell which was meant.
  [/\b(?:ryles|riles|rials|rules|rails)\s+tube\b/gi, "Ryle's tube"],

  // Findings the engine splits or joins wrongly.
  [/\bsero[\s-]?sanguin(?:e?ous|ous)\b/gi, "serosanguinous"],
  [/\bdrain\s+out\s+put\b/gi, "drain output"],
  [/\bbowel\s+sound(?:s)?\b/gi, "bowel sounds"],

  // NOT HERE, DELIBERATELY: "a febrile" -> "afebrile". It reads like an obvious join, and it
  // inverts the meaning — "a febrile patient" HAS a fever, "afebrile" has none. A rule that can
  // turn a fever into its absence has no place in a lookup table, whatever it tidies up.

  // Abbreviations that come back spaced out or lower-cased.
  [/\bu\.?\s?s\.?\s?g\.?(?=\s|$)/gi, "USG"],
  [/\bt\.?\s?l\.?\s?c\.?(?=\s|$)/gi, "TLC"],
  [/\bl\.?\s?f\.?\s?t\.?(?=\s|$)/gi, "LFT"],
  [/\br\.?\s?f\.?\s?t\.?(?=\s|$)/gi, "RFT"],
  [/\bc\.?\s?b\.?\s?c\.?(?=\s|$)/gi, "CBC"],
  [/\be\.?\s?c\.?\s?g\.?(?=\s|$)/gi, "ECG"],
  [/\bo\.?\s?t\.?\s+list\b/gi, "OT list"],
  [/\bn\.?\s?b\.?\s?m\.?(?=\s|$)/gi, "NBM"],
  [/\bi\.?\s?c\.?\s?d\.?(?=\s|$)/gi, "ICD"],
].map(([pattern, to]) => ({ pattern: pattern as RegExp, to: to as string }));

/**
 * Correct a transcript, and say what was changed.
 *
 * `changes` is what gets shown to the resident. A rule that fires but produces the same text —
 * "PAC" already written correctly — is not reported, because nothing was actually altered.
 */
export function applyCorrections(transcript: string): {
  text: string;
  changes: Correction[];
} {
  let text = transcript;
  const changes: Correction[] = [];

  for (const { pattern, to } of RULES) {
    text = text.replace(pattern, (heard) => {
      if (heard === to) return heard;

      // Only report each distinct mishearing once, however many times it was said.
      if (!changes.some((c) => c.from === heard && c.to === to)) changes.push({ from: heard, to });
      return to;
    });
  }

  return { text, changes };
}
