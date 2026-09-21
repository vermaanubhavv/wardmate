import * as Sentry from "@sentry/nextjs";

/**
 * Thin wrappers over Sentry's span and log APIs, used to see where time goes inside a request
 * and to leave a structured trail of what it did.
 *
 * Everything here is a no-op when Sentry is not configured (no DSN) — `traced` still runs its
 * callback, `log.*` and `tagRequest` simply do nothing. So call sites don't need to guard.
 *
 * The rule from `lib/sentry-scrub.ts` applies here too: nothing that identifies a patient. Pass
 * counts, durations, sizes, provider/model names, and `ward_id` (a team identifier, already in
 * `app_events`) — never a name, a transcript, a note, a patient id, or an entry id.
 */

type Scalar = string | number | boolean;
type Attrs = Record<string, Scalar | null | undefined>;

/** Drop anything that isn't a scalar — Sentry attributes only accept string/number/boolean. */
function clean(attrs?: Attrs): Record<string, Scalar> {
  const out: Record<string, Scalar> = {};
  if (!attrs) return out;
  for (const [k, v] of Object.entries(attrs)) {
    if (typeof v === "string" || typeof v === "number" || typeof v === "boolean") out[k] = v;
  }
  return out;
}

/**
 * Run `fn` inside a span named `name`. The span shows up in the request's trace waterfall with
 * its own duration, so a slow step is visible instead of hidden inside the total.
 */
export function traced<T>(
  name: string,
  op: string,
  fn: () => Promise<T>,
  attrs?: Attrs
): Promise<T> {
  return Sentry.startSpan({ name, op, attributes: clean(attrs) }, fn);
}

/** Add attributes to the currently active span (e.g. token counts once a response is back). */
function annotateSpan(attrs: Attrs): void {
  const span = Sentry.getActiveSpan();
  if (span) span.setAttributes(clean(attrs));
}

/** Record an Anthropic response's token usage on the active span, under the gen_ai.* keys. */
export function recordAiUsage(usage: {
  input_tokens?: number;
  output_tokens?: number;
  cache_read_input_tokens?: number | null;
  cache_creation_input_tokens?: number | null;
}): void {
  annotateSpan({
    "gen_ai.usage.input_tokens": usage.input_tokens ?? 0,
    "gen_ai.usage.output_tokens": usage.output_tokens ?? 0,
    "gen_ai.usage.cache_read_input_tokens": usage.cache_read_input_tokens ?? 0,
    "gen_ai.usage.cache_creation_input_tokens": usage.cache_creation_input_tokens ?? 0,
  });
}

/**
 * Attach attributes to THIS request (Sentry's isolation scope — unique per request on the
 * server, so one request's tags never leak into another's). Every log and error from the rest
 * of the request carries them. Use for route name, ward_id, specialty.
 */
export function tagRequest(attrs: Attrs): void {
  try {
    Sentry.getIsolationScope().setAttributes(clean(attrs));
  } catch {
    // Sentry not initialised — nothing to tag.
  }
}

/** Structured logs, attached to the request's trace and searchable in Sentry. */
export const log = {
  info: (message: string, attrs?: Attrs) => emit("info", message, attrs),
  warn: (message: string, attrs?: Attrs) => emit("warn", message, attrs),
  error: (message: string, attrs?: Attrs) => emit("error", message, attrs),
};

function emit(level: "info" | "warn" | "error", message: string, attrs?: Attrs): void {
  try {
    Sentry.logger[level](message, clean(attrs));
  } catch {
    // logging must never break a request
  }
}
