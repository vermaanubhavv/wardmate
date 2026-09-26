import { describe, expect, it } from "vitest";
import type { ErrorEvent } from "@sentry/nextjs";
import { scrubEvent } from "@/lib/sentry-scrub";

const run = (event: Partial<ErrorEvent>) =>
  scrubEvent(event as ErrorEvent) as ErrorEvent;

const UUID = "3f2504e0-4f89-11d3-9a0c-0305e82c3301";

describe("scrubEvent — nothing that identifies a patient leaves the machine", () => {
  it("drops Next.js's transient router-initialisation invariant", () => {
    expect(
      scrubEvent({
        exception: {
          values: [
            {
              type: "Error",
              value: "Internal Next.js error: Router action dispatched before initialization.",
            },
          ],
        },
      } as ErrorEvent)
    ).toBeNull();
  });

  it("keeps a real exception even when a framework invariant is also present", () => {
    expect(
      scrubEvent({
        exception: {
          values: [
            { type: "Error", value: "Internal Next.js error: Router action dispatched before initialization." },
            { type: "Error", value: "contact form failed" },
          ],
        },
      } as ErrorEvent)
    ).not.toBeNull();
  });

  it("collapses patient ids in the request url and drops the query string", () => {
    const out = run({
      request: {
        url: `https://wardmate.in/patients/${UUID}/discharge?name=Asha+Rao`,
        method: "GET",
      },
    });
    expect(out.request?.url).toBe("https://wardmate.in/patients/:id/discharge");
  });

  it("strips request headers, cookies and body wholesale", () => {
    const out = run({
      request: {
        url: "https://wardmate.in/ward",
        headers: { authorization: "Bearer x" },
        cookies: { "sb-auth-token": "secret" },
        data: { note: "patient febrile overnight" },
        query_string: "q=Asha",
      },
    });
    expect(out.request?.headers).toBeUndefined();
    expect(out.request?.cookies).toBeUndefined();
    expect(out.request?.data).toBeUndefined();
    expect(out.request?.query_string).toBeUndefined();
  });

  it("never attaches the end user", () => {
    const out = run({ user: { id: "u1", ip_address: "1.2.3.4", email: "a@b.com" } });
    expect(out.user).toBeUndefined();
  });

  it("drops console breadcrumbs and de-identifies urls in the rest", () => {
    const out = run({
      breadcrumbs: [
        { category: "console", message: "logged: Asha Rao, bed 4" },
        { category: "fetch", data: { url: `https://wardmate.in/api/patients/${UUID}` } },
      ],
    });
    expect(out.breadcrumbs).toHaveLength(1);
    expect(out.breadcrumbs?.[0].data?.url).toBe("https://wardmate.in/api/patients/:id");
  });

  it("de-identifies ids that surface in an exception message or transaction name", () => {
    const out = run({
      transaction: `/patients/${UUID}/note`,
      exception: { values: [{ type: "Error", value: `no row for ${UUID}` }] },
    });
    expect(out.transaction).toBe("/patients/:id/note");
    expect(out.exception?.values?.[0].value).toBe("no row for :id");
  });
});
