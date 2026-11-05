"use client";

import { useOptimistic, useState, useTransition } from "react";
import { runOrQueue } from "@/lib/offline-actions";

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
  const [optimistic, setDone] = useOptimistic(false);
  // Queued on the phone with no signal: stays ticked after the transition ends, until the
  // queue sends it and the refresh takes the row off the list.
  const [queued, setQueued] = useState(false);
  const done = optimistic || queued;

  return (
    <form
      action={() => {
        startTransition(async () => {
          setDone(true);
          const r = await runOrQueue("tick", `Tick: ${label}`, observationId, patientId);
          if (r.ok && r.queued) setQueued(true);
        });
      }}
      className="-my-2 shrink-0"
    >
      <button
        aria-label={`Mark done: ${label}`}
        // The circle stays 26px; the button around it is 44pt, so a thumb lands on it without the
        // control looking any heavier than the job beside it.
        className="grid h-11 w-11 place-items-center"
      >
        <span
          className={
            "grid h-[26px] w-[26px] place-items-center rounded-full border-2 transition-colors " +
            (done ? "border-accent bg-accent" : "border-muted/50")
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
        </span>
      </button>
    </form>
  );
}
