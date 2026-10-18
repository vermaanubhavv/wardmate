import Anthropic from "@anthropic-ai/sdk";

/**
 * The model every AI path in WardMate uses.
 *
 * One constant rather than the same string typed into nine files, so switching is one line and
 * cannot be done to eight of them.
 *
 * claude-sonnet-5, chosen by the user on 2026-08-30 for cost: $2/$10 per million tokens against
 * Opus 5's $5/$25, roughly a 60% saving on a bill that is dominated by photographs.
 *
 * claude-sonnet-5-5 since 2026-10-17, at the same $2/$10 (standing preference: the newest Sonnet
 * whenever it costs the same). Measured first on the synthetic routes in scripts/eval-models:
 * equal or better on every route, and it flagged a drug in a plan ("start oral iron") for
 * confirmation where Sonnet 5 did not. What it changes for this code: `thinking: disabled`, a
 * forced `tool_choice` and non-default sampling all return 400 on it — none is used here — and
 * its effort levels are recalibrated (default high; every call here sets low or medium).
 *
 * SONNET IS THE CEILING. Standing decision, 2026-09-26: no path in this app runs on Opus (or
 * anything above it). Cheaper is fine — the live-dictation router already runs on Haiku — but
 * nothing goes up. lib/__tests__/model.test.ts fails the build if an Opus/Fable/Mythos model id
 * appears anywhere in the source, so this is enforced rather than remembered.
 *
 * WHAT THAT TRADES, recorded here because it was measured on a real page and should not have
 * to be discovered twice. Both models were given the same handwritten clerking sheet and the
 * same prompt (lib/read-case-sheet.ts). Opus 5 transcribed it correctly and wrote [illegible]
 * where the page genuinely was. Sonnet 5, on the same page:
 *
 *   "LB = 27yr back"          -> "2yr back"        (last childbirth moved 25 years)
 *   "postmenopausal 1½ yr"    -> "1yr ago"
 *   "no h/o prev Sx | BT"     -> "no h/o DM | BP"  (surgical/transfusion history became
 *                                                   diabetes/blood-pressure history)
 *   pain abdomen "since ___"  -> "since 2 months"  (a duration the page does not carry)
 *
 * The last one is the one to watch. This app's defence against invented values is the
 * verbatim-quote check in lib/extract.ts: an observation must quote its transcript. When the
 * TRANSCRIPT is what invented the value, the quote matches, the check passes, and the number
 * arrives on the discharge summary with a source to tap. A blank is recoverable; a confident
 * wrong duration is not.
 *
 * That risk has not gone away, and under the ceiling above it can no longer be answered by
 * moving this constant. If handwritten pages start producing values nobody recognises, the fix
 * has to be structural rather than a bigger model: a photo-derived value is not the resident's
 * own words and should not be trusted like one. `needs_confirmation` in lib/extract.ts is the
 * mechanism that already exists for surfacing exactly that kind of value for a one-tap check.
 */
export const AI_MODEL = "claude-sonnet-5-5";

/** The cheaper model, for small high-volume passes where Sonnet's extra care is not needed: the
 *  live-dictation router and the final proofread of case histories and progress notes.
 *
 *  claude-haiku-5-5 since 2026-10-17, replacing Haiku 4.5: about a tenth of the price ($0.10 /
 *  $0.50 per million tokens against $1 / $5) and, at effort "low", as good or better on every
 *  fast job in scripts/eval-models — live routing 79/80 (one item missed, nothing invented),
 *  date check level, final proofread 6/6 against 5/6 — and a little quicker (1.2 s against
 *  1.4 s median on routing). Unlike Haiku 4.5 it accepts `effort`, and thinks by default, so
 *  every fast call sets effort "low" to keep that latency. */
export const FAST_MODEL = "claude-haiku-5-5";

/** The one Anthropic client constructor. Throws when the key is missing, so a misconfigured
 *  server fails loudly rather than sending a keyless request. */
export function anthropic(): Anthropic {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY is not set on the server.");
  return new Anthropic({ apiKey });
}

/** The reply's first text block parsed as JSON, or `fallback` when the reply carries no text
 *  block. Malformed JSON throws, as JSON.parse does — callers decide whether that is fatal. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function replyJson(response: Anthropic.Message, fallback: unknown): any {
  const block = response.content.find((b) => b.type === "text");
  return block && block.type === "text" ? JSON.parse(block.text) : fallback;
}
