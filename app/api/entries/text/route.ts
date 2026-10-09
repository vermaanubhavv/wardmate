import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/auth";
import { extractObservations } from "@/lib/extract";
import { getTemplateForPatient } from "@/lib/templates";
import { getPublishedProtocolContext } from "@/lib/protocols";
import { applyProcedureDone } from "@/lib/apply-procedure-done";
import { insertObservations } from "@/lib/observations";

/**
 * Typed note in, stored observations out — the voice route with the speech step removed.
 *
 * Everything downstream is shared with speech, including the check that every value's quote
 * is a verbatim span of the source. Against typed text that check is if anything stricter,
 * since there is no transcription error to absorb. Typing is a different input, not a
 * different set of rules.
 */
export async function POST(request: Request) {
  const supabase = await createClient();

  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  const body = await request.json().catch(() => null);
  const patientId = String(body?.patient_id ?? "");
  const text = String(body?.text ?? "").trim();

  if (!patientId) return NextResponse.json({ error: "No patient." }, { status: 400 });
  if (!text) return NextResponse.json({ error: "Nothing was typed." }, { status: 400 });
  if (text.length > 5000) {
    return NextResponse.json({ error: "That note is too long." }, { status: 413 });
  }

  const { data: patient } = await supabase
    .from("current_patients")
    .select(
      "id, display_name, bed, surgery_date, post_op_day, admission_day, template_family, template_variant, procedure_text"
    )
    .eq("id", patientId)
    .maybeSingle();

  if (!patient) return NextResponse.json({ error: "Patient not found." }, { status: 404 });

  const template = await getTemplateForPatient(patient);
  const expectedLabels = template?.items.map((i) => i.label) ?? [];
  const protocols = await getPublishedProtocolContext();

  let extraction;
  try {
    extraction = await extractObservations(text, expectedLabels, protocols, undefined, { name: patient.display_name, bed: patient.bed });
  } catch (e) {
    // Keep the note even when structuring fails — the words are the evidence.
    const { data: entry } = await supabase
      .from("entries")
      .insert({
        patient_id: patientId,
        author_id: user.id,
        source: "manual",
        transcript: text,
        extraction_error: e instanceof Error ? e.message : String(e),
      })
      .select("id")
      .single();

    return NextResponse.json({
      entry_id: entry?.id ?? null,
      observations: [],
      error: "Saved your note, but could not structure it.",
    });
  }

  const { data: entry, error: entryError } = await supabase
    .from("entries")
    .insert({
      patient_id: patientId,
      author_id: user.id,
      source: "manual",
      transcript: text,
      extraction_model: extraction.model,
      extraction_raw: extraction.raw as never,
      matched_protocol_ids: extraction.matchedProtocolIds,
    })
    .select("id")
    .single();

  if (entryError || !entry) {
    return NextResponse.json(
      { error: `Could not save: ${entryError?.message ?? "unknown error"}` },
      { status: 500 }
    );
  }

  const obsError = await insertObservations(
    supabase,
    entry.id,
    patientId,
    patient,
    extraction.observations,
    { verb: "wrote" }
  );
  if (obsError) {
    return NextResponse.json(
      { entry_id: entry.id, observations: [], error: obsError },
      { status: 500 }
    );
  }

  await applyProcedureDone(supabase, patientId, patient, extraction.observations);

  return NextResponse.json({
    entry_id: entry.id,
    observations: extraction.observations,
    discarded: extraction.rejected.length,
  });
}
