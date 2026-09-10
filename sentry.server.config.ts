// Node.js server runtime Sentry init (API routes, Server Actions, RSC on Vercel's Node
// lambdas). Loaded by instrumentation.ts. Dormant until SENTRY_DSN is set.
import * as Sentry from "@sentry/nextjs";
import { scrubEvent } from "@/lib/sentry-scrub";

Sentry.init({
  dsn: process.env.SENTRY_DSN ?? process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.VERCEL_ENV ?? process.env.NODE_ENV,

  sendDefaultPii: false,
  tracesSampleRate: 0.1,

  // Sentry's Next.js guide suggests `includeLocalVariables: true` here. Deliberately NOT set:
  // it attaches the *values* of local variables to every stack frame, and a server frame in
  // this app routinely holds a patient row just read from the database. `beforeSend` cannot
  // reliably scrub arbitrary locals, so the safe choice is to never collect them.
  beforeSend: scrubEvent,
});
