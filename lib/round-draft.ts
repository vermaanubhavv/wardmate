import { readRoundDictation, type RoundSegment } from "@/lib/read-round";
import { extractObservations, type ExtractedObservation } from "@/lib/extract";
import { getTemplateForPatient } from "@/lib/templates";
import { matchBed } from "@/lib/match-bed";
import { createClient } from "@/lib/supabase/server";

export type DraftSegment = RoundSegment & {
  /** What would be written for this bed. Empty for an admission, or when nothing clinical
   *  was said. Produced by the same extraction the bedside button uses, quote-checks and
   *  all — so a value here is one that survived being checked against the words. */
  observations: ExtractedObservation[];
};

export type RoundDraft = {
  segments: DraftSegment[];
  model: string;
  raw: unknown;
};

type WardPatient = { id: string; display_name: string; bed: string };

/**
 * Turn one dictation into a reviewable draft: split by bed, then structured per bed.
 *
 * The structuring is done HERE, before the resident is asked to approve anything, rather than
 * at the moment of writing. That is the whole point of the review screen — approving a
 * segment has to mean approving the values it will produce, not merely the sentence it came
 * from. Doing it at apply time would show the resident words and store something else.
 */
export async function buildRoundDraft(
  transcript: string,
  patients: WardPatient[]
): Promise<RoundDraft> {
  const read = await readRoundDictation(
    transcript,
    patients.map((p) => p.bed)
  );

  const supabase = await createClient();
  const segments: DraftSegment[] = [];

  for (const segment of read.segments) {
    if (segment.intent === "new_patient") {
      segments.push({ ...segment, observations: [] });
      continue;
    }

    // The matched patient is used only to name things consistently with their template. It
    // is not stored: the review screen re-matches against the ward as it stands then, so a
    // bed that changed in between cannot silently send an instruction to the wrong person.
    const match = matchBed(segment.bed, patients);
    let expectedLabels: string[] = [];

    if (match.patientId) {
      const { data: patient } = await supabase
        .from("current_patients")
        .select("surgery_date, template_family, template_variant")
        .eq("id", match.patientId)
        .maybeSingle();

      if (patient) {
        const template = await getTemplateForPatient(patient);
        expectedLabels = template?.items.map((i) => i.label) ?? [];
      }
    }

    try {
      const extraction = await extractObservations(segment.text, expectedLabels);
      segments.push({ ...segment, observations: extraction.observations });
    } catch {
      // The words survive even when structuring fails — they are the evidence, and the
      // resident can still approve the segment and see the sentence on the patient.
      segments.push({ ...segment, observations: [] });
    }
  }

  return { segments, model: read.model, raw: { segments } };
}
