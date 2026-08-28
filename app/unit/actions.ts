"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type JoinState = { error: string | null; joined?: string };
export type CreateWardState = { error: string | null };

/** Create a first unit and make its creator the owner. */
export async function createWard(
  _prev: CreateWardState,
  formData: FormData,
): Promise<CreateWardState> {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { error: "Enter a unit name." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You are signed out. Sign in again." };

  const { error } = await supabase.rpc("create_ward_for_current_user", { unit_name: name });
  if (error) return { error: error.message };

  revalidatePath("/");
  revalidatePath("/ward");
  revalidatePath("/unit");
  redirect("/ward");
}

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
  revalidatePath("/ward");
  revalidatePath("/unit");

  // A joiner with no name yet goes to the Unit page, where the unit's roster is waiting to be
  // tapped; everybody else goes straight to the ward as before. One extra query, and only on
  // the once-per-unit path — worth it, because a resident who lands on the ward and starts
  // recording is "Doctor" against every entry they make that morning.
  const { data: mine } = await supabase.from("profiles").select("display_name").maybeSingle();
  if (!mine?.display_name) {
    const { data: waiting } = await supabase
      .from("ward_expected_members")
      .select("id")
      .eq("ward_id", data)
      .is("claimed_by", null)
      .limit(1);
    if (waiting && waiting.length > 0) redirect("/unit");
  }

  redirect("/ward");
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
  revalidatePath("/ward");
  revalidatePath("/unit");
}

/**
 * The heading that goes on top of a discharge summary.
 *
 * Free text, reproduced verbatim, because every unit lays its heading out differently — the
 * consultants, which days are OPD and OT — and a set of fields that guessed at the shape would
 * be wrong for the next unit. Owner only, like renaming: the wards policy permits nobody else.
 */
export async function saveLetterhead(formData: FormData) {
  const wardId = String(formData.get("ward_id") ?? "");
  if (!wardId) return;

  const letterhead = String(formData.get("letterhead") ?? "").trim();

  const supabase = await createClient();
  await supabase
    .from("wards")
    .update({ letterhead: letterhead ? letterhead.slice(0, 2000) : null })
    .eq("id", wardId);

  revalidatePath("/unit");
  revalidatePath("/");
  revalidatePath("/ward");
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
  revalidatePath("/ward");
  revalidatePath("/unit");
  redirect("/ward");
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
  revalidatePath("/ward");
  redirect("/ward");
}

/**
 * The doctor's own details, for the landing page.
 *
 * profiles has carried display_name since the first schema and nothing has ever written to it —
 * handle_new_user inserts the id alone. This is where all three get set. Row security already
 * restricts profiles to the caller's own row (profiles_self_update), so the update needs no
 * check of its own: it can only ever reach the row belonging to whoever called it.
 */
export async function saveProfile(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const name = String(formData.get("display_name") ?? "").trim();
  const designationRaw = String(formData.get("designation") ?? "").trim();
  const department = String(formData.get("department") ?? "").trim();

  // Anything not on the ladder is stored as nothing rather than as itself: the column has a
  // check constraint, and an insert it refuses would surface as a database error at a bedside.
  const designation = ["Intern", "JR-1", "JR-2", "JR-3", "SR", "AP", "Medical Officer", "Consultant"].includes(designationRaw)
    ? designationRaw
    : null;

  await supabase
    .from("profiles")
    .update({
      display_name: name || null,
      designation,
      department: department || null,
    })
    .eq("id", user.id);

  revalidatePath("/");
  revalidatePath("/unit");
}

/**
 * Import this ward's hospital formulary, replacing whatever was there.
 *
 * The list is captured from the hospital's own prescribing screen (see the Unit page for the
 * snippet) and arrives as the raw rows that page renders — including its duplicates, since the
 * same drug is held as several stock batches. Those collapse to distinct text here: they are
 * interchangeable to the patient, and keeping 1,557 rows where 1,057 differ would only make
 * the picker longer to read.
 *
 * Replacing rather than merging, deliberately. A formulary is a snapshot of what the hospital
 * stocks; merging an old list into a new one would keep offering drugs that have since been
 * withdrawn, with nothing to indicate which were which. Confirmed mappings are NOT touched —
 * they are clinical judgements, and a re-import is a stock update, not a reason to make a
 * resident choose everything again.
 */
