import Anthropic from "@anthropic-ai/sdk";
import { AI_MODEL } from "@/lib/model";

/**
 * The two case-history cards the workspace has the AI draft: the provisional Diagnosis and the
 * initial Plan. Both are PROPOSALS — nothing is stored until the resident approves.
 *
 * Same trade, and same guardrails, as lib/discharge-ai.ts: the model is handed a digest built
 * ONLY from stored case-history observations, it is told to synthesise nothing that is not in
 * it, and anything it is unsure of comes back in uncertain_points rather than being asserted.
 * The verbatim-quote check that protects every other value in WardMate cannot reach synthesised
 * prose, so the review-and-approve step is what carries the weight here.
 */

function client(): Anthropic {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) throw new Error("ANTHROPIC_API_KEY is not set on the server.");
  return new Anthropic({ apiKey: key });
}

export type DigestObservation = {
  kind: string;
  label: string;
  value_text: string | null;
  needs_confirmation?: boolean;
  confirmed_at?: string | null;
};

export type PatientContext = {
  age_years: number | null;
  sex: string | null;
  admitted_on?: string | null;
  primary_diagnosis?: string | null;
};

function patientLine(p: PatientContext | undefined): string {
  if (!p) return "";
  const bits = [
    p.age_years != null ? `${p.age_years}y` : null,
    p.sex,
    p.admitted_on ? `admitted ${p.admitted_on.slice(0, 10)}` : null,
    p.primary_diagnosis ? `provisional diagnosis on record: ${p.primary_diagnosis}` : null,
  ].filter(Boolean);
  return bits.length ? `Patient: ${bits.join(", ")}\n\n` : "";
}

const KIND_LABEL: Record<string, string> = {
  diagnosis: "Provisional diagnosis",
  note: "History",
  exam: "Examination",
  vital: "Vital",
  lab: "Investigation",
  plan: "Plan",
  medication: "Medication",
};

/** The clerking, as text — built purely from stored case-history observations. */
export function buildClerkingDigest(observations: DigestObservation[]): string {
  const out: string[] = [];
  for (const o of observations) {
    if (o.kind === "plan") continue; // the plan is what we are proposing; do not feed it back
    const label = KIND_LABEL[o.kind] ?? o.kind;
    const value = (o.value_text ?? "").trim();
    if (!value) continue;
    const flag = o.needs_confirmation && !o.confirmed_at ? " (unconfirmed)" : "";
    out.push(`${label} — ${o.label}: ${value}${flag}`);
  }
  return out.join("\n") || "(nothing recorded yet)";
}

// --- Provisional diagnosis -------------------------------------------------------------

const DIAGNOSIS_SYSTEM = `You propose the PROVISIONAL DIAGNOSIS for a general-surgery admission in an Indian hospital, from a digest of the case sheet (history and examination).

Absolute rules:
1. Use only what the digest contains — presenting complaints, history, examination findings, any investigation already recorded. Never invent a symptom, a sign or a result.
2. This is a PROVISIONAL diagnosis at admission, not a confirmed one. Phrase it as such where the digest does not support certainty.
3. If the digest genuinely does not point to a diagnosis, return an empty string rather than guessing.
4. One line. The primary clinical problem, in standard terminology. Add "? [differential]" only if the digest itself leaves it open.
5. Expand abbreviations you are not certain are unambiguous.
6. Put anything you are unsure of, or any internal contradiction in the digest, in uncertain_points.

Return JSON: { "diagnosis": string, "uncertain_points": string[] }.`;

const DIAGNOSIS_SCHEMA = {
  type: "object",
  properties: {
    diagnosis: { type: "string" },
    uncertain_points: { type: "array", items: { type: "string" } },
  },
  required: ["diagnosis", "uncertain_points"],
  additionalProperties: false,
} as const;

export async function generateDiagnosis(
  digest: string
): Promise<{ text: string; uncertainPoints: string[]; model: string }> {
  const response = await client().messages.create({
    model: AI_MODEL,
    max_tokens: 500,
    system: [{ type: "text", text: DIAGNOSIS_SYSTEM, cache_control: { type: "ephemeral" } }],
    output_config: {
      effort: "low",
      format: { type: "json_schema", schema: DIAGNOSIS_SCHEMA as unknown as Record<string, unknown> },
    },
    messages: [{ role: "user", content: `Clerking digest:\n\n${digest}` }],
  });
  const block = response.content.find((b) => b.type === "text");
  const parsed =
    block && block.type === "text" ? JSON.parse(block.text) : { diagnosis: "", uncertain_points: [] };
  return {
    text: String(parsed.diagnosis ?? "").trim(),
    uncertainPoints: Array.isArray(parsed.uncertain_points) ? parsed.uncertain_points.map(String) : [],
    model: AI_MODEL,
  };
}

// --- Initial plan --------------------------------------------------------------------

const PLAN_SYSTEM = `You propose the INITIAL PLAN OF MANAGEMENT for a general-surgery admission in an Indian hospital, from a digest of the case sheet and any provisional diagnosis.

Absolute rules:
1. Build the plan only from what the digest supports — the presentation, the examination, the provisional diagnosis. Never order something for a condition the digest does not mention.
2. Each item is one concrete action a resident would write on the plan: an investigation to send, a treatment to start, a referral, a monitoring instruction, a consent/PAC step, NBM status, etc.
3. Standard, conservative first-day management. Do not commit to a definitive operation the digest does not already indicate; "plan for [procedure] after workup" is acceptable where the diagnosis implies it.
4. 3–8 items. Short imperative phrases. Expand unsafe abbreviations.
5. Put anything you are unsure of in uncertain_points.

Return JSON: { "items": string[], "uncertain_points": string[] }.`;

