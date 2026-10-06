"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { MicIcon, StopIcon } from "@/app/icons";
import { statusChip } from "./card-kit";
import { openLiveDictation, type LiveDictationSession } from "@/lib/stt/live";

/**
 * Live dictation, laid out as the form itself. The resident talks; the words stream in at the
 * top as Nova-3 Medical hears them, and at each pause that thought is sorted and drops into its
 * section's table below — complaints, HOPI, past history, examination, plan — while they are
 * still speaking. Shared by the clerking, the progress note and the discharge summary; each
 * screen supplies its sections and what "sorting" means for it (`route`).
 *
 * Every line that carries a number, or sits in a drug section, is marked "check" — amber until
 * the resident confirms it on the card.
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

type SessionState = "connecting" | "listening" | "sorting" | "stopping" | "error";

export const needsCheck = (line: string, drug?: boolean) => !!drug || /\d/.test(line);

export default function LiveDictation({
  patientId,
  title,
  example,
  sections,
  route,
  onLines,
  onClose,
  onUnavailable,
}: {
  patientId: string;
  title: string;
  example: string;
  sections: LiveSection[];
  /** Sort one pause of transcript. Resolves with the lines to show (and, for the clerking, after
   *  filing them). */
  route: (text: string) => Promise<{ lines: LiveLine[]; error?: string }>;
  /** Drop the sorted lines into the screen's own cards. */
  onLines?: (lines: LiveLine[]) => void;
  onClose: () => void;
  /** Live could not start (no token, no signal) — the caller falls back instead of showing an
   *  error here. */
  onUnavailable?: () => void;
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
  const onUnavailableRef = useRef(onUnavailable);
  useEffect(() => {
    routeRef.current = route;
    onLinesRef.current = onLines;
    onUnavailableRef.current = onUnavailable;
  });

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
      // On one bar of signal the token request can hang for a minute; four seconds is enough
      // for a working connection.
      const abort = new AbortController();
      const timer = setTimeout(() => abort.abort(), 4000);
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
        if (onUnavailableRef.current) return onUnavailableRef.current();
        setState("error");
        setMessage(e instanceof Error && e.name !== "AbortError" ? e.message : "Could not start live dictation.");
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
    };
  }, [patientId, routeBuffered]);

  async function finish() {
    sessionRef.current?.stop();
    sessionRef.current = null;
    setState("stopping");
    // The last words may still be a partial — keep them rather than drop them.
    if (partial) finalBufRef.current = `${finalBufRef.current} ${partial}`.trim();
    for (let i = 0; i < 80 && routingRef.current; i++) await new Promise((r) => setTimeout(r, 100));
    await routeBuffered();
    onClose();
  }

  const listening = state === "listening" || state === "sorting";
  const filledCount = sections.filter((s) => s.existing?.trim() || lines.some((l) => l.section === s.key)).length;

  // Portalled to <body>: the bedside mic lives in a blurred fixed bar, and a backdrop-filter
  // ancestor would trap this "full-screen" panel inside the bar.
  return createPortal(
    <div className="fixed inset-0 z-50 flex flex-col bg-background">
      <header className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
        <div className="min-w-0">
          <p className="truncate text-subhead font-semibold">{title}</p>
          <p className="text-caption text-muted">
            {state === "connecting" && "Starting the microphone…"}
            {state === "listening" && "Listening — speak in any order, pause between thoughts"}
            {state === "sorting" && "Listening — placing the last thought…"}
            {state === "stopping" && "Placing the last words…"}
            {state === "error" && "Live dictation unavailable"}
            {state !== "connecting" && state !== "error" && ` · ${filledCount} of ${sections.length} filled`}
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
          Stop and review the cards
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
  const offered = sections.map(({ key, label }) => ({
    key,
    label,
    hint: HINTS[key] ?? (key.startsWith("vital:") ? "the value only" : undefined),
  }));
  return async (text: string): Promise<{ lines: LiveLine[]; error?: string }> => {
    const r = await fetch(`/api/patients/${patientId}/route-dictation`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, sections: offered }),
    });
    const data = (await r.json()) as { lines?: LiveLine[]; error?: string };
    return { lines: data.lines ?? [], error: data.error };
  };
}

/** What goes where, for the sections whose label alone is ambiguous to the sorter. */
const HINTS: Record<string, string> = {
  complaints: "fresh complaints and overnight events, in the patient's or doctor's words",
  sensorium: "conscious, oriented, drowsy, GCS",
  "vital:BP": "blood pressure — the value only",
  "vital:PR": "pulse rate — the value only",
  "vital:RR": "respiratory rate — the value only",
  "vital:Temp": "temperature, or afebrile — the value only",
  "vital:SpO2": "oxygen saturation and on what support — the value only",
  "vital:GRBS": "capillary blood sugar — the value only",
  "vital:ICU": "ICU / HDU support: vasopressor, ventilator, HFNC",
  flatus: 'exactly "Passed" or "Not passed"',
  stool: 'exactly "Passed" or "Not passed"',
  assessment: "the doctor's overall impression today: stable, improving, deteriorating",
  plan: "each job, investigation, referral or management step for today — one line each",
  indication: "why the patient was admitted",
  clinicalCourse: "what happened during the stay: surgery, recovery, events",
  condition: "the patient's condition at discharge",
  primaryCareActions: "what the local doctor should do or check after discharge",
  patientActions: "follow-up visits and what the patient must do",
  meds: "each drug the patient is on, with dose, route and frequency — one line each",
  medications: "discharge drugs with dose and frequency — one line each",
  other: "anything else worth recording that fits no other section",
};
