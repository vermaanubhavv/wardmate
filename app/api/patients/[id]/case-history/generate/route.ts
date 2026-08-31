import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { plainAiError } from "@/lib/ai-error";
import { buildClerkingDigest, generateDiagnosis, generatePlan } from "@/lib/case-history-ai";

/**
 * A first draft of the Diagnosis or the Plan card in the case-history workspace.
 *
 * Produces a PROPOSAL and stores nothing — the resident reviews, edits, and only then approves
 * it through the server action (which is what writes patients.primary_diagnosis or the plan
 * observations). Mirrors app/api/patients/[id]/discharge/generate/route.ts.
 */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: patientId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  let body: { section?: string };
  try {
    body = (await request.json()) as { section?: string };
  } catch {
    return NextResponse.json({ error: "Malformed request." }, { status: 400 });
  }

  const { data: entriesData } = await supabase
    .from("entries")
    .select(
      "recorded_at, observations(kind, label, value_text, needs_confirmation, confirmed_at)"
    )
    .eq("patient_id", patientId)
    .eq("is_case_history", true)
    .order("recorded_at", { ascending: true });

  const observations = ((entriesData ?? []) as unknown as {
    observations: {
      kind: string;
      label: string;
      value_text: string | null;
      needs_confirmation: boolean;
      confirmed_at: string | null;
    }[];
  }[]).flatMap((e) => e.observations);

  if (observations.length === 0) {
    return NextResponse.json(
      { error: "Nothing recorded in the case history yet — fill the earlier cards first." },
      { status: 422 }
    );
  }

  const digest = buildClerkingDigest(observations);

  try {
    if (body.section === "diagnosis") return NextResponse.json(await generateDiagnosis(digest));
    if (body.section === "plan") return NextResponse.json(await generatePlan(digest));
    return NextResponse.json({ error: "Unknown section." }, { status: 400 });
  } catch (e) {
    return NextResponse.json({ error: plainAiError(e) }, { status: 502 });
  }
}
