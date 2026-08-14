"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { listTemplateChoices, resolveProcedure } from "@/lib/templates";

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
  const ageRaw = String(formData.get("age_years") ?? "").trim();
  const sexRaw = String(formData.get("sex") ?? "").trim();
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

  const identity = readIdentity(ageRaw, sexRaw);
  if ("error" in identity) return identity;
  const { age, sex } = identity;

  const { error } = await supabase.from("patients").insert({
    ward_id: wardId,
    bed,
    display_name: name,
    age_years: age,
    sex,
    management: readManagement(String(formData.get("management") ?? "")),
    primary_diagnosis: diagnosis || null,
    admitted_on: admittedOn,
    surgery_date: surgeryDate || null,
    ...resolveProcedure(String(formData.get("procedure") ?? ""), await listTemplateChoices()),
    created_by: user.id,
  });

  if (error) return { error: error.message };

  revalidatePath("/");
  redirect("/");
}

/**
 * Age and sex, checked before they reach the database. Both are optional — a patient admitted
 * at 3am by someone who does not yet know the age must still be addable — but a value that IS
 * given has to be one the database will accept, or the insert fails with a constraint message
 * no one at a bedside can act on.
 */
function readIdentity(
  ageRaw: string,
  sexRaw: string
): { age: number | null; sex: string | null } | { error: string } {
  const age = ageRaw ? Number(ageRaw) : null;
  if (age !== null && (!Number.isInteger(age) || age < 0 || age > 120)) {
    return { error: "Age must be a whole number of years between 0 and 120." };
  }

  const sex = sexRaw && ["M", "F", "other"].includes(sexRaw) ? sexRaw : null;
  return { age, sex };
}

/**
 * Post-op is deliberately not accepted here. It is derived from the surgery date, so storing
 * it would let the badge disagree with the day count beside it.
 */
function readManagement(raw: string): string | null {
  return ["preop", "conservative", "workup"].includes(raw) ? raw : null;
}

/**
 * Take a patient off the active ward list.
 *
 * This sets their status rather than destroying anything, which is the schema's deliberate
 * design: there is no delete policy on patients at all, so their entries, observations and
 * the quotes tying those to what was said all survive. Somebody discharged last week, or
 * added to the wrong bed this morning, both leave the list the same way — and if either turns
 * out to be a mistake the record is still there to put back.
 */
export async function removePatient(formData: FormData) {
  const id = String(formData.get("patient_id") ?? "");
  if (!id) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase
    .from("patients")
    .update({ status: "discharged", discharged_at: new Date().toISOString() })
    .eq("id", id);

  revalidatePath("/");
  revalidatePath("/todo");
  revalidatePath("/handover");
  redirect("/");
}

export type EditPatientState = { error: string | null; ok?: boolean };

/**
 * Correct who a patient is — name, age, sex — from wherever you are looking at them.
 *
 * This exists because these three are the facts most often typed in a hurry at admission and
 * discovered to be wrong on a later round, and because every patient added before age and sex
 * existed has no way to gain them otherwise. Deliberately narrow: bed, diagnosis and dates are
 * not editable here, so a tap meant to fix a spelling cannot quietly move a patient or change
 * what day they are on.
 */
export async function updatePatientIdentity(
  _prev: EditPatientState,
  formData: FormData
): Promise<EditPatientState> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You are signed out. Sign in again." };

  const id = String(formData.get("patient_id") ?? "");
  const name = String(formData.get("display_name") ?? "").trim();
  const bed = String(formData.get("bed") ?? "").trim();
  const ageRaw = String(formData.get("age_years") ?? "").trim();
  const sexRaw = String(formData.get("sex") ?? "").trim();

  if (!id) return { error: "No patient." };
  if (!name) return { error: "Name cannot be empty." };
  if (!bed) return { error: "Bed cannot be empty." };

  const identity = readIdentity(ageRaw, sexRaw);
  if ("error" in identity) return identity;

  // Typed freely. Matching a name the library knows brings its template along; anything else
  // is kept as the unit's own wording, with no template applied.
  const procedure = resolveProcedure(
    String(formData.get("procedure") ?? ""),
    await listTemplateChoices()
  );

  // Row security decides whether this is allowed: the update reaches only a patient on a ward
  // this doctor belongs to, so no check here is load-bearing.
  const { error } = await supabase
    .from("patients")
    .update({
      display_name: name,
      bed,
      age_years: identity.age,
      sex: identity.sex,
      management: readManagement(String(formData.get("management") ?? "")),
      ...procedure,
    })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/");
  revalidatePath("/handover");
  revalidatePath(`/patients/${id}`);
  return { error: null, ok: true };
}
