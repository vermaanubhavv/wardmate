/**
 * Measures what a change to the keyterm matcher would gain and lose, across the whole lexicon.
 *
 *   node node_modules/.bin/vite-node --config vitest.config.ts scripts/audit-keyterm-matching.ts [--all] [--only substring]
 *
 * No API key and no network: every rule here is string matching, so this is cheap to run as
 * often as you like.
 *
 * WHY THIS EXISTS. `tokenIn` in lib/transcription/selectMedicalKeyterms.ts decides which of a
 * lexicon entry's family tokens count as present in a patient's charted context, and so which
 * terms are sent to Deepgram. The unit tests pin a couple of dozen cases. The lexicon holds
 * thousands of authored tokens against thousands of names, and a matcher change moves matches
 * nobody wrote a test for.
 *
 * It was written when `tokenIn` matched substrings, so a short token landed inside an unrelated
 * word: "dic" inside "appendicitis" put disseminated intravascular coagulation on an
 * appendicectomy, "abg" inside "cabg" put COPD vocabulary on a bypass. Tightening it to whole
 * words fixed that — and silently dropped a hundred-odd real matches that no test covered,
 * because a hyphen or an apostrophe was hiding a word ("burn" in "post-burn contracture",
 * "ryle" in "ryle's tube"). This script is what found them. Run it before and after any further
 * change to the rule. Expect the counts to move as the lexicon grows; what matters is that
 * LOST is empty, not that it matches a number written down here.
 *
 * HOW TO READ THE OUTPUT. Baseline is the matcher that ships, imported rather than copied.
 * For each candidate:
 *
 *   LOST   — the shipped rule matches, the candidate does not, AND the shipped match was a
 *            true whole-word one. These are the dangerous ones: real vocabulary leaving a
 *            patient's keyterm list. Read every one before shipping the candidate.
 *   GAINED — the candidate matches where the shipped rule does not. Usually harmless or an
 *            improvement, but scan for a short token reaching inside a word again.
 *
 * A LOST line whose shipped match was mid-word is not reported: losing those is the point of
 * tightening, and reporting them would bury the real losses in thousands of lines.
 *
 * WHAT IT DOES NOT COVER. The corpus is the lexicon matched against itself: every authored
 * token against every term and alias. That is the part we have written down, and it is a good
 * proxy, but it is not what a resident charts. A phrase that exists only in a chart is invisible
 * here — the plural case is exactly that, which is why `no-plurals` reports no loss even though
 * removing the plural rule takes the grafting vocabulary off a patient charted "flame burns".
 * A clean run means no candidate breaks a match the lexicon itself implies. It does not replace
 * the cases in lib/transcription/__tests__/selectMedicalKeyterms.test.ts, which are written as
 * real charted contexts; run both.
 *
 * TO TEST A CANDIDATE. Add it to CANDIDATES below. A candidate is three things, because all
 * three are part of the rule: how a charted string is prepared (`ctx`), how a lexicon token is
 * prepared (`token`), and how the two are compared (`match`). Preparation is not a detail —
 * fold a hyphen in it and a whole-word `match` suddenly sees a word that was hidden, and lower
 * a token's case and the acronym "ALL" becomes the word "all". Borrow the shipped `norm` and
 * `needle` for any side you are not changing. The candidates below are the states this rule has
 * really been in, so a bare run reproduces its history.
 */
import { MASTER_LEXICON } from "../lib/transcription/lexicon/index.ts";
import { needle, norm, tokenIn } from "../lib/transcription/selectMedicalKeyterms.ts";

/**
 * The rule that ships, imported rather than copied, so this cannot measure a stale rule.
 * A charted string keeps its case; a token goes through `needle`, which keeps the capitals of a
 * short acronym so "ALL" does not match the word "all".
 */
const LIVE = {
  ctx: (s: string) => norm(s, true),
  token: needle,
  match: (c: string, t: string) => tokenIn([t], [c]),
};

