"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Check } from "lucide-react";

const BARS = 22;

/**
 * The one recording screen: the unit round from the ward list and a single patient from the
 * bedside both open this sheet, so speaking looks and works the same wherever you start it.
 * Only what sits inside changes — the caller passes it as children ("Still to cover", "Heard
 * so far").
 *
 * A sheet rather than a full screen: the page you started from stays visible behind it, so it
 * is obvious which patient (or which unit) you are talking about.
 */
export default function RecordingSheet({
  status,
  title,
  subtitle,
  seconds,
  maxSeconds,
  stream,
  note,
  onDiscard,
  onDone,
  children,
}: {
  status: "starting" | "recording" | "finishing";
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  seconds: number;
  maxSeconds: number;
  /** The live microphone, for the level bars. */
  stream: MediaStream | null;
  /** One line above the buttons: what happens to what is said. */
  note: string;
  /** Left out where there is nothing left to throw away. */
  onDiscard?: () => void;
  onDone: () => void;
  children?: React.ReactNode;
}) {
  const levels = useLevels(stream);
  // Steady room noise is the quietest recent bar; only what rises above it lights up.
  const floor = Math.min(...levels);
  const nearEnd = seconds >= maxSeconds - 30;

  return createPortal(
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      {/* Not a tap-to-close backdrop: a stray tap must not end a recording. */}
      <div aria-hidden className="absolute inset-0 bg-black/30" />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="recording-sheet-title"
        className="wm-pop relative flex max-h-[88dvh] flex-col gap-3.5 rounded-t-[16px] bg-card px-5 pt-2.5"
        style={{ paddingBottom: "calc(1.25rem + env(safe-area-inset-bottom))" }}
      >
        <span aria-hidden className="h-[5px] w-9 self-center rounded-full bg-line" />

        <div className="flex flex-col gap-1">
          <span
            role="status"
            className={
              "flex items-center gap-1.5 text-footnote font-bold uppercase tracking-wide " +
              (status === "recording" ? "text-recording" : "text-muted")
            }
          >
            {status === "recording" && (
              <span className="relative inline-flex h-2.5 w-2.5">
                <span aria-hidden className="wm-listen absolute inset-0 rounded-full bg-recording" />
                <span className="relative h-2.5 w-2.5 rounded-full bg-recording" />
              </span>
            )}
            {status === "recording" ? "Recording" : status === "starting" ? "Starting…" : "Finishing…"}
          </span>
          <h2 id="recording-sheet-title" className="text-title2 font-bold tracking-tight">
            {title}
          </h2>
          {subtitle && <p className="text-subhead text-muted">{subtitle}</p>}
        </div>

        <div className="flex items-end justify-between gap-3">
          <span className="text-[3rem] font-light leading-none tracking-tight tabular-nums">{clock(seconds)}</span>
          <span className={"pb-1.5 text-subhead tabular-nums " + (nearEnd ? "font-semibold text-warn-fg" : "text-muted")}>
            of {clock(maxSeconds)}
          </span>
        </div>
        <div aria-hidden className="flex h-10 items-center gap-[3px]">
          {levels.map((l, i) => {
            const voice = l - floor > 0.08;
            return (
              <span
                key={i}
                className={"flex-1 rounded-[2px] " + (voice ? "bg-recording" : "bg-line")}
                style={{ height: `${voice ? Math.round(8 + Math.min(1, (l - floor) * 1.6) * 32) : 4}px`, transition: "height 0.1s linear" }}
              />
            );
          })}
        </div>

        {children}

        <p className="text-footnote text-muted">{note}</p>

        <div className="flex gap-2.5">
          {onDiscard && (
            <button
              type="button"
              onClick={onDiscard}
              disabled={status === "finishing"}
              className="h-[54px] flex-1 rounded-[14px] bg-chip text-body font-semibold text-foreground/80 active:opacity-70 disabled:opacity-50"
            >
              Discard
            </button>
          )}
          <button
            type="button"
            onClick={onDone}
            disabled={status !== "recording"}
            className="h-[54px] flex-[2] rounded-[14px] bg-accent text-body font-semibold text-accent-ink active:opacity-80 disabled:opacity-50"
          >
            Done
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

/** A small caps heading inside the sheet. */
export function SheetHeading({ children }: { children: React.ReactNode }) {
  return <span className="text-caption font-semibold uppercase tracking-wide text-muted">{children}</span>;
}

/** The grey box of words heard so far. Grows to fill the sheet and scrolls past that. */
export function HeardBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-[7rem] flex-1 flex-col gap-2 overflow-y-auto rounded-[12px] bg-background p-3" aria-live="polite">
      <SheetHeading>Heard so far</SheetHeading>
      {children}
    </div>
  );
}

/** What is still to cover for this patient, ticked off as it is said. */
export function CoverChips({ items, covered }: { items: string[]; covered: Set<string> }) {
  if (items.length === 0) return null;
  return (
    <div className="flex flex-col gap-2">
      <SheetHeading>Still to cover</SheetHeading>
      <div className="flex flex-wrap gap-1.5">
        {items.map((item) =>
          covered.has(item) ? (
            <span key={item} className="flex items-center gap-1 rounded-full bg-accent/10 px-2.5 py-1 text-subhead text-accent">
              <Check className="h-3.5 w-3.5" strokeWidth={3} aria-label="covered" />
              {item}
            </span>
          ) : (
            <span key={item} className="rounded-full border border-line px-2.5 py-1 text-subhead text-foreground/80">
              {item}
            </span>
          )
        )}
      </div>
    </div>
  );
}

export function clock(total: number) {
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;
}

/** The last couple of seconds of microphone level, newest on the right — "it is hearing you". */
function useLevels(stream: MediaStream | null): number[] {
  const [levels, setLevels] = useState<number[]>(() => Array(BARS).fill(0));
  useEffect(() => {
    if (!stream) return;
    let ctx: AudioContext | null = null;
    let timer: ReturnType<typeof setInterval> | null = null;
    try {
      const Ctx =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctx) return;
      ctx = new Ctx();
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      ctx.createMediaStreamSource(stream).connect(analyser);
      const buf = new Uint8Array(analyser.fftSize);
      timer = setInterval(() => {
        analyser.getByteTimeDomainData(buf);
        let sum = 0;
        for (let i = 0; i < buf.length; i++) {
          const v = (buf[i] - 128) / 128;
          sum += v * v;
        }
        const level = Math.min(1, Math.sqrt(sum / buf.length) * 4);
        setLevels((l) => [...l.slice(1), level]);
      }, 100);
    } catch {
      // The bars are decoration; a phone that will not open an AudioContext still records.
    }
    return () => {
      if (timer) clearInterval(timer);
      ctx?.close().catch(() => {});
      setLevels(Array(BARS).fill(0));
    };
  }, [stream]);
  return levels;
}
