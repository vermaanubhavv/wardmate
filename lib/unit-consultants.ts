/**
 * The consultant in charge of each surgical unit.
 *
 * Set on the ward itself (`wards.consultant_in_charge`, patch 0052) and editable by the unit
 * owner on the Unit page. These are the seeded defaults, and also the fallback used when a
 * ward has no value stored but its name says which unit it is — so a discharge summary names a
 * consultant even before anyone has opened the setting.
 */
export const DEFAULT_UNIT_CONSULTANTS: Record<1 | 2 | 3 | 4, string> = {
  1: "Dr. Neeraj",
  2: "Dr. Vikas",
  3: "Dr. Shaji Thomas",
  4: "Dr. Vivek",
};

const ROMAN: Record<string, number> = { i: 1, ii: 2, iii: 3, iv: 4 };

/**
 * The unit number (1–4) written into a free-text ward name — "Unit 3", "UNIT-III",
 * "General Surgery Unit 2". Null when the name carries no unambiguous 1–4.
 */
export function unitNumberFromName(name: string | null | undefined): 1 | 2 | 3 | 4 | null {
  if (!name) return null;
  const s = name.toLowerCase();

  const arabic = s.match(/(?:^|[^a-z0-9])unit[ ._-]*([1-4])(?:[^0-9]|$)/);
  if (arabic) return Number(arabic[1]) as 1 | 2 | 3 | 4;

  const roman = s.match(/(?:^|[^a-z0-9])unit[ ._-]*(iv|iii|ii|i)(?:[^a-z]|$)/);
  if (roman) return ROMAN[roman[1]] as 1 | 2 | 3 | 4;

  return null;
}

/** The consultant for a ward: its stored value, else the default for the unit its name names. */
export function consultantForWard(
  storedConsultant: string | null | undefined,
  wardName: string | null | undefined
): string | null {
  const stored = storedConsultant?.trim();
  if (stored) return stored;
  const n = unitNumberFromName(wardName);
  return n ? DEFAULT_UNIT_CONSULTANTS[n] : null;
}
