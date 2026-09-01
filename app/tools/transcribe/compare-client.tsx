"use client";

import { useEffect, useRef, useState } from "react";
import { MicIcon, StopIcon } from "@/app/icons";
import Mark from "@/app/mark";

/** A comparison is a considered recording, not a bedside blurt — but still bounded. */
const MAX_SECONDS = 150;

const ENGINE_LABEL: Record<string, string> = {
  openai: "OpenAI · gpt-4o-transcribe",
  sarvam: "Sarvam · Saaras",
  deepgram: "Deepgram · Nova-3 Medical",
};

function engineLabel(provider: string, model: string): string {
  return ENGINE_LABEL[provider] ?? `${provider} · ${model}`;
}

type EngineResult = {
  provider: string;
  model: string;
  text: string;
  corrected_text: string | null;
  ms: number;
  error: string | null;
};

export type PastComparison = {
  id: string;
  created_at: string;
  results: EngineResult[];
  duration_seconds: number | null;
  note: string | null;
  best_provider: string | null;
};

type Status = "idle" | "starting" | "recording" | "working";

export default function CompareClient({
  engines,
  past,
}: {
  engines: { provider: string; model: string }[];
  past: PastComparison[];
}) {
  const [status, setStatus] = useState<Status>("idle");
  const [seconds, setSeconds] = useState(0);
  const [message, setMessage] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [live, setLive] = useState<{
    id: string | null;
    results: EngineResult[];
    duration: number;
  } | null>(null);
  const [history, setHistory] = useState<PastComparison[]>(past);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const secondsAtStopRef = useRef(0);

  useEffect(() => {
    if (status !== "recording") return;
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [status]);

  useEffect(() => {
    if (status === "recording" && seconds >= MAX_SECONDS) stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seconds, status]);

  async function start() {
    if (status !== "idle") return;
    setStatus("starting");
    setMessage(null);
    setLive(null);
    setSeconds(0);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
      });
      streamRef.current = stream;

      // Safari records mp4, Chrome webm — asking for the wrong one yields a silent empty file.
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
      navigator.vibrate?.(30);
    } catch {
      setStatus("idle");
      setMessage("Microphone permission was refused. Allow it in your browser settings.");
    }
  }

  function stop() {
    secondsAtStopRef.current = seconds;
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
    form.append("seconds", String(secondsAtStopRef.current || seconds));
    if (note.trim()) form.append("note", note.trim());

    try {
      const res = await fetch("/api/stt-compare", { method: "POST", body: form });
      const data = await res.json();
      setStatus("idle");

      if (!res.ok) {
        setMessage(data.error ?? "Something went wrong.");
        return;
      }

      const duration = secondsAtStopRef.current || seconds;
      setLive({ id: data.id, results: data.results, duration });
      setMessage(data.saved === false ? "Shown below, but could not be saved for later." : null);

      if (data.saved && data.id) {
        setHistory((h) => [
          {
            id: data.id,
            created_at: data.created_at ?? new Date().toISOString(),
            results: data.results,
            duration_seconds: duration,
            note: note.trim() || null,
            best_provider: null,
          },
          ...h,
        ]);
        setNote("");
      }
    } catch {
      setStatus("idle");
      setMessage("The upload did not go through. Check your connection and try again.");
    }
  }

  async function pickBest(id: string, provider: string | null) {
    setHistory((h) =>
      h.map((c) => (c.id === id ? { ...c, best_provider: provider } : c))
    );
    if (live?.id === id) setLive({ ...live });
    try {
      await fetch("/api/stt-compare", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, best_provider: provider }),
      });
    } catch {
      // The choice is a note to self; a failed save is not worth interrupting the comparison.
    }
  }

  const recording = status === "recording";
  const busy = status === "working" || status === "starting";
  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");

  const liveInHistory = live?.id ? history.find((c) => c.id === live.id) : undefined;
  const liveBest = liveInHistory?.best_provider ?? null;

  return (
    <div className="flex flex-col gap-6 py-2">
      {engines.length === 0 ? (
        <p className="ios-group px-4 py-3 text-[15px] text-orange-700">
          No speech engine is set up. Add at least one of <code>OPENAI_API_KEY</code>,{" "}
          <code>SARVAM_API_KEY</code> or <code>DEEPGRAM_API_KEY</code> on Vercel.
        </p>
      ) : (
        <section className="flex flex-col gap-3">
          <p className="text-[13px] text-muted">
            Will run: {engines.map((e) => engineLabel(e.provider, e.model)).join("  ·  ")}
          </p>

          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="What you're about to say / where (optional)"
            className="w-full rounded-[10px] border border-line bg-card px-3 py-2.5 text-[15px] outline-none focus:border-accent"
          />

          <button
            type="button"
            onClick={recording ? stop : start}
            disabled={busy}
            className={
              "flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 text-[17px] font-medium transition-colors " +
              (recording
                ? "bg-rose-500 text-white"
                : busy
                  ? "bg-chip text-muted"
                  : "bg-accent text-accent-ink")
            }
          >
            {recording ? (
              <>
                <StopIcon className="h-5 w-5" />
                Tap to stop
                <span className="font-mono text-base tabular-nums opacity-90">
                  {mm}:{ss}
                </span>
              </>
            ) : status === "working" ? (
              <>
                <Mark className="h-5 w-5" spinning />
                Transcribing on {engines.length}{" "}
                {engines.length === 1 ? "engine" : "engines"}…
              </>
            ) : status === "starting" ? (
              "Starting…"
            ) : (
              <>
                <MicIcon className="h-5 w-5" />
                Record a comparison
              </>
            )}
          </button>

          {message && <p className="text-[14px] text-muted">{message}</p>}
        </section>
      )}

      {live && (
        <section className="flex flex-col gap-2">
          <h2 className="text-[13px] font-semibold uppercase tracking-wide text-muted">
            This recording · {live.duration}s
          </h2>
          {[...live.results]
            .sort((a, b) => a.ms - b.ms)
            .map((r) => (
              <ResultCard
                key={r.provider}
                result={r}
                isBest={liveBest === r.provider}
                onPick={() =>
                  pickBest(live.id!, liveBest === r.provider ? null : r.provider)
                }
                canPick={Boolean(live.id)}
              />
            ))}
        </section>
      )}

      {history.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="text-[13px] font-semibold uppercase tracking-wide text-muted">
            Earlier comparisons
          </h2>
          {history
            .filter((c) => c.id !== live?.id)
            .map((c) => (
              <details key={c.id} className="ios-group px-4 py-3">
                <summary className="cursor-pointer text-[15px]">
                  {new Date(c.created_at).toLocaleString()}
                  {c.duration_seconds ? ` · ${Math.round(c.duration_seconds)}s` : ""}
                  {c.best_provider ? (
                    <span className="text-accent"> · best: {ENGINE_LABEL[c.best_provider] ?? c.best_provider}</span>
                  ) : (
                    <span className="text-muted"> · no pick yet</span>
                  )}
                </summary>
                {c.note && <p className="mt-2 text-[13px] italic text-muted">“{c.note}”</p>}
                <div className="mt-2 flex flex-col gap-2">
                  {[...c.results]
                    .sort((a, b) => a.ms - b.ms)
                    .map((r) => (
                      <ResultCard
                        key={r.provider}
                        result={r}
                        isBest={c.best_provider === r.provider}
                        onPick={() =>
                          pickBest(c.id, c.best_provider === r.provider ? null : r.provider)
                        }
                        canPick
                        flat
                      />
                    ))}
                </div>
              </details>
            ))}
        </section>
      )}
    </div>
  );
}

