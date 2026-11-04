/**
 * The tunnel path the browser SDK posts reports to, with the org and project read off the DSN.
 *
 * withSentryConfig (next.config.ts, tunnelRoute) adds a rewrite from /monitoring to Sentry's
 * ingest URL — but only for requests carrying `?o=<org>&p=<project>` (and `&r=<region>` on a
 * regional DSN). The Next wrapper's browser init built that query string itself; a bare
 * "/monitoring" matches no rewrite, so every report came back 404 and was dropped. Found on
 * wardmate.in the evening the plain-browser-SDK init shipped.
 *
 * Returns null for a DSN that is not Sentry SaaS (self-hosted), where there is no tunnel.
 */
export function sentryTunnelPath(dsn: string | undefined, route = "/monitoring"): string | null {
  const m = dsn?.match(/@o(\d+)\.ingest(?:\.([a-z]{2}))?\.sentry\.io\/(\d+)\/?$/);
  if (!m) return null;
  return `${route}?o=${m[1]}&p=${m[3]}${m[2] ? `&r=${m[2]}` : ""}`;
}
