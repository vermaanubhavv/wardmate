import { buildDeepgramParams } from "@/lib/transcription/buildDeepgramUrl";

/**
 * Live dictation transport — the browser streams the microphone straight to Deepgram
 * Nova-3 Medical over a WebSocket and gets partial + final transcripts back as it speaks.
 *
 * This is the ONLY streaming path in WardMate. Every other "Speak" button records a whole clip
 * and POSTs it to /api/transcribe (one prerecorded pass of whatever STT_PROVIDER is set to).
 * That path is untouched; this one exists for the case-history "dictate the whole clerking"
 * flow, where the words have to land in the right card while the resident is still talking.
 *
 * Auth: the server mints a 30-second Deepgram token (/api/transcribe/live-token) and the
 * browser opens the socket with it as a WebSocket subprotocol — `new WebSocket(url, ["token",
 * <token>])` — because a browser cannot set an Authorization header on a WebSocket. The
 * long-lived DEEPGRAM_API_KEY never reaches the client.
 *
 * Keyterms (the per-patient medical vocabulary) are fixed when the socket opens — Nova-3
 * cannot change them mid-session — so they are chosen server-side and passed in here.
 */

export const DEEPGRAM_WSS = "wss://api.deepgram.com/v1/listen";

export type LiveDictationHandlers = {
  /** Speech detected — for the "listening" animation. */
  onSpeechStart?: () => void;
  /** An interim, still-changing transcript for the current utterance. */
  onPartial?: (text: string) => void;
  /** A finalised span of transcript. Accumulate these until onUtteranceEnd. */
  onFinal?: (text: string) => void;
  /** A natural pause. Everything received since the last one is a complete thought — this is
   *  when the caller routes the accumulated text into a card. */
  onUtteranceEnd?: () => void;
  /** Fatal — the caller should fall back to the per-card record-then-transcribe buttons. */
  onError?: (message: string) => void;
  /** Connection opened / closed, for the status line. */
  onOpen?: () => void;
  onClose?: () => void;
};

export type LiveDictationSession = {
  /** Stop the microphone and close the socket. Idempotent. */
  stop: () => void;
  /** True between start and stop. */
  readonly active: boolean;
};

type DeepgramMessage = {
  type?: string;
  is_final?: boolean;
  speech_final?: boolean;
  channel?: { alternatives?: { transcript?: string }[] };
};

const MIME_CANDIDATES = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4"];

function pickMime(): string | null {
  if (typeof MediaRecorder === "undefined") return null;
  return MIME_CANDIDATES.find((t) => MediaRecorder.isTypeSupported(t)) ?? null;
}

/**
 * Open a live dictation session. Resolves once the microphone is live and the socket is
 * connecting; rejects if the mic is blocked. Transcripts arrive through the handlers.
 */
export async function openLiveDictation(
  opts: {
    token: string;
    keyterms: string[];
  } & LiveDictationHandlers
): Promise<LiveDictationSession> {
  const { token, keyterms, ...h } = opts;

  let stream: MediaStream;
  try {
    stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  } catch {
    throw new Error("Microphone blocked — allow it for this site in your browser settings.");
  }

  const mime = pickMime();
  if (!mime) {
    stream.getTracks().forEach((t) => t.stop());
    throw new Error("This browser cannot stream audio. Use the Speak button on each card instead.");
  }

  const params = buildDeepgramParams(keyterms, {
    model: "nova-3-medical",
    language: "en-IN",
    extra: {
      smart_format: true,
      interim_results: true,
      // A finalised utterance is emitted after ~1.5 s of silence; UtteranceEnd fires with it.
      utterance_end_ms: 1500,
      vad_events: true,
    },
  });
  const url = `${DEEPGRAM_WSS}?${params.toString()}`;

  let closed = false;
  let recorder: MediaRecorder | null = null;
  const ws = new WebSocket(url, ["token", token]);
  ws.binaryType = "arraybuffer";

  const teardown = () => {
    if (closed) return;
    closed = true;
    try {
      if (recorder && recorder.state !== "inactive") recorder.stop();
    } catch {
      /* already stopped */
    }
    stream.getTracks().forEach((t) => t.stop());
    if (ws.readyState === WebSocket.OPEN) {
      try {
        ws.send(JSON.stringify({ type: "CloseStream" }));
      } catch {
        /* ignore */
      }
    }
    try {
      ws.close();
    } catch {
      /* ignore */
    }
    h.onClose?.();
  };

  ws.onopen = () => {
    h.onOpen?.();
    recorder = new MediaRecorder(stream, { mimeType: mime });
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0 && ws.readyState === WebSocket.OPEN) ws.send(e.data);
    };
    recorder.start(250);
    // Keep Deepgram's socket alive during long silences.
    const ping = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify({ type: "KeepAlive" }));
      else clearInterval(ping);
    }, 8000);
  };

  ws.onmessage = (evt) => {
    let msg: DeepgramMessage;
    try {
      msg = JSON.parse(typeof evt.data === "string" ? evt.data : "") as DeepgramMessage;
    } catch {
      return;
    }
    if (msg.type === "SpeechStarted") {
      h.onSpeechStart?.();
      return;
    }
    if (msg.type === "UtteranceEnd") {
      h.onUtteranceEnd?.();
      return;
    }
    if (msg.type === "Results" || msg.channel) {
      const text = msg.channel?.alternatives?.[0]?.transcript?.trim() ?? "";
      if (!text) return;
      if (msg.is_final) h.onFinal?.(text);
      else h.onPartial?.(text);
    }
  };

  ws.onerror = () => {
    if (!closed) h.onError?.("Live transcription dropped. Falling back to the card buttons.");
    teardown();
  };
  ws.onclose = () => teardown();

  return {
    stop: teardown,
    get active() {
      return !closed;
    },
  };
}
