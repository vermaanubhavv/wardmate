import Anthropic from "@anthropic-ai/sdk";
import { correctTranscript } from "@/lib/glossary";
import {
  ROUTABLE_SECTIONS,
  sectionsForSpecialty,
  type RoutableSection,
  type RoutedSegment,
} from "@/lib/case-history-sections";

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

const SYSTEM = `You sort a fragment of dictated clerking into the correct section(s) of a case sheet. The resident is dictating out of order and pausing between thoughts; you receive one pause-delimited fragment at a time, plus the list of complaints already mentioned.

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
6. Some units have extra sections, listed under "Extra sections for this unit" in the message. Use them when they apply, exactly as described there. If no extra sections are listed, the ones above are the only ones that exist.

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
/**
 * The extra sections an oncology clerking can be filed into, described the way the base
 * sections are. Sent as part of the varying half of the prompt, after the cached block, so
 * adding a specialty never invalidates the shared prefix cache.
 */
const SPECIALTY_SECTION_BLOCKS: Record<string, string> = {
  medical_oncology: `Extra sections for this unit (medical oncology):
- "onco_disease" — what the cancer IS: primary site, histology, immunohistochemistry, stage, when it was diagnosed, biopsy or scan findings that establish it ("carcinoma left breast, IDC grade 2, ER positive, cT2N1M0, diagnosed March")
- "onco_treatment" — what has ALREADY been given for it: previous surgery, radiotherapy, earlier lines of chemotherapy with how many cycles and what the response was ("six cycles of FOLFOX last year, partial response")
- "onco_cycle" — the cycle running NOW: the regimen, which cycle, which day of it, any dose reduction or delay ("cycle 3 of R-CHOP, day 4, given at eighty percent")
- "onco_toxicity" — what the LAST cycle did to the patient: vomiting, mucositis, diarrhoea, neuropathy, fever, low counts, and the grade if one was stated ("grade 2 mucositis after the last cycle, could not eat solids for four days")
- "performance" — performance status and what the patient can and cannot do ("ECOG 2, in bed about half the day")
- "onco_nodes" — lymph node examination findings, station by station: cervical, supraclavicular, axillary, inguinal — size, number, mobility, tenderness, matting ("left supraclavicular node, 2 cm, firm, non-tender, fixed")
- "onco_mucosa_line" — oral mucosa / mucositis grade, skin and nail changes (hand-foot syndrome, rash), and the chemoport / PICC / central line site ("grade 2 mucositis, ulcers on the buccal mucosa" / "port site clean, no erythema")

Filing between these: a fact about the tumour goes to "onco_disease" even when a drug is named as part of establishing it. A drug being given NOW goes to "onco_cycle"; the same drug given in the past goes to "onco_treatment". A side effect goes to "onco_toxicity" and NOT to "complaints", unless the resident is presenting it as the reason for this admission. A physical finding on a lymph node goes to "onco_nodes" even when the same node is also the presenting complaint. Mouth ulcers or a rash found ON EXAMINATION go to "onco_mucosa_line"; the patient's own report of mouth pain as a symptom still goes to "onco_toxicity".`,
};

export async function routeClerkingChunk(
  chunk: string,
  knownComplaints: string[],
  /** The unit's department. Decides which extra sections exist; anything unrecognised gets
   *  the base set, which is what every unit had before specialty packs. */
  specialty?: string | null
): Promise<{ segments: RoutedSegment[]; model: string }> {
  const text = chunk.trim();
  if (!text) return { segments: [], model: ROUTING_MODEL };

  // Same ward-vocabulary correction every other dictation path runs.
  const corrected = (await correctTranscript(text)).text.trim() || text;

  const complaintsLine =
    knownComplaints.length > 0
      ? `Complaints already mentioned: ${knownComplaints.join("; ")}`
      : "No complaints mentioned yet.";

  const allowed = sectionsForSpecialty(specialty);
  const specialtyBlock = SPECIALTY_SECTION_BLOCKS[(specialty ?? "").trim()] ?? "";

  const response = await client().messages.create({
    model: ROUTING_MODEL,
    max_tokens: 700,
    system: [{ type: "text", text: SYSTEM, cache_control: { type: "ephemeral" } }],
    output_config: {
      effort: "low",
      format: { type: "json_schema", schema: SCHEMA as unknown as Record<string, unknown> },
    },
    messages: [
      {
        role: "user",
        content: `${complaintsLine}${specialtyBlock ? `\n\n${specialtyBlock}` : ""}\n\nFragment:\n${corrected}`,
      },
    ],
  });

  const block = response.content.find((b) => b.type === "text");
  const parsed =
    block && block.type === "text" ? (JSON.parse(block.text) as { segments?: unknown[] }) : { segments: [] };

  const segments: RoutedSegment[] = [];
  for (const raw of Array.isArray(parsed.segments) ? parsed.segments : []) {
    const r = raw as Record<string, unknown>;
    const section = String(r.section ?? "") as RoutableSection;
    const segText = String(r.text ?? "").trim();
    // Only a section this unit actually has. A model that reaches for an oncology section on
    // a surgical clerking has the segment dropped rather than filed somewhere it cannot be
    // reviewed — the same "the model's word alone is not enough" rule the rest of the app uses.
    if (!segText || !allowed.includes(section)) continue;
    const complaint = r.complaint == null ? undefined : String(r.complaint).trim() || undefined;
    segments.push(complaint ? { section, complaint, text: segText } : { section, text: segText });
  }

  return { segments, model: ROUTING_MODEL };
}
