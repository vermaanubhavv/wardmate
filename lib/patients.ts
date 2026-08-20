export type WardPatient = {
  id: string;
  display_name: string;
  age_years: number | null;
  sex: string | null;
  bed: string;
  primary_diagnosis: string | null;
  admitted_on: string;
  surgery_date: string | null;
  /** An upcoming, not-yet-happened operation date. Never drives post_op_day — see the column
   *  comment in supabase/patches/0021_planned_surgery_date.sql. */
  planned_surgery_date: string | null;
  post_op_day: number | null;
  admission_day: number;
  last_entry_at: string | null;
  template_family: string | null;
  template_variant: string | null;
  procedure_text: string | null;
  management: string | null;
  location: string;
  unconfirmed_count: number;
  open_task_count: number;
  /** Recordings and photographs on this patient's record. */
  entry_count: number;
};

/**
 * Labels that describe WHO or WHERE rather than a finding.
 *
 * Deliberately matched on the label alone and kept narrow. "Age" and "sex" are here; "wound"
 * and "drain" obviously are not. Anchored so that "bed sore" — a real finding — does not get
 * caught by "bed".
 *
 * Lives here rather than in lib/extract.ts so the record screen can apply the same rule when
 * DISPLAYING. Extraction drops these going in, but entries recorded before that filter existed
 * still hold them, and a rule enforced in only one of the two places leaves a patient's record
 * disagreeing with itself.
 */
const IDENTIFIER_LABELS =
  /^(bed( number| no\.?)?|ward|patient( name)?|name|age|sex|gender|mrd( no\.?)?|uhid|ip( no\.?)?|hospital number)$/i;

/** True for a label naming who or where the patient is — never a clinical finding. */
export function isIdentifierLabel(label: string | null | undefined): boolean {
  return IDENTIFIER_LABELS.test((label ?? "").trim());
}

/** Where the patient physically is. Stored, never read out of the bed label — see
 *  supabase/patches/0023_home_screen.sql for why a guess was not good enough. */
export const LOCATION_CHOICES = [
  { value: "ward", label: "Ward" },
  { value: "icu", label: "ICU" },
  { value: "emergency", label: "Emergency" },
] as const;

/** What a resident is. The ladder as an Indian surgical unit writes it. */
export const DESIGNATION_CHOICES = ["JR-1", "JR-2", "JR-3", "SR", "AP"] as const;

export const MANAGEMENT_CHOICES = [
  { value: "preop", label: "Pre-op" },
  { value: "conservative", label: "Conservative" },
  { value: "workup", label: "Workup" },
] as const;

/**
 * Common general-surgery diagnoses, offered as typing suggestions.
 *
 * A datalist, exactly like the operation field: picking one is faster than typing it out, but
 * it is never the only option — anything typed is kept as written, so a diagnosis outside this
 * list is never blocked or silently corrected to the nearest match.
 */
export const COMMON_DIAGNOSES = [
  "Acute appendicitis",
  "Acute cholecystitis",
  "Cholelithiasis",
  "Choledocholithiasis",
  "Acute pancreatitis",
  "Chronic pancreatitis",
  "Intestinal obstruction",
  "Perforation peritonitis",
  "Inguinal hernia",
  "Umbilical hernia",
  "Incisional hernia",
  "Carcinoma breast",
  "Carcinoma stomach",
  "Carcinoma colon",
  "Carcinoma rectum",
  "Thyroid swelling",
  "Anal fistula",
  "Perianal abscess",
  "Hemorrhoids",
  "Pilonidal sinus",
  "Varicose veins",
  "Diabetic foot",
  "Cellulitis",
  "Soft tissue abscess",
  "Blunt abdominal trauma",
  "Road traffic accident",
  "Hydrocele",
  "Lipoma",
  "Sebaceous cyst",
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
