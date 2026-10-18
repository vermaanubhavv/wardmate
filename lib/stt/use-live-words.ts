"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { openLiveDictation, type LiveDictationSession } from "./live";

export type LiveWordsState = "off" | "connecting" | "live" | "unavailable";

/**
 * The words of a recording as they are said, for the recording sheet (app/recording-sheet.tsx).
 *
 * It listens on a microphone the caller already holds — the caller may be recording the same
 * stream at the same time (the unit round keeps its recording as the record) — and hands each
 * finished thought to `onPause` at the speaker's pause. `finish()` stops listening and hands
 * over whatever was still being said.
 *
 * The full-screen panel (app/patients/[id]/live-dictation.tsx) does the same over its own
 * microphone; it sorts into sections and has no recording beside it, so it keeps its own copy.
 */
export function useLiveWords(
  stream: MediaStream | null,
  opts: {
    /** The patient's vocabulary; without one the unit's. */
    patientId?: string;
    /** One finished thought. Runs one at a time, in order. */
    onPause?: (text: string) => Promise<void> | void;
    /** Live words could not start or dropped; the caller decides what happens to the rest. */
    onUnavailable?: () => void;
  } = {}
) {
  const [state, setState] = useState<LiveWordsState>("off");
  const [heard, setHeard] = useState<string[]>([]);
  const [current, setCurrent] = useState("");

  const optsRef = useRef(opts);
  useEffect(() => {
    optsRef.current = opts;
  });
  const sessionRef = useRef<LiveDictationSession | null>(null);
  const bufRef = useRef("");
  const partialRef = useRef("");
  const chainRef = useRef<Promise<void>>(Promise.resolve());

  const pause = useCallback(() => {
    const text = `${bufRef.current} ${partialRef.current}`.trim();
    bufRef.current = "";
    partialRef.current = "";
    setCurrent("");
    if (!text) return;
    setHeard((h) => [...h, text]);
    chainRef.current = chainRef.current.then(async () => {
      try {
        await optsRef.current.onPause?.(text);
      } catch {
        // The caller's own error handling has the say; one failed thought must not stop the next.
      }
    });
  }, []);

  const patientId = opts.patientId;
  useEffect(() => {
    if (!stream) return;
    let cancelled = false;
    const unavailable = () => {
      if (cancelled) return;
      setState("unavailable");
      optsRef.current.onUnavailable?.();
    };
    (async () => {
      setState("connecting");
      setHeard([]);
      setCurrent("");
      bufRef.current = "";
      partialRef.current = "";
      // On one bar of signal the token request can hang for a minute; six seconds covers a cold
      // server on a slow phone and still gives up within a breath.
      const abort = new AbortController();
      const timer = setTimeout(() => abort.abort(), 6000);
      let token: string;
      let keyterms: string[];
      try {
        const res = await fetch("/api/transcribe/live-token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(patientId ? { patientId } : {}),
          signal: abort.signal,
        });
        const data = (await res.json()) as { token?: string; keyterms?: string[] };
        if (!res.ok || !data.token) throw new Error();
        token = data.token;
        keyterms = data.keyterms ?? [];
      } catch {
        return unavailable();
      } finally {
        clearTimeout(timer);
      }
      if (cancelled) return;
      try {
        sessionRef.current = await openLiveDictation({
          token,
          keyterms,
          stream,
          onOpen: () => !cancelled && setState("live"),
          onPartial: (t) => {
            partialRef.current = t;
            if (!cancelled) setCurrent(`${bufRef.current} ${t}`.trim());
          },
          onFinal: (t) => {
            bufRef.current = `${bufRef.current} ${t}`.trim();
            partialRef.current = "";
            if (!cancelled) setCurrent(bufRef.current);
          },
          onUtteranceEnd: () => !cancelled && pause(),
          onError: () => {
            // Keep what was half-said rather than lose it with the socket.
            if (!cancelled) pause();
            unavailable();
          },
        });
      } catch {
        unavailable();
      }
    })();
    return () => {
      cancelled = true;
      sessionRef.current?.stop();
      sessionRef.current = null;
      setState("off");
    };
  }, [stream, patientId, pause]);

  /** Stop listening, hand over the last words, and wait for every thought to be dealt with. */
  const finish = useCallback(async () => {
    sessionRef.current?.stop();
    sessionRef.current = null;
    pause();
    await chainRef.current;
  }, [pause]);

  return { state: stream ? state : "off", heard, current, finish };
}
