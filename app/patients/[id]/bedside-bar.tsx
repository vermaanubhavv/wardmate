"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import Recorder from "./recorder";
import PhotoButton from "./photo-button";

/**
 * The two things you do at a bedside, and a quiet way in to typing.
 *
 * At rest this is exactly two buttons — speak and photograph. Typing replaces them while it
 * is open rather than sitting alongside them, so the bar never grows a third control.
 */
export default function BedsideBar({ patientId }: { patientId: string }) {
  const router = useRouter();
  const [typing, setTyping] = useState(false);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [recording, setRecording] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // Stable across renders so the Recorder's effect does not re-fire on every keystroke here.
  const onBusyChange = useCallback((b: boolean) => setRecording(b), []);

  async function save() {
    const note = text.trim();
    if (!note) return;

    setBusy(true);
    setMessage(null);

    try {
      const res = await fetch("/api/entries/text", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ patient_id: patientId, text: note }),
      });
      const data = await res.json();
      setBusy(false);

      if (!res.ok) {
        setMessage(data.error ?? "Could not save that.");
        return;
      }

      setText("");
      setTyping(false);
      setMessage(
        data.error ??
          (data.observations?.length
            ? `Saved ${data.observations.length} ${data.observations.length === 1 ? "item" : "items"}.`
            : "Saved, but nothing clinical was found in it.")
      );
      router.refresh();
    } catch {
      setBusy(false);
      setMessage("No connection. Nothing was saved.");
    }
  }

  if (typing) {
    return (
      <div className="flex flex-col gap-3">
        <textarea
          autoFocus
          rows={4}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Day 3 post lap chole, afebrile, drain 30 ml serous…"
          className="w-full rounded-xl border border-line bg-card px-4 py-3 text-base outline-none focus:border-accent"
        />
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => {
              setTyping(false);
              setMessage(null);
            }}
            className="flex-1 rounded-xl border border-line px-4 py-3 text-sm text-muted"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={save}
            disabled={busy || !text.trim()}
            className="flex-[2] rounded-xl bg-accent px-4 py-3 text-base font-semibold text-accent-ink disabled:opacity-50"
          >
            {busy ? "Saving…" : "Save note"}
          </button>
        </div>
        {message && <p className="text-center text-sm text-muted">{message}</p>}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Hidden while recording so it cannot be hit by accident mid-note. */}
      {!recording && (
        <button
          type="button"
          onClick={() => setTyping(true)}
          className="self-end text-xs text-muted underline underline-offset-4"
        >
          Type instead
        </button>
      )}
      <Recorder patientId={patientId} onBusyChange={onBusyChange} />
      <PhotoButton patientId={patientId} />
      {message && <p className="text-center text-sm text-muted">{message}</p>}
    </div>
  );
}
