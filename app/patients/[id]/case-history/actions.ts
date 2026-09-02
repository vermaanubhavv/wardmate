"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { HISTORY_SECTION_LABEL, EXAM_SECTION_LABEL } from "@/lib/case-history-sections";

/**
 * Writes from the case-history review workspace.
 *
 * There is no separate draft — everything lands in the same `entries` / `observations` the
 * clerking photo and dictation already write to, flagged `is_case_history`. Each card OWNS its
 * section: when the resident changes a card and leaves it, that section's observations are
 * rewritten wholesale from what the card holds. The card seeded itself from those same
 * observations on the way in, so nothing recorded is lost — it is round-tripped through the
 * card the resident is looking at. The photo/audio entry and its transcript stay untouched
 * under "As recorded — evidence and corrections".
 *
 * A value the resident types is confirmed by the act of typing it, the same rule
 * app/patients/[id]/actions.ts#updateObservation follows. The typed sentence is its own
 * source_quote (the schema requires that column non-blank).
 */

function revalidateEverywhere(patientId: string) {
  revalidatePath(`/patients/${patientId}`);
  revalidatePath(`/patients/${patientId}/case-history`);
  revalidatePath(`/patients/${patientId}/note`);
  revalidatePath("/todo");
  revalidatePath("/handover");
  revalidatePath("/");
  revalidatePath("/ward");
}

type Supa = Awaited<ReturnType<typeof createClient>>;

/** The workspace's own manual case-history entry, created the first time it needs one. */
async function manualEntryId(supabase: Supa, patientId: string, userId: string): Promise<string | null> {
  const { data: existing } = await supabase
    .from("entries")
    .select("id")
    .eq("patient_id", patientId)
    .eq("is_case_history", true)
    .eq("source", "manual")
    .order("recorded_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  if (existing?.id) return existing.id as string;

  const { data: created } = await supabase
    .from("entries")
    .insert({
      patient_id: patientId,
      author_id: userId,
      source: "manual",
      is_case_history: true,
      transcript: "Built in case-history review",
    })
    .select("id")
    .single();
  return (created?.id as string | undefined) ?? null;
}

/** Every case-history entry id for this patient — used to scope deletes to the case history. */
async function caseHistoryEntryIds(supabase: Supa, patientId: string): Promise<string[]> {
  const { data } = await supabase
    .from("entries")
    .select("id")
    .eq("patient_id", patientId)
    .eq("is_case_history", true);
  return (data ?? []).map((e) => e.id as string);
}

async function currentUser(supabase: Supa) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

/**
 * Rewrite one section of the case history from what its card holds.
 *
 * `lines` is the full desired content for the section (a list of one-line strings). Every
 * existing case-history observation with this label is removed first, then the lines are
 * written fresh. An empty list clears the section.
 */
export async function replaceCaseHistorySection(
  patientId: string,
  label: string,
  kind: "note" | "exam" | "vital",
  lines: string[]
): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient();
  const user = await currentUser(supabase);
  if (!user) return { ok: false, error: "Not signed in." };

  const clean = lines.map((l) => l.trim()).filter(Boolean);
  const entryIds = await caseHistoryEntryIds(supabase, patientId);

  if (entryIds.length > 0) {
    const { error: delErr } = await supabase
      .from("observations")
      .delete()
      .eq("patient_id", patientId)
      .in("entry_id", entryIds)
      .ilike("label", label);
    if (delErr) return { ok: false, error: delErr.message };
  }

  if (clean.length > 0) {
    const entryId = await manualEntryId(supabase, patientId, user.id);
    if (!entryId) return { ok: false, error: "Could not open the case history." };
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
        confirmed_by: user.id,
      }))
    );
    if (error) return { ok: false, error: error.message };
  }

  revalidateEverywhere(patientId);
  return { ok: true };
}

/**
 * Rewrite several examination signs at once — the PICCLE / Vitals / P-Abdomen / Chest / Local
 * cards. Each entry is one sign: `value` null clears it, otherwise it becomes the single
 * observation for that label. Point-in-time facts, so each label is replaced outright (the
 * card seeded from the same observations, so nothing is lost).
 */
