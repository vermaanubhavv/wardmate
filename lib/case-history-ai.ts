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

const DIAGNOSIS_SYSTEM = `You propose the PROVISIONAL DIAGNOSIS for a general-surgery admission in an Indian hospital, from a digest of the clerking (history and examination).

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

const PLAN_SYSTEM = `You propose the INITIAL PLAN OF MANAGEMENT for a general-surgery admission in an Indian hospital, from a digest of the clerking and any provisional diagnosis.

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
