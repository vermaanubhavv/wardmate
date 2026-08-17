"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type JoinState = { error: string | null; joined?: string };

/**
 * Join a unit with its code.
 *
 * The insert happens inside join_ward_by_code, which is security definer precisely because
 * the caller is not yet a member and every policy on ward_members correctly forbids them
 * writing one. That function adds the caller and nobody else, always as a member and never
 * as an owner — see 0018.
 */
export async function joinWard(_prev: JoinState, formData: FormData): Promise<JoinState> {
  const code = String(formData.get("code") ?? "").trim().toUpperCase();
  if (!code) return { error: "Enter the code." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You are signed out. Sign in again." };

  const { data, error } = await supabase.rpc("join_ward_by_code", { code });

  if (error) return { error: error.message };
  if (!data) return { error: "No unit has that code. Check it and try again." };

  revalidatePath("/");
  revalidatePath("/unit");
  redirect("/");
}

/**
 * Rename the unit.
 *
 * Everyone on it sees the new name, which is the point — "My unit", created automatically
 * with the account, tells a team of four nothing. The database decides who may: the update
 * policy on wards allows the owner alone, so this needs no check of its own.
 */
export async function renameWard(formData: FormData) {
  const wardId = String(formData.get("ward_id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  if (!wardId || !name) return;

  const supabase = await createClient();
  await supabase.from("wards").update({ name: name.slice(0, 60) }).eq("id", wardId);

  revalidatePath("/");
  revalidatePath("/unit");
}

/** Switch which unit the app is showing. */
export async function switchWard(formData: FormData) {
  const wardId = String(formData.get("ward_id") ?? "");
  if (!wardId) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  // Row security decides whether they may see this ward at all; writing the preference
  // cannot grant access to one they are not a member of.
  await supabase.from("profiles").update({ current_ward_id: wardId }).eq("id", user.id);

  revalidatePath("/");
  revalidatePath("/unit");
  redirect("/");
}

/**
 * Leave a unit you joined.
 *
 * Deliberately refuses for the owner: a ward whose owner has walked out of it still holds
 * patients, and nothing would be able to rename or hand it over afterwards.
 */
export async function leaveWard(formData: FormData) {
  const wardId = String(formData.get("ward_id") ?? "");
  if (!wardId) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const { data: ward } = await supabase
    .from("wards")
    .select("owner_id")
    .eq("id", wardId)
    .maybeSingle();

  if (!ward || ward.owner_id === user.id) return;

  await supabase.from("ward_members").delete().eq("ward_id", wardId).eq("user_id", user.id);
  await supabase.from("profiles").update({ current_ward_id: null }).eq("id", user.id);

  revalidatePath("/");
  redirect("/");
}
