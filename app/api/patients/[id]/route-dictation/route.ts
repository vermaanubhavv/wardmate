import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { plainAiError } from "@/lib/ai-error";
import { routeToSections, type DictationSection } from "@/lib/dictation-routing";

/**
 * Live dictation for the progress note and the discharge summary: each pause of transcript is
 * sorted into the sections the open screen offers, and handed back. Nothing is stored — the
 * screen drops each line into its card and saves it the way that card always saves.
 * (The clerking has its own route, which also files: ../case-history/route-dictation.)
 */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: patientId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  let body: { text?: unknown; sections?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Malformed request." }, { status: 400 });
  }
  const text = String(body.text ?? "").trim().slice(0, 4000);
  const sections: DictationSection[] = (Array.isArray(body.sections) ? body.sections : [])
    .slice(0, 40)
    .map((s: Record<string, unknown>) => ({
      key: String(s?.key ?? "").slice(0, 40),
      label: String(s?.label ?? "").slice(0, 80),
      hint: s?.hint ? String(s.hint).slice(0, 240) : undefined,
    }))
    .filter((s) => /^[\w:.-]+$/.test(s.key) && s.label);
  if (!text || sections.length === 0) return NextResponse.json({ lines: [] });

  // Only for a patient this user can see (RLS returns the row only to a ward member).
  const { data: patient } = await supabase.from("current_patients").select("id").eq("id", patientId).maybeSingle();
  if (!patient) return NextResponse.json({ error: "Patient not found." }, { status: 404 });

  try {
    return NextResponse.json({ lines: await routeToSections(text, sections) });
  } catch (e) {
    return NextResponse.json({ error: plainAiError(e) }, { status: 502 });
  }
}