const PLAN_SCHEMA = {
  type: "object",
  properties: {
    items: { type: "array", items: { type: "string" } },
    uncertain_points: { type: "array", items: { type: "string" } },
  },
  required: ["items", "uncertain_points"],
  additionalProperties: false,
} as const;

export async function generatePlan(
  digest: string
): Promise<{ items: string[]; uncertainPoints: string[]; model: string }> {
  const response = await client().messages.create({
    model: AI_MODEL,
    max_tokens: 900,
    system: [{ type: "text", text: PLAN_SYSTEM, cache_control: { type: "ephemeral" } }],
    output_config: {
      effort: "low",
      format: { type: "json_schema", schema: PLAN_SCHEMA as unknown as Record<string, unknown> },
    },
    messages: [{ role: "user", content: `Clerking digest:\n\n${digest}` }],
  });
  const block = response.content.find((b) => b.type === "text");
  const parsed =
    block && block.type === "text" ? JSON.parse(block.text) : { items: [], uncertain_points: [] };
  return {
    items: Array.isArray(parsed.items) ? parsed.items.map(String).filter(Boolean) : [],
    uncertainPoints: Array.isArray(parsed.uncertain_points) ? parsed.uncertain_points.map(String) : [],
    model: AI_MODEL,
  };
}

// --- Compile the whole clerking into prose -------------------------------------------

const COMPILE_SYSTEM = `You turn the rough working notes of a surgical admission case sheet — tapped keywords, comma-separated fragments, half-sentences dictated at the bedside — into a clean, flowing case history in standard clinical prose.

You are REWRITING what is given into readable form. You are not adding to it, not completing it, and not interpreting it.

Absolute rules:
1. Use ONLY the information in the notes and the patient details provided. Never introduce a symptom, sign, duration, negative, diagnosis or history item that is not already there.
2. Keep every clinical fact that is present. Do not drop a detail because it is awkward to phrase.
3. Do not resolve a contradiction and do not fill a silence. If the notes say nothing about something, your prose says nothing about it. Put anything genuinely ambiguous or self-contradictory in uncertain_points.
4. Expand ward shorthand where it is unambiguous — "RIF" to "right iliac fossa", "K/C/O" to "known case of", "H/O" to "history of" — but keep abbreviations a clinician expects to read (BP, PR, USG).
5. Third person, past tense. One tight paragraph per section — history of presenting illness may run to a few sentences, the rest are usually one or two.
6. Return one entry per section that actually has content. Omit a section entirely if there is nothing for it. Allowed section labels, exactly: "chief complaints", "history of presenting illness", "past history", "family history", "medication history", "surgical history", "menstrual and obstetric history".
7. For "chief complaints" keep it to the complaints with their duration, e.g. "Pain in the right iliac fossa for 2 days, vomiting for 1 day."

Return JSON: { "sections": [ { "label": string, "text": string } ], "uncertain_points": string[] }.`;

const COMPILE_SCHEMA = {
  type: "object",
  properties: {
    sections: {
      type: "array",
      items: {
        type: "object",
        properties: { label: { type: "string" }, text: { type: "string" } },
        required: ["label", "text"],
        additionalProperties: false,
      },
    },
    uncertain_points: { type: "array", items: { type: "string" } },
  },
  required: ["sections", "uncertain_points"],
  additionalProperties: false,
} as const;

const COMPILE_LABELS = new Set([
  "chief complaints",
  "history of presenting illness",
  "past history",
  "family history",
  "medication history",
  "surgical history",
  "menstrual and obstetric history",
]);

export async function compileCaseHistory(
  digest: string,
  patient?: PatientContext
): Promise<{ sections: { label: string; text: string }[]; uncertainPoints: string[]; model: string }> {
  const response = await client().messages.create({
    model: AI_MODEL,
    max_tokens: 2000,
    system: [{ type: "text", text: COMPILE_SYSTEM, cache_control: { type: "ephemeral" } }],
    output_config: {
      effort: "medium",
      format: { type: "json_schema", schema: COMPILE_SCHEMA as unknown as Record<string, unknown> },
    },
    messages: [{ role: "user", content: `${patientLine(patient)}Working notes:\n\n${digest}` }],
  });
  const block = response.content.find((b) => b.type === "text");
  const parsed =
    block && block.type === "text" ? JSON.parse(block.text) : { sections: [], uncertain_points: [] };
  const sections = (Array.isArray(parsed.sections) ? parsed.sections : [])
    .map((s: { label?: unknown; text?: unknown }) => ({
      label: String(s.label ?? "").toLowerCase().trim(),
      text: String(s.text ?? "").trim(),
    }))
    .filter((s: { label: string; text: string }) => s.text && COMPILE_LABELS.has(s.label));
  return {
    sections,
    uncertainPoints: Array.isArray(parsed.uncertain_points) ? parsed.uncertain_points.map(String) : [],
    model: AI_MODEL,
  };
}
