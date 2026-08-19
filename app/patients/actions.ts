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
  const managementRaw = String(formData.get("management") ?? "");
  const operationDate = String(formData.get("operation_date") ?? "").trim();

  if (!wardId) return { error: "No ward selected." };
  if (!bed) return { error: "Bed is required." };
  if (!name) return { error: "Name is required." };
  if (!admittedOn) return { error: "Admission date is required." };
  if (managementRaw === "postop" && !operationDate) {
    return { error: "Date of operation is required for post-op." };
  }

  // A surgery date before admission is almost always a typo in one of the two fields, and
  // it would produce a post-op day larger than the admission day on the card. Only checked
  // for an operation that has actually happened — a planned date is ahead of the admission
  // by definition, and a postponed list still needs its original date recorded.
  if (managementRaw === "postop" && operationDate < admittedOn) {
    return { error: "Date of operation is before the admission date. Check both." };
  }

  // Post-op is never stored as management — see readManagement. Choosing it records the
  // surgery date instead, which is the single fact the POD count and the POST OP badge are
  // both derived from. Pre-op writes the planned date, which carries no such meaning: a
  // future date in surgery_date would make a patient post-op before they were operated on.
  const dates =
    managementRaw === "postop"
      ? { surgery_date: operationDate, planned_surgery_date: null }
      : managementRaw === "preop"
        ? { surgery_date: null, planned_surgery_date: operationDate || null }
        : { surgery_date: null, planned_surgery_date: null };

  const identity = readIdentity(ageRaw, sexRaw);
  if ("error" in identity) return identity;
  const { age, sex } = identity;

  const { error } = await supabase.from("patients").insert({
    ward_id: wardId,
    bed,
    display_name: name,
    age_years: age,
    sex,
    management: readManagement(managementRaw),
    primary_diagnosis: diagnosis || null,
    admitted_on: admittedOn,
    ...dates,
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

/** Undo a removal: back onto the active ward list, exactly as they were. */
export async function restorePatient(formData: FormData) {
  const id = String(formData.get("patient_id") ?? "");
  if (!id) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase
    .from("patients")
    .update({ status: "active", discharged_at: null })
    .eq("id", id);

  revalidatePath("/");
  revalidatePath("/removed");
  revalidatePath("/todo");
  revalidatePath("/handover");
  revalidatePath(`/patients/${id}`);
}

/**
 * Destroy a patient and everything recorded about them. There is no undoing this one.
 *
 * Only reachable from the removed list, and the database enforces that too — the delete
 * policy refuses a patient still on the ward — so this is always the second of two deliberate
 * acts rather than one mis-aimed tap. It exists for the patient who should never have been
 * created: a misheard bed, a name read wrong off a register. Their entries and observations
 * go with them, which is exactly what is wanted for noise and exactly why it sits behind an
 * undo list for everything else.
 */
export async function deletePatientForever(formData: FormData) {
  const id = String(formData.get("patient_id") ?? "");
  if (!id) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  // .select() so the outcome is actually known. A delete that row security refuses is NOT an
  // error — PostgREST returns success having removed nothing — so without asking which rows
  // came back, a refusal and a success look identical, and this reported neither. That is
  // exactly how a delete could appear to do nothing, repeatedly, and say nothing about it.
  const { data: deleted, error } = await supabase
    .from("patients")
    .delete()
    .eq("id", id)
    .eq("status", "discharged")
    .select("id");

  revalidatePath("/");
  revalidatePath("/removed");

  if (error) redirect(`/removed?failed=${encodeURIComponent(error.message)}`);
  if (!deleted || deleted.length === 0) redirect("/removed?failed=refused");
}

/**
 * Delete a patient outright, from the ward.
 *
 * The delete policy refuses any patient still on the ward, which was the point: it meant a
 * mis-aimed tap on a small ⋯ could not destroy a record, because destroying took two
 * deliberate acts on two screens. Deleting from here performs both, so that guard is gone and
 * the confirmation is what remains — which is why it names the patient and counts what goes
 * with them rather than asking "are you sure?".
 *
 * The status write also matters on its own: it is what makes the delete legal, so if the
 * second step fails the patient is off the ward rather than half-deleted, and can be put back
 * from the removed list.
 */
export async function deletePatientFromWard(formData: FormData) {
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

  // See deletePatientForever: a refused delete is silent, so the rows have to be asked for.
  const { data: deleted, error } = await supabase
    .from("patients")
    .delete()
    .eq("id", id)
    .eq("status", "discharged")
    .select("id");

  revalidatePath("/");
  revalidatePath("/removed");
  revalidatePath("/todo");
  revalidatePath("/handover");

  // The status write above already succeeded, so the patient is off the ward either way and is
  // sitting in the removed list. Sending the resident there — rather than to a ward list where
  // the patient has simply vanished from view — puts them where the record actually is, with
  // the reason the destroy did not happen.
  if (error) redirect(`/removed?failed=${encodeURIComponent(error.message)}`);
  if (!deleted || deleted.length === 0) redirect("/removed?failed=refused");

  redirect("/");
}

export type EditPatientState = { error: string | null; ok?: boolean };

/**
 * Correct who a patient is, and their diagnosis and management, from wherever you are looking
 * at them.
 *
 * Bed is the one field a mis-aimed tap could use to quietly move a patient, so it stays
 * required and validated exactly as before. Diagnosis, management and the two operation dates
 * are here because they are corrected on the same rhythm as the name — typed once at
 * admission, wrong or incomplete, fixed on a later round.
 *
 * "Post-op" in the form is not a stored management value — see readManagement — so choosing it
 * writes surgery_date instead, which is the single fact that already drives the post-op day
 * count and the derived label. Choosing "Pre-op" with a date writes planned_surgery_date
 * instead: an upcoming operation that has not happened yet must never touch surgery_date, or
 * the day count would go negative before the surgery has actually taken place.
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
  const diagnosis = String(formData.get("primary_diagnosis") ?? "").trim();
  const managementRaw = String(formData.get("management") ?? "");
  const operationDate = String(formData.get("operation_date") ?? "").trim();

  if (!id) return { error: "No patient." };
  if (!name) return { error: "Name cannot be empty." };
  if (!bed) return { error: "Bed cannot be empty." };
  if (managementRaw === "postop" && !operationDate) {
    return { error: "Date of operation is required for post-op." };
  }

  const identity = readIdentity(ageRaw, sexRaw);
  if ("error" in identity) return identity;

  // Typed freely. Matching a name the library knows brings its template along; anything else
  // is kept as the unit's own wording, with no template applied.
  const procedure = resolveProcedure(
    String(formData.get("procedure") ?? ""),
    await listTemplateChoices()
  );

  // The dropdown is the authority on which dates a patient may hold, so every branch states
  // both columns rather than leaving one behind. Choosing conservative for someone carrying a
  // surgery date has to clear it: managementLabel() reads POST OP off that date alone, so a
  // date left in place would go on showing POST OP next to a resident's explicit "conservative"
  // — and reopening the dialog would show Post-op again, as if the change had been refused.
  //
  // This is not the app inventing or discarding anything on its own. The select is filled from
  // what is already stored, so it can only reach these branches by somebody deliberately
  // choosing them, and re-entering the date puts it straight back.
  const dates =
    managementRaw === "postop"
      ? { surgery_date: operationDate, planned_surgery_date: null }
      : managementRaw === "preop"
        ? { surgery_date: null, planned_surgery_date: operationDate || null }
        : { surgery_date: null, planned_surgery_date: null };

  // Row security decides whether this is allowed: the update reaches only a patient on a ward
  // this doctor belongs to, so no check here is load-bearing.
  const { error } = await supabase
    .from("patients")
    .update({
      display_name: name,
      bed,
      age_years: identity.age,
      sex: identity.sex,
      primary_diagnosis: diagnosis || null,
      management: readManagement(managementRaw),
      ...dates,
      ...procedure,
    })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/");
  revalidatePath("/handover");
  revalidatePath(`/patients/${id}`);
  return { error: null, ok: true };
}
