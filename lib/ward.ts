import { createClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/auth";
import type { WardPatient } from "@/lib/patients";
import { compareBeds } from "@/lib/patients";

/**
 * The doctor's selected unit. A user who has not joined or created one has no current ward.
 */
export async function getCurrentWard() {
  const supabase = await createClient();

  // Two round trips, sent together, and NO auth call.
  //
  // Every trip to the database costs about 220ms from the server, whatever it asks for, so the
  // count of trips is the whole of the cost. This used to be three in a row — verify the user,
  // read their profile, read the ward — for about 660ms before the page had started.
  //
  // The profile row must be pinned to this user by id. Once a doctor joins a shared unit,
  // profiles_ward_read (patch 0018) lets them read every co-member's profile too, so an
  // unfiltered .maybeSingle() sees several rows and throws "multiple (or no) rows returned".
  // getUser() is React-cached for the request, so this is one verify call shared with the
  // rest of the render, not a new round trip per screen.
  const user = await getUser();
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("current_ward_id, wards!current_ward_id(id, name, owner_id, join_code, letterhead)")
    .eq("id", user?.id ?? "")
    .maybeSingle();

  // The embedded ward comes back as an object or, depending on how the relationship is
  // resolved, a one-element array. Both shapes are handled rather than assumed.
  const embedded = (profile as { wards?: unknown } | null)?.wards;
  const chosen = (Array.isArray(embedded) ? embedded[0] : embedded) as
    | { id: string; name: string; owner_id: string; join_code: string; letterhead: string | null }
    | undefined;

  if (chosen) return { ward: chosen, error: null };
  return { ward: null, error };
}

/**
 * The consultant in charge of a unit, as stored on the ward.
 *
 * A separate guarded read rather than a column on getCurrentWard's select: patch 0052 adds
 * `wards.consultant_in_charge`, and until it is run PostgREST rejects the whole select if the
 * column is named. On that error — and when nothing is stored — this returns null and callers
 * fall back to the seeded default for the unit number (see lib/unit-consultants.ts).
 */
export async function getWardConsultantStored(wardId: string): Promise<string | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("wards")
    .select("consultant_in_charge")
    .eq("id", wardId)
    .maybeSingle();
  if (error) return null;
  return ((data as { consultant_in_charge?: string | null } | null)?.consultant_in_charge) ?? null;
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
        "id, display_name, age_years, sex, bed, uhid_ip_no, mrd_no, primary_diagnosis, admitted_on, surgery_date, planned_surgery_date, post_op_day, admission_day, last_entry_at, template_family, template_variant, procedure_text, management, location"
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
