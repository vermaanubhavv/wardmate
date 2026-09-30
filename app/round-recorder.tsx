"use client";

import { useEffect } from "react";
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

  const { status, recording, seconds, message, setMessage, start, stop } = useDictation({
    kind: "round",
    url: "/api/round",
    label: "Round dictation",
    maxSeconds: MAX_SECONDS,
    onResult: (data) => {
      const id = data.dictation_id;
      if (typeof id === "string") router.push(`/round/${id}`);
    },
  });

  // Every status line is one of the hook's own fixed sentences (mic refused, too short, saved
  // offline, server refused) — never a transcript — so it is safe to log as the reason. This
  // is what tells the admin console WHY a started recording never became a draft.
  useEffect(() => {
    if (message) track("round_recording_failed", { reason: message });
  }, [message]);

  function onStart() {
    track("round_recording_started");
    void start();
  }

  // The caption under the circle carries the state the button's own words used to. Recording
  // shows the count against the cap, because the one thing you want to know mid-dictation is
  // how long you have been talking — and how long is left before it stops on its own.
  const caption =
    status === "recording"
      ? `${clock(seconds)} / ${clock(MAX_SECONDS)}`
      : status === "starting"
        ? "Starting…"
        : status === "working"
          ? "Transcribing…"
          : "Dictate round";

  return (
    <div className="flex flex-col items-center">
      <button
        type="button"
        onClick={recording ? stop : onStart}
        disabled={status === "working" || status === "starting"}
        aria-label={recording ? "Stop recording" : "Dictate the round"}
        className={
          "grid h-14 w-14 place-items-center rounded-full disabled:opacity-60 active:opacity-80 " +
          (recording ? "bg-recording text-white" : "bg-accent text-accent-ink")
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
          "mt-1.5 text-caption tabular-nums " +
          (recording ? (seconds >= MAX_SECONDS - 30 ? "text-warn-fg" : "text-recording") : "text-muted")
        }
      >
        {caption}
      </span>

      {/* Above the bar, full width: these run to a sentence and must not stretch the row. */}
      {message && <BarMessage message={message} onDismiss={() => setMessage(null)} />}
    </div>
  );
}

function clock(total: number) {
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;
}

/** A sentence hung above the bottom bar, on its own background so it reads over the list
 *  scrolling behind it, with a dismiss. Shared with the register button. */
export function BarMessage({ message, onDismiss }: { message: string; onDismiss: () => void }) {
  return (
    <div
      role="status"
      className="absolute inset-x-0 bottom-full mb-2 flex items-center gap-1 rounded-[10px] bg-warn-bg pl-3 text-footnote text-warn-fg shadow-sm"
    >
      <p className="flex-1 py-2">{message}</p>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss"
        className="grid h-11 w-11 shrink-0 place-items-center text-body active:opacity-60"
      >
        ×
      </button>
    </div>
  );
}
