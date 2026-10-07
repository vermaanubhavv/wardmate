"use client";

import { useEffect, useRef, useState } from "react";
import type { SpokenPatient } from "@/lib/read-new-patient";
import { openLiveDictation, type LiveDictationSession } from "@/lib/stt/live";

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
 *
 * Live first: the words stream in as they are spoken (lib/stt/live.ts) and the boxes fill at
 * each pause, from everything said so far. Where live cannot start — no Deepgram key, a weak
 * signal, a browser that cannot stream — it records the clip and sends it on stop, as before.
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

  const liveRef = useRef<LiveDictationSession | null>(null);
  const finalRef = useRef("");
  const parsedRef = useRef("");
  const seqRef = useRef(0);
  const [heard, setHeard] = useState("");

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
    setHeard("");
    finalRef.current = "";
    parsedRef.current = "";

    if (await startLive()) return;
    await startBatch();
  }

  /** False on anything short of a working socket, so the clip path takes over unseen. */
  async function startLive(): Promise<boolean> {
    const abort = new AbortController();
    const timer = setTimeout(() => abort.abort(), 3000);
    try {
      const res = await fetch("/api/transcribe/live-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
        signal: abort.signal,
      });
      const data = (await res.json()) as { token?: string; keyterms?: string[] };
      clearTimeout(timer);
      if (!res.ok || !data.token) return false;

      liveRef.current = await openLiveDictation({
        token: data.token,
        keyterms: data.keyterms ?? [],
        onOpen: () => {
          setStatus("recording");
          navigator.vibrate?.(30);
        },
        onPartial: (t) => setHeard(join(finalRef.current, t)),
        onFinal: (t) => {
          finalRef.current = join(finalRef.current, t);
          setHeard(finalRef.current);
        },
        onUtteranceEnd: () => void parseText(finalRef.current),
        onError: (msg) => {
          setMessage(msg);
          stop();
        },
      });
      return true;
    } catch {
      clearTimeout(timer);
      return false;
    }
  }

  /** Fill the boxes from everything said so far. Only the newest answer is applied, so a slow
   *  earlier one can never overwrite a later one. */
  async function parseText(text: string, final = false) {
    const t = text.trim();
    if (!t || t === parsedRef.current) {
      if (final) setStatus("idle");
      return;
    }
    parsedRef.current = t;
    const seq = ++seqRef.current;
    try {
      const res = await fetch("/api/patients/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript: t }),
      });
      const data = await res.json();
      if (seq !== seqRef.current) return;
      if (!res.ok) {
        setMessage(data.error ?? "Something went wrong.");
      } else {
        const p = data.patient as SpokenPatient;
        onParsed(p);
        const filled = Object.entries(p).filter(([, v]) => v !== null && v !== "").length;
        setMessage(
          filled === 0
            ? "Nothing about a patient was heard yet."
            : `Filled ${filled} ${filled === 1 ? "box" : "boxes"} — check them before adding.`
        );
      }
    } catch {
      if (seq === seqRef.current) setMessage("No connection. Nothing was filled in.");
    }
    if (final && seq === seqRef.current) setStatus("idle");
  }

  async function startBatch() {
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

      // Timeslice: a chunk a second, so a stray interruption does not empty the buffer.
      recorder.start(1000);
      recorderRef.current = recorder;
      setStatus("recording");
      navigator.vibrate?.(30);
    } catch {
      setStatus("idle");
      setMessage("Microphone permission was refused. Allow it in your phone's settings.");
    }
  }

  function stop() {
    if (liveRef.current) {
      const session = liveRef.current;
      liveRef.current = null;
      session.stop();
      setStatus("working");
      navigator.vibrate?.(15);
      // Whatever was still being heard when Stop was pressed counts too.
      void parseText(finalRef.current, true);
      return;
    }
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
          "w-full rounded-xl px-4 py-4 text-body font-semibold disabled:opacity-60 " +
          (status === "recording"
            ? "bg-recording text-white"
            : "border border-line text-foreground")
        }
      >
        {label}
      </button>

      {heard && (
        <p aria-live="polite" className="ios-group px-4 py-3 text-subhead leading-snug">
          {heard}
        </p>
      )}

      {message ? (
        <p className="text-center text-footnote text-warn-fg">{message}</p>
      ) : (
        status === "idle" && (
          <p className="text-center text-footnote text-muted">
            e.g. &ldquo;Madina, 50 year old female, bed 5, fever for five days&rdquo;. Nothing is
            saved until you press Add.
          </p>
        )
      )}
    </div>
  );
}

const join = (a: string, b: string) => [a.trim(), b.trim()].filter(Boolean).join(" ");
