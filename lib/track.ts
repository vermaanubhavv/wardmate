"use client";

/**
 * Record one product event from the browser — "round_recording_started", "discharge_opened".
 *
 * Fire-and-forget: it never awaits, never throws, and uses `keepalive` so the request still
 * goes out if the page is navigating away. If the network is down it is simply lost, which is
 * the correct behaviour for a usage log on a ward with no signal.
 *
 * Do not pass anything clinical. `props` is for small labels only — the server drops anything
 * that is not a short string, number, or boolean.
 */
export function track(
  name: string,
  props?: Record<string, unknown>,
  opts?: { path?: string; wardId?: string | null }
): void {
  try {
    const payload = JSON.stringify({
      name,
      path: opts?.path ?? (typeof location !== "undefined" ? location.pathname : undefined),
      ward_id: opts?.wardId ?? undefined,
      props,
    });
    void fetch("/api/track", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: payload,
      keepalive: true,
    }).catch(() => {});
  } catch {
    // ignore
  }
}

/**
 * Time something the resident sits and waits on — an AI draft, a save, Finalise, Print — and
 * record it as one `wait` event: `{ what, ms, ok }`. Call the returned function when the wait
 * ends. Read back on the admin Events tab (admin_wait_summary, patch 0105).
 */
export function startWait(what: string): (ok?: boolean) => void {
  const t0 = performance.now();
  return (ok = true) => track("wait", { what, ms: Math.round(performance.now() - t0), ok });
}
