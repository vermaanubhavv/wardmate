export type WardPatient = {
  id: string;
  display_name: string;
  bed: string;
  primary_diagnosis: string | null;
  admitted_on: string;
  surgery_date: string | null;
  post_op_day: number | null;
  admission_day: number;
  last_entry_at: string | null;
  unconfirmed_count: number;
};

/**
 * How the day is described on a card. Operated patients are counted from the operation,
 * everyone else from admission — and the label always says which, because "day 3" meaning
 * two different things on two adjacent beds is exactly the ambiguity this app should remove.
 */
export function dayLabel(p: {
  post_op_day: number | null;
  admission_day: number;
}): string {
  if (p.post_op_day !== null) return `POD ${p.post_op_day}`;
  return `Day ${p.admission_day}`;
}

/**
 * Beds sort by their location prefix, then numerically within it, so "SW-2" comes before
 * "SW-10" rather than after it the way plain alphabetical sorting would put it.
 */
export function compareBeds(a: string, b: string): number {
  const split = (s: string) => {
    const m = s.match(/^(.*?)(\d+)\s*$/);
    return m ? { prefix: m[1].trim().toLowerCase(), num: parseInt(m[2], 10) } : null;
  };
  const pa = split(a);
  const pb = split(b);

  if (pa && pb) {
    if (pa.prefix !== pb.prefix) return pa.prefix.localeCompare(pb.prefix);
    return pa.num - pb.num;
  }
  return a.localeCompare(b, undefined, { numeric: true });
}
