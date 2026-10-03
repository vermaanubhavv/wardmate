/**
 * The Discharge tab starts the first AI draft in the background (discharge-tab.tsx). A resident
 * who taps "Start discharge" before it lands used to open a workspace that saw no draft and
 * started a second one — six model calls, and a full wait anyway. The tab's request is kept here
 * instead, and the workspace picks it up rather than starting its own.
 *
 * Client-side and per page load: a full reload loses it, and the workspace then drafts as before.
 */
import { startWait } from "@/lib/track";

type WarmupResult = Record<string, unknown> | null;
const inFlight = new Map<string, Promise<WarmupResult>>();

export function startDischargeWarmup(patientId: string): Promise<WarmupResult> {
  const stop = startWait("discharge_warmup");
  const p = fetch(`/api/patients/${patientId}/discharge/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ section: "all" }),
  })
    .then((r) => (r.ok ? (r.json() as Promise<Record<string, unknown>>) : null))
    .catch(() => null)
    .then((data) => {
      stop(!!data);
      return data;
    });
  inFlight.set(patientId, p);
  return p;
}

/** The tab's request for this patient, if any — handed over once, so a later visit never reuses it. */
export function takeDischargeWarmup(patientId: string): Promise<WarmupResult> | undefined {
  const p = inFlight.get(patientId);
  inFlight.delete(patientId);
  return p;
}
