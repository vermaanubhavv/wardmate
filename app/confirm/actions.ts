"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

/**
 * Confirming from the whole-ward queue. Every write is scoped to `needs_confirmation = true`
 * and `confirmed_at is null`, so a stale screen can only ever confirm something that is still
 * genuinely outstanding, and row security keeps it to this doctor's own wards.
 */
function revalidateEverywhere() {
  revalidatePath("/confirm");
  revalidatePath("/todo");
  revalidatePath("/handover");
  revalidatePath("/");
  revalidatePath("/ward");
}

async function currentUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, user };
}

export async function confirmMany(ids: string[]): Promise<{ ok: boolean; error?: string }> {
  const clean = ids.filter(Boolean);
  if (clean.length === 0) return { ok: true };

  const { supabase, user } = await currentUser();
  if (!user) return { ok: false, error: "Not signed in." };

  const { error } = await supabase
    .from("observations")
    .update({ confirmed_at: new Date().toISOString(), confirmed_by: user.id })
    .in("id", clean)
    .eq("needs_confirmation", true)
    .is("confirmed_at", null);

  if (error) return { ok: false, error: error.message };
  revalidateEverywhere();
  return { ok: true };
}

export async function confirmAllPending(patientIds: string[]): Promise<{ ok: boolean; error?: string }> {
  if (patientIds.length === 0) return { ok: true };
  const { supabase, user } = await currentUser();
  if (!user) return { ok: false, error: "Not signed in." };

  const { data: rows } = await supabase
    .from("observations")
    .select("id")
    .in("patient_id", patientIds)
    .eq("needs_confirmation", true)
    .is("confirmed_at", null);

  const ids = (rows ?? []).map((r) => r.id as string);
  return confirmMany(ids);
}

/** A correction from the queue — same rule as the patient page: an emptied value deletes the
 *  observation, any other value is stored and confirmed in one step, and the correction is fed
 *  back to the mis-hearing dictionary. */
export async function editAndConfirm(
  id: string,
  newValue: string
): Promise<{ ok: boolean; error?: string }> {
  const value = newValue.trim();
  const { supabase, user } = await currentUser();
  if (!user) return { ok: false, error: "Not signed in." };

  if (!value) {
    const { error } = await supabase.from("observations").delete().eq("id", id);
    if (error) return { ok: false, error: error.message };
  } else {
    const { error } = await supabase
      .from("observations")
      .update({
        value_text: value,
        needs_confirmation: false,
        confirmed_at: new Date().toISOString(),
        confirmed_by: user.id,
      })
      .eq("id", id);
    if (error) return { ok: false, error: error.message };
  }

  revalidateEverywhere();
  return { ok: true };
}

/** It should not have been recorded — a false start, a stray phrase. Removes it outright. */
export async function discardPending(id: string): Promise<{ ok: boolean; error?: string }> {
  const { supabase, user } = await currentUser();
  if (!user) return { ok: false, error: "Not signed in." };

  const { error } = await supabase
    .from("observations")
    .delete()
    .eq("id", id)
    .eq("needs_confirmation", true)
    .is("confirmed_at", null);

  if (error) return { ok: false, error: error.message };
  revalidateEverywhere();
  return { ok: true };
}
