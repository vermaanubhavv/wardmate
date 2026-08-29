import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { correctTranscript } from "@/lib/glossary";
import { extractObservations } from "@/lib/extract";
import { getTemplateForPatient } from "@/lib/templates";
import { resolveProcedure, listTemplateChoices } from "@/lib/templates";
import type { PaperKind } from "@/lib/read-paper";
import type { ReadLabValue } from "@/lib/read-lab-photo";

/**
 * Store the pages the resident has just reviewed.
 *
 * Nothing new is invented about how a page becomes a record: each transcript goes through
 * correctTranscript and then extractObservations, with its verbatim-quote check, and lands in
 * entries + observations exactly as a dictated note does. That reuse is the point. A
 * photographed operation note ends up as observations that can be traced, confirmed, corrected
 * and shown behind the (i) — not as a document sitting outside everything the app knows.
 *
 * EVERY observation from this path is marked needs_confirmation. Speech has an automatic check
 * behind it — the transcript is kept, and the quote must appear in it. A photograph has no such
 * second reading: nothing on the server can look at the page again. So a human's eyes against
 * the original are the check, which is the same reason app/api/entries/photo/route.ts marks
 * every lab value off a photo, and app/api/entries/case-history/route.ts every value off a
 * photographed clerking sheet.
 *
 * The pages are stored in the order the resident arranged them, one entry each, so the record
 * by day reads as a pile of papers rather than one undifferentiated import.
 */

type IncomingPage = {
  kind: PaperKind;
  transcript: string;
  photoPath: string | null;
  labValues: ReadLabValue[] | null;
  model: string | null;
  /** Set only when the resident ticked the operation note's "mark this patient as operated"
   *  box. Absent otherwise — an operation note read off a photograph does not flip a patient
   *  to post-operative on its own. */
  markOperated: { procedure: string; surgeryDate: string } | null;
};

