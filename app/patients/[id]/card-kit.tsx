"use client";

import { useEffect, useRef, useState } from "react";

/**
 * The card-stack look, shared between the discharge workspace and the case-history workspace.
 *
 * One card per section, walked through in order like a terminal multi-select: every choice the
 * resident can make by tapping a pill, an option row or a toggle rather than typing. Both
 * surfaces import these so they stay visually identical — see
 * app/patients/[id]/discharge/discharge-workspace.tsx, which is where this originally lived.
 */

export function IconCheck({ className = "h-[17px] w-[17px]" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M4 10.5 8.5 15 16 5" />
    </svg>
  );
}

/** The small grey/teal/amber status pill shown beside a section title. */
export function statusChip(text: string, tone: "ok" | "warn" | "muted") {
  return (
    <span
      className={
        "shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium " +
        (tone === "ok"
          ? "bg-accent/10 text-accent"
          : tone === "warn"
            ? "bg-orange-100 text-orange-700"
            : "bg-chip text-muted")
      }
    >
      {text}
    </span>
  );
}

/** A pill the resident taps on/off — the Claude-Code multi-select feel. */
export function SelChip({
  selected,
  onClick,
  children,
  tone = "plain",
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
  /** "note" tints an un-selected chip amber, for a value that still needs a look. */
  tone?: "plain" | "note";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[13px] transition-colors " +
        (selected
          ? "border-accent bg-accent text-accent-ink"
          : tone === "note"
            ? "border-orange-300 bg-orange-100 text-orange-700"
            : "border-line bg-card text-muted")
      }
    >
      {selected && <IconCheck className="h-3 w-3" />}
      {children}
    </button>
  );
}

/** A full-width option row — one tap to choose. `dashed` is the "add another" row. */
export function OptionRow({
  selected,
  onClick,
  children,
  dashed,
}: {
  selected?: boolean;
  onClick: () => void;
  children: React.ReactNode;
  dashed?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        "flex items-center gap-2.5 rounded-[10px] border px-3.5 py-3 text-left text-[14.5px] " +
        (selected
          ? "border-accent bg-accent text-accent-ink"
          : dashed
            ? "border-dashed border-line text-muted"
            : "border-line bg-card")
      }
    >
      <span className="flex-1">{children}</span>
      {selected && <IconCheck className="h-[17px] w-[17px] shrink-0" />}
    </button>
  );
}

/** iOS-style toggle. */
export function Toggle({ on, onClick }: { on: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={onClick}
      className={
        "relative h-[29px] w-[47px] shrink-0 rounded-full transition-colors " +
        (on ? "bg-accent" : "bg-chip")
      }
    >
      <span
        className={
          "absolute top-[2px] h-[25px] w-[25px] rounded-full bg-white shadow transition-all " +
          (on ? "left-[20px]" : "left-[2px]")
        }
      />
    </button>
  );
}

export const genBtn =
  "self-start rounded-[10px] border border-line px-3 py-1.5 text-[13px] font-medium text-accent disabled:opacity-50";
export const approveBtn =
  "self-start rounded-[10px] bg-accent px-3 py-1.5 text-[13px] font-semibold text-accent-ink disabled:opacity-50";

// --- dictation + pill helpers, shared by the case-history and progress-note workspaces ------

/** The container/codec MediaRecorder produces varies by browser — Safari/iOS gives mp4,
 *  Chrome/Android webm/opus. The transcriber picks its decoder from the file extension, so the
 *  real type has to be carried through. Same list the round recorder uses. */
const REC_MIME =
  ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/mpeg"].find(
    (t) => typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(t)
  ) ?? "";

function extFor(mime: string): string {
  if (mime.includes("mp4")) return "m4a";
  if (mime.includes("mpeg")) return "mp3";
  if (mime.includes("ogg")) return "ogg";
  return "webm";
}

/** A textarea with a tap-to-record button that appends a transcript from /api/transcribe.
 *  Tap to start, tap to stop — a press-and-hold cannot host getUserMedia's permission prompt. */
