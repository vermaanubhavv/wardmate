"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import Recorder from "./recorder";
import PhotoButton from "./photo-button";

type MissingItem = { item: { label: string; hint: string | null } };

/**
 * The two things you do at a bedside, and a quiet way in to typing.
 *
 * At rest this is exactly two buttons — speak and photograph. Typing replaces them while it
 * is open rather than sitting alongside them, so the bar never grows a third control.
 */
export default function BedsideBar({
  patientId,
  missing,
}: {
  patientId: string;
  missing: MissingItem[];
}) {
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
          aria-label="Bedside note"
          className="field"
        />
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => {
              setTyping(false);
              setMessage(null);
            }}
            className="btn btn-secondary flex-1 text-muted"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={save}
            disabled={busy || !text.trim()}
            className="btn btn-primary flex-[2]"
          >
            {busy ? "Saving…" : "Save note"}
          </button>
        </div>
        {message && <p role="status" className="text-center text-subhead text-muted">{message}</p>}
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
          className="tap self-end text-footnote text-accent"
        >
          Type instead
        </button>
      )}
      {/* What is left to cover — from whichever checklist/protocol the patient is currently
          on, see lib/templates.ts getTemplateForPatient(). Not truncated, and bolder while the
          mic is actually live: this is exactly the moment it needs to be read, not the moment
          before tapping the button. */}
      {missing.length > 0 && (
        <p
          className={
            "line-clamp-2 " +
            (recording ? "text-subhead font-medium text-warn-fg" : "text-footnote text-muted")
          }
        >
          <span className={recording ? undefined : "text-warn-fg"}>Still to cover:</span>{" "}
          {missing.map((m) => m.item.hint ?? m.item.label).join(" · ")}
        </p>
      )}
      <Recorder patientId={patientId} onBusyChange={onBusyChange} />
      <PhotoButton patientId={patientId} />
      {message && <p role="status" className="text-center text-subhead text-muted">{message}</p>}
    </div>
  );
}
