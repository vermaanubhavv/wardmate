"use client";

import { useEffect, useRef, useState } from "react";
import { MicIcon } from "@/app/icons";

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

// Server-safe: lives in its own module so server pages (Learn) can call it — this file is a
// client module. Re-exported here so client callers keep importing it from card-kit.
export { statusChip } from "./status-chip";

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
        "inline-flex min-h-11 items-center gap-1.5 rounded-full border px-3 py-1.5 text-footnote transition-colors " +
        (selected
          ? "border-accent bg-accent text-accent-ink"
          : tone === "note"
            ? "border-warn-fg/30 bg-warn-bg text-warn-fg"
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
        "flex items-center gap-2.5 rounded-[10px] border px-3.5 py-3 text-left text-subhead " +
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
  "min-h-11 self-start rounded-[10px] border border-line px-3 py-1.5 text-footnote font-medium text-accent disabled:opacity-50";
export const approveBtn =
  "min-h-11 self-start rounded-[10px] bg-accent px-3 py-1.5 text-footnote font-semibold text-accent-ink disabled:opacity-50";

// --- dictation + pill helpers, shared by the case-history and progress-note workspaces ------

/** The container/codec MediaRecorder produces varies by browser — Safari/iOS gives mp4,
 *  Chrome/Android webm/opus. The transcriber picks its decoder from the file extension, so the
 *  real type is carried through as the file's extension. Every recorder asks for the first of
 *  these the browser supports. */
export const REC_MIME =
  ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/mpeg"].find(
    (t) => typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(t)
  );

export function extFor(mime: string): string {
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
      const mime = rec.mimeType || "audio/webm";
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
    // Timeslice: a chunk a second, so an interruption before a clean stop costs a second.
    rec.start(1000);
    setStatus("recording");
  }

  return (
    <div className="flex flex-col gap-1.5">
      <textarea
        value={value}
        rows={rows}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-[10px] border border-line bg-card px-3 py-2 text-subhead leading-relaxed outline-none focus:border-accent"
      />
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={status === "recording" ? () => mediaRef.current?.stop() : start}
          disabled={status === "working"}
          className={
            "inline-flex min-h-11 items-center gap-1.5 self-start rounded-[10px] px-3 py-1.5 text-footnote font-medium " +
            (status === "recording" ? "bg-recording text-white" : "border border-line text-accent")
          }
        >
          {status === "recording" ? (
            "■ Stop"
          ) : status === "working" ? (
            "Transcribing…"
          ) : (
            <>
              <MicIcon /> Speak
            </>
          )}
        </button>
        {error && <span className="text-caption text-critical-fg">{error}</span>}
      </div>
    </div>
  );
}

/**
 * A row of chips showing only the commonest up front — every chip list is ordered commonest
 * first — with the rest behind one "+N more" chip. A selected chip always shows, wherever it
 * sits in the list, so nothing the resident picked is ever hidden.
 */
export function ChipRow({
  items,
  selected,
  onToggle,
}: {
  items: string[];
  selected: (c: string) => boolean;
  onToggle: (c: string) => void;
}) {
  const [all, setAll] = useState(false);
  const shown = all ? items : items.filter((c, i) => i < 8 || selected(c));
  const hidden = items.length - shown.length;
  return (
    <div className="flex flex-wrap gap-1.5">
      {shown.map((c) => (
        <SelChip key={c} selected={selected(c)} onClick={() => onToggle(c)}>
          {c}
        </SelChip>
      ))}
      {hidden > 0 && (
        <button
          type="button"
          onClick={() => setAll(true)}
          className="inline-flex min-h-11 items-center rounded-full border border-dashed border-line px-3 py-1.5 text-footnote text-accent"
        >
          +{hidden} more
        </button>
      )}
    </div>
  );
}

/** The "AI could not resolve these" box, shared by every compile/propose card. */
export function UncertainList({ points }: { points: string[] }) {
  if (points.length === 0) return null;
  return (
    <div className="rounded-[10px] bg-warn-bg p-2.5 text-footnote text-warn-fg">
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
      <ChipRow items={pills} selected={has} onToggle={toggle} />
      <DictateArea value={value} onChange={onChange} placeholder={placeholder} rows={rows} />
    </>
  );
}

