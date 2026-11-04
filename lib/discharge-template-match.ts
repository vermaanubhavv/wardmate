/**
 * Template matching over a slim index — key, label and the match pattern — rather than the
 * templates themselves.
 *
 * The one-off Start card used to import lib/specialty/discharge.ts to list and match
 * templates, which pulled every department's full template set (scaffolds, medications,
 * advice: 730 KB of JavaScript) into the browser. The page now builds this index on the server
 * and the card matches against it; the full template is only ever read on the server.
 *
 * No imports: this file must stay free of the template data.
 */

/** The Start card's "No template — start blank" choice. Lives here, not in lib/discharge-oneoff.ts,
 *  because that module compiles drafts and importing even a constant from it would pull the
 *  compiler and every template into the browser. */
export const NO_TEMPLATE = "__none__";

export type TemplateIndexEntry = {
  key: string;
  label: string;
  /** A RegExp cannot cross the server/client boundary, so it travels as source and flags. */
  match: { source: string; flags: string };
  /** care_templates families that also select this template. */
  families?: string[];
};

export type DischargeTemplateIndex = {
  templates: TemplateIndexEntry[];
  generic: { key: string; label: string };
};

/**
 * The diagnosis HEAD is tried before the rest. A resident's diagnosis line names the condition
 * first and hangs history and incidental findings off it: "Deep organ space SSI ? bile leak with
 * s/p lap cholecystectomy with post exp. laparotomy ivo pyoperitoneum and SAIO". Matched whole,
 * the trailing "SAIO" picked the intestinal-obstruction template — its diet and bowel advice
 * printed on a bile-leak summary. So: the head (before the first "with", "s/p", "post", "in view
 * of", "k/c/o", comma or semicolon), then the procedure actually done, then everything together.
 * A cause ("due to", "secondary to") stays in the head: the cause is often the point.
 */
const DIAGNOSIS_TAIL =
  /\s+(?:with|w\/|s\/p|status post|post|ivo|i\/v\/o|in view of|k\/c\/o|known case of|h\/o|and)\s+|[,;]/i;

/**
 * The entry the typed procedure / diagnosis / care-template family points at, or null. The
 * diagnosis wording is the most specific signal and is tried first; the family is a fallback.
 * First match wins, so each pack's array is ordered specific-before-general.
 */
export function matchTemplateIndex<T extends TemplateIndexEntry>(
  templates: T[],
  input: { procedureText?: string | null; diagnosisText?: string | null; templateFamily?: string | null }
): T | null {
  const diagnosis = input.diagnosisText?.trim() ?? "";
  const procedure = input.procedureText?.trim() ?? "";
  const head = diagnosis.split(DIAGNOSIS_TAIL)[0].trim();
  for (const text of [head, procedure, `${procedure} ${diagnosis}`.trim()]) {
    if (!text) continue;
    const byText = templates.find((t) => new RegExp(t.match.source, t.match.flags).test(text));
    if (byText) return byText;
  }
  if (input.templateFamily) {
    const byFamily = templates.find((t) => t.families?.includes(input.templateFamily!));
    if (byFamily) return byFamily;
  }
  return null;
}
