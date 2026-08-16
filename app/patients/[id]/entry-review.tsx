"use client";

import { useState } from "react";
import { acceptEntry, editEntry, deleteEntry } from "./actions";

/**
 * What was heard, and the three things that can be done about it.
 *
 * The transcript used to sit folded away under "What you said", which made it something to
 * go looking for rather than something to check. It is the only place a mis-hearing is
 * visible — every value on the screen came out of these words — so it is now the thing the
 * entry leads with, and it is answerable: accept it, fix it, or throw it away.
 */
export default function EntryReview({
  entryId,
  patientId,
  transcript,
  accepted,
  edited,
}: {
  entryId: string;
  patientId: string;
  transcript: string;
  accepted: boolean;
  edited: boolean;
}) {
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <form action={editEntry} className="mt-2">
        <input type="hidden" name="entry_id" value={entryId} />
        <input type="hidden" name="patient_id" value={patientId} />

        <textarea
          name="transcript"
          defaultValue={transcript}
          rows={4}
          autoFocus
          className="w-full rounded-lg border border-line bg-background px-3 py-2 text-sm leading-relaxed outline-none focus:border-accent"
        />
        <p className="mt-1 text-xs text-muted">
          Correcting the words works the values out again from what you write here.
        </p>

        <div className="mt-2 flex gap-2">
          <button
            type="button"
            onClick={() => setEditing(false)}
            className="flex-1 rounded-lg border border-line px-3 py-2 text-xs text-muted"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-[2] rounded-lg bg-accent px-3 py-2 text-xs font-semibold text-accent-ink"
          >
            Save and re-read
          </button>
        </div>
      </form>
    );
  }

  return (
    <div className="mt-2">
      <p className="text-sm leading-relaxed text-muted italic">“{transcript}”</p>

      <div className="mt-2 flex items-center gap-2">
        {accepted ? (
          <span className="text-xs text-muted">
            ✓ Accepted{edited && " · corrected"}
          </span>
        ) : (
          <form action={acceptEntry}>
            <input type="hidden" name="entry_id" value={entryId} />
            <input type="hidden" name="patient_id" value={patientId} />
            <button className="rounded-lg bg-accent px-3 py-1.5 text-xs font-semibold text-accent-ink">
              Accept
            </button>
          </form>
        )}

        <button
          type="button"
          onClick={() => setEditing(true)}
          className="rounded-lg border border-line px-3 py-1.5 text-xs text-muted"
        >
          Edit
        </button>

        <form action={deleteEntry} className="ml-auto">
          <input type="hidden" name="entry_id" value={entryId} />
          <input type="hidden" name="patient_id" value={patientId} />
          <button
            // Asked, because this takes the values with it and there is no undo for an
            // entry the way there is for a patient.
            onClick={(e) => {
              if (
                !confirm(
                  "Delete this recording?\n\nEverything it produced goes with it. This cannot be undone."
                )
              ) {
                e.preventDefault();
              }
            }}
            className="rounded-lg px-3 py-1.5 text-xs text-red-600"
          >
            Delete
          </button>
        </form>
      </div>
    </div>
  );
}
