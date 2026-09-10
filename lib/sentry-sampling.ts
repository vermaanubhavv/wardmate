/**
 * How much of production to trace. Shared by the server and edge Sentry configs.
 *
 * A flat 10% misses most of any single slow request. Instead: never trace pure noise, always
 * trace the dictation / AI pipeline (the part we actually need latency data on — see
 * `wardmate-performance`), and sample the rest at 10%.
 */
type SamplingContext = {
  name?: string;
  inheritOrSampleWith: (fallback: number) => number;
};

export function tracesSampler(ctx: SamplingContext): number {
  const name = ctx.name ?? "";

  // Noise — telemetry sinks, health/debug, static assets.
  if (
    name.includes("/monitoring") ||
    name.includes("/api/track") ||
    name.includes("/api/debug") ||
    name.includes("/_next/")
  ) {
    return 0;
  }

  // The pipeline: speech-to-text, extraction, round split, and every AI "generate" route.
  if (
    /\/api\/(entries|round|transcribe)\b/.test(name) ||
    /\/(generate|route-dictation|read-paper|parse)\b/.test(name) ||
    name.includes("prepare-discharge")
  ) {
    return 1;
  }

  // Everything else: honour an incoming trace's decision, else 10%.
  return ctx.inheritOrSampleWith(0.1);
}
