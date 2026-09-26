import type { ErrorEvent } from "@sentry/nextjs";

/**
 * Everything Sentry is about to send leaves this machine and lands on Sentry's servers.
 * WardMate is a clinical tool, so the rule here is the same as `lib/track.ts`: nothing that
 * identifies a patient may go out. This scrubber runs in `beforeSend` on the browser, the
 * server and the edge, and it is deliberately aggressive — a missed error report is cheaper
 * than a patient name in a third-party dashboard.
 *
 * What it does NOT catch: a patient's name passed directly into `throw new Error(name)`.
 * Don't do that — errors should describe what failed, never who it failed for.
 */

// Same shape `app/page-view.tsx` collapses, so a URL like /patients/<uuid>/discharge becomes
// /patients/:id/discharge in Sentry too.
const UUID =
  /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi;

// Next 16 can dispatch a hash navigation while the App Router is still booting in development.
// The framework throws this invariant before any WardMate code runs; Sentry should not turn that
// recoverable framework race into an actionable product issue. Actual application exceptions
// (including an event carrying another exception alongside this one) still go through.
const NEXT_ROUTER_INITIALISATION_ERROR =
  "Internal Next.js error: Router action dispatched before initialization.";

function scrubUrl(value: string): string {
  // Drop any query string wholesale (it can carry names, bed numbers, free text) and
  // replace patient ids with :id.
  return value.replace(UUID, ":id").split("?")[0] ?? value;
}

function scrubStrings<T>(input: T): T {
  if (typeof input === "string") return scrubUrl(input) as unknown as T;
  if (Array.isArray(input)) return input.map(scrubStrings) as unknown as T;
  if (input && typeof input === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(input)) out[k] = scrubStrings(v);
    return out as T;
  }
  return input;
}

/**
 * Same job as `scrubEvent`, for structured logs (`Sentry.logger.*` and any console capture).
 * Runs in `beforeSendLog`. Collapses ids in the message and in string attributes, and drops
 * attributes whose key suggests free text — so an accidental
 * `log.info("saved", { transcript })` never ships the transcript.
 */
const FREE_TEXT_KEYS =
  /transcript|(^|[._])text$|(^|[._])name$|note|value_text|source_quote|message|prompt|content|display_name/i;

export function scrubLog<T extends { message?: unknown; attributes?: Record<string, unknown> }>(
  logEntry: T
): T | null {
  if (typeof logEntry.message === "string") {
    logEntry.message = logEntry.message.replace(UUID, ":id");
  }
  if (logEntry.attributes) {
    for (const [k, v] of Object.entries(logEntry.attributes)) {
      if (FREE_TEXT_KEYS.test(k)) {
        delete logEntry.attributes[k];
      } else if (typeof v === "string") {
        logEntry.attributes[k] = v.replace(UUID, ":id");
      }
    }
  }
  return logEntry;
}

export function scrubEvent(event: ErrorEvent): ErrorEvent | null {
  const exceptions = event.exception?.values ?? [];
  if (
    exceptions.length > 0 &&
    exceptions.every((exception) => exception.value === NEXT_ROUTER_INITIALISATION_ERROR)
  ) {
    return null;
  }

  // Request metadata: keep the method and a de-identified path, drop the rest.
  if (event.request) {
    if (event.request.url) event.request.url = scrubUrl(event.request.url);
    delete event.request.query_string;
    delete event.request.data;
    delete event.request.cookies;
    delete event.request.headers;
  }

  // Never attach the end user (id / ip / email). We only ever want "an error happened",
  // not "it happened to this person".
  delete event.user;
  if (event.contexts) delete event.contexts.response;

  // Breadcrumbs are the click/fetch trail before the crash. URLs in them get the same
  // treatment; console breadcrumbs are dropped entirely because anything the app logged
  // could contain clinical text.
  if (event.breadcrumbs) {
    event.breadcrumbs = event.breadcrumbs
      .filter((b) => b.category !== "console")
      .map((b) => {
        if (b.data?.url && typeof b.data.url === "string") {
          b.data.url = scrubUrl(b.data.url);
        }
        if (typeof b.message === "string") b.message = scrubUrl(b.message);
        return b;
      });
  }

  // Stack frames carry file paths and, in dev, source snippets — de-identify any ids there.
  if (event.exception?.values) {
    for (const ex of event.exception.values) {
      if (typeof ex.value === "string") ex.value = ex.value.replace(UUID, ":id");
    }
  }
  if (event.transaction) event.transaction = scrubUrl(event.transaction);

  // Tags and extra data we set ourselves are fine, but pass them through the same filter
  // in case a future call site adds something careless.
  if (event.extra) event.extra = scrubStrings(event.extra);

  return event;
}
