import { getSpecialtyPack } from "./index";
import { hasOperationClock } from "./intake";
import type { DayCountPatient, SpecialtyPack } from "./types";
import { managementChoicesFor } from "@/lib/patients";

/**
 * Which day clocks a department counts by, read off the pack's own dayCount() — the same probe
 * hasOperationClock() uses — so no second list of department names has to be kept in step.
 */

/** Counts from a burn date (patch 0085's burn_date / burn_day). */
export function usesBurnClock(pack: SpecialtyPack): boolean {
  return pack.dayCount({ admission_day: 1, post_op_day: null, burn_day: 1 }).clock === "burn";
}

/** Counts chemotherapy cycle days (patch 0060's regimen / cycle columns). */
export function usesCycleClock(pack: SpecialtyPack): boolean {
  return pack.dayCount({ admission_day: 1, post_op_day: null, cycle_day: 1 }).clock === "cycle";
}

/**
 * Whether a select may name the chemotherapy columns. Not the cycle clock: every unit other
 * than general surgery was created after patch 0060 ran, so the columns are always there, and
 * the ward list and handover have always read them for any such unit. General surgery is the
 * one unit that may predate the patch.
 */
export function readsChemoColumns(pack: SpecialtyPack): boolean {
  return pack.key !== "general_surgery";
}

/** The extra columns this pack's day clock reads, beyond the shared select — "" for none. Only
 *  ever names columns a unit of this kind is guaranteed to have (see readsChemoColumns). */
export function clockColumns(pack: SpecialtyPack): string {
  if (usesBurnClock(pack)) return "burn_day";
  if (usesCycleClock(pack)) return "cycle_day, cycle_number";
  return "";
}

/** What the patient form calls its checklist box on this unit. */
export function checklistFieldLabel(specialty: string | null | undefined): string {
  const pack = getSpecialtyPack(specialty);
  if (usesCycleClock(pack)) return "Chemo cycle / checklist";
  return hasOperationClock(pack) ? "Operation" : "Checklist";
}

/**
 * The phase on the progress note's diagnosis line. A burn or chemotherapy clock prints as the
 * pack counts it ("PBD 4", "C2 D3"); otherwise an operated patient is "Post Op Day (n)" and
 * anyone else shows the resident's own management choice, as it always has.
 */
export function noteStatusLine(
  pack: SpecialtyPack,
  p: Partial<DayCountPatient> & {
    surgery_date: string | null;
    post_op_day: number | null;
    management: string | null;
  }
): string | null {
  const day = pack.dayCount({ ...p, admission_day: p.admission_day ?? 0 });
  if (day.clock === "burn" || day.clock === "cycle") return day.text;
  if (p.surgery_date) return `Post Op Day (${p.post_op_day ?? "—"})`;
  return managementChoicesFor(pack.key, p.management ?? "").find((c) => c.value === p.management)?.label ?? null;
}