/** What each kind of paper is called in the record, so the entry says where it came from. */
const PAGE_LABEL: Record<PaperKind, string> = {
  case_sheet: "Case sheet",
  ot_note: "OT note",
  lab_report: "Lab report",
  prescription: "Prescription",
  advice: "Advice / follow-up",
  other: "Paper",
};

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: patientId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  const { data: patient } = await supabase
    .from("current_patients")
    .select("id, surgery_date, post_op_day, admission_day, template_family, template_variant, procedure_text")
    .eq("id", patientId)
    .maybeSingle();
  if (!patient) return NextResponse.json({ error: "Patient not found." }, { status: 404 });

  let body: { pages?: IncomingPage[] };
  try {
    body = (await request.json()) as { pages?: IncomingPage[] };
  } catch {
    return NextResponse.json({ error: "Malformed request." }, { status: 400 });
  }

  const pages = (body.pages ?? []).filter(
    (p) => (p.transcript && p.transcript.trim()) || (p.labValues && p.labValues.length > 0)
  );
  if (pages.length === 0) {
    return NextResponse.json({ error: "There is nothing to store." }, { status: 400 });
  }

  const template = await getTemplateForPatient(patient);
  // The same naming constraint the round and the case history use: it decides what a value is
  // CALLED, never whether one exists. A section nobody wrote stays absent.
  const HISTORY_SECTIONS = [
    "chief complaints",
    "history of presenting illness",
    "past history",
    "family history",
  ];
  const OPERATION_SECTIONS = [
    "procedure",
    "operative findings",
    "post-operative orders",
  ];
  const expectedLabels = [
    ...(template?.items.map((i) => i.label) ?? []),
    ...HISTORY_SECTIONS,
    ...OPERATION_SECTIONS,
  ];

  const stored: { kind: PaperKind; entryId: string | null; observations: number; error: string | null }[] = [];

  /**
   * The operation note's own answer to "has this patient been operated on, and when".
   *
   * surgery_date is the single fact the post-op day count, the summary's operative date, the
   * progress note's status line and which checklist applies all hang off — see
   * lib/apply-procedure-done.ts, which does this when a ROUND says the operation was done.
   * A photographed note is not a round: a heading reading "PROCEDURE : Laparoscopic
   * cholecystectomy" is a description of a page, and pages of old notes get photographed too.
   * So this only runs when the resident ticked the box on the review screen, and it still
   * refuses to overwrite a surgery date the patient already has.
   */
  const operated = pages.find((p) => p.kind === "ot_note" && p.markOperated)?.markOperated ?? null;
  if (operated && !patient.surgery_date) {
    const resolved = resolveProcedure(operated.procedure, await listTemplateChoices());
    await supabase
      .from("patients")
      .update({
        surgery_date: operated.surgeryDate,
        planned_surgery_date: null,
        procedure_text: patient.procedure_text ?? resolved.procedure_text,
        // Never overwrite a template chosen at admission; only fill an empty one.
        template_family: patient.template_family ?? resolved.template_family,
        template_variant: patient.template_family ? patient.template_variant : resolved.template_variant,
      })
      .eq("id", patientId);
  }

  for (const page of pages) {
    // A lab report goes in as the values its own reader read, each with the range printed
    // beside it. Running a transcript of a results table through the extractor instead would
    // throw those ranges away.
    if (page.kind === "lab_report" && page.labValues && page.labValues.length > 0) {
      const { data: entry, error: entryError } = await supabase
        .from("entries")
        .insert({
          patient_id: patientId,
          author_id: user.id,
          source: "photo",
          transcript: page.transcript || null,
          photo_path: page.photoPath,
          extraction_model: page.model,
        })
        .select("id")
        .single();

      if (entryError || !entry) {
        stored.push({ kind: page.kind, entryId: null, observations: 0, error: entryError?.message ?? "Could not save." });
        continue;
      }

      const rows = page.labValues.map((v) => ({
        entry_id: entry.id,
        patient_id: patientId,
        kind: "lab" as const,
        label: v.label,
        value_text: v.value_text,
        value_num: v.value_num,
        unit: v.unit,
        source_quote: v.source_quote,
        needs_confirmation: true,
        ref_low: v.ref_low,
        ref_high: v.ref_high,
        ref_text: v.ref_text,
        conflict_note: v.uncertain ? "Printing was unclear — check against the photo." : null,
      }));

      const { error: obsError } = await supabase.from("observations").insert(rows);
      stored.push({
        kind: page.kind,
        entryId: entry.id,
        observations: obsError ? 0 : rows.length,
        error: obsError?.message ?? null,
      });
      continue;
    }

    // Everything else is a page of words: corrected, then structured, exactly like speech.
    const corrected = await correctTranscript(page.transcript);
    const transcript = corrected.text;

    let extraction;
    let extractionError: string | null = null;
    try {
      extraction = await extractObservations(transcript, expectedLabels);
    } catch (e) {
      extractionError = e instanceof Error ? e.message : String(e);
    }

    const { data: entry, error: entryError } = await supabase
      .from("entries")
      .insert({
        patient_id: patientId,
        author_id: user.id,
        source: "photo",
        // A clerking sheet is the case history; the others are ordinary entries on the record.
        is_case_history: page.kind === "case_sheet",
        transcript,
        original_transcript: page.transcript === transcript ? null : page.transcript,
        photo_path: page.photoPath,
        extraction_model: page.model,
        extraction_raw: (extraction?.raw ?? null) as never,
        extraction_error: extractionError,
      })
      .select("id")
      .single();

    if (entryError || !entry) {
      stored.push({ kind: page.kind, entryId: null, observations: 0, error: entryError?.message ?? "Could not save." });
      continue;
    }

    if (!extraction) {
      // The words are saved even when structuring fails — the transcript is the evidence, and
      // the resident can read it on the record. Same as a round note that would not structure.
      stored.push({ kind: page.kind, entryId: entry.id, observations: 0, error: `${PAGE_LABEL[page.kind]} saved, but could not be structured.` });
      continue;
    }

    const rows = extraction.observations.map((o) => ({
      entry_id: entry.id,
      patient_id: patientId,
      kind: o.kind,
      label: o.label,
      value_text: o.value_text,
      value_num: o.value_num,
      unit: o.unit,
      source_quote: o.source_quote,
      // Every one, not only the ones the extractor flagged: see the note at the top of this
      // file. A photograph has no second reading behind it.
      needs_confirmation: true,
      urgency: o.urgency,
      pac_verdict: o.pac_verdict,
    }));

    if (rows.length === 0) {
      stored.push({ kind: page.kind, entryId: entry.id, observations: 0, error: null });
      continue;
    }

    const { error: obsError } = await supabase.from("observations").insert(rows);
    stored.push({
      kind: page.kind,
      entryId: entry.id,
      observations: obsError ? 0 : rows.length,
      error: obsError?.message ?? null,
    });
  }

  return NextResponse.json({ stored });
}
