import { cycleUrgency } from "./actions";
import { effectiveUrgency, URGENCY_META, type Urgency } from "@/lib/urgency";

/**
 * The colour of a job, and the control that changes it — one tap per step.
 *
 * Ungraded is drawn as an empty ring rather than a colour, because "nobody has decided how
 * urgent this is" must not look like a decision. It is the state a job lands in whenever the
 * resident gave no timeframe, and the ring is what invites the tap that settles it.
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
  const meta = effective.urgency ? URGENCY_META[effective.urgency] : null;

  return (
    <form action={cycleUrgency} className="shrink-0">
      <input type="hidden" name="observation_id" value={observationId} />
      <input type="hidden" name="patient_id" value={patientId} />
      {/* Cycles from the colour on screen, not the one in the database, so a tap does what
          the doctor can see it doing. */}
      <input type="hidden" name="current" value={effective.urgency ?? ""} />
      <button
        aria-label={
          meta
            ? `Urgency: ${meta.label}${effective.note ? `, ${effective.note}` : ""}. Tap to change.`
            : "No urgency set. Tap to set."
        }
        // Padding rather than a bigger dot: the target stays thumb-sized without the colour
        // shouting louder than the job it belongs to.
        className="-m-1 p-1 active:opacity-60"
      >
        <span
          className={
            "block h-4 w-4 rounded-full " +
            (meta ? meta.dot : "border-2 border-dashed border-muted/60")
          }
        />
      </button>
    </form>
  );
}
