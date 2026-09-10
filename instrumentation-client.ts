// Browser-side Sentry init. Next.js runs this file after the HTML loads and before React
// hydrates (see node_modules/next/dist/docs/.../instrumentation-client.md), which is early
// enough to catch a crash during hydration.
//
// With no NEXT_PUBLIC_SENTRY_DSN set, Sentry.init is a no-op and the SDK stays dormant — so
// this is safe to ship before the Sentry account exists.
import * as Sentry from "@sentry/nextjs";
import { scrubEvent, scrubLog } from "@/lib/sentry-scrub";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NEXT_PUBLIC_VERCEL_ENV ?? process.env.NODE_ENV,

  // Do NOT attach IP address, cookies, or request bodies. WardMate never wants to know which
  // person hit an error, only that one did.
  sendDefaultPii: false,

  // Performance: sample 10% of page loads / navigations. Enough to see which screens and
  // Supabase round trips are slow in the field without a large bill.
  tracesSampleRate: 0.1,

  // Session Replay is deliberately OFF: it screenshots the DOM, which on a ward screen is
  // patient names, beds and results. Errors + stack traces are plenty.
  replaysSessionSampleRate: 0,
  replaysOnErrorSampleRate: 0,

  // Structured logs, same as the server. No console forwarding.
  enableLogs: true,
  beforeSendLog: scrubLog,

  beforeSend: scrubEvent,
});

// Lets Sentry tie a slow navigation to the route that caused it.
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
