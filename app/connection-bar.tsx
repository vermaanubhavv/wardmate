"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { countPending, flush } from "@/lib/outbox";

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
export default function ConnectionBar({ renderedAt }: { renderedAt: string }) {
  const router = useRouter();
  const [online, setOnline] = useState(true);
  const [pending, setPending] = useState(0);
  const [sending, setSending] = useState(false);
  const [reviews, setReviews] = useState<string[]>([]);

  const refresh = useCallback(async () => {
    setPending(await countPending());
  }, []);

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

  useEffect(() => {
    setOnline(navigator.onLine);
    void refresh();
    void send();

    const up = () => {
      setOnline(true);
      void send();
    };
    const down = () => setOnline(false);
    // Coming back to the foreground is the moment a resident has walked somewhere with signal.
    const woke = () => {
      if (document.visibilityState === "visible") {
        setOnline(navigator.onLine);
        void refresh();
        void send();
      }
    };

    window.addEventListener("online", up);
    window.addEventListener("offline", down);
    document.addEventListener("visibilitychange", woke);
    // Recorders announce a queued item so the count appears without waiting for a reload.
    window.addEventListener("outbox-changed", refresh as EventListener);

    return () => {
      window.removeEventListener("online", up);
      window.removeEventListener("offline", down);
      document.removeEventListener("visibilitychange", woke);
      window.removeEventListener("outbox-changed", refresh as EventListener);
    };
  }, [refresh, send]);

  // Nothing to say: online, nothing queued, nothing to review.
  if (online && pending === 0 && reviews.length === 0 && !sending) return null;

  const fetched = new Date(renderedAt).toLocaleTimeString("en-IN", {
    timeZone: "Asia/Kolkata",
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <div
      className={
        "px-4 py-2 text-[13px] " +
        (online ? "bg-chip text-foreground" : "bg-accent text-accent-ink")
      }
      role="status"
    >
      {!online && (
        <p>
          <span className="font-semibold">No signal.</span> This screen is as it was at{" "}
          {fetched} — it may be out of date. Anything you record is saved on this phone.
        </p>
      )}

      {online && sending && <p>Sending {pending === 1 ? "1 recording" : `${pending} recordings`}…</p>}

      {online && !sending && pending > 0 && (
        <p>
          {pending === 1 ? "1 recording" : `${pending} recordings`} still to send.{" "}
          <button onClick={() => void send()} className="font-semibold underline">
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
        <p className={online ? "mt-1" : "mt-1"}>
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