export function DictateArea({
  value,
  onChange,
  placeholder,
  rows = 3,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  const [status, setStatus] = useState<"idle" | "recording" | "working">("idle");
  const [error, setError] = useState<string | null>(null);
  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const valueRef = useRef(value);
  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  async function start() {
    if (status !== "idle") return;
    setError(null);
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      setError("Microphone blocked — allow it for this site in your browser settings.");
      return;
    }
    const rec = new MediaRecorder(stream, REC_MIME ? { mimeType: REC_MIME } : undefined);
    chunksRef.current = [];
    rec.ondataavailable = (e) => e.data.size > 0 && chunksRef.current.push(e.data);
    rec.onstop = async () => {
      stream.getTracks().forEach((t) => t.stop());
      const mime = rec.mimeType || REC_MIME || "audio/webm";
      const blob = new Blob(chunksRef.current, { type: mime });
      if (blob.size < 1200) {
        setStatus("idle");
        setError("Nothing was recorded — hold on a moment longer before stopping.");
        return;
      }
      setStatus("working");
      const form = new FormData();
      form.append("audio", blob, `note.${extFor(mime)}`);
      try {
        const r = await fetch("/api/transcribe", { method: "POST", body: form });
        const data = await r.json();
        if (!r.ok || !data.text) {
          setError(data.error ?? "Could not transcribe that — try again.");
        } else {
          const prev = valueRef.current.trim();
          onChange(prev ? `${prev} ${data.text}` : data.text);
        }
      } catch {
        setError("No connection — the audio was not sent.");
      }
      setStatus("idle");
    };
    mediaRef.current = rec;
    rec.start();
    setStatus("recording");
  }

  return (
    <div className="flex flex-col gap-1.5">
      <textarea
        value={value}
        rows={rows}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-[10px] border border-line bg-card px-3 py-2 text-[15px] leading-relaxed outline-none focus:border-accent"
      />
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={status === "recording" ? () => mediaRef.current?.stop() : start}
          disabled={status === "working"}
          className={
            "self-start rounded-[10px] px-3 py-1.5 text-[13px] font-medium " +
            (status === "recording" ? "bg-red-500 text-white" : "border border-line text-accent")
          }
        >
          {status === "recording" ? "■ Stop" : status === "working" ? "Transcribing…" : "🎤 Speak"}
        </button>
        {error && <span className="text-[12px] text-red-600">{error}</span>}
      </div>
    </div>
  );
}

/** The "AI could not resolve these" box, shared by every compile/propose card. */
export function UncertainList({ points }: { points: string[] }) {
  if (points.length === 0) return null;
  return (
    <div className="rounded-[10px] bg-orange-50 p-2.5 text-[13px] text-orange-800">
      <p className="font-medium">The AI could not resolve these — check them:</p>
      <ul className="mt-1 list-disc pl-4">
        {points.map((p, i) => (
          <li key={i}>{p}</li>
        ))}
      </ul>
    </div>
  );
}

const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** A row of pills that append their phrase to one free-text line, over a DictateArea for
 *  anything the pills cannot say. A pill reads as "on" when its phrase is already in the text. */
export function PillsAndText({
  pills,
  value,
  onChange,
  placeholder,
  rows = 3,
}: {
  pills: string[];
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  const has = (p: string) => new RegExp(`(^|,\\s*)${esc(p)}\\b`, "i").test(value);
  const toggle = (p: string) => {
    if (has(p)) {
      onChange(
        value
          .replace(new RegExp(`(^|,\\s*)${esc(p)}\\b`, "i"), "")
          .replace(/^,\s*/, "")
          .replace(/\s{2,}/g, " ")
          .trim()
      );
    } else {
      onChange(value.trim() ? `${value.trim().replace(/[.,;]\s*$/, "")}, ${p}` : p);
    }
  };
  return (
    <>
      <div className="flex flex-wrap gap-1.5">
        {pills.map((p) => (
          <SelChip key={p} selected={has(p)} onClick={() => toggle(p)}>
            {p}
          </SelChip>
        ))}
      </div>
      <DictateArea value={value} onChange={onChange} placeholder={placeholder} rows={rows} />
    </>
  );
}
