"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

/** One-tap confirmation of a number, drug or dose the app flagged as worth checking. */
export async function confirmObservation(formData: FormData) {
  const id = String(formData.get("observation_id") ?? "");
  const patientId = String(formData.get("patient_id") ?? "");
  if (!id) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase
    .from("observations")
    .update({ confirmed_at: new Date().toISOString(), confirmed_by: user.id })
    .eq("id", id);

  revalidatePath(`/patients/${patientId}`);
  revalidatePath("/");
}
