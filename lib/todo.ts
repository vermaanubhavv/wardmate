import { createClient } from "@/lib/supabase/server";
import { compareBeds } from "@/lib/patients";
import { effectiveUrgency, urgencyRank, type Urgency } from "@/lib/urgency";

export type WardTask = {
  id: string;
  patient_id: string;
  label: string;
  value_text: string | null;
  source_quote: string;
  urgency: Urgency;
  graded_at: string | null;
  recorded_at: string;
  patient: { display_name: string; bed: string };
  /** What the colour means today, once the calendar has been taken into account. */
  effective: Urgency;
  /** "due today", "2 days overdue" — null while it is still within its stated timeframe. */
  note: string | null;
};

/**
 * Every job still outstanding across the whole unit, most urgent first.
 *
 * The ward list answers "what is left on this patient"; this answers "what is left, full
 * stop" — the question actually being asked when the round is over and there are two hours
 * before handover. Beds order the ties, so working down the list is still a walk.
 */
export async function getWardTasks(wardId: string): Promise<WardTask[]> {
  const supabase = await createClient();

  const { data: patients } = await supabase
    .from("patients")
    .select("id, display_name, bed")
    .eq("ward_id", wardId)
    .eq("status", "active");

  if (!patients || patients.length === 0) return [];

  const byId = new Map(patients.map((p) => [p.id, p]));

  const { data: tasks } = await supabase
    .from("observations")
    .select("id, patient_id, label, value_text, source_quote, urgency, graded_at, recorded_at")
    .in(
      "patient_id",
      patients.map((p) => p.id)
    )
    .eq("kind", "plan")
    .is("done_at", null);

  const out: WardTask[] = [];
  for (const t of tasks ?? []) {
    const patient = byId.get(t.patient_id);
    if (!patient) continue;

    // Worked out once here, so the grouping, the sort and the row all agree about what
    // colour a job is today.
    const effective = effectiveUrgency({
      urgency: t.urgency as Urgency,
      graded_at: t.graded_at,
      recorded_at: t.recorded_at,
    });

    out.push({
      ...t,
      urgency: t.urgency as Urgency,
      patient,
      effective: effective.urgency,
      note: effective.note,
    });
  }

  out.sort((a, b) => {
    const byUrgency = urgencyRank(a.effective) - urgencyRank(b.effective);
    if (byUrgency !== 0) return byUrgency;
    return compareBeds(a.patient.bed, b.patient.bed);
  });

  return out;
}
