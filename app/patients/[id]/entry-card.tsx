"use client";

import { useState } from "react";
import { acceptEntry, editEntry, deleteEntry, updateObservation } from "./actions";

type Value = {
  id: string;
  kind: string;
  label: string;
  value_text: string | null;
  source_quote: string;
  needs_confirmation: boolean;
  confirmed_at: string | null;
};

/**
 * One visit to a bedside, shown as what the app understood rather than as what was said.
 *
 * The transcript used to lead this block, and on a patient with a week of rounds it made the
 * record a wall of prose — every value stated twice, once in a sentence and once as a value.
 * What a resident checks is the values: is the drain output right, is the drug right. So those
 * come first, each editable where it sits, and the words move behind the (i).
 *
 * The evidence has not gone anywhere, and that matters more than the tidiness. Every value on
 * screen came out of that sentence or that photograph, and one tap still shows it — which is
 * the whole basis for trusting a number here. Hidden by default, never absent.
 */
export default function EntryCard({
  entryId,
  patientId,
  transcript,
  photoUrl,
  accepted,
  edited,
  extractionError,
  values,
}: {
  entryId: string;
  patientId: string;
  transcript: string | null;
  photoUrl?: string | null;
  accepted: boolean;
  edited: boolean;
  extractionError: string | null;
  values: Value[];
}) {
  const [showEvidence, setShowEvidence] = useState(false);
  const [editingWords, setEditingWords] = useState(false);
  const [editingValue, setEditingValue] = useState<string | null>(null);

  // Plans read as instructions, not findings — "discharge tomorrow" sitting in the same list
  // as "abdomen soft" makes both look like the same kind of fact, when one is a job someone
  // still has to do. Split so the two never share a row style.
  const findings = values.filter((v) => v.kind !== "plan");
  const plans = values.filter((v) => v.kind === "plan");

  return (
    <div className="ios-group">
      {values.length > 0 ? (
        <>
          {findings.length > 0 && (
            <ul>
              {findings.map((v) => (
                <ValueRow
                  key={v.id}
                  value={v}
                  patientId={patientId}
                  editing={editingValue === v.id}
                  onEdit={() => setEditingValue(v.id)}
                  onDoneEditing={() => setEditingValue(null)}
                />
              ))}
            </ul>
          )}

          {plans.length > 0 && (
            <>
              <p className="ios-row px-4 pt-3 pb-1 text-[12px] font-semibold uppercase tracking-wide text-accent">
                Plan
              </p>
              <ul>
                {plans.map((v) => (
                  <ValueRow
                    key={v.id}
                    value={v}
                    patientId={patientId}
                    editing={editingValue === v.id}
                    onEdit={() => setEditingValue(v.id)}
                    onDoneEditing={() => setEditingValue(null)}
                    planStyle
                  />
                ))}
              </ul>
            </>
          )}
        </>
      ) : (
        <p className="px-4 py-2.5 text-[15px] text-muted">
          {extractionError
            ? "Nothing could be structured from this — the words are under the i."
            : "Nothing clinical was found in this."}
        </p>
      )}

      {/* The row of controls, and the evidence behind the i. */}
      <div className="ios-row flex items-center gap-2 px-3 py-2">
        <button
          type="button"
          onClick={() => setShowEvidence((v) => !v)}
          aria-label="What was said or photographed"
          aria-expanded={showEvidence}
          className={
            "grid h-7 w-7 shrink-0 place-items-center rounded-full border text-[13px] font-serif italic " +
            (showEvidence
              ? "border-accent bg-accent text-accent-ink"
              : "border-muted/40 text-muted")
          }
        >
          i
        </button>

        {accepted ? (
          <span className="text-[13px] text-muted">
            Accepted{edited && " · corrected"}
          </span>
        ) : (
          <form action={acceptEntry}>
            <input type="hidden" name="entry_id" value={entryId} />
            <input type="hidden" name="patient_id" value={patientId} />
            <button className="rounded-full bg-accent px-3 py-1 text-[13px] font-semibold text-accent-ink">
              Accept
            </button>
          </form>
        )}

        <form action={deleteEntry} className="ml-auto">
          <input type="hidden" name="entry_id" value={entryId} />
          <input type="hidden" name="patient_id" value={patientId} />
          <button
            onClick={(e) => {
              if (
                !confirm(
                  "Delete this recording?\n\nEverything it produced goes with it. This cannot be undone."
                )
              ) {
                e.preventDefault();
              }
            }}
            className="px-2 text-[13px] text-accent"
          >
            Delete
          </button>
        </form>
      </div>

      {showEvidence && (
        <div className="ios-row bg-chip/40 px-4 py-3">
          <p className="text-[13px] font-medium text-muted">What was recorded</p>

          {photoUrl && (
            <a href={photoUrl} target="_blank" rel="noreferrer" className="mt-2 block">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photoUrl}
                alt="Photographed report"
                className="w-full rounded-[10px] border border-line"
              />
              <span className="mt-1 block text-[13px] text-muted">Tap to open full size</span>
            </a>
          )}

          {transcript &&
            (editingWords ? (
              <form action={editEntry} className="mt-2" onSubmit={() => setEditingWords(false)}>
                <input type="hidden" name="entry_id" value={entryId} />
                <input type="hidden" name="patient_id" value={patientId} />
                <textarea
                  name="transcript"
                  defaultValue={transcript}
                  rows={4}
                  autoFocus
                  className="w-full rounded-[10px] border border-line bg-card px-3 py-2 text-[15px] leading-relaxed outline-none focus:border-accent"
                />
                <p className="mt-1 text-[13px] text-muted">
                  Saving works the values out again from these words, replacing the ones above.
                </p>
                <div className="mt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingWords(false)}
                    className="flex-1 rounded-[10px] bg-card px-3 py-2 text-[15px] text-muted"
                  >
                    Cancel
                  </button>
                  <button className="flex-[2] rounded-[10px] bg-accent px-3 py-2 text-[15px] font-semibold text-accent-ink">
                    Save and re-read
                  </button>
                </div>
              </form>
            ) : (
              <>
                <p className="mt-1.5 text-[15px] italic leading-relaxed text-muted">
                  “{transcript}”
                </p>
                <button
                  type="button"
                  onClick={() => setEditingWords(true)}
                  className="mt-2 text-[13px] font-medium text-accent"
                >
                  Correct the words
                </button>
              </>
            ))}

          {!transcript && !photoUrl && (
            <p className="mt-1.5 text-[15px] text-muted">Nothing was kept for this entry.</p>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * One value, editable where it sits. Split out of EntryCard so a finding and a plan can share
 * the exact same edit behaviour while looking different — a plan drops the label prefix and
 * reads as the sentence it is ("Discharge tomorrow"), since "discharge: Discharge tomorrow"
 * says the same word twice.
 */
function ValueRow({
  value: v,
  patientId,
  editing,
  onEdit,
  onDoneEditing,
  planStyle = false,
}: {
  value: Value;
  patientId: string;
  editing: boolean;
  onEdit: () => void;
  onDoneEditing: () => void;
  planStyle?: boolean;
}) {
  if (editing) {
    return (
      <li className="ios-row px-4 py-2.5">
        <form
          action={updateObservation}
          onSubmit={onDoneEditing}
          className="flex items-center gap-2"
        >
          <input type="hidden" name="observation_id" value={v.id} />
          <input type="hidden" name="patient_id" value={patientId} />
          {!planStyle && <span className="shrink-0 text-[15px] text-muted">{v.label}</span>}
          <input
            name="value_text"
            defaultValue={v.value_text ?? ""}
            autoFocus
            className="min-w-0 flex-1 rounded-md border border-line bg-background px-2 py-1 text-[17px] outline-none focus:border-accent"
          />
          <button className="shrink-0 text-[15px] font-medium text-accent">Save</button>
        </form>
        <p className="mt-1 text-[13px] text-muted">
          Clearing it removes the value. The words it came from are kept.
        </p>
      </li>
    );
  }

  return (
    <li className="ios-row">
      <button
        type="button"
        onClick={onEdit}
        className={
          "flex w-full items-baseline gap-3 px-4 py-2.5 text-left active:bg-chip " +
          (planStyle ? "" : "justify-between")
        }
      >
        {planStyle ? (
          <span className="min-w-0 flex-1 text-[17px]">
            {v.value_text}
            {v.needs_confirmation && !v.confirmed_at && (
              <span className="ml-1.5 text-orange-500" aria-label="not confirmed">
                ●
              </span>
            )}
          </span>
        ) : (
          <>
            <span className="shrink-0 text-[15px] text-muted">{v.label}</span>
            <span className="min-w-0 flex-1 text-right text-[17px]">
              {v.value_text}
              {/* Amber dot rather than a word: the row is already two columns wide. */}
              {v.needs_confirmation && !v.confirmed_at && (
                <span className="ml-1.5 text-orange-500" aria-label="not confirmed">
                  ●
                </span>
              )}
            </span>
          </>
        )}
      </button>
    </li>
  );
}
