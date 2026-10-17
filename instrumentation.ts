// Server-side instrumentation entry point. Next.js calls `register()` once when the server
// boots (Node.js runtime: API routes, Server Actions, RSC; edge runtime: middleware.ts) and
// `onRequestError` whenever a request throws. Both just forward to Sentry, which stays
// dormant until SENTRY_DSN is set.
import * as Sentry from "@sentry/nextjs";
import { scrubEvent, scrubLog } from "@/lib/sentry-scrub";
import { tracesSampler } from "@/lib/sentry-sampling";

export async function register() {
  Sentry.init({
    dsn: process.env.SENTRY_DSN ?? process.env.NEXT_PUBLIC_SENTRY_DSN,
    environment: process.env.VERCEL_ENV ?? process.env.NODE_ENV,

    sendDefaultPii: false,

    // Per-request sampling — always trace the dictation/AI pipeline, 10% of the rest.
    tracesSampler,

    // Structured logs (`lib/observability.ts` -> `Sentry.logger.*`), attached to each request's
    // trace. Only explicit logger calls are captured — no console forwarding — so a stray
    // `console.log(patient)` can't leak. `scrubLog` strips ids and free-text attributes anyway.
    enableLogs: true,
    beforeSendLog: scrubLog,

    // Sentry's Next.js guide suggests `includeLocalVariables: true` here. Deliberately NOT set:
    // it attaches the *values* of local variables to every stack frame, and a server frame in
    // this app routinely holds a patient row just read from the database. `beforeSend` cannot
    // reliably scrub arbitrary locals, so the safe choice is to never collect them.
    beforeSend: scrubEvent,
  });
}

export const onRequestError = Sentry.captureRequestError;
