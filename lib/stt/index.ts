import { buildDeepgramUrl } from "@/lib/transcription/buildDeepgramUrl";
import { traced } from "@/lib/observability";

/**
 * Speech-to-text: Deepgram Nova-3 Medical, the only engine — one sub-processor for patient
 * audio. The old STT_PROVIDER variable is ignored, so a stale value on Vercel cannot switch it.
 *
 * Nova-3 Medical is trained on clinical speech, so anatomy, procedures and generic drug names
 * come back right without help. What it still needs told: Indian hospital shorthand, Indian
 * surgical ward terminology, brand drug names off an Indian chart, uncommon diagnoses and the
 * scoring systems a unit quotes. It takes a KEYTERM list — one boosted phrase per repeated
 * `keyterm` parameter, no weights — chosen BEFORE the request (Nova-3 keyterms cannot change
 * mid-session). Language is en-IN: a WardMate round is Indian English with Hindi loanwords.
 *
 * Each stored entry records `STT_PROVIDER` / `STT_MODEL`, so old recordings can be re-run.
 */
export const STT_PROVIDER = "deepgram";
export const STT_MODEL = "nova-3-medical";

export type Transcription = { text: string; provider: string; model: string };

/**
 * Transcribe one recorded clip. `keyterms` is the patient-selected list (lib/transcription);
 * when absent or empty the static ward list (MEDICAL_KEYTERMS) is sent instead. Every call is
 * a span in the request's trace — engine, model, audio bytes. No-op when Sentry is off.
 */
export function transcribe(audio: Blob, keyterms?: string[]): Promise<Transcription> {
  return traced("stt.transcribe", "gen_ai.transcribe", () => deepgram(audio, keyterms), {
    "stt.provider": STT_PROVIDER,
    "stt.model": STT_MODEL,
    "audio.bytes": audio.size,
  });
}

async function deepgram(audio: Blob, keyterms?: string[]): Promise<Transcription> {
  const key = process.env.DEEPGRAM_API_KEY;
  if (!key) throw new Error("DEEPGRAM_API_KEY is not set on the server.");

  const url = buildDeepgramUrl(keyterms?.length ? keyterms : MEDICAL_KEYTERMS, {
    // Punctuation, capitalisation and spoken-number formatting ("one zero one" -> "101").
    smart_format: true,
  });

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Token ${key}`,
      // Deepgram picks its decoder from the content type, not a filename.
      "Content-Type": audio.type || "audio/webm",
    },
    body: audio,
  });

  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`Deepgram speech-to-text failed (${res.status}): ${detail.slice(0, 300)}`);
  }

  const data = (await res.json()) as {
    results?: { channels?: { alternatives?: { transcript?: string }[] }[] };
  };
  const text = data.results?.channels?.[0]?.alternatives?.[0]?.transcript ?? "";
  return { text: text.trim(), provider: STT_PROVIDER, model: STT_MODEL };
}

/**
 * The ward's static keyterm list. Nova-3 takes no free-text prompt — it takes a keyterm list,
 * each entry boosted individually.
 *
 * Deepgram recommends staying under ~100 keyterms, so this is the mishearings that actually
 * matter — surgical procedures, the ward's own shorthand, and the brand drug names an Indian
 * chart uses — not every ordinary English word a model already knows.
 *
 * THIS IS THE FALLBACK ONLY. The patient-scoped dictation routes (voice, case-history, round)
 * now build a ~20–50 term list tailored to the specific patient — their diagnoses, operation,
 * drains and drugs first — via lib/transcription. See docs/medical-dictation-keyterms.md. This
 * static list is what Deepgram gets when there is no patient context (the add-patient and
 * engine-comparison routes) on a general-surgery unit — other units get their own lexicon via
 * wardKeyterms in lib/transcription/patient-context.ts — held to the 80-term cap by buildDeepgramUrl.
 */
export const MEDICAL_KEYTERMS: string[] = [
  // Procedures and operative terms
  "lap chole", "laparoscopic cholecystectomy", "appendicectomy", "laparotomy",
  "hernioplasty", "herniorrhaphy", "exploratory laparotomy", "Ryle's tube", "Foley's catheter",
  "suture line", "wound dehiscence", "burst abdomen", "stoma", "colostomy", "ileostomy",
  "stitch removal", "drain output", "serosanguinous", "bilious", "feculent",
  // Examination shorthand, said aloud on the round
  "per abdomen", "P/A soft", "abdomen soft", "NVBS", "normal vesicular breath sounds",
  "S1 S2 normal", "bowel sounds present", "passing flatus", "tolerating orals",
  "nil by mouth", "NBM", "afebrile", "febrile", "tachycardia", "post-op day", "POD",
  // Investigations and abbreviations
  "PAC", "pre-anaesthetic checkup", "PAC fitness", "OT list", "USG abdomen", "CBC", "LFT",
  "RFT", "KFT", "PT INR", "GRBS", "RBS", "DLC", "TLC", "HPE", "ECG", "ICD tube",
  "K/C/O", "H/O", "Koch's", "LAMA", "DAMA", "UHID", "MRD number", "casualty", "OPD", "IPD",
  // Fluids
  "Ringer lactate", "RL", "normal saline", "NS", "DNS", "isolyte",
  // Brand drugs an Indian chart actually lists
  "Monocef", "Taxim", "Magnex", "Metrogyl", "Emeset", "Pan 40", "Perinorm", "Tramazac",
  "Chymoral Forte", "Voveran", "Digene", "Clexane", "Lasix", "Augmentin", "Zosyn",
  "Meropenem", "Neomol", "Optineuron", "Rantac", "Zofer", "Piptaz",
  // Generic names that get mangled
  "ceftriaxone", "metronidazole", "ondansetron", "pantoprazole", "enoxaparin", "tramadol",
  "paracetamol", "piperacillin tazobactam", "amoxicillin clavulanate",
];
