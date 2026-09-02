"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { MicIcon, StopIcon } from "@/app/icons";
import { IconCheck } from "../card-kit";
import { openLiveDictation, type LiveDictationSession } from "@/lib/stt/live";
import { HELD_SECTIONS, type RoutedSegment } from "@/lib/case-history-sections";

/**
 * "Dictate the whole clerking" — the resident talks, Nova-3 Medical transcribes live, and each
 * pause-delimited thought is sorted into its card as they speak. A running overview shows what
 * is covered and what is still to say.
 *
 * Nothing here is a final card. It appends to the case history; the workspace behind it is what
 * the resident then reviews and saves. On close the workspace refreshes so every card reflects
 * what was dictated.
 */

type SessionState = "connecting" | "listening" | "sorting" | "paused" | "error";

const OVERVIEW: { key: string; label: string }[] = [
  { key: "complaints", label: "Complaints" },
  { key: "hopi", label: "History of each complaint" },
  { key: "past", label: "Past history" },
  { key: "family", label: "Family history" },
  { key: "medication", label: "Medication history" },
  { key: "surgical", label: "Surgical history" },
  { key: "obstetric", label: "Menstrual & obstetric" },
  { key: "examination", label: "General examination & vitals" },
  { key: "abdomen", label: "Per abdomen" },
  { key: "chest", label: "Chest" },
  { key: "local", label: "Local examination" },
  { key: "diagnosis", label: "Provisional diagnosis" },
  { key: "plan", label: "Plan" },
];

