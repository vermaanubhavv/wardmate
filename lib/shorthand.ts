import { CORE_PAIRS, DEPARTMENT_PAIRS } from "@/lib/shorthand-table";

/**
 * Spoken words → ward shorthand, by rule, no model call. "upper abdomen is tender in the right
 * upper abdomen" → "RUQ tenderness"; "we need to send a complete blood count tomorrow morning"
 * → "Send CBC tomorrow AM". For display only: the stored value and its source quote never
 * change, so a rule that reads wrong costs a re-word, never the record.
 *
 * THE LINE IT DOES NOT CROSS. Every rule is a fixed phrase → its standard abbreviation, or a
 * dropped filler / false start. No rule adds a number, a side, a site or a negation, and none
 * turns a finding into a different one (lib/__tests__/shorthand.test.ts checks every rule in
 * every department for exactly that). A phrase the table does not know is shown as said.
 *
 * TWO SOURCES OF RULES, ONE TABLE PER DEPARTMENT.
 *   - HAND_RULES below: patterns a fixed phrase cannot say (the abdominal regions, any of the
 *     ways a ward says "bowel sounds present", drug timings). Every department gets them.
 *   - lib/shorthand-table.ts: phrase → abbreviation pairs generated from the dictation lexicon
 *     (lib/transcription/lexicon), core plus the unit's own department. To add one, add the
 *     pair to the lexicon (department pairs: lexicon/ward-shorthand.ts) and regenerate with
 *     `npx vitest run shorthand-table -u` — speech keyterms and display stay one source.
 *
 * Where the shorthand is shown and where it deliberately is not: docs/ward-shorthand.md.
 */

export type ShorthandRule = { re: RegExp; to: string; example: string };

const hand = (re: RegExp, to: string, example: string): ShorthandRule => ({ re, to, example });

