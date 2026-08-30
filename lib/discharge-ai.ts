import Anthropic from "@anthropic-ai/sdk";
import { AI_MODEL } from "@/lib/model";
import type { DischargeContext } from "@/lib/discharge-data";
import type { DischargeDraft } from "@/lib/discharge-entities";
import type { Observation } from "@/lib/patient-state";
import { istDayKey } from "@/lib/patient-state";
import { RADIOLOGY_LABEL } from "@/lib/radiology-flags";
import { PATHOLOGY_LABEL } from "@/lib/discharge-compile";

/**
 * The two discharge sections the protocol has the AI write a first draft of: the Clinical
 * Course (section 6, mandatory) and Relevant Investigations (section 7).
 *
 * WHAT THIS TRADES, and why it is acceptable here when the rest of WardMate refuses to compose
 * clinical prose. Everywhere else, the guarantee against an invented value is the
 * verbatim-quote check in lib/extract.ts: a stored observation must quote a real span of its
 * transcript. That check CANNOT reach synthesised prose — a paragraph summarising a fortnight
 * is not a quote of anything. So four other things carry the weight instead:
 *
 *   1. The digest handed to the model is built ONLY from stored observations (buildAdmissionDigest
 *      below) — the model is summarising the record, not reconstructing an admission from a name.
 *   2. Contradictions the model notices are returned in `uncertain_points` and shown to the
 *      resident, never resolved silently (AI Safety Rule 4).
 *   3. Every proposed Relevant Investigation line must name the observation ids it was built
 *      from; the caller drops any line not grounded in the digest (the same "the model's word
 *      alone is not enough" rule the quote check enforces).
 *   4. Neither section can be finalised until the resident has reviewed and APPROVED it
 *      (lib/discharge-checks.ts). Generate -> Review -> Edit -> Approve.
 *
 * If AI-written discharge prose starts producing events nobody recognises, this file and
 * lib/model.ts are the first things to look at.
 */

function client(): Anthropic {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) throw new Error("ANTHROPIC_API_KEY is not set on the server.");
  return new Anthropic({ apiKey: key });
}

// --- The admission digest ----------------------------------------------------------------

const KIND_LABEL: Record<string, string> = {
  diagnosis: "Diagnosis",
  day_number: "Day",
  vital: "Vital",
  exam: "Examination",
  drain: "Drain",
  intake_output: "Intake/output",
  medication: "Medication",
  lab: "Investigation",
  plan: "Plan",
  note: "Note",
  procedure_done: "Operation",
  planned_procedure: "Planned operation",
  pac_status: "PAC",
};

function line(o: Observation): string {
  const label = KIND_LABEL[o.kind] ?? o.kind;
  const value = o.value_text ?? "";
  const ref =
    o.ref_low != null || o.ref_high != null || o.ref_text
      ? ` [ref ${o.ref_text ?? `${o.ref_low ?? ""}–${o.ref_high ?? ""}`}]`
      : "";
  const flag = o.needs_confirmation && !o.confirmed_at ? " (unconfirmed)" : "";
  return `${label} — ${o.label}: ${value}${ref}${flag}`.trim();
}

/**
 * The admission, as text, built purely from stored observations and the compiled draft — the
 * only thing the model is given. Chronological, day by day, in IST (the day the round happened).
 */
export function buildAdmissionDigest(context: DischargeContext, draft: DischargeDraft): string {
  const { patient } = context;
  const out: string[] = [];

  out.push(
    `Patient: ${patient.age_years ?? "?"}y ${patient.sex ?? "?"}, admitted ${patient.admitted_on}` +
      (patient.surgery_date ? `, operated ${patient.surgery_date}` : "") +
      (patient.post_op_day != null ? `, POD ${patient.post_op_day} at discharge` : ` , day ${patient.admission_day} at discharge`)
  );

  if (draft.indicationForAdmission.text.trim())
    out.push(`Indication for admission: ${draft.indicationForAdmission.text.trim()}`);

  const dx = draft.diagnoses;
  if (dx.length) {
    out.push("Diagnoses:");
    for (const d of dx) out.push(`  - [${d.category}] ${d.text}`);
  }

  if (draft.procedures.length) {
    out.push("Procedures:");
    for (const p of draft.procedures) {
      out.push(
        `  - ${p.name}${p.date ? ` on ${p.date}` : ""}` +
          (p.indication ? `; for ${p.indication}` : "") +
          (p.anaesthesia ? `; ${p.anaesthesia}` : "") +
          (p.findings ? `; findings: ${p.findings}` : "") +
          (p.drains ? `; drain: ${p.drains}` : "") +
          (p.complications ? `; complications: ${p.complications}` : "")
      );
    }
  }

  // Everything on the record, oldest first, grouped by the day it was recorded.
  const chronological = [...context.observations].reverse();
  const byDay = new Map<string, Observation[]>();
  for (const o of chronological) {
    const day = istDayKey(o.recorded_at);
    const bucket = byDay.get(day) ?? [];
    bucket.push(o);
    byDay.set(day, bucket);
  }
  out.push("Timeline (each day's recorded observations):");
  for (const [day, obs] of byDay) {
    out.push(`  ${day}:`);
    for (const o of obs) out.push(`    ${line(o)}`);
  }

  out.push(
    "Condition at discharge (structured variables the resident is setting): " +
      JSON.stringify(draft.conditionAtDischarge.vars)
  );

  return out.join("\n");
}

