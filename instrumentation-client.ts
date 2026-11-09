// Browser-side Sentry init. Next.js runs this file after the HTML loads and before React
// hydrates (see node_modules/next/dist/docs/.../instrumentation-client.md), which is early
// enough to catch a crash during hydration.
//
// With no NEXT_PUBLIC_SENTRY_DSN set, init is a no-op and the SDK stays dormant — so this is
// safe to ship before the Sentry account exists.
//
// @sentry/browser, not @sentry/nextjs. The Next wrapper's browser init pulls in page-load and
// navigation tracing whether or not it is sampled, and that code was the largest file the app
// shipped: 370 KB on every page, on hospital wifi. The plain browser SDK's defaults are crash
// capture only, so the tracing code is never referenced and never bundled. The waits residents
// actually feel are timed by hand (lib/track.ts startWait, read on the admin Events tab), and
// server-side spans still run through @sentry/nextjs in instrumentation.ts. The two things the
// wrapper did for the browser beyond that are done by hand below: the tunnel, and dropping
// Next's own redirect "errors".
import { init, type ErrorEvent, type EventHint } from "@sentry/browser";
import { scrubEvent, scrubLog } from "@/lib/sentry-scrub";
import { sentryTunnelPath } from "@/lib/sentry-tunnel";

// withSentryConfig (next.config.ts) sets the release it uploaded source maps under through
// Next's `env` block, so it is inlined here at build time as process.env._sentryRelease. The
// global is the older injection route, kept as the fallback the Next wrapper also keeps.
const injected = globalThis as { _sentryRelease?: string };
const release = process.env._sentryRelease || injected._sentryRelease;

/** A redirect() or notFound() in Next is thrown, not returned. Not a crash. */
function isNextNavigation(event: ErrorEvent, hint: EventHint): boolean {
  const digest = (hint.originalException as { digest?: unknown } | null)?.digest;
  const value = event.exception?.values?.[0]?.value ?? "";
  return (
    (typeof digest === "string" && /^NEXT_(REDIRECT|NOT_FOUND)/.test(digest)) ||
    value === "NEXT_REDIRECT" ||
    value === "NEXT_NOT_FOUND"
  );
}

init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NEXT_PUBLIC_VERCEL_ENV ?? process.env.NODE_ENV,
  release,

  // Route reports through wardmate.in/monitoring (next.config.ts tunnelRoute) instead of
  // sentry.io, so an ad blocker or a hospital firewall can't quietly swallow every error. The
  // org and project ride on the query string: the rewrite matches nothing without them, and
  // a bare "/monitoring" was answered 404 — see lib/sentry-tunnel.ts.
  tunnel:
    sentryTunnelPath(
      process.env.NEXT_PUBLIC_SENTRY_DSN,
      process.env._sentryRewritesTunnelPath || "/monitoring"
    ) ?? undefined,

  // Do NOT attach IP address, cookies, or request bodies. WardMate never wants to know which
  // person hit an error, only that one did.
  sendDefaultPii: false,

  // Session Replay is deliberately OFF (no replayIntegration is loaded): it screenshots the
  // DOM, which on a ward screen is patient names, beds and results. Errors + stack traces are
  // plenty.

  // Structured logs, same as the server. No console forwarding.
  enableLogs: true,
  beforeSendLog: scrubLog,

  beforeSend: (event, hint) => (isNextNavigation(event, hint) ? null : scrubEvent(event)),
});
