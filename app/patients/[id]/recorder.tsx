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
import { useLiveWords } from "@/lib/stt/use-live-words";
import RecordingSheet, { CoverChips, HeardBox } from "@/app/recording-sheet";
import { extFor, REC_MIME } from "./card-kit";

type Status = "idle" | "starting" | "recording" | "finishing" | "working";
/** Live: each pause is filed as it is said. Batch: one recording, sent on Done. */
type Mode = "live" | "batch" | null;

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
 * Speak at the bedside. A tap opens the recording sheet (app/recording-sheet.tsx — the same one
 * the unit round uses) with the patient's name, what is still to cover, and the words as they
 * are heard.
 *
 * Tap to start and Done to finish, not hold-to-talk: starting needs `getUserMedia`, which on
 * iPhone opens a permission prompt and takes real time — a finger lifted before the recorder
 * existed left it recording for good.
 *
 * LIVE first: at each pause the thought is filed through /api/entries/text — the same
 * extractor, verbatim-quote check and amber rules as a recording — so it is saved while the
 * resident is still talking, the findings appear under the words, and the "Still to cover"
 * chips tick off. Nothing said at a bedside may be lost, which is why there is no Discard once
 * a pause has been filed.
 *
 * With no signal for live words (offline, or the socket drops) the same microphone carries on
 * as one recording, kept on the phone a second at a time and sent on Done — the
 * record-then-upload path, transcript and findings shown in the bar afterwards.
 */
/** The unit's dictation wording, read from its progress-note config on the server so the whole
 *  config table stays out of the patient page bundle. */
export type DictationCopy = {
  /** The Type box's placeholder. */
  bedsideExample: string;
  /** The example shown on the sheet before anything is heard. */
  dictationExample: string;
};

