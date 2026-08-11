"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

/**
 * Photograph the round register. Goes straight to a review screen — this never writes to a
 * patient on its own.
 */
export default function RegisterButton() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function upload(file: File) {
    setBusy(true);
    setMessage(null);

    const form = new FormData();
    form.append("photo", file);

    try {
      const res = await fetch("/api/register", { method: "POST", body: form });
      const data = await res.json();

      if (!res.ok) {
        setBusy(false);
        setMessage(data.error ?? "Could not read that page.");
        return;
      }
      router.push(`/register/${data.read_id}`);
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
        className="w-full rounded-xl border border-line px-4 py-3 text-sm text-muted active:opacity-70 disabled:opacity-50"
      >
        {busy ? "Reading the register…" : "Read round register"}
      </button>
      {message && <p className="text-center text-xs text-amber-200">{message}</p>}
    </>
  );
}
