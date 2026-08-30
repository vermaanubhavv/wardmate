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

  // The ward's own shorthand, the way it is written on an Indian case sheet. The engine spells
  // these out letter by letter or hears an ordinary English word for them; the right answer is
  // fixed in every case, so the same spelling-only rule applies.
  [/\bg\.?\s?r\.?\s?b\.?\s?s\.?(?=\s|$)/gi, "GRBS"],
  [/\b(?:grabs|grbs|g\.? r\.? b\.? s)\b/gi, "GRBS"],
  [/\br\.?\s?b\.?\s?s\.?(?=\s|$)/gi, "RBS"],
  [/\bd\.?\s?l\.?\s?c\.?(?=\s|$)/gi, "DLC"],
  [/\bk\.?\s?f\.?\s?t\.?(?=\s|$)/gi, "KFT"],
  [/\bp\.?\s?t\.?\s?i\.?\s?n\.?\s?r\.?(?=\s|$)/gi, "PT/INR"],
  [/\bh\.?\s?p\.?\s?e\.?(?=\s|$)/gi, "HPE"],
  [/\bo\.?\s?p\.?\s?d\.?(?=\s|$)/gi, "OPD"],
  [/\bi\.?\s?p\.?\s?d\.?(?=\s|$)/gi, "IPD"],
  [/\bu\.?\s?h\.?\s?i\.?\s?d\.?(?=\s|$)/gi, "UHID"],
  [/\bm\.?\s?r\.?\s?d\.?(?=\s|$)/gi, "MRD"],
  [/\bs\.?\s?s\.?\s?g\.?(?=\s|$)/gi, "SSG"],

  // Examination shorthand dictated as running speech.
  [/\bp\s*[\/\\.]?\s*a\s+soft\b/gi, "P/A soft"],
  [/\bn\.?\s?v\.?\s?b\.?\s?s\.?(?=\s|$)/gi, "NVBS"],
  [/\b(?:s\s*one\s*s\s*two|s1\s*s2)\b/gi, "S1 S2"],
  [/\bk\s*\/?\s*c\s*\/?\s*o\b/gi, "K/C/O"],
  [/\bkoch'?s?\b/gi, "Koch's"],
  [/\b(?:cokes|coax|kochs)\s+disease\b/gi, "Koch's disease"],

  // Discharge and ward-movement words an Indian ward uses daily.
  [/\bl\.?\s?a\.?\s?m\.?\s?a\.?(?=\s|$)/gi, "LAMA"],
  [/\bd\.?\s?a\.?\s?m\.?\s?a\.?(?=\s|$)/gi, "DAMA"],
  [/\b(?:attendar|attendent|attendant)s?\b/gi, "attender"],

  // Fluids, as written on an Indian chart.
  [/\bd\.?\s?n\.?\s?s\.?(?=\s|$)/gi, "DNS"],
  [/\br\.?\s?l\.?(?=\s|$)/gi, "RL"],
  [/\bringer'?s?\s+lactate\b/gi, "Ringer lactate"],
  [/\b(?:p\.?\s?c\.?\s?v\.?)(?=\s|$)/gi, "PCV"],

  // Brand names the ward prescribes by, and the ordinary words the engine hears instead.
  [/\bmono\s?(?:cef|surf|self)\b/gi, "Monocef"],
  [/\b(?:metro\s?gyl|metrogill|metrogil)\b/gi, "Metrogyl"],
  [/\b(?:em\s?set|emsat|emcet|emeset)\b/gi, "Emeset"],
  [/\b(?:pan\s*forty|pan\s*40)\b/gi, "Pan 40"],
  [/\b(?:peri\s?norm|perinom)\b/gi, "Perinorm"],
  [/\b(?:trama\s?zac|tramazak)\b/gi, "Tramazac"],
  [/\b(?:chymoral|kymoral|chimoral)\s*forte\b/gi, "Chymoral Forte"],
  [/\b(?:voveran|woveran|hoveran)\b/gi, "Voveran"],
  [/\b(?:digene|dijeen|dygene)\b/gi, "Digene"],
  [/\b(?:clexane|klexane)\b/gi, "Clexane"],
  [/\b(?:taxim|texim)\b/gi, "Taxim"],
  [/\b(?:lasix|lasics)\b/gi, "Lasix"],
  [/\bp\.?\s?c\.?\s?m\.?(?=\s|$)/gi, "PCM"],

  // ---------------------------------------------------------------------------------------
  // SPOKEN PHRASE -> WARD SHORTHAND.
  //
  // A second class of rule, added deliberately and knowingly: unlike everything above, these
  // do not fix a mishearing. The engine heard "complaints of" correctly; an Indian case sheet
  // simply writes C/O. So this rewrites a doctor's own words, which the rest of this file
  // refuses to do — the difference is that each pair below is the SAME term in two notations,
  // never a change of meaning, and the ward reads the short form.
  //
  // The bar for adding one: the long form and the short form must be interchangeable on a case
  // sheet with nothing lost, and the long form must have exactly one short form. Anything that
  // could mean two things stays out — see the NOT HERE list at the end of this block.
  //
  // Safe for extraction: corrections run on the transcript BEFORE lib/extract.ts, so the
  // verbatim source_quote check sees the shortened text and still matches. The resident's raw
  // words remain in entries.original_transcript behind the (i).

  // Declarations. Longer phrases first, so "known case of" is not eaten by "case of".
  [/\bknown\s+case\s+of\b/gi, "K/C/O"],
  [/\bknown\s+to\s+have\b/gi, "K/C/O"],
  [/\b(?:complaints?|complains|complaining)\s+of\b/gi, "C/O"],
  [/\bpast\s+history\s+of\b/gi, "past H/O"],
  [/\bno\s+history\s+of\b/gi, "no H/O"],
  [/\bhistory\s+of\b/gi, "H/O"],
  [/\bon\s+examination\b/gi, "O/E"],
  [/\bnothing\s+abnormal\s+detected\b/gi, "NAD"],
  [/\bwithin\s+normal\s+limits\b/gi, "WNL"],

  // Examination, by system.
  [/\bper\s+abdomen\b/gi, "P/A"],
  [/\bper\s+rectum\b/gi, "P/R"],
  [/\bper\s+vaginum\b/gi, "P/V"],
  [/\bcentral\s+nervous\s+system\b/gi, "CNS"],
  [/\bcardiovascular\s+system\b/gi, "CVS"],
  [/\brespiratory\s+system\b/gi, "RS"],
  [/\bnormal\s+vesicular\s+breath\s+sounds\b/gi, "NVBS"],
  [/\bbilateral\s+air\s+entry\b/gi, "B/L air entry"],
  [/\bblood\s+pressure\b/gi, "BP"],
  [/\brespiratory\s+rate\b/gi, "RR"],
  [/\boxygen\s+saturation\b/gi, "SpO2"],

  // Investigations, as they are ordered aloud and written on the chart.
  [/\bultrasonograph(?:y|ic)\b/gi, "USG"],
  [/\bultrasound\b/gi, "USG"],
  [/\bchest\s+x[\s-]?ray\b/gi, "CXR"],
  [/\bcomplete\s+blood\s+count\b/gi, "CBC"],
  [/\btotal\s+leucocyte\s+count\b/gi, "TLC"],
  [/\bdifferential\s+(?:leucocyte\s+)?count\b/gi, "DLC"],
  [/\bliver\s+function\s+tests?\b/gi, "LFT"],
  [/\brenal\s+function\s+tests?\b/gi, "RFT"],
  [/\bkidney\s+function\s+tests?\b/gi, "KFT"],
  [/\brandom\s+blood\s+sugar\b/gi, "RBS"],
  [/\bfasting\s+blood\s+sugar\b/gi, "FBS"],
  [/\bhistopathology\s+(?:report|examination)\b/gi, "HPE"],

  // Fluids and the words around a course.
  // Dextrose-normal-saline first: otherwise the plain "normal saline" rule fires inside it and
  // leaves "dextrose NS", which is the wrong fluid on a chart.
  [/\bdextrose\s+normal\s+saline\b/gi, "DNS"],
  [/\bnormal\s+saline\b/gi, "NS"],
  [/\bpacked\s+cell\s+volume\b/gi, "PCV"],
  [/\bnil\s+by\s+mouth\b/gi, "NBM"],
  [/\bpre[\s-]?an(?:a)?esthetic\s+(?:checkup|check[\s-]?up|clearance|fitness)\b/gi, "PAC"],
  [/\boperation\s+theatre\b/gi, "OT"],
  [/\bpost[\s-]?operative\s+day\b/gi, "POD"],
  [/\bintercostal\s+drain(?:age\s+tube)?\b/gi, "ICD"],
  [/\bleft\s+against\s+medical\s+advice\b/gi, "LAMA"],
  [/\bdischarged?\s+against\s+medical\s+advice\b/gi, "DAMA"],

  // Frequencies, in the notation the drug chart uses.
  [/\b(?:once\s+(?:a\s+)?daily|once\s+a\s+day)\b/gi, "OD"],
  [/\btwice\s+(?:a\s+)?(?:daily|day)\b/gi, "BD"],
  [/\b(?:thrice|three\s+times)\s+(?:a\s+)?(?:daily|day)\b/gi, "TDS"],
  [/\bfour\s+times\s+(?:a\s+)?(?:daily|day)\b/gi, "QID"],
  [/\b(?:as\s+(?:and\s+when\s+)?(?:needed|required)|if\s+(?:needed|required))\b/gi, "SOS"],

  // NOT HERE, DELIBERATELY, and for the same reason as the "a febrile" note above — each of
  // these long forms has more than one short form, so shortening it would be a guess:
  //   "heart rate"        -> PR is also per rectum on this ward's own charts.
  //   "blood transfusion" -> BT is also bleeding time.
  //   "care of"           -> C/O is complaints of; the two are not the same statement.
  //   "at bedtime"        -> HS on a chart, but "at night" in a narrative sentence.
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
