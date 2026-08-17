export type WardPatient = {
  id: string;
  display_name: string;
  age_years: number | null;
  sex: string | null;
  bed: string;
  primary_diagnosis: string | null;
  admitted_on: string;
  surgery_date: string | null;
  post_op_day: number | null;
  admission_day: number;
  last_entry_at: string | null;
  template_family: string | null;
  template_variant: string | null;
  procedure_text: string | null;
  management: string | null;
  unconfirmed_count: number;
  open_task_count: number;
  /** Recordings and photographs on this patient's record. */
  entry_count: number;
};

export const MANAGEMENT_CHOICES = [
  { value: "preop", label: "Pre-op" },
  { value: "conservative", label: "Conservative" },
  { value: "workup", label: "Workup" },
] as const;

/**
 * What kind of management the patient is under.
 *
 * Post-op is derived from the surgery date rather than stored, so it can never disagree with
 * the POD count sitting beside it, and a patient becomes post-op automatically the day their
 * operation is recorded. The other three are stored decisions; a patient nobody has
 * classified yet shows nothing rather than a guess.
 */
export function managementLabel(p: {
  surgery_date: string | null;
  management: string | null;
}): string | null {
  if (p.surgery_date) return "POST OP";
  const found = MANAGEMENT_CHOICES.find((c) => c.value === p.management);
  return found ? found.label.toUpperCase() : null;
}

/**
 * How a patient is named on screen: "Sharma, 62/M" — the way one is actually identified on a
 * round. Either part may be missing (patients added before these fields existed, or an
 * admission where the age was not known), and whatever is present is still shown.
 */
export function patientName(p: {
  display_name: string;
  age_years: number | null;
  sex: string | null;
}): string {
  const age = p.age_years !== null ? String(p.age_years) : null;
  const sex = p.sex === "other" ? null : p.sex;

  const detail = [age, sex].filter(Boolean).join("/");
  return detail ? `${p.display_name}, ${detail}` : p.display_name;
}

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
