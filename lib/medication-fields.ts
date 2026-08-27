/**
 * A dictated medication, read apart into the fields a discharge prescription actually needs:
 * dose, frequency, duration, route, and the quantity to dispense.
 *
 * The shape comes from the hospital's own prescribing screen (ESIC's ClientSide_Prescriptions),
 * which wants Medication / Dose / Duration / Frequency / Qty / Route of Admin as six separate
 * columns. WardMate stores what the resident SAID — "PCM 1 gram IV TDS" — as one string, per
 * lib/extract.ts rule 3, which deliberately refuses to normalise or split anything on the way
 * in. So the splitting happens here, at read time, against the stored words.
 *
 * THE RULE THIS FILE KEEPS: every field is either read out of the resident's own words or left
 * null. Nothing is defaulted, assumed, or filled in with what a drug is "usually" given as —
 * an unstated route stays blank for a human to write, it never becomes ORAL because most
 * things are oral. A blank column on a form somebody signs is a question; a plausible guess is
 * a lie that reads exactly like a fact.
 */

export type FrequencyCode = {
  /** What the prescribing screen shows — "OD - Once a Day". */
  label: string;
  /** Doses per day, for working out the quantity to dispense. Null where the frequency does
   *  not imply a fixed daily count (SOS, STAT), which is exactly when quantity must stay
   *  blank rather than be invented. */
  perDay: number | null;
};

const FREQUENCIES: { pattern: RegExp; code: FrequencyCode }[] = [
  { pattern: /\b(od|once daily|once a day|o\.d\.)\b/i, code: { label: "OD - Once a Day", perDay: 1 } },
  { pattern: /\b(bd|bid|twice daily|twice a day|b\.d\.)\b/i, code: { label: "BD - 2 times a day", perDay: 2 } },
  { pattern: /\b(tds|tid|thrice daily|three times a day|t\.d\.s\.)\b/i, code: { label: "TDS - 3 times a day", perDay: 3 } },
  { pattern: /\b(qid|qds|four times a day)\b/i, code: { label: "QID - 4 times a day", perDay: 4 } },
  { pattern: /\b(hs|at bedtime|at night|nocte)\b/i, code: { label: "HS - At bedtime", perDay: 1 } },
  { pattern: /\bq4h\b/i, code: { label: "Q4H - Every 4 hours", perDay: 6 } },
  { pattern: /\bq6h\b/i, code: { label: "Q6H - Every 6 hours", perDay: 4 } },
  { pattern: /\bq8h\b/i, code: { label: "Q8H - Every 8 hours", perDay: 3 } },
  { pattern: /\bq12h\b/i, code: { label: "Q12H - Every 12 hours", perDay: 2 } },
  // No fixed daily count on purpose — see FrequencyCode.perDay.
  { pattern: /\b(sos|prn|as needed|if required)\b/i, code: { label: "SOS - As needed", perDay: null } },
  { pattern: /\b(stat|immediately)\b/i, code: { label: "STAT - Immediately", perDay: null } },
];

/** Written the way the prescribing screen writes them — "ORAL / BY MOUTH", not "PO". */
const ROUTES: { pattern: RegExp; label: string }[] = [
  { pattern: /\b(iv|intravenous)\b/i, label: "INTRAVENOUS / IV" },
  { pattern: /\b(im|intramuscular)\b/i, label: "INTRAMUSCULAR / IM" },
  { pattern: /\b(s\/?c|subcut\w*|subcutaneous)\b/i, label: "SUBCUTANEOUS / SC" },
  { pattern: /\b(po|oral|orally|by mouth)\b/i, label: "ORAL / BY MOUTH" },
  { pattern: /\b(eye ?drops?|ophthalmic|e\/d)\b/i, label: "OPHTHALMIC / EYE" },
  { pattern: /\b(ear ?drops?|otic)\b/i, label: "OTIC / EAR" },
  { pattern: /\b(nasal|nose ?drops?|intranasal)\b/i, label: "NASAL" },
  { pattern: /\b(pr|per rectum|rectal|suppository)\b/i, label: "RECTAL" },
  { pattern: /\b(sl|sublingual)\b/i, label: "SUBLINGUAL" },
  { pattern: /\b(neb|nebulis\w*|nebuliz\w*|inhal\w*|mdi|puffs?)\b/i, label: "INHALATION" },
  { pattern: /\b(local|topical|apply|ointment|cream)\b/i, label: "TOPICAL / SKIN" },
];

/** A tablet count reads as "1 Tablet(s)" on the prescribing screen; a strength reads as it was
 *  said. Ordered so a countable form ("2 tablets") is preferred over a bare strength, since
 *  that is what the Dose column of a prescription actually means. */
const DOSE_COUNT =
  /\b(\d+(?:\.\d+)?)\s*(tablets?|tabs?|caps?|capsules?|drops?|puffs?|sprays?|vials?|amps?|ampoules?|units?|drams?|tsf|tsp|teaspoonfuls?|teaspoons?)\b/i;
