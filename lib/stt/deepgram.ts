import type { SttProvider, Transcription } from "./types";
import { MEDICAL_KEYTERMS } from "./types";

/**
 * Deepgram's Nova-3 Medical model. The only mainstream engine trained specifically on clinical
 * speech, so anatomy, procedures and generic drug names come back right without help — the open
 * question this trial answers is whether it also handles the Indian-English accent and the ward's
 * brand-name shorthand as well as OpenAI-plus-hint currently does.
 *
 * Nova-3 does not take a free-text prompt the way gpt-4o-transcribe does. It takes a keyterm
 * list instead, one boosted phrase per entry — so this reads MEDICAL_KEYTERMS directly and
 * ignores the prose `hint` the shared interface passes, exactly as the Sarvam provider ignores
 * it for the opposite reason. Keyterm prompting is English-only, which matches nova-3-medical.
 */
export class DeepgramTranscriber implements SttProvider {
  readonly provider = "deepgram";
  readonly model = "nova-3-medical";

  constructor(private readonly apiKey: string) {}

  async transcribe(audio: Blob, hint: string): Promise<Transcription> {
    // The shared contract hands every engine the prose hint; Nova-3 has no field for it.
    void hint;

    const params = new URLSearchParams({
      model: this.model,
      // Punctuation, capitalisation and spoken-number formatting ("one zero one" -> "101").
      smart_format: "true",
      // A ward round is English with Hindi loanwords. Pinning the language stops the detector
      // switching on a short, noisy clip — the same reason the other two providers pin it.
      language: "en",
    });
    for (const term of MEDICAL_KEYTERMS) params.append("keyterm", term);

    const res = await fetch(`https://api.deepgram.com/v1/listen?${params.toString()}`, {
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
