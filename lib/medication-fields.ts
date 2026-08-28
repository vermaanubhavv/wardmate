/**
 * A dictated medication, read apart into the fields a discharge prescription actually needs:
 * dose, frequency, duration, route, and the quantity to dispense.
 *
 * The shape comes from a hospital prescribing screen wanting Medication / Dose / Duration /
 * Frequency / Qty / Route of Admin as six separate columns. WardMate stores what the resident
 * SAID — "PCM 1 gram IV TDS" — as one string, per lib/extract.ts rule 3, which deliberately
 * refuses to normalise or split anything on the way in. So the splitting happens here, at read
 * time, against the stored words.
 *
 * This file emits NEUTRAL codes — "IV", "TDS", "tablet" — and knows about no hospital at all.
 * Turning those into one hospital's dropdown wording and option values is
 * lib/esic-prescription-codes.ts's job, so a second hospital is a second vocabulary file
 * rather than a rewrite of this parser.
 *
 * THE RULE THIS FILE KEEPS: every field is either read out of the resident's own words or left
 * null. Nothing is defaulted, assumed, or filled in with what a drug is "usually" given as —
 * an unstated route stays blank for a human to write, it never becomes ORAL because most
 * things are oral. A blank column on a form somebody signs is a question; a plausible guess is
 * a lie that reads exactly like a fact.
 */

/** Doses per day, for working out the quantity to dispense. Null where the frequency implies
 *  no fixed daily count (SOS, STAT), which is exactly when quantity must stay blank. */
const FREQUENCIES: { pattern: RegExp; code: string; perDay: number | null }[] = [
  { pattern: /\b(od|once daily|once a day|o\.d\.)\b/i, code: "OD", perDay: 1 },
  { pattern: /\b(bd|bid|twice daily|twice a day|b\.d\.)\b/i, code: "BD", perDay: 2 },
  { pattern: /\b(tds|tid|thrice daily|three times a day|t\.d\.s\.)\b/i, code: "TDS", perDay: 3 },
  { pattern: /\b(qid|qds|four times a day)\b/i, code: "QID", perDay: 4 },
  { pattern: /\b(hs|at bedtime|at night|nocte)\b/i, code: "HS", perDay: 1 },
  { pattern: /\bq4h\b/i, code: "Q4H", perDay: 6 },
  { pattern: /\bq6h\b/i, code: "Q6H", perDay: 4 },
  { pattern: /\bq8h\b/i, code: "Q8H", perDay: 3 },
  { pattern: /\bq12h\b/i, code: "Q12H", perDay: 2 },
  { pattern: /\b(sos|prn|as needed|if required)\b/i, code: "SOS", perDay: null },
  { pattern: /\b(stat|immediately)\b/i, code: "STAT", perDay: null },
];

const ROUTES: { pattern: RegExp; code: string }[] = [
  { pattern: /\b(iv|intravenous)\b/i, code: "IV" },
  { pattern: /\b(im|intramuscular)\b/i, code: "IM" },
  { pattern: /\b(s\/?c|subcut\w*|subcutaneous)\b/i, code: "SC" },
  { pattern: /\b(po|oral|orally|by mouth)\b/i, code: "PO" },
  { pattern: /\b(eye ?drops?|ophthalmic|e\/d)\b/i, code: "EYE" },
  { pattern: /\b(ear ?drops?|otic|aural)\b/i, code: "EAR" },
  { pattern: /\b(nasal|nose ?drops?|intranasal)\b/i, code: "NASAL" },
  { pattern: /\b(pr|per rectum|rectal|suppository)\b/i, code: "PR" },
  { pattern: /\b(sl|sublingual)\b/i, code: "SL" },
  { pattern: /\b(neb|nebulis\w*|nebuliz\w*|inhal\w*|mdi|puffs?)\b/i, code: "INH" },
  { pattern: /\b(local|topical|apply|ointment|cream)\b/i, code: "TOP" },
];

/** A countable form is what a prescription's Dose column means; a bare strength is the
 *  fallback, since "40mg" is still a more useful dose than nothing. */
