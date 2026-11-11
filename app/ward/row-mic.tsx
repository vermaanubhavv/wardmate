"use client";

import { useRouter } from "next/navigation";
import { MicIcon } from "../icons";
import Mark from "../mark";
import RecordingSheet, { HeardBox } from "../recording-sheet";
import { useDictation } from "@/lib/use-dictation";
import { useLiveWords } from "@/lib/stt/use-live-words";

/** The bedside button's limit, not the round's: this is one patient. */
const MAX_SECONDS = 180;

/**
 * Dictate for one bed straight from the ward list — one tap, before the patient page has
 * loaded. The recording goes the same way the bedside mic's does (/api/entries/voice, with the
 * patient fixed by the row, so no bed number has to be said or heard), and Done lands on the
 * patient page where the findings are. Tap to start, not hold: getUserMedia's permission
 * prompt cannot live inside a press-and-hold.
 */
export default function RowMic({ patientId, bed, name }: { patientId: string; bed: string; name: string }) {
  const router = useRouter();
  const { status, seconds, message, setMessage, stream, start, stop, discard } = useDictation({
    kind: "bedside",
    url: "/api/entries/voice",
    label: `Bed ${bed} dictation`,
    patientId,
    maxSeconds: MAX_SECONDS,
    onResult: (data) => {
      // The page offers Undo for a short while, keyed by the entry just made.
      const entry = typeof data.entry_id === "string" ? `?undo=${data.entry_id}` : "";
      router.push(`/patients/${patientId}${entry}`);
    },
  });
  const live = useLiveWords(stream);
  const heard = [...live.heard, live.current].join(" ").trim();

  return (
    <>
      <button
        type="button"
        onClick={() => void start()}
        disabled={status !== "idle"}
        aria-label={`Dictate for bed ${bed}`}
        className="grid h-11 w-11 place-items-center text-accent active:opacity-60 disabled:opacity-60"
      >
        {status === "working" ? <Mark className="h-5 w-5" spinning /> : <MicIcon className="h-5 w-5" />}
      </button>

      {(status === "starting" || status === "recording") && (
        <RecordingSheet
          status={status}
          title={`Bed ${bed} · ${name}`}
          seconds={seconds}
          maxSeconds={MAX_SECONDS}
          stream={stream}
          note="Saved to this patient when you tap Done. Numbers and drugs stay amber until confirmed."
          onDiscard={discard}
          onDone={stop}
        >
          <HeardBox>
            {heard ? (
              <p className="text-body">{heard}</p>
            ) : (
              <p className="text-subhead text-muted">
                {live.state === "unavailable"
                  ? "No live words on this signal. The recording carries on; the findings appear on the patient page."
                  : "e.g. “Drain 20 ml serous, afebrile, start orals.”"}
              </p>
            )}
          </HeardBox>
        </RecordingSheet>
      )}

      {message && (
        <div
          role="status"
          className="fixed inset-x-4 bottom-24 z-30 flex items-center gap-1 rounded-[10px] bg-warn-bg pl-3 text-footnote text-warn-fg shadow-sm"
        >
          <p className="flex-1 py-2">{message}</p>
          <button type="button" onClick={() => setMessage(null)} aria-label="Dismiss" className="grid h-11 w-11 shrink-0 place-items-center text-body active:opacity-60">
            ×
          </button>
        </div>
      )}
    </>
  );
}