export type ImportFormularyState = { message: string; ok: boolean } | null;

export async function importFormulary(
  _prev: ImportFormularyState,
  formData: FormData
): Promise<ImportFormularyState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: "You are signed out. Sign in again." };

  const wardId = String(formData.get("ward_id") ?? "");
  const file = formData.get("formulary");
  if (!wardId) return { ok: false, message: "No unit selected." };
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, message: "Choose the file first, then press Import." };
  }
  // The capture is a few hundred kilobytes of text; anything far past that is not this file.
  if (file.size > 4_000_000) {
    return { ok: false, message: "That file is too large to be the formulary capture." };
  }

  let texts: string[];
  try {
    const parsed = JSON.parse(await file.text()) as { rows?: { text?: unknown }[] };
    const seen = new Set<string>();
    texts = (parsed.rows ?? [])
      .map((r) => (typeof r.text === "string" ? r.text.trim() : ""))
      .filter((t) => {
        if (t.length < 2 || t.length > 400 || seen.has(t)) return false;
        seen.add(t);
        return true;
      });
  } catch {
    return { ok: false, message: "That file is not the JSON the capture produces." };
  }

  if (texts.length === 0) {
    return { ok: false, message: "No medicines found in that file. Was the drug list open when you captured it?" };
  }

  // Row security already limits this to a ward this doctor owns; the delete is what makes the
  // import a replacement rather than an append.
  const { error: clearError } = await supabase.from("ward_formulary_items").delete().eq("ward_id", wardId);
  if (clearError) return { ok: false, message: databaseHint(clearError.message) };

  // Chunked because a single insert of a thousand-plus rows is refused by the API's body limit.
  for (let i = 0; i < texts.length; i += 500) {
    const { error } = await supabase
      .from("ward_formulary_items")
      .insert(texts.slice(i, i + 500).map((item_text) => ({ ward_id: wardId, item_text })));
    if (error) return { ok: false, message: databaseHint(error.message) };
  }

  revalidatePath("/unit");
  return { ok: true, message: `Imported ${texts.length} medicines.` };
}

/** A missing table means the schema patch has not been run yet, which is a specific and
 *  fixable thing — worth saying so rather than showing the raw Postgres wording. */
function databaseHint(message: string): string {
  if (/does not exist|schema cache/i.test(message)) {
    return "The formulary tables are not in the database yet — run patch 0047 in Supabase first.";
  }
  return `Could not save: ${message}`;
}

/**
 * Write the people a unit expects, before any of them has an account.
 *
 * One per line, designation after a comma — "Dr Sharma, SR". Pasted in bulk because a unit
 * list arrives as a unit list, on paper or in a WhatsApp message, and adding eleven people
 * one form at a time is eleven chances to give up halfway.
 *
 * A name is stored exactly as typed. The honorific stripping that applies to patients is
 * deliberately not applied here: that rule exists because a patient name is an identifier
 * that must match across admissions, whereas this is how a colleague is addressed on the
 * ward, and "Dr" is part of it. See CONTEXT.md §2.
 */
export type ExpectedState = { message: string; ok: boolean } | null;

