import { createClient } from "@/lib/supabase/server";
import { compareBeds, stripPatientHonorific } from "@/lib/patients";

/**
 * Everything still waiting to be confirmed across the whole unit — the numbers, drug names and
 * bed references a mis-hearing could get dangerously wrong, from every active patient at once.
 *
 * The patient page already shows each patient's own pending list; this is the end-of-round
 * version of the same question — "what have I not checked yet, anywhere" — so it can all be
 * cleared from one screen instead of opening thirty records.
 */
export type PendingConfirm = {
  id: string;
  patient_id: string;
  patient_name: string;
  bed: string;
  kind: string;
  label: string;
  value_text: string | null;
  source_quote: string;
  conflict_note: string | null;
  recorded_at: string;
};

export async function getWardPendingConfirmations(wardId: string): Promise<PendingConfirm[]> {
  const supabase = await createClient();

  const { data: patients } = await supabase
    .from("patients")
    .select("id, display_name, bed")
    .eq("ward_id", wardId)
    .eq("status", "active");
  if (!patients || patients.length === 0) return [];

  const byId = new Map(patients.map((p) => [p.id, p]));

  const { data: rows } = await supabase
    .from("observations")
    .select("id, patient_id, kind, label, value_text, source_quote, conflict_note, recorded_at")
    .in(
      "patient_id",
      patients.map((p) => p.id)
    )
    .eq("needs_confirmation", true)
    .is("confirmed_at", null)
    .order("recorded_at", { ascending: false });

  return (rows ?? [])
    .filter((r) => byId.has(r.patient_id))
    .map((r) => {
      const p = byId.get(r.patient_id)!;
      return {
        id: r.id as string,
        patient_id: r.patient_id as string,
        patient_name: stripPatientHonorific(p.display_name),
        bed: p.bed ?? "—",
        kind: r.kind as string,
        label: r.label as string,
        value_text: r.value_text as string | null,
        source_quote: r.source_quote as string,
        conflict_note: r.conflict_note as string | null,
        recorded_at: r.recorded_at as string,
      };
    })
    .sort((a, b) => compareBeds(a.bed, b.bed) || a.recorded_at.localeCompare(b.recorded_at));
}

/** Just the count, for the badge on the ward screen's "Confirm" tile. */
export async function countWardPendingConfirmations(wardId: string): Promise<number> {
  const supabase = await createClient();
  const { data: patients } = await supabase
    .from("patients")
    .select("id")
    .eq("ward_id", wardId)
    .eq("status", "active");
  if (!patients || patients.length === 0) return 0;

  const { count } = await supabase
    .from("observations")
    .select("id", { count: "exact", head: true })
    .in(
      "patient_id",
      patients.map((p) => p.id)
    )
    .eq("needs_confirmation", true)
    .is("confirmed_at", null);

  return count ?? 0;
}
