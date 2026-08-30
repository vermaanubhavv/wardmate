import { NextResponse } from "next/server";
import { getCurrentWard } from "@/lib/ward";
import { getWardFormats } from "@/lib/formats";
import { getFormularyMappings } from "@/lib/formulary";
import { correctTranscript } from "@/lib/glossary";
import { extractObservations } from "@/lib/extract";
import { derivePatientState, type Observation } from "@/lib/patient-state";
import { compileDischargeDraft } from "@/lib/discharge-compile";
import { buildDischargeDocument } from "@/lib/discharge-render";
import { matchDischargeTemplate, getDischargeTemplate, listDischargeTemplates } from "@/lib/discharge-templates";
import { oneOffContext, type OneOffIdentity } from "@/lib/discharge-oneoff";
import { createClient } from "@/lib/supabase/server";
import type { ReadLabValue } from "@/lib/read-lab-photo";
import type { PaperKind } from "@/lib/read-paper";

/**
 * Assemble a one-off discharge summary from pages that belong to nobody in WardMate.
 *
 * Everything here happens in memory and nothing is written: the transcripts are structured by
 * the same extractor, run through the same state derivation, compiled by the same
 * compileDischargeDraft, and rendered by the same buildDischargeDocument the ward's own
 * patients use — so the document is the document. What it does NOT get is a record, and — for
 * the same reason there is no resident approval step here — the AI sections (Clinical Course,
 * Relevant Investigations) are left blank for the resident to write by hand on the printout.
 * The heading, logo and formulary come from the doctor's OWN current unit.
 */
type IncomingPage = {
  kind: PaperKind;
  transcript: string;
  labValues: ReadLabValue[] | null;
};

type Identity = OneOffIdentity;

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  let body: { pages?: IncomingPage[]; identity?: Identity; templateKey?: string | null };
  try {
    body = (await request.json()) as { pages?: IncomingPage[]; identity?: Identity; templateKey?: string | null };
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

  const patientState = derivePatientState(observations, null);

  const seenDrugs = new Set<string>();
  const medications = observations
    .filter((o) => o.kind === "medication")
    .filter((o) => {
      const key = o.label.toLowerCase().trim();
      if (seenDrugs.has(key)) return false;
      seenDrugs.add(key);
      return true;
    });

  const [formats, formularyMappings] = await Promise.all([
    ward ? getWardFormats(ward.id) : Promise.resolve(new Map()),
    ward ? getFormularyMappings(ward.id) : Promise.resolve(new Map<string, string>()),
  ]);

  const context = oneOffContext(
    identity,
    ward ?? null,
    (formats.get("logo") as { url: string | null } | undefined)?.url ?? null,
    formularyMappings,
    observations,
    patientState,
    medications
  );

  // The diagnosis template: an explicit "no template" wins; then the resident's explicit
  // choice; otherwise the one the typed procedure / diagnosis points at.
  const template =
    body.templateKey === "__none__"
      ? null
      : (getDischargeTemplate(body.templateKey) ??
        matchDischargeTemplate({
          procedureText: identity.procedure,
          diagnosisText: identity.diagnosis,
        }));

  const draft = compileDischargeDraft(context, { template, seedAll: true });
  const doc = buildDischargeDocument(draft, context);

  return NextResponse.json({
    doc,
    draft,
    observations: observations.length,
    template: template ? { key: template.key, label: template.label } : null,
    templates: listDischargeTemplates(),
  });
}
