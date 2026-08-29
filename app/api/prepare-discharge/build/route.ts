import { NextResponse } from "next/server";
import { getCurrentWard } from "@/lib/ward";
import { getWardFormats } from "@/lib/formats";
import { getFormularyMappings } from "@/lib/formulary";
import { correctTranscript } from "@/lib/glossary";
import { extractObservations } from "@/lib/extract";
import { derivePatientState, type Observation } from "@/lib/patient-state";
import { buildDischargeNote } from "@/lib/discharge";
import { createClient } from "@/lib/supabase/server";
import type { ReadLabValue } from "@/lib/read-lab-photo";
import type { PaperKind } from "@/lib/read-paper";

/**
 * Assemble a one-off discharge summary from pages that belong to nobody in WardMate.
 *
 * Everything here happens in memory and nothing is written: the transcripts are structured by
 * the same extractor, run through the same state derivation, and handed to the same
 * buildDischargeNote the ward's own patients use — so the document is the document, not a
 * lookalike. What it does NOT get is a record: no observation rows, no to-do list, no post-op
 * day counted from tomorrow, and no (i) to tap afterwards. That is the trade the resident
 * makes by using it, and the screen says so before they do.
 *
 * The heading, logo and formulary come from the doctor's OWN current unit. A summary written
 * for another unit's patient still goes out on the paper of the unit writing it, which is what
 * signing it means.
 */
type IncomingPage = {
  kind: PaperKind;
  transcript: string;
  labValues: ReadLabValue[] | null;
};

type Identity = {
  name?: string;
  age?: string;
  sex?: string;
  ipNo?: string;
  mrdNo?: string;
  admittedOn?: string;
  procedure?: string;
  surgeryDate?: string;
};

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  let body: { pages?: IncomingPage[]; identity?: Identity };
  try {
    body = (await request.json()) as { pages?: IncomingPage[]; identity?: Identity };
  } catch {
    return NextResponse.json({ error: "Malformed request." }, { status: 400 });
  }

  const pages = (body.pages ?? []).filter(
    (p) => (p.transcript && p.transcript.trim()) || (p.labValues && p.labValues.length > 0)
  );
  if (pages.length === 0) {
    return NextResponse.json({ error: "There is nothing to build from." }, { status: 400 });
  }

  const identity = body.identity ?? {};
  if (!identity.name?.trim()) {
    return NextResponse.json({ error: "Type the patient's name first." }, { status: 400 });
  }

  const { ward } = await getCurrentWard();

  // Ids are needed only because the shapes downstream carry them; nothing is stored, so they
  // exist for the length of this request and are then gone.
  const observations: Observation[] = [];
  const now = new Date().toISOString();

  for (const page of pages) {
    if (page.kind === "lab_report" && page.labValues && page.labValues.length > 0) {
      for (const v of page.labValues) {
        observations.push({
          id: crypto.randomUUID(),
          kind: "lab",
          label: v.label,
          value_text: v.value_text,
          value_num: v.value_num,
          unit: v.unit,
          source_quote: v.source_quote,
          needs_confirmation: true,
          confirmed_at: null,
          conflict_note: v.uncertain ? "Printing was unclear — check against the photo." : null,
          done_at: null,
          urgency: null,
          graded_at: null,
          recorded_at: now,
          ref_low: v.ref_low,
          ref_high: v.ref_high,
          ref_text: v.ref_text,
        } as Observation);
      }
      continue;
    }

    const corrected = await correctTranscript(page.transcript);
    let extraction;
    try {
      extraction = await extractObservations(corrected.text, []);
    } catch {
      // One page that will not structure does not lose the others. It simply contributes
      // nothing, which the screen reports rather than hiding.
      continue;
    }

    for (const o of extraction.observations) {
      observations.push({
        id: crypto.randomUUID(),
        kind: o.kind,
        label: o.label,
        value_text: o.value_text,
        value_num: o.value_num,
        unit: o.unit,
        source_quote: o.source_quote,
        needs_confirmation: true,
        confirmed_at: null,
        conflict_note: null,
        done_at: null,
        urgency: o.urgency,
        graded_at: null,
        recorded_at: now,
      } as Observation);
    }
  }

  const state = derivePatientState(observations, null);
  const medications = observations.filter((o) => o.kind === "medication");

  const age = Number(identity.age);
  const admitted = identity.admittedOn?.trim() || now.slice(0, 10);

  const [formats, formularyMappings] = await Promise.all([
    ward ? getWardFormats(ward.id) : Promise.resolve(new Map()),
    ward ? getFormularyMappings(ward.id) : Promise.resolve(new Map<string, string>()),
  ]);

  const note = buildDischargeNote(
    {
      display_name: identity.name.trim(),
      age_years: Number.isFinite(age) && age > 0 ? age : null,
      sex: identity.sex?.trim() || null,
      bed: "",
      mrd_no: identity.mrdNo?.trim() || null,
      uhid_ip_no: identity.ipNo?.trim() || null,
      primary_diagnosis: null,
      admitted_on: admitted,
      surgery_date: identity.surgeryDate?.trim() || null,
      post_op_day: null,
      admission_day: 1,
      management: null,
    },
    state,
    medications,
    identity.procedure?.trim() || null,
    {
      wardName: ward?.name ?? null,
      letterhead: ward?.letterhead ?? null,
      logoUrl: (formats.get("logo") as { url: string | null } | undefined)?.url ?? null,
      formularyMappings,
    }
  );

  return NextResponse.json({ note, observations: observations.length });
}
