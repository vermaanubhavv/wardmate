/**
 * A presenting complaint as the case sheet writes it — "Pain abdomen × 10 days" — pulled out of
 * however it arrived: the "<name> × <duration>" the workspace saves, or a dictated sentence
 * ("pain abdomen in the right upper abdomen since the last 10 days"). The complaint's duration
 * is the one duration for that complaint: its HOPI page reads and edits the same value.
 */

const WORD_NUM: Record<string, number> = {
  a: 1, an: 1, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9,
  ten: 10, eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15, sixteen: 16,
  seventeen: 17, eighteen: 18, nineteen: 19, twenty: 20, thirty: 30, forty: 40, fifty: 50,
  sixty: 60,
};

/** "3 days", "2 weeks", "6/12", "1 yr" → an approximate day count, for ordering complaints
 *  longest-standing first. Unparseable durations sort last. */
export function durationToDays(raw: string): number {
  const s = raw.toLowerCase().trim();
  if (!s) return Number.POSITIVE_INFINITY;
  const m = s.match(/(\d+(?:\.\d+)?)\s*(hour|hr|h|day|d|week|wk|w|month|mon|mo|m|year|yr|y)/);
  if (!m) return Number.POSITIVE_INFINITY;
  const n = parseFloat(m[1]);
  const u = m[2];
  if (/^h/.test(u)) return n / 24;
  if (/^d/.test(u)) return n;
  if (/^w/.test(u)) return n * 7;
  if (/^(mo|mon|m)$/.test(u)) return n * 30;
  return n * 365;
}

const UNIT = "(hours?|hrs?|days?|weeks?|wks?|months?|years?|yrs?)";
const NUM = `(\\d+(?:\\.\\d+)?|${Object.keys(WORD_NUM).join("|")})`;
// "since the last 10 days", "for 2 weeks", "since 3 days", "x 5 days", "of 1 month duration"
const SPOKEN_DURATION = new RegExp(
  `[\\s,]+(?:(?:since|for|of)\\s+(?:about\\s+|around\\s+)?(?:the\\s+)?(?:last|past)?\\s*|[×x]\\s*)${NUM}\\s*${UNIT}(?:\\s+duration)?\\s*[.,;]*\\s*$`,
  "i"
);

const UNIT_WORD: Record<string, string> = { h: "hour", d: "day", w: "week", m: "month", y: "year" };
function tidyDuration(n: string, unit: string): string {
  const num = WORD_NUM[n.toLowerCase()] ?? parseFloat(n);
  const u = unit.toLowerCase();
  const word = u.startsWith("mo") ? "month" : UNIT_WORD[u[0]];
  return `${num} ${word}${num === 1 ? "" : "s"}`;
}

// Where in the abdomen, in the Site chips' own words (lib/specialty/clerking.ts ABDOMINAL_PAIN).
const SITES: [RegExp, string][] = [
  [/right\s+upper|right\s+hypochondri/i, "RUQ"],
  [/left\s+upper|left\s+hypochondri/i, "LUQ"],
  [/right\s+(lower|iliac)/i, "RIF"],
  [/left\s+(lower|iliac)/i, "LIF"],
  [/epigastri|upper\s+(central\s+)?abdomen/i, "Epigastric"],
  [/umbilic/i, "Periumbilical"],
  [/suprapubic|hypogastri|lower\s+abdomen/i, "Suprapubic"],
  [/\b(loin|flank)/i, "Loin"],
  [/whole\s+abdomen|all\s+over|generali[sz]ed|diffuse/i, "Generalised"],
];

export function siteOf(text: string): string | null {
  return SITES.find(([re]) => re.test(text))?.[1] ?? null;
}

/** Split a stored or dictated complaint into its bare name, its duration and (for pain) its
 *  site. Nothing found → the text back untouched, duration and site empty. */
export function splitComplaint(stored: string): { name: string; duration: string; site: string | null } {
  let name = stored.trim().replace(/[.;]+$/, "");
  let duration = "";
  const m = name.match(SPOKEN_DURATION);
  if (m && m.index !== undefined && m.index > 0) {
    duration = tidyDuration(m[1], m[2]);
    name = name.slice(0, m.index).trim();
  } else {
    // A free-typed duration on the "× …" form ("× 1 mon") is kept as typed.
    const x = name.match(/^(.+?)\s*×\s*([^,;×]{1,24})$/);
    if (x && x[1].trim() && durationToDays(x[2]) !== Number.POSITIVE_INFINITY) {
      name = x[1].trim();
      duration = x[2].trim();
    }
  }
  // "pain abdomen in the right upper abdomen" → "Pain abdomen", site RUQ.
  let site: string | null = null;
  if (/pain|ache|tender/i.test(name)) {
    const loc = name.match(/\s+(?:in|over|at|on|around)\s+(?:the\s+)?([^,]+)$/i);
    site = siteOf(loc ? loc[1] : name);
    if (loc && site) name = name.slice(0, loc.index).trim();
  }
  if (name) name = name[0].toUpperCase() + name.slice(1);
  return { name, duration, site };
}

/** Every number a text carries, words read as digits — "ten days, 2 weeks" → {"10", "2"}. */
export function numbersIn(text: string): Set<string> {
  const out = new Set<string>();
  for (const [w] of text.matchAll(/\d+(?:\.\d+)?|[a-z]+/gi)) {
    if (/^\d/.test(w)) out.add(String(parseFloat(w)));
    else if (w.toLowerCase() in WORD_NUM && !/^an?$/i.test(w)) out.add(String(WORD_NUM[w.toLowerCase()]));
  }
  return out;
}