const DOSE_COUNT_UNITS: { pattern: RegExp; code: string; display: string }[] = [
  { pattern: /tablets?|tabs?/i, code: "tablet", display: "Tablet(s)" },
  { pattern: /caps?|capsules?/i, code: "capsule", display: "Capsule(s)" },
  { pattern: /drops?/i, code: "drop", display: "Drop(s)" },
  { pattern: /vials?/i, code: "vial", display: "Vial(s)" },
  { pattern: /amps?|ampoules?/i, code: "ampoule", display: "Ampoule(s)" },
  { pattern: /sprays?/i, code: "spray", display: "Spray" },
  { pattern: /sachets?/i, code: "sachet", display: "Sachet(s)" },
  { pattern: /units?/i, code: "unit", display: "Unit" },
  { pattern: /drams?/i, code: "dram", display: "Dram" },
  { pattern: /tsf|tsp|teaspoonfuls?|teaspoons?/i, code: "teaspoon", display: "Teaspoon" },
  // No hospital-neutral equivalent problem here, but note: the ESIC list has no "Puff(s)" —
  // see lib/esic-prescription-codes.ts, which leaves that column blank rather than guessing
  // between Dose(s), Spray and Aerosol(s).
  { pattern: /puffs?/i, code: "puff", display: "Puff(s)" },
];

const DOSE_STRENGTH_UNITS: { pattern: RegExp; code: string; display: string }[] = [
  { pattern: /^mgs?$/i, code: "mg", display: "mg" },
  { pattern: /^(mcg|µg)$/i, code: "mcg", display: "mcg" },
  { pattern: /^(g|gm|grams?)$/i, code: "g", display: "gm" },
  { pattern: /^ml$/i, code: "ml", display: "ml" },
  { pattern: /^(iu|units?)$/i, code: "iu", display: "IU" },
];

const DOSE_COUNT =
  /\b(\d+(?:\.\d+)?)\s*(tablets?|tabs?|caps?|capsules?|drops?|puffs?|sprays?|vials?|amps?|ampoules?|units?|drams?|sachets?|tsf|tsp|teaspoonfuls?|teaspoons?)\b/i;
const DOSE_STRENGTH = /\b(\d+(?:\.\d+)?)\s*(mgs?|mcg|µg|gm|grams?|g|ml|iu|units?)\b/i;

/** "for 7 days", "x 5 days", "7 days", "2 weeks". */
const DURATION = /\b(?:for\s+|x\s*)?(\d+)\s*(day|days|week|weeks|month|months)\b/i;

export type MedicationFields = {
  /** The drug's own name. Everything else the dictated phrase carried has its own field. */
  drug: string;
  dose: string | null;
  /** Neutral unit code for the dose ("tablet", "mg"), for a hospital vocabulary to resolve. */
  doseUnitCode: string | null;
  duration: string | null;
  durationValue: number | null;
  durationUnitCode: string | null;
  frequency: string | null;
  frequencyCode: string | null;
  /** Total to dispense. Needs a dose count, a per-day frequency and a duration in days — see
   *  quantityFor below. */
  quantity: string | null;
  /** True when the duration was not dictated and the ward's standard discharge course was
   *  used instead. Lets a screen mark it as a default a doctor should look at, rather than
   *  passing it off as something that was said. */
  durationIsDefault: boolean;
  route: string | null;
  routeCode: string | null;
};

