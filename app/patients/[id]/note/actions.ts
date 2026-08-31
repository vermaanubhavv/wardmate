"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { istDayKey } from "@/lib/patient-state";

/**
 * Writes from the daily progress-note workspace.
 *
 * Everything lands in the same `entries` / `observations` a voice round writes to — no separate
 * draft. Each card owns its line of today's sheet: leaving a changed card rewrites that line's
 * observations for TODAY (IST), seeded from those same observations so nothing is lost. The
 * printed sheet (/note) reads today's observations unchanged.
 */

function revalidateEverywhere(patientId: string) {
  revalidatePath(`/patients/${patientId}`);
  revalidatePath(`/patients/${patientId}/note`);
  revalidatePath(`/patients/${patientId}/note/build`);
  revalidatePath("/todo");
  revalidatePath("/handover");
  revalidatePath("/");
  revalidatePath("/ward");
}

type Supa = Awaited<ReturnType<typeof createClient>>;

async function currentUser(supabase: Supa) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

const todayKey = () => istDayKey(new Date().toISOString());

/** Non-case-history entry ids for this patient whose round falls on today (IST). */
async function todayEntryIds(supabase: Supa, patientId: string): Promise<string[]> {
  const since = new Date(Date.now() - 48 * 3600 * 1000).toISOString();
  const { data } = await supabase
    .from("entries")
    .select("id, recorded_at, is_case_history")
    .eq("patient_id", patientId)
    .gte("recorded_at", since);
  return (data ?? [])
    .filter((e) => !e.is_case_history && istDayKey(e.recorded_at as string) === todayKey())
    .map((e) => e.id as string);
}

/** Today's own manual entry for the note workspace, created the first time it is needed. */
async function todayManualEntryId(supabase: Supa, patientId: string, userId: string): Promise<string | null> {
  const ids = await todayEntryIds(supabase, patientId);
  if (ids.length) {
    const { data: manual } = await supabase
      .from("entries")
      .select("id, source")
      .in("id", ids)
      .eq("source", "manual")
      .limit(1)
      .maybeSingle();
    if (manual?.id) return manual.id as string;
  }
  const { data: created } = await supabase
    .from("entries")
    .insert({ patient_id: patientId, author_id: userId, source: "manual", transcript: "Today's note" })
    .select("id")
    .single();
  return (created?.id as string | undefined) ?? null;
}

async function rewriteToday(
  supabase: Supa,
  patientId: string,
  userId: string,
  label: string,
  kind: string,
  lines: string[]
): Promise<string | null> {
  const clean = lines.map((l) => l.trim()).filter(Boolean);
  const ids = await todayEntryIds(supabase, patientId);
  if (ids.length) {
    const { error } = await supabase
      .from("observations")
      .delete()
      .eq("patient_id", patientId)
      .in("entry_id", ids)
      .ilike("label", label);
    if (error) return error.message;
  }
  if (clean.length) {
    const entryId = await todayManualEntryId(supabase, patientId, userId);
    if (!entryId) return "Could not open today's note.";
    const now = new Date().toISOString();
    const { error } = await supabase.from("observations").insert(
      clean.map((text) => ({
        entry_id: entryId,
        patient_id: patientId,
        kind,
        label,
        value_text: text,
        source_quote: text,
        needs_confirmation: false,
        confirmed_at: now,
        confirmed_by: userId,
      }))
    );
    if (error) return error.message;
  }
  return null;
}

/** Rewrite one line of today's sheet from what its card holds. */
export async function replaceTodayNoteSection(
  patientId: string,
  label: string,
  kind: "note" | "exam" | "vital" | "plan",
  lines: string[]
): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient();
  const user = await currentUser(supabase);
  if (!user) return { ok: false, error: "Not signed in." };
  const err = await rewriteToday(supabase, patientId, user.id, label, kind, lines);
  if (err) return { ok: false, error: err };
  revalidateEverywhere(patientId);
  return { ok: true };
}

/** Rewrite several vitals / exam signs of today's sheet at once. */
export async function replaceTodayNoteExam(
  patientId: string,
  entries: { label: string; kind: "exam" | "vital"; value: string | null }[]
): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient();
  const user = await currentUser(supabase);
  if (!user) return { ok: false, error: "Not signed in." };
  for (const e of entries) {
    const err = await rewriteToday(supabase, patientId, user.id, e.label, e.kind, e.value ? [e.value] : []);
    if (err) return { ok: false, error: err };
  }
  revalidateEverywhere(patientId);
  return { ok: true };
}

/** Apply the AI-compiled note — rewrite the prose lines and the plan from the proposal. */
export async function applyCompiledNote(
  patientId: string,
  compiled: {
    fields: { complaints: string; sensorium: string; abdomen: string; chest: string; assessment: string };
    plan: string[];
  }
): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient();
  const user = await currentUser(supabase);
  if (!user) return { ok: false, error: "Not signed in." };

  const map: [string, string, string][] = [
    ["complaints", "note", compiled.fields.complaints],
    ["sensorium", "exam", compiled.fields.sensorium],
    ["per abdomen", "exam", compiled.fields.abdomen],
    ["chest", "exam", compiled.fields.chest],
    ["assessment", "note", compiled.fields.assessment],
  ];
  for (const [label, kind, text] of map) {
    const err = await rewriteToday(supabase, patientId, user.id, label, kind, text ? [text] : []);
    if (err) return { ok: false, error: err };
  }
  const perr = await rewriteToday(supabase, patientId, user.id, "plan", "plan", compiled.plan);
  if (perr) return { ok: false, error: perr };

  revalidateEverywhere(patientId);
  return { ok: true };
}
