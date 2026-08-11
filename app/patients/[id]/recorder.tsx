"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

type Status = "idle" | "recording" | "working" | "error";

/**
 * Hold to record, release to send. One button, no confirmation dialog — the resident is
 * holding a phone in one hand at a bedside and the whole interaction has 20 seconds.
 */
export default function Recorder({ patientId }: { patientId: string }) {
  const router = useRouter();
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState<string | null>(null);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  async function start() {
    if (status === "working" || status === "recording") return;
    setMessage(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          // A ward is noisy and the phone is at arm's length.
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      streamRef.current = stream;

      // Safari on iPhone records mp4; Chrome records webm. Ask for whichever the phone has
      // rather than assuming, because getting this wrong produces a silent empty file.
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

      // A short buzz so you know it is listening without looking at the screen.
      navigator.vibrate?.(30);
    } catch {
      setStatus("error");
      setMessage("Microphone permission was refused. Allow it in your phone's settings.");
    }
  }

  function stop() {
    if (recorderRef.current?.state === "recording") {
      recorderRef.current.stop();
      setStatus("working");
    }
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }

  async function send(mimeType: string) {
    const blob = new Blob(chunksRef.current, { type: mimeType });
    chunksRef.current = [];

    if (blob.size < 1000) {
      setStatus("idle");
      setMessage("That was too short. Hold the button while you speak.");
      return;
    }

    const form = new FormData();
    form.append("patient_id", patientId);
    form.append("audio", blob);

    try {
      const res = await fetch("/api/entries/voice", { method: "POST", body: form });
      const data = await res.json();

      if (!res.ok) {
        setStatus("error");
        setMessage(data.error ?? "Something went wrong.");
        return;
      }

      setStatus("idle");
      setMessage(
        data.error ??
          (data.observations?.length
            ? `Saved ${data.observations.length} ${data.observations.length === 1 ? "item" : "items"}.`
            : "Nothing clinical was found in that.")
      );
      router.refresh();
    } catch {
      setStatus("error");
      setMessage("No connection. Nothing was saved — try again in better signal.");
    }
  }

  const label =
    status === "recording"
      ? "Listening — release when done"
      : status === "working"
        ? "Working…"
        : "Hold to speak";

  return (
    <div className="flex flex-col items-center gap-3">
      <button
        // Pointer events cover finger and mouse alike, and firing on down/up is what makes
        // it hold-to-talk rather than tap-to-toggle.
        onPointerDown={start}
        onPointerUp={stop}
        onPointerLeave={stop}
        onPointerCancel={stop}
        onContextMenu={(e) => e.preventDefault()}
        disabled={status === "working"}
        className={
          "w-full rounded-2xl px-6 py-7 text-lg font-semibold transition-colors " +
          (status === "recording"
            ? "bg-rose-500 text-white"
            : status === "working"
              ? "bg-slate-700 text-muted"
              : "bg-accent text-slate-900")
        }
      >
        {label}
      </button>

      {message && (
        <p
          className={
            "text-center text-sm " + (status === "error" ? "text-amber-200" : "text-muted")
          }
        >
          {message}
        </p>
      )}
    </div>
  );
}
