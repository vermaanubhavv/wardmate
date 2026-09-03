import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { plainAiError } from "@/lib/ai-error";
import { routeClerkingChunk } from "@/lib/case-history-routing";
import { appendCaseHistoryDictation } from "@/app/patients/[id]/case-history/actions";

/**
 * Live routing for the "dictate the whole clerking" overlay. Each time the resident pauses,
 * the overlay POSTs the span of transcript since the last pause; this sorts it into case-sheet
 * sections and appends the history / examination pieces straight away, so they are in the
 * cards before the resident stops talking.
 *
 * `diagnosis`, `plan` and general-`examination` segments come back in the response but are NOT
 * persisted — the overlay shows them for the resident to place (see appendCaseHistoryDictation).
 */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: patientId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  let body: { text?: string; knownComplaints?: unknown };
  try {
    body = (await request.json()) as { text?: string; knownComplaints?: unknown };
  } catch {
    return NextResponse.json({ error: "Malformed request." }, { status: 400 });
  }
  const text = (body.text ?? "").trim();
  if (!text) return NextResponse.json({ segments: [] });

  const knownComplaints = Array.isArray(body.knownComplaints)
    ? body.knownComplaints.map(String).filter(Boolean).slice(0, 20)
    : [];

  let segments;
  try {
    ({ segments } = await routeClerkingChunk(text, knownComplaints));
  } catch (e) {
    return NextResponse.json({ error: plainAiError(e) }, { status: 502 });
  }

  const persist = await appendCaseHistoryDictation(patientId, segments);
  if (!persist.ok) {
    return NextResponse.json({ segments, error: persist.error ?? "Could not file that." }, { status: 200 });
  }

  return NextResponse.json({ segments });
}