export default function DictationOverlay({
  patientId,
  initialFilled,
  initialComplaints,
  onClose,
}: {
  patientId: string;
  initialFilled: Record<string, boolean>;
  initialComplaints: string[];
  onClose: () => void;
}) {
  const [state, setState] = useState<SessionState>("connecting");
  const [message, setMessage] = useState<string | null>(null);
  const [partial, setPartial] = useState("");
  const [bufText, setBufText] = useState("");
  const [filled, setFilled] = useState<Record<string, boolean>>(initialFilled);
  const [recent, setRecent] = useState<Set<string>>(new Set());
  const [heard, setHeard] = useState<{ section: string; text: string }[]>([]);

  const sessionRef = useRef<LiveDictationSession | null>(null);
  const finalBufRef = useRef<string>("");
  const complaintsRef = useRef<string[]>([...initialComplaints]);
  const routingRef = useRef(false);

  const routeBuffered = useCallback(async () => {
    // Already sorting a chunk — leave the buffer; the next pause (or finish()) takes it.
    if (routingRef.current) return;
    const text = finalBufRef.current.trim();
    if (!text) return;
    finalBufRef.current = "";
    setBufText("");
    routingRef.current = true;
    setState("sorting");
    try {
      const r = await fetch(`/api/patients/${patientId}/case-history/route-dictation`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, knownComplaints: complaintsRef.current }),
      });
      const data = (await r.json()) as { segments?: RoutedSegment[]; error?: string };
      if (data.error) setMessage(data.error);
      const segments = data.segments ?? [];
      if (segments.length > 0) {
        const touched = new Set<string>();
        for (const s of segments) {
          touched.add(s.section);
          if (s.section === "complaints" && !complaintsRef.current.some((c) => c.toLowerCase() === s.text.toLowerCase())) {
            complaintsRef.current = [...complaintsRef.current, s.text];
          }
          if (HELD_SECTIONS.has(s.section)) {
            setHeard((h) => [...h, { section: s.section, text: s.text }]);
          }
        }
        setFilled((f) => {
          const next = { ...f };
          for (const k of touched) next[k] = true;
          return next;
        });
        setRecent(touched);
      }
    } catch {
      setMessage("Could not file the last bit — it is still in the transcript below.");
    } finally {
      routingRef.current = false;
      setState((s) => (s === "error" ? s : "listening"));
    }
  }, [patientId]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      let token: string;
      let keyterms: string[];
      try {
        const res = await fetch("/api/transcribe/live-token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ patientId }),
        });
        const data = (await res.json()) as { token?: string; keyterms?: string[]; error?: string };
        if (!res.ok || !data.token) throw new Error(data.error ?? "Could not start live dictation.");
        token = data.token;
        keyterms = data.keyterms ?? [];
      } catch (e) {
        if (!cancelled) {
          setState("error");
          setMessage(e instanceof Error ? e.message : "Could not start live dictation.");
        }
        return;
      }
      if (cancelled) return;

      try {
        sessionRef.current = await openLiveDictation({
          token,
          keyterms,
          onOpen: () => !cancelled && setState("listening"),
          onSpeechStart: () => !cancelled && setState((s) => (s === "sorting" ? s : "listening")),
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
    setState("paused");
    // Wait for any in-flight sort, then file whatever is left in the buffer.
    for (let i = 0; i < 40 && routingRef.current; i++) {
      await new Promise((r) => setTimeout(r, 100));
    }
    await routeBuffered();
    onClose();
  }

  const listening = state === "listening" || state === "sorting";

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background">
      <header className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
        <span className="text-[13px] text-muted">
          {state === "connecting" && "Starting…"}
          {state === "listening" && "Listening — speak in any order"}
          {state === "sorting" && "Sorting that into a card…"}
          {state === "paused" && "Paused"}
          {state === "error" && "Live dictation unavailable"}
        </span>
        <button
          type="button"
          onClick={() => void finish()}
          className="rounded-[10px] bg-accent px-4 py-2 text-[15px] font-semibold text-accent-ink"
        >
          Done
        </button>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        {/* Mic + live words */}
        <div className="flex items-center gap-3">
          <span
            className={
              "relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full " +
              (listening ? "bg-red-500 text-white" : "bg-chip text-muted")
            }
          >
            {listening && (
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-60" />
            )}
            <MicIcon className="relative h-5 w-5" />
          </span>
          <p className="min-h-[2.5rem] flex-1 text-[15px] leading-snug">
            <span className="text-black">{bufText}</span>{" "}
            <span className="text-muted">{partial}</span>
            {!bufText && !partial && (
              <span className="text-muted">
                {state === "error" ? "" : "e.g. “pain right iliac fossa two days… also diabetic ten years…”"}
              </span>
            )}
          </p>
        </div>

        {message && (
          <p className="mt-3 rounded-[10px] bg-chip px-3 py-2 text-[13px] text-muted">
            {message}
            {state === "error" && " The Speak button on each card still works."}
          </p>
        )}

        {/* Running overview */}
        <ul className="mt-5 flex flex-col gap-1">
          {OVERVIEW.map((row) => {
            const done = filled[row.key];
            const now = recent.has(row.key);
            return (
              <li
                key={row.key}
                className={
                  "flex items-center gap-2.5 rounded-[10px] px-3 py-2.5 text-[15px] " +
                  (now ? "bg-accent/10" : "bg-card")
                }
              >
                <span
                  className={
                    "flex h-5 w-5 shrink-0 items-center justify-center rounded-full " +
                    (done ? "bg-accent text-accent-ink" : "border border-line text-transparent")
                  }
                >
                  {done ? <IconCheck className="h-3.5 w-3.5" /> : null}
                </span>
                <span className={done ? "text-black" : "text-muted"}>{row.label}</span>
                {now && <MicIcon className="ml-auto h-4 w-4 text-accent" />}
              </li>
            );
          })}
        </ul>

        {heard.length > 0 && (
          <div className="mt-5">
            <p className="text-[13px] font-semibold text-muted">
              Spoken — check these on the cards after you finish
            </p>
            <ul className="mt-2 flex flex-col gap-1.5">
              {heard.map((h, i) => (
                <li key={i} className="rounded-[10px] bg-chip px-3 py-2 text-[13px]">
                  <span className="font-medium capitalize">{h.section}: </span>
                  {h.text}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <footer className="border-t border-line px-4 py-3">
        <button
          type="button"
          onClick={() => void finish()}
          className="flex w-full items-center justify-center gap-2 rounded-[10px] border border-line py-3 text-[15px] font-medium text-accent"
        >
          <StopIcon className="h-4 w-4" />
          Stop and review the cards
        </button>
      </footer>
    </div>
  );
}