export async function addExpectedMembers(
  _prev: ExpectedState,
  formData: FormData
): Promise<ExpectedState> {
  const wardId = String(formData.get("ward_id") ?? "");
  if (!wardId) return { ok: false, message: "No unit selected." };

  const designations = ["Intern", "JR-1", "JR-2", "JR-3", "SR", "AP", "Medical Officer", "Consultant"];

  const rows = String(formData.get("names") ?? "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [namePart, ...rest] = line.split(",");
      const typed = rest.join(",").trim();
      // Case-insensitively, because "sr" typed at 7am is the same person as "SR", and the
      // column's check constraint would refuse the lowercase one with a database error.
      const designation =
        designations.find((d) => d.toLowerCase() === typed.toLowerCase()) ?? null;
      return { ward_id: wardId, full_name: namePart.trim().slice(0, 80), designation };
    })
    .filter((r) => r.full_name.length > 0);

  if (rows.length === 0) return { ok: false, message: "Type at least one name." };

  const supabase = await createClient();
  const { error } = await supabase.from("ward_expected_members").insert(rows);
  if (error) return { ok: false, message: expectedHint(error.message) };

  revalidatePath("/unit");
  return { ok: true, message: `Added ${rows.length} ${rows.length === 1 ? "person" : "people"}.` };
}

/** Take a name off the list. Owner only — the delete policy on the table says so. */
export async function removeExpectedMember(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const supabase = await createClient();
  await supabase.from("ward_expected_members").delete().eq("id", id);
  revalidatePath("/unit");
}

/**
 * "Which one are you?" — the second half of joining.
 *
 * The database does the work in claim_expected_member (0048), because this writes the
 * caller's profile and no policy should let a member rewrite a roster name while doing it.
 */
export type ClaimState = { error: string | null };

export async function claimExpectedMember(
  _prev: ClaimState,
  formData: FormData
): Promise<ClaimState> {
  const id = String(formData.get("id") ?? "");
  if (!id) return { error: null };

  const supabase = await createClient();
  const { error } = await supabase.rpc("claim_expected_member", { member_id: id });
  if (error) return { error: expectedHint(error.message) };

  revalidatePath("/");
  revalidatePath("/ward");
  revalidatePath("/unit");
  return { error: null };
}

function expectedHint(message: string): string {
  if (/does not exist|schema cache/i.test(message)) {
    return "The unit roster is not in the database yet — run patch 0048 in Supabase first.";
  }
  return message;
}

/**
 * Copy another unit's setup onto this one: its paperwork, its discharge heading, its formulary.
 *
 * Four units of the same department write the same documents on the same hospital's paper. The
 * only thing that genuinely differs is which unit it is — so that is the only thing changed
 * here, and everything else is copied byte for byte rather than re-uploaded four times.
 *
 * The heading is copied verbatim EXCEPT for a line that is exactly the source unit's name,
 * which becomes this unit's name — "UNIT-II" written as its own line becomes "UNIT-III". Only
 * a whole line is matched, never a substring: "Department of General Surgery, Unit 3" is left
 * alone rather than half-rewritten, because a heading is reproduced exactly on a document that
 * leaves with a patient and a clever substitution that is wrong is worse than an obvious one
 * the owner can see and fix. The result says which happened.
 *
 * What is NOT copied, deliberately: medication_formulary_map. Those are one resident's
 * confirmed judgements about which formulary entry a drug is, and 0047 already treats them as
 * clinical rather than as settings. The drug list they draw on is copied; the judgements are
 * made again by the unit that will rely on them.
 */
export type CopySetupState = { message: string; ok: boolean } | null;

