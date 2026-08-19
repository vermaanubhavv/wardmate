"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { prepareImageForUpload } from "@/lib/image-for-upload";
import { ImageIcon } from "./icons";
import Mark from "./mark";

/**
 * Photograph the round register. Goes straight to a review screen — this never writes to a
 * patient on its own.
 */
export default function RegisterButton() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function upload(chosen: File) {
    setBusy(true);
    setMessage(null);

    // A library photo may be HEIC, which the server refuses, or larger than the request may
    // carry. Both are converted here; a camera photo passes through untouched.
    const file = await prepareImageForUpload(chosen);

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
        // heic/heif named explicitly so the library does not grey them out on an iPhone.
        accept="image/*,image/heic,image/heif"
        // No `capture` attribute on purpose. With it, the phone goes straight to the camera
        // and a page photographed earlier — or one sent by whoever held the register — is
        // unreachable. Without it, the phone offers its own sheet: take a photo, or pick
        // from the library.
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void upload(file);
          e.target.value = "";
        }}
      />
      <div className="flex flex-col items-center">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          aria-label="Photograph the round register"
          className="grid h-14 w-14 place-items-center rounded-full bg-card text-accent active:opacity-80 disabled:opacity-50"
        >
          {busy ? <Mark className="h-7 w-7" spinning /> : <ImageIcon className="h-6 w-6" />}
        </button>
        <span className="mt-1.5 text-[12px] text-muted">{busy ? "Reading…" : "Register"}</span>

        {/* Above the bar, full width — see round-recorder for why. */}
        {message && (
          <p className="absolute inset-x-0 bottom-full mb-2 px-2 text-center text-[13px] text-accent">
            {message}
          </p>
        )}
      </div>
    </>
  );
}
