import { generalSurgeryPack } from "./general-surgery";
import { internalMedicinePack } from "./internal-medicine";
import { medicalOncologyPack } from "./medical-oncology";
import { SPECIALTY_KEYS, type SpecialtyKey, type SpecialtyPack } from "./types";

export * from "./types";
export { generalSurgeryPack, medicalOncologyPack, internalMedicinePack };

const PACKS: Record<SpecialtyKey, SpecialtyPack> = {
  general_surgery: generalSurgeryPack,
  medical_oncology: medicalOncologyPack,
  internal_medicine: internalMedicinePack,
};

/**
 * The pack for a unit. NEVER throws and never returns null.
 *
 * Anything unrecognised — an empty string, a specialty from a newer deploy, or `undefined`
 * because patch 0060 has not been run and the column does not exist yet — gets the surgery
 * pack, which is exactly how the app behaved before this folder existed. Degrade, don't crash.
 */
export function getSpecialtyPack(key: string | null | undefined): SpecialtyPack {
  const k = (key ?? "").trim().toLowerCase();
  return PACKS[k as SpecialtyKey] ?? generalSurgeryPack;
}

export function isSpecialtyKey(key: string | null | undefined): key is SpecialtyKey {
  return SPECIALTY_KEYS.includes((key ?? "") as SpecialtyKey);
}

/** Every pack, for the picker at unit setup. */
export function listSpecialties(): SpecialtyPack[] {
  return SPECIALTY_KEYS.map((k) => PACKS[k]);
}

/**
 * Is the specialty picker switched on?
 *
 * Off by default. With the flag off the picker is hidden and every new unit is created as
 * general surgery — the packs still exist and still work, they are simply unreachable. This is
 * how the oncology pack ships dark, gets piloted on one real unit, and is then turned on.
 */
export function specialtyPacksEnabled(): boolean {
  return process.env.SPECIALTY_PACKS === "on";
}
