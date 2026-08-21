"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type ProfessionalState = { error: string | null };

export async function completeProfessionalOnboarding(_previous: ProfessionalState, formData: FormData): Promise<ProfessionalState> {
  if (formData.get("attestation") !== "on") return { error: "Confirm that the information is accurate." };
  const values = ["name", "registration_number", "hospital", "department", "designation"].map((field) => String(formData.get(field) ?? "").trim());
  if (values.some((value) => !value)) return { error: "Complete every field." };
  const supabase = await createClient();
  const { error } = await supabase.rpc("complete_clinician_onboarding", {
    clinician_name: values[0], clinician_registration_number: values[1], clinician_hospital_name: values[2], clinician_department: values[3], clinician_designation: values[4],
  });
  if (error) return { error: error.message };
  redirect("/onboarding");
}
