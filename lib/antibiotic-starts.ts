import type { Supa } from "@/lib/supabase/server";
import { antibioticKey, isAntibiotic } from "@/lib/antibiotics";
import { istDate } from "@/lib/urgency";

/**
 * Each antibiotic's course start for one patient, by antibioticKey: its started_on, or the date
 * it was recorded for a row written before that column existed. Its own small query, so a
 * database without patch 0110 just shows no days rather than failing the page.
 */
export async function antibioticStarts(supabase: Supa, patientId: string): Promise<Record<string, string>> {
  const out: Record<string, string> = {};
  const withCol = await supabase
    .from("observations")
    .select("label, value_text, started_on, recorded_at")
    .eq("patient_id", patientId)
    .eq("kind", "medication")
    .order("recorded_at", { ascending: true });
  const rows = (withCol.error
    ? (await supabase.from("observations").select("label, value_text, recorded_at").eq("patient_id", patientId).eq("kind", "medication").order("recorded_at", { ascending: true })).data
    : withCol.data) as { label: string; value_text: string | null; started_on?: string | null; recorded_at: string }[] | null;
  // A start set on the card wins; otherwise the earliest date the drug was recorded.
  const set = new Set<string>();
  for (const r of rows ?? []) {
    const text = r.value_text ?? r.label;
    if (!isAntibiotic(text)) continue;
    const key = antibioticKey(text);
    if (r.started_on && !set.has(key)) {
      out[key] = r.started_on;
      set.add(key);
    } else if (!set.has(key)) out[key] ??= istDate(r.recorded_at);
  }
  return out;
}
