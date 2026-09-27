import type { SttProvider } from "./types";
import { DeepgramTranscriber } from "./deepgram";
import { traced } from "@/lib/observability";

export { MEDICAL_VOCABULARY_HINT, MEDICAL_KEYTERMS } from "./types";
export type { SttProvider, Transcription, TranscribeOptions } from "./types";

/**
 * Deepgram is the only speech engine — one sub-processor for patient audio, not three. The old
 * STT_PROVIDER variable is ignored, so a stale value on Vercel cannot switch it.
 */
export function getTranscriber(): SttProvider {
  const key = process.env.DEEPGRAM_API_KEY;
  if (!key) throw new Error("DEEPGRAM_API_KEY is not set on the server.");
  return withTracing(new DeepgramTranscriber(key));
}

/**
 * Wrap a transcriber so every `transcribe()` call is a span in the request's trace — how long
 * the speech-to-text step took, which engine, how many bytes of audio. No-op when Sentry is off.
 */
function withTracing(p: SttProvider): SttProvider {
  return {
    provider: p.provider,
    model: p.model,
    transcribe: (audio, hint, options) =>
      traced("stt.transcribe", "gen_ai.transcribe", () => p.transcribe(audio, hint, options), {
        "stt.provider": p.provider,
        "stt.model": p.model,
        "audio.bytes": audio.size,
      }),
  };
}
