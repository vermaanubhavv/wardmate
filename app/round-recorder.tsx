"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { MicIcon, StopIcon } from "./icons";
import Mark from "./mark";
import { enqueue } from "@/lib/outbox";

type Status = "idle" | "starting" | "recording" | "working";

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
 */
export default function RoundRecorder() {
  const router = useRouter();
  const [status, setStatus] = useState<Status>("idle");
  const [seconds, setSeconds] = useState(0);
  const [message, setMessage] = useState<string | null>(null);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const autoStoppedRef = useRef(false);

  useEffect(() => {
    if (status !== "recording") return;
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [status]);

  useEffect(() => {
    if (status === "recording" && seconds >= MAX_SECONDS) {
      autoStoppedRef.current = true;
      stop();
    }

  }, [seconds, status]);

  async function start() {
    // Guards the window before getUserMedia resolves: a second tap here must do nothing.
    if (status !== "idle") return;
    setStatus("starting");
    setMessage(null);
    setSeconds(0);
    autoStoppedRef.current = false;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
      });
      streamRef.current = stream;

      // Safari records mp4, Chrome webm. Asking for the wrong one yields a silent empty file
      // rather than an error.
      const mimeType = [
        "audio/webm;codecs=opus",
        "audio/webm",
        "audio/mp4",
        "audio/mpeg",
      ].find((t) => MediaRecorder.isTypeSupported(t));

      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => void send(recorder.mimeType);

      recorder.start();
      recorderRef.current = recorder;
      setStatus("recording");
      navigator.vibrate?.(30);
    } catch {
      setStatus("idle");
      setMessage("Microphone permission was refused. Allow it in your phone's settings.");
    }
  }

  function stop() {
    if (recorderRef.current?.state === "recording") {
      recorderRef.current.stop();
      setStatus("working");
      navigator.vibrate?.(15);
    } else {
      setStatus("idle");
    }
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }

  async function send(mimeType: string) {
    const blob = new Blob(chunksRef.current, { type: mimeType });
    chunksRef.current = [];

    if (blob.size < 1000) {
      setStatus("idle");
      setMessage("That was too short to hear anything.");
      return;
    }

    const form = new FormData();
    form.append("audio", blob);

    // Offline before we even try: queue it rather than spending 30 seconds failing.
    if (!navigator.onLine) return void queueIt(blob, mimeType);

    try {
      const res = await fetch("/api/round", { method: "POST", body: form });
      const data = await res.json();

      if (!res.ok) {
        setStatus("idle");
        setMessage(data.error ?? "Something went wrong.");
        return;
      }

      // Straight to the review screen. Nothing has been written to anyone yet.
      router.push(`/round/${data.dictation_id}`);
    } catch {
      // The signal went during the upload. The words are the one thing that cannot be
      // reconstructed later, so they go to the phone rather than being lost.
      void queueIt(blob, mimeType);
    }
  }

  async function queueIt(blob: Blob, mimeType: string) {
    try {
      await enqueue({
        kind: "round",
        url: "/api/round",
        label: "Round dictation",
        audio: blob,
        mimeType,
      });
      window.dispatchEvent(new Event("outbox-changed"));
      setStatus("idle");
      setMessage("No signal — saved on this phone. It will be read when you are back online.");
    } catch {
      setStatus("idle");
      setMessage("No signal, and this phone would not store it. Do not close the app.");
    }
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
        onClick={status === "recording" ? stop : start}
        disabled={status === "working" || status === "starting"}
        aria-label={status === "recording" ? "Stop recording" : "Dictate the round"}
        className={
          "grid h-14 w-14 place-items-center rounded-full disabled:opacity-60 active:opacity-80 " +
          (status === "recording" ? "bg-red-500 text-white" : "bg-accent text-accent-ink")
        }
      >
        {status === "recording" ? (
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
          (status === "recording" ? "text-red-600" : "text-muted")
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
