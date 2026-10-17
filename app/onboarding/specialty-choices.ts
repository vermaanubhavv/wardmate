import { listSpecialties, specialtyPacksEnabled } from "@/lib/specialty";

/** The departments to offer at unit setup. Empty list = no picker, everything general surgery.
 *  Server-side because the flag is a server env var. */
export function specialtyChoices() {
  if (!specialtyPacksEnabled()) return [];
  return listSpecialties().map((p) => ({ key: p.key, label: p.label, blurb: p.blurb }));
}