export async function replaceCaseHistoryExam(
  patientId: string,
  entries: { label: string; kind: "exam" | "vital"; value: string | null }[]
): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient();
  const user = await currentUser(supabase);
  if (!user) return { ok: false, error: "Not signed in." };

  const entryIds = await caseHistoryEntryIds(supabase, patientId);
  const labels = entries.map((e) => e.label);

  if (entryIds.length > 0 && labels.length > 0) {
    const { error: delErr } = await supabase
      .from("observations")
      .delete()
      .eq("patient_id", patientId)
      .in("entry_id", entryIds)
      .in("label", labels);
    if (delErr) return { ok: false, error: delErr.message };
  }

  const rows = entries
    .filter((e) => (e.value ?? "").trim())
    .map((e) => ({ ...e, value: (e.value as string).trim() }));

  if (rows.length > 0) {
    const manualId = await manualEntryId(supabase, patientId, user.id);
    if (!manualId) return { ok: false, error: "Could not open the case history." };
    const now = new Date().toISOString();
    const { error } = await supabase.from("observations").insert(
      rows.map((e) => ({
        entry_id: manualId,
        patient_id: patientId,
        kind: e.kind,
        label: e.label,
        value_text: e.value,
        source_quote: e.value,
        needs_confirmation: false,
        confirmed_at: now,
        confirmed_by: user.id,
      }))
    );
    if (error) return { ok: false, error: error.message };
  }

  revalidateEverywhere(patientId);
  return { ok: true };
}

/**
 * Apply the AI-compiled prose — replace each history section with its rewritten paragraph.
 * Only the history sections are touched; examination signs stay structured for the PICCLE /
 * vitals engine.
 */
export async function applyCompiledCaseHistory(
  patientId: string,
  sections: { label: string; text: string }[]
): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient();
  const user = await currentUser(supabase);
  if (!user) return { ok: false, error: "Not signed in." };

  const allowed = new Set([
    "chief complaints",
    "history of presenting illness",
    "past history",
    "family history",
    "medication history",
    "surgical history",
    "menstrual and obstetric history",
  ]);
  const clean = sections
    .map((s) => ({ label: s.label.toLowerCase().trim(), text: s.text.trim() }))
    .filter((s) => s.text && allowed.has(s.label));
  if (clean.length === 0) return { ok: true };

  const entryIds = await caseHistoryEntryIds(supabase, patientId);
  const manualId = await manualEntryId(supabase, patientId, user.id);
  if (!manualId) return { ok: false, error: "Could not open the case history." };
  const now = new Date().toISOString();

  for (const s of clean) {
    if (entryIds.length > 0) {
      const { error: delErr } = await supabase
        .from("observations")
        .delete()
        .eq("patient_id", patientId)
        .in("entry_id", entryIds)
        .ilike("label", s.label);
      if (delErr) return { ok: false, error: delErr.message };
    }
    const { error } = await supabase.from("observations").insert({
      entry_id: manualId,
      patient_id: patientId,
      kind: "note",
      label: s.label,
      value_text: s.text,
      source_quote: s.text,
      needs_confirmation: false,
      confirmed_at: now,
      confirmed_by: user.id,
    });
    if (error) return { ok: false, error: error.message };
  }

  revalidateEverywhere(patientId);
  return { ok: true };
}

/**
 * Append live-dictation segments to the case history.
 *
 * The "dictate the whole clerking" overlay sends these as the resident speaks — each segment
 * is a span of transcript already sorted into a section by lib/case-history-routing.ts. This
 * only APPENDS; it never rewrites a card the resident has touched. A card is still not final
 * until the resident reviews it and the workspace saves it.
 *
 * `examination`, `diagnosis` and `plan` segments are deliberately NOT written here — they need
 * the resident to place them (general exam is structured toggles; diagnosis and plan go
 * through the AI-proposal-and-approve flow). The overlay shows those for review instead.
 */
type DictationSegment = { section: string; complaint?: string | null; text: string };

