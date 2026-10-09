import { getSpecialtyPack } from "@/lib/specialty";

/** The Medications card's one-tap drugs, per department. Shared with the server action, which
 *  saves a line that still reads exactly like any of these as needing confirmation — a preset
 *  dose is a default, not something the resident said. */

/** Every department without a list of its own — what every unit offered before per-department sets. */
const SURGICAL_PRESETS = [
  "Inj Ceftriaxone 1 g IV BD",
  "Inj Metronidazole 500 mg IV TDS",
  "Inj Pantoprazole 40 mg IV OD",
  "Inj Ondansetron 4 mg IV TDS",
  "Inj Paracetamol 1 g IV SOS",
  "Tab Paracetamol 650 mg PO TDS",
  "Inj Tramadol 50 mg IV SOS",
  "Inj Enoxaparin 40 mg SC OD",
  "IV fluids — RL / DNS alternately",
  "Inj Insulin (sliding scale)",
  "Nebulisation — Duolin / Budecort",
];

/** No NSAID here: a medicine ward's patients are the ones with the kidneys and the gut bleeds. */
const MEDICINE_PRESETS = [
  "Inj Pantoprazole 40 mg IV OD",
  "Tab Paracetamol 650 mg PO SOS",
  "Inj Ceftriaxone 1 g IV BD",
  "Inj Insulin (sliding scale)",
  "Inj Enoxaparin 40 mg SC OD",
  "Nebulisation — Duolin / Budecort",
];

/** No department: the drugs any ward charts, no antibiotic or NSAID by default. */
const GENERAL_PRESETS = [
  "Inj Pantoprazole 40 mg IV OD",
  "Tab Paracetamol 650 mg PO SOS",
  "Inj Ondansetron 4 mg IV SOS",
  "IV fluids — NS / RL",
  "Inj Insulin (sliding scale)",
  "Inj Enoxaparin 40 mg SC OD",
];

const BY_SPECIALTY: Record<string, string[]> = {
  general: GENERAL_PRESETS,
  internal_medicine: MEDICINE_PRESETS,
};

/** The chips this ward's Medications card offers. An unknown department is the general set. */
export function medPresetsFor(specialty: string | null | undefined): string[] {
  const key = getSpecialtyPack(specialty).key;
  return BY_SPECIALTY[key] ?? SURGICAL_PRESETS;
}

/** Every preset on any ward — what the server action treats as an unconfirmed default, so a
 *  chip saves amber whichever ward offered it. */
export const MED_PRESETS = Array.from(new Set([SURGICAL_PRESETS, ...Object.values(BY_SPECIALTY)].flat()));
