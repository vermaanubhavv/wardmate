import type { SttProvider, Transcription, TranscribeOptions } from "./types";

/**
 * OpenAI's gpt-4o-transcribe. Chosen to start with because it handles Indian-accented
 * English well and accepts a vocabulary hint, which is what keeps "lap chole" and
 * "ceftriaxone" from being mangled into ordinary English words.
 */
export class OpenAITranscriber implements SttProvider {
  readonly provider = "openai";
  readonly model = "gpt-4o-transcribe";

  constructor(private readonly apiKey: string) {}

  async transcribe(
    audio: Blob,
    hint: string,
    options?: TranscribeOptions
  ): Promise<Transcription> {
    // gpt-4o-transcribe takes the prose hint, not a keyterm list — the selected keyterms are
    // for Nova-3. Nothing to do with them here.
    void options;
    const form = new FormData();
    // The extension matters: the engine picks its decoder from the filename.
    form.append("file", audio, fileNameFor(audio.type));
    form.append("model", this.model);
    form.append("prompt", hint);
    form.append("response_format", "json");
    // A ward round is English with Hindi loanwords; pinning the language stops the engine
    // guessing a different one from a short, noisy clip.
    form.append("language", "en");

    const res = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: { Authorization: `Bearer ${this.apiKey}` },
      body: form,
    });

    if (!res.ok) {
      const detail = await res.text();
      throw new Error(`Speech-to-text failed (${res.status}): ${detail.slice(0, 300)}`);
    }

    const data = (await res.json()) as { text?: string };
    return {
      text: (data.text ?? "").trim(),
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