// --- Clinical Course --------------------------------------------------------------------

const COURSE_SYSTEM = `You write the CLINICAL COURSE section of a general-surgery discharge summary for an Indian hospital, from a digest of what was recorded during the admission.

You are SYNTHESISING the admission the digest describes — not copying its lines, not completing it, and not adding to it.

Absolute rules:
1. Never state a diagnosis, investigation, procedure, medication or clinical event that is not in the digest. If the digest does not contain it, it did not happen.
2. Do not turn an uncertain or provisional diagnosis in the digest into a confirmed one.
3. Distinguish documented fact from your own inference. If you must infer to keep the narrative coherent, keep the inference cautious and put anything you are unsure about in uncertain_points instead of asserting it.
4. If the digest contradicts itself (a drain described as removed and also in situ; two different operation dates; a medication both stopped and continued), do NOT pick one. State both in uncertain_points and leave the course itself non-committal on that point.
5. Expand no unexplained abbreviations — write "laparoscopic cholecystectomy", not "lap chole"; "nasogastric tube", not "RT". If you cannot expand one safely, keep the digest's exact wording.
6. Be concise and clinically meaningful. One paragraph, roughly 4–7 sentences. Do NOT reproduce every ward-round note. Cover, in order: initial presentation/diagnosis, important initial management, the major intervention or operation, significant post-operative or inpatient events, relevant recovery milestones, and the clinical condition immediately before discharge.
7. Maintain chronological coherence. Use the dates in the digest; do not invent one.
8. Plain professional prose, third person, past tense ("The patient was admitted with…"). No bullet points, no headings.

Return JSON: { "clinical_course": string, "uncertain_points": string[] }. uncertain_points is [] when the digest is internally consistent and complete enough.`;

const COURSE_SCHEMA = {
  type: "object",
  properties: {
    clinical_course: { type: "string" },
    uncertain_points: { type: "array", items: { type: "string" } },
  },
  required: ["clinical_course", "uncertain_points"],
  additionalProperties: false,
} as const;

export type ClinicalCourseProposal = { text: string; uncertainPoints: string[]; model: string };

export async function generateClinicalCourse(
  context: DischargeContext,
  draft: DischargeDraft
): Promise<ClinicalCourseProposal> {
  const digest = buildAdmissionDigest(context, draft);
  const response = await client().messages.create({
    model: AI_MODEL,
    max_tokens: 2000,
    system: [
      { type: "text", text: COURSE_SYSTEM, cache_control: { type: "ephemeral" } },
    ],
    output_config: {
      effort: "medium",
      format: { type: "json_schema", schema: COURSE_SCHEMA as unknown as Record<string, unknown> },
    },
    messages: [{ role: "user", content: `Admission digest:\n\n${digest}` }],
  });

  const text = response.content.find((b) => b.type === "text");
  const parsed = text && text.type === "text" ? JSON.parse(text.text) : { clinical_course: "", uncertain_points: [] };
  return {
    text: String(parsed.clinical_course ?? "").trim(),
    uncertainPoints: Array.isArray(parsed.uncertain_points) ? parsed.uncertain_points.map(String) : [],
    model: AI_MODEL,
  };
}

// --- Indication for Admission ----------------------------------------------------------

const INDICATION_SYSTEM = `You write the INDICATION FOR ADMISSION line of a general-surgery discharge summary, from a digest of the admission.

It states briefly WHY inpatient admission was required. It must NOT simply repeat the final diagnosis.

Preferred form: "Patient admitted with [presentation / clinical problem] requiring [inpatient management / investigation / intervention / surgery]."

Rules:
1. Use only what the digest contains — presenting complaints, the admission examination, the admitting diagnosis, the initial plan. Never invent a symptom, a sign or a duration.
2. One or two sentences. No abbreviations that are not expanded.
3. If the digest holds nothing about the presentation (only a bare diagnosis), say so by returning an empty string rather than padding it.

Return JSON: { "indication": string }.`;

const INDICATION_SCHEMA = {
  type: "object",
  properties: { indication: { type: "string" } },
  required: ["indication"],
  additionalProperties: false,
} as const;

export async function generateIndication(
  context: DischargeContext,
  draft: DischargeDraft
): Promise<{ text: string; model: string }> {
  const digest = buildAdmissionDigest(context, draft);
  const response = await client().messages.create({
    model: AI_MODEL,
    max_tokens: 400,
    system: [{ type: "text", text: INDICATION_SYSTEM, cache_control: { type: "ephemeral" } }],
    output_config: {
      effort: "low",
      format: { type: "json_schema", schema: INDICATION_SCHEMA as unknown as Record<string, unknown> },
    },
    messages: [{ role: "user", content: `Admission digest:\n\n${digest}` }],
  });
  const text = response.content.find((b) => b.type === "text");
  const parsed = text && text.type === "text" ? JSON.parse(text.text) : { indication: "" };
  return { text: String(parsed.indication ?? "").trim(), model: AI_MODEL };
}

