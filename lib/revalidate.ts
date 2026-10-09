import { revalidatePath } from "next/cache";

/**
 * After a write to a patient's values: their page (when there is one), any extra paths the caller
 * names, and the screens that list values across patients.
 *
 * Not "/": the home screen only counts patients by location, which none of these writes change.
 * Revalidating it would just make the next visit there pay for a re-render that shows exactly
 * what it already showed. "/ward" stays — open tasks, unconfirmed counts and the worst-flag
 * badge all live on the ward list.
 */
export function revalidatePatient(patientId: string | null, ...extraPaths: string[]) {
  if (patientId) revalidatePath(`/patients/${patientId}`);
  for (const p of extraPaths) revalidatePath(p);
  revalidatePath("/todo");
  revalidatePath("/handover");
  revalidatePath("/ward");
}
