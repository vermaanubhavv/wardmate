import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { plainAiError } from "@/lib/ai-error";
import { getDischargeContext } from "@/lib/discharge-data";
import { mergeDischargeDraft } from "@/lib/discharge-store";
import {
  generateClinicalCourse,
  generateIndication,
  proposeRelevantInvestigations,
} from "@/lib/discharge-ai";

/**
 * Generate a first draft of one AI section — the Clinical Course, the Indication for Admission,
 * or the Relevant Investigations list.
 *
 * This produces a PROPOSAL and stores nothing. The resident reviews it, edits it, and only
 * then saves it through the server action. The section is not part of a finalised summary
 * until it has been approved — see lib/discharge-checks.ts.
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

  const context = await getDischargeContext(patientId);
  if (!context) return NextResponse.json({ error: "Patient not found." }, { status: 404 });
  const draft = mergeDischargeDraft(context);

  try {
    if (body.section === "clinical_course") {
      const proposal = await generateClinicalCourse(context, draft);
      return NextResponse.json(proposal);
    }
    if (body.section === "indication") {
      const proposal = await generateIndication(context, draft);
      return NextResponse.json(proposal);
    }
    if (body.section === "investigations") {
      const proposal = await proposeRelevantInvestigations(context);
      return NextResponse.json(proposal);
    }
    return NextResponse.json({ error: "Unknown section." }, { status: 400 });
  } catch (e) {
    return NextResponse.json({ error: plainAiError(e) }, { status: 502 });
  }
}