export async function copySetupFromWard(
  _prev: CopySetupState,
  formData: FormData
): Promise<CopySetupState> {
  const targetId = String(formData.get("ward_id") ?? "");
  const sourceId = String(formData.get("source_ward_id") ?? "");
  if (!targetId || !sourceId) return { ok: false, message: "Choose a unit to copy from." };
  if (targetId === sourceId) return { ok: false, message: "That is this unit." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: "You are signed out. Sign in again." };

  // Both reads are limited by row security to units this doctor belongs to, so a ward id typed
  // into the form cannot reach a unit they are not on.
  const { data: wards } = await supabase
    .from("wards")
    .select("id, name, owner_id, letterhead")
    .in("id", [sourceId, targetId]);

  const source = wards?.find((w) => w.id === sourceId);
  const target = wards?.find((w) => w.id === targetId);
  if (!source || !target) return { ok: false, message: "Could not read both units." };
  if (target.owner_id !== user.id) {
    return { ok: false, message: "Only the owner of this unit can change its setup." };
  }

  const done: string[] = [];

  // 1. The discharge heading, with the unit's own name on it.
  if (source.letterhead) {
    const sourceName = source.name.trim().toLowerCase();
    let replaced = false;
    const letterhead = (source.letterhead as string)
      .split("\n")
      .map((line: string) => {
        if (line.trim().toLowerCase() === sourceName) {
          replaced = true;
          return line.replace(line.trim(), target.name.trim());
        }
        return line;
      })
      .join("\n");

    const { error } = await supabase.from("wards").update({ letterhead }).eq("id", targetId);
    if (error) return { ok: false, message: `Could not copy the heading: ${error.message}` };
    done.push(
      replaced
        ? `heading (unit line now “${target.name}”)`
        : "heading (copied exactly — no line matched the other unit’s name, so check it)"
    );
  }

  // 2. The uploaded paperwork — progress notes, discharge layout, logo and the rest. The file
  // itself is copied in storage; re-uploading the same photograph four times would produce four
  // files that are supposed to be identical and, sooner or later, are not.
  const { data: formats } = await supabase
    .from("ward_formats")
    .select("kind, file_path, file_name, mime_type, layout, layout_model, layout_error")
    .eq("ward_id", sourceId);

  const copiedKinds: string[] = [];
  for (const format of formats ?? []) {
    const { data: blob, error: downloadError } = await supabase.storage
      .from("evidence")
      .download(format.file_path);
    if (downloadError || !blob) continue;

    const ext = format.file_path.includes(".") ? format.file_path.split(".").pop() : "bin";
    const path = `formats/${targetId}/${format.kind}-${crypto.randomUUID()}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from("evidence")
      .upload(path, Buffer.from(await blob.arrayBuffer()), {
        contentType: format.mime_type ?? undefined,
      });
    if (uploadError) continue;

    // The layout is carried across rather than detected again: it describes where the boxes sit
    // on this exact page, and the page is the same page. Re-reading it would cost a model call
    // to answer a question already answered.
    const { error: rowError } = await supabase.from("ward_formats").upsert(
      {
        ward_id: targetId,
        kind: format.kind,
        file_path: path,
        file_name: format.file_name,
        mime_type: format.mime_type,
        layout: format.layout,
        layout_model: format.layout_model,
        layout_error: format.layout_error,
      },
      { onConflict: "ward_id,kind" }
    );
    if (!rowError) copiedKinds.push(format.kind);
  }
  if (copiedKinds.length > 0) done.push(`${copiedKinds.length} formats`);

  // 3. The hospital's drug list. Same hospital, same stock; a unit importing it separately is
  // the same capture done again. Replaced rather than merged, for the reason 0047 gives.
  // Read in pages of 1000. PostgREST caps a single response at 1000 rows and says nothing about
  // it, so a straight select of a 1057-drug formulary silently copies 1000 and looks like it
  // worked — which is exactly what happened the first time this ran.
  const items: { item_text: string }[] = [];
  for (let from = 0; ; from += 1000) {
    const { data: page } = await supabase
      .from("ward_formulary_items")
      .select("item_text")
      .eq("ward_id", sourceId)
      .range(from, from + 999);
    if (!page || page.length === 0) break;
    items.push(...page);
    if (page.length < 1000) break;
  }

  if (items && items.length > 0) {
    await supabase.from("ward_formulary_items").delete().eq("ward_id", targetId);
    let inserted = 0;
    for (let i = 0; i < items.length; i += 500) {
      const chunk = items.slice(i, i + 500);
      const { error } = await supabase
        .from("ward_formulary_items")
        .insert(chunk.map((r) => ({ ward_id: targetId, item_text: r.item_text })));
      if (!error) inserted += chunk.length;
    }
    if (inserted > 0) done.push(`${inserted} medicines`);
  }

  revalidatePath("/unit");
  revalidatePath("/formats");
  revalidatePath("/");

  if (done.length === 0) return { ok: false, message: "That unit has nothing set up to copy." };
  return { ok: true, message: `Copied from ${source.name}: ${done.join(", ")}.` };
}
