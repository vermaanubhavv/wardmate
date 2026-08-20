"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Mark from "@/app/mark";
import { ImageIcon, MicIcon, StopIcon } from "@/app/icons";

type Status = "idle" | "starting" | "recording" | "working";

/**
 * Getting the admission clerking note into the app, the one time it is needed per patient.
 *
 * Two ways in, both landing on /api/entries/case-history: photograph the sheet, or dictate it.
 * Skippable — a bare "Add later" beneath both, because a patient can and does get created
 * before the clerking is finished, and the app should never block on paperwork that has not
 * been written yet.
 */
export default function CaseHistoryCapture({
  patientId,
  hasExisting = false,
}: {
  patientId: string;
  /** Once a case history exists, this becomes "add an addendum" rather than the first prompt —
   *  no reason to re-explain what it is, or offer to skip something already done. */
  hasExisting?: boolean;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [dismissed, setDismissed] = useState(false);

  async function submit(body: FormData) {
    setStatus("working");
    setMessage(null);
    try {
      const res = await fetch("/api/entries/case-history", { method: "POST", body });
      const data = await res.json();
      setStatus("idle");

      if (!res.ok) {
        setMessage(data.error ?? "Could not save the case history.");
        return;
      }

      const n = data.observations?.length ?? 0;
      setMessage(
        data.error ??
          (n === 0
            ? "Saved, but nothing structured was found in it."
            : `Saved — ${n} ${n === 1 ? "item" : "items"} recorded, including any plan mentioned.`)
      );
      router.refresh();
    } catch {
      setStatus("idle");
      setMessage("No connection. Nothing was saved.");
    }
  }

  function uploadPhoto(file: File) {
    const form = new FormData();
    form.append("patient_id", patientId);
    form.append("photo", file);
    void submit(form);
  }

  async function startRecording() {
    if (status !== "idle") return;
    setStatus("starting");
    setMessage(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const form = new FormData();
        form.append("patient_id", patientId);
        form.append("audio", blob, "case-history.webm");
        void submit(form);
      };
      mediaRef.current = recorder;
      recorder.start();
      setStatus("recording");
    } catch {
      setStatus("idle");
      setMessage("Could not reach the microphone.");
    }
  }

  function stopRecording() {
    mediaRef.current?.stop();
  }

  if (dismissed) return null;

  return (
    <div className="ios-group px-4 py-4">
      <p className="text-[15px] font-semibold">
        {hasExisting ? "Add to case history" : "Case history"}
      </p>
      <p className="mt-1 text-[13px] leading-relaxed text-muted">
        {hasExisting
          ? "An addendum — a further page, or something said since. It joins what is already recorded."
          : "Photograph the clerking sheet, or dictate it. Anything it plans — an operation, a workup, advice — goes straight onto the to-do list, the same as a spoken round."}
      </p>

      <div className="mt-3 flex gap-3">
        <button
          type="button"
          onClick={status === "recording" ? stopRecording : startRecording}
          disabled={status === "working" || status === "starting"}
          className={
            "flex flex-1 items-center justify-center gap-1.5 rounded-[10px] px-3 py-2.5 text-[15px] font-medium disabled:opacity-50 " +
            (status === "recording" ? "bg-red-500 text-white" : "bg-accent text-accent-ink")
          }
        >
          {status === "recording" ? (
            <StopIcon className="h-[18px] w-[18px]" />
          ) : status === "working" ? (
            <Mark className="h-[18px] w-[18px]" spinning />
          ) : (
            <MicIcon className="h-[18px] w-[18px]" />
          )}
          {status === "recording"
            ? "Stop"
            : status === "starting"
              ? "Starting…"
              : status === "working"
                ? "Working…"
                : "Dictate"}
        </button>

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={status !== "idle"}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-[10px] border border-line bg-card px-3 py-2.5 text-[15px] font-medium disabled:opacity-50"
        >
          <ImageIcon className="h-[18px] w-[18px]" />
          Photograph
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) uploadPhoto(file);
            e.target.value = "";
          }}
        />
      </div>

      {message && <p className="mt-3 text-[13px] text-muted">{message}</p>}

      {/* Only offered before anything is saved and before one exists — once a case history is
          on record there is nothing left to skip. */}
      {!message && !hasExisting && status === "idle" && (
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="mt-3 text-[13px] text-muted underline underline-offset-4"
        >
          Add later
        </button>
      )}
    </div>
  );
}