function ResultCard({
  result,
  isBest,
  onPick,
  canPick,
  flat,
}: {
  result: EngineResult;
  isBest: boolean;
  onPick: () => void;
  canPick: boolean;
  flat?: boolean;
}) {
  const [showCorrected, setShowCorrected] = useState(false);
  return (
    <div
      className={
        (flat ? "rounded-[10px] border p-3 " : "ios-group p-4 ") +
        (isBest ? "border-accent" : "border-line")
      }
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-[14px] font-semibold">
          {engineLabel(result.provider, result.model)}
        </span>
        <span className="shrink-0 text-[12px] tabular-nums text-muted">
          {(result.ms / 1000).toFixed(1)}s
        </span>
      </div>

      {result.error ? (
        <p className="mt-2 text-[14px] text-red-600">{result.error}</p>
      ) : (
        <>
          <p className="mt-2 whitespace-pre-wrap text-[15px] leading-relaxed">
            {result.text || <span className="text-muted">— nothing heard —</span>}
          </p>
          {result.corrected_text && (
            <button
              type="button"
              onClick={() => setShowCorrected((v) => !v)}
              className="mt-1 text-[12px] text-accent"
            >
              {showCorrected ? "Hide" : "Show"} after ward-glossary fix
            </button>
          )}
          {showCorrected && result.corrected_text && (
            <p className="mt-1 whitespace-pre-wrap rounded-md bg-chip px-2 py-1.5 text-[14px] leading-relaxed">
              {result.corrected_text}
            </p>
          )}
        </>
      )}

      {canPick && (
        <button
          type="button"
          onClick={onPick}
          className={
            "mt-3 rounded-md px-3 py-1.5 text-[13px] font-medium " +
            (isBest ? "bg-accent text-accent-ink" : "bg-chip text-foreground")
          }
        >
          {isBest ? "✓ Best for this clip" : "Mark as best"}
        </button>
      )}
    </div>
  );
}
