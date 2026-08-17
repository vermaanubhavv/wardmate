"use client";

import { useOptimistic, useTransition } from "react";
import { completeTask } from "./actions";

/**
 * The circle you tap to tick a job off.
 *
 * It fills the moment it is touched, before the server has heard about it. Every screen here
 * is rendered against a database in another city, so waiting for the round trip put roughly a
 * second between the tap and any sign it had landed — long enough on a ward round to be
 * tapped again, which is how a job gets ticked, un-ticked, and left undone.
 *
 * The optimism is safe in the one direction it is used: ticking is reversible from the "done"
 * list, and the row disappearing is confirmation enough. If the write fails the next render
 * puts the job back, which is the correct outcome rather than a lie left on screen.
 */
export default function Tick({
  observationId,
  patientId,
  label,
}: {
  observationId: string;
  patientId: string;
  label: string;
}) {
  const [, startTransition] = useTransition();
  const [done, setDone] = useOptimistic(false);

  return (
    <form
      action={(formData: FormData) => {
        startTransition(async () => {
          setDone(true);
          await completeTask(formData);
        });
      }}
      className="shrink-0"
    >
      <input type="hidden" name="observation_id" value={observationId} />
      <input type="hidden" name="patient_id" value={patientId} />
      <button
        aria-label={`Mark done: ${label}`}
        className={
          "grid h-[26px] w-[26px] place-items-center rounded-full border-2 transition-colors " +
          (done ? "border-accent bg-accent" : "border-muted/50 active:border-accent")
        }
      >
        {/* The tick appears with the fill, so the state is legible at a glance rather than
            only by colour. */}
        {done && (
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-3.5 w-3.5"
            aria-hidden
          >
            <path d="m5 13 4 4L19 7" />
          </svg>
        )}
      </button>
    </form>
  );
}
