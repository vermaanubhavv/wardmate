import { createClient } from "@/lib/supabase/server";
import { compareBeds } from "@/lib/patients";
import { effectiveUrgency, urgencyRank, type Urgency } from "@/lib/urgency";
import { dedupeTasks } from "@/lib/dedupe-tasks";
import { isActionableTask } from "@/lib/task-classification";
import type { TaskCategory } from "@/lib/task-category";

export type WardTask = {
  id: string;
  patient_id: string;
  label: string;
  value_text: string | null;
  source_quote: string;
  urgency: Urgency;
  graded_at: string | null;
  recorded_at: string;
  /** Jev's stored bucket for the "By type" view (patch 0103); null = keywords decide. */
  task_category?: TaskCategory | "other" | null;
  patient: { display_name: string; bed: string };
  /** What the colour means today, once the calendar has been taken into account. */
  effective: Urgency;
  /** "due today", "2 days overdue" — null while it is still within its stated timeframe. */
  note: string | null;
  /** Earlier sayings of this same job, folded under it. Kept in the record, not shown twice. */
  repeats: number;
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

  // One round trip, not two: the ward's active patients are joined through rather than listed
  // first just to get ids to filter by — the same filter getActivePatients uses.
  const { data: joined } = await supabase
    .from("observations")
    .select(
      "id, patient_id, label, value_text, source_quote, urgency, graded_at, recorded_at, task_open, task_category, patients!inner(id, display_name, bed, ward_id, status)"
    )
    .eq("patients.ward_id", wardId)
    .eq("patients.status", "active")
    .eq("kind", "plan")
    .is("done_at", null)
    // Newest first, which is what folding repeats relies on.
    .order("recorded_at", { ascending: false });

  const byId = new Map<string, { id: string; display_name: string; bed: string }>();
  const tasks = ((joined ?? []) as unknown as {
    id: string;
    patient_id: string;
    label: string;
    value_text: string | null;
    source_quote: string;
    urgency: string;
    graded_at: string | null;
    recorded_at: string;
    task_open: boolean | null;
    task_category: TaskCategory | "other" | null;
    patients: { id: string; display_name: string; bed: string };
  }[]).map(({ patients: p, ...t }) => {
    byId.set(p.id, { id: p.id, display_name: p.display_name, bed: p.bed });
    return t;
  });

  // Repeats folded per patient, never across the ward: two patients both needing a drain out
  // are two jobs, and merging them would hide one entirely.
  const byPatientTasks = new Map<string, NonNullable<typeof tasks>>();
  for (const t of (tasks ?? []).filter((t) => isActionableTask(t.value_text ?? t.label, t.task_open))) {
    const list = byPatientTasks.get(t.patient_id) ?? [];
    list.push(t);
    byPatientTasks.set(t.patient_id, list);
  }

  const folded = [...byPatientTasks.values()].flatMap((list) =>
    dedupeTasks(list).map(({ task, repeats }) => ({ ...task, repeats: repeats.length }))
  );

  const out: WardTask[] = [];
  for (const t of folded) {
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
