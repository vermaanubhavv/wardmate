"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type AddPatientState = { error: string | null };

export async function addPatient(
  _prev: AddPatientState,
  formData: FormData
): Promise<AddPatientState> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You are signed out. Sign in again." };

  const wardId = String(formData.get("ward_id") ?? "");
  const bed = String(formData.get("bed") ?? "").trim();
  const name = String(formData.get("display_name") ?? "").trim();
  const diagnosis = String(formData.get("primary_diagnosis") ?? "").trim();
  const admittedOn = String(formData.get("admitted_on") ?? "");
  const surgeryDate = String(formData.get("surgery_date") ?? "").trim();

  if (!wardId) return { error: "No ward selected." };
  if (!bed) return { error: "Bed is required." };
  if (!name) return { error: "Name is required." };
  if (!admittedOn) return { error: "Admission date is required." };

  // A surgery date before admission is almost always a typo in one of the two fields, and
  // it would produce a post-op day larger than the admission day on the card.
  if (surgeryDate && surgeryDate < admittedOn) {
    return { error: "Surgery date is before the admission date. Check both." };
  }

  const { error } = await supabase.from("patients").insert({
    ward_id: wardId,
    bed,
    display_name: name,
    primary_diagnosis: diagnosis || null,
    admitted_on: admittedOn,
    surgery_date: surgeryDate || null,
    created_by: user.id,
  });

  if (error) return { error: error.message };

  revalidatePath("/");
  redirect("/");
}
