/**
 * The objective examination, written the way it is written on a chart rather than as a table.
 *
 * A resident does not read "pallor: absent / icterus: absent / cyanosis: absent" seven times
 * over. They write PICCLE, and then they write the things that were actually abnormal. This
 * turns the stored per-item values into that line.
 *
 * THE RULE THIS MODULE EXISTS UNDER: collapsing a finding out of sight is the dangerous
 * direction, and being slightly verbose is the safe one. So nothing is treated as normal unless
 * it matches a tight, explicit list of normal phrasings — anything descriptive, anything long,
 * anything with a clause in it is shown in full rather than folded into "Rest — NAD". A wrong
 * guess should cost a line of screen, never a hidden abnormality.
 *
 * And "PICCLE" is an assertion about seven signs. It is only honest to print it for the ones
 * somebody actually examined, so whichever of the seven were never recorded come back alongside
 * it to be shown — the acronym is never allowed to stand in for an examination nobody did.
 */

import {
  canonicalLabName,
  classifyLab,
  type LabFlag,
  type RangeSource,
  type SuppliedRange,
} from "@/lib/lab-ranges";

export type ExamValue = {
  id: string;
  label: string;
  value: string | null;
  /** When it was recorded, so a result from three days ago does not read as this morning's. */
  recordedAt?: string | null;
  /** The range printed beside this very result on the report it was read from. */
  refLow?: number | null;
  refHigh?: number | null;
  refText?: string | null;
};

/** The ward's own accumulated ranges, keyed by canonicalLabName. */
export type WardRanges = Map<string, { low: number | null; high: number | null; text: string | null }>;

export type ObjectiveSummary = {
  /** "BP 110/80 · PR 86/min" — recorded vitals only, BP and PR leading. Null when none. */
  vitals: { label: string; value: string }[];
  /** The general-examination line, or null when not one of the seven was recorded. */
  piccle: {
    /** "PICCLE" · "Pallor + · rest PICCLE" · "Pallor +" */
    text: string;
    /** Which of the seven nobody recorded. Empty when all seven were covered. */
    notRecorded: string[];
  } | null;
  /** Abnormal, or not confidently normal — named in full, in the order recorded. */
  findings: { id: string; label: string; value: string }[];
  /** Blood results outside their reference range, each carrying the range it was judged
   *  against. A known result whose value could not be read lands here too, unflagged. */
  labs: {
    id: string;
    label: string;
    value: string;
    flag: LabFlag | null;
    range: string | null;
    /** Which authority supplied that range — the report itself, this ward, or the fallback. */
    source: RangeSource | null;
    when: string | null;
  }[];
  /** Blood results that were in range. Counted, not listed. */
  normalLabCount: number;
  /** How many systems were recorded and read as plainly normal. Drives "Rest — NAD". */
  normalCount: number;
};

/** The seven signs of the acronym, in the order it says them. */
const PICCLE: { key: string; label: string; aliases: string[] }[] = [
  { key: "pallor", label: "Pallor", aliases: ["pallor", "anaemia", "anemia", "conjunctival pallor"] },
  { key: "icterus", label: "Icterus", aliases: ["icterus", "jaundice", "yellowing"] },
  { key: "cyanosis", label: "Cyanosis", aliases: ["cyanosis"] },
  { key: "clubbing", label: "Clubbing", aliases: ["clubbing"] },
  { key: "oedema", label: "Oedema", aliases: ["oedema", "edema", "pedal oedema", "pedal edema", "swelling of feet"] },
  { key: "jvp", label: "JVP", aliases: ["jvp", "jugular venous pressure"] },
  {
    key: "lymphadenopathy",
    label: "Lymphadenopathy",
    aliases: [
      "lymphadenopathy",
      "generalised lymphadenopathy",
      "generalized lymphadenopathy",
      "lymph node",
      "lymph nodes",
    ],
  },
];

// "nails" is deliberately NOT an alias of clubbing. Nails are looked at for more than clubbing,
// and an abnormal nail finding rendered as "Clubbing +" would be the app putting a sign in a
// doctor's mouth. Unmapped labels simply print under their own name, which is the safe failure.

/** Vitals worth leading with, in the order a chart puts them. Anything else prints after. */
const VITAL_ORDER: { label: string; aliases: string[] }[] = [
  { label: "BP", aliases: ["bp", "blood pressure"] },
  { label: "PR", aliases: ["pr", "pulse", "pulse rate", "heart rate", "hr"] },
  { label: "Temp", aliases: ["temperature", "temp", "fever"] },
  { label: "SpO₂", aliases: ["spo2", "saturation", "oxygen saturation", "sats"] },
  { label: "RR", aliases: ["rr", "respiratory rate"] },
];