export function medicationFields(
  label: string,
  valueText: string | null,
  options?: {
    /** The ward's standard discharge course, used ONLY where the resident stated no duration.
     *  A duration they did state always wins — printing 7 days over a dictated "for 14 days"
     *  would be this file overruling a doctor on the length of a course. */
    defaultDurationDays?: number;
  }
): MedicationFields {
  const said = [valueText ?? "", label].filter(Boolean).join(" ");

  const freq = FREQUENCIES.find((f) => f.pattern.test(said)) ?? null;
  const route = ROUTES.find((r) => r.pattern.test(said)) ?? null;

  const countMatch = said.match(DOSE_COUNT);
  const strengthMatch = said.match(DOSE_STRENGTH);

  const countUnit = countMatch
    ? (DOSE_COUNT_UNITS.find((u) => u.pattern.test(countMatch[2])) ?? null)
    : null;
  const strengthUnit = strengthMatch
    ? (DOSE_STRENGTH_UNITS.find((u) => u.pattern.test(strengthMatch[2])) ?? null)
    : null;

  const dose = countMatch
    ? `${countMatch[1]} ${countUnit?.display ?? countMatch[2]}`
    : strengthMatch
      ? `${strengthMatch[1]} ${strengthUnit?.display ?? strengthMatch[2].toLowerCase()}`
      : null;

  const durationMatch = said.match(DURATION);
  const fallbackDays = options?.defaultDurationDays ?? null;
  const durationIsDefault = !durationMatch && fallbackDays !== null;

  const durationValue = durationMatch ? Number(durationMatch[1]) : fallbackDays;
  const durationUnitCode = durationMatch
    ? durationMatch[2].toLowerCase().replace(/s$/, "")
    : durationIsDefault
      ? "day"
      : null;

  return {
    // The drug's own name, not the whole dictated phrase — everything else the phrase carried
    // now has its own column, so repeating it here left rows reading "4.5 grams IV TDS" in a
    // column headed Medication, with the drug name nowhere on the line.
    drug: label.trim() || (valueText ?? "").trim(),
    dose,
    doseUnitCode: countUnit?.code ?? strengthUnit?.code ?? null,
    duration:
      durationValue !== null && durationUnitCode
        ? `${durationValue} ${durationUnit(durationUnitCode, durationValue)}`
        : null,
    durationValue,
    durationUnitCode,
    durationIsDefault,
    frequency: freq?.code ?? null,
    frequencyCode: freq?.code ?? null,
    quantity: quantityFor(countMatch, countUnit, freq?.perDay ?? null, durationValue, durationUnitCode),
    route: route?.code ?? null,
    routeCode: route?.code ?? null,
  };
}

/**
 * The total to dispense — dose count × doses per day × days.
 *
 * Arithmetic on three things the resident actually said, the same way the post-op day count is
 * arithmetic on two recorded dates. It returns null the moment ANY of the three is missing or
 * does not imply a number: an SOS drug has no daily count, a duration nobody stated is not
 * assumed to be seven days, and a strength ("40mg") is not a countable dose so it cannot be
 * multiplied into tablets.
 *
 * This is a number a pharmacy dispenses against, so partial data produces a blank column for a
 * human to fill, never a plausible-looking guess.
 */
function quantityFor(
  countMatch: RegExpMatchArray | null,
  countUnit: { display: string } | null,
  perDay: number | null,
  durationValue: number | null,
  durationUnitCode: string | null
): string | null {
  if (!countMatch || !perDay || durationValue === null || !durationUnitCode) return null;

  const perDose = Number(countMatch[1]);
  const days = daysFrom(durationValue, durationUnitCode);
  if (!Number.isFinite(perDose) || perDose <= 0 || days === null) return null;

  const total = perDose * perDay * days;
  // A fractional count cannot be dispensed as a whole unit, and rounding one would be this
  // file deciding something it was not told. Left blank instead.
  if (!Number.isInteger(total)) return null;

  return `${total} ${countUnit?.display ?? countMatch[2]}`;
}

function daysFrom(n: number, unit: string): number | null {
  if (!Number.isFinite(n) || n <= 0) return null;
  const u = unit.toLowerCase();
  if (u.startsWith("day")) return n;
  if (u.startsWith("week")) return n * 7;
  // Months are not a fixed number of days, and picking 30 would be an assumption a pharmacy
  // count would then be built on.
  return null;
}

/** "1 Day", "7 Days" — pluralised against the number actually said, not blindly. */
function durationUnit(word: string, n: number): string {
  const singular = word.toLowerCase().replace(/s$/, "");
  const form = n === 1 ? singular : `${singular}s`;
  return `${form.charAt(0).toUpperCase()}${form.slice(1)}`;
}
