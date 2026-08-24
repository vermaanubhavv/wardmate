/**
 * How one line of the generated note renders — shared between the plain-page layout and the
 * form-overlay layout, so a heading bolds the same way regardless of which one is showing.
 * See lib/progress-note.ts for what a blank string and a bare "Heading -" line mean.
 */

/** The headings this file bolds and underlines, wherever they appear — Observation and the
 *  Investigation/Treatment/Management column both use this, so "Plan" and "Advice" get the
 *  same treatment as "Complaints"/"On Examination"/"Assessment" do. */
const BOLD_HEADINGS = /^(Complaints|On Examination|Assessment|Plan|Advice)([:-])(.*)$/;

/** P/Abdomen, Chest, Assessment and Flatus/Stool are written as a sentence, not a word — a row
 *  of underscores after the heading read as clutter. Left empty, they get a ruled line instead. */
const EMPTY_EXAM = /^(P\/Abdomen|Chest|Assessment|Flatus \/ Stool) -$/;

export function renderNoteLine(
  line: string,
  key: number | string,
  /** The overlay's boxes are a fixed size read off a photograph, not a free-flowing page — see
   *  app/patients/[id]/note/overlay-note.tsx. Compact trims the margins that give the plain
   *  layout room to breathe, since that room does not exist inside a detected box. */
  opts: { compact?: boolean } = {}
) {
  // A blank string is reserved room to write more by hand — a ruled line with nothing on it,
  // not an empty paragraph that would collapse to no height at all.
  if (line === "") {
    return (
      <div
        key={key}
        className={opts.compact ? "mt-1 border-b border-black/60" : "mt-3 border-b border-line"}
      />
    );
  }

  const emptyExam = EMPTY_EXAM.test(line.trim());
  const heading = line.match(BOLD_HEADINGS);
  const content = heading ? (
    <>
      <strong className="underline">
        {heading[1]}
        {heading[2]}
      </strong>
      {heading[3]}
    </>
  ) : (
    line
  );

  // A little breathing room above a heading line — Advice in particular has no blank spacer
  // line before it (that would silently eat one of Plan's reserved lines), so the gap comes
  // from margin instead.
  const className =
    [
      emptyExam && (opts.compact ? "border-b border-black/60 pb-1" : "border-b border-line pb-3"),
      heading && (opts.compact ? "mt-1" : "mt-2"),
    ]
      .filter(Boolean)
      .join(" ") || undefined;

  return (
    <p key={key} className={className}>
      {content}
    </p>
  );
}
