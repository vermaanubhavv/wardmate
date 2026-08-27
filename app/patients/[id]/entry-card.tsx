"use client";

import Link from "next/link";
import { useState } from "react";
import { mergeLabelValue } from "@/lib/patients";
import { acceptEntry, editEntry, deleteEntry, updateObservation } from "./actions";
import { isActionableTask } from "@/lib/task-classification";
import { flagMisheard } from "./flag-misheard";

type Value = {
  id: string;
  kind: string;
  label: string;
  value_text: string | null;
  value_num: number | null;
  source_quote: string;
  needs_confirmation: boolean;
  confirmed_at: string | null;
};

/** What operation and which day — the note's heading, not a finding from it. */
const CONTEXT_KINDS = ["day_number", "diagnosis", "planned_procedure"];

const NUMBER_WORDS: Record<string, number> = {
  zero: 0, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9,
  ten: 10, eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15, sixteen: 16,
  seventeen: 17, eighteen: 18, nineteen: 19, twenty: 20, thirty: 30, forty: 40, fifty: 50,
  sixty: 60, seventy: 70, eighty: 80, ninety: 90,
};

/**
 * The figure inside a spoken day, as a number. Null when there isn't one — never a guess.
 *
 * Only reached when extraction did not already store value_num, which it does whenever the
 * resident stated a figure. This is the fallback for entries recorded before that, and for
 * "post-op day four", where the number arrived as a word.
 */
function readNumber(text: string): number | null {
  const digits = text.match(/\d+/);
  if (digits) return Number(digits[0]);

  const words = text.toLowerCase().split(/[^a-z]+/).filter(Boolean);
  for (let i = 0; i < words.length; i++) {
    const n = NUMBER_WORDS[words[i]];
    if (n === undefined) continue;
    // "twenty one" is one number, not two.
    const next = NUMBER_WORDS[words[i + 1]];
    if (n >= 20 && next !== undefined && next < 10) return n + next;
    return n;
  }
  return null;
}

/**
 * A spoken day, written the way it is written on a chart: "POD 4", not "post-op day four".
 *
 * The figure comes from value_num — what the resident actually said — falling back to reading
 * it out of their own words. If there is no number to be found the words are left exactly as
 * spoken rather than forced into a shape they do not fit.
 */
function dayPhrase(v: Value): string {
  const said = (v.value_text ?? "").trim();
  const n = v.value_num ?? readNumber(said);
  if (n === null) return said;
  return /\bpo|\bpod\b/i.test(said) ? `POD ${n}` : `Day ${n}`;
}

/**
 * How one value reads inside a sentence.
 *
 * The label is dropped when the value already says it: "vital is stable" under the label
 * "vitals" would otherwise print as "vitals vital is stable". Matched word by word rather than
 * as one string, because the words often arrive reordered — label "pac review", value "review
 * PAC and review pas done" — and a substring test misses that and stutters.
 *
 * Each word is matched from its start so a plural label still finds its singular ("vitals" →
 * "vital is stable"). Stored data is never touched; this is only how it is set on the page.
 */
function phrase(v: Value, withLabel: boolean): string {
  if (v.kind === "day_number") return dayPhrase(v);
  if (!withLabel) return (v.value_text ?? "").trim() || (v.label ?? "").trim();
  return mergeLabelValue(v.label, v.value_text);
}

/**
 * One visit to a bedside, written as a note rather than a table.
 *
 * A row per value made every record twenty lines tall — "bed number | Bed number five" above
 * "patient | Ramlal, 55-year-old male" — so a week of rounds could not be read without
 * scrolling past the same four facts every time. It now reads the way a resident writes in a
 * register: what this is (POD and operation), how they are (progress), what to do (plan).
 *
 * Who the patient is has gone entirely. The bed, the name, the age and the sex are properties
 * of the patient and are already at the top of this screen; repeating them under every entry
 * is noise that has to be read past to reach the one line that changed today.
 *
 * Every value is still individually editable — tap the words. And the evidence has not moved:
 * whatever was said or photographed is one tap away under the (i), which is the whole basis
 * for trusting a number here.
 */
