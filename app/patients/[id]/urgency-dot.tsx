"use client";

import { useOptimistic, useTransition } from "react";
import { cycleUrgency } from "./actions";
import { effectiveUrgency, nextUrgency, URGENCY_META, type Urgency } from "@/lib/urgency";

/**
 * The colour of a job, and the control that changes it — one tap per step.
 *
 * Ungraded is drawn as an empty ring rather than a colour, because "nobody has decided how
 * urgent this is" must not look like a decision. It is the state a job lands in whenever the
 * resident gave no timeframe, and the ring is what invites the tap that settles it.
 *
 * The dot changes the instant it is tapped, before the database in Mumbai has heard about it.
 * A tap is grading the job now, so the colour it lands on is exactly what the next render will
 * show anyway; if the write fails the refresh puts the old colour back. Without this, cycling
 * red → yellow → green meant a tap, a second's wait, a tap, a second's wait.
 */
export default function UrgencyDot({
  observationId,
  patientId,
  urgency,
  gradedAt,
  recordedAt,
}: {
  observationId: string;
  patientId: string;
  urgency: Urgency;
  gradedAt: string | null;
  recordedAt: string;
}) {
  // What the colour means today. A "tomorrow" job read the next morning shows red, without
  // anything having been written back to it.
  const effective = effectiveUrgency({
    urgency,
    graded_at: gradedAt,
    recorded_at: recordedAt,
  });

  const [shown, setShown] = useOptimistic<Urgency>(effective.urgency);
  const [, startTransition] = useTransition();
  const meta = shown ? URGENCY_META[shown] : null;

  // The escalation note ("2 days overdue") only makes sense until the resident re-grades it —
  // a fresh tap resets the clock, so drop it the moment the shown colour is a tapped one.
  const note = shown === effective.urgency ? effective.note : null;

  return (
    <form
      action={(formData: FormData) => {
        startTransition(() => {
          setShown(nextUrgency(shown));
          return cycleUrgency(formData);
        });
      }}
      className="shrink-0"
    >
      <input type="hidden" name="observation_id" value={observationId} />
      <input type="hidden" name="patient_id" value={patientId} />
      {/* Cycles from the colour on screen, not the one in the database, so a tap does what
          the doctor can see it doing. */}
      <input type="hidden" name="current" value={shown ?? ""} />
      <button
        aria-label={
          meta
            ? `Urgency: ${meta.label}${note ? `, ${note}` : ""}. Tap to change.`
            : "No urgency set. Tap to set."
        }
        // Padding rather than a bigger dot: the target stays thumb-sized without the colour
        // shouting louder than the job it belongs to.
        className="-m-1 p-1 active:opacity-60"
      >
        <span
          className={
            "block h-3 w-3 rounded-full " +
            (meta ? meta.dot : "border-2 border-dashed border-muted/60")
          }
        />
      </button>
    </form>
  );
}
