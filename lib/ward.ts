import { createClient } from "@/lib/supabase/server";
import type { WardPatient } from "@/lib/patients";
import { compareBeds } from "@/lib/patients";

/**
 * The doctor's current ward. Only one exists today; picking the oldest keeps the choice
 * stable once there are several, until a ward switcher is built.
 */
export async function getCurrentWard() {
  const supabase = await createClient();

  // Two round trips, sent together, and NO auth call.
  //
  // Every trip to the database costs about 220ms from the server, whatever it asks for, so the
  // count of trips is the whole of the cost. This used to be three in a row — verify the user,
  // read their profile, read the ward — for about 660ms before the page had started.
  //
  // getUser() is gone from the read path because nothing here needed it. It is a network call
  // that asks Supabase to verify the token, and the only thing its answer was used for was to
  // name the doctor's own profile row — which row security already restricts to exactly that
  // row. Asking "which profiles may I see" returns one: theirs. The token is still verified,
  // by the database, on every one of these queries.
  //
  // The fallback ward is fetched at the same time rather than after finding no preference,
  // because a second trip costs more than a query that is usually discarded.
  const [{ data: profile }, { data: firstWard, error }] = await Promise.all([
    supabase
      .from("profiles")
      .select("current_ward_id, wards!current_ward_id(id, name, owner_id, join_code, letterhead)")
      .maybeSingle(),
    supabase
      .from("wards")
      .select("id, name, owner_id, join_code, letterhead")
      .is("archived_at", null)
      .order("created_at")
      .limit(1)
      .maybeSingle(),
  ]);

  // The embedded ward comes back as an object or, depending on how the relationship is
  // resolved, a one-element array. Both shapes are handled rather than assumed.
  const embedded = (profile as { wards?: unknown } | null)?.wards;
  const chosen = (Array.isArray(embedded) ? embedded[0] : embedded) as
    | { id: string; name: string; owner_id: string; join_code: string; letterhead: string | null }
    | undefined;

  if (chosen) return { ward: chosen, error: null };
  return { ward: firstWard, error };
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

  // Both queries go out together. The badge counts used to wait for the patient list purely
  // to get its ids to filter by; joining through patients lets the ward be named directly, so
  // the two round trips overlap instead of queueing — and the two count queries become one,
  // since a row can be tallied into either bucket here rather than by the database twice.
  const [{ data: patients, error }, { data: flags }, { data: entryRows }] = await Promise.all([
    supabase
      .from("current_patients")
      .select(
        "id, display_name, age_years, sex, bed, primary_diagnosis, admitted_on, surgery_date, planned_surgery_date, post_op_day, admission_day, last_entry_at, template_family, template_variant, procedure_text, management"
      )
      .eq("ward_id", wardId)
      .eq("status", "active"),
    supabase
      .from("observations")
      .select("patient_id, kind, needs_confirmation, confirmed_at, done_at, patients!inner(ward_id, status)")
      .eq("patients.ward_id", wardId)
      .eq("patients.status", "active"),
    // How much is on each record. Only used to tell the resident what a permanent delete
    // would destroy — a number in that confirmation is the difference between "are you sure"
    // and knowing what is at stake.
    supabase
      .from("entries")
      .select("patient_id, patients!inner(ward_id, status)")
      .eq("patients.ward_id", wardId)
      .eq("patients.status", "active"),
  ]);

  if (error || !patients) return { patients: [] as WardPatient[], error };

  const counts = new Map<string, number>();
  const taskCounts = new Map<string, number>();

  for (const row of (flags ?? []) as unknown as {
    patient_id: string;
    kind: string;
    needs_confirmation: boolean;
    confirmed_at: string | null;
    done_at: string | null;
  }[]) {
    if (row.needs_confirmation && !row.confirmed_at) {
      counts.set(row.patient_id, (counts.get(row.patient_id) ?? 0) + 1);
    }
    if (row.kind === "plan" && !row.done_at) {
      taskCounts.set(row.patient_id, (taskCounts.get(row.patient_id) ?? 0) + 1);
    }
  }

  const entryCounts = new Map<string, number>();
  for (const row of (entryRows ?? []) as unknown as { patient_id: string }[]) {
    entryCounts.set(row.patient_id, (entryCounts.get(row.patient_id) ?? 0) + 1);
  }

  const withFlags: WardPatient[] = patients.map((p) => ({
    ...p,
    unconfirmed_count: counts.get(p.id) ?? 0,
    open_task_count: taskCounts.get(p.id) ?? 0,
    entry_count: entryCounts.get(p.id) ?? 0,
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
