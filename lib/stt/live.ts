import { buildDeepgramParams } from "@/lib/transcription/buildDeepgramUrl";

/**
 * Live dictation transport — the browser streams the microphone straight to Deepgram
 * Nova-3 Medical over a WebSocket and gets partial + final transcripts back as it speaks.
 *
 * This is the ONLY streaming path in WardMate. Every other "Speak" button records a whole clip
 * and POSTs it to /api/transcribe (one prerecorded Deepgram pass).
 * That path is untouched; this one serves the bedside mic and the live dictation panel
 * (app/patients/[id]/live-dictation.tsx — clerking, progress note, discharge), where the words
 * have to land in the right section while the resident is still talking.
 *
 * Auth: the server mints a 30-second Deepgram token (/api/transcribe/live-token) and the
 * browser opens the socket with it as a WebSocket subprotocol, because a browser cannot set an
 * Authorization header on a WebSocket. A /v1/auth/grant token is a bearer token, so the
 * subprotocol is `["bearer", <token>]` — `["token", …]` is only for a raw API key, and with a
 * grant token Deepgram refused every handshake (live dictation silently fell back, always).
 * The long-lived DEEPGRAM_API_KEY never reaches the client.
 *
 * Audio: raw 16-bit PCM from an AudioContext, not MediaRecorder chunks. iOS Safari can only
 * record audio/mp4, which does not stream; PCM is the same on every browser and web view.
 *
 * Rescue: when the caller passes `onRescued`, the phone also records locally until the socket
 * is open, and again from the moment it drops. Whatever was said while live was not working
 * is transcribed in one prerecorded pass (/api/transcribe) when the session stops, and handed
 * back through onRescued — so a lost link costs a delay, never the words.
 *
 * Keyterms (the per-patient medical vocabulary) are fixed when the socket opens — Nova-3
 * cannot change them mid-session — so they are chosen server-side and passed in here.
 */

const DEEPGRAM_WSS = "wss://api.deepgram.com/v1/listen";

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
  /** Opt in to the rescue recording: the text of whatever was said while live was not
   *  connected, delivered once after stop(). With it, a dropped link calls onLinkLost instead
   *  of onError and the microphone keeps recording. */
  onRescued?: (text: string) => void;
  /** Live link lost (or never made) but the rescue recording is running. */
  onLinkLost?: (message: string) => void;
};

