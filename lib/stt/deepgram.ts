import type { SttProvider, Transcription, TranscribeOptions } from "./types";
import { MEDICAL_KEYTERMS } from "./types";
import { buildDeepgramUrl, keytermBudget } from "@/lib/transcription/buildDeepgramUrl";

/**
 * Deepgram's Nova-3 Medical model. The only mainstream engine trained specifically on clinical
 * speech, so anatomy, procedures and generic drug names come back right without help. What it
 * still needs told: Indian hospital shorthand, Indian surgical ward terminology, brand drug
 * names off an Indian chart, uncommon diagnoses and the scoring systems a unit quotes.
 *
 * Nova-3 does not take a free-text prompt the way gpt-4o-transcribe does. It takes a KEYTERM
 * list instead — one boosted phrase per repeated `keyterm` parameter, no weights. When the
 * caller passes a patient-selected list (lib/transcription), that is used; otherwise this
 * falls back to the static ward list. Either way the terms are chosen BEFORE the request is
 * made — Nova-3 keyterms cannot be changed mid-session. Language is en-IN, matching the two
 * other providers and the fact that a WardMate round is Indian English with Hindi loanwords.
 */
export class DeepgramTranscriber implements SttProvider {
  readonly provider = "deepgram";
  readonly model = "nova-3-medical";

  constructor(private readonly apiKey: string) {}

  async transcribe(
    audio: Blob,
    hint: string,
    options?: TranscribeOptions
  ): Promise<Transcription> {
    // The shared contract hands every engine the prose hint; Nova-3 has no field for it.
    void hint;

    const keyterms =
      options?.keyterms && options.keyterms.length > 0 ? options.keyterms : MEDICAL_KEYTERMS;

    const url = buildDeepgramUrl(keyterms, {
      model: this.model,
      language: "en-IN",
      extra: {
        // Punctuation, capitalisation and spoken-number formatting ("one zero one" -> "101").
        smart_format: true,
      },
    });

    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Token ${this.apiKey}`,
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

    return {
      text: text.trim(),
      provider: this.provider,
      model: this.model,
    };
  }
}

/** Re-exported so callers can log the PHI-safe keyterm budget without importing two modules. */
export { keytermBudget };
