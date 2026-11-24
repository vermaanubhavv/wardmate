/**
 * The pinned bed on a unit round: the resident taps the bed they are standing at, and every
 * word said from that moment belongs to that bed, without anyone having to say "bed 12".
 *
 * The phone only knows WHEN each tap happened (seconds into the recording). The server gets
 * word timings back from the transcriber and writes "Bed 12." into the transcript just before
 * the first word said after the tap. From there the round is split exactly as if the bed had
 * been spoken (lib/read-round.ts), and the review screen still re-checks every bed against the
 * ward as it stands. A bed said aloud still counts: the marker only adds a split, it never
 * removes one.
 *
 * Behind NEXT_PUBLIC_PINNED_BED_ROUND=on while it is tried on a test unit.
 */

export type BedMark = { bed: string; at: number };
export type TimedWord = { word: string; start: number };

export function pinnedBedRoundEnabled(): boolean {
  return process.env.NEXT_PUBLIC_PINNED_BED_ROUND === "on";
}

/** The form field, read defensively: it comes off a phone and may have sat in the outbox. */
export function parseBedMarks(raw: unknown, wardBeds: ReadonlySet<string> = new Set()): BedMark[] {
  if (typeof raw !== "string" || !raw) return [];
  try {
    const list: unknown = JSON.parse(raw);
    if (!Array.isArray(list)) return [];
    return list
      .filter(
        (m): m is BedMark =>
          typeof m?.bed === "string" &&
          // A bed on this ward exactly as it is written, or a plain label ("12", "12A", "ICU-3")
          // for a bed that has since changed. Nothing else, since it goes into the transcript
          // the model reads. A dropped tap would file that patient under the bed before.
          (wardBeds.has(m.bed) || /^[\w/ -]{1,12}$/.test(m.bed)) &&
          typeof m?.at === "number" &&
          Number.isFinite(m.at) &&
          m.at >= 0
      )
      .sort((a, b) => a.at - b.at);
  } catch {
    return [];
  }
}

/**
 * The transcript with "Bed X." written in at each tap. A tap with no word after it (the
 * resident moved on and said nothing) adds nothing, and two taps before the same word keep
 * only the later one, since that is the bed the words were said at.
 */
export function insertBedMarks(words: TimedWord[], marks: BedMark[]): string {
  const out: string[] = [];
  let m = 0;
  for (const w of words) {
    let pinned: string | null = null;
    while (m < marks.length && marks[m].at <= w.start) pinned = marks[m++].bed;
    if (pinned !== null) out.push(`Bed ${pinned}.`);
    out.push(w.word);
  }
  return out.join(" ");
}
