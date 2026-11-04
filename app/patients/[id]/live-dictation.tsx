"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { MicIcon, StopIcon } from "@/app/icons";
import { statusChip } from "./card-kit";
import { openLiveDictation, pickMime, type LiveDictationSession } from "@/lib/stt/live";
import { clearChunks, putChunk, saveRecording } from "@/lib/outbox";
import { LATE_LABEL, offered, type LateScreen } from "@/lib/late-dictation";

/**
 * Live dictation, laid out as the form itself. The resident talks; the words stream in at the
 * top as Nova-3 Medical hears them, and at each pause that thought is sorted and drops into its
 * section's table below — complaints, HOPI, past history, examination, plan — while they are
 * still speaking. Shared by the clerking, the progress note and the discharge summary; each
 * screen supplies its sections and what "sorting" means for it (`route`).
 *
 * Every line that carries a number, or sits in a drug section, is marked "check" — amber until
 * the resident confirms it on the card.
 *
 * No signal — at the start, or the link drops mid-take — and the take is recorded onto the
 * phone instead (lib/outbox.ts, a second at a time), tagged with the screen and the time. When
 * the signal returns the connection bar sends it and the server fills the same cards
 * (lib/late-dictation.ts), so the words are late, never lost.
 */

export type LiveSection = {
  key: string;
  label: string;
  /** What the card already holds — shown muted above this session's lines. */
  existing?: string;
  /** Sorted but not written into the card — the resident places it (shown with a note). */
  held?: boolean;
  /** Drugs or doses: every line here is amber. */
  drug?: boolean;
};
/** `check` overrides the panel's own number/drug rule when the server already decided it. */
export type LiveLine = { section: string; text: string; check?: boolean };

type SessionState = "connecting" | "listening" | "sorting" | "offline" | "stopping" | "error";

export const needsCheck = (line: string, drug?: boolean) => !!drug || /\d/.test(line);