const DOSE_STRENGTH = /\b(\d+(?:\.\d+)?)\s*(mg|mcg|µg|g|gram|grams|gm|ml|iu|units?)\b/i;

/** "for 7 days", "x 5 days", "7 days", "2 weeks". */
const DURATION = /\b(?:for\s+|x\s*)?(\d+)\s*(day|days|week|weeks|month|months)\b/i;

export type MedicationFields = {
  /** The drug as recorded — name, and whatever strength/form was said with it. */
  drug: string;
  dose: string | null;
  duration: string | null;
  frequency: string | null;
  /** Total to dispense. Only ever set when dose count, per-day frequency AND duration in days
   *  were all three actually stated — see quantityFor below. */
  quantity: string | null;
  route: string | null;
};

/**
 * Read a stored medication observation apart into prescription fields.
 *
 * `label` is the drug as extraction named it; `valueText` is the full phrase as spoken, which
 * usually repeats the drug and adds the rest ("PCM 1 gram IV TDS"). Both are searched, because
 * a resident may put the route or frequency in either.
 */
export function medicationFields(label: string, valueText: string | null): MedicationFields {
  const said = [valueText ?? "", label].filter(Boolean).join(" ");

  const frequency = FREQUENCIES.find((f) => f.pattern.test(said))?.code ?? null;
  const route = ROUTES.find((r) => r.pattern.test(said))?.label ?? null;

  // A countable form is what the Dose column wants ("1 Tablet(s)"); a bare strength is the
  // fallback, since "40mg" is still a more useful dose than nothing.
  const countMatch = said.match(DOSE_COUNT);
  const strengthMatch = said.match(DOSE_STRENGTH);
  const dose = countMatch
    ? `${countMatch[1]} ${titleCaseUnit(countMatch[2])}`
    : strengthMatch
      ? `${strengthMatch[1]} ${strengthMatch[2].toLowerCase()}`
      : null;

  const durationMatch = said.match(DURATION);
  const duration = durationMatch
    ? `${durationMatch[1]} ${durationUnit(durationMatch[2], Number(durationMatch[1]))}`
    : null;

  return {
    // The drug's own name, not the whole dictated phrase. Everything else the phrase carried —
    // dose, frequency, route, duration — now has its own column, so repeating the phrase here
    // left rows reading "4.5 grams IV TDS" in a column headed Medication, with the drug name
    // nowhere on the line.
    drug: label.trim() || (valueText ?? "").trim(),
    dose,
    duration,
    frequency: frequency?.label ?? null,
    quantity: quantityFor(countMatch, frequency, durationMatch),
    route,
  };
}

/**
 * The total to dispense — dose count × doses per day × days.
 *
 * Arithmetic on three things the resident actually said, the same way the post-op day count is
 * arithmetic on two recorded dates. It returns null the moment ANY of the three is missing or
 * does not imply a number: an SOS drug has no daily count, a duration in weeks is converted
 * but a duration nobody stated is not assumed to be seven days, and a strength ("40mg") is not
 * a countable dose so it cannot be multiplied into tablets.
 *
 * This is a number a pharmacy dispenses against, so partial data produces a blank column for a
 * human to fill, never a plausible-looking guess.
 */
function quantityFor(
  countMatch: RegExpMatchArray | null,
  frequency: FrequencyCode | null,
  durationMatch: RegExpMatchArray | null
): string | null {
  if (!countMatch || !frequency?.perDay || !durationMatch) return null;

  const perDose = Number(countMatch[1]);
  const days = daysFrom(Number(durationMatch[1]), durationMatch[2]);
  if (!Number.isFinite(perDose) || perDose <= 0 || days === null) return null;

  const total = perDose * frequency.perDay * days;
  // A fractional count cannot be dispensed as a whole unit, and rounding one would be this
  // file deciding something it was not told. Left blank instead.
  if (!Number.isInteger(total)) return null;

  return `${total} ${titleCaseUnit(countMatch[2])}`;
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

/** "tablets" → "Tablet(s)", matching how the prescribing screen writes a dose unit. */
function titleCaseUnit(unit: string): string {
  const singular = unit.toLowerCase().replace(/s$/, "");
  const expanded =
    singular === "tab" ? "tablet" : singular === "cap" ? "capsule" : singular === "amp" ? "ampoule" : singular;
  return `${expanded.charAt(0).toUpperCase()}${expanded.slice(1)}(s)`;
}

/** "1 Day", "7 Days" — pluralised against the number actually said, not blindly. */
function durationUnit(word: string, n: number): string {
  const singular = word.toLowerCase().replace(/s$/, "");
  const form = n === 1 ? singular : `${singular}s`;
  return `${form.charAt(0).toUpperCase()}${form.slice(1)}`;
}
