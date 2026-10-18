/**
 * Live words of a unit round, split at each spoken bed number — only for showing on the
 * recording sheet while it is said. The real split is done on the server from the recording
 * (lib/read-round.ts) and checked bed by bed on the review screen; this is a preview of it.
 *
 * "bed 3", "Bed no. 3", "bed number 12A". A number said as a word ("bed three") stays in the
 * text of the bed before it: the preview shows it, and the server reads it.
 */
export function heardByBed(text: string): { bed: string | null; text: string }[] {
  const out: { bed: string | null; text: string }[] = [];
  const re = /\bbed\s*(?:no\.?|number)?\s*(\d+[a-z]?)\b[\s,.:-]*/gi;
  let last = 0;
  let bed: string | null = null;
  for (let m: RegExpExecArray | null; (m = re.exec(text)); ) {
    const before = text.slice(last, m.index).trim();
    if (before || bed !== null) out.push({ bed, text: before });
    bed = m[1].toUpperCase();
    last = re.lastIndex;
  }
  const rest = text.slice(last).trim();
  if (rest || bed !== null) out.push({ bed, text: rest });
  return out;
}
