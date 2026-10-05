"use client";

import { useRef, useState } from "react";
import { updateObservation, confirmChecked, confirmAll } from "./actions";
import { flagMisheard } from "./flag-misheard";
import { ActionSheet } from "../../action-sheet";
import MedicationEditor from "./medication-editor";

/** Values that read as one thing share one card and one tick: drugs and plan changes said in
 *  a round are one treatment change, and BP/PR/RBS/SpO₂ said together are one set of vitals.
 *  Each line keeps its own quote and Edit — squashing the tick never squashes what was heard. */
const VITAL_ORDER = [/^bp$|blood pressure/i, /^(pr|pulse|hr|heart rate)\b/i, /rbs|grbs|cbg|blood sugar/i, /spo|saturation/i];
const vitalRank = (label: string) => {
  const i = VITAL_ORDER.findIndex((r) => r.test(label.trim()));
  return i === -1 ? VITAL_ORDER.length : i;
};
const GROUPS: { key: string; title: string; has: (o: PendingObservation) => boolean }[] = [
  { key: "treatment", title: "Treatment changes", has: (o) => o.kind === "medication" || o.kind === "plan" },
  { key: "vitals", title: "Vitals", has: (o) => o.kind === "vital" || /^(rbs|grbs|cbg|blood sugar)$/i.test(o.label.trim()) },
];

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
  wardId,
  computedDay,
  procedureChoices,
}: {
  pending: PendingObservation[];
  patientId: string;
  wardId: string;
  /** The day the app computed from recorded dates (post-op or admission) — same source
   *  dayConflict() in the entry routes already used to write conflict_note. Null when there is
   *  nothing to compute yet (no admission/surgery date on record). */
  computedDay: number | null;
  procedureChoices: string[];
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [ticked, setTicked] = useState(0);
  const [tickedGroups, setTickedGroups] = useState<Set<string>>(new Set());
  const [ask, setAsk] = useState<{ kind: "all" } | { kind: "clear"; o: PendingObservation } | null>(null);
  const formRef = useRef<HTMLFormElement | null>(null);

  function saveDraft(o: PendingObservation, value: string) {
    const fd = new FormData();
    fd.set("observation_id", o.id);
    fd.set("patient_id", patientId);
    fd.set("value_text", value);
    setEditingId(null);
    void updateObservation(fd);
    if (value.trim()) flagMisheard(o.value_text ?? "", value, o.kind === "medication" ? "drug" : null);
  }

  function saveMedication(o: PendingObservation, label: string, value: string) {
    const fd = new FormData();
    fd.set("observation_id", o.id);
    fd.set("patient_id", patientId);
    fd.set("label", label);
    fd.set("value_text", value);
    setEditingId(null);
    void updateObservation(fd);
    flagMisheard(o.label, label, "drug");
  }

  function openEditor(o: PendingObservation) {
    setEditingId(o.id);
    setDraft(o.value_text ?? "");
  }

  const groups = GROUPS.map((g) => ({ ...g, rows: pending.filter(g.has) })).filter((g) => g.rows.length > 1);
  for (const g of groups) if (g.key === "vitals") g.rows.sort((x, y) => vitalRank(x.label) - vitalRank(y.label));
  const grouped = new Set(groups.flatMap((g) => g.rows.map((o) => o.id)));
  const others = pending.filter((o) => !grouped.has(o.id));
  const tickedCount = ticked + groups.reduce((n, g) => n + (tickedGroups.has(g.key) ? g.rows.length : 0), 0);

  /** One value's line: label, value, Edit, the quote it came from. A lone value carries its own
   *  checkbox; inside a group card it rides on the card's one tick (checkbox null). The row
   *  is a <label> only when it has a checkbox; a grouped line instead opens its editor on tap. */
  function item(o: PendingObservation, checkbox: React.ReactNode) {
    const Row = checkbox ? "label" : "div";
    const editing = editingId === o.id;
    const suggestions =
      o.kind === "day_number" && computedDay !== null
        ? [String(computedDay)].filter((v) => v !== (o.value_text ?? "").trim())
        : o.kind === "procedure_done"
          ? rankedProcedureSuggestions(procedureChoices, o.value_text ?? "")
          : [];

    return (
      <>
        <Row
          className="flex min-h-11 items-start gap-3"
          onClick={checkbox || editing ? undefined : () => openEditor(o)}
        >
          {checkbox}
          <span className="min-w-0 flex-1 text-subhead">
            <span className="text-muted">{o.label}</span>{" "}
            <span className="font-medium">{o.value_text}</span>
          </span>
          <button
            type="button"
            onClick={() => (editing ? setEditingId(null) : openEditor(o))}
            className="tap shrink-0 px-1 text-footnote font-medium text-warn-fg underline underline-offset-4"
          >
            {editing ? "Cancel" : "Edit"}
          </button>
        </Row>
        <p className={`mt-1.5 ${checkbox ? "pl-8" : ""} text-footnote text-warn-fg italic`}>“{o.source_quote}”</p>
        {o.conflict_note && !editing && (
          <p className={`mt-1 ${checkbox ? "pl-8" : ""} text-caption text-warn-fg`}>{o.conflict_note}</p>
        )}

        {editing && o.kind === "medication" && (
          <MedicationEditor
            wardId={wardId}
            label={o.label}
            value={o.value_text}
            onSave={(label, value) => saveMedication(o, label, value)}
            onCancel={() => setEditingId(null)}
          />
        )}

        {editing && o.kind !== "medication" && (
          <div className={`mt-2 ${checkbox ? "pl-8" : ""}`}>
            <div className="flex items-center gap-2">
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                autoFocus
                className="field min-w-0 flex-1"
              />
              <button
                type="button"
                onClick={() => {
                  // An empty value deletes the observation (see updateObservation), so
                  // that one case asks first; a real correction saves at once and teaches
                  // the mis-hearing — see flag-misheard.ts.
                  if (!draft.trim()) setAsk({ kind: "clear", o });
                  else saveDraft(o, draft);
                }}
                className="tap shrink-0 px-1 text-subhead font-semibold text-accent"
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
                    className="min-h-9 rounded-full bg-card px-3 text-footnote text-warn-fg"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </>
    );
  }

  return (
    <form ref={formRef} action={confirmChecked}>
      <input type="hidden" name="patient_id" value={patientId} />

      <ul className="flex flex-col gap-2">
        {groups.map((g) => (
          <li key={g.key} className="rounded-[10px] bg-warn-bg p-3">
            <label className="flex min-h-11 items-start gap-3">
              <input
                type="checkbox"
                checked={tickedGroups.has(g.key)}
                onChange={(e) =>
                  setTickedGroups((prev) => {
                    const next = new Set(prev);
                    if (e.target.checked) next.add(g.key);
                    else next.delete(g.key);
                    return next;
                  })
                }
                className="mt-0.5 h-5 w-5 shrink-0 accent-accent"
              />
              <span className="min-w-0 flex-1 text-subhead font-medium">
                {g.title} · {g.rows.length}
              </span>
            </label>
            {tickedGroups.has(g.key) &&
              g.rows.map((o) => <input key={o.id} type="hidden" name="observation_ids" value={o.id} />)}
            <ul className="mt-1 flex flex-col divide-y divide-warn-fg/15 pl-8">
              {g.rows.map((o) => (
                <li key={o.id} className="py-2">
                  {item(o, null)}
                </li>
              ))}
            </ul>
          </li>
        ))}
        {others.map((o) => (
          <li key={o.id} className="rounded-[10px] bg-warn-bg p-3">
            {item(
              o,
              <input
                type="checkbox"
                name="observation_ids"
                value={o.id}
                onChange={(e) => setTicked((n) => n + (e.target.checked ? 1 : -1))}
                className="mt-0.5 h-5 w-5 shrink-0 accent-accent"
              />
            )}
          </li>
        ))}
      </ul>

      {/* The careful action is the filled one. Accepting everything unread is what the amber
          exists to prevent, so it is the quiet button and it asks first. */}
      <div className="mt-3 flex gap-3">
        <button type="submit" disabled={tickedCount === 0} className="btn btn-primary flex-1">
          Accept {tickedCount > 0 ? tickedCount : "ticked"}
        </button>
        <button type="button" onClick={() => setAsk({ kind: "all" })} className="btn btn-secondary flex-1">
          Accept all {pending.length}
        </button>
      </div>

      <ActionSheet
        open={ask !== null}
        title={ask?.kind === "all" ? `Accept all ${pending.length} as heard?` : "Remove this value?"}
        message={
          ask?.kind === "all"
            ? "Every number, drug and dose on this card is marked confirmed without being looked at."
            : "An empty value removes it from the record. The recording it came from is kept."
        }
        action={ask?.kind === "all" ? `Accept all ${pending.length}` : "Remove"}
        onCancel={() => setAsk(null)}
        onConfirm={() => {
          const a = ask;
          setAsk(null);
          if (!a) return;
          if (a.kind === "clear") saveDraft(a.o, "");
          else {
            const fd = new FormData(formRef.current ?? undefined);
            void confirmAll(fd);
          }
        }}
      />
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