export default function Recorder({
  patientId,
  who,
  toCover,
  onBusyChange,
  idleActions,
  copy,
}: {
  patientId: string;
  /** Whose bed, for the sheet's title. */
  who: { bed: string | null; name: string; line?: string };
  /** What is still to cover today — re-read from the server after each filed pause. */
  toCover: string[];
  copy: DictationCopy;
  onBusyChange?: (busy: boolean) => void;
  /** Sits in the same row as the mic while nothing is recording — the bar's other controls. */
  idleActions?: React.ReactNode;
}) {
  const router = useRouter();
  const [status, setStatus] = useState<Status>("idle");
  const [mode, setMode] = useState<Mode>(null);
  const [seconds, setSeconds] = useState(0);
  const [stream, setStream] = useState<MediaStream | null>(null);
  /** The list as it stood when the sheet opened; an item gone from `toCover` since is ticked. */
  const [coverAtOpen, setCoverAtOpen] = useState<string[]>([]);
  const filedRef = useRef(0);
  const [message, setMessage] = useState<string | null>(null);
  const [transcript, setTranscript] = useState<string | null>(null);
  const [findings, setFindings] = useState<Finding[]>([]);
  /** Live words whose save failed — kept so they can be retried without re-dictating. */
  const [unsaved, setUnsaved] = useState<string | null>(null);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const autoStoppedRef = useRef(false);
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

  const sheetOpen = status === "starting" || status === "recording" || status === "finishing";
  useEffect(() => {
    onBusyChange?.(sheetOpen);
  }, [sheetOpen, onBusyChange]);

  const live = useLiveWords(mode === "live" ? stream : null, {
    patientId,
    onPause: fileFragment,
    // No live words on this signal: the same microphone carries on as one recording.
    onUnavailable: () => {
      if (streamRef.current && statusRef.current === "recording") startBatch(streamRef.current);
    },
  });

  // Live words are only heard once the socket is open; until then the sheet says "Starting…".
  const listening = status === "recording" && !(mode === "live" && live.state !== "live");

  // Nothing is holding a finger down, so the running count is the sign it is still listening.
  useEffect(() => {
    if (!listening) return;
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [listening]);

  useEffect(() => {
    if (status === "recording" && seconds >= MAX_SECONDS) {
      autoStoppedRef.current = true;
      void done();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seconds, status]);

  // Phone locked / swiped away / killed mid-dictation: write what the batch recorder has to
  // IndexedDB now, before the tab can be frozen. A later clean stop re-saves the fuller take
  // under the same id, so this never doubles it. Live words need none of this — they are filed
  // at every pause.
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
      releaseMic();
    };
  }, [salvage]);

  function releaseMic() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setStream(null);
  }

  async function start() {
    // Guards the window where getUserMedia has not resolved yet — a second tap must do nothing.
    if (status !== "idle") return;
    setStatus("starting");
    setMode(null);
    setMessage(null);
    setTranscript(null);
    setFindings([]);
    filedRef.current = 0;
    setSeconds(0);
    setCoverAtOpen(toCover);
    autoStoppedRef.current = false;
    recIdRef.current = crypto.randomUUID();
    seqRef.current = 0;

    let mic: MediaStream;
    try {
      mic = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
      });
    } catch {
      setStatus("idle");
      setMessage("Microphone permission was refused. Allow it in your phone's settings.");
      return;
    }
    streamRef.current = mic;
    setStream(mic);
    setStatus("recording");
    navigator.vibrate?.(30);
    if (navigator.onLine) setMode("live");
    else startBatch(mic);
  }

  /** One pause of live words, filed exactly as a typed note is. Words that could not be sent
   *  are held for "Save these words" — at a bedside nothing said may be lost. */
  async function fileFragment(text: string) {
    try {
      const res = await fetch("/api/entries/text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patient_id: patientId, text }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status >= 500) keepUnsaved(text);
        else setMessage(data.error ?? "Could not file that.");
        return;
      }
      const found = normaliseFindings(data.observations);
      if (found.length > 0) {
        filedRef.current += found.length;
        setFindings((f) => [...f, ...found]);
        // Re-reads what is still to cover, so the chips on the sheet tick off.
        router.refresh();
      }
    } catch {
      keepUnsaved(text);
    }
  }

  function startBatch(mic: MediaStream) {
    try {
      // Safari on iPhone records mp4; Chrome records webm.
      const recorder = new MediaRecorder(mic, REC_MIME ? { mimeType: REC_MIME } : undefined);
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
          mimeType: recorder.mimeType || "audio/webm",
        });
      };
      recorder.onstop = () => void send(recorder.mimeType || "audio/webm");
      recorder.start(1000);
      recorderRef.current = recorder;
      setMode("batch");
      setStatus("recording");
    } catch {
      releaseMic();
      setMode(null);
      setStatus("idle");
      setMessage("This phone could not start recording. Type the note instead.");
    }
  }

  async function done() {
    if (statusRef.current !== "recording") return;
    navigator.vibrate?.(15);
    if (modeRef.current === "batch") {
      // Live words already heard before the switch were filed at their pauses.
      void live.finish();
      setStatus("working");
      if (recorderRef.current?.state === "recording") recorderRef.current.stop();
      else setStatus("idle");
      releaseMic();
      return;
    }
    setStatus("finishing");
    await live.finish();
    releaseMic();
    setMode(null);
    setStatus("idle");
    const n = filedRef.current;
    setMessage(
      n > 0
        ? `${n} finding${n === 1 ? "" : "s"} filed. Anything amber waits under To check.`
        : autoStoppedRef.current
          ? "Stopped at 3 minutes."
          : null
    );
    router.refresh();
  }

  /** Throw away a recording nothing has been filed from. */
  function discard() {
    const id = recIdRef.current;
    if (recorderRef.current) {
      recorderRef.current.ondataavailable = null;
      recorderRef.current.onstop = null;
      if (recorderRef.current.state === "recording") recorderRef.current.stop();
    }
    chunksRef.current = [];
    void dropRecording(id);
    void clearChunks(id);
    releaseMic();
    setMode(null);
    setStatus("idle");
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
        data.error ?? ((data.observations ?? []).length === 0 ? "Nothing clinical was found in that." : null)
      );
      router.refresh();
    } catch {
      // Unlike a blob, finished words have nowhere to queue (lib/outbox.ts holds audio only) —
      // but they are on screen, word for word, and held here for the retry button.
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
    setMode(null);

    if (blob.size < 1000) {
      setStatus("idle");
      setMessage("That was too short to hear anything.");
      void dropRecording(id);
      void clearChunks(id);
      return;
    }

    const form = new FormData();
    form.append("patient_id", patientId);
    form.append("audio", blob, `bedside.${extFor(mimeType)}`);
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
      setFindings((f) => [...f, ...normaliseFindings(data.observations)]);
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

  const heard = [...live.heard, live.current].join(" ").trim();
  const covered = new Set(coverAtOpen.filter((c) => !toCover.includes(c)));
  // Once live words have been heard (and so filed), there is nothing left to throw away.
  const canDiscard = mode === "batch" && live.heard.length === 0;

  return (
    <div className="flex flex-col gap-2">
      {sheetOpen && (
        <RecordingSheet
          // Done is held while starting, so nothing is said into a microphone nobody hears.
          status={status === "finishing" ? "finishing" : listening ? "recording" : "starting"}
          title={
            <>
              {who.bed && <span className="font-mono">{who.bed}</span>}
              {who.bed && " · "}
              {who.name}
            </>
          }
          subtitle={who.line}
          seconds={seconds}
          maxSeconds={MAX_SECONDS}
          stream={stream}
          note={
            mode === "batch"
              ? live.heard.length > 0
                ? "Live words stopped on this signal. The rest is recorded and saved when you tap Done."
                : "No live words on this signal. Recording; it is saved when you tap Done."
              : "Each pause is saved as you speak. Anything amber waits under To check."
          }
          onDiscard={canDiscard ? discard : undefined}
          onDone={() => void done()}
        >
          <CoverChips items={coverAtOpen} covered={covered} />
          <HeardBox>
            {heard ? (
              <p className="text-body leading-snug">{heard}</p>
            ) : (
              <p className="text-subhead text-muted">
                {mode === "batch" ? "The words appear once you tap Done." : `e.g. “${copy.dictationExample}”`}
              </p>
            )}
            {findings.length > 0 && <FindingList findings={findings} />}
          </HeardBox>
        </RecordingSheet>
      )}

      {/* At rest, one compact row — a round mic beside its label, with the bar's other controls
          after it. Recording happens on the sheet; the bar only says when it is transcribing. */}
      {status === "working" ? (
        <div role="status" className="btn flex w-full items-center justify-center gap-2 bg-chip text-muted">
          <Mark className="h-5 w-5" spinning />
          Transcribing…
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={start}
            disabled={status !== "idle"}
            className="flex min-h-12 min-w-0 flex-1 items-center gap-3 text-left active:opacity-70"
          >
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full border border-line bg-card text-accent shadow-sm">
              <MicIcon className="h-6 w-6" />
            </span>
            <span className="truncate text-body font-medium">Speak at the bedside</span>
          </button>
          {idleActions}
        </div>
      )}

      {!sheetOpen && transcript && (
        <div className="rounded-lg bg-chip/60 px-3 py-2 text-footnote leading-relaxed text-muted">
          {findings.length > 0 ? highlight(transcript, findings.map((f) => f.source_quote)) : <>“{transcript}”</>}
        </div>
      )}

      {!sheetOpen && findings.length > 0 && <FindingList findings={findings} />}

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

/** What was filed, one line each — amber for anything waiting to be checked. */
function FindingList({ findings }: { findings: Finding[] }) {
  return (
    <ul className="flex flex-col gap-1">
      {findings.map((f, i) => (
        <li key={`${f.label}-${i}`} className="wm-pop flex items-baseline gap-2 text-footnote" style={{ animationDelay: `${i * 80}ms` }}>
          <span aria-hidden className={"mt-1 h-1.5 w-1.5 shrink-0 rounded-full " + (f.needs_confirmation ? "bg-warn-dot" : "bg-good-dot")} />
          <span className="text-muted">{f.label}</span>
          <span className="font-medium">{f.value_text}</span>
          {f.needs_confirmation && <span className="text-caption2 font-medium text-warn-fg">check</span>}
        </li>
      ))}
    </ul>
  );
}

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