/**
 * The chrome every step-by-step workspace shares (note, discharge, case history): the card with
 * its "N of M" kicker and 3px progress bar, the jump menu, and the fixed Back / Next bar. The
 * menu is a native <details>, keyed on the step so moving to another card closes it.
 */
export function StepShell({
  kicker,
  step,
  steps,
  title,
  badge,
  children,
  noun,
  items,
  onJump,
  track = "bg-chip",
  between,
  after,
  notice,
  onBack,
  backDisabled,
  next,
}: {
  /** "Today's note · 9 Oct" — the "· N of M" is added here. */
  kicker: React.ReactNode;
  step: number;
  steps: number;
  title: React.ReactNode;
  /** Beside the title, e.g. an "unsaved" chip. */
  badge?: React.ReactNode;
  children: React.ReactNode;
  /** "card" or "section": the menu reads "Jump to a card" / "Hide cards". */
  noun: string;
  /** One row per step: its title, the dot's colour class, anything trailing. */
  items: { title: React.ReactNode; dot: string; trailing?: React.ReactNode }[];
  onJump: (index: number) => void;
  /** The progress bar's track colour class. */
  track?: string;
  /** Rendered between the jump toggle and the open menu. */
  between?: React.ReactNode;
  /** Rendered between the jump menu and the fixed bar. */
  after?: React.ReactNode;
  /** A line above the buttons inside the fixed bar. */
  notice?: React.ReactNode;
  onBack: () => void;
  backDisabled: boolean;
  /** The bar's primary action. */
  next: React.ReactNode;
}) {
  const pct = Math.round(((step + 1) / steps) * 100);
  // The menu closes whenever the step changes.
  const [open, setOpen] = useState(false);
  const [openStep, setOpenStep] = useState(step);
  if (openStep !== step) {
    setOpenStep(step);
    setOpen(false);
  }
  return (
    <>
      <div className="ios-group overflow-hidden">
        <div className="px-4 pt-4 pb-3">
          <p className="text-caption2 font-semibold uppercase tracking-[0.03em] text-muted">
            {kicker} · {step + 1} of {steps}
          </p>
          <div className="mt-0.5 flex items-start justify-between gap-2">
            <h2 className="text-title1 font-bold leading-tight tracking-[-0.021em]">{title}</h2>
            {badge}
          </div>
        </div>
        <div className={"h-[3px] " + track}>
          <div className="h-full bg-accent transition-all" style={{ width: `${pct}%` }} />
        </div>
        <div className="flex flex-col gap-3 px-4 py-4">{children}</div>
      </div>

      <button type="button" onClick={() => setOpen((o) => !o)} className="tap self-center text-footnote font-medium text-accent">
        {open ? `Hide ${noun}s` : `Jump to a ${noun}`}
      </button>
      {between}
      {open && (
        <div className="ios-group flex flex-col p-1.5">
          {items.map((s, i) => (
            <button
              key={i}
              type="button"
              onClick={() => onJump(i)}
              className={"flex items-center gap-2 rounded-[8px] px-2.5 py-2 text-left text-subhead " + (i === step ? "bg-chip font-medium" : "")}
            >
              <span className={"h-2 w-2 shrink-0 rounded-full " + s.dot} />
              <span className="text-muted">{i + 1}.</span>
              <span className="flex-1">{s.title}</span>
              {s.trailing}
            </button>
          ))}
        </div>
      )}

      {after}

      <div className="bottom-bar fixed inset-x-0 bottom-0 z-10 mx-auto max-w-md border-t border-line bg-background/90 px-4 pt-3 backdrop-blur-xl">
        {notice}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onBack}
            disabled={backDisabled}
            className="rounded-[12px] border border-line px-5 py-3 text-subhead font-semibold disabled:opacity-40"
          >
            Back
          </button>
          {next}
        </div>
      </div>
    </>
  );
}
