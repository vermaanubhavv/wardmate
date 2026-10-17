"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  discardRecording,
  flush,
  listWaiting,
  recoverInterruptedChunks,
  type Pending,
} from "@/lib/outbox";
import { usePublishedHeight } from "@/lib/use-published-height";

/**
 * Whether the app is online, what is waiting to be sent, and — when offline — a warning that
 * the screen is not live.
 *
 * That last part is the reason this exists rather than a quiet spinner. Pages are cached now,
 * so with no signal the ward still appears, looking exactly as it does when it is current. A
 * stale drain output the resident knows is stale is useful; one they believe is live is
 * dangerous. So the bar names the time the screen was fetched.
 *
 * The queue is flushed here, in the page, rather than by the service worker: iOS gives a web
 * app no dependable background execution, and a queue that re-sent a recording unattended
 * could double-record a drug. It runs when the app opens, when the connection returns, and
 * when the app comes back to the foreground — the three moments a resident is actually
 * looking at it.
 */

/**
 * Whether the browser thinks it has a connection, read as an external store rather than
 * mirrored into state. Mirroring meant setting state inside an effect on every mount, which
 * costs a second render of every screen in the app — the wrong tax for a bar that is usually
 * invisible. The server has no opinion, so it renders as online and corrects on hydration.
 */
function subscribeOnline(cb: () => void) {
  window.addEventListener("online", cb);
  window.addEventListener("offline", cb);
  return () => {
    window.removeEventListener("online", cb);
    window.removeEventListener("offline", cb);
  };
}
export const useOnline = () =>
  useSyncExternalStore(
    subscribeOnline,
    () => navigator.onLine,
    () => true
  );

