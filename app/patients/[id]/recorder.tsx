"use client";

import { useEffect, useRef, useState } from "react";
import { MicIcon } from "@/app/icons";
import Mark from "@/app/mark";
import { useRouter } from "next/navigation";
import { enqueue } from "@/lib/outbox";
import { openLiveDictation, type LiveDictationSession } from "@/lib/stt/live";

type Status = "idle" | "starting" | "recording" | "working";
type Mode = "live" | "batch" | null;

type Finding = {
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
 * Every tap tries LIVE dictation first (lib/stt/live.ts — the same Nova-3 streaming socket the
 * case-history clerking flow uses): the words appear on screen as they're said. If the token
 * request fails (offline, not configured) it falls back to the original record-then-upload
 * path silently — nobody has to know or choose which one ran. Either way the moment the round
 * comes back, the transcript is shown with every captured phrase highlighted in it, and the
 * findings drop in one by one — so a bad recording, or a finding the app missed, is caught at
 * a glance while re-saying it is still cheap.
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
  const [mode, setMode] = useState<Mode>(null);
  const [seconds, setSeconds] = useState(0);
  const [level, setLevel] = useState(0);
  const [speaking, setSpeaking] = useState(false);
  const [liveText, setLiveText] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [transcript, setTranscript] = useState<string | null>(null);
  const [findings, setFindings] = useState<Finding[]>([]);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const autoStoppedRef = useRef(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const rafRef = useRef<number | null>(null);
  const liveSessionRef = useRef<LiveDictationSession | null>(null);
  const liveFinalRef = useRef("");

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

  // Tear everything down if the component goes away mid-recording.
  useEffect(
    () => () => {
      stopMeter();
      liveSessionRef.current?.stop();
    },
    []
  );

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
    setLiveText("");
    setSeconds(0);
    autoStoppedRef.current = false;
    liveFinalRef.current = "";

    if (await startLive()) return;
    await startBatch();
  }

  /** Try the live streaming path. Resolves false on anything short of a working socket, so the
   *  caller can fall back to record-then-upload without the resident seeing a failed attempt. */
  async function startLive(): Promise<boolean> {
    try {
      const res = await fetch("/api/transcribe/live-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patientId }),
      });
      const data = (await res.json()) as { token?: string; keyterms?: string[] };
      if (!res.ok || !data.token) return false;

      const session = await openLiveDictation({
        token: data.token,
        keyterms: data.keyterms ?? [],
        onOpen: () => {
          setMode("live");
          setStatus("recording");
          navigator.vibrate?.(30);
        },
        onSpeechStart: () => setSpeaking(true),
        onPartial: (t) => setLiveText(joinSpoken(liveFinalRef.current, t)),
        onFinal: (t) => {
          liveFinalRef.current = joinSpoken(liveFinalRef.current, t);
          setLiveText(liveFinalRef.current);
          setSpeaking(false);
        },
        onError: (msg) => {
          // The socket dropped mid-round. Whatever was caught before the drop is still worth
          // keeping — finish exactly as a normal stop would, just with a word about why.
          setMessage(msg);
          void finishLive();
        },
        onClose: () => {},
      });
      liveSessionRef.current = session;
      return true;
    } catch {
      return false;
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
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => void send(recorder.mimeType);

      recorder.start();
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
    if (mode === "live") {
      setStatus("working");
      navigator.vibrate?.(15);
      void finishLive();
      return;
    }

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

  /** The live socket's words, already transcribed, structured the same way a batch recording
   *  is — through /api/entries/text rather than /api/entries/voice, since there is no audio
   *  left to send, only the finished sentence. */
  async function finishLive() {
    liveSessionRef.current?.stop();
    liveSessionRef.current = null;
    setMode(null);
    setLiveText("");

    const text = liveFinalRef.current.trim();
    liveFinalRef.current = "";
    if (!text) {
      setStatus("idle");
      setMessage((m) => m ?? "That was too short to hear anything.");
      return;
    }

    setTranscript(text);
    try {
      const res = await fetch("/api/entries/text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patient_id: patientId, text }),
      });
      const data = await res.json();
      setStatus("idle");

      if (!res.ok) {
        setMessage(data.error ?? "Something went wrong.");
        return;
      }

      setFindings(normaliseFindings(data.observations));
      setMessage(
        data.error ??
          ((data.observations ?? []).length === 0 ? "Nothing clinical was found in that." : null) ??
          (autoStoppedRef.current ? "Stopped at 3 minutes." : null)
      );
      router.refresh();
    } catch {
      // Unlike a blob, finished words have nowhere to queue — but they are already on screen,
      // word for word, so nothing said is actually lost, only not yet filed.
      setStatus("idle");
      setMessage("No signal to save that. The words are shown above — try again once connected.");
    }
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

    // Offline before we even try: queue rather than spend half a minute failing.
    if (!navigator.onLine) return void queueIt(blob, mimeType);

    try {
      const res = await fetch("/api/entries/voice", { method: "POST", body: form });
      const data = await res.json();
      setStatus("idle");
      setTranscript(data.transcript || null);

      if (!res.ok) {
        setMessage(data.error ?? "Something went wrong.");
        return;
      }

      setFindings(normaliseFindings(data.observations));
      setMessage(
        data.error ??
          ((data.observations ?? []).length === 0 ? "Nothing clinical was found in that." : null) ??
          (autoStoppedRef.current ? "Stopped at 3 minutes." : null)
      );
      router.refresh();
    } catch {
      // The signal went mid-upload. What was said at a bedside is the one thing that cannot
      // be reconstructed later, so it goes to the phone rather than being lost.
      void queueIt(blob, mimeType);
    }
  }

  async function queueIt(blob: Blob, mimeType: string) {
    try {
      await enqueue({
        kind: "bedside",
        url: "/api/entries/voice",
        patientId,
        label: "Bedside note",
        audio: blob,
        mimeType,
      });
      window.dispatchEvent(new Event("outbox-changed"));
      setStatus("idle");
      setMessage("No signal — saved on this phone. It will be sent when you are back online.");
    } catch {
      setStatus("idle");
      setMessage("No signal, and this phone would not store it. Do not close the app.");
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
          "flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 text-[17px] font-medium transition-colors " +
          (recording
            ? "bg-rose-500 text-white"
            : status === "working" || status === "starting"
              ? "bg-chip text-muted"
              : "bg-accent text-accent-ink")
        }
      >
        {recording ? (
          <span className="flex items-center justify-center gap-3">
            {mode === "live" ? <PulseDot speaking={speaking} /> : <LevelMeter level={level} />}
            Tap to stop
            <span className="font-mono text-base tabular-nums opacity-90">
              {mm}:{ss}
            </span>
          </span>
        ) : status === "starting" ? (
          "Starting…"
        ) : status === "working" ? (
          <span className="flex items-center justify-center gap-2">
            <Mark className="h-5 w-5" spinning />
            Working…
          </span>
        ) : (
          <>
            <MicIcon className="h-5 w-5" />
            Tap to speak
          </>
        )}
      </button>

      {/* While a live socket is open, the words themselves ARE the "it's working" signal — no
          need to wait for the round to end to see whether it heard anything. */}
      {recording && mode === "live" && liveText && (
        <p className="rounded-lg bg-chip/60 px-3 py-2 text-[13px] leading-relaxed text-muted">
          “{liveText}”
        </p>
      )}

      {transcript && (
        <div className="rounded-lg bg-chip/60 px-3 py-2 text-[13px] leading-relaxed text-muted">
          {findings.length > 0 ? highlight(transcript, findings.map((f) => f.source_quote)) : <>“{transcript}”</>}
        </div>
      )}

      {findings.length > 0 && (
        <ul className="flex flex-col gap-1">
          {findings.map((f, i) => (
            <li
              key={`${f.label}-${i}`}
              className="wm-pop flex items-baseline gap-2 text-[13px]"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <span aria-hidden className={"mt-1 h-1.5 w-1.5 shrink-0 rounded-full " + (f.needs_confirmation ? "bg-orange-500" : "bg-emerald-500")} />
              <span className="text-muted">{f.label}</span>
              <span className="font-medium">{f.value_text}</span>
              {f.needs_confirmation && <span className="text-[11px] text-orange-600">check</span>}
            </li>
          ))}
        </ul>
      )}

      {message && <p className="text-center text-[15px] text-muted">{message}</p>}
    </div>
  );
}

function normaliseFindings(raw: unknown): Finding[] {
  return (Array.isArray(raw) ? raw : []).map(
    (o: Partial<Finding>): Finding => ({
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

/** The live-mode equivalent of the level meter — a ring that swells out from the dot while
 *  Deepgram is reporting speech, still (but present) between sentences. */
function PulseDot({ speaking }: { speaking: boolean }) {
  return (
    <span className="relative inline-flex h-2.5 w-2.5 items-center justify-center" aria-hidden>
      {speaking && <span className="wm-listen absolute inset-0 rounded-full bg-white/70" />}
      <span className="relative h-2.5 w-2.5 rounded-full bg-white" />
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
