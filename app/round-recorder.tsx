"use client";

import { useRouter } from "next/navigation";
import { MicIcon, StopIcon } from "./icons";
import Mark from "./mark";
import { track } from "@/lib/track";
import { useDictation } from "@/lib/use-dictation";

/** Longer than the bedside button: this is meant to cover a run of beds in one go. */
const MAX_SECONDS = 300;

/**
 * Dictate a run of beds from the ward list — "bed 1 discharge today, bed 2 send fresh
 * investigations".
 *
 * Tap to start, tap again to stop, for the same reason the bedside button works that way:
 * getUserMedia's permission prompt cannot live inside a press-and-hold gesture.
 *
 * This never writes to a patient. It always lands on a review screen, because one recording
 * touching several patients is the same risk as one photograph of the register touching
 * several — and a mis-heard bed number produces a perfectly plausible entry on the wrong
 * person, which nothing downstream can detect.
 *
 * The capture / persist / upload lifecycle is `useDictation` — shared with the bedside and
 * case-history recorders so it cannot drift.
 */
export default function RoundRecorder() {
  const router = useRouter();

  const { status, recording, seconds, message, start, stop } = useDictation({
    kind: "round",
    url: "/api/round",
    label: "Round dictation",
    maxSeconds: MAX_SECONDS,
    onResult: (data) => {
      const id = data.dictation_id;
      if (typeof id === "string") router.push(`/round/${id}`);
    },
  });

  function onStart() {
    track("round_recording_started");
    void start();
  }

  // The caption under the circle carries the state the button's own words used to. Recording
  // shows the count, because the one thing you want to know mid-dictation is how long you have
  // been talking.
  const caption =
    status === "recording"
      ? `${seconds}s · stop`
      : status === "starting"
        ? "Starting…"
        : status === "working"
          ? "Working…"
          : "Dictate";

  return (
    <div className="flex flex-col items-center">
      <button
        type="button"
        onClick={recording ? stop : onStart}
        disabled={status === "working" || status === "starting"}
        aria-label={recording ? "Stop recording" : "Dictate the round"}
        className={
          "grid h-14 w-14 place-items-center rounded-full disabled:opacity-60 active:opacity-80 " +
          (recording ? "bg-red-500 text-white" : "bg-accent text-accent-ink")
        }
      >
        {recording ? (
          // The ping sits behind the square, at the same size, and swells out from under it.
          <span className="relative inline-flex h-6 w-6 items-center justify-center">
            <span aria-hidden className="wm-listen absolute inset-0 rounded-full bg-white/70" />
            <StopIcon className="relative h-6 w-6" />
          </span>
        ) : status === "working" ? (
          <Mark className="h-7 w-7" spinning />
        ) : (
          <MicIcon className="h-6 w-6" />
        )}
      </button>

      <span
        className={
          "mt-1.5 text-[12px] tabular-nums " +
          (recording ? "text-red-600" : "text-muted")
        }
      >
        {caption}
      </span>

      {/* Above the bar, full width: these run to a sentence and must not stretch the row. */}
      {message && (
        <p className="absolute inset-x-0 bottom-full mb-2 px-2 text-center text-[13px] text-accent">
          {message}
        </p>
      )}
    </div>
  );
}
