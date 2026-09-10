// Edge runtime Sentry init — this is what runs middleware.ts. Loaded by instrumentation.ts.
// Dormant until SENTRY_DSN is set.
import * as Sentry from "@sentry/nextjs";
import { scrubEvent } from "@/lib/sentry-scrub";

Sentry.init({
  dsn: process.env.SENTRY_DSN ?? process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.VERCEL_ENV ?? process.env.NODE_ENV,

  sendDefaultPii: false,
  tracesSampleRate: 0.1,

  beforeSend: scrubEvent,
});
