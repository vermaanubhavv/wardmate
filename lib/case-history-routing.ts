import Anthropic from "@anthropic-ai/sdk";
import { correctTranscript } from "@/lib/glossary";
import { ROUTABLE_SECTIONS, type RoutableSection, type RoutedSegment } from "@/lib/case-history-sections";

export {
  ROUTABLE_SECTIONS,
  HISTORY_SECTION_LABEL,
  EXAM_SECTION_LABEL,
  HELD_SECTIONS,
} from "@/lib/case-history-sections";
export type { RoutableSection, RoutedSegment } from "@/lib/case-history-sections";

/**
 * Live routing for the "dictate the whole clerking" flow.
 *
 * A surgical clerking is never spoken in order — the resident gives the abdominal findings,
 * remembers a comorbidity, goes back to the complaint. So each time the resident pauses, the
 * span of transcript since the last pause is handed here and filed into the card(s) it belongs
 * to.
 *
 * This is a SORTING step, not a writing step. It never invents, never completes a sentence,
 * never resolves a contradiction — it splits what was said and labels each piece. Same
 * guardrail spirit as lib/case-history-ai.ts, and the same reason: the resident reviews every
 * card before the clerking is saved.
 *
 * A fast, cheap model (Haiku) — this runs many times per clerking and only has to classify.
 */

const ROUTING_MODEL = "claude-haiku-4-5-20251001";

function client(): Anthropic {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY is not set on the server.");
  return new Anthropic({ apiKey });
}

const SYSTEM = `You sort a fragment of dictated surgical clerking into the correct section(s) of a case sheet. The resident is dictating out of order and pausing between thoughts; you receive one pause-delimited fragment at a time, plus the list of complaints already mentioned.

Sections:
- "complaints" — a presenting complaint and its duration ("pain in the right iliac fossa for two days")
- "hopi" — detail about how one complaint began and progressed; set "complaint" to which one
- "past" — past medical history, known comorbidities ("diabetic for ten years")
- "family" — family history
- "medication" — drugs the patient takes at home
- "surgical" — previous operations
- "obstetric" — menstrual and obstetric history
- "abdomen" — per-abdomen examination findings
- "chest" — chest / respiratory examination findings
- "local" — local examination of a lump, wound, limb, perianal region
- "examination" — general examination, vitals, or PICCLE signs (pallor, icterus, oedema, BP, pulse, temperature)
- "diagnosis" — a stated provisional diagnosis or impression
- "plan" — a stated management step, investigation to send, or referral

Rules:
1. Output the resident's own words. Fix obvious mis-hearings and punctuation only. Never add a symptom, sign, value, duration or negative that was not said. Never complete a trailing sentence.
2. One fragment may contain more than one thing — split it into several segments.
3. If a fragment is filler ("okay", "next", "let me see") or you genuinely cannot place it, return no segment for it.
4. Do not resolve contradictions with anything said earlier — just file what this fragment says.
5. For "hopi", always set "complaint" to the complaint it concerns; match an existing complaint where possible.

Return JSON: { "segments": [ { "section": string, "complaint": string|null, "text": string } ] }.`;

const SCHEMA = {
  type: "object",
  properties: {
    segments: {
      type: "array",
      items: {
        type: "object",
        properties: {
          section: { type: "string", enum: [...ROUTABLE_SECTIONS] },
          complaint: { type: ["string", "null"] },
          text: { type: "string" },
        },
        required: ["section", "complaint", "text"],
        additionalProperties: false,
      },
    },
  },
  required: ["segments"],
  additionalProperties: false,
} as const;

/**
 * Sort one pause-delimited chunk of dictation into case-sheet sections.
 *
 * `knownComplaints` is the complaints filed so far, so HOPI detail attaches to the right one
 * and a genuinely new complaint is recognised as new.
 */
export async function routeClerkingChunk(
  chunk: string,
  knownComplaints: string[]
): Promise<{ segments: RoutedSegment[]; model: string }> {
  const text = chunk.trim();
  if (!text) return { segments: [], model: ROUTING_MODEL };

  // Same ward-vocabulary correction every other dictation path runs.
  const corrected = (await correctTranscript(text)).text.trim() || text;

  const complaintsLine =
    knownComplaints.length > 0
      ? `Complaints already mentioned: ${knownComplaints.join("; ")}`
      : "No complaints mentioned yet.";

  const response = await client().messages.create({
    model: ROUTING_MODEL,
    max_tokens: 700,
    system: [{ type: "text", text: SYSTEM, cache_control: { type: "ephemeral" } }],
    output_config: {
      effort: "low",
      format: { type: "json_schema", schema: SCHEMA as unknown as Record<string, unknown> },
    },
    messages: [{ role: "user", content: `${complaintsLine}\n\nFragment:\n${corrected}` }],
  });

  const block = response.content.find((b) => b.type === "text");
  const parsed =
    block && block.type === "text" ? (JSON.parse(block.text) as { segments?: unknown[] }) : { segments: [] };

  const segments: RoutedSegment[] = [];
  for (const raw of Array.isArray(parsed.segments) ? parsed.segments : []) {
    const r = raw as Record<string, unknown>;
    const section = String(r.section ?? "") as RoutableSection;
    const segText = String(r.text ?? "").trim();
    if (!segText || !ROUTABLE_SECTIONS.includes(section)) continue;
    const complaint = r.complaint == null ? undefined : String(r.complaint).trim() || undefined;
    segments.push(complaint ? { section, complaint, text: segText } : { section, text: segText });
  }

  return { segments, model: ROUTING_MODEL };
}
