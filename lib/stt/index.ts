import type { SttProvider } from "./types";
import { OpenAITranscriber } from "./openai";

export { MEDICAL_VOCABULARY_HINT } from "./types";
export type { SttProvider, Transcription } from "./types";

/**
 * The one place that decides which speech engine runs. To try a different one, add its file
 * beside openai.ts and another case here, then set STT_PROVIDER on Vercel — no redeploy of
 * anything else, and old entries keep the name of the engine that produced them.
 */
export function getTranscriber(): SttProvider {
  const choice = process.env.STT_PROVIDER ?? "openai";

  switch (choice) {
    case "openai": {
      const key = process.env.OPENAI_API_KEY;
      if (!key) throw new Error("OPENAI_API_KEY is not set on the server.");
      return new OpenAITranscriber(key);
    }
    default:
      throw new Error(`Unknown STT_PROVIDER: ${choice}`);
  }
}
