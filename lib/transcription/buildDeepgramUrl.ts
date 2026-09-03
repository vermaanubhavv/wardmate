import { estimateTotalTokens } from "./selectMedicalKeyterms";

/**
 * Build the Deepgram `/v1/listen` query for WardMate's dictation.
 *
 * Nova-3 Medical, Indian English, and the selected keyterms as REPEATED `keyterm` parameters:
 *
 *   ...?model=nova-3-medical&language=en-IN&keyterm=acute+pancreatitis&keyterm=Ranson%27s+criteria
 *
 * NEVER a comma-joined list, and NEVER a legacy `keyword` with a `:weight` — Nova-3 keyterms
 * have no weights. The internal priority scores that chose these terms are not sent.
 */

export const DEEPGRAM_LISTEN_URL = "https://api.deepgram.com/v1/listen";

/** Deepgram's stated keyterm token limit is ~500; we never send close to this. */
export const DEEPGRAM_TOKEN_LIMIT = 500;
/** WardMate's own ceiling, with headroom. Selection stays under this; this is a backstop. */
export const WARDMATE_TOKEN_CEILING = 400;
/** Hard cap on the number of keyterms, matching the selector. */
export const MAX_KEYTERMS = 80;

export type DeepgramListenParams = {
  /** Defaults to "nova-3-medical". */
  model?: string;
  /** Defaults to "en-IN". */
  language?: string;
  /** Any other Deepgram flags the caller already uses (smart_format, punctuate, diarize…). */
  extra?: Record<string, string | number | boolean>;
};

/**
 * Returns the `URLSearchParams` for a Deepgram listen request. Keyterms are appended, never
 * set, so every one survives.
 */
export function buildDeepgramParams(
  keyterms: readonly string[],
  params: DeepgramListenParams = {}
): URLSearchParams {
  const search = new URLSearchParams();
  search.set("model", params.model ?? "nova-3-medical");
  search.set("language", params.language ?? "en-IN");

  for (const [key, value] of Object.entries(params.extra ?? {})) {
    search.set(key, String(value));
  }

  const safe = dedupeExact(keyterms).slice(0, MAX_KEYTERMS);
  for (const term of safe) {
    const trimmed = term.trim();
    if (trimmed) search.append("keyterm", trimmed);
  }

  return search;
}

/** The full request URL. */
export function buildDeepgramUrl(
  keyterms: readonly string[],
  params: DeepgramListenParams = {}
): string {
  return `${DEEPGRAM_LISTEN_URL}?${buildDeepgramParams(keyterms, params).toString()}`;
}

/** Diagnostics for the dev debug view — how big the keyterm payload is. */
export function keytermBudget(keyterms: readonly string[]): {
  count: number;
  estimatedTokens: number;
  withinWardmateCeiling: boolean;
  withinDeepgramLimit: boolean;
} {
  const safe = dedupeExact(keyterms).slice(0, MAX_KEYTERMS);
  const estimatedTokens = estimateTotalTokens(safe);
  return {
    count: safe.length,
    estimatedTokens,
    withinWardmateCeiling: estimatedTokens <= WARDMATE_TOKEN_CEILING,
    withinDeepgramLimit: estimatedTokens <= DEEPGRAM_TOKEN_LIMIT,
  };
}

function dedupeExact(terms: readonly string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const t of terms) {
    const key = t.trim().toLowerCase();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(t.trim());
  }
  return out;
}
