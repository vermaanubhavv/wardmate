import { drugKey } from "@/lib/drug-key";

/**
 * Which drug lines are antibiotics — so the treatment chart can print them in bold and carry
 * their day ("Inj Ceftriaxone 1 g IV BD (Day 3)").
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

/** "Inj Ceftriaxone 1 g IV BD" + Day 3 → "Inj Ceftriaxone 1 g IV BD (Day 3)" / "Day 3 – Inj…". */
export function withDay(line: string, day: number | null, position: AntibioticDayPosition): string {
  if (day === null || position === "off") return line;
  return position === "before" ? `Day ${day} – ${line}` : `${line} (Day ${day})`;
}

/** The YYYY-MM-DD a course would have started on for it to be Day `day` today. */
export function startForDay(day: number, todayIso: string): string {
  const t = Date.parse(`${todayIso.slice(0, 10)}T00:00:00Z`);
  return new Date(t - (Math.max(1, day) - 1) * 86_400_000).toISOString().slice(0, 10);
}