/** How the unit writes a system's name, so "abdomen" reads as "P/A" on the line. */
const SYSTEM_NAMES: { label: string; aliases: string[] }[] = [
  { label: "P/A", aliases: ["abdomen", "per abdomen", "p/a", "pa", "abdominal examination"] },
  { label: "Chest", aliases: ["chest", "respiratory system", "rs", "lungs", "air entry"] },
  { label: "CVS", aliases: ["cvs", "cardiovascular system", "heart sounds", "s1s2", "s1 s2"] },
  { label: "P/R", aliases: ["per rectal", "p/r", "pr examination", "rectal examination", "per rectum"] },
  { label: "P/V", aliases: ["per vaginum", "p/v", "vaginal examination", "per vagina"] },
  { label: "CNS", aliases: ["cns", "central nervous system", "neurological examination", "neuro"] },
];

/**
 * Values that mean "looked, nothing there". Matched against the WHOLE value, never a substring —
 * "no lump but tender in the right iliac fossa" must not be read as normal because it opens with
 * "no".
 */
const NORMAL_VALUES = new Set([
  "-", "–", "—", "(-)", "( - )", "nil", "no", "none", "absent", "negative", "not present",
  "n", "(n)", "normal", "nad", "no abnormality", "no abnormality detected", "unremarkable",
  "wnl", "within normal limits", "soft", "soft and non tender", "soft non tender",
  "soft, non tender", "non tender", "nontender", "clear", "b/l clear", "bl clear",
  "bilateral clear", "bilaterally clear", "clear b/l", "conscious", "oriented",
  "conscious and oriented", "conscious oriented", "conscious, oriented", "equal",
  "bilaterally equal", "equal bilaterally", "afebrile", "not palpable", "no organomegaly",
]);

/** Labels where the sign being PRESENT is the normal answer, not the abnormal one. */
const PRESENCE_IS_NORMAL = [
  "bowel sound", "bowel sounds", "air entry", "s1s2", "s1 s2", "heart sounds", "peristalsis",
];

const PRESENT_VALUES = new Set(["+", "(+)", "present", "positive", "heard", "audible", "yes"]);

const norm = (s: string) =>
  s.toLowerCase().replace(/[.;]+\s*$/g, "").replace(/\s+/g, " ").trim();

/**
 * Does this value plainly say "nothing abnormal"?
 *
 * Only an exact match on the list above, or a short bare negation ("no lump", "nil discharge")
 * with no clause in it. Anything carrying a comma, a "but", or more than a few words is a
 * description of something and is shown rather than folded away.
 */
function readsNormal(label: string, value: string | null): boolean {
  if (!value) return false;
  const v = norm(value);
  if (!v) return false;

  // For these, the sign being there is the normal answer. "Bowel sounds absent" and "bowel
  // sounds decreased" are abnormalities, so the generic normal list below must never get to
  // answer for a label whose polarity runs the other way.
  const presenceNormal = PRESENCE_IS_NORMAL.some((p) => norm(label).includes(p));
  if (presenceNormal) return PRESENT_VALUES.has(v);

  // The same sign, but named in the value instead of the label — "CVS: S1S2 (+)", "Chest: air
  // entry equal". Normal only when the value goes on to say the sign was actually there;
  // "P/A: bowel sounds absent" falls through this and is shown.
  if (/^(s1\s?s2|heart sounds|air entry|bowel sounds|peristalsis)\b/.test(v)) {
    return /(\(\+\)|\+|present|heard|audible|normal|equal|clear)$/.test(v);
  }

  if (NORMAL_VALUES.has(v)) return true;

  // A short, single-clause negation: "no lump", "nil discharge", "not palpable".
  if (/[,;]| but | however | with /.test(v)) return false;
  return /^(no|nil|not|negative|absent|free of)\b[a-z\s-]{0,24}$/.test(v);
}

function matchList<T extends { aliases: string[] }>(label: string, list: T[]): T | null {
  const l = norm(label);
  return list.find((entry) => entry.aliases.some((a) => a === l)) ?? null;
}

/** The unit's name for a system, when it has one. Otherwise the label as recorded. */
function displayLabel(label: string): string {
  return matchList(label, SYSTEM_NAMES)?.label ?? label;
}

/**
 * Build the objective line from everything recorded under it.
 *
 * `values` is every objective observation, checklist or not, with the value as stored — null
 * when the thing was expected but never recorded. Nulls take no part in the summary; what is
 * missing is the caller's to report, and it reports it separately rather than as a fake row.
 */
