"use client";

import { useSyncExternalStore } from "react";

function subscribeNever() {
  return () => {};
}
const readInstalled = (): boolean | null => window.matchMedia("(display-mode: standalone)").matches;
const readMic = (): boolean | null => typeof navigator.mediaDevices?.getUserMedia === "function";

/** Reports what this particular phone can do. The microphone line is the one that matters. */
export default function SetupCheck() {
  // Server snapshot is null ("not known yet"); the browser answers on the first client render.
  const installed = useSyncExternalStore(subscribeNever, readInstalled, () => null);
  const mic = useSyncExternalStore(subscribeNever, readMic, () => null);

  return (
    <section className="ios-group p-5">
      <p className="text-[15px] text-muted">Setup check</p>
      <ul className="mt-3 flex flex-col gap-3 text-sm">
        <Check
          ok={installed}
          label={installed ? "Running as an installed app" : "Running in the browser tab"}
          note={installed ? undefined : "Add it to your home screen and open it from there."}
        />
        <Check
          ok={mic}
          label={mic ? "Microphone available to the app" : "No microphone access in this browser"}
        />
      </ul>
    </section>
  );
}

function Check({ ok, label, note }: { ok: boolean | null; label: string; note?: string }) {
  return (
    <li className="flex gap-3">
      <span
        aria-hidden
        className={
          "mt-0.5 h-5 w-5 shrink-0 rounded-full grid place-items-center text-xs font-bold " +
          (ok === null
            ? "bg-line text-muted"
            : ok
              ? "bg-accent text-accent-ink"
              : "bg-orange-500 text-accent-ink")
        }
      >
        {ok === null ? "" : ok ? "✓" : "!"}
      </span>
      <span>
        <span className="block">{label}</span>
        {note && <span className="block text-muted text-xs mt-0.5">{note}</span>}
      </span>
    </li>
  );
}
