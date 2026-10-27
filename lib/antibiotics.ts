import { drugKey } from "@/lib/drug-key";

/**
 * Which drug lines are antibiotics — so the treatment chart can print them in bold and carry
 * their day ("Inj Ceftriaxone 1 g IV BD (Day 3)") — and which drugs run for a set number of
 * days, which carry theirs as "D2/5".
 *
 * By name, no model call: generics by their class stems (-cillin, cef-, -penem, -mycin,
 * -floxacin, -cycline) plus the ones that have no stem, and the Indian brand names wards
 * actually say. Antifungals, antivirals and ATT are not on it. To add one: put its generic or
 * brand name, lowercase, in NAMES.
 */

const STEMS = /\b(\w*cillin|cef\w+|ceph\w+|\w*penem|\w*floxacin|\w*cycline)\b/i;
const NAMES = new Set([
  // generics without a class stem
  "vancomycin", "teicoplanin", "linezolid", "clindamycin", "azithromycin", "clarithromycin",
  "erythromycin", "gentamicin", "amikacin", "tobramycin", "streptomycin", "metronidazole",
  "tinidazole", "ornidazole", "colistin", "polymyxin", "aztreonam", "cotrimoxazole",
  "trimoxazole", "nitrofurantoin", "fosfomycin", "chloramphenicol", "rifaximin",
  "piperacillin-tazobactam", "amoxicillin-clavulanate", "cefoperazone-sulbactam", "sulbactam",
  // brand names said on Indian wards
  "monocef", "magnex", "augmentin", "amoxyclav", "co-amoxiclav", "piptaz", "tazact", "zosyn",
  "metrogyl", "flagyl", "taxim", "cifran", "ciplox", "azee", "zithrox", "meronem", "merotrol",
  "septran", "bactrim", "niftran", "sulbacin", "lizolid", "vancoplus", "mikacin", "genticyn",
]);

/** The drug name of a chart line: "Inj Ceftriaxone 1 g IV BD" → "ceftriaxone". The same cut
 *  replaceActiveMedications labels a line by — up to the first digit or comma. */
export function antibioticKey(line: string): string {
  return drugKey((line.split(/[,0-9]/)[0] || line).trim());
}

export function isAntibiotic(line: string): boolean {
  const name = antibioticKey(line);
  if (!name) return false;
  if (NAMES.has(name) || name.split(" ").some((w) => NAMES.has(w))) return true;
  return STEMS.test(name);
}

export type AntibioticDayPosition = "off" | "before" | "after";
export const ANTIBIOTIC_DAY_COOKIE = "abx_day";

export function readDayPosition(raw: string | undefined | null): AntibioticDayPosition {
  return raw === "off" || raw === "before" ? raw : "after";
}

/** Calendar day N of a course started on `startedOn` (YYYY-MM-DD), counted in IST: the start
 *  date is Day 1. Null when the date is unreadable or in the future. */
export function antibioticDay(startedOn: string, todayIso: string): number | null {
  const start = Date.parse(`${startedOn.slice(0, 10)}T00:00:00Z`);
  const today = Date.parse(`${todayIso.slice(0, 10)}T00:00:00Z`);
  if (Number.isNaN(start) || Number.isNaN(today) || today < start) return null;
  return Math.round((today - start) / 86_400_000) + 1;
}

const WORD_NUM: Record<string, number> = { one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, fourteen: 14 };

/** A course length written on the drug line, in days: "for 5 days", "x 5 days", "× 5 days",
 *  "5/7", "for 2 weeks", "for five days". Null when the line gives none — never guessed. */
export function courseLength(line: string): number | null {
  const m =
    line.match(/(?:\bfor|\bx|×)\s*(\d+|[a-z]+)\s*(days?|weeks?|wks?)\b/i) ??
    line.match(/(?:^|\s)(?:x|×|for)?\s*(\d+)\s*\/\s*(7)\b/i);
  if (!m) return null;
  const n = /^\d+$/.test(m[1]) ? parseInt(m[1], 10) : WORD_NUM[m[1].toLowerCase()];
  if (!n) return null;
  return /^w/i.test(m[2]) ? n * 7 : n;
}

// Not antibiotics, but given only for a stretch, so they count their day even with no length
// written. Not bold — bold is for antibiotics.
const COUNTED = /\b(albumin)\b/i;

/** A drug whose day is counted: every antibiotic, IV albumin, and any drug given for a set
 *  number of days ("Inj Albumin for 5 days", "Inj Vitamin K 10 mg IM OD for 5 days"). */
export function isCourse(line: string): boolean {
  return isAntibiotic(line) || COUNTED.test(antibioticKey(line)) || courseLength(line) !== null;
}

/** The day label: "D2/5" for a set course, "Day 3" for an antibiotic with no set length. */
export function dayLabel(line: string, day: number): string {
  const total = courseLength(line);
  return total ? `D${day}/${total}` : `Day ${day}`;
}

/** "Inj Vitamin K 10 mg IM OD for 5 days" + day 2 → "… for 5 days (D2/5)" / "D2/5 – Inj…";
 *  "Inj Ceftriaxone 1 g IV BD" + day 3 → "… (Day 3)" / "Day 3 – Inj…". */
export function withDay(line: string, day: number | null, position: AntibioticDayPosition): string {
  if (day === null || position === "off") return line;
  const label = dayLabel(line, day);
  return position === "before" ? `${label} – ${line}` : `${line} (${label})`;
}

/** The YYYY-MM-DD a course would have started on for it to be Day `day` today. */
export function startForDay(day: number, todayIso: string): string {
  const t = Date.parse(`${todayIso.slice(0, 10)}T00:00:00Z`);
  return new Date(t - (Math.max(1, day) - 1) * 86_400_000).toISOString().slice(0, 10);
}
