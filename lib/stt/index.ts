import type { SttProvider } from "./types";
import { OpenAITranscriber } from "./openai";
import { SarvamTranscriber } from "./sarvam";
import { DeepgramTranscriber } from "./deepgram";
import { traced } from "@/lib/observability";

export { MEDICAL_VOCABULARY_HINT, MEDICAL_KEYTERMS } from "./types";
export type { SttProvider, Transcription, TranscribeOptions } from "./types";

/**
 * The one place that decides which speech engine runs. To try a different one, add its file
 * beside openai.ts and another case here, then set STT_PROVIDER on Vercel — no redeploy of
 * anything else, and old entries keep the name of the engine that produced them.
 */
export function getTranscriber(): SttProvider {
  const choice = process.env.STT_PROVIDER ?? "openai";
  return withTracing(buildTranscriber(choice));
}

/**
 * Wrap a transcriber so every `transcribe()` call is a span in the request's trace — how long
 * the speech-to-text step took, which engine, how many bytes of audio. One place, so it
 * covers whichever provider `STT_PROVIDER` selects. No-op when Sentry is off.
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

function buildTranscriber(choice: string): SttProvider {
  switch (choice) {
    case "openai": {
      const key = process.env.OPENAI_API_KEY;
      if (!key) throw new Error("OPENAI_API_KEY is not set on the server.");
      return new OpenAITranscriber(key);
    }
    case "sarvam": {
      const key = process.env.SARVAM_API_KEY;
      if (!key) throw new Error("SARVAM_API_KEY is not set on the server.");
      return new SarvamTranscriber(key);
    }
    case "deepgram": {
      const key = process.env.DEEPGRAM_API_KEY;
      if (!key) throw new Error("DEEPGRAM_API_KEY is not set on the server.");
      return new DeepgramTranscriber(key);
    }
    default:
      throw new Error(`Unknown STT_PROVIDER: ${choice}`);
  }
}

/**
 * Every engine that has an API key configured, for the side-by-side comparison tool
 * (app/tools/transcribe). This is the only caller that runs more than one engine on the same
 * audio — the live capture paths always use exactly the one getTranscriber() picks, because
 * running three on every bedside tap would triple both the wait and the bill.
 *
 * An engine with no key is quietly left out rather than failing the whole comparison: the
 * point of the screen is to compare whatever is actually set up.
 */
export function getComparisonTranscribers(): SttProvider[] {
  const engines: SttProvider[] = [];
  for (const choice of ["openai", "sarvam", "deepgram"]) {
    try {
      engines.push(buildTranscriber(choice));
    } catch {
      // No key for this one — skip it.
    }
  }
  return engines;
}
