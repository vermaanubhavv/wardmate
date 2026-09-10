import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs/config";

const nextConfig: NextConfig = {
  experimental: {
    // Formats and letterheads arrive as photographs of paper, and a phone photograph is
    // routinely two to four megabytes. Next caps a Server Action body at 1 MB by default,
    // which uploadFormat contradicts by accepting up to 10 MB: the file passed the app's own
    // check, then the framework refused the request before any of that code ran, and the
    // resident got an unexplained black "server error" page. Raised to match the limit the
    // app states. The 10 MB check in app/formats/actions.ts is still the one that reports a
    // too-large file in words.
    serverActions: { bodySizeLimit: "10mb" },

    // Keep already-fetched pages in the client cache for a short window so tapping "Ward"
    // and then "back" into a patient — or moving between patients — reuses what was just
    // shown instead of re-rendering the whole screen from the database. Next 15 changed
    // this default to 0 (every navigation refetches); on a ward round over hospital wifi
    // that reads as a lag on every tap. 20s is short enough that a value someone else just
    // wrote still shows up on the next real visit, and any write from THIS device
    // revalidates its own paths immediately regardless.
    staleTimes: { dynamic: 20, static: 180 },
  },
};

// `withSentryConfig` adds build-time pieces: source-map upload (so a stack trace points at
// real code, not minified soup) and the `/monitoring` tunnel below. With no SENTRY_AUTH_TOKEN
// it just skips the upload with a warning — the build still succeeds — so this is safe to
// commit before the Sentry account exists.
export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,

  // Quiet during local builds, verbose in CI/Vercel.
  silent: !process.env.CI,

  // Route Sentry's own network calls through wardmate.in/monitoring instead of sentry.io, so
  // an ad blocker or a hospital firewall can't quietly swallow every error report.
  tunnelRoute: "/monitoring",

  // Upload source maps for the browser bundle, then delete them so they aren't served.
  widenClientFileUpload: true,
  sourcemaps: { deleteSourcemapsAfterUpload: true },
});
