"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { subscribeNever } from "../install-hint";
import { Toggle } from "../patients/[id]/card-kit";
import { savePushSubscription, deletePushSubscription } from "./push-actions";

/** The VAPID public key in the form PushManager wants. */
function keyBytes(base64url: string): Uint8Array {
  const pad = "=".repeat((4 - (base64url.length % 4)) % 4);
  const raw = atob((base64url + pad).replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from(raw, (c) => c.charCodeAt(0));
}

/**
 * Notifications on or off, for this phone. Two things ever arrive: a red job handed to you, and
 * the handover-time reminder. Off deletes the subscription, so there is nothing to un-mute.
 */
export default function PushToggle() {
  const key = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  // What the phone allows, read at render (after hydration); only the subscription is async.
  const phone = useSyncExternalStore(
    subscribeNever,
    () =>
      !key || !("serviceWorker" in navigator) || !("PushManager" in window) || !("Notification" in window)
        ? "unsupported"
        : Notification.permission === "denied"
          ? "denied"
          : "ok",
    () => "checking",
  );
  const [sub, setState] = useState<"checking" | "unsupported" | "on" | "off" | "denied">("checking");
  const state = phone === "ok" ? sub : phone;

  useEffect(() => {
    if (phone !== "ok") return;
    navigator.serviceWorker.ready
      .then((reg) => reg.pushManager.getSubscription())
      .then((s) => setState(s ? "on" : "off"))
      .catch(() => setState("unsupported"));
  }, [phone]);

  async function turnOn() {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      setState(permission === "denied" ? "denied" : "off");
      return;
    }
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: keyBytes(key!) as BufferSource });
    const r = await savePushSubscription(sub.toJSON() as { endpoint: string; keys: { p256dh: string; auth: string } });
    if (!r.ok) {
      await sub.unsubscribe();
      return;
    }
    setState("on");
  }

  async function turnOff() {
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.getSubscription();
    if (sub) {
      await deletePushSubscription(sub.endpoint);
      await sub.unsubscribe();
    }
    setState("off");
  }

  if (state === "checking") return null;

  return (
    <div className="ios-group flex items-center gap-3 px-4 py-3">
      <div className="flex-1">
        <p className="text-subhead">Notifications on this phone</p>
        <p className="text-footnote text-muted">
          {state === "unsupported"
            ? "Needs the app on your home screen (iPhone: Share → Add to Home Screen), then open it from there."
            : state === "denied"
              ? "Blocked in the phone's settings for WardMate. Allow it there to turn this on."
              : "Only a red job handed to you, and a reminder at handover time. Nothing else."}
        </p>
      </div>
      {(state === "on" || state === "off") && <Toggle on={state === "on"} onClick={() => void (state === "on" ? turnOff() : turnOn())} />}
    </div>
  );
}
