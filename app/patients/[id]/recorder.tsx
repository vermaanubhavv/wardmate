"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { MicIcon } from "@/app/icons";
import Mark from "@/app/mark";
import { useRouter } from "next/navigation";
import {
  clearChunks,
  clearInFlight,
  dropRecording,
  markInFlight,
  putChunk,
  saveRecording,
} from "@/lib/outbox";
import LiveDictation, { type LiveLine, type LiveSection } from "./live-dictation";

type Status = "idle" | "starting" | "recording" | "working";
type Mode = "batch" | null;

type Finding = {
  kind: string;
  label: string;
  value_text: string;
  source_quote: string;
  needs_confirmation: boolean;
};

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
 *
 * Every tap tries LIVE dictation first: the shared panel (./live-dictation.tsx) streams the
 * words as they are said, and at each pause files that thought through /api/entries/text — the
 * same extractor, verbatim-quote check and amber rules as a recording — so each finding drops
 * into its table (vitals, examination, plan…) while the resident is still talking. If live
 * cannot start (offline, not configured) it falls back to the original record-then-upload path
 * silently. After a recording, the transcript is shown with every captured phrase highlighted
 * and the findings drop in one by one.
 */
export default function Recorder({
  patientId,
  onBusyChange,
  idleActions,
}: {
  patientId: string;
  onBusyChange?: (busy: boolean) => void;
  /** Sits in the same row as the mic while nothing is recording — the bar's other controls. */
  idleActions?: React.ReactNode;
}) {
  const router = useRouter();
  const [status, setStatus] = useState<Status>("idle");
  const [mode, setMode] = useState<Mode>(null);
  const [seconds, setSeconds] = useState(0);
  const [level, setLevel] = useState(0);
  const [live, setLive] = useState(false);
  const filedRef = useRef(0);
  const [message, setMessage] = useState<string | null>(null);
  const [transcript, setTranscript] = useState<string | null>(null);
  const [findings, setFindings] = useState<Finding[]>([]);
  /** A live transcript whose save failed — kept so it can be retried without re-dictating. */
  const [unsaved, setUnsaved] = useState<string | null>(null);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const autoStoppedRef = useRef(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const rafRef = useRef<number | null>(null);
  // One id per recording, used as the IndexedDB key, the per-chunk key, and the server's
  // dedup `client_uuid` — so a salvage, a clean save and a queue retry are all the same row.
  const recIdRef = useRef<string>("");
  const seqRef = useRef(0);
  const modeRef = useRef<Mode>(null);
  const statusRef = useRef<Status>(status);
  useEffect(() => {
    statusRef.current = status;
  }, [status]);
  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  useEffect(() => {
    onBusyChange?.(live || status === "recording" || status === "starting");
  }, [live, status, onBusyChange]);

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

  // Phone locked / swiped away / killed mid-dictation: write what the batch recorder has to
  // IndexedDB now, before the tab can be frozen. A later clean stop re-saves the fuller take
  // under the same id, so this never doubles it. The live path needs none of this — its words
  // are filed at every pause.
  const salvage = useCallback(() => {
    if (modeRef.current !== "batch") return;
    if (statusRef.current !== "recording" && statusRef.current !== "working") return;
    const chunks = chunksRef.current;
    const mime = recorderRef.current?.mimeType || "audio/webm";
    if (chunks.length) {
      const blob = new Blob(chunks, { type: mime });
      if (blob.size > 800) {
        void saveRecording(recIdRef.current, {
          kind: "bedside",
          url: "/api/entries/voice",
          patientId,
          label: "Bedside note",
          audio: blob,
          mimeType: mime,
        });
      }
    }
    try {
      recorderRef.current?.requestData?.();
      if (recorderRef.current?.state === "recording") recorderRef.current.stop();
    } catch {
      // Already stopped, or the page is going faster than this can run.
    }
  }, [patientId]);

  // Tear everything down if the component goes away mid-recording — and salvage first.
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
      stopMeter();
    };
  }, [salvage]);

  function startMeter(stream: MediaStream) {
    try {
      const Ctx =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctx) return;
      const ctx = new Ctx();
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 32;
      ctx.createMediaStreamSource(stream).connect(analyser);
      audioCtxRef.current = ctx;
      const buf = new Uint8Array(analyser.frequencyBinCount);
      const tick = () => {
        analyser.getByteTimeDomainData(buf);
        let sum = 0;
        for (let i = 0; i < buf.length; i++) {
          const v = (buf[i] - 128) / 128;
          sum += v * v;
        }
        setLevel(Math.min(1, Math.sqrt(sum / buf.length) * 3.2));
        rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
    } catch {
      // The meter is decoration — a browser that will not open an AudioContext still records.
    }
  }

  function stopMeter() {
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    audioCtxRef.current?.close().catch(() => {});
    audioCtxRef.current = null;
    setLevel(0);
  }

  async function start() {
    // Guards the window where getUserMedia has not resolved yet — the exact race that broke
    // the previous version. A second tap here must do nothing at all.
    if (status !== "idle") return;
    setStatus("starting");
    setMessage(null);
    setTranscript(null);
    setFindings([]);
    setSeconds(0);
    autoStoppedRef.current = false;
    recIdRef.current = crypto.randomUUID();
    seqRef.current = 0;

    if (!navigator.onLine) return void startBatch();
    filedRef.current = 0;
    setStatus("idle");
    setLive(true);
  }

  const LIVE_SECTIONS: LiveSection[] = [
    { key: "history", label: "Complaints & history" },
    { key: "vital", label: "Vitals" },
    { key: "exam", label: "Examination" },
    { key: "drain", label: "Drains & intake/output" },
    { key: "dx", label: "Diagnosis & procedure" },
    { key: "medication", label: "Medications", drug: true },
    { key: "lab", label: "Investigations" },
    { key: "plan", label: "Plan & to-do" },
  ];

  /** One pause of live dictation, filed exactly as a typed note is. Words that could not be
   *  sent are held for "Save these words" — at a bedside nothing said may be lost. */
  async function fileFragment(text: string): Promise<{ lines: LiveLine[]; error?: string }> {
    try {
      const res = await fetch("/api/entries/text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patient_id: patientId, text }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status >= 500) keepUnsaved(text);
        return { lines: [], error: data.error ?? "Could not file that." };
      }
      const found = normaliseFindings(data.observations);
      filedRef.current += found.length;
      return {
        lines: found.map((f) => ({
          section: SECTION_OF_KIND[f.kind] ?? "history",
          text: `${f.label}: ${f.value_text}`,
          check: f.needs_confirmation,
        })),
        error: data.error ?? (found.length === 0 ? `Nothing clinical in “${text}”.` : undefined),
      };
    } catch {
      keepUnsaved(text);
      return { lines: [], error: `No signal — “${text}” is kept to save after you stop.` };
    }
  }

  async function startBatch() {
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
      const recId = recIdRef.current;
      recorder.ondataavailable = (e) => {
        if (e.data.size === 0) return;
        chunksRef.current.push(e.data);
        // Every second lands in IndexedDB as it is recorded, so a freeze or kill before a
        // clean stop costs at most the last second — recoverInterruptedChunks() reassembles
        // the rest on the next app open.
        void putChunk(recId, seqRef.current++, e.data, {
          kind: "bedside",
          url: "/api/entries/voice",
          patientId,
          label: "Bedside note",
          mimeType: recorder.mimeType || mimeType || "audio/webm",
        });
      };
      recorder.onstop = () => void send(recorder.mimeType);

      recorder.start(1000);
      recorderRef.current = recorder;
      setMode("batch");
      setStatus("recording");
      startMeter(stream);
      navigator.vibrate?.(30);
    } catch {
      setStatus("idle");
      setMode(null);
      setMessage("Microphone permission was refused. Allow it in your phone's settings.");
    }
  }

  function stop() {
    stopMeter();
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

  /** "Save these words": files words a live pause could not send — the same transcript, so
   *  nothing has to be said twice. */
  async function saveWords(text: string) {
    try {
      const res = await fetch("/api/entries/text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patient_id: patientId, text }),
      });
      const data = await res.json();
      setStatus("idle");

      if (!res.ok) {
        // A 5xx is the server, not the words — worth another go. A 4xx will fail the same way.
        if (res.status >= 500) keepUnsaved(text);
        setMessage(data.error ?? "Something went wrong.");
        return;
      }

      setUnsaved((u) => (u === text ? null : u));
      setFindings(normaliseFindings(data.observations));
      setMessage(
        data.error ??
          ((data.observations ?? []).length === 0 ? "Nothing clinical was found in that." : null) ??
          (autoStoppedRef.current ? "Stopped at 3 minutes." : null)
      );
      router.refresh();
    } catch {
      // Unlike a blob, finished words have nowhere to queue (lib/outbox.ts holds audio only) —
      // but they are already on screen, word for word, and held here for the retry button.
      setStatus("idle");
      keepUnsaved(text);
      setMessage("No signal to save that. The words are shown above — not saved yet.");
    }
  }

  /** Holds failed words for the retry. A second failure before the first is retried is added
   *  on rather than replacing it — both were said about this patient, and neither is refiled. */
  function keepUnsaved(text: string) {
    setUnsaved((u) => (u && u !== text && !u.endsWith(text) ? joinSpoken(u, text) : u ?? text));
  }

  function retrySave() {
    if (!unsaved) return;
    setStatus("working");
    setMessage(null);
    void saveWords(unsaved);
  }

  async function send(mimeType: string) {
    const blob = new Blob(chunksRef.current, { type: mimeType });
    chunksRef.current = [];
    const id = recIdRef.current;

    if (blob.size < 1000) {
      setStatus("idle");
      setMessage("That was too short to hear anything.");
      void dropRecording(id);
      void clearChunks(id);
      return;
    }

    const ext = mimeType.includes("mp4") ? "m4a" : mimeType.includes("mpeg") ? "mp3" : "webm";
    const form = new FormData();
    form.append("patient_id", patientId);
    form.append("audio", blob, `bedside.${ext}`);
    form.append("client_uuid", id);

    // On the phone before anything that can fail or be frozen. What was said at a bedside is
    // the one thing that cannot be reconstructed later. Dropped again once the server has it;
    // left to retry through the queue if it does not. The server dedups on client_uuid, so a
    // queue retry of a recording that did land cannot create a second observation.
    try {
      await saveRecording(id, {
        kind: "bedside",
        url: "/api/entries/voice",
        patientId,
        label: "Bedside note",
        audio: blob,
        mimeType,
      });
      window.dispatchEvent(new Event("outbox-changed"));
    } catch {
      setStatus("idle");
      setMessage("No signal, and this phone would not store it. Do not close the app.");
      return;
    }

    if (!navigator.onLine) {
      setStatus("idle");
      setMessage("No signal — saved on this phone. It will be sent when you are back online.");
      return;
    }

    markInFlight(id);
    try {
      const res = await fetch("/api/entries/voice", { method: "POST", body: form });
      const data = await res.json();
      setStatus("idle");
      setTranscript(data.transcript || null);

      if (!res.ok) {
        if (res.status >= 500) {
          setMessage(data.error ?? "Saved on this phone — the server could not take it. It will retry.");
        } else {
          void dropRecording(id);
          void clearChunks(id);
          setMessage(data.error ?? "Something went wrong.");
        }
        return;
      }

      void dropRecording(id);
      void clearChunks(id);
      window.dispatchEvent(new Event("outbox-changed"));
      setFindings(normaliseFindings(data.observations));
      setMessage(
        data.error ??
          ((data.observations ?? []).length === 0 ? "Nothing clinical was found in that." : null) ??
          (autoStoppedRef.current ? "Stopped at 3 minutes." : null)
      );
      router.refresh();
    } catch {
      // The signal went mid-upload. The recording is already on the phone, so it just waits
      // for the queue.
      setStatus("idle");
      setMessage("No signal — saved on this phone. It will be sent when you are back online.");
    } finally {
      clearInFlight(id);
    }
  }

  const recording = status === "recording";
  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");

  return (
    <div className="flex flex-col gap-2">
      {live && (
        <LiveDictation
          patientId={patientId}
          title="Speaking at the bedside"
          example="e.g. “no fresh complaints… BP 120 by 80, pulse 84… abdomen soft… drain 50 ml serous… start oral sips…”"
          sections={LIVE_SECTIONS}
          route={fileFragment}
          onUnavailable={(reason) => {
            setLive(false);
            setMessage(`Live words unavailable (${reason}) — recording; the transcript appears when you stop.`);
            void startBatch();
          }}
          onClose={() => {
            setLive(false);
            const n = filedRef.current;
            setMessage(n > 0 ? `${n} finding${n === 1 ? "" : "s"} filed — anything amber is waiting under Confirm dictation.` : null);
            router.refresh();
          }}
        />
      )}
      <span className="sr-only" role="status">
        {status === "recording" ? "Recording" : status === "working" ? "Transcribing" : ""}
      </span>
      {/* At rest, one compact row — a round mic beside its label, with the bar's other controls
          after it — so the bar does not sit a second full-width teal button under the page's
          own "Make Today's Note". Once tapped, the full-width button below takes over: stopping
          is the one thing that matters then, and it should be impossible to miss. */}
      {status === "idle" ? (
        <div className="flex items-center gap-2">
          <button type="button" onClick={start} className="flex min-h-12 min-w-0 flex-1 items-center gap-3 text-left active:opacity-70">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full border border-line bg-card text-accent shadow-sm">
              <MicIcon className="h-6 w-6" />
            </span>
            <span className="truncate text-body font-medium">Speak at the bedside</span>
          </button>
          {idleActions}
        </div>
      ) : (
      <button
        type="button"
        onClick={stop}
        disabled={!recording}
        className={"btn w-full transition-colors " + (recording ? "bg-recording text-white" : "bg-chip text-muted")}
      >
        {recording ? (
          <span className="flex items-center justify-center gap-3">
            <LevelMeter level={level} />
            Tap to stop
            <span className="font-mono text-body tabular-nums opacity-90">
              {mm}:{ss}
            </span>
          </span>
        ) : status === "starting" ? (
          "Starting…"
        ) : status === "working" ? (
          <span className="flex items-center justify-center gap-2">
            <Mark className="h-5 w-5" spinning />
            Transcribing…
          </span>
        ) : null}
      </button>
      )}

      {transcript && (
        <div className="rounded-lg bg-chip/60 px-3 py-2 text-footnote leading-relaxed text-muted">
          {findings.length > 0 ? highlight(transcript, findings.map((f) => f.source_quote)) : <>“{transcript}”</>}
        </div>
      )}

      {findings.length > 0 && (
        <ul className="flex flex-col gap-1">
          {findings.map((f, i) => (
            <li
              key={`${f.label}-${i}`}
              className="wm-pop flex items-baseline gap-2 text-footnote"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <span aria-hidden className={"mt-1 h-1.5 w-1.5 shrink-0 rounded-full " + (f.needs_confirmation ? "bg-warn-dot" : "bg-good-dot")} />
              <span className="text-muted">{f.label}</span>
              <span className="font-medium">{f.value_text}</span>
              {f.needs_confirmation && <span className="text-caption2 font-medium text-warn-fg">check</span>}
            </li>
          ))}
        </ul>
      )}

      {unsaved && status === "idle" && (
        <div className="flex flex-col gap-2">
          {transcript !== unsaved && (
            <p className="rounded-lg bg-chip/60 px-3 py-2 text-footnote leading-relaxed text-muted">“{unsaved}”</p>
          )}
          <button type="button" onClick={retrySave} className="btn btn-secondary w-full text-accent">
            Save these words
          </button>
        </div>
      )}

      {message && <p role="status" className="text-center text-subhead text-muted">{message}</p>}
    </div>
  );
}

