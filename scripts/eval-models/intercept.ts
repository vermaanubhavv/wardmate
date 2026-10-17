/**
 * Runs the app's own AI functions without letting them reach the API.
 *
 * Every lib/*.ts route builds its own `new Anthropic()` and calls `messages.create`. Patching
 * the shared Messages prototype lets the eval run each route EXACTLY as production builds its
 * request (same system prompt, schema, max_tokens), swap only the model/effort, and then:
 *
 *   - capture: a call with no stored answer is recorded for the next batch, and the route is
 *     abandoned there (its promise never settles — routes that swallow errors, like
 *     checkDates, would otherwise hide the capture);
 *   - replay: a call whose answer came back from a batch gets that answer, so the route's own
 *     post-processing (quote check, validator, keepOffered) runs on it unchanged.
 *
 * A route that makes two calls simply takes two rounds: the second call is captured on the
 * replay of the first.
 */
import { createHash } from "node:crypto";
import { Messages } from "@anthropic-ai/sdk/resources/messages/messages";
import type Anthropic from "@anthropic-ai/sdk";

export type Config = {
  id: string;
  /** Model to send instead of the route's own; null keeps the production model. */
  model: string | null;
  /** undefined keeps the route's effort, null removes it, a string sets it. */
  effort?: "low" | "medium" | "high" | null;
  /** Which routes this config is meant for, judged from the production model of the call. */
  appliesTo?: (productionModel: string) => boolean;
};

export type Captured = { custom_id: string; key: string; params: Anthropic.MessageCreateParamsNonStreaming };

export type Stored =
  | { type: "succeeded"; message: Anthropic.Message }
  | { type: "errored" | "canceled" | "expired"; error?: unknown };

type Ctx = {
  prefix: string;
  config: Config;
  calls: number;
  signal: (why: "captured" | "n/a") => void;
};

let ctx: Ctx | null = null;
/** Requests made by the grader (cases.ts judge()), never swapped to the config's model. */
export const judges = new WeakSet<object>();
const answers = new Map<string, Stored>();
export const captured: Captured[] = [];
/** custom_id → the production model of that call, for the report. */
export const productionModel = new Map<string, string>();

// Batch custom_ids allow [a-zA-Z0-9_-]{1,64}; the readable key lives in the state file.
export const idFor = (key: string) => createHash("sha1").update(key).digest("hex").slice(0, 32);

export function loadAnswers(stored: Map<string, Stored>) {
  for (const [k, v] of stored) answers.set(k, v);
}

function override(params: Anthropic.MessageCreateParamsNonStreaming, c: Config) {
  const p = structuredClone(params);
  if (c.model) p.model = c.model;
  const oc = (p.output_config ?? {}) as Record<string, unknown>;
  if (c.effort === null) delete oc.effort;
  else if (c.effort) oc.effort = c.effort;
  // Haiku 4.5 rejects effort with a 400 (lib/date-check-ai.ts says so too).
  if (String(p.model).startsWith("claude-haiku-4-5")) delete oc.effort;
  if (Object.keys(oc).length) p.output_config = oc as typeof p.output_config;
  else delete p.output_config;
  return p;
}

Messages.prototype.create = function (params: Anthropic.MessageCreateParams) {
  if (!ctx) throw new Error("eval-models: messages.create called outside a run");
  if (params.stream) throw new Error("eval-models: streaming routes are not supported by batches");
  const c = ctx;
  const key = `${c.prefix}|c${c.calls++}`;
  const custom_id = idFor(key);
  const prod = String(params.model);
  productionModel.set(custom_id, prod);

  if (c.calls === 1 && c.config.appliesTo && !c.config.appliesTo(prod)) {
    c.signal("n/a");
    return new Promise(() => {}) as never;
  }
  const got = answers.get(custom_id);
  if (got?.type === "succeeded") return Promise.resolve(got.message) as never;
  if (got) return Promise.reject(new Error(`batch ${got.type}: ${JSON.stringify(got.error ?? "")}`)) as never;

  // The grader always runs as written; a later call outside the config's routes (a Haiku
  // proofread after a Sonnet note) keeps its production model.
  const keep = judges.has(params) || (c.config.appliesTo && !c.config.appliesTo(prod));
  const p = params as Anthropic.MessageCreateParamsNonStreaming;
  captured.push({ custom_id, key, params: keep ? p : override(p, c.config) });
  c.signal("captured");
  return new Promise(() => {}) as never;
} as typeof Messages.prototype.create;

export type Outcome<T> = { kind: "done"; value: T } | { kind: "error"; error: string } | { kind: "captured" } | { kind: "n/a" };

/** Runs one route under one config; resolves when it finishes, fails, or hits a capture. */
export async function runOnce<T>(prefix: string, config: Config, fn: () => Promise<T>): Promise<Outcome<T>> {
  let signal!: (why: "captured" | "n/a") => void;
  const stopped = new Promise<Outcome<T>>((r) => (signal = (why) => r({ kind: why })));
  ctx = { prefix, config, calls: 0, signal };
  try {
    return await Promise.race([
      fn().then(
        (value): Outcome<T> => ({ kind: "done", value }),
        (e): Outcome<T> => ({ kind: "error", error: e instanceof Error ? e.message : String(e) })
      ),
      stopped,
    ]);
  } finally {
    ctx = null;
  }
}
