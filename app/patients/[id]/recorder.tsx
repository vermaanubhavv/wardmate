"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type Status = "idle" | "starting" | "recording" | "working";

/** A forgotten recording otherwise runs until the tab dies, and bills a long transcription. */
const MAX_SECONDS = 180;

/**
 * Tap to start, tap again to stop.
 *
 * This replaced hold-to-talk, which could not work: starting needs `getUserMedia`, which on
 * iPhone opens a permission prompt and takes real time. The finger came up before the
 * recorder object existed, so the release handler had nothing to stop — and recording then
 * began after release and never ended. With two separate taps the slow part no longer sits
 * inside a gesture.
 */
export default function Recorder({
  patientId,
  onBusyChange,
}: {
  patientId: string;
  onBusyChange?: (busy: boolean) => void;
}) {
  const router = useRouter();
  const [status, setStatus] = useState<Status>("idle");
  const [seconds, setSeconds] = useState(0);
  const [message, setMessage] = useState<string | null>(null);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const autoStoppedRef = useRef(false);

  useEffect(() => {
    onBusyChange?.(status === "recording" || status === "starting");
  }, [status, onBusyChange]);

  // Nothing is holding a finger down any more, so the elapsed count is the signal that the
  // app is still listening.
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seconds, status]);

  async function start() {
    // Guards the window where getUserMedia has not resolved yet — the exact race that broke
    // the previous version. A second tap here must do nothing at all.
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

      // Safari on iPhone records mp4; Chrome records webm. Asking for the wrong one produces
      // a silent empty file rather than an error.
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
    form.append("patient_id", patientId);
    form.append("audio", blob);

    try {
      const res = await fetch("/api/entries/voice", { method: "POST", body: form });
      const data = await res.json();
      setStatus("idle");

      if (!res.ok) {
        setMessage(data.error ?? "Something went wrong.");
        return;
      }

      const saved = data.observations?.length
        ? `Saved ${data.observations.length} ${data.observations.length === 1 ? "item" : "items"}.`
        : "Nothing clinical was found in that.";

      setMessage(
        data.error ??
          (autoStoppedRef.current ? `Stopped at 3 minutes. ${saved}` : saved)
      );
      router.refresh();
    } catch {
      setStatus("idle");
      setMessage("No connection. Nothing was saved — try again in better signal.");
    }
  }

  const recording = status === "recording";
  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={recording ? stop : start}
        disabled={status === "working" || status === "starting"}
        className={
          "w-full rounded-2xl px-6 py-7 text-lg font-semibold transition-colors " +
          (recording
            ? "bg-rose-500 text-white"
            : status === "working" || status === "starting"
              ? "bg-slate-700 text-muted"
              : "bg-accent text-slate-900")
        }
      >
        {recording ? (
          <span className="flex items-center justify-center gap-3">
            <span
              aria-hidden
              className="h-3 w-3 rounded-full bg-white motion-safe:animate-pulse"
            />
            Tap to stop
            <span className="font-mono text-base tabular-nums opacity-90">
              {mm}:{ss}
            </span>
          </span>
        ) : status === "starting" ? (
          "Starting…"
        ) : status === "working" ? (
          "Working…"
        ) : (
          "Tap to speak"
        )}
      </button>

      {message && <p className="text-center text-sm text-muted">{message}</p>}
    </div>
  );
}
