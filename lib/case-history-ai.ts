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

/** The department phrasing every case-history prompt is reframed to. Defaults to the exact
 *  wording the prompts were written with, so a general-surgery unit is byte-for-byte unchanged
 *  (and its prompt cache stays warm). A pack supplies its own — see SpecialtyPack.admissionPhrase. */
export const DEFAULT_ADMISSION_PHRASE = "a general-surgery admission";

/** Reframe a prompt written for general surgery to the unit's department. No-op for surgery. */
function forDept(systemText: string, admissionPhrase: string): string {
  return admissionPhrase && admissionPhrase !== DEFAULT_ADMISSION_PHRASE
    ? systemText.split(DEFAULT_ADMISSION_PHRASE).join(admissionPhrase)
    : systemText;
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
    const l = o.label.toLowerCase().trim();
    // The relevant negatives and the differential list are AI proposals, held separately and
    // rendered separately (the negatives ride the tail of the HOPI on their own). Feeding them
    // back would make compile fold them into the HOPI prose too — a duplicate on the sheet.
    if (/^(relevant|pertinent) negatives?$/.test(l) || l === "differential diagnosis") continue;
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
4. "diagnosis" is one line — the primary clinical problem, in standard terminology.
5. "differentials" is the list of other diagnoses a careful clinician would actively consider and rule out for THIS presentation — 0 to 4 of them, each one short (a diagnosis name, standard terminology). Order them most to least likely. Return an empty list only if the presentation genuinely admits no reasonable alternative.
6. Expand abbreviations you are not certain are unambiguous.
7. Put anything you are unsure of, or any internal contradiction in the digest, in uncertain_points.

Return JSON: { "diagnosis": string, "differentials": string[], "uncertain_points": string[] }.`;

const DIAGNOSIS_SCHEMA = {
  type: "object",
  properties: {
    diagnosis: { type: "string" },
    differentials: { type: "array", items: { type: "string" } },
    uncertain_points: { type: "array", items: { type: "string" } },
  },
  required: ["diagnosis", "differentials", "uncertain_points"],
  additionalProperties: false,
} as const;

export async function generateDiagnosis(
  digest: string,
  admissionPhrase: string = DEFAULT_ADMISSION_PHRASE
): Promise<{ text: string; differentials: string[]; uncertainPoints: string[]; model: string }> {
  const response = await client().messages.create({
    model: AI_MODEL,
    max_tokens: 600,
    system: [{ type: "text", text: forDept(DIAGNOSIS_SYSTEM, admissionPhrase), cache_control: { type: "ephemeral" } }],
    output_config: {
      effort: "low",
      format: { type: "json_schema", schema: DIAGNOSIS_SCHEMA as unknown as Record<string, unknown> },
    },
    messages: [{ role: "user", content: `Clerking digest:\n\n${digest}` }],
  });
  const block = response.content.find((b) => b.type === "text");
  const parsed =
    block && block.type === "text"
      ? JSON.parse(block.text)
      : { diagnosis: "", differentials: [], uncertain_points: [] };
  return {
    text: String(parsed.diagnosis ?? "").trim(),
    differentials: Array.isArray(parsed.differentials)
      ? parsed.differentials.map(String).map((s: string) => s.trim()).filter(Boolean)
      : [],
    uncertainPoints: Array.isArray(parsed.uncertain_points) ? parsed.uncertain_points.map(String) : [],
    model: AI_MODEL,
  };
}

// --- Relevant (pertinent) negatives -------------------------------------------------------

const NEGATIVES_SYSTEM = `You write the RELEVANT NEGATIVES that close the history of presenting illness for a general-surgery admission in an Indian hospital: the pertinent negative history that supports the working diagnosis and argues against each differential.

You are given the clerking digest, the working provisional diagnosis, and the differential diagnoses being considered.

Absolute rules:
1. Output ONE or TWO sentences of running prose — no list, no bullet points, no headings. This text is appended to the end of the history of presenting illness paragraph.
2. It is entirely NEGATIVES — things the patient does NOT have or has NOT had — in the voice of a case sheet: "There is no history of fever, weight loss or altered bowel habit, and no previous similar episodes."
3. Keep only the negatives that actually discriminate: for each differential, the feature whose absence makes it less likely; for the working diagnosis, the classic associated features that are reassuringly absent. Cover the main points, not every possibility.
4. Do NOT contradict the digest and do NOT restate something the digest already records as PRESENT. Never invent a specific number or date — these are plain absences.
5. If there is genuinely no useful negative to state, return an empty string.
6. Put anything you are unsure of in uncertain_points.

Return JSON: { "text": string, "uncertain_points": string[] }.`;

const NEGATIVES_SCHEMA = {
  type: "object",
  properties: {
    text: { type: "string" },
    uncertain_points: { type: "array", items: { type: "string" } },
  },
  required: ["text", "uncertain_points"],
  additionalProperties: false,
} as const;

export async function generateRelevantNegatives(
  digest: string,
  diagnosis: string,
  differentials: string[],
  admissionPhrase: string = DEFAULT_ADMISSION_PHRASE
): Promise<{ text: string; uncertainPoints: string[]; model: string }> {
  const ddx = differentials.filter(Boolean);
  const ask =
    `Working provisional diagnosis: ${diagnosis || "(not yet settled)"}\n` +
    `Differential diagnoses under consideration: ${ddx.length ? ddx.join("; ") : "(none listed)"}\n\n` +
    `Clerking digest:\n\n${digest}`;
  const response = await client().messages.create({
    model: AI_MODEL,
    max_tokens: 400,
    system: [{ type: "text", text: forDept(NEGATIVES_SYSTEM, admissionPhrase), cache_control: { type: "ephemeral" } }],
    output_config: {
      effort: "low",
      format: { type: "json_schema", schema: NEGATIVES_SCHEMA as unknown as Record<string, unknown> },
    },
    messages: [{ role: "user", content: ask }],
  });
  const block = response.content.find((b) => b.type === "text");
  const parsed =
    block && block.type === "text" ? JSON.parse(block.text) : { text: "", uncertain_points: [] };
  return {
    text: String(parsed.text ?? "").trim(),
    uncertainPoints: Array.isArray(parsed.uncertain_points) ? parsed.uncertain_points.map(String) : [],
    model: AI_MODEL,
  };
}

// --- Initial plan --------------------------------------------------------------------

const PLAN_SYSTEM = `You propose the INITIAL PLAN OF MANAGEMENT for a general-surgery admission in an Indian hospital, from a digest of the case sheet and any provisional diagnosis.

Absolute rules:
1. Build the plan only from what the digest supports — the presentation, the examination, the provisional diagnosis. Never order something for a condition the digest does not mention.
2. Each item is one concrete action a resident would write on the plan: an investigation to send, a treatment to start, a referral, a monitoring instruction, a consent/PAC step, NBM status, etc.
3. Standard, conservative first-day management. Do not commit to a definitive operation or procedure the digest does not already indicate; "plan for [procedure] after workup" is acceptable where the diagnosis implies it.
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
  digest: string,
  admissionPhrase: string = DEFAULT_ADMISSION_PHRASE
): Promise<{ items: string[]; uncertainPoints: string[]; model: string }> {
  const response = await client().messages.create({
    model: AI_MODEL,
    max_tokens: 900,
    system: [{ type: "text", text: forDept(PLAN_SYSTEM, admissionPhrase), cache_control: { type: "ephemeral" } }],
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

const COMPILE_SYSTEM = `You turn the rough working notes of a general-surgery admission case sheet — tapped keywords, comma-separated fragments, half-sentences dictated at the bedside — into a clean, flowing case history in standard clinical prose.

You are REWRITING what is given into readable form. You are not adding to it, not completing it, and not interpreting it.

Absolute rules:
1. Use ONLY the information in the notes and the patient details provided. Never introduce a symptom, sign, duration, negative, diagnosis or history item that is not already there.
2. Keep every clinical fact that is present. Do not drop a detail because it is awkward to phrase.
3. Do not resolve a contradiction and do not fill a silence. If the notes say nothing about something, your prose says nothing about it. Put anything genuinely ambiguous or self-contradictory in uncertain_points.
4. Expand ward shorthand where it is unambiguous — "RIF" to "right iliac fossa", "K/C/O" to "known case of", "H/O" to "history of" — but keep abbreviations a clinician expects to read (BP, PR, USG).
5. Third person, past tense. One tight paragraph per section — history of presenting illness may run to a few sentences, the rest are usually one or two.
6. Return one entry per section that actually has content. Omit a section entirely if there is nothing for it. Allowed section labels, exactly: "history of presenting illness", "past history", "family history", "medication history", "surgical history", "menstrual and obstetric history", "oncological history", "treatment received", "current cycle", "toxicity since last cycle". The last four apply only on an oncology unit and only when the notes contain that content — never invent them.
7. Do NOT return a "chief complaints" section — the complaints list stays as it was recorded.
8. For "history of presenting illness" open with the duration of the principal complaint before describing it, e.g. "The patient presented with a 3-day history of pain in the right iliac fossa..." or "She was apparently well 3 days ago, when she developed...". Only use a duration the notes actually give.
9. A duration may be written in the notes as "pain abdomen x 3 days", "pain abdomen × 3 days" or "vomiting: (1 day) ..." — read all of these as the duration of that complaint and render it as natural prose ("a 3-day history of...").
10. IGNORE any "relevant negatives" line in the notes — it is stored separately and printed at the tail of the history of presenting illness on its own. Do not copy it into your "history of presenting illness" text and do not give it a section.

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
  // "chief complaints" is deliberately not here — the complaints list is structured (chips +
  // durations) and a prose rewrite of it does not round-trip back into the Complaints card.
  "history of presenting illness",
  "past history",
  "family history",
  "medication history",
  "surgical history",
  "menstrual and obstetric history",
  // Medical oncology — only ever emitted on an oncology unit, where the digest carries them.
  "oncological history",
  "treatment received",
  "current cycle",
  "toxicity since last cycle",
]);

export async function compileCaseHistory(
  digest: string,
  patient?: PatientContext,
  admissionPhrase: string = DEFAULT_ADMISSION_PHRASE
): Promise<{ sections: { label: string; text: string }[]; uncertainPoints: string[]; model: string }> {
  const response = await client().messages.create({
    model: AI_MODEL,
    max_tokens: 2000,
    system: [{ type: "text", text: forDept(COMPILE_SYSTEM, admissionPhrase), cache_control: { type: "ephemeral" } }],
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
