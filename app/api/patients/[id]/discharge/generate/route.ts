import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { plainAiError } from "@/lib/ai-error";
import { getDischargeContext } from "@/lib/discharge-data";
import { mergeDischargeDraft, writeDischargeSection } from "@/lib/discharge-store";
import {
  generateClinicalCourse,
  generateIndication,
  proposeRelevantInvestigations,
} from "@/lib/discharge-ai";

/**
 * Draft the AI sections of a discharge summary — the Clinical Course, the Indication for
 * Admission, and the Relevant Investigations list.
 *
 * `section: "all"` compiles all three at once (in parallel) — this is what runs automatically
 * when the workspace opens, so the resident lands on content to REVIEW rather than empty fields
 * with a button. Every section is written straight away but stays UNAPPROVED; the completeness
 * checks refuse to finalise until the resident has read and approved each one
 * (lib/discharge-checks.ts). Generate → Review → Edit → Approve.
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
  const now = new Date().toISOString();

  const courseSection = (v: Awaited<ReturnType<typeof generateClinicalCourse>>) => ({
    text: v.text,
    source: "ai" as const,
    model: v.model,
    generatedAt: now,
    approvedAt: null,
    approvedBy: null,
    uncertainPoints: v.uncertainPoints,
  });
  const indicationSection = (v: Awaited<ReturnType<typeof generateIndication>>) => ({
    text: v.text,
    source: "ai" as const,
    model: v.model,
    generatedAt: now,
    approvedAt: null,
    approvedBy: null,
  });
  const investigationsSection = (v: Awaited<ReturnType<typeof proposeRelevantInvestigations>>) => ({
    items: v.items.map((it) => ({
      id: crypto.randomUUID(),
      group: it.group,
      text: it.text,
      interpretation: it.interpretation,
      accepted: true,
      source: "ai" as const,
      sourceObservationIds: it.sourceObservationIds,
    })),
    approvedAt: null,
    approvedBy: null,
    model: v.model,
    generatedAt: now,
  });

  try {
    if (body.section === "all") {
      const [course, indication, investigations] = await Promise.allSettled([
        generateClinicalCourse(context, draft),
        generateIndication(context, draft),
        proposeRelevantInvestigations(context),
      ]);

      const out: Record<string, unknown> = {};
      if (course.status === "fulfilled") {
        out.clinicalCourse = courseSection(course.value);
        await writeDischargeSection(patientId, "clinicalCourse", out.clinicalCourse);
      }
      if (indication.status === "fulfilled" && indication.value.text.trim()) {
        out.indication = indicationSection(indication.value);
        await writeDischargeSection(patientId, "indication", out.indication);
      }
      if (investigations.status === "fulfilled" && investigations.value.items.length > 0) {
        out.relevantInvestigations = investigationsSection(investigations.value);
        await writeDischargeSection(patientId, "relevantInvestigations", out.relevantInvestigations);
      }
      // A total failure (e.g. no AI credit) surfaces so the workspace can fall back to the
      // manual buttons; a partial one just returns what worked.
      if (Object.keys(out).length === 0 && course.status === "rejected") {
        return NextResponse.json({ error: plainAiError(course.reason) }, { status: 502 });
      }
      return NextResponse.json(out);
    }

    if (body.section === "clinical_course") {
      const v = await generateClinicalCourse(context, draft);
      const section = courseSection(v);
      await writeDischargeSection(patientId, "clinicalCourse", section);
      return NextResponse.json({ ...v, section });
    }
    if (body.section === "indication") {
      const v = await generateIndication(context, draft);
      const section = indicationSection(v);
      await writeDischargeSection(patientId, "indication", section);
      return NextResponse.json({ ...v, section });
    }
    if (body.section === "investigations") {
      const v = await proposeRelevantInvestigations(context);
      const section = investigationsSection(v);
      await writeDischargeSection(patientId, "relevantInvestigations", section);
      return NextResponse.json({ ...v, section });
    }
    return NextResponse.json({ error: "Unknown section." }, { status: 400 });
  } catch (e) {
    return NextResponse.json({ error: plainAiError(e) }, { status: 502 });
  }
}
