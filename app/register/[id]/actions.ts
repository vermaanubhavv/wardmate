"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { RegisterRow } from "@/lib/read-register";

/**
 * Writes the rows the resident approved, and only those.
 *
 * Each approved row becomes one entry against its patient, carrying the register photo, plus
 * one observation per finding and per plan. Everything is flagged for confirmation: these
 * came off a photograph of handwriting, and unlike a spoken note there is no automatic check
 * that can be run against the source.
 */
export async function applyRegister(formData: FormData) {
  const readId = String(formData.get("read_id") ?? "");
  if (!readId) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const { data: read } = await supabase
    .from("register_reads")
    .select("id, ward_id, photo_path, raw, status")
    .eq("id", readId)
    .maybeSingle();

  if (!read || read.status !== "draft") return;

  const rows = ((read.raw as { rows?: RegisterRow[] } | null)?.rows ?? []) as RegisterRow[];

  for (let i = 0; i < rows.length; i++) {
    // Unchecked rows send no patient at all, so they are skipped without any write.
    const patientId = String(formData.get(`patient_${i}`) ?? "");
    if (!patientId) continue;

    const row = rows[i];

    const { data: entry } = await supabase
      .from("entries")
      .insert({
        patient_id: patientId,
        author_id: user.id,
        source: "photo",
        photo_path: read.photo_path,
        transcript: row.source_quote,
      })
      .select("id")
      .single();

    if (!entry) continue;

    const observations = [
      ...row.findings.map((f) => ({
        entry_id: entry.id,
        patient_id: patientId,
        kind: "note" as const,
        label: f.label,
        value_text: f.value_text,
        value_num: null,
        unit: null,
        source_quote: row.source_quote,
        needs_confirmation: true,
        conflict_note: row.uncertain
          ? "Handwriting was unclear — check against the register photo."
          : null,
      })),
      ...row.plans.map((p) => ({
        entry_id: entry.id,
        patient_id: patientId,
        kind: "plan" as const,
        label: "plan",
        value_text: p,
        value_num: null,
        unit: null,
        source_quote: row.source_quote,
        needs_confirmation: true,
        conflict_note: row.uncertain
          ? "Handwriting was unclear — check against the register photo."
          : null,
      })),
    ];

    if (observations.length > 0) {
      await supabase.from("observations").insert(observations);
    }
  }

  await supabase
    .from("register_reads")
    .update({ status: "applied", applied_at: new Date().toISOString() })
    .eq("id", readId);

  revalidatePath("/");
  redirect("/");
}

export async function discardRegister(formData: FormData) {
  const readId = String(formData.get("read_id") ?? "");
  if (!readId) return;

  const supabase = await createClient();
  await supabase.from("register_reads").update({ status: "discarded" }).eq("id", readId);

  redirect("/");
}
