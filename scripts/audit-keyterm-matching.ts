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
 * TO TEST A CANDIDATE. Add it to CANDIDATES below. A candidate is a `match` plus the `norm` it
 * implies, because normalisation is half of the matching rule — fold a hyphen there and a
 * whole-word `match` sees a word that was hidden before. Give it the shipped `norm` unless you
 * are changing normalisation itself. The two worked examples below are the states this rule
 * has actually been in, so running with no arguments reproduces both findings in the docblock.
 */
import { MASTER_LEXICON } from "../lib/transcription/lexicon/index.ts";
import { norm, tokenIn } from "../lib/transcription/selectMedicalKeyterms.ts";

/** The rule that ships, imported rather than copied, so this cannot measure a stale rule. */
const LIVE = { norm, match: (c: string, t: string) => tokenIn([t], [c]) };

/** The normalisation as it stood before the hyphen, slash and apostrophe folding. */
const normWithoutPunctuationFolding = (s: string) =>
  s
    .toLowerCase()
    .replace(/[‘’]/g, "'")
    .replace(/[.,;:()\[\]]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

type Candidate = { norm: (s: string) => string; match: (ctxString: string, token: string) => boolean };

/** Candidate rules, keyed by the name you pass to --only. */
const CANDIDATES: Record<string, Candidate> = {
  /**
   * The rule before the fix: a plain substring, on the old normalisation. LOST is empty and
   * GAINED is every mid-word match the fix removed — "dic" reaching into "appendicitis" and
   * its three thousand siblings.
   */
  substring: {
    norm: normWithoutPunctuationFolding,
    match: (c, t) => c.includes(t),
  },

  /**
   * Whole words on the old normalisation: the intermediate state, correct about mid-word
   * matching and wrong about punctuation. Its LOST list is the 62 real matches that a hyphen
   * or an apostrophe was hiding, which is what this script was written to find.
   */
  "strict-words-old-norm": {
    norm: normWithoutPunctuationFolding,
    match: (c, t) => c === t || ` ${c} `.includes(` ${t} `),
  },

  /** Whole words on the shipped normalisation, with no plural handling. */
  "no-plurals": {
    norm,
    match: (c, t) => c === t || ` ${c} `.includes(` ${t} `),
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
 */
function matchedWholeWord(ctxString: string, token: string): boolean {
  const i = ctxString.indexOf(token);
  if (i < 0) return false;
  const before = i === 0 ? " " : ctxString[i - 1];
  const after = i + token.length >= ctxString.length ? " " : ctxString[i + token.length];
  return !/[a-z0-9]/.test(before) && !/[a-z0-9]/.test(after);
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
    // Each side normalises with its own rule: normalisation is half of the matching rule, so
    // comparing them through one `norm` would hide every punctuation difference.
    const shippedToken = LIVE.norm(rawToken);
    const candidateToken = candidate.norm(rawToken);
    if (!shippedToken && !candidateToken) continue;
    for (const rawName of names) {
      const shippedCtx = LIVE.norm(rawName);
      const candidateCtx = candidate.norm(rawName);
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
