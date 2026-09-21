import { createClient } from "@/lib/supabase/server";
import { compareBeds, stripPatientHonorific } from "@/lib/patients";

/**
 * Every real conflict across the whole unit — two recordings that actually disagree
 * (`conflict_note` set), not the broader "a mis-hearing could get this wrong" set that
 * `needs_confirmation` alone marks. That broader queue stays exactly where it was, on each
 * patient's own page (app/patients/[id]/confirm-dictation.tsx) — it just no longer drives
 * this ward-wide screen or its nav badge, which is for the smaller, more pressing case: two
 * different values on record for the same thing, and nobody has said which one is right.
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
    .not("conflict_note", "is", null)
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

/** Just the count, for the badge on the ward screen's "Confirm" tile — conflicts only, the
 *  same narrower scope getWardPendingConfirmations reads above. */
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
    .is("confirmed_at", null)
    .not("conflict_note", "is", null);

  return count ?? 0;
}
