"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Mark from "@/app/mark";
import { ImageIcon, MicIcon, StopIcon } from "@/app/icons";
import { prepareImageForUpload } from "@/lib/image-for-upload";
import {
  clearChunks,
  clearInFlight,
  dropRecording,
  markInFlight,
  putChunk,
  saveRecording,
} from "@/lib/outbox";

type Status = "idle" | "starting" | "recording" | "working";

/**
 * What a full clerking covers, in the order it is taken. Shown next to the mic in the "speak"
 * variant so the resident can dictate straight down the list and see at a glance what is still
 * to say. Mirrors the card walk in case-history-workspace so a spoken note sorts cleanly.
 */
const CLERKING_FORMAT: { title: string; hint: string }[] = [
  { title: "Chief complaints", hint: "each problem and how long it has been there — worst first" },
  {
    title: "History of present illness",
    hint: "for each complaint: onset, duration, progression, character, what makes it better or worse, associated symptoms",
  },
  { title: "Past history", hint: "diabetes, hypertension, TB, asthma, heart disease, similar episodes before" },
  { title: "Family history", hint: "relevant illnesses running in the family" },
  { title: "Medication history", hint: "current medicines and doses, any drug allergy" },
  { title: "Surgical history", hint: "previous operations, any anaesthetic trouble" },
  { title: "Menstrual & obstetric history", hint: "if applicable — last period, cycle, pregnancies and deliveries" },
  { title: "Personal history", hint: "diet, appetite, bowel and bladder, sleep, smoking, alcohol" },
  {
    title: "General examination",
    hint: "build and nutrition, pallor, icterus, cyanosis, clubbing, lymph nodes, oedema",
  },
  { title: "Vitals", hint: "pulse, blood pressure, temperature, respiratory rate, SpO₂" },
  { title: "Per abdomen", hint: "inspection, palpation, percussion, auscultation" },
  { title: "Other systems", hint: "chest, cardiovascular, neurological — whatever is relevant" },
  { title: "Local examination", hint: "the lump, wound or affected part in detail" },
  { title: "Provisional diagnosis", hint: "what you think this is" },
  { title: "Plan", hint: "investigations, treatment, consent, referrals" },
];

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
  variant = "menu",
}: {
  patientId: string;
  /** "menu" — the collapsible photo/dictate control used on the patient page.
   *  "speak" — a dedicated dictation panel: the clerking format checklist beside one big
   *  Speak button, no photo option, no collapsing. Used on the new-clerking screen. */
  variant?: "menu" | "speak";
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
  const recIdRef = useRef<string>("");
  const recMimeRef = useRef<string>("audio/webm");
  const seqRef = useRef(0);
  const recordingRef = useRef(false);

  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [showPhotoChoices, setShowPhotoChoices] = useState(false);
  const detailsRef = useRef<HTMLDetailsElement | null>(null);

  useEffect(() => {
    if (defaultOpen && detailsRef.current) detailsRef.current.open = true;
  }, [defaultOpen]);

  /** Returns how it went, so a dictation caller knows whether to keep its phone copy for the
   *  queue ("kept") or let it go ("done"). The photo caller ignores the return. */
  async function submit(body: FormData, savedLocally = false): Promise<"done" | "kept"> {
    setStatus("working");
    setMessage(null);
    try {
      const res = await fetch("/api/entries/case-history", { method: "POST", body });
      const data = await res.json();
      setStatus("idle");

      if (!res.ok) {
        // 5xx / AI outage is worth retrying from the queue; a 4xx rejection is not.
        if (res.status >= 500 && savedLocally) {
          setMessage(data.error ?? "Saved on this phone — the server could not take it. It will retry.");
          return "kept";
        }
        setMessage(data.error ?? "Could not save the case history.");
        return "done";
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
        return "done";
      }
      router.refresh();
      return "done";
    } catch {
      setStatus("idle");
      setMessage(
        savedLocally
          ? "Saved on this phone — no signal. It will be sent when you are back online."
          : "No connection. Nothing was saved."
      );
      return savedLocally ? "kept" : "done";
    }
  }

  async function uploadPhoto(file: File) {
    // A library image can be HEIC or too large for the request. The camera and library paths
    // meet here so they receive the same conversion and the server always sees a supported file.
    const photo = await prepareImageForUpload(file);
    const form = new FormData();
    form.append("patient_id", patientId);
    form.append("photo", photo);
    // So a retried photo upload is not read and stored twice.
    form.append("client_uuid", crypto.randomUUID());
    void submit(form);
  }

  async function finishRecording(type: string) {
    recordingRef.current = false;
    const ext = type.includes("mp4") ? "m4a" : type.includes("mpeg") ? "mp3" : "webm";
    const blob = new Blob(chunksRef.current, { type });
    chunksRef.current = [];
    const id = recIdRef.current;

    if (blob.size < 1200) {
      setStatus("idle");
      setMessage("Nothing was recorded — hold on a moment longer before stopping.");
      void dropRecording(id);
      return;
    }

    // On the phone before the upload, so a lock or a lost signal cannot take the clerking with
    // it. Dropped once the server has it; left for the queue if not.
    await saveRecording(id, {
      kind: "case-history",
      url: "/api/entries/case-history",
      patientId,
      label: "Case history",
      audio: blob,
      mimeType: type,
    });
    window.dispatchEvent(new Event("outbox-changed"));

    const form = new FormData();
    form.append("patient_id", patientId);
    form.append("audio", blob, `case-history.${ext}`);
    form.append("client_uuid", id);
    markInFlight(id);
    try {
      const outcome = await submit(form, true);
      if (outcome === "done") {
        void dropRecording(id);
        void clearChunks(id);
      }
    } finally {
      clearInFlight(id);
    }
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
      recIdRef.current = crypto.randomUUID();
      recMimeRef.current = recorder.mimeType || mimeType || "audio/webm";
      seqRef.current = 0;
      recordingRef.current = true;
      const recId = recIdRef.current;
      recorder.ondataavailable = (e) => {
        if (e.data.size === 0) return;
        chunksRef.current.push(e.data);
        void putChunk(recId, seqRef.current++, e.data, {
          kind: "case-history",
          url: "/api/entries/case-history",
          patientId,
          label: "Case history",
          mimeType: recMimeRef.current,
        });
      };
      recorder.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        void finishRecording(recorder.mimeType || mimeType || "audio/webm");
      };
      mediaRef.current = recorder;
      // Timeslice: a chunk a second, so an interruption before a clean stop costs a second.
      recorder.start(1000);
      setStatus("recording");
    } catch {
      setStatus("idle");
      setMessage("Could not reach the microphone.");
    }
  }

  function stopRecording() {
    mediaRef.current?.stop();
  }

  // Phone locked, app swiped away, or component unmounted mid-dictation: keep what was said.
  const salvage = useCallback(() => {
    if (!recordingRef.current) return;
    const chunks = chunksRef.current;
    if (chunks.length) {
      const blob = new Blob(chunks, { type: recMimeRef.current });
      if (blob.size > 800) {
        void saveRecording(recIdRef.current, {
          kind: "case-history",
          url: "/api/entries/case-history",
          patientId,
          label: "Case history",
          audio: blob,
          mimeType: recMimeRef.current,
        });
      }
    }
    try {
      mediaRef.current?.requestData?.();
      if (mediaRef.current?.state === "recording") mediaRef.current.stop();
    } catch {
      // Already stopped, or the page is going faster than this can run.
    }
  }, [patientId]);

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

  if (variant === "speak") {
    const recording = status === "recording";
    return (
      <div className="mt-2">
        <p className="px-1 text-[13px] leading-relaxed text-muted">
          Speak the clerking straight down this list — in your own words, in any order. Each part
          is transcribed and sorted into its card for you to check. Nothing here is compulsory;
          say what applies.
        </p>

        <ol className="ios-group mt-3 divide-y divide-line">
          {CLERKING_FORMAT.map((s, i) => (
            <li key={s.title} className="flex gap-3 px-4 py-2.5">
              <span className="text-[13px] font-semibold tabular-nums text-muted">{i + 1}</span>
              <span>
                <span className="text-[15px] font-semibold">{s.title}</span>
                <span className="mt-0.5 block text-[13px] leading-relaxed text-muted">{s.hint}</span>
              </span>
            </li>
          ))}
        </ol>

        <button
          type="button"
          onClick={recording ? stopRecording : startRecording}
          disabled={status === "working" || status === "starting"}
          className={
            "mt-3 flex w-full items-center justify-center gap-2 rounded-[12px] px-4 py-3.5 text-[16px] font-semibold disabled:opacity-50 " +
            (recording ? "bg-red-500 text-white" : "bg-accent text-accent-ink")
          }
        >
          {recording ? (
            <StopIcon className="h-5 w-5 shrink-0" />
          ) : status === "working" ? (
            <Mark className="h-5 w-5 shrink-0" spinning />
          ) : (
            <MicIcon className="h-5 w-5 shrink-0" />
          )}
          {recording
            ? "Stop and save"
            : status === "starting"
              ? "Starting…"
              : status === "working"
                ? "Working…"
                : "Speak the clerking"}
        </button>

        {recording && (
          <p className="mt-2 text-center text-[13px] text-red-500">
            Recording — scroll the list as you go. Tap stop when done.
          </p>
        )}
        {message && <p className="mt-3 text-[13px] text-muted">{message}</p>}
      </div>
    );
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
