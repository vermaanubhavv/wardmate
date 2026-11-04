import { describe, expect, it } from "vitest";
import { sentryTunnelPath } from "@/lib/sentry-tunnel";

describe("sentryTunnelPath", () => {
  it("carries the org and project the rewrite matches on", () => {
    expect(sentryTunnelPath("https://abc123@o4509.ingest.sentry.io/4510")).toBe("/monitoring?o=4509&p=4510");
  });
  it("adds the region for a regional DSN", () => {
    expect(sentryTunnelPath("https://abc@o1.ingest.de.sentry.io/2")).toBe("/monitoring?o=1&p=2&r=de");
  });
  it("has no tunnel for a self-hosted DSN or no DSN", () => {
    expect(sentryTunnelPath("https://abc@sentry.example.com/2")).toBeNull();
    expect(sentryTunnelPath(undefined)).toBeNull();
  });
});
