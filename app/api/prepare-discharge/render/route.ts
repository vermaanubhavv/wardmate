import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCurrentWard } from "@/lib/ward";
import { getWardFormats } from "@/lib/formats";
import { getFormularyMappings } from "@/lib/formulary";
import { derivePatientState } from "@/lib/patient-state";
import { buildDischargeDocument } from "@/lib/discharge-render";
import type { DischargeDraft } from "@/lib/discharge-entities";
import { oneOffContext } from "@/lib/discharge-oneoff";

/**
 * Re-render a one-off discharge summary from the draft the resident has just edited.
 *
 * The one-off keeps no record, so every "preview" round-trips the whole draft. Nothing is
 * stored; this only turns the structured draft back into the printable document, on the
 * doctor's own unit heading.
 */
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  let body: { identity?: Record<string, string>; draft?: DischargeDraft };
  try {
    body = (await request.json()) as { identity?: Record<string, string>; draft?: DischargeDraft };
  } catch {
    return NextResponse.json({ error: "Malformed request." }, { status: 400 });
  }
  if (!body.draft) return NextResponse.json({ error: "Nothing to render." }, { status: 400 });

  const { ward } = await getCurrentWard();
  const [formats, formularyMappings] = await Promise.all([
    ward ? getWardFormats(ward.id) : Promise.resolve(new Map()),
    ward ? getFormularyMappings(ward.id) : Promise.resolve(new Map<string, string>()),
  ]);

  const context = oneOffContext(
    body.identity ?? {},
    ward ?? null,
    (formats.get("logo") as { url: string | null } | undefined)?.url ?? null,
    formularyMappings,
    [],
    derivePatientState([], null),
    []
  );

  return NextResponse.json({ doc: buildDischargeDocument(body.draft, context) });
}
