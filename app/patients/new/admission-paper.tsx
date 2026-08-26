"use client";

import { useRef, useState } from "react";
import { prepareImageForUpload } from "@/lib/image-for-upload";
import type { AdmissionPaperPatient } from "@/lib/read-admission-paper";

export default function AdmissionPaper({
  onParsed,
}: {
  onParsed: (patient: AdmissionPaperPatient) => void;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function upload(chosen: File) {
    setBusy(true);
    setMessage(null);
    const paper = await prepareImageForUpload(chosen);
    const form = new FormData();
    form.append("paper", paper);

    try {
      const response = await fetch("/api/patients/read-paper", { method: "POST", body: form });
      const data = await response.json();
      setBusy(false);
      if (!response.ok) {
        setMessage(data.error ?? "Could not read that paper.");
        return;
      }

      const patient = data.patient as AdmissionPaperPatient;
      onParsed(patient);
      const filled = Object.values(patient).filter((value) => value !== null && value !== "").length;
      setMessage(
        filled === 0
          ? "No patient details were clear on that image. Try a flatter, brighter photo."
          : `Filled ${filled} ${filled === 1 ? "box" : "boxes"} — check them before adding.`
      );
    } catch {
      setBusy(false);
      setMessage("No connection. Nothing was filled in.");
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <input
        ref={inputRef}
        type="file"
        accept="image/*,image/heic,image/heif"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) void upload(file);
          event.target.value = "";
        }}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={busy}
        className="w-full rounded-xl border border-line px-4 py-4 text-[17px] font-semibold text-foreground disabled:opacity-60"
      >
        {busy ? "Reading the paper…" : "Add from admission / OPD paper"}
      </button>
      <p className="text-center text-[13px] text-muted">
        Take a photo or choose one. Name, age, sex, IP no. and diagnosis will be suggested.
      </p>
      {message && <p className="text-center text-[13px] text-orange-700">{message}</p>}
    </div>
  );
}