/** Which live table each extracted kind lands in. */
const SECTION_OF_KIND: Record<string, string> = {
  note: "history",
  vital: "vital",
  exam: "exam",
  drain: "drain",
  intake_output: "drain",
  diagnosis: "dx",
  day_number: "dx",
  planned_procedure: "dx",
  procedure_done: "dx",
  pac_status: "dx",
  medication: "medication",
  lab: "lab",
  plan: "plan",
};

function normaliseFindings(raw: unknown): Finding[] {
  return (Array.isArray(raw) ? raw : []).map(
    (o: Partial<Finding>): Finding => ({
      kind: o.kind ?? "note",
      label: o.label ?? "",
      value_text: o.value_text ?? "",
      source_quote: o.source_quote ?? "",
      needs_confirmation: Boolean(o.needs_confirmation),
    })
  );
}

/** Appends a newly-heard span onto what's already been said, without doubling the space
 *  Deepgram already puts at the start of most continuations. */
function joinSpoken(base: string, addition: string): string {
  const a = base.trim();
  const b = addition.trim();
  if (!a) return b;
  if (!b) return a;
  return `${a} ${b}`;
}

/** Four bars that rise with the mic level — the "it is hearing you" signal that a static dot
 *  was only pretending to be. Each bar reacts a little differently so it reads as sound, not a
 *  single slider. */