// --- Relevant Investigations --------------------------------------------------------

const INVESTIGATIONS_SYSTEM = `You select and summarise the CLINICALLY RELEVANT investigation results for a general-surgery discharge summary, from a list of every investigation observation recorded during the admission.

The point of this section is to be SHORT and MEANINGFUL. Do not reproduce whole panels. Propose only results that matter to someone reading this summary after discharge:
- important diagnostic findings
- significant abnormalities, and significant trends (e.g. a falling white count, a resolving derangement)
- results that changed management
- relevant imaging and microbiology findings
- an important NORMAL result where its normality is itself clinically meaningful (e.g. bilirubin normal in a biliary case)

Distinguish "abnormal" from "clinically relevant" — a single mildly abnormal value that led to nothing is not relevant and should be left out.

Absolute rules:
1. Every proposed line MUST be built only from the observations given. Put the id(s) of the observation(s) each line is based on in source_observation_ids. A line you cannot ground in a given observation must not be produced.
2. Never invent a value, a date or a trend. If two readings of the same test are given, you may describe the trend between them; if only one is given, you may not.
3. Do not expand unexplained abbreviations unsafely; keep the report's own wording where unsure.
4. interpretation is optional and cautious — a short reading of the result, not a diagnosis.

Return JSON: { "items": [ { "group": string, "text": string, "interpretation": string|null, "significance": string, "source_observation_ids": string[] } ] }.
group is the test family ("CBC", "LFT", "Ultrasound Abdomen", "Blood Culture"). significance is one of "diagnostic", "abnormal", "trend", "management", "normal-relevant".`;

const INVESTIGATIONS_SCHEMA = {
  type: "object",
  properties: {
    items: {
      type: "array",
      items: {
        type: "object",
        properties: {
          group: { type: "string" },
          text: { type: "string" },
          interpretation: { type: ["string", "null"] },
          significance: { type: "string" },
          source_observation_ids: { type: "array", items: { type: "string" } },
        },
        required: ["group", "text", "interpretation", "significance", "source_observation_ids"],
        additionalProperties: false,
      },
    },
  },
  required: ["items"],
  additionalProperties: false,
} as const;

export type InvestigationProposalItem = {
  group: string;
  text: string;
  interpretation: string | null;
  significance: string;
  sourceObservationIds: string[];
};

export async function proposeRelevantInvestigations(
  context: DischargeContext
): Promise<{ items: InvestigationProposalItem[]; model: string }> {
  const labs = context.observations.filter((o) => o.kind === "lab");
  if (labs.length === 0) return { items: [], model: AI_MODEL };

  const known = new Set(labs.map((o) => o.id));
  const listed = labs
    .slice()
    .reverse()
    .map((o) => {
      const kindHint = RADIOLOGY_LABEL.test(`${o.label} ${o.value_text ?? ""}`)
        ? "imaging"
        : PATHOLOGY_LABEL.test(`${o.label} ${o.value_text ?? ""}`)
          ? "histopathology"
          : "lab";
      return `id=${o.id} [${kindHint}] ${istDayKey(o.recorded_at)} — ${o.label}: ${o.value_text ?? ""}` +
        (o.ref_low != null || o.ref_high != null || o.ref_text
          ? ` [ref ${o.ref_text ?? `${o.ref_low ?? ""}–${o.ref_high ?? ""}`}]`
          : "");
    })
    .join("\n");

  const response = await client().messages.create({
    model: AI_MODEL,
    max_tokens: 2000,
    system: [{ type: "text", text: INVESTIGATIONS_SYSTEM, cache_control: { type: "ephemeral" } }],
    output_config: {
      effort: "medium",
      format: { type: "json_schema", schema: INVESTIGATIONS_SCHEMA as unknown as Record<string, unknown> },
    },
    messages: [{ role: "user", content: `Investigation observations:\n\n${listed}` }],
  });

  const text = response.content.find((b) => b.type === "text");
  const parsed = text && text.type === "text" ? JSON.parse(text.text) : { items: [] };
  const raw: unknown[] = Array.isArray(parsed.items) ? parsed.items : [];

  // ENFORCEMENT: a proposed line survives only if every observation id it claims is one we
  // actually gave the model. Same guarantee lib/extract.ts's quote check provides.
  const items: InvestigationProposalItem[] = [];
  for (const r of raw as Record<string, unknown>[]) {
    const ids = Array.isArray(r.source_observation_ids) ? r.source_observation_ids.map(String) : [];
    if (ids.length === 0 || !ids.every((id) => known.has(id))) continue;
    items.push({
      group: String(r.group ?? "").trim() || "Investigation",
      text: String(r.text ?? "").trim(),
      interpretation: r.interpretation == null ? null : String(r.interpretation).trim() || null,
      significance: String(r.significance ?? "").trim(),
      sourceObservationIds: ids,
    });
  }
  return { items: items.filter((i) => i.text), model: AI_MODEL };
}
