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

/** Hard cap on the number of keyterms, matching the selector. */
export const MAX_KEYTERMS = 80;

/** Case-insensitive dedupe that keeps first-seen casing and trims each entry. */
export function dedupeCaseInsensitive(terms: readonly string[]): string[] {
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

/** Any other Deepgram flags the caller uses (smart_format, interim_results, diarize…). */
type DeepgramFlags = Record<string, string | number | boolean>;

/**
 * Returns the `URLSearchParams` for a Deepgram listen request. Keyterms are appended, never
 * set, so every one survives.
 */
export function buildDeepgramParams(
  keyterms: readonly string[],
  extra: DeepgramFlags = {}
): URLSearchParams {
  const search = new URLSearchParams();
  search.set("model", "nova-3-medical");
  search.set("language", "en-IN");

  for (const [key, value] of Object.entries(extra)) {
    search.set(key, String(value));
  }
  // Patient audio must never join Deepgram's Model Improvement Program. Set after `extra` so
  // no caller can switch it off.
  search.set("mip_opt_out", "true");

  const safe = dedupeCaseInsensitive(keyterms).slice(0, MAX_KEYTERMS);
  for (const term of safe) {
    const trimmed = term.trim();
    if (trimmed) search.append("keyterm", trimmed);
  }

  return search;
}

/** The full request URL. */
export function buildDeepgramUrl(keyterms: readonly string[], extra: DeepgramFlags = {}): string {
  return `${DEEPGRAM_LISTEN_URL}?${buildDeepgramParams(keyterms, extra).toString()}`;
}