export default function LiveDictation({
  patientId,
  screen,
  title,
  example,
  sections,
  route,
  onLines,
  onClose,
}: {
  patientId: string;
  /** Which screen this is — a take recorded with no signal is filed onto it later. */
  screen: LateScreen;
  title: string;
  example: string;
  sections: LiveSection[];
  /** Sort one pause of transcript. Resolves with the lines to show (and, for the clerking, after
   *  filing them). */
  route: (text: string) => Promise<{ lines: LiveLine[]; error?: string }>;
  /** Drop the sorted lines into the screen's own cards. */
  onLines?: (lines: LiveLine[]) => void;
  onClose: () => void;
}) {
  const [state, setState] = useState<SessionState>("connecting");
  const [message, setMessage] = useState<string | null>(null);
  const [partial, setPartial] = useState("");
  const [bufText, setBufText] = useState("");
  const [sorting, setSorting] = useState("");
  const [lines, setLines] = useState<(LiveLine & { n: number })[]>([]);
  const [latest, setLatest] = useState(-1);

  const sessionRef = useRef<LiveDictationSession | null>(null);
  const finalBufRef = useRef("");
  const routingRef = useRef(false);
  const countRef = useRef(0);
  const tableRefs = useRef<Record<string, HTMLElement | null>>({});
  const routeRef = useRef(route);
  const onLinesRef = useRef(onLines);
  useEffect(() => {
    routeRef.current = route;
    onLinesRef.current = onLines;
  });

  // The take as it is kept on the phone when there is no signal: one id for its chunks and its
  // queued row, and the moment the unsent words began.
  const recIdRef = useRef<string>("");
  const seqRef = useRef(0);
  const recordedAtRef = useRef("");
  const queuedRef = useRef(false);
  const offlineRef = useRef<{ rec: MediaRecorder; stream: MediaStream; chunks: Blob[]; mime: string } | null>(null);
  const meta = useCallback(
    (mimeType: string) => ({
      kind: "dictation" as const,
      url: "/api/entries/late-dictation",
      patientId,
      label: LATE_LABEL[screen],
      mimeType,
      screen,
      recordedAt: recordedAtRef.current,
    }),
    [patientId, screen]
  );
  const beginUnsent = useCallback(() => {
    if (recIdRef.current) return;
    recIdRef.current = crypto.randomUUID();
    recordedAtRef.current = new Date().toISOString();
  }, []);
  const keepChunk = useCallback(
    (chunk: Blob, mimeType: string) => {
      beginUnsent();
      void putChunk(recIdRef.current, seqRef.current++, chunk, meta(mimeType));
    },
    [beginUnsent, meta]
  );
  /** The whole unsent take, queued; the connection bar sends it the moment it can. */
  const queueUnsent = useCallback(
    async (audio: Blob, mimeType: string) => {
      beginUnsent();
      queuedRef.current = true;
      const id = recIdRef.current;
      await saveRecording(id, { ...meta(mimeType), audio });
      await clearChunks(id);
      window.dispatchEvent(new Event("outbox-changed"));
      window.dispatchEvent(new Event("outbox-send"));
    },
    [beginUnsent, meta]
  );

  const routeBuffered = useCallback(async () => {
    // One fragment at a time; whatever is said meanwhile waits in the buffer and goes next.
    if (routingRef.current) return;
    routingRef.current = true;
    let text: string;
    while ((text = finalBufRef.current.trim())) {
      finalBufRef.current = "";
      setBufText("");
      setSorting(text);
      setState((s) => (s === "listening" ? "sorting" : s));
      try {
        const res = await routeRef.current(text);
        if (res.error) setMessage(res.error);
        if (res.lines.length > 0) {
          const start = countRef.current;
          countRef.current += res.lines.length;
          setLines((l) => [...l, ...res.lines.map((x, i) => ({ ...x, n: start + i }))]);
          setLatest(start);
          onLinesRef.current?.(res.lines);
          tableRefs.current[res.lines[0].section]?.scrollIntoView({ block: "nearest", behavior: "smooth" });
        } else if (!res.error) {
          setMessage(`Not placed: “${text}” — add it on the card if it matters.`);
        }
      } catch {
        setMessage(`Could not sort “${text}” — no signal. Add it on the card.`);
      }
    }
    routingRef.current = false;
    setSorting("");
    setState((s) => (s === "sorting" ? "listening" : s));
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      let token: string;
      let keyterms: string[];
      // On one bar of signal the token request can hang for a minute. Six seconds covers a cold
      // server plus a slow phone connection and still falls back within a breath.
      const abort = new AbortController();
      const timer = setTimeout(() => abort.abort(), 6000);
      try {
        const res = await fetch("/api/transcribe/live-token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ patientId }),
          signal: abort.signal,
        });
        clearTimeout(timer);
        const data = (await res.json()) as { token?: string; keyterms?: string[]; error?: string };
        if (!res.ok || !data.token) throw new Error(data.error ?? "Could not start live dictation.");
        token = data.token;
        keyterms = data.keyterms ?? [];
      } catch (e) {
        clearTimeout(timer);
        if (cancelled) return;
        // No signal (or no answer from the server): record onto the phone instead. A refusal
        // the server did answer — not signed in, no key — is an error, said as one.
        const noSignal = abort.signal.aborted || !navigator.onLine || e instanceof TypeError;
        if (!noSignal) {
          setState("error");
          setMessage(e instanceof Error ? e.message : "Could not start live dictation.");
          return;
        }
        const mime = pickMime();
        try {
          if (!mime) throw new Error("This phone cannot record here — type on the cards instead.");
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          if (cancelled) return stream.getTracks().forEach((t) => t.stop());
          const rec = new MediaRecorder(stream, { mimeType: mime });
          const chunks: Blob[] = [];
          rec.ondataavailable = (ev) => {
            if (ev.data.size === 0) return;
            chunks.push(ev.data);
            keepChunk(ev.data, mime);
          };
          beginUnsent();
          rec.start(1000);
          offlineRef.current = { rec, stream, chunks, mime };
          setState("offline");
          setMessage("No signal — recording on this phone. It is written up and filled into the cards when the signal returns.");
        } catch (err) {
          setState("error");
          setMessage(err instanceof Error && err.name !== "NotAllowedError" ? err.message : "Microphone blocked — allow it for this site in your browser settings.");
        }
        return;
      }
      if (cancelled) return;
      try {
        sessionRef.current = await openLiveDictation({
          token,
          keyterms,
          onOpen: () => !cancelled && setState("listening"),
          onPartial: (t) => !cancelled && setPartial(t),
          onFinal: (t) => {
            finalBufRef.current = `${finalBufRef.current} ${t}`.trim();
            if (!cancelled) {
              setBufText(finalBufRef.current);
              setPartial("");
            }
          },
          onUtteranceEnd: () => void routeBuffered(),
          // Live link lost: the phone keeps recording, and on Done that recording is
          // transcribed in one pass and sorted like anything said live.
          onLinkLost: (m) => !cancelled && setMessage(m),
          onRescued: (t) => {
            finalBufRef.current = `${finalBufRef.current} ${t}`.trim();
            if (recIdRef.current) void clearChunks(recIdRef.current);
          },
          onRescueChunk: keepChunk,
          onRescueUnsent: (audio, mimeType) => {
            void queueUnsent(audio, mimeType);
            if (!cancelled) setMessage("No signal — what you said after the link dropped is saved on this phone and filled in when the signal returns.");
          },
          onError: (m) => {
            if (cancelled) return;
            setState("error");
            setMessage(m);
          },
        });
      } catch (e) {
        if (!cancelled) {
          setState("error");
          setMessage(e instanceof Error ? e.message : "Could not reach the microphone.");
        }
      }
    })();
    return () => {
      cancelled = true;
      sessionRef.current?.stop();
      sessionRef.current = null;
      // Leaving without Done (the screen closed under it): what was recorded offline is queued
      // all the same. Its chunks are already on the phone if even this does not get to run.
      const off = offlineRef.current;
      offlineRef.current = null;
      if (off) {
        off.rec.onstop = () => {
          const audio = new Blob(off.chunks, { type: off.mime });
          if (audio.size >= 1000) void queueUnsent(audio, off.mime);
        };
        if (off.rec.state !== "inactive") off.rec.stop();
        off.stream.getTracks().forEach((t) => t.stop());
      }
    };
  }, [patientId, routeBuffered, beginUnsent, keepChunk, queueUnsent]);

  async function finish() {
    setState("stopping");
    const off = offlineRef.current;
    if (off) {
      offlineRef.current = null;
      await new Promise<void>((resolve) => {
        if (off.rec.state === "inactive") return resolve();
        off.rec.onstop = () => resolve();
        off.rec.stop();
      });
      off.stream.getTracks().forEach((t) => t.stop());
      const audio = new Blob(off.chunks, { type: off.mime });
      if (audio.size >= 1000) await queueUnsent(audio, off.mime);
      else await clearChunks(recIdRef.current);
      return onClose();
    }
    // Resolves after any rescue recording is transcribed into finalBufRef (or queued).
    await sessionRef.current?.stop();
    sessionRef.current = null;
    // A rescue the server heard nothing in: its chunks would otherwise be "recovered" later.
    if (recIdRef.current && !queuedRef.current) void clearChunks(recIdRef.current);
    // The last words may still be a partial — keep them rather than drop them.
    if (partial) finalBufRef.current = `${finalBufRef.current} ${partial}`.trim();
    for (let i = 0; i < 80 && routingRef.current; i++) await new Promise((r) => setTimeout(r, 100));
    await routeBuffered();
    onClose();
  }

  const listening = state === "listening" || state === "sorting" || state === "offline";
  const filledCount = sections.filter((s) => s.existing?.trim() || lines.some((l) => l.section === s.key)).length;

  // Portalled to <body>: the bedside mic lives in a blurred fixed bar, and a backdrop-filter
  // ancestor would trap this "full-screen" panel inside the bar.
  return createPortal(
    <div className="fixed inset-0 z-50 flex flex-col bg-background">
      <header className="flex items-center justify-between gap-3 border-b border-line px-4 pb-3 pt-[calc(0.75rem+env(safe-area-inset-top))]">
        <div className="min-w-0">
          <p className="truncate text-subhead font-semibold">{title}</p>
          <p className="text-caption text-muted">
            {state === "connecting" && "Starting the microphone…"}
            {state === "listening" && "Listening — speak in any order, pause between thoughts"}
            {state === "sorting" && "Listening — placing the last thought…"}
            {state === "offline" && "No signal — recording on this phone"}
            {state === "stopping" && "Placing the last words…"}
            {state === "error" && "Live dictation unavailable"}
            {state !== "connecting" && state !== "error" && state !== "offline" && ` · ${filledCount} of ${sections.length} filled`}
          </p>
        </div>
        <button
          type="button"
          onClick={() => void finish()}
          disabled={state === "stopping"}
          className="rounded-[10px] bg-accent px-4 py-2 text-subhead font-semibold text-accent-ink disabled:opacity-60"
        >
          Done
        </button>
      </header>

      {/* What is being heard right now. */}
      <div className="border-b border-line bg-card px-4 py-3">
        <div className="mx-auto flex max-w-3xl items-start gap-3">
          <span
            className={
              "relative mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full " +
              (listening ? "bg-recording text-white" : "bg-chip text-muted")
            }
          >
            {listening && <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-critical-dot opacity-50" />}
            <MicIcon className="relative h-5 w-5" />
          </span>
          <div className="min-h-[2.5rem] flex-1 text-subhead leading-snug" aria-live="polite">
            {sorting && <span className="mr-1 rounded bg-accent/10 px-1 text-muted">{sorting}</span>}
            <span>{bufText}</span> <span className="text-muted">{partial}</span>
            {!sorting && !bufText && !partial && <span className="text-muted">{state === "error" ? "" : example}</span>}
          </div>
        </div>
        {message && (
          <p className="mx-auto mt-2 max-w-3xl rounded-[10px] bg-chip px-3 py-2 text-footnote text-muted">{message}</p>
        )}
      </div>

      {/* The form, filling in. */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="mx-auto grid max-w-3xl gap-2 sm:grid-cols-2">
          {sections.map((s) => {
            const mine = lines.filter((l) => l.section === s.key);
            const fresh = mine.some((l) => l.n >= latest && latest >= 0);
            const empty = !s.existing?.trim() && mine.length === 0;
            return (
              <section
                key={s.key}
                ref={(el) => {
                  tableRefs.current[s.key] = el;
                }}
                className={
                  "rounded-[12px] border px-3 py-2.5 transition-colors duration-700 " +
                  (fresh ? "border-accent bg-accent/5" : "border-line bg-card")
                }
              >
                <div className="flex items-center justify-between gap-2">
                  <h3 className={"text-footnote font-semibold " + (empty ? "text-muted" : "")}>{s.label}</h3>
                  {s.held && mine.length > 0 && statusChip("place on the card", "muted")}
                </div>
                {s.existing?.trim() && <p className="mt-1 line-clamp-3 text-footnote text-muted">{s.existing}</p>}
                {mine.length > 0 && (
                  <ul className="mt-1 flex flex-col gap-1">
                    {mine.map((l) => (
                      <li
                        key={l.n}
                        className={
                          "flex items-start gap-2 rounded-[8px] px-1.5 py-1 text-footnote transition-colors duration-700 " +
                          (l.n >= latest ? "bg-accent/10" : "")
                        }
                      >
                        <span className="flex-1">{l.text}</span>
                        {(l.check ?? needsCheck(l.text, s.drug)) && statusChip("check", "warn")}
                      </li>
                    ))}
                  </ul>
                )}
                {empty && <p className="mt-0.5 text-caption text-muted">—</p>}
              </section>
            );
          })}
        </div>
      </div>

      <footer className="border-t border-line px-4 py-3">
        <button
          type="button"
          onClick={() => void finish()}
          disabled={state === "stopping"}
          className="mx-auto flex w-full max-w-3xl items-center justify-center gap-2 rounded-[10px] border border-line py-3 text-subhead font-medium text-accent disabled:opacity-60"
        >
          <StopIcon className="h-4 w-4" />
          {state === "offline" ? "Stop — keep it on this phone" : "Stop and review the cards"}
        </button>
      </footer>
    </div>,
    document.body
  );
}

/** The entry point on each screen — one tap opens the live panel. */
export function DictateButton({ title, sub, onClick, disabled }: { title: string; sub: string; onClick: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="ios-group flex items-center justify-between gap-3 px-4 py-3.5 text-left active:bg-chip disabled:opacity-60"
    >
      <span>
        <span className="block text-subhead font-semibold text-accent">{title}</span>
        <span className="block text-footnote text-muted">{sub}</span>
      </span>
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent text-accent-ink">
        <MicIcon className="h-4 w-4" />
      </span>
    </button>
  );
}

/** The router for a screen that keeps its own state — sort only, store nothing. */
export function routeVia(patientId: string, sections: LiveSection[]) {
  const sent = offered(sections);
  return async (text: string): Promise<{ lines: LiveLine[]; error?: string }> => {
    const r = await fetch(`/api/patients/${patientId}/route-dictation`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, sections: sent }),
    });
    const data = (await r.json()) as { lines?: LiveLine[]; error?: string };
    return { lines: data.lines ?? [], error: data.error };
  };
}