function LevelMeter({ level }: { level: number }) {
  const factors = [0.55, 1, 0.75, 0.4];
  return (
    <span className="flex items-end gap-[3px]" aria-hidden>
      {factors.map((f, i) => (
        <span
          key={i}
          className="w-[3px] rounded-full bg-white"
          style={{ height: `${6 + Math.min(1, level * f * 1.4) * 14}px`, transition: "height 0.08s linear" }}
        />
      ))}
    </span>
  );
}

/** The transcript with every phrase a finding was drawn from marked in it — so you can see at
 *  a glance what the app caught and, more usefully, what it walked past. Case-insensitive,
 *  first occurrence of each quote, overlaps merged. */
function highlight(text: string, quotes: string[]): React.ReactNode {
  const lower = text.toLowerCase();
  const spans = quotes
    .map((q) => q.trim())
    .filter(Boolean)
    .map((q) => {
      const at = lower.indexOf(q.toLowerCase());
      return at >= 0 ? { start: at, end: at + q.length } : null;
    })
    .filter((s): s is { start: number; end: number } => s !== null)
    .sort((a, b) => a.start - b.start);

  const merged: { start: number; end: number }[] = [];
  for (const s of spans) {
    const last = merged[merged.length - 1];
    if (last && s.start <= last.end) last.end = Math.max(last.end, s.end);
    else merged.push({ ...s });
  }
  if (merged.length === 0) return <>“{text}”</>;

  const out: React.ReactNode[] = [];
  let cursor = 0;
  merged.forEach((m, i) => {
    if (m.start > cursor) out.push(text.slice(cursor, m.start));
    out.push(
      <mark key={i} className="rounded-[3px] bg-accent/20 px-0.5 text-foreground">
        {text.slice(m.start, m.end)}
      </mark>
    );
    cursor = m.end;
  });
  if (cursor < text.length) out.push(text.slice(cursor));
  return <>{out}</>;
}
