"use client";

import { useEffect, useState } from "react";

export default function Home() {
  // Three things worth proving on the phone before we build anything on top:
  // the page loads, it can run as an installed app, and the microphone exists.
  const [installed, setInstalled] = useState<boolean | null>(null);
  const [mic, setMic] = useState<boolean | null>(null);

  useEffect(() => {
    setInstalled(window.matchMedia("(display-mode: standalone)").matches);
    setMic(typeof navigator.mediaDevices?.getUserMedia === "function");
  }, []);

  return (
    <main className="flex-1 px-6 py-10 flex flex-col gap-8 max-w-md mx-auto w-full">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight">CoreResident</h1>
        <p className="text-muted mt-1">Ward rounds by voice.</p>
      </header>

      <section className="rounded-xl border border-line bg-card p-5">
        <p className="text-sm text-muted">Setup check</p>
        <ul className="mt-3 flex flex-col gap-3 text-sm">
          <Check ok label="Page loaded from the server" />
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

      <section className="text-sm text-muted leading-relaxed">
        <p className="font-medium text-foreground">Nothing is stored yet.</p>
        <p className="mt-1">
          This is the shell. Next comes sign-in, then the ward list, then the record button.
        </p>
      </section>
    </main>
  );
}

function Check({ ok, label, note }: { ok: boolean | null; label: string; note?: string }) {
  return (
    <li className="flex gap-3">
      <span
        aria-hidden
        className={
          "mt-0.5 h-5 w-5 shrink-0 rounded-full grid place-items-center text-xs font-bold " +
          (ok === null ? "bg-line text-muted" : ok ? "bg-accent text-slate-900" : "bg-amber-400 text-slate-900")
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
