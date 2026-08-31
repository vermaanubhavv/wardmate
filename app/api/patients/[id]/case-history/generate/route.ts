import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { plainAiError } from "@/lib/ai-error";
import {
  buildClerkingDigest,
  compileCaseHistory,
  generateDiagnosis,
  generatePlan,
} from "@/lib/case-history-ai";

/**
 * A first draft of a case-history AI card: "compile" turns the tapped fragments into prose,
 * "diagnosis" and "plan" propose those.
 *
 * Every one produces a PROPOSAL and stores nothing — the resident reviews, edits, and only then
 * applies it through the server action. Mirrors app/api/patients/[id]/discharge/generate/route.ts.
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

  const [{ data: entriesData }, { data: patient }] = await Promise.all([
    supabase
      .from("entries")
      .select("recorded_at, observations(kind, label, value_text, needs_confirmation, confirmed_at)")
      .eq("patient_id", patientId)
      .eq("is_case_history", true)
      .order("recorded_at", { ascending: true }),
    supabase
      .from("current_patients")
      .select("age_years, sex, admitted_on, primary_diagnosis")
      .eq("id", patientId)
      .maybeSingle(),
  ]);

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
  const ctx = patient
    ? {
        age_years: patient.age_years,
        sex: patient.sex,
        admitted_on: patient.admitted_on,
        primary_diagnosis: patient.primary_diagnosis,
      }
    : undefined;
  const withCtx = ctx
    ? `Patient: ${[ctx.age_years != null ? `${ctx.age_years}y` : null, ctx.sex, ctx.primary_diagnosis ? `diagnosis on record: ${ctx.primary_diagnosis}` : null].filter(Boolean).join(", ")}\n\n${digest}`
    : digest;

  try {
    if (body.section === "compile") return NextResponse.json(await compileCaseHistory(digest, ctx));
    if (body.section === "diagnosis") return NextResponse.json(await generateDiagnosis(withCtx));
    if (body.section === "plan") return NextResponse.json(await generatePlan(withCtx));
    return NextResponse.json({ error: "Unknown section." }, { status: 400 });
  } catch (e) {
    return NextResponse.json({ error: plainAiError(e) }, { status: 502 });
  }
}
