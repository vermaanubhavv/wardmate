import { numbersIn } from "@/lib/complaint-duration";

/**
 * The extractor writes an exam finding or a diagnosis the way a chart does: "RUQ tenderness",
 * not "upper abdomen is tender in the right upper abdomen"; a spoken false start ("right upper…
 * right liver lobe abscess") dropped. The source_quote keeps the words as said.
 *
 * The prompt asks; this checks. A tidied value may only use words the resident said (or a form
 * of one: tender → tenderness), standard ward shorthand, and joining words. Not one number more.
 * Anything else, and the value falls back to the verbatim quote.
 */

const SHORTHAND = new Set([
  "ruq", "luq", "rif", "lif", "rlq", "llq", "p/a", "pa", "+", "present", "noted", "seen",
  "with", "and", "of", "in", "on", "at", "over", "the", "a", "an", "is", "are", "tenderness", "tender",
]);

const words = (s: string) => s.toLowerCase().match(/[a-z0-9/+.-]+/g)?.map((w) => w.replace(/[.,;:]+$/, "")).filter(Boolean) ?? [];

export function tidyIsFaithful(value: string, quote: string): boolean {
  const said = words(quote);
  const saidSet = new Set(said);
  const nums = numbersIn(quote);
  if ([...numbersIn(value)].some((n) => !nums.has(n))) return false;
  // A side and a negation are never the tidier's to supply: RUQ needs a "right" said, and the
  // value is negative exactly when the quote is.
  const v = ` ${value.toLowerCase()} `;
  const q = ` ${quote.toLowerCase()} `;
  // A quadrant needs its side and its level said (other sites pass only as words said).
  const QUADRANTS: [RegExp, RegExp, RegExp][] = [
    [/\bruq\b/, /\bright\b/, /\b(upper|hypochondri)/],
    [/\bluq\b/, /\bleft\b/, /\b(upper|hypochondri)/],
    [/\b(rif|rlq)\b/, /\bright\b/, /\b(lower|iliac)\b/],
    [/\b(lif|llq)\b/, /\bleft\b/, /\b(lower|iliac)\b/],
  ];
  if (QUADRANTS.some(([abbr, side, level]) => abbr.test(v) && !(side.test(q) && level.test(q)))) return false;
  const NEG = /\b(no|not|nil|absent|without|non|denies)\b|-ve/;
  if (NEG.test(v) !== NEG.test(q)) return false;
  return words(value).every(
    (w) => saidSet.has(w) || SHORTHAND.has(w) || (w.length >= 5 && said.some((s) => s.length >= 5 && s.slice(0, 5) === w.slice(0, 5)))
  );
}
