"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { MicIcon } from "./icons";
import Mark from "./mark";
import RecordingSheet, { HeardBox } from "./recording-sheet";
import { track } from "@/lib/track";
import { useDictation } from "@/lib/use-dictation";
import { useLiveWords } from "@/lib/stt/use-live-words";
import { heardByBed } from "@/lib/heard-by-bed";

/** Longer than the bedside button: this is meant to cover a run of beds in one go. */
const MAX_SECONDS = 300;

/**
 * Dictate a run of beds from the ward list — "bed 1 discharge today, bed 2 send fresh
 * investigations".
 *
 * Tap to start; the recording sheet (./recording-sheet.tsx, the same one the bedside uses)
 * rises with the words as they are heard, split at each bed number said. Done or Discard ends
 * it. Not press-and-hold: getUserMedia's permission prompt cannot live inside that gesture.
 *
 * The recording is the record. The live words on the sheet are a preview from a second
 * listener on the same microphone; on no signal they simply do not appear and the recording
 * carries on.
 *
 * This never writes to a patient. It always lands on a review screen, because one recording
 * touching several patients is the same risk as one photograph of the register touching
 * several — and a mis-heard bed number produces a perfectly plausible entry on the wrong
 * person, which nothing downstream can detect.
 *
 * The capture / persist / upload lifecycle is `useDictation` — shared with the bedside and
 * case-history recorders so it cannot drift.
 */
export default function RoundRecorder({ unitName }: { unitName: string }) {
  const router = useRouter();

  const { status, seconds, message, setMessage, stream, start, stop, discard } = useDictation({
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

  const live = useLiveWords(stream);
  const groups = heardByBed([...live.heard, live.current].join(" "));

  return (
    <div className="flex flex-col items-center">
      <button
        type="button"
        onClick={onStart}
        disabled={status !== "idle"}
        aria-label="Dictate the round"
        className="grid h-14 w-14 place-items-center rounded-full bg-accent text-accent-ink active:opacity-80 disabled:opacity-60"
      >
        {status === "working" ? <Mark className="h-7 w-7" spinning /> : <MicIcon className="h-6 w-6" />}
      </button>

      <span className="mt-1.5 text-caption text-muted">{status === "working" ? "Transcribing…" : "Dictate round"}</span>

      {(status === "starting" || status === "recording") && (
        <RecordingSheet
          status={status}
          title={`${unitName} round`}
          subtitle="Say the bed number before each patient."
          seconds={seconds}
          maxSeconds={MAX_SECONDS}
          stream={stream}
          note="Nothing is saved until you tap Done. You check each bed before anything is filed."
          onDiscard={() => {
            track("round_recording_discarded");
            discard();
          }}
          onDone={stop}
        >
          <HeardBox>
            {groups.length > 0 ? (
              groups.map((g, i) => (
                <div key={i} className="flex items-baseline gap-2.5">
                  {g.bed !== null && (
                    <span className="grid h-6 min-w-[1.625rem] shrink-0 place-items-center rounded-[6px] bg-card px-1 font-mono text-footnote font-semibold">
                      {g.bed}
                    </span>
                  )}
                  <span className="text-body">{g.text}</span>
                </div>
              ))
            ) : (
              <p className="text-subhead text-muted">
                {live.state === "unavailable"
                  ? "No live words on this signal. The recording carries on; you see every word on the review screen."
                  : "e.g. “Bed 1, discharge today. Bed 2, send fresh investigations.”"}
              </p>
            )}
          </HeardBox>
        </RecordingSheet>
      )}

      {/* Above the bar, full width: these run to a sentence and must not stretch the row. */}
      {message && <BarMessage message={message} onDismiss={() => setMessage(null)} />}
    </div>
  );
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
