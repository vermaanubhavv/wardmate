import Anthropic from "@anthropic-ai/sdk";
import { AI_MODEL } from "@/lib/model";
import type { DischargeContext } from "@/lib/discharge-data";
import type { DischargeDraft } from "@/lib/discharge-entities";
import type { Observation } from "@/lib/patient-state";
import { istDayKey } from "@/lib/patient-state";
import { RADIOLOGY_LABEL } from "@/lib/radiology-flags";
import { PATHOLOGY_LABEL, templateForDischarge } from "@/lib/discharge-compile";
import type { DischargeTemplate } from "@/lib/discharge-templates";
import {
  courseSystem,
  dischargePromptWordsFor,
  indicationSystem,
  investigationsSystem,
} from "@/lib/specialty/discharge-prompts";

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
function buildAdmissionDigest(context: DischargeContext, draft: DischargeDraft): string {
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

  // The clinical history taken at admission, on its own, then the progress notes day by day —
  // so the model knows which is the presentation and which is the course.
  const historyIds = new Set(context.admissionObservations.map((o) => o.id));
  if (context.admissionObservations.length) {
    out.push("Clinical history (admission case sheet):");
    for (const o of [...context.admissionObservations].reverse()) out.push(`  ${line(o)}`);
  }

  // Everything else on the record — the progress notes — oldest first, by the day recorded.
  const chronological = [...context.observations].reverse().filter((o) => !historyIds.has(o.id));
  const byDay = new Map<string, Observation[]>();
  for (const o of chronological) {
    const day = istDayKey(o.recorded_at);
    const bucket = byDay.get(day) ?? [];
    bucket.push(o);
    byDay.set(day, bucket);
  }
  out.push("Progress notes (each day's recorded observations):");
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

/**
 * The diagnosis template, as a guide to FORM — its order of beats and the ward's standard
 * wording. Its facts are the usual case, not this patient's; the prompts say so.
 */
const templateOf = (context: DischargeContext, draft: DischargeDraft) =>
  templateForDischarge(context, draft.diagnoses.find((d) => d.category === "primary")?.text, context.pack);

function templateGuide(template: DischargeTemplate | null, part: "clinicalCourse" | "indication"): string {
  const text = template?.scaffold[part]?.trim();
  if (!template || !text) return "";
  return `\n\nTemplate for this diagnosis (${template.label}) — follow its order and wording:\n${text}`;
}


// --- Clinical Course --------------------------------------------------------------------


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
  const digest = buildAdmissionDigest(context, draft) + templateGuide(templateOf(context, draft), "clinicalCourse");
  const response = await client().messages.create({
    model: AI_MODEL,
    max_tokens: 2000,
    system: [
      { type: "text", text: courseSystem(dischargePromptWordsFor(context.pack)), cache_control: { type: "ephemeral" } },
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
  const digest = buildAdmissionDigest(context, draft) + templateGuide(templateOf(context, draft), "indication");
  const response = await client().messages.create({
    model: AI_MODEL,
    max_tokens: 400,
    system: [{ type: "text", text: indicationSystem(dischargePromptWordsFor(context.pack)), cache_control: { type: "ephemeral" } }],
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
    system: [{ type: "text", text: investigationsSystem(dischargePromptWordsFor(context.pack)), cache_control: { type: "ephemeral" } }],
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
