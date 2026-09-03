"use client";

import { useRef, useState } from "react";
import { ImageIcon } from "@/app/icons";
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
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={busy}
        className="flex w-full items-center justify-center gap-2 rounded-lg border border-line bg-card px-3 py-2.5 text-[17px] font-medium text-foreground active:opacity-70 disabled:opacity-50"
      >
        <ImageIcon />
        {busy ? "Reading the photo…" : "Photograph a report or obs chart"}
      </button>
      {message && <p className="text-center text-[13px] text-muted">{message}</p>}
    </>
  );
}
