import type { SttProvider, Transcription } from "./types";

/**
 * Sarvam's Saaras speech-to-text API. It is particularly useful for WardMate's Indian-English
 * and code-mixed dictation. The synchronous endpoint is intentionally used here because the
 * app expects one completed transcript back from each recording.
 *
 * Sarvam's REST endpoint currently accepts recordings up to 30 seconds. Longer ward-round
 * recordings should continue to use the existing provider until we add Sarvam's batch or
 * realtime transport.
 */
export class SarvamTranscriber implements SttProvider {
  readonly provider = "sarvam";
  readonly model = "saaras:v3";

  constructor(private readonly apiKey: string) {}

  async transcribe(audio: Blob, hint: string): Promise<Transcription> {
    // Sarvam's REST API has no vocabulary-hint field. Keep the shared provider contract so
    // switching engines does not alter the application flow.
    void hint;
    const form = new FormData();
    form.append("file", audio, fileNameFor(audio.type));
    form.append("model", this.model);
    form.append("mode", "transcribe");
    // WardMate dictation is predominantly Indian English. This avoids the language detector
    // changing its mind on a short, noisy clip, while Sarvam still handles familiar Hindi
    // loanwords in the surrounding speech.
    form.append("language_code", "en-IN");

    const res = await fetch("https://api.sarvam.ai/speech-to-text", {
      method: "POST",
      headers: { "api-subscription-key": this.apiKey },
      body: form,
    });

    if (!res.ok) {
      const detail = await res.text();
      throw new Error(`Sarvam speech-to-text failed (${res.status}): ${detail.slice(0, 300)}`);
    }

    const data = (await res.json()) as { transcript?: string };
    return {
      text: (data.transcript ?? "").trim(),
      provider: this.provider,
      model: this.model,
    };
  }
}

function fileNameFor(mimeType: string): string {
  if (mimeType.includes("mp4")) return "round.mp4";
  if (mimeType.includes("mpeg")) return "round.mp3";
  if (mimeType.includes("ogg")) return "round.ogg";
  if (mimeType.includes("wav")) return "round.wav";
  return "round.webm";
}