export const HAND_RULES: ShorthandRule[] = [
  // Abdominal regions — the side and level must both be said.
  hand(/\b(?:in |over |at )?(?:the )?right upper (?:quadrant|abdomen|part of (?:the )?abdomen|side of (?:the )?abdomen)|\bright hypochondri(?:um|ac region)\b/gi, "RUQ", "right upper quadrant"),
  hand(/\b(?:in |over |at )?(?:the )?left upper (?:quadrant|abdomen|part of (?:the )?abdomen|side of (?:the )?abdomen)|\bleft hypochondri(?:um|ac region)\b/gi, "LUQ", "left upper quadrant"),
  hand(/\b(?:in |over |at )?(?:the )?right (?:lower (?:quadrant|abdomen)|iliac fossa)\b/gi, "RIF", "right iliac fossa"),
  hand(/\b(?:in |over |at )?(?:the )?left (?:lower (?:quadrant|abdomen)|iliac fossa)\b/gi, "LIF", "left iliac fossa"),
  hand(/\b(?:in |over |at )?(?:the )?epigastri(?:um|c region)\b/gi, "epigastric", "epigastric region"),
  // Examination.
  hand(/\bper abdomen\b|\bper abdominal examination\b|\babdominal examination\b/gi, "P/A", "per abdominal examination"),
  hand(/\bper rectal examination\b|\bper rectum\b/gi, "P/R", "per rectal examination"),
  hand(/\bnon[- ]?tender\b/gi, "NT", "non tender"),
  hand(/\bnon[- ]?distended\b/gi, "ND", "non distended"),
  hand(/\bbowel sounds (?:are )?(?:present|heard|audible)\b/gi, "BS +", "bowel sounds present"),
  hand(/\bnormal vesicular breath sounds\b/gi, "NVBS", "normal vesicular breath sounds"),
  hand(/\bair entry (?:is )?(?:bilaterally )?equal(?: on both sides| bilaterally)?\b/gi, "B/L AE =", "air entry equal bilaterally"),
  hand(/\bs1 ?s2 (?:heard|present|normal)\b/gi, "S1S2 +", "S1 S2 heard"),
  hand(/\bwithin normal limits\b/gi, "WNL", "within normal limits"),
  hand(/\bno abnormality detected\b/gi, "NAD", "no abnormality detected"),
  // Vitals, tubes, diet.
  hand(/\bblood pressure\b/gi, "BP", "blood pressure"),
  hand(/\bpulse rate\b/gi, "PR", "pulse rate"),
  hand(/\brespiratory rate\b/gi, "RR", "respiratory rate"),
  hand(/\b(?:nil|nothing) by mouth\b/gi, "NBM", "nil by mouth"),
  hand(/\bryle'?s tube\b|\bnaso ?gastric tube\b/gi, "RT", "Ryle's tube"),
  hand(/\bfoley'?s catheter\b|\burinary catheter\b/gi, "catheter", "Foley's catheter"),
  hand(/\bintake (?:and|&) output\b/gi, "I/O", "intake and output"),
  // Investigations.
  hand(/\bcomplete blood (?:count|picture)\b/gi, "CBC", "complete blood count"),
  hand(/\bliver function tests?\b/gi, "LFT", "liver function test"),
  hand(/\brenal function tests?\b/gi, "RFT", "renal function test"),
  hand(/\bserum electrolytes\b/gi, "electrolytes", "serum electrolytes"),
  hand(/\bultra ?sound(?:ography)?(?: of the| of)? abdomen\b|\bultrasonography\b/gi, "USG", "ultrasound of the abdomen"),
  hand(/\bultra ?sound\b/gi, "USG", "ultrasound"),
  hand(/\bct scan\b/gi, "CT", "CT scan"),
  hand(/\bchest x[- ]?ray\b/gi, "CXR", "chest x-ray"),
  hand(/\brandom blood sugar\b/gi, "RBS", "random blood sugar"),
  // History and drug timing.
  hand(/\bknown case of\b/gi, "K/C/O", "known case of"),
  hand(/\bhistory of\b/gi, "H/O", "history of"),
  hand(/\bpost[- ]?operative day\b/gi, "POD", "post operative day"),
  hand(/\bintravenous(?:ly)?\b/gi, "IV", "intravenous"),
  hand(/\b(?:once a day|once daily)\b/gi, "OD", "once a day"),
  hand(/\b(?:twice a day|twice daily)\b/gi, "BD", "twice a day"),
  hand(/\b(?:thrice daily|three times a day)\b/gi, "TDS", "three times a day"),
  hand(/\bfour times a day\b/gi, "QID", "four times a day"),
  hand(/\b(?:as and when required|as needed|if required)\b/gi, "SOS", "as and when required"),
  hand(/\btomorrow morning\b/gi, "tomorrow AM", "tomorrow morning"),
  hand(/\btomorrow evening\b/gi, "tomorrow PM", "tomorrow evening"),
];

const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** A lexicon pair as a rule: the words in order, a space or a hyphen between, the apostrophe
 *  optional ("ryle's" / "ryles"). */
export function pairRule([phrase, abbr]: readonly [string, string]): ShorthandRule {
  const body = phrase.split(" ").map((w) => esc(w).replace(/'/g, "'?")).join("[\\s-]+");
  return { re: new RegExp(`\\b${body}\\b`, "gi"), to: abbr, example: phrase };
}

const wordCount = (s: string) => s.split(/\s+/).length;
const tables = new Map<string, ShorthandRule[]>();

/**
 * Every rule a unit's display runs, longest phrase first so "history of presenting illness"
 * becomes HPI before "history of" can become H/O. `specialty` is the ward's pack key
 * (lib/specialty); none, or one the table does not know, gets the core rules only.
 */
export function shorthandRules(specialty?: string | null): ShorthandRule[] {
  const key = specialty ?? "";
  let rules = tables.get(key);
  if (!rules) {
    const dept = (DEPARTMENT_PAIRS as Record<string, readonly (readonly [string, string])[]>)[key] ?? [];
    rules = [...HAND_RULES, ...[...CORE_PAIRS, ...dept].map(pairRule)]
      .map((r, i) => ({ r, i }))
      .sort((a, b) => wordCount(b.r.example) - wordCount(a.r.example) || a.i - b.i)
      .map(({ r }) => r);
    tables.set(key, rules);
  }
  return rules;
}

/** "upper abdomen is tender in RUQ" / "tenderness present in RUQ" → "RUQ tenderness". */
const TENDER_AT = /\b(?:(?:the )?(?:abdomen|upper abdomen|lower abdomen|tummy|stomach) (?:is )?)?(?:tender|tenderness)(?: (?:is )?present)? (?:in |over |at )?(RUQ|LUQ|RIF|LIF|epigastric)\b/gi;

// Words a job opens with that say nothing: "we need to", "please", "kindly", "plan to".
const JOB_FILLER = /^(?:(?:okay|ok|so|and|also|then|please|kindly|we|i|you|let'?s|let us|need to|needs to|have to|has to|should|must|will|to|plan(?: is)? to|the plan is to|go ahead and|get the|get a|do a)\s+)+/i;

// What a speaker abandons in a false start: a level or a filler, never a finding or a site.
// "right upper right liver lobe" restarts; "no pain no vomiting" and "right knee right ankle"
// are two things each and stay whole.
const ABANDONED = /^(upper|lower|middle|mid|inner|outer|side|part|of|the|uh|um|er|sorry)$/;

/** Drop a spoken false start: "right upper right liver lobe" → "right liver lobe". Only a
 *  restart on the same word within three, over words a speaker abandons. */
function dropRestarts(text: string): string {
  const w = text.split(/\s+/);
  for (let i = 0; i < w.length; i++) {
    for (let j = i + 1; j <= i + 3 && j < w.length; j++) {
      const between = w.slice(i + 1, j).map((x) => x.toLowerCase());
      if (/^[a-z]+$/i.test(w[i]) && w[j].toLowerCase() === w[i].toLowerCase() && between.every((x) => ABANDONED.test(x))) {
        w.splice(i, j - i);
        i = -1;
        break;
      }
    }
  }
  return w.join(" ");
}

function shorten(text: string, specialty?: string | null): string {
  let t = dropRestarts(text.trim().replace(/\s+/g, " "));
  for (const { re, to } of shorthandRules(specialty)) t = t.replace(re, to);
  t = t.replace(TENDER_AT, "$1 tenderness");
  return t.replace(/\s+([,.;])/g, "$1").replace(/\s+/g, " ").trim();
}

/** An exam finding, a diagnosis or a note, in the unit's ward shorthand. */
export function shortFinding(text: string, specialty?: string | null): string {
  return shorten(text, specialty);
}

/** A job, as a to-do list reads it: the verb first, no "we need to", capital letter. */
export function shortJob(text: string, specialty?: string | null): string {
  const t = shorten(text, specialty).replace(JOB_FILLER, "").replace(/[.\s]+$/, "");
  return t ? t[0].toUpperCase() + t.slice(1) : t;
}

const NEGATION = /\b(no|not|nil|absent|without|non|denies|negative)\b|-ve/i;

/**
 * A resident's edit, read as a shorthand they would rather see: "pain in the right iliac fossa"
 * edited to "pain RIF" gives { long: "in the right iliac fossa", short: "RIF" }. Null for
 * anything that is a correction rather than a shortening — a changed number, a changed
 * negation, a short side that is not an abbreviation, or a pair the table already knows.
 * Only a suggestion: nothing is applied until an admin approves it and it is added to the
 * lexicon, where the tests above run on it (supabase/patches/0109_shorthand_suggestions.sql).
 */
export function shorthandPair(before: string, after: string, specialty?: string | null): { long: string; short: string } | null {
  const a = before.trim().split(/\s+/);
  const b = after.trim().split(/\s+/);
  let s = 0;
  while (s < a.length && s < b.length && a[s].toLowerCase() === b[s].toLowerCase()) s++;
  let e = 0;
  while (e < a.length - s && e < b.length - s && a[a.length - 1 - e].toLowerCase() === b[b.length - 1 - e].toLowerCase()) e++;
  const long = a.slice(s, a.length - e).join(" ").replace(/[,.;:]+$/, "");
  const short = b.slice(s, b.length - e).join(" ").replace(/[,.;:]+$/, "");
  if (!long || !short || long.split(" ").length < 2 || short.length >= long.length || short.length > 12) return null;
  if (/\d/.test(long) || /\d/.test(short) || NEGATION.test(long) !== NEGATION.test(short)) return null;
  if (!/[A-Z]/.test(short) || /\s/.test(short)) return null;
  if (shortFinding(long, specialty) === short) return null;
  return { long, short };
}