export default function EntryCard({
  entryId,
  patientId,
  time,
  transcript,
  heard,
  photoUrl,
  accepted,
  edited,
  extractionError,
  values,
  matchedProtocols,
  embedded = false,
}: {
  entryId: string;
  patientId: string;
  /** Preformatted on the server, so the markup cannot disagree between server and browser. */
  time: string;
  transcript: string | null;
  /** What was first heard, when the words shown are not what came back from the engine. */
  heard?: string | null;
  photoUrl?: string | null;
  accepted: boolean;
  edited: boolean;
  extractionError: string | null;
  values: Value[];
  /** Published protocols this entry's words looked related to — a suggestion, never applied. */
  matchedProtocols?: { id: string; title: string }[];
  /** Inside the single Case history disclosure, show the main points without another card. */
  embedded?: boolean;
}) {
  const [showEvidence, setShowEvidence] = useState(false);
  const [editingWords, setEditingWords] = useState(false);
  const [editingValue, setEditingValue] = useState<string | null>(null);
  // Reading is the default and correcting is a mode. A record is read twenty times for every
  // once it is corrected, so the marks that make values tappable are off until asked for.
  const [correcting, setCorrecting] = useState(false);
  const [draft, setDraft] = useState("");

  const context = values.filter((v) => CONTEXT_KINDS.includes(v.kind));
  const plans = values.filter((v) => v.kind === "plan" && isActionableTask(v.value_text ?? v.label));
  const progress = values.filter(
    (v) => !CONTEXT_KINDS.includes(v.kind) && (v.kind !== "plan" || !isActionableTask(v.value_text ?? v.label))
  );

  const editing = values.find((v) => v.id === editingValue) ?? null;

  const openEditor = (id: string) => {
    setEditingValue(id);
    setDraft(values.find((v) => v.id === id)?.value_text ?? "");
  };

  // What the record says when it is folded shut. The heading if there is one, otherwise the
  // start of the progress — enough to know whether this is the day worth opening.
  const gist =
    context.length > 0
      ? context.map((v) => phrase(v, false)).join(" · ")
      : progress.length > 0
        ? progress.slice(0, 2).map((v) => phrase(v, true)).join(" · ")
        : "Nothing structured";

  return (
    <details
      open
      className={embedded ? "border-b border-line last:border-b-0" : "ios-group [&[open]_.chev]:rotate-90"}
    >
      <summary
        className={
          embedded
            ? "hidden"
            : "flex cursor-pointer list-none items-baseline gap-2 px-4 py-2.5 active:bg-chip [&::-webkit-details-marker]:hidden"
        }
      >
        <span className="chev shrink-0 text-[11px] text-muted transition-transform">▶</span>
        <span className="shrink-0 text-[13px] tabular-nums text-muted">{time}</span>
        <span className="min-w-0 flex-1 truncate text-[13px] text-muted">{gist}</span>
      </summary>

      <div className={embedded ? "px-4 pb-3 pt-3" : "px-4 pb-3"}>
        {embedded && <p className="mb-1 text-[11px] uppercase tracking-wide text-muted">{time}</p>}
        {values.length === 0 ? (
          <p className="text-[15px] text-muted">
            {extractionError
              ? "Nothing could be structured from this — the words are under the i."
              : "Nothing clinical was found in this."}
          </p>
        ) : (
          <>
            {context.length > 0 && (
              <p className="text-[17px] font-semibold leading-snug">
                <Phrases values={context} withLabel={false} onEdit={openEditor} interactive={correcting} />
              </p>
            )}

            {progress.length > 0 && (
              <p className={"text-[17px] leading-snug " + (context.length > 0 ? "mt-1" : "")}>
                <Phrases values={progress} withLabel onEdit={openEditor} interactive={correcting} />
              </p>
            )}

            {plans.length > 0 && (
              <div className="mt-2">
                <p className="text-[12px] font-semibold uppercase tracking-wide text-accent">
                  Plan
                </p>
                {/* One line each, not run together: these are separate jobs, ticked off at
                    separate moments, and one may happen without the other. */}
                {plans.map((v) => (
                  <p key={v.id} className="text-[17px] leading-snug">
                    <PhraseButton value={v} withLabel={false} onEdit={openEditor} interactive={correcting} />
                  </p>
                ))}
              </div>
            )}

            {matchedProtocols && matchedProtocols.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {matchedProtocols.map((p) => (
                  <Link
                    key={p.id}
                    href={`/protocols#${p.id}`}
                    className="rounded-full border border-accent/40 bg-accent/10 px-2.5 py-1 text-[12px] font-medium text-accent"
                  >
                    Protocol: {p.title} ›
                  </Link>
                ))}
              </div>
            )}
          </>
        )}

        {editing && (
          <form
            action={updateObservation}
            onSubmit={() => {
              // Saving a correction teaches it too — no separate "the app misheard this"
              // tap needed any more. See flag-misheard.ts: it takes three sightings of the
              // same correction before the glossary actually starts applying it, so one odd
              // edit here cannot mis-teach anything on its own.
              flagMisheard(
                editing.value_text ?? "",
                draft,
                editing.kind === "medication" ? "drug" : null
              );
              setEditingValue(null);
            }}
            className="mt-3 rounded-[10px] bg-chip/50 p-3"
          >
            <input type="hidden" name="observation_id" value={editing.id} />
            <input type="hidden" name="patient_id" value={patientId} />
            <div className="flex items-center gap-2">
              <span className="shrink-0 text-[13px] text-muted">{editing.label}</span>
              <input
                name="value_text"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                autoFocus
                className="min-w-0 flex-1 rounded-md border border-line bg-card px-2 py-1 text-[17px] outline-none focus:border-accent"
              />
              <button className="shrink-0 text-[15px] font-medium text-accent">Save</button>
              <button
                type="button"
                onClick={() => setEditingValue(null)}
                className="shrink-0 text-[15px] text-muted"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

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

        {values.length > 0 && (
          <button
            type="button"
            onClick={() => {
              const next = !correcting;
              setCorrecting(next);
              if (!next) {
                setEditingValue(null);
              }
            }}
            aria-pressed={correcting}
            aria-label="Correct a value"
            className={
              "grid h-7 w-7 shrink-0 place-items-center rounded-full border " +
              (correcting
                ? "border-accent bg-accent text-accent-ink"
                : "border-muted/40 text-muted")
            }
          >
            <PenIcon />
          </button>
        )}

        {accepted ? (
          <span className="text-[13px] text-muted">Accepted{edited && " · corrected"}</span>
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

          {/* When the app fixed a mishearing, both are shown. A correction the resident cannot
              see is a correction they cannot check, and this app does not rewrite the record
              quietly — "lab chole" really was what the engine heard. */}
          {heard && heard !== transcript && (
            <p className="mt-1.5 text-[13px] leading-relaxed text-muted">
              Heard: <span className="italic">“{heard}”</span>
            </p>
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
    </details>
  );
}

/** A run of values as one sentence, each still its own tap target. */
function Phrases({
  values,
  withLabel,
  onEdit,
  interactive,
}: {
  values: Value[];
  withLabel: boolean;
  onEdit: (id: string) => void;
  interactive: boolean;
}) {
  return (
    <>
      {values.map((v, i) => (
        <span key={v.id}>
          {i > 0 && <span className="text-muted"> · </span>}
          <PhraseButton value={v} withLabel={withLabel} onEdit={onEdit} interactive={interactive} />
        </span>
      ))}
    </>
  );
}

function PhraseButton({
  value: v,
  withLabel,
  onEdit,
  interactive,
}: {
  value: Value;
  withLabel: boolean;
  onEdit: (id: string) => void;
  interactive: boolean;
}) {
  const dot = v.needs_confirmation && !v.confirmed_at && (
    <span className="ml-1 text-orange-500" aria-label="not confirmed">
      ●
    </span>
  );

  // Reading: plain prose, nothing to look past. The amber dot stays, because it is information
  // about the value rather than an invitation to press it.
  if (!interactive) {
    return (
      <span>
        {phrase(v, withLabel)}
        {dot}
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={() => onEdit(v.id)}
      // `inline` rather than the button default, so a long value wraps with the sentence
      // instead of sitting in an unbreakable block of its own.
      //
      // The dotted underline is not decoration. Written as plain prose these values looked
      // exactly like text and nothing said they could be corrected — which is precisely how a
      // resident ends up believing there is no way to fix a mis-heard word. It is the quietest
      // mark that still means "you can change this".
      className="inline text-left underline decoration-dotted decoration-muted/50 underline-offset-[3px] active:opacity-60"
    >
      {phrase(v, withLabel)}
      {dot}
    </button>
  );
}

/** Small enough for the controls row, and the same mark the patient header already uses. */
function PenIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  );
}