/** The normalisation as it stood before the hyphen, slash and apostrophe folding. */
const normWithoutPunctuationFolding = (s: string) =>
  s
    .toLowerCase()
    .replace(/[‘’]/g, "'")
    .replace(/[.,;:()\[\]]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

type Candidate = {
  ctx: (s: string) => string;
  token: (s: string) => string;
  match: (ctxString: string, token: string) => boolean;
};

/** Candidate rules, keyed by the name you pass to --only. */
const CANDIDATES: Record<string, Candidate> = {
  /**
   * The oldest rule: a plain substring on the old normalisation, everything lower-cased. LOST
   * is the punctuation and acronym matches it could not make; GAINED is every mid-word match
   * it did — "dic" reaching into "appendicitis" and its three thousand siblings.
   */
  substring: {
    ctx: normWithoutPunctuationFolding,
    token: normWithoutPunctuationFolding,
    match: (c, t) => c.includes(t),
  },

  /**
   * Whole words on the old normalisation: correct about mid-word matching and wrong about
   * punctuation. Its LOST list is the real matches a hyphen or an apostrophe was hiding, which
   * is what this script was written to find.
   */
  "strict-words-old-norm": {
    ctx: normWithoutPunctuationFolding,
    token: normWithoutPunctuationFolding,
    match: (c, t) => c === t || ` ${c} `.includes(` ${t} `),
  },

  /** The shipped rule with no plural handling. See the limitation above before trusting a 0. */
  "no-plurals": {
    ctx: (s) => norm(s, true),
    token: needle,
    match: (c, t) => {
      const h = t === t.toLowerCase() ? c.toLowerCase() : c;
      return h === t || ` ${h} `.includes(` ${t} `);
    },
  },

  /**
   * The shipped rule with every token lower-cased, dropping the acronym rule. Its GAINED list
   * is the trap that rule exists for: "ALL" as the word "all" pulling leukaemia onto an
   * obstetric history of "All NVD", and the same for "TOD" and "BE".
   */
  "no-acronym-case": {
    ctx: (s) => norm(s, true),
    token: (s) => norm(s),
    match: (c, t) => tokenIn([t], [c]),
  },
};

// --- the corpus -----------------------------------------------------------------------

/** Every token any entry authors as a family token: these are what `tokenIn` is handed. */
const tokens = new Set<string>();
/** Every name a chart could plausibly carry, which is every term and alias in the lexicon. */
const names = new Set<string>();

for (const e of MASTER_LEXICON) {
  for (const t of [
    ...(e.diagnoses ?? []),
    ...(e.procedures ?? []),
    ...(e.devices ?? []),
    ...(e.triggers ?? []),
  ])
    tokens.add(t);
  for (const n of [e.term, ...(e.aliases ?? [])]) names.add(n);
}

/**
 * Was the shipped rule's match a whole-word one? Only a whole-word match is worth reporting as
 * a loss — a token that only matched inside a word was never a real match to begin with.
 *
 * Case-insensitive on both the search and the boundary test: charted strings keep their
 * capitals now (`norm(s, true)`), so a case-sensitive test would miss the match entirely and
 * quietly report every capitalised loss as no loss at all.
 */
function matchedWholeWord(ctxString: string, token: string): boolean {
  const i = ctxString.toLowerCase().indexOf(token.toLowerCase());
  if (i < 0) return false;
  const before = i === 0 ? " " : ctxString[i - 1];
  const after = i + token.length >= ctxString.length ? " " : ctxString[i + token.length];
  return !/[a-z0-9]/i.test(before) && !/[a-z0-9]/i.test(after);
}

// --- run ------------------------------------------------------------------------------

const showAll = process.argv.includes("--all");
const onlyAt = process.argv.indexOf("--only");
const only = onlyAt >= 0 ? process.argv[onlyAt + 1] : undefined;

const chosen = Object.entries(CANDIDATES).filter(([name]) => !only || name === only);
if (only && chosen.length === 0) {
  console.error(`No candidate named "${only}". Have: ${Object.keys(CANDIDATES).join(", ")}`);
  process.exit(1);
}

console.log(
  `${tokens.size} authored tokens x ${names.size} lexicon names = ` +
    `${(tokens.size * names.size).toLocaleString()} pairs per candidate\n`
);

for (const [name, candidate] of chosen) {
  const lost: string[] = [];
  const gained: string[] = [];

  for (const rawToken of tokens) {
    // Each rule prepares both sides its own way: preparation is part of the rule, so running
    // both through one normaliser would hide every punctuation and case difference between
    // them — which is exactly how an early version of this script reported a clean run on a
    // candidate that dropped a hundred matches.
    const shippedToken = LIVE.token(rawToken);
    const candidateToken = candidate.token(rawToken);
    if (!shippedToken && !candidateToken) continue;
    for (const rawName of names) {
      const shippedCtx = LIVE.ctx(rawName);
      const candidateCtx = candidate.ctx(rawName);
      const shipped = LIVE.match(shippedCtx, shippedToken);
      const proposed = candidate.match(candidateCtx, candidateToken);
      if (shipped && !proposed && matchedWholeWord(shippedCtx, shippedToken))
        lost.push(`${rawToken}  ->  ${rawName}`);
      else if (!shipped && proposed) gained.push(`${rawToken}  ->  ${rawName}`);
    }
  }

  const show = (label: string, rows: string[]) => {
    console.log(`  ${label}: ${rows.length}`);
    for (const r of showAll ? rows : rows.slice(0, 15)) console.log(`    ${r}`);
    if (!showAll && rows.length > 15) console.log(`    … ${rows.length - 15} more (--all)`);
  };

  console.log(`=== ${name} ===`);
  show("LOST  (real whole-word matches this candidate drops)", lost);
  show("GAINED(matches the shipped rule does not make)", gained);
  console.log();
}