export type LiveDictationSession = {
  /** Stop the microphone and close the socket. Idempotent. Resolves once any rescue
   *  recording has been transcribed and handed to onRescued. */
  stop: () => Promise<void>;
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

/** Float samples → little-endian 16-bit PCM, what `encoding=linear16` expects. */
function toPcm16(input: Float32Array): ArrayBuffer {
  const out = new DataView(new ArrayBuffer(input.length * 2));
  for (let i = 0; i < input.length; i++) {
    const v = Math.max(-1, Math.min(1, input[i]));
    out.setInt16(i * 2, v < 0 ? v * 0x8000 : v * 0x7fff, true);
  }
  return out.buffer;
}

/**
 * Open a live dictation session. Resolves once the microphone is live and the socket is
 * connecting; rejects if the mic is blocked. Transcripts arrive through the handlers.
 */
export async function openLiveDictation(
  opts: {
    token: string;
    keyterms: string[];
    /** A microphone the caller already holds. iOS mutes the first audio track when a second
     *  getUserMedia opens, so a caller that is also recording passes its own stream; the caller
     *  then owns it, and stop() leaves it running. */
    stream?: MediaStream;
  } & LiveDictationHandlers
): Promise<LiveDictationSession> {
  const { token, keyterms, stream: given, ...h } = opts;

  let stream: MediaStream;
  if (given) stream = given;
  else {
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      throw new Error("Microphone blocked — allow it for this site in your browser settings.");
    }
  }
  const releaseMic = () => {
    if (!given) stream.getTracks().forEach((t) => t.stop());
  };

  const AudioCtx = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioCtx) {
    releaseMic();
    throw new Error("This browser cannot stream audio. Use the Speak button on each card instead.");
  }
  const ctx = new AudioCtx();
  // iOS starts an AudioContext suspended; this runs inside the tap that opened the panel.
  void ctx.resume().catch(() => {});

  const params = buildDeepgramParams(keyterms, {
    smart_format: true,
    interim_results: true,
    // UtteranceEnd after 1 s of silence (Deepgram's minimum) — each thought lands in its
    // section as soon as the resident pauses.
    utterance_end_ms: 1000,
    vad_events: true,
    encoding: "linear16",
    sample_rate: ctx.sampleRate,
    channels: 1,
  });
  const url = `${DEEPGRAM_WSS}?${params.toString()}`;

  let closed = false;
  let opened = false;
  let ping: ReturnType<typeof setInterval> | undefined;
  const ws = new WebSocket(url, ["bearer", token]);
  ws.binaryType = "arraybuffer";

  // ponytail: ScriptProcessorNode is deprecated but runs in every browser and iOS web view
  // without a separate worklet file; move to an AudioWorklet if it is ever removed.
  const source = ctx.createMediaStreamSource(stream);
  const processor = ctx.createScriptProcessor(4096, 1, 1);
  processor.onaudioprocess = (e) => {
    if (ws.readyState === WebSocket.OPEN) ws.send(toPcm16(e.inputBuffer.getChannelData(0)));
  };
  source.connect(processor);
  processor.connect(ctx.destination);

  // --- rescue recording ------------------------------------------------------------------
  const mime = pickMime();
  let rescue: MediaRecorder | null = null;
  let rescueChunks: Blob[] = [];
  let rescued = false; // something was recorded that live never transcribed
  const startRescue = () => {
    if (!h.onRescued || !mime || rescue) return;
    try {
      // Each recorder fills its own array, so a late chunk from one dropped at connect time
      // never leaks into a later rescue clip.
      const chunks: Blob[] = [];
      rescueChunks = chunks;
      rescue = new MediaRecorder(stream, { mimeType: mime });
      rescue.ondataavailable = (e) => e.data.size > 0 && chunks.push(e.data);
      rescue.start(1000);
    } catch {
      rescue = null;
    }
  };
  const stopRescue = (): Promise<Blob | null> =>
    new Promise((resolve) => {
      const r = rescue;
      rescue = null;
      if (!r || r.state === "inactive") return resolve(rescueChunks.length ? new Blob(rescueChunks, { type: mime ?? "" }) : null);
      const chunks = rescueChunks;
      r.onstop = () => resolve(chunks.length ? new Blob(chunks, { type: mime ?? "" }) : null);
      r.stop();
    });
  startRescue();

  /** The link failed: with a rescue running, keep the mic and say so; without, give up. */
  const linkFailed = (message: string) => {
    if (closed) return;
    clearInterval(ping);
    if (h.onRescued && mime) {
      rescued = true;
      startRescue();
      h.onLinkLost?.("Live link lost — still recording. What you say is written up when you tap Done.");
    } else {
      h.onError?.(message);
      void teardown();
    }
  };

  const teardown = async () => {
    if (closed) return;
    closed = true;
    clearTimeout(openTimer);
    clearInterval(ping);
    try {
      processor.disconnect();
      source.disconnect();
      void ctx.close();
    } catch {
      /* already closed */
    }
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
    const blob = await stopRescue();
    releaseMic();
    h.onClose?.();
    if (blob && rescued && h.onRescued) {
      try {
        const form = new FormData();
        form.set("audio", blob, `rescue.${mime?.includes("mp4") ? "mp4" : "webm"}`);
        const res = await fetch("/api/transcribe", { method: "POST", body: form });
        const data = (await res.json()) as { text?: string };
        if (data.text?.trim()) h.onRescued(data.text.trim());
      } catch {
        /* no signal either — nothing more can be done */
      }
    }
  };

  // On weak signal the socket can sit in CONNECTING with no error and no close. Give it a few
  // seconds, then hand over (to the rescue recording, or the caller's fallback).
  const openTimer = setTimeout(() => {
    if (closed || ws.readyState === WebSocket.OPEN) return;
    linkFailed("Live transcription could not connect. Falling back to the card buttons.");
  }, 5000);

  ws.onopen = () => {
    clearTimeout(openTimer);
    if (closed) return;
    opened = true;
    h.onOpen?.();
    // Live is up: what the rescue heard while connecting is only the first second or two —
    // drop it unless the link had already been given up on.
    if (!rescued) {
      void stopRescue();
      rescueChunks = [];
    }
    // Keep Deepgram's socket alive during long silences.
    ping = setInterval(() => {
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

  ws.onerror = () => linkFailed("Live transcription dropped. Falling back to the card buttons.");
  // A close we did not ask for is a dropped link too.
  ws.onclose = () => {
    if (!closed) linkFailed(opened ? "Live transcription dropped." : "Live transcription could not connect.");
  };

  return {
    stop: teardown,
    get active() {
      return !closed;
    },
  };
}
