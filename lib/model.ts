/**
 * The model every AI path in WardMate uses.
 *
 * One constant rather than the same string typed into nine files, so switching is one line and
 * cannot be done to eight of them.
 *
 * claude-sonnet-5, chosen by the user on 2026-08-30 for cost: $2/$10 per million tokens against
 * Opus 5's $5/$25, roughly a 60% saving on a bill that is dominated by photographs.
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
export const AI_MODEL = "claude-sonnet-5";
