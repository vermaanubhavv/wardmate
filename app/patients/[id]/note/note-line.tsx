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
 *  of underscores after the heading read as clutter. Left empty, they get open space instead. */
const EMPTY_EXAM = /^(P\/Abdomen|Chest|Assessment|Flatus \/ Stool) -$/;

export function renderNoteLine(
  line: string,
  key: number | string,
  /** The overlay's boxes are a fixed size read off a photograph, not a free-flowing page — see
   *  app/patients/[id]/note/overlay-note.tsx. Compact trims the margins that give the plain
   *  layout room to breathe, since that room does not exist inside a detected box. */
  opts: { compact?: boolean } = {}
) {
  // A blank string is reserved room to write more by hand — genuinely blank space, no drawn
  // line. Both surfaces already have their own lines to write on: the physical form is
  // printed with them, and a plain sheet of paper does not need this app to draw them either.
  // A drawn line here would be a second, redundant one on top of whichever the resident is
  // actually going to write against.
  if (line === "") {
    return <div key={key} className={opts.compact ? "h-3" : "h-6"} />;
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

  // Open space under a bare heading, and a little breathing room above a heading line — Advice
  // in particular has no blank spacer line before it (that would silently eat one of Plan's
  // reserved lines), so the gap comes from margin/padding, never a drawn line.
  const className =
    [
      emptyExam && (opts.compact ? "pb-3" : "pb-5"),
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