export function summariseObjective(
  values: ExamValue[],
  opts: { sex?: string | null; now?: Date; wardRanges?: WardRanges } = {}
): ObjectiveSummary {
  const recorded = values.filter((v) => v.value !== null && v.value.trim() !== "");
  const now = opts.now ?? new Date();

  const vitals: { label: string; value: string }[] = [];
  const piccleHits = new Map<string, { label: string; value: string; normal: boolean }>();
  const findings: { id: string; label: string; value: string }[] = [];
  const labs: ObjectiveSummary["labs"] = [];
  let normalLabCount = 0;
  let normalCount = 0;
  // "PICCLE negative", said as one phrase. The speaker is asserting all seven at once, which
  // they are entitled to do — so nothing is outstanding when they have.
  let group: { value: string; normal: boolean } | null = null;

  for (const v of recorded) {
    const value = (v.value ?? "").trim();

    if (/^piccle$/.test(norm(v.label))) {
      group = { value, normal: readsNormal(v.label, value) };
      continue;
    }

    const vital = matchList(v.label, VITAL_ORDER);
    if (vital) {
      vitals.push({ label: vital.label, value });
      continue;
    }

    const sign = matchList(v.label, PICCLE);
    if (sign) {
      // Presence is the abnormal answer for every one of the seven, so anything that does not
      // plainly read as absent counts as a positive worth naming.
      piccleHits.set(sign.key, { label: sign.label, value, normal: readsNormal(v.label, value) });
      continue;
    }

    // Blood results are judged against a range rather than against phrasing — see
    // lib/lab-ranges.ts, including why an unrecognised one is never called normal.
    // The range printed on this very report first; then whatever this ward's lab has been seen
    // to use for the same analyte; then nothing, which leaves classifyLab on its built-in table.
    let supplied: SuppliedRange | null = null;
    if (v.refLow != null || v.refHigh != null) {
      supplied = { low: v.refLow ?? null, high: v.refHigh ?? null, text: v.refText, source: "report" };
    } else {
      const ward = opts.wardRanges?.get(canonicalLabName(v.label));
      if (ward && (ward.low !== null || ward.high !== null)) {
        supplied = { ...ward, source: "ward" };
      }
    }

    const lab = classifyLab(v.label, value, opts.sex ?? null, supplied);
    if (lab) {
      if (lab.flag) {
        labs.push({ id: v.id, ...lab, when: agoLabel(v.recordedAt ?? null, now) });
        continue;
      }
      if (lab.range) {
        // Known result, read as a number, inside its range. The one case worth folding away.
        normalLabCount += 1;
        continue;
      }
      // Known result whose value could not be read as a number — shown, never assumed normal.
      labs.push({ id: v.id, ...lab, when: agoLabel(v.recordedAt ?? null, now) });
      continue;
    }

    if (readsNormal(v.label, value)) {
      normalCount += 1;
      continue;
    }

    findings.push({ id: v.id, label: displayLabel(v.label), value });
  }

  // Chart order, not the order they happened to be dictated in.
  vitals.sort(
    (a, b) =>
      VITAL_ORDER.findIndex((x) => x.label === a.label) -
      VITAL_ORDER.findIndex((x) => x.label === b.label)
  );

  let piccle: ObjectiveSummary["piccle"] = null;
  if (piccleHits.size > 0 || group) {
    const positives = PICCLE.filter((s) => piccleHits.get(s.key) && !piccleHits.get(s.key)!.normal).map(
      (s) => {
        const hit = piccleHits.get(s.key)!;
        const bare = PRESENT_VALUES.has(norm(hit.value));
        return bare ? `${s.label} +` : `${s.label} — ${hit.value}`;
      }
    );
    const negatives = PICCLE.filter((s) => piccleHits.get(s.key)?.normal);

    // Saying "PICCLE" at all addresses the group, so nothing is outstanding once it has been
    // said — a clear negative covers the seven, and an unclear one is printed in the speaker's
    // own words for the reader to judge. Naming the seven as "not recorded" underneath a
    // sentence that just discussed them would contradict itself.
    const notRecorded = group
      ? []
      : PICCLE.filter((s) => !piccleHits.has(s.key)).map((s) => s.label);

    let text: string;
    if (positives.length === 0) text = group && !group.normal ? `PICCLE — ${group.value}` : "PICCLE";
    else if (negatives.length > 0 || group?.normal) text = `${positives.join(" · ")} · rest PICCLE`;
    else text = positives.join(" · ");

    piccle = { text, notRecorded };
  }

  return { vitals, piccle, findings, labs, normalLabCount, normalCount };
}

/** The calendar day an instant falls on in IST — the day the round actually happened. */
const istDay = (iso: string) =>
  new Date(iso).toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });

/**
 * "3 d ago", or null for anything recorded today.
 *
 * A haemoglobin of 7 means something different depending on whether it was this morning or last
 * Tuesday, and a screen headed "Current progress" would otherwise imply the former. Only shown
 * once it is no longer today, so the common case stays uncluttered.
 */
function agoLabel(recordedAt: string | null, now: Date): string | null {
  if (!recordedAt) return null;
  const then = istDay(recordedAt);
  const today = istDay(now.toISOString());
  if (then === today) return null;
  const days = Math.round(
    (Date.parse(`${today}T00:00:00Z`) - Date.parse(`${then}T00:00:00Z`)) / 86400000
  );
  if (!Number.isFinite(days) || days <= 0) return null;
  return days === 1 ? "yesterday" : `${days} d ago`;
}