export default function ConnectionBar({ renderedAt }: { renderedAt: string }) {
  const router = useRouter();
  const online = useOnline();
  // What is waiting to send, one row each, so each can be retried or thrown away on its own.
  const [waiting, setWaiting] = useState<(Pending & { sending: boolean })[]>([]);
  const pending = waiting.length;
  // The recording whose Delete was tapped once: it asks before it destroys anything.
  const [confirmingDelete, setConfirmingDelete] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [reviews, setReviews] = useState<string[]>([]);
  const [recovered, setRecovered] = useState(0);
  // When the screen on show came out of the offline cache while the phone still had some
  // signal — the service worker gives the network three seconds, then shows the saved copy.
  // `navigator.onLine` is true on one bar, so without this the bar would say nothing at all.
  const [savedAt, setSavedAt] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setWaiting(await listWaiting());
  }, []);

  // A recording whose recorder was killed mid-sentence (no pagehide fired) leaves its
  // second-by-second chunks behind. Reassemble them into ordinary queue items on open, so the
  // words are not lost just because the tab died.
  const recover = useCallback(async () => {
    const items = await recoverInterruptedChunks();
    if (items.length > 0) {
      setRecovered((n) => n + items.length);
      await refresh();
    }
  }, [refresh]);

  // Read through a ref, not state: `send` must keep one identity. When it changed with every
  // sending/not-sending flip, the effect below that sends on mount re-ran at the end of every
  // flush, and a recording the server refused went straight back out — in a tight loop.
  const sendingRef = useRef(false);

  // `asked` is a resident pressing Try again: that tries even when the phone reports no
  // connection (the phone is sometimes wrong, and the press is the resident's call), and it
  // retries a recording the server refused before. The automatic sends do neither.
  const send = useCallback(async (asked = false) => {
    if ((!navigator.onLine && !asked) || sendingRef.current) return;
    if ((await listWaiting()).length === 0) return;

    sendingRef.current = true;
    setSending(true);
    const result = await flush({ retryRefused: asked });
    sendingRef.current = false;
    setSending(false);
    await refresh();

    if (result.reviews.length > 0) setReviews((r) => [...r, ...result.reviews]);
    // Anything that landed changed a patient, so the screen behind this is now out of date.
    if (result.sent > 0) router.refresh();
  }, [refresh, router]);

  // Runs on mount, and again whenever the connection comes back — `online` is a dependency,
  // so returning from a dead corridor triggers the send without an event listener of its own.
  // refresh() awaits IndexedDB before it sets anything, so this is an async read on mount
  // rather than a synchronous cascade — and there is no other moment to learn what a previous
  // session left queued. The rule cannot tell the two apart.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    void recover().then(() => {
      void refresh();
      if (online) void send();
    });
  }, [online, recover, refresh, send]);
  /* eslint-enable react-hooks/set-state-in-effect */

  // The service worker stamps a page it served from the cache (public/sw.js). Screens tapped
  // to inside the app are told by message instead, below.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    const stamp = document.querySelector('meta[name="wm-saved-at"]');
    if (stamp) setSavedAt(stamp.getAttribute("content") || renderedAt);
  }, [renderedAt]);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    const told = (e: MessageEvent) => {
      if (e.data?.type !== "screen") return;
      setSavedAt(e.data.fromCache ? (e.data.date ?? renderedAt) : null);
    };
    navigator.serviceWorker.addEventListener("message", told);
    return () => navigator.serviceWorker.removeEventListener("message", told);
  }, [renderedAt]);

  useEffect(() => {
    // Coming back to the foreground is the moment a resident has walked somewhere with signal.
    const woke = () => {
      if (document.visibilityState === "visible") {
        void recover();
        void refresh();
        void send();
      }
    };
    document.addEventListener("visibilitychange", woke);
    // Recorders announce a queued item so the count appears without waiting for a reload.
    window.addEventListener("outbox-changed", refresh as EventListener);

    return () => {
      document.removeEventListener("visibilitychange", woke);
      window.removeEventListener("outbox-changed", refresh as EventListener);
    };
  }, [recover, refresh, send]);

  const discard = useCallback(
    async (id: string) => {
      setConfirmingDelete(null);
      await discardRecording(id);
      await refresh();
    },
    [refresh]
  );

  // Its own height, published so the sticky headers below sit under it rather than under the
  // clock — and drop the status-bar padding this bar already provides (globals.css, .top-bar).
  const barRef = usePublishedHeight("--top-inset", 0, TOP_SAFE_COVERED);

  // Nothing to say: online, nothing queued, nothing to review, nothing recovered.
  if (online && !savedAt && pending === 0 && reviews.length === 0 && !sending && recovered === 0)
    return null;

  const fetched = new Date(savedAt ?? renderedAt).toLocaleTimeString("en-IN", {
    timeZone: "Asia/Kolkata",
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <div
      ref={barRef}
      className={
        // The first thing on the page, so on a notched iPhone it starts under the clock unless it
        // clears the safe area itself. Sticky, so a scrolled page's header never slides under it.
        "sticky top-0 z-30 px-4 pb-2 pt-[calc(0.5rem+env(safe-area-inset-top))] text-footnote print:hidden " +
        (online && !savedAt ? "bg-chip text-foreground" : "bg-warn-fg text-accent-ink")
      }
      role="status"
    >
      {!online && (
        <p>
          <span className="font-semibold">No signal.</span> This screen is as it was at{" "}
          {fetched} — it may be out of date. Anything you record is saved on this phone.
        </p>
      )}

      {online && savedAt && (
        <p>
          <span className="font-semibold">Weak signal.</span> This screen is as it was at{" "}
          {fetched} — it may be out of date.{" "}
          <button onClick={() => router.refresh()} className="tap font-semibold underline">
            Try again
          </button>
        </p>
      )}

      {recovered > 0 && (
        <p className={sending || pending > 0 ? "mb-1" : ""}>
          {recovered === 1 ? "An unfinished recording was" : `${recovered} unfinished recordings were`}{" "}
          recovered from a closed session.
        </p>
      )}

      {sending && <p>Sending {pending === 1 ? "1 recording" : `${pending} recordings`}…</p>}

      {!sending && pending > 0 && (
        <ul className="mt-1 flex flex-col gap-1.5">
          {waiting.map((item) =>
            confirmingDelete === item.id ? (
              <li key={item.id} className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <span className="flex-1">
                  Delete this {item.label.toLowerCase() || "recording"}? It has not been sent and
                  cannot be recovered.
                </span>
                <button onClick={() => void discard(item.id)} className="tap font-semibold underline">
                  Delete
                </button>
                <button onClick={() => setConfirmingDelete(null)} className="tap font-semibold underline">
                  Keep
                </button>
              </li>
            ) : item.sending ? (
              <li key={item.id}>
                {item.label || "Recording"}, {timeOf(item.queuedAt)} — sending…
              </li>
            ) : (
              <li key={item.id} className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <span className="flex-1">
                  {item.label || "Recording"}, {timeOf(item.queuedAt)} —{" "}
                  {item.attempts > 0
                    ? "not sent: the server turned it down."
                    : online
                      ? "not sent yet."
                      : "saved on this phone, sends when you are back online."}
                </span>
                <button onClick={() => void send(true)} className="tap font-semibold underline">
                  Try again
                </button>
                <button onClick={() => setConfirmingDelete(item.id)} className="tap font-semibold underline">
                  Delete
                </button>
              </li>
            )
          )}
        </ul>
      )}

      {reviews.length > 0 && (
        <p className="mt-1">
          {reviews.length === 1 ? "A dictation" : `${reviews.length} dictations`} came through
          and {reviews.length === 1 ? "needs" : "need"} checking:{" "}
          {reviews.map((id, i) => (
            <span key={id}>
              {i > 0 && ", "}
              <Link href={`/round/${id}`} className="font-semibold underline">
                review{reviews.length > 1 ? ` ${i + 1}` : ""}
              </Link>
            </span>
          ))}
        </p>
      )}
    </div>
  );
}

/** Set while the bar shows: it already clears the status bar, so headers below must not. */
const TOP_SAFE_COVERED = { "--top-safe": "0px" };

function timeOf(iso: string) {
  return new Date(iso).toLocaleTimeString("en-IN", {
    timeZone: "Asia/Kolkata",
    hour: "numeric",
    minute: "2-digit",
  });
}
