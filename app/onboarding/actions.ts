"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type ProfessionalState = { error: string | null; done?: boolean };

// Bumped only when a change affects how patient data is handled — see §9 of the Clinician
// Data Agreement. Stamped on profiles.terms_version at acceptance, not read from the form, so
// a doctor can't submit whatever version string a stale client happened to send.
export const TERMS_VERSION = "draft-1";

export async function completeProfessionalOnboarding(_previous: ProfessionalState, formData: FormData): Promise<ProfessionalState> {
  if (formData.get("attestation") !== "on") return { error: "Confirm that the information is accurate." };
  if (formData.get("terms") !== "on") return { error: "Accept the data agreement to continue." };
  const values = ["name", "registration_number", "hospital", "department", "designation"].map((field) => String(formData.get(field) ?? "").trim());
  if (values.some((value) => !value)) return { error: "Complete every field." };
  const supabase = await createClient();
  const { error } = await supabase.rpc("complete_clinician_onboarding", {
    clinician_name: values[0], clinician_registration_number: values[1], clinician_hospital_name: values[2], clinician_department: values[3], clinician_designation: values[4],
    clinician_terms_version: TERMS_VERSION,
  });
  if (error) return { error: error.message };

  // Don't redirect to /onboarding — a client-side navigation to the same route reuses the
  // cached render and leaves the doctor staring at the form they just submitted. Revalidate
  // instead and let the form ask the router to refresh, which re-runs this page as
  // "Choose your unit" with the unit-code field.
  revalidatePath("/onboarding");
  return { error: null, done: true };
}
