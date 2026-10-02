import { generalSurgeryPack, getSpecialtyPack, type DayCountPatient, type SpecialtyPack } from "@/lib/specialty";
import { hasOperationClock } from "@/lib/specialty/intake";

export type WardPatient = {
  id: string;
  display_name: string;
  age_years: number | null;
  sex: string | null;
  bed: string;
  uhid_ip_no: string | null;
  mrd_no: string | null;
  primary_diagnosis: string | null;
  admitted_on: string;
  surgery_date: string | null;
  /** An upcoming, not-yet-happened operation date. Never drives post_op_day — see the column
   *  comment in supabase/patches/0021_planned_surgery_date.sql. */
  planned_surgery_date: string | null;
  post_op_day: number | null;
  admission_day: number;
  /** Chemotherapy: the regimen as the unit names it, which cycle, and the day within it
   *  (1-based). Null on every surgical patient and on an oncology patient not on an active
   *  cycle. See supabase/patches/0060_specialty_packs.sql. */
  regimen?: string | null;
  cycle_number?: number | null;
  cycle_day?: number | null;
  /** Burns: the date of the injury and the days since it, 1-based (the day of the burn is
   *  PBD 1). Null on every patient who is not a burns admission. See patch 0085. */
  burn_date?: string | null;
  burn_day?: number | null;
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
  /** The patient's most recent vitals reading, all of it — see ward_screen() in
   *  supabase/patches/0044_ward_screen_vitals_labs.sql. Optional: the pre-RPC fallback path
   *  does not fetch these, and an empty ward list is a correct answer, not a missing one. */
  vitals?: { label: string; value_text: string | null; recorded_at: string }[];
  /** One row per test, the most recent result for it. */
  labs?: {
    label: string;
    value_text: string | null;
    ref_low: number | null;
    ref_high: number | null;
    ref_text: string | null;
    recorded_at: string;
  }[];
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

/**
 * Hospital papers commonly prefix names with social titles. They do not help identify a
 * patient on a ward list, and make the most important part of a compact header harder to scan.
 * Applied both when saving and when displaying so older records are cleaned immediately too.
 */
export function stripPatientHonorific(name: string): string {
  const original = name.trim();
  const stripped = original.replace(
    /^(?:(?:mr|mrs|ms|miss|shri|sri|smt)\.?\s+)+/i,
    ""
  ).trim();
  return stripped || original;
}

/**
 * A label folded into its value when the value already says it — "vitals" + "vital is stable"
 * reads once, not as "vitals vital is stable". Matched word by word rather than as one string,
 * because the words often arrive reordered ("pac review" label, "review PAC and pas done"
 * value), and a plain substring test misses that and stutters.
 *
 * Shared rather than reimplemented per screen: the record, the plan list and the discharge
 * summary all show the same observations, and a rule for when a label is redundant should not
 * disagree between them.
 */
export function mergeLabelValue(label: string | null, value: string | null): string {
  const l = (label ?? "").trim();
  const v = (value ?? "").trim();
  if (!v) return l;
  if (!l) return v;

  const haystack = v.toLowerCase();
  const words = l.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
  const alreadySaid =
    words.length > 0 &&
    words.every((w) => {
      const stem = w.replace(/s$/, "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      return new RegExp(`\\b${stem}`).test(haystack);
    });

  return alreadySaid ? v : `${l} ${v}`;
}

/** Where the patient physically is. Stored, never read out of the bed label — see
 *  supabase/patches/0023_home_screen.sql for why a guess was not good enough. */
export const LOCATION_CHOICES = [
  { value: "ward", label: "Ward" },
  { value: "icu", label: "ICU" },
  { value: "emergency", label: "Emergency" },
] as const;

/** What a resident is. The ladder as an Indian surgical unit writes it. */
export const DESIGNATION_CHOICES = ["Intern", "JR-1", "JR-2", "JR-3", "SR", "AP", "Medical Officer", "Consultant"] as const;

export const MANAGEMENT_CHOICES = [
  { value: "preop", label: "Pre-op" },
  { value: "conservative", label: "Conservative" },
  { value: "workup", label: "Workup" },
] as const;

/**
 * The Management select's options for this unit. A unit without an operation clock (medicine,
 * oncology…) is not offered Pre-op/Post-op, and "Conservative" reads "On treatment" there — the
 * stored value is the same. A stored pre-op/post-op is still listed so that saving an edit never
 * silently clears it.
 */
export function managementChoicesFor(
  specialty: string | null | undefined,
  current = ""
): { value: string; label: string }[] {
  const all = [...MANAGEMENT_CHOICES, { value: "postop", label: "Post-op" }];
  if (hasOperationClock(getSpecialtyPack(specialty))) return all;
  return all
    .filter((c) => (c.value !== "preop" && c.value !== "postop") || c.value === current)
    .map((c) => (c.value === "conservative" ? { ...c, label: "On treatment" } : c));
}

/**
 * What kind of management the patient is under.
 *
 * Post-op is derived from the surgery date rather than stored, so it can never disagree with
 * the POD count sitting beside it, and a patient becomes post-op automatically the day their
 * operation is recorded. The other three are stored decisions; a patient nobody has
 * classified yet shows nothing rather than a guess.
 */
export function managementLabel(
  p: {
    surgery_date: string | null;
    management: string | null;
  },
  pack: SpecialtyPack = generalSurgeryPack
): string | null {
  // No operation clock (medicine, oncology…): pre-op/post-op mean nothing on that ward, so only
  // the two decisions it does make are shown, in its own words.
  if (!hasOperationClock(pack)) {
    if (p.management === "conservative") return "ON TREATMENT";
    return p.management === "workup" ? "WORKUP" : null;
  }
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
  const name = stripPatientHonorific(p.display_name);
  return detail ? `${name}, ${detail}` : name;
}

/**
 * How the day is described on a card.
 *
 * WHICH CLOCK IS THE UNIT'S DECISION, not this function's. A surgical unit counts from the
 * operation, an oncology unit from the chemotherapy cycle, and everyone falls back to the
 * admission day — the rule lives in that unit's pack (lib/specialty/). The label always says
 * which clock it is, because "day 3" meaning two different things on two adjacent beds is
 * exactly the ambiguity this app exists to remove.
 *
 * The pack defaults to general surgery, so a caller that has not been given one behaves
 * exactly as this function always did.
 */
export function dayLabel(p: DayCountPatient, pack: SpecialtyPack = generalSurgeryPack): string {
  return pack.dayCount(p).text;
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
