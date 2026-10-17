"use client";

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { countPending, flush, recoverInterruptedChunks } from "@/lib/outbox";

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

export default function ConnectionBar({ renderedAt }: { renderedAt: string }) {
  const router = useRouter();
  const online = useSyncExternalStore(
    subscribeOnline,
    () => navigator.onLine,
    () => true
  );
  const [pending, setPending] = useState(0);
  const [sending, setSending] = useState(false);
  const [reviews, setReviews] = useState<string[]>([]);
  const [recovered, setRecovered] = useState(0);
  // When the screen on show came out of the offline cache while the phone still had some
  // signal — the service worker gives the network three seconds, then shows the saved copy.
  // `navigator.onLine` is true on one bar, so without this the bar would say nothing at all.
  const [savedAt, setSavedAt] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setPending(await countPending());
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

  const send = useCallback(async () => {
    if (!navigator.onLine || sending) return;
    if ((await countPending()) === 0) return;

    setSending(true);
    const result = await flush();
    setSending(false);
    await refresh();

    if (result.reviews.length > 0) setReviews((r) => [...r, ...result.reviews]);
    // Anything that landed changed a patient, so the screen behind this is now out of date.
    if (result.sent > 0) router.refresh();
  }, [sending, refresh, router]);

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

  // A document served from the cache carries the render time of when it was cached, so on
  // opening it reads as minutes or hours old; a live one is seconds old. The minute of slack is
  // for a phone clock that is a little off. Screens tapped to inside the app are told by the
  // service worker instead, which knows when it answered from the cache.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (Date.now() - new Date(renderedAt).getTime() > 60_000) setSavedAt(renderedAt);
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
      className={
        // The first thing on the page, so on a notched iPhone it starts under the clock unless it
        // clears the safe area itself, the way every .top-bar header does.
        "px-4 pb-2 pt-[calc(0.5rem+env(safe-area-inset-top))] text-footnote print:hidden " +
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

      {online && sending && <p>Sending {pending === 1 ? "1 recording" : `${pending} recordings`}…</p>}

      {online && !sending && pending > 0 && (
        <p>
          {pending === 1 ? "1 recording" : `${pending} recordings`} still to send.{" "}
          <button onClick={() => void send()} className="tap font-semibold underline">
            Try now
          </button>
        </p>
      )}

      {!online && pending > 0 && (
        <p className="mt-1">
          {pending === 1 ? "1 recording" : `${pending} recordings`} waiting — they will go when
          you are back online.
        </p>
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
