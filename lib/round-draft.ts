import { readRoundDictation, type RoundSegment } from "@/lib/read-round";
import { extractObservations, type ExtractedObservation } from "@/lib/extract";
import { getTemplateForPatient } from "@/lib/templates";
import { matchBed } from "@/lib/match-bed";
import { createClient } from "@/lib/supabase/server";
import { generalPack, type SpecialtyPack } from "@/lib/specialty";
import { log } from "@/lib/observability";

export type DraftSegment = RoundSegment & {
  /** What would be written for this bed. Empty for an admission, or when nothing clinical
   *  was said. Produced by the same extraction the bedside button uses, quote-checks and
   *  all — so a value here is one that survived being checked against the words. */
  observations: ExtractedObservation[];
  /** Extraction threw twice — the AI request failed, not "nothing clinical was said". The
   *  review card says so, and the saved entry carries an extraction_error so the patient page
   *  flags it and offers "Save and re-read". */
  extraction_failed?: boolean;
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
  patients: WardPatient[],
  pack: SpecialtyPack = generalPack
): Promise<RoundDraft> {
  const read = await readRoundDictation(
    transcript,
    patients.map((p) => p.bed),
    pack
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

    // The bed's own patient (when matched) is kept out of what Jev is sent, and so is the
    // bed as spoken.
    const who = patients.find((p) => p.id === match.patientId);
    let observations: ExtractedObservation[] | null = null;
    // One retry, then an honest failure. This used to be a bare catch that showed an empty
    // card as "nothing could be structured" — which hid a rejected request on every
    // no-template patient for weeks (fixed in #150) while residents discarded the rounds.
    for (let attempt = 1; attempt <= 2 && observations === null; attempt++) {
      try {
        const extraction = await extractObservations(segment.text, expectedLabels, [], pack.key, {
          name: who?.display_name,
          bed: who?.bed ?? segment.bed,
        });
        observations = extraction.observations;
      } catch (e) {
        if (attempt === 2)
          log.error("round segment extraction failed", {
            error: e instanceof Error ? e.message.slice(0, 200) : "unknown",
            specialty: pack.key,
          });
      }
    }
    segments.push(
      observations === null
        ? { ...segment, observations: [], extraction_failed: true }
        : { ...segment, observations }
    );
  }

  return { segments, model: read.model, raw: { segments } };
}
