"use client";

import { useEffect, useRef, useState } from "react";
import type { SpokenPatient } from "@/lib/read-new-patient";

type Status = "idle" | "starting" | "recording" | "working";

/** One patient's details is a sentence, not a paragraph. */
const MAX_SECONDS = 60;

/**
 * Speak one patient's details into the form.
 *
 * This only fills boxes. Nothing is saved until the resident presses Add themselves, having
 * looked at every field — which is what makes it safe to be this direct, and why a field it
 * gets wrong costs a correction rather than a wrong patient. Fields nobody spoke are left
 * alone rather than cleared, so speaking a bed after typing a name keeps the name.
 */
export default function SpeakPatient({
  onParsed,
}: {
  onParsed: (patient: SpokenPatient) => void;
}) {
  const [status, setStatus] = useState<Status>("idle");
  const [seconds, setSeconds] = useState(0);
  const [message, setMessage] = useState<string | null>(null);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (status !== "recording") return;
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [status]);

  useEffect(() => {
    if (status === "recording" && seconds >= MAX_SECONDS) stop();
  }, [seconds, status]);

  async function start() {
    // Guards the window before getUserMedia resolves: a second tap must do nothing.
    if (status !== "idle") return;
    setStatus("starting");
    setMessage(null);
    setSeconds(0);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
      });
      streamRef.current = stream;

      const mimeType = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/mpeg"].find(
        (t) => MediaRecorder.isTypeSupported(t)
      );

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

    try {
      const res = await fetch("/api/patients/parse", { method: "POST", body: form });
      const data = await res.json();
      setStatus("idle");

      if (!res.ok) {
        setMessage(data.error ?? "Something went wrong.");
        return;
      }

      const p = data.patient as SpokenPatient;
      onParsed(p);

      const filled = Object.entries(p).filter(([, v]) => v !== null && v !== "").length;
      setMessage(
        filled === 0
          ? "Nothing about a patient was heard in that."
          : `Filled ${filled} ${filled === 1 ? "box" : "boxes"} — check them before adding.`
      );
    } catch {
      setStatus("idle");
      setMessage("No connection. Nothing was filled in.");
    }
  }

  const label =
    status === "recording"
      ? `Stop · ${seconds}s`
      : status === "starting"
        ? "Starting…"
        : status === "working"
          ? "Listening back…"
          : "Speak the details";

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={status === "recording" ? stop : start}
        disabled={status === "working" || status === "starting"}
        className={
          "w-full rounded-xl px-4 py-4 text-base font-semibold disabled:opacity-60 " +
          (status === "recording"
            ? "bg-red-500 text-white"
            : "border border-line text-foreground")
        }
      >
        {label}
      </button>

      {message ? (
        <p className="text-center text-xs text-amber-200">{message}</p>
      ) : (
        status === "idle" && (
          <p className="text-center text-xs text-muted">
            e.g. &ldquo;Madina, 50 year old female, bed 5, abdominal lump&rdquo;. Nothing is
            saved until you press Add.
          </p>
        )
      )}
    </div>
  );
}
