"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  clearChunks,
  clearInFlight,
  dropRecording,
  markInFlight,
  putChunk,
  saveRecording,
  type PendingKind,
} from "@/lib/outbox";

/**
 * The record-then-upload half of every "tap to speak" button in the app, in one place.
 *
 * Before this hook, `round-recorder.tsx`, `recorder.tsx` (bedside) and `case-history-capture.tsx`
 * each carried their own ~130-line copy of the same lifecycle — and they drifted: the bedside
 * one lost the timeslice and the crash-recovery writes in a rewrite and was silently back to
 * losing whole rounds. One implementation cannot drift from itself.
 *
 * What it guarantees, matching what the hand-written versions did:
 *
 *  - **One id per recording** (`crypto.randomUUID`) used three ways: the IndexedDB row key, the
 *    per-chunk key, and the server's `client_uuid`. A salvage, a clean save and a queue retry
 *    are therefore the same row and — because every dictation route dedups on `client_uuid` —
 *    the same single observation.
 *  - **A chunk a second** (`recorder.start(1000)` + `putChunk` in `ondataavailable`). An
 *    interruption before a clean stop costs at most the last second; `recoverInterruptedChunks()`
 *    (called from `connection-bar.tsx`) reassembles the rest on the next app open.
 *  - **Audio on the phone before the network is touched** (`saveRecording` before `fetch`), so a
 *    lock / background / kill mid-upload has already kept the words. Dropped again on a 2xx,
 *    kept to retry on a 5xx or a dropped connection, dropped on a 4xx.
 *  - **Salvage on the way out** — `pagehide`, `visibilitychange → hidden`, and unmount write
 *    whatever partial audio exists and stop the recorder.
 *  - **`markInFlight` / `clearInFlight`** so the offline queue's `flush()` never also sends a
 *    recording this tab is uploading itself.
 *
 * It does NOT cover: the live streaming path (`lib/stt/live.ts` — its words are already on
 * screen and filed sentence by sentence, so there is nothing to salvage), the level meter, or
 * any surface-specific UI. Those stay in the component.
 */

export type DictationStatus = "idle" | "starting" | "recording" | "working";

type ResultBody = Record<string, unknown>;

export type UseDictationOptions = {
  /** Which queue bucket, and where a queued copy should be posted. */
  kind: PendingKind;
  url: string;
  /** Shown in the offline queue so it is obvious what is waiting. */
  label: string;
  /** For a bedside recording: whose bed. Also sent as `patient_id`. */
  patientId?: string;
  /** A forgotten recording otherwise runs until the tab dies and bills a long transcription. */
  maxSeconds: number;
  /** Extra FormData fields beyond `audio`, `client_uuid` and `patient_id`. */
  fields?: () => Record<string, string>;
  /**
   * Handed the parsed 2xx body. Return a string to show it as the status line, or nothing.
   * This is where a caller navigates, refreshes, or renders findings.
   */
  onResult: (data: ResultBody, ctx: { autoStopped: boolean }) => string | null | void;
  /** Optional override for the "server refused it" (non-5xx) line. */
  rejectionMessage?: (data: ResultBody) => string;
};

const OFFLINE_SAVED = "No signal — saved on this phone. It will be sent when you are back online.";
const SERVER_5XX = "Saved on this phone — the server could not take it. It will retry.";
const STORAGE_FAILED = "No signal, and this phone would not store it. Do not close the app.";
const TOO_SHORT = "That was too short to hear anything.";

