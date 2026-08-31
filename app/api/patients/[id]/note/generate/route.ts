import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { plainAiError } from "@/lib/ai-error";
import { istDayKey } from "@/lib/patient-state";
import { MANAGEMENT_CHOICES } from "@/lib/patients";
import { compileProgressNote } from "@/lib/progress-note-ai";

/**
 * Compile today's tapped fragments into the progress-sheet phrasing.
 *
 * A PROPOSAL — stores nothing. The resident reviews and applies it through the server action,
 * and the sheet is only a record once signed. Mirrors the case-history compile route.
 */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: patientId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  const since = new Date(Date.now() - 48 * 3600 * 1000).toISOString();
  const [{ data: entriesData }, { data: patient }] = await Promise.all([
    supabase
      .from("entries")
      .select("recorded_at, is_case_history, observations(kind, label, value_text, needs_confirmation, confirmed_at)")
      .eq("patient_id", patientId)
      .gte("recorded_at", since),
    supabase
      .from("current_patients")
      .select("age_years, sex, primary_diagnosis, surgery_date, post_op_day, management, procedure_text")
      .eq("id", patientId)
      .maybeSingle(),
  ]);

  const today = istDayKey(new Date().toISOString());
  const rows = ((entriesData ?? []) as unknown as {
    recorded_at: string;
    is_case_history: boolean;
    observations: { kind: string; label: string; value_text: string | null; needs_confirmation: boolean; confirmed_at: string | null }[];
  }[])
    .filter((e) => !e.is_case_history && istDayKey(e.recorded_at) === today)
    .flatMap((e) => e.observations);

  if (rows.length === 0) {
    return NextResponse.json(
      { error: "Nothing recorded for today yet — fill the earlier cards first." },
      { status: 422 }
    );
  }

  const digest =
    rows
      .filter((o) => (o.value_text ?? "").trim())
      .map((o) => {
        const flag = o.needs_confirmation && !o.confirmed_at ? " (unconfirmed)" : "";
        return `${o.kind} — ${o.label}: ${(o.value_text ?? "").trim()}${flag}`;
      })
      .join("\n") || "(nothing)";

  const status = patient?.surgery_date
    ? `Post Op Day (${patient.post_op_day ?? "—"})`
    : MANAGEMENT_CHOICES.find((c) => c.value === patient?.management)?.label ?? null;

  try {
    const compiled = await compileProgressNote(digest, {
      age_years: patient?.age_years ?? null,
      sex: patient?.sex ?? null,
      diagnosis: patient?.primary_diagnosis ?? null,
      status,
      procedure: patient?.procedure_text ?? null,
    });
    return NextResponse.json(compiled);
  } catch (e) {
    return NextResponse.json({ error: plainAiError(e) }, { status: 502 });
  }
}
