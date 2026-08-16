import { createClient } from "@/lib/supabase/server";
import type { WardPatient } from "@/lib/patients";
import { compareBeds } from "@/lib/patients";

/**
 * The doctor's current ward. Only one exists today; picking the oldest keeps the choice
 * stable once there are several, until a ward switcher is built.
 */
export async function getCurrentWard() {
  const supabase = await createClient();

  // The one the doctor last chose, if they still belong to it. Once somebody belongs to two
  // units "the oldest" stops being a sensible answer — a resident who joins a unit would
  // otherwise keep landing on the empty ward their account was created with.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("current_ward_id")
      .eq("id", user.id)
      .maybeSingle();

    if (profile?.current_ward_id) {
      // Read through wards, so row security is what decides they may still see it — a doctor
      // removed from a unit falls back rather than keeping it on screen.
      const { data: chosen } = await supabase
        .from("wards")
        .select("id, name, owner_id, join_code")
        .eq("id", profile.current_ward_id)
        .is("archived_at", null)
        .maybeSingle();

      if (chosen) return { ward: chosen, error: null };
    }
  }

  const { data, error } = await supabase
    .from("wards")
    .select("id, name, owner_id, join_code")
    .is("archived_at", null)
    .order("created_at")
    .limit(1)
    .maybeSingle();

  return { ward: data, error };
}

/** Every unit this doctor belongs to, for the switcher. */
export async function getMyWards() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("wards")
    .select("id, name, owner_id")
    .is("archived_at", null)
    .order("created_at");

  return data ?? [];
}

export async function getActivePatients(wardId: string) {
  const supabase = await createClient();

  const { data: patients, error } = await supabase
    .from("current_patients")
    .select(
      "id, display_name, age_years, sex, bed, primary_diagnosis, admitted_on, surgery_date, post_op_day, admission_day, last_entry_at, template_family, template_variant, procedure_text, management"
    )
    .eq("ward_id", wardId)
    .eq("status", "active");

  if (error || !patients) return { patients: [] as WardPatient[], error };

  // Which patients still have a number, drug or dose nobody has confirmed. Fetched as one
  // query over the whole ward rather than one per card.
  const { data: pending } = await supabase
    .from("observations")
    .select("patient_id")
    .in(
      "patient_id",
      patients.map((p) => p.id)
    )
    .eq("needs_confirmation", true)
    .is("confirmed_at", null);

  // Outstanding jobs, fetched for the whole ward in one query for the same reason.
  const { data: openPlans } = await supabase
    .from("observations")
    .select("patient_id")
    .in(
      "patient_id",
      patients.map((p) => p.id)
    )
    .eq("kind", "plan")
    .is("done_at", null);

  const counts = new Map<string, number>();
  for (const row of pending ?? []) {
    counts.set(row.patient_id, (counts.get(row.patient_id) ?? 0) + 1);
  }

  const taskCounts = new Map<string, number>();
  for (const row of openPlans ?? []) {
    taskCounts.set(row.patient_id, (taskCounts.get(row.patient_id) ?? 0) + 1);
  }

  const withFlags: WardPatient[] = patients.map((p) => ({
    ...p,
    unconfirmed_count: counts.get(p.id) ?? 0,
    open_task_count: taskCounts.get(p.id) ?? 0,
  }));

  withFlags.sort((a, b) => compareBeds(a.bed, b.bed));
  return { patients: withFlags, error: null };
}

/** How many patients are sitting in the removed list — the count on the way back. */
export async function getRemovedCount(wardId: string): Promise<number> {
  const supabase = await createClient();
  const { count } = await supabase
    .from("patients")
    .select("id", { count: "exact", head: true })
    .eq("ward_id", wardId)
    .eq("status", "discharged");

  return count ?? 0;
}

/** Diagnoses already used on this ward, most common first, to offer as typing suggestions. */
export async function getDiagnosisSuggestions(wardId: string): Promise<string[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("patients")
    .select("primary_diagnosis")
    .eq("ward_id", wardId)
    .not("primary_diagnosis", "is", null);

  const tally = new Map<string, number>();
  for (const row of data ?? []) {
    const d = row.primary_diagnosis?.trim();
    if (d) tally.set(d, (tally.get(d) ?? 0) + 1);
  }

  return [...tally.entries()].sort((a, b) => b[1] - a[1]).map(([d]) => d);
}
