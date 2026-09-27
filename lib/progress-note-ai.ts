import Anthropic from "@anthropic-ai/sdk";
import { AI_MODEL } from "@/lib/model";
import { DEFAULT_PROGRESS_NOTE_CONFIG, type ProgressNoteConfig } from "@/lib/progress-note-config";

/**
 * The AI compile for the daily progress note — turns the tapped fragments and dictated bits
 * from the note workspace into the clean, terse phrasing a ward progress sheet is written in.
 *
 * Same guardrails as lib/case-history-ai.ts and lib/discharge-ai.ts: the model is given only
 * what was recorded for today plus fixed patient context, it must invent nothing, and anything
 * ambiguous comes back in uncertain_points rather than being asserted. It is a PROPOSAL — the
 * resident reviews and applies it, and the note is only a record once signed.
 */

function client(): Anthropic {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) throw new Error("ANTHROPIC_API_KEY is not set on the server.");
  return new Anthropic({ apiKey: key });
}

export type NoteContext = {
  age_years: number | null;
  sex: string | null;
  diagnosis: string | null;
  status: string | null; // "Post Op Day (3)" / "Pre-op" / "Conservative"
  procedure: string | null;
};

/**
 * The instructions, built per department: which ward the patient is on, the shorthand that ward
 * writes in, and which exam lines exist. general_surgery keeps the same rules and fields as before
 * per-department notes existed, with its exam lines listed out.
 */
export function systemPromptFor(config: ProgressNoteConfig): string {
  const examIds = config.examSections.map((s) => s.id);
  const fieldList = ["complaints", "sensorium", ...examIds, "assessment"];
  const examGuide = config.examSections.map((s) => `- ${s.id}: ${s.title}`).join("\n");
  return `You write the daily progress-sheet entry for an inpatient on ${config.wardPhrase} in an Indian hospital, from the rough notes taken on this morning's round — tapped keywords, comma-separated fragments, dictated half-sentences.

You are REWRITING the fragments into the terse, standard phrasing a progress sheet uses. Not adding, not completing, not interpreting.

Absolute rules:
1. Use ONLY today's notes and the patient context given. Never introduce a symptom, sign, event or number that is not there.
2. Keep every clinical fact present in the fragments.
3. Say nothing where the fragments say nothing — a field with no content is returned as an empty string, not padded. Do not write "no complaints" unless the resident recorded that.
4. Progress-sheet register: short phrases, standard abbreviations (${config.registerHint}). Expand only genuinely ambiguous shorthand.
5. Do not invent an assessment. Only rewrite the resident's own words for it ("satisfactory", "improving", "static"). If they recorded none, return "".
6. Put any contradiction in the fragments (two findings that cannot both be true) in uncertain_points.
7. "plan" is a list — one concrete action per item, imperative, in the resident's intent. Do not add standard items they did not mention.

The examination lines on this ward's sheet:
${examGuide}

Fields to return, each a string ("" if nothing for it): ${fieldList.join(", ")}. Plus plan as string[].

Return JSON: { ${fieldList.map((f) => `"${f}": string`).join(", ")}, "plan": string[], "uncertain_points": string[] }.`;
}

function schemaFor(config: ProgressNoteConfig) {
  const fields = ["complaints", "sensorium", ...config.examSections.map((s) => s.id), "assessment"];
  return {
    type: "object",
    properties: {
      ...Object.fromEntries(fields.map((f) => [f, { type: "string" }])),
      plan: { type: "array", items: { type: "string" } },
      uncertain_points: { type: "array", items: { type: "string" } },
    },
    required: [...fields, "plan", "uncertain_points"],
    additionalProperties: false,
  };
}

export type CompiledNote = {
  /** complaints, sensorium, assessment, and one entry per exam section id of this department. */
  fields: Record<string, string>;
  plan: string[];
  uncertainPoints: string[];
  model: string;
};

export async function compileProgressNote(
  digest: string,
  ctx?: NoteContext,
  config: ProgressNoteConfig = DEFAULT_PROGRESS_NOTE_CONFIG
): Promise<CompiledNote> {
  const ctxLine = ctx
    ? `Patient: ${[
        ctx.age_years != null ? `${ctx.age_years}y` : null,
        ctx.sex,
        ctx.diagnosis,
        ctx.status,
        ctx.procedure,
      ]
        .filter(Boolean)
        .join(", ")}\n\n`
    : "";

  const response = await client().messages.create({
    model: AI_MODEL,
    max_tokens: 1200,
    system: [{ type: "text", text: systemPromptFor(config), cache_control: { type: "ephemeral" } }],
    output_config: {
      effort: "low",
      format: { type: "json_schema", schema: schemaFor(config) as unknown as Record<string, unknown> },
    },
    messages: [{ role: "user", content: `${ctxLine}Today's round notes:\n\n${digest}` }],
  });

  const block = response.content.find((b) => b.type === "text");
  const p = block && block.type === "text" ? JSON.parse(block.text) : {};
  const str = (v: unknown) => String(v ?? "").trim();
  return {
    fields: Object.fromEntries(
      ["complaints", "sensorium", ...config.examSections.map((sec) => sec.id), "assessment"].map((f) => [f, str(p[f])])
    ),
    plan: Array.isArray(p.plan) ? p.plan.map(String).map((s: string) => s.trim()).filter(Boolean) : [],
    uncertainPoints: Array.isArray(p.uncertain_points) ? p.uncertain_points.map(String) : [],
    model: AI_MODEL,
  };
}
