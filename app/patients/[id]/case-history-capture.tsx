"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Mark from "@/app/mark";
import { ImageIcon, MicIcon, StopIcon } from "@/app/icons";
import { prepareImageForUpload } from "@/lib/image-for-upload";

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
  defaultOpen = false,
  savedHref,
}: {
  patientId: string;
  /** Once a case history exists, this becomes "add an addendum" rather than the first prompt —
   *  no reason to re-explain what it is, or offer to skip something already done. */
  hasExisting?: boolean;
  /** Start expanded. Used by the dedicated clerking screen a new patient lands on, where the
   *  whole point of the page is this control. */
  defaultOpen?: boolean;
  /** Where to go once something has been saved. On the patient page this is unset — it just
   *  refreshes in place; on the clerking screen it carries the resident on to the patient. */
  savedHref?: string;
}) {
  const router = useRouter();
  const cameraInputRef = useRef<HTMLInputElement | null>(null);
  const uploadInputRef = useRef<HTMLInputElement | null>(null);
  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [showPhotoChoices, setShowPhotoChoices] = useState(false);
  const detailsRef = useRef<HTMLDetailsElement | null>(null);

  useEffect(() => {
    if (defaultOpen && detailsRef.current) detailsRef.current.open = true;
  }, [defaultOpen]);

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
      if (savedHref) {
        router.push(savedHref);
        return;
      }
      router.refresh();
    } catch {
      setStatus("idle");
      setMessage("No connection. Nothing was saved.");
    }
  }

  async function uploadPhoto(file: File) {
    // A library image can be HEIC or too large for the request. The camera and library paths
    // meet here so they receive the same conversion and the server always sees a supported file.
    const photo = await prepareImageForUpload(file);
    const form = new FormData();
    form.append("patient_id", patientId);
    form.append("photo", photo);
    void submit(form);
  }

  async function startRecording() {
    if (status !== "idle") return;
    setStatus("starting");
    setMessage(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Safari/iOS records mp4, Chrome/Android webm — the transcriber picks its decoder from
      // the file extension, so carry the real type through rather than assuming webm.
      const mimeType = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/mpeg"].find(
        (t) => MediaRecorder.isTypeSupported(t)
      );
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        const type = recorder.mimeType || mimeType || "audio/webm";
        const ext = type.includes("mp4") ? "m4a" : type.includes("mpeg") ? "mp3" : "webm";
        const blob = new Blob(chunksRef.current, { type });
        const form = new FormData();
        form.append("patient_id", patientId);
        form.append("audio", blob, `case-history.${ext}`);
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

  return (
    <details
      ref={detailsRef}
      className="mt-2 border-t border-line [&[open]_.add-chev]:rotate-90"
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-[15px] font-semibold active:bg-chip [&::-webkit-details-marker]:hidden">
        <span>{hasExisting ? "Add to case history" : "Add case history"}</span>
        <span className="add-chev text-xl font-normal text-muted transition-transform">›</span>
      </summary>

      <div className="border-t border-line px-4 pb-4 pt-3">
        <p className="text-[13px] leading-relaxed text-muted">
          {hasExisting
            ? "Add a further page or dictate an addendum."
            : "Photograph, upload, or dictate the case sheet."}
        </p>

      <div className="mt-3 grid grid-cols-2 gap-2.5">
        <button
          type="button"
          onClick={status === "recording" ? stopRecording : startRecording}
          disabled={status === "working" || status === "starting"}
          className={
            "flex items-center justify-center gap-1.5 rounded-[10px] px-3 py-3 text-[15px] font-medium disabled:opacity-50 " +
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
                : "Speak"}
        </button>

        <button
          type="button"
          onClick={() => setShowPhotoChoices((shown) => !shown)}
          disabled={status !== "idle"}
          aria-expanded={showPhotoChoices}
          className="flex items-center justify-center gap-1.5 rounded-[10px] border border-line bg-card px-3 py-3 text-[15px] font-medium disabled:opacity-50"
        >
          <ImageIcon className="h-[18px] w-[18px]" />
          Add photo
        </button>

        {showPhotoChoices && (
          <div className="col-span-2 grid grid-cols-2 gap-2.5 rounded-[10px] bg-chip/50 p-2.5">
            <button
              type="button"
              onClick={() => cameraInputRef.current?.click()}
              disabled={status !== "idle"}
              className="rounded-lg bg-card px-3 py-2.5 text-[14px] font-medium disabled:opacity-50"
            >
              Take picture
            </button>
            <button
              type="button"
              onClick={() => uploadInputRef.current?.click()}
              disabled={status !== "idle"}
              className="rounded-lg bg-card px-3 py-2.5 text-[14px] font-medium disabled:opacity-50"
            >
              Upload photo
            </button>
          </div>
        )}

        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void uploadPhoto(file);
            e.target.value = "";
          }}
        />

        <input
          ref={uploadInputRef}
          type="file"
          // No capture attribute: on a phone this opens the system chooser, including the
          // photo library, while the Photograph button above deliberately opens the camera.
          accept="image/*,image/heic,image/heif"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void uploadPhoto(file);
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
          onClick={() => {
            if (detailsRef.current) detailsRef.current.open = false;
          }}
          className="mt-3 text-[13px] text-muted underline underline-offset-4"
        >
          Add later
        </button>
      )}
      </div>
    </details>
  );
}
