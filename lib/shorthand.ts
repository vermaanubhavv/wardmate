/**
 * Spoken words → ward shorthand, by rule, no model call. "upper abdomen is tender in the right
 * upper abdomen" → "RUQ tenderness"; "we need to send a complete blood count tomorrow morning"
 * → "Send CBC tomorrow AM". For display only: the stored value and its source quote never
 * change, so a rule that reads wrong costs a re-word, never the record.
 *
 * THE LINE IT DOES NOT CROSS. Every rule is a fixed phrase → its standard abbreviation, or a
 * dropped filler / false start. No rule adds a number, a side, a site or a negation, and none
 * turns a finding into a different one. A phrase the table does not know is shown as said.
 *
 * To add one: a lowercase phrase on the left (as people say it, any dialect's version), the
 * chart's form on the right. Longer phrases first where one contains another.
 */

const PHRASES: [RegExp, string][] = [
  // Abdominal regions — the side and level must both be said.
  [/\b(?:in |over |at )?(?:the )?right upper (?:quadrant|abdomen|part of (?:the )?abdomen|side of (?:the )?abdomen)|\bright hypochondri(?:um|ac region)\b/gi, "RUQ"],
  [/\b(?:in |over |at )?(?:the )?left upper (?:quadrant|abdomen|part of (?:the )?abdomen|side of (?:the )?abdomen)|\bleft hypochondri(?:um|ac region)\b/gi, "LUQ"],
  [/\b(?:in |over |at )?(?:the )?right (?:lower (?:quadrant|abdomen)|iliac fossa)\b/gi, "RIF"],
  [/\b(?:in |over |at )?(?:the )?left (?:lower (?:quadrant|abdomen)|iliac fossa)\b/gi, "LIF"],
  [/\b(?:in |over |at )?(?:the )?epigastri(?:um|c region)\b/gi, "epigastric"],
  // Examination.
  [/\bper abdomen\b|\bper abdominal examination\b|\babdominal examination\b/gi, "P/A"],
  [/\bper rectal examination\b|\bper rectum\b/gi, "P/R"],
  [/\bnon[- ]?tender\b/gi, "NT"],
  [/\bnon[- ]?distended\b/gi, "ND"],
  [/\bbowel sounds (?:are )?(?:present|heard|audible)\b/gi, "BS +"],
  [/\bnormal vesicular breath sounds\b/gi, "NVBS"],
  [/\bair entry (?:is )?(?:bilaterally )?equal(?: on both sides| bilaterally)?\b/gi, "B/L AE ="],
  [/\bs1 ?s2 (?:heard|present|normal)\b/gi, "S1S2 +"],
  [/\bwithin normal limits\b/gi, "WNL"],
  [/\bno abnormality detected\b/gi, "NAD"],
  // Vitals, tubes, diet.
  [/\bblood pressure\b/gi, "BP"],
  [/\bpulse rate\b/gi, "PR"],
  [/\brespiratory rate\b/gi, "RR"],
  [/\b(?:nil|nothing) by mouth\b/gi, "NBM"],
  [/\bryle'?s tube\b|\bnaso ?gastric tube\b/gi, "RT"],
  [/\bfoley'?s catheter\b|\burinary catheter\b/gi, "catheter"],
  [/\bintake (?:and|&) output\b/gi, "I/O"],
  // Investigations.
  [/\bcomplete blood (?:count|picture)\b/gi, "CBC"],
  [/\bliver function tests?\b/gi, "LFT"],
  [/\b(?:renal|kidney) function tests?\b/gi, "RFT"],
  [/\bserum electrolytes\b/gi, "electrolytes"],
  [/\bultra ?sound(?:ography)?(?: of the| of)? abdomen\b|\bultrasonography\b/gi, "USG"],
  [/\bultra ?sound\b/gi, "USG"],
  [/\bct scan\b/gi, "CT"],
  [/\bchest x[- ]?ray\b/gi, "CXR"],
  [/\brandom blood sugar\b/gi, "RBS"],
  // History and drug timing.
  [/\bknown case of\b/gi, "K/C/O"],
  [/\bhistory of\b/gi, "H/O"],
  [/\bpost[- ]?operative day\b/gi, "POD"],
  [/\bintravenous(?:ly)?\b/gi, "IV"],
  [/\b(?:once a day|once daily)\b/gi, "OD"],
  [/\b(?:twice a day|twice daily)\b/gi, "BD"],
  [/\b(?:thrice daily|three times a day)\b/gi, "TDS"],
  [/\bfour times a day\b/gi, "QID"],
  [/\b(?:as and when required|as needed|if required)\b/gi, "SOS"],
  [/\btomorrow morning\b/gi, "tomorrow AM"],
  [/\btomorrow evening\b/gi, "tomorrow PM"],
];

/** "upper abdomen is tender in RUQ" / "tenderness present in RUQ" → "RUQ tenderness". */
const TENDER_AT = /\b(?:(?:the )?(?:abdomen|upper abdomen|lower abdomen|tummy|stomach) (?:is )?)?(?:tender|tenderness)(?: (?:is )?present)? (?:in |over |at )?(RUQ|LUQ|RIF|LIF|epigastric)\b/gi;

// Words a job opens with that say nothing: "we need to", "please", "kindly", "plan to".
const JOB_FILLER = /^(?:(?:okay|ok|so|and|also|then|please|kindly|we|i|you|let'?s|let us|need to|needs to|have to|has to|should|must|will|to|plan(?: is)? to|the plan is to|go ahead and|get the|get a|do a)\s+)+/i;

/** Drop a spoken false start: "right upper right liver lobe" → "right liver lobe". Only a
 *  restart on the same word within three, and never across "and"/"or"/"with" — "right and
 *  left" is two things, not a correction. */
function dropRestarts(text: string): string {
  const w = text.split(/\s+/);
  for (let i = 0; i < w.length; i++) {
    for (let j = i + 1; j <= i + 3 && j < w.length; j++) {
      const between = w.slice(i, j).map((x) => x.toLowerCase());
      if (/^[a-z]+$/i.test(w[i]) && w[j].toLowerCase() === w[i].toLowerCase() && !between.some((x) => /^(and|or|with|,|to|vs)$/.test(x) || /[,;]$/.test(x))) {
        w.splice(i, j - i);
        i = -1;
        break;
      }
    }
  }
  return w.join(" ");
}

function shorten(text: string): string {
  let t = dropRestarts(text.trim().replace(/\s+/gi, " "));
  for (const [re, to] of PHRASES) t = t.replace(re, to);
  t = t.replace(TENDER_AT, "$1 tenderness");
  return t.replace(/\s+([,.;])/gi, "$1").replace(/\s+/gi, " ").trim();
}

/** An exam finding, a diagnosis or a note, in ward shorthand. */
export function shortFinding(text: string): string {
  return shorten(text);
}

/** A job, as a to-do list reads it: the verb first, no "we need to", capital letter. */
export function shortJob(text: string): string {
  const t = shorten(text).replace(JOB_FILLER, "").replace(/[.\s]+$/, "");
  return t ? t[0].toUpperCase() + t.slice(1) : t;
}
