"use client";

import { completeTask, setPacVerdict, setUrgency } from "@/app/patients/[id]/actions";
import { confirmMany, discardPending, editAndConfirm } from "@/app/confirm/actions";
import { replaceTodayNoteSection } from "@/app/patients/[id]/note/actions";
import { queueItem, type OfflineAction } from "@/lib/outbox";

/**
 * Taps that must not crash the screen when there is no signal.
 *
 * A server action called with no connection throws, and inside a transition that throw reaches
 * app/error.tsx: the whole patient page became "Something went wrong" because a tick was
 * tapped in a corridor. These are the small, idempotent writes — tick, urgency, PAC, confirm,
 * a note line — so they are queued on the phone instead and sent by the connection bar with
 * the recordings. Named, not imported, in lib/outbox.ts: a queued row carries the name and the
 * arguments, and this map resolves it when the queue is flushed.
 *
 * Identity edits and discharge are deliberately not here: two phones editing the same name
 * offline is a conflict, not a queue.
 */
export const OFFLINE_ACTIONS = {
  tick: (observationId: string, patientId: string) => {
    const f = new FormData();
    f.append("observation_id", observationId);
    f.append("patient_id", patientId);
    return completeTask(f);
  },
  urgency: setUrgency,
  pac: setPacVerdict,
  confirm: confirmMany,
  editConfirm: editAndConfirm,
  discard: discardPending,
  noteSection: replaceTodayNoteSection,
} satisfies Record<string, OfflineAction>;

type Actions = typeof OFFLINE_ACTIONS;

export type RunResult = { ok: true; queued: boolean } | { ok: false; error?: string };

/**
 * Call the action now, or queue it if the phone has no signal. `queued: true` means the tap is
 * saved on this phone and the screen should keep showing it as done — the optimistic state
 * alone reverts the moment the transition ends.
 */
export async function runOrQueue<K extends keyof Actions>(
  name: K,
  label: string,
  ...args: Parameters<Actions[K]>
): Promise<RunResult> {
  const queue = async (): Promise<RunResult> => {
    await queueItem({ kind: "action", url: "", action: name, args, label });
    return { ok: true, queued: true };
  };
  if (!navigator.onLine) return queue();
  try {
    const r = await (OFFLINE_ACTIONS[name] as (...a: unknown[]) => ReturnType<OfflineAction>)(...args);
    if (r && !r.ok) return { ok: false, error: r.error };
    return { ok: true, queued: false };
  } catch (e) {
    // The fetch itself failed (a TypeError, or the phone has since gone offline): no signal.
    // Anything else is the server's answer and still reaches the error boundary.
    if (e instanceof TypeError || !navigator.onLine) return queue();
    throw e;
  }
}
