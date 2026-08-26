/**
 * A specialised medical term-spotter that runs BEFORE the LLM extraction step in lib/extract.ts
 * — not a replacement for it. General-purpose LLMs occasionally mishear or skip a term buried
 * in a noisy dictated transcript (an unusual drug name, a clinical term that reads like a typo);
 * this catches candidates a purpose-built model is good at, and hands them to the LLM as a
 * checklist to listen for. It never gets to invent anything on its own: lib/extract.ts still
 * requires every observation to carry its own verbatim quote from the transcript, so a term
 * flagged here that was not actually said is simply dropped by that check, same as always.
 *
 * Backed by OpenMed's open-source clinical NER models (github.com/maziyarpanahi/openmed),
 * called today through Hugging Face's hosted inference API — see runNerModel() below for the
 * one place that would change if this later moves to running on our own server instead of
 * Hugging Face's. Nothing outside this file needs to know which one is doing the work.
 */

export type ClinicalEntity = {
  /** The span as the model found it, trimmed. Not guaranteed to appear verbatim in the
   *  transcript — HF/tokenizer artifacts (subword joins, casing) can shift it slightly, which is
   *  exactly why lib/extract.ts treats this as a hint to listen for, never a fact to trust. */
  text: string;
  label: "condition" | "drug";
};

/** One HF-hosted OpenMed model per entity family we care about for a ward round: what the
 *  patient has (condition, covers diagnoses and symptoms in this model's training data) and
 *  what they're on (drug). Both Apache-2.0, both small enough to run on HF's free serverless
 *  tier. Add another entry here for a new entity family; nothing else needs to change. */
const NER_MODELS: { id: string; label: ClinicalEntity["label"] }[] = [
  { id: "OpenMed/OpenMed-NER-DiseaseDetect-SuperClinical-184M", label: "condition" },
  { id: "OpenMed/OpenMed-NER-PharmaDetect-SuperClinical-434M", label: "drug" },
];

type HfNerSpan = { word?: string; entity_group?: string; score?: number };

/**
 * The resident is standing at a bedside waiting on this — a slow or cold-starting HF model must
 * never hold up the round. Failure of every kind (no token configured, network error, timeout,
 * a model still loading) degrades to an empty list rather than throwing, so extractObservations
 * simply proceeds without the hint, exactly as it did before this file existed.
 */
async function runNerModel(
  model: { id: string; label: ClinicalEntity["label"] },
  transcript: string,
  token: string
): Promise<ClinicalEntity[]> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 4000);
  try {
    const res = await fetch(`https://api-inference.huggingface.co/models/${model.id}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        inputs: transcript,
        parameters: { aggregation_strategy: "simple" },
        options: { wait_for_model: false },
      }),
      signal: controller.signal,
    });
    if (!res.ok) return [];
    const spans: HfNerSpan[] = await res.json();
    if (!Array.isArray(spans)) return [];
    return spans
      .map((s) => (s.word ?? "").trim())
      .filter((text) => text.length > 1)
      .map((text) => ({ text, label: model.label }));
  } catch {
    return [];
  } finally {
    clearTimeout(timeout);
  }
}

export async function extractClinicalEntities(transcript: string): Promise<ClinicalEntity[]> {
  const token = process.env.HUGGINGFACE_API_TOKEN;
  if (!token || !transcript.trim()) return [];

  const results = await Promise.all(NER_MODELS.map((m) => runNerModel(m, transcript, token)));

  // Same span from the same model can repeat (e.g. a drug named twice); different models can
  // also land on the same word. Deduplicated by text+label, case-insensitively, keeping the
  // first (highest-confidence, since HF returns spans in descending score order) occurrence.
  const seen = new Set<string>();
  const entities: ClinicalEntity[] = [];
  for (const entity of results.flat()) {
    const key = `${entity.label}:${entity.text.toLowerCase()}`;
    if (seen.has(key)) continue;
    seen.add(key);
    entities.push(entity);
  }
  return entities;
}