export async function appendCaseHistoryDictation(
  patientId: string,
  segments: DictationSegment[]
): Promise<{ ok: boolean; error?: string; written: number }> {
  const supabase = await createClient();
  const user = await currentUser(supabase);
  if (!user) return { ok: false, error: "Not signed in.", written: 0 };

  const clean = segments
    .map((s) => ({ section: s.section, complaint: (s.complaint ?? "").trim(), text: s.text.trim() }))
    .filter((s) => s.text);
  if (clean.length === 0) return { ok: true, written: 0 };

  const entryId = await manualEntryId(supabase, patientId, user.id);
  if (!entryId) return { ok: false, error: "Could not open the case history.", written: 0 };
  const now = new Date().toISOString();
  const stamp = { needs_confirmation: false, confirmed_at: now, confirmed_by: user.id };

  const rows: Record<string, unknown>[] = [];

  // History sections and HOPI: one appended row per segment — the workspace joins multiple
  // rows for a section on the way back in, so nothing is lost.
  for (const s of clean) {
    if (s.section === "hopi") {
      const value = `${s.complaint || "Presenting illness"}: ${s.text}`;
      rows.push({ entry_id: entryId, patient_id: patientId, kind: "note", label: "history of presenting illness", value_text: value, source_quote: value, ...stamp });
    } else if (HISTORY_SECTION_LABEL[s.section]) {
      const label = HISTORY_SECTION_LABEL[s.section];
      rows.push({ entry_id: entryId, patient_id: patientId, kind: "note", label, value_text: s.text, source_quote: s.text, ...stamp });
    }
  }

  if (rows.length > 0) {
    const { error } = await supabase.from("observations").insert(rows);
    if (error) return { ok: false, error: error.message, written: 0 };
  }

  // The three free-text examination cards show one value each (the workspace reads the first
  // observation for the label), so those are read-modify-write: append to what is there.
  const examSections = Array.from(new Set(clean.filter((s) => EXAM_SECTION_LABEL[s.section]).map((s) => s.section)));
  if (examSections.length > 0) {
    const entryIds = await caseHistoryEntryIds(supabase, patientId);
    for (const section of examSections) {
      const label = EXAM_SECTION_LABEL[section];
      const addition = clean.filter((s) => s.section === section).map((s) => s.text).join("; ");
      let existing: { id: string; value_text: string | null } | null = null;
      if (entryIds.length > 0) {
        const { data } = await supabase
          .from("observations")
          .select("id, value_text")
          .eq("patient_id", patientId)
          .in("entry_id", entryIds)
          .ilike("label", label)
          .order("recorded_at", { ascending: true })
          .limit(1)
          .maybeSingle();
        existing = (data as { id: string; value_text: string | null } | null) ?? null;
      }
      if (existing) {
        const merged = [existing.value_text?.trim(), addition].filter(Boolean).join("; ");
        const { error } = await supabase
          .from("observations")
          .update({ value_text: merged, source_quote: merged })
          .eq("id", existing.id);
        if (error) return { ok: false, error: error.message, written: 0 };
      } else {
        const { error } = await supabase
          .from("observations")
          .insert({ entry_id: entryId, patient_id: patientId, kind: "exam", label, value_text: addition, source_quote: addition, ...stamp });
        if (error) return { ok: false, error: error.message, written: 0 };
      }
    }
  }

  revalidateEverywhere(patientId);
  return { ok: true, written: rows.length + examSections.length };
}

/** Approve the AI-proposed provisional diagnosis — writes it to the patient record. */
export async function approveCaseHistoryDiagnosis(
  patientId: string,
  text: string
): Promise<{ ok: boolean; error?: string }> {
  const value = text.trim();
  if (!value) return { ok: false, error: "Nothing to approve yet." };

  const supabase = await createClient();
  const user = await currentUser(supabase);
  if (!user) return { ok: false, error: "Not signed in." };

  const { error } = await supabase
    .from("patients")
    .update({ primary_diagnosis: value })
    .eq("id", patientId);
  if (error) return { ok: false, error: error.message };

  revalidateEverywhere(patientId);
  return { ok: true };
}

/**
 * Approve the AI-proposed initial plan — writes each item as a `plan` observation, which is
 * what puts it on the to-do list. Existing open plans with the same text are left alone so
 * re-approving does not duplicate them.
 */
export async function approveCaseHistoryPlan(
  patientId: string,
  items: string[]
): Promise<{ ok: boolean; error?: string }> {
  const clean = items.map((i) => i.trim()).filter(Boolean);
  if (clean.length === 0) return { ok: true };

  const supabase = await createClient();
  const user = await currentUser(supabase);
  if (!user) return { ok: false, error: "Not signed in." };

  const { data: existing } = await supabase
    .from("observations")
    .select("value_text")
    .eq("patient_id", patientId)
    .eq("kind", "plan");
  const have = new Set((existing ?? []).map((o) => (o.value_text ?? "").trim().toLowerCase()));

  const fresh = clean.filter((t) => !have.has(t.toLowerCase()));
  if (fresh.length === 0) {
    revalidateEverywhere(patientId);
    return { ok: true };
  }

  const entryId = await manualEntryId(supabase, patientId, user.id);
  if (!entryId) return { ok: false, error: "Could not open the case history." };
  const now = new Date().toISOString();
  const { error } = await supabase.from("observations").insert(
    fresh.map((text) => ({
      entry_id: entryId,
      patient_id: patientId,
      kind: "plan",
      label: "plan",
      value_text: text,
      source_quote: text,
      needs_confirmation: false,
      confirmed_at: now,
      confirmed_by: user.id,
    }))
  );
  if (error) return { ok: false, error: error.message };

  revalidateEverywhere(patientId);
  return { ok: true };
}