export function useDictation(opts: UseDictationOptions) {
  const { kind, url, label, patientId, maxSeconds } = opts;
  // Keep the latest callbacks without making start/stop change identity every render.
  const optsRef = useRef(opts);
  useEffect(() => {
    optsRef.current = opts;
  });

  const [status, setStatus] = useState<DictationStatus>("idle");
  const [seconds, setSeconds] = useState(0);
  const [message, setMessage] = useState<string | null>(null);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const recIdRef = useRef<string>("");
  const seqRef = useRef(0);
  const autoStoppedRef = useRef(false);
  const statusRef = useRef<DictationStatus>(status);
  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  const meta = useCallback(
    () => ({ kind, url, label, ...(patientId ? { patientId } : {}) }),
    [kind, url, label, patientId]
  );

  // Elapsed count is the "still listening" signal now that nothing holds a finger down.
  useEffect(() => {
    if (status !== "recording") return;
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [status]);

  const stop = useCallback(() => {
    if (recorderRef.current?.state === "recording") {
      recorderRef.current.stop();
      setStatus("working");
      navigator.vibrate?.(15);
    } else {
      setStatus("idle");
    }
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  useEffect(() => {
    if (status === "recording" && seconds >= maxSeconds) {
      autoStoppedRef.current = true;
      stop();
    }
  }, [seconds, status, maxSeconds, stop]);

  // Phone locked / swiped away / killed mid-dictation: write what we have now. A later clean
  // stop re-saves the fuller take under the same id, so this never doubles it.
  const salvage = useCallback(() => {
    if (statusRef.current !== "recording" && statusRef.current !== "working") return;
    const chunks = chunksRef.current;
    const mime = recorderRef.current?.mimeType || "audio/webm";
    if (chunks.length) {
      const blob = new Blob(chunks, { type: mime });
      if (blob.size > 800) {
        void saveRecording(recIdRef.current, { ...meta(), audio: blob, mimeType: mime });
      }
    }
    try {
      recorderRef.current?.requestData?.();
      if (recorderRef.current?.state === "recording") recorderRef.current.stop();
    } catch {
      // Already stopped, or the page is going faster than this can run.
    }
  }, [meta]);

  useEffect(() => {
    const onHide = () => {
      if (document.visibilityState === "hidden") salvage();
    };
    window.addEventListener("pagehide", salvage);
    document.addEventListener("visibilitychange", onHide);
    return () => {
      window.removeEventListener("pagehide", salvage);
      document.removeEventListener("visibilitychange", onHide);
      salvage();
    };
  }, [salvage]);

  const send = useCallback(
    async (mimeType: string) => {
      const blob = new Blob(chunksRef.current, { type: mimeType });
      chunksRef.current = [];
      const id = recIdRef.current;

      if (blob.size < 1000) {
        setStatus("idle");
        setMessage(TOO_SHORT);
        void dropRecording(id);
        void clearChunks(id);
        return;
      }

      const ext = mimeType.includes("mp4") ? "m4a" : mimeType.includes("mpeg") ? "mp3" : "webm";
      const form = new FormData();
      form.append("audio", blob, `${kind}.${ext}`);
      form.append("client_uuid", id);
      if (patientId) form.append("patient_id", patientId);
      for (const [k, v] of Object.entries(optsRef.current.fields?.() ?? {})) form.append(k, v);

      try {
        await saveRecording(id, { ...meta(), audio: blob, mimeType });
        window.dispatchEvent(new Event("outbox-changed"));
      } catch {
        setStatus("idle");
        setMessage(STORAGE_FAILED);
        return;
      }

      if (!navigator.onLine) {
        setStatus("idle");
        setMessage(OFFLINE_SAVED);
        return;
      }

      markInFlight(id);
      try {
        const res = await fetch(url, { method: "POST", body: form });
        const data = (await res.json()) as ResultBody;
        setStatus("idle");

        if (!res.ok) {
          if (res.status >= 500) {
            setMessage(SERVER_5XX);
          } else {
            void dropRecording(id);
            void clearChunks(id);
            setMessage(
              optsRef.current.rejectionMessage?.(data) ??
                (typeof data.error === "string" ? data.error : "Something went wrong.")
            );
          }
          return;
        }

        void dropRecording(id);
        void clearChunks(id);
        window.dispatchEvent(new Event("outbox-changed"));
        const line = optsRef.current.onResult(data, { autoStopped: autoStoppedRef.current });
        if (typeof line === "string") setMessage(line);
      } catch {
        setStatus("idle");
        setMessage(OFFLINE_SAVED);
      } finally {
        clearInFlight(id);
      }
    },
    [kind, url, patientId, meta]
  );

  const start = useCallback(async () => {
    // Guards the window before getUserMedia resolves — a second tap must do nothing.
    if (statusRef.current !== "idle") return;
    setStatus("starting");
    setMessage(null);
    setSeconds(0);
    autoStoppedRef.current = false;
    recIdRef.current = crypto.randomUUID();
    seqRef.current = 0;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
      });
      streamRef.current = stream;

      // Safari records mp4, Chrome webm. Asking for the wrong one yields a silent empty file.
      const mimeType = [
        "audio/webm;codecs=opus",
        "audio/webm",
        "audio/mp4",
        "audio/mpeg",
      ].find((t) => MediaRecorder.isTypeSupported(t));

      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      chunksRef.current = [];
      const recId = recIdRef.current;
      const chunkMeta = { ...meta(), mimeType: recorder.mimeType || mimeType || "audio/webm" };
      recorder.ondataavailable = (e) => {
        if (e.data.size === 0) return;
        chunksRef.current.push(e.data);
        void putChunk(recId, seqRef.current++, e.data, chunkMeta);
      };
      recorder.onstop = () => void send(recorder.mimeType);

      recorder.start(1000);
      recorderRef.current = recorder;
      setStatus("recording");
      navigator.vibrate?.(30);
    } catch {
      setStatus("idle");
      setMessage("Microphone permission was refused. Allow it in your phone's settings.");
    }
  }, [meta, send]);

  return {
    status,
    recording: status === "recording",
    seconds,
    message,
    setMessage,
    start,
    stop,
  };
}
