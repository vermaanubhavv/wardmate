import { NextResponse } from "next/server";
import { getCurrentWard, getWardSpecialtyStored, getWardIsEsicFaridabad } from "@/lib/ward";
import { getWardFormats } from "@/lib/formats";
import { getFormularyMappings } from "@/lib/formulary";
import { correctTranscript } from "@/lib/glossary";
import { extractObservations } from "@/lib/extract";
import { derivePatientState, type Observation } from "@/lib/patient-state";
import { buildDischargeDocument } from "@/lib/discharge-render";
import { getSpecialtyPack } from "@/lib/specialty";
import { listDischargeTemplatesFor } from "@/lib/specialty/discharge";
import { buildOneOffDraft, oneOffContext, type OneOffIdentity } from "@/lib/discharge-oneoff";
import { getUser } from "@/lib/auth";
import type { ReadLabValue } from "@/lib/read-lab-photo";
import { labRow } from "@/lib/observations";
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
  const user = await getUser();
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
  // No pages is allowed: the summary is then the chosen template's skeleton alone.

  const identity = body.identity ?? {};
  if (!identity.name?.trim()) {
    return NextResponse.json({ error: "Type the patient's name first." }, { status: 400 });
  }

  const { ward } = await getCurrentWard();

  const observations: Observation[] = [];
  const now = new Date().toISOString();

  // Which department this unit is: its templates, its speech corrections and its extraction
  // prompt. An oncology unit is never offered "Lap chole" or a PAS→PAC rewrite.
  const pack = getSpecialtyPack(ward ? await getWardSpecialtyStored(ward.id) : null);

  for (const page of pages) {
    if (page.kind === "lab_report" && page.labValues && page.labValues.length > 0) {
      for (const v of page.labValues) {
        observations.push({
          id: crypto.randomUUID(),
          kind: "lab",
          ...labRow(v),
          confirmed_at: null,
          done_at: null,
          urgency: null,
          graded_at: null,
          recorded_at: now,
        } as Observation);
      }
      continue;
    }

    const corrected = await correctTranscript(page.transcript, pack);
    let extraction;
    try {
      extraction = await extractObservations(corrected.text, [], [], pack.key, { name: identity.name });
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

  const [formats, formularyMappings, isEsicFaridabad] = await Promise.all([
    ward ? getWardFormats(ward.id) : Promise.resolve(new Map()),
    ward ? getFormularyMappings(ward.id) : Promise.resolve(new Map<string, string>()),
    ward ? getWardIsEsicFaridabad(ward.id) : Promise.resolve(true),
  ]);


  const context = oneOffContext(
    identity,
    ward ?? null,
    (formats.get("logo") as { url: string | null } | undefined)?.url ?? null,
    formularyMappings,
    observations,
    patientState,
    medications,
    pack,
    isEsicFaridabad
  );

  const { draft, checkContext, template } = buildOneOffDraft(context, body.templateKey, identity);
  const doc = buildDischargeDocument(draft, context);

  return NextResponse.json({
    doc,
    draft,
    checkContext,
    observations: observations.length,
    template: template ? { key: template.key, label: template.label } : null,
    templates: listDischargeTemplatesFor(pack),
  });
}
