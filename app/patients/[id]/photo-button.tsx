"use client";

import { useRef, useState } from "react";
import { ImageIcon } from "@/app/icons";
import Mark from "@/app/mark";
import { useRouter } from "next/navigation";

/**
 * Opens the phone camera directly at a lab report or a bedside observation chart / monitor.
 * Deliberately a plain file input with capture set, rather than a custom camera screen — the
 * phone's own camera is faster, focuses better on small print, and is the one the resident
 * already knows how to use.
 */
export default function PhotoButton({ patientId }: { patientId: string }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function upload(file: File) {
    setBusy(true);
    setMessage(null);

    const form = new FormData();
    form.append("patient_id", patientId);
    form.append("photo", file);

    try {
      const res = await fetch("/api/entries/photo", { method: "POST", body: form });
      const data = await res.json();
      setBusy(false);

      if (!res.ok) {
        setMessage(data.error ?? "Could not read that photo.");
        return;
      }

      const n = data.values?.length ?? 0;
      setMessage(
        data.error ??
          (n === 0
            ? "No values could be read from that photo."
            : `Read ${n} ${n === 1 ? "value" : "values"}${
                data.unclear ? `, ${data.unclear} unclear` : ""
              } — check them against the photo.`)
      );
      router.refresh();
    } catch {
      setBusy(false);
      setMessage("No connection. Nothing was saved.");
    }
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void upload(file);
          e.target.value = "";
        }}
      />
      {/* An icon in the bedside bar's one row; the words it used to carry are its label. */}
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={busy}
        aria-label={busy ? "Reading the photo…" : "Photograph a report or obs chart"}
        className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-line bg-card text-accent active:opacity-70 disabled:opacity-50"
      >
        {busy ? <Mark className="h-5 w-5" spinning /> : <ImageIcon className="h-5 w-5" />}
      </button>
      {/* Hung above the bar (BottomBar's inner row is the positioned parent) so a sentence does
          not stretch the row the icon sits in. */}
      {message && (
        <button
          type="button"
          role="status"
          onClick={() => setMessage(null)}
          className="absolute inset-x-0 bottom-full mb-3 rounded-lg bg-card px-3 py-2 text-center text-footnote text-muted shadow-sm"
        >
          {message} <span className="text-accent">OK</span>
        </button>
      )}
    </>
  );
}
