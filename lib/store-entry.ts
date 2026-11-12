import { NextResponse } from "next/server";
import type { Supa } from "@/lib/supabase/server";
import type { ExtractionResult } from "@/lib/extract";
import type { SpecialtyPack } from "@/lib/specialty";
import { insertObservations } from "@/lib/observations";
import { applyProcedureDone, type PatientForProcedureDone } from "@/lib/apply-procedure-done";

/** The patient columns the note routes (voice, text, case history) read before storing. */
export const ENTRY_PATIENT_COLUMNS =
  "id, ward_id, display_name, bed, surgery_date, post_op_day, admission_day, template_family, template_variant, procedure_text";

/**
 * The tail every note route shares once extraction has succeeded: the entry, its observations,
 * then any operation it marks as done. Returns the new entry's id, or the 500 reply to send.
 * `afterInsert` runs between the entry and its observations (the case history files its photo
 * there). `transcript`, when given, is echoed in the failure reply as the route's own reply does.
 */
export async function storeExtractedEntry(
  supabase: Supa,
  args: {
    patientId: string;
    authorId: string;
    patient: PatientForProcedureDone & { post_op_day: number | null; admission_day: number };
    pack: SpecialtyPack;
    extraction: ExtractionResult;
    row: Record<string, unknown>;
    transcript?: string;
    observationOpts?: Parameters<typeof insertObservations>[5];
    afterInsert?: (entryId: string) => Promise<void>;
  }
): Promise<string | NextResponse> {
  const { patientId, patient, extraction, transcript } = args;
  const { data: entry, error: entryError } = await supabase
    .from("entries")
    .insert({
      patient_id: patientId,
      author_id: args.authorId,
      ...args.row,
      extraction_raw: extraction.raw as never,
    })
    .select("id")
    .single();

  if (entryError || !entry) {
    return NextResponse.json(
      { error: `Could not save: ${entryError?.message ?? "unknown error"}` },
      { status: 500 }
    );
  }

  await args.afterInsert?.(entry.id);

  const obsError = await insertObservations(
    supabase,
    entry.id,
    patientId,
    patient,
    extraction.observations,
    args.observationOpts
  );
  if (obsError) {
    return NextResponse.json(
      { entry_id: entry.id, transcript, observations: [], error: obsError },
      { status: 500 }
    );
  }

  await applyProcedureDone(supabase, patientId, patient, extraction.observations, args.pack);
  return entry.id;
}
