"use client";

import { useState } from "react";
import { updateObservation, confirmChecked, confirmAll } from "./actions";
import { flagMisheard } from "./flag-misheard";

export type PendingObservation = {
  id: string;
  kind: string;
  label: string;
  value_text: string | null;
  source_quote: string;
  conflict_note: string | null;
};

/**
 * The values a mis-hearing could get dangerously wrong — a number, a drug, a bed — shown for a
 * one-tap confirm. Editing lives right here rather than sending the resident back to the entry
 * it came from: this is the one screen built for "is this right", and correcting it here still
 * confirms it (see updateObservation) exactly the way ticking would.
 *
 * Two kinds get one-tap alternatives alongside the free-text box, both drawn only from things
 * the app already knows for a fact — never a guessed replacement:
 *  - day_number: the day the app itself computed from the recorded dates, the same number
 *    already named in conflict_note, offered as a button rather than left as a sentence to
 *    retype from.
 *  - procedure_done: the unit's own list of known operations (lib/templates.ts
 *    listTemplateChoices), so a mis-heard "appendicectomy" can be swapped for "cholecystectomy"
 *    in one tap rather than typed out by hand.
 */
export default function ConfirmDictation({
  pending,
  patientId,
  computedDay,
  procedureChoices,
}: {
  pending: PendingObservation[];
  patientId: string;
  /** The day the app computed from recorded dates (post-op or admission) — same source
   *  dayConflict() in the entry routes already used to write conflict_note. Null when there is
   *  nothing to compute yet (no admission/surgery date on record). */
  computedDay: number | null;
  procedureChoices: string[];
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");

  function openEditor(o: PendingObservation) {
    setEditingId(o.id);
    setDraft(o.value_text ?? "");
  }

  return (
    <form action={confirmChecked}>
      <input type="hidden" name="patient_id" value={patientId} />

      <ul className="flex flex-col gap-2">
        {pending.map((o) => {
          const editing = editingId === o.id;
          const suggestions =
            o.kind === "day_number" && computedDay !== null
              ? [String(computedDay)].filter((v) => v !== (o.value_text ?? "").trim())
              : o.kind === "procedure_done"
                ? rankedProcedureSuggestions(procedureChoices, o.value_text ?? "")
                : [];

          return (
            <li key={o.id} className="rounded-[10px] border border-orange-200 bg-orange-50 p-3">
              <label className="flex items-start gap-3">
                <input
                  type="checkbox"
                  name="observation_ids"
                  value={o.id}
                  className="mt-0.5 h-5 w-5 shrink-0 accent-accent"
                />
                <span className="min-w-0 flex-1 text-sm">
                  <span className="text-muted">{o.label}</span>{" "}
                  <span className="font-medium">{o.value_text}</span>
                </span>
                <button
                  type="button"
                  onClick={() => (editing ? setEditingId(null) : openEditor(o))}
                  className="shrink-0 text-[13px] font-medium text-orange-700 underline underline-offset-4"
                >
                  {editing ? "Cancel" : "Edit"}
                </button>
              </label>
              <p className="mt-1.5 pl-8 text-[13px] text-orange-700/70 italic">“{o.source_quote}”</p>
              {o.conflict_note && !editing && (
                <p className="mt-1 pl-8 text-xs text-orange-800">{o.conflict_note}</p>
              )}

              {editing && (
                <div className="mt-2 pl-8">
                  <div className="flex items-center gap-2">
                    <input
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      autoFocus
                      className="min-w-0 flex-1 rounded-md border border-orange-300 bg-card px-2 py-1 text-[15px] outline-none focus:border-accent"
                    />
                    <button
                      type="button"
                      onClick={async () => {
                        const fd = new FormData();
                        fd.set("observation_id", o.id);
                        fd.set("patient_id", patientId);
                        fd.set("value_text", draft);
                        await updateObservation(fd);
                        // Saving a correction teaches it too — see flag-misheard.ts.
                        flagMisheard(o.value_text ?? "", draft, o.kind === "medication" ? "drug" : null);
                        setEditingId(null);
                      }}
                      className="shrink-0 text-[14px] font-semibold text-accent"
                    >
                      Save
                    </button>
                  </div>

                  {suggestions.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {suggestions.map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setDraft(s)}
                          className="rounded-full border border-orange-300 bg-card px-2.5 py-1 text-[13px] text-orange-800"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ul>

      <div className="mt-3 flex gap-3">
        <button
          type="submit"
          className="flex-1 rounded-[10px] border border-orange-300 px-4 py-3 text-[15px] font-semibold text-orange-700"
        >
          Accept ticked
        </button>
        <button
          type="submit"
          formAction={confirmAll}
          className="flex-1 rounded-xl bg-orange-500 px-4 py-3 text-[15px] font-semibold text-accent-ink"
        >
          Accept all {pending.length}
        </button>
      </div>
    </form>
  );
}

/** Operations sharing a word with what was actually recorded surface first — "laparoscopic
 *  appendicectomy" ranks "laparoscopic cholecystectomy" above an unrelated procedure — but the
 *  full known list is offered either way, capped so it stays a quick scan, not a menu. */
function rankedProcedureSuggestions(choices: string[], current: string): string[] {
  const currentWords = new Set(current.toLowerCase().split(/\s+/).filter(Boolean));
  const deduped = Array.from(new Set(choices)).filter(
    (c) => c.toLowerCase().trim() !== current.toLowerCase().trim()
  );
  const scored = deduped.map((c) => ({
    label: c,
    score: c
      .toLowerCase()
      .split(/\s+/)
      .filter((w) => currentWords.has(w)).length,
  }));
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, 6).map((s) => s.label);
}
