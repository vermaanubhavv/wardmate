"use client";

import { useState, useTransition } from "react";
import { findFormularyOptions, confirmFormularyMapping, clearFormularyMapping } from "./actions";

/**
 * Linking one dictated drug to the entry the hospital's prescribing system actually lists.
 *
 * The resident searches, reads the candidates, and taps one. Nothing is preselected and no
 * candidate is marked as likely — see lib/formulary.ts for why: on this hospital's own
 * formulary, "pantoprazole" reaches a Domperidone combination before it reaches plain
 * Pantoprazole, and a wrong pick reads perfectly plausibly on a signed discharge summary.
 *
 * Confirmed once per drug per ward, then remembered — the same shape the misheard-word glossary
 * uses. The work is a few taps in the first weeks and none after that.
 */
export default function FormularyLink({
  wardId,
  patientId,
  drugKey,
  drugLabel,
  mapped,
}: {
  wardId: string;
  patientId: string;
  drugKey: string;
  drugLabel: string;
  mapped: string | null;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(drugLabel);
  const [options, setOptions] = useState<string[] | null>(null);
  const [pending, startTransition] = useTransition();

  function search() {
    startTransition(async () => setOptions(await findFormularyOptions(wardId, query)));
  }

  if (mapped && !open) {
    return (
      <span className="inline-flex items-center gap-2 print:inline">
        <span className="text-[11px]">{mapped}</span>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="shrink-0 text-[10px] text-accent underline print:hidden"
        >
          change
        </button>
      </span>
    );
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => {
          setOpen(true);
          search();
        }}
        className="text-[10px] text-accent underline print:hidden"
      >
        link to formulary
      </button>
    );
  }

  return (
    <div className="print:hidden">
      <div className="flex gap-1">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              search();
            }
          }}
          autoFocus
          className="min-w-0 flex-1 rounded border border-line bg-card px-1.5 py-1 text-[11px] outline-none focus:border-accent"
        />
        <button type="button" onClick={search} className="shrink-0 text-[11px] font-medium text-accent">
          Search
        </button>
        <button
          type="button"
          onClick={() => {
            setOpen(false);
            setOptions(null);
          }}
          className="shrink-0 text-[11px] text-muted"
        >
          Cancel
        </button>
      </div>

      {pending && <p className="mt-1 text-[10px] text-muted">Searching…</p>}

      {!pending && options !== null && options.length === 0 && (
        <p className="mt-1 text-[10px] text-muted">
          Nothing in the formulary matches that. Try the generic name, or fewer words.
        </p>
      )}

      {!pending && options !== null && options.length > 0 && (
        <ul className="mt-1 max-h-40 overflow-y-auto rounded border border-line">
          {options.map((opt) => (
            <li key={opt} className="border-b border-line last:border-b-0">
              <form
                action={confirmFormularyMapping}
                onSubmit={() => {
                  setOpen(false);
                  setOptions(null);
                }}
              >
                <input type="hidden" name="ward_id" value={wardId} />
                <input type="hidden" name="patient_id" value={patientId} />
                <input type="hidden" name="drug_key" value={drugKey} />
                <input type="hidden" name="item_text" value={opt} />
                <button type="submit" className="w-full px-1.5 py-1 text-left text-[11px] active:bg-chip">
                  {opt}
                </button>
              </form>
            </li>
          ))}
        </ul>
      )}

      {mapped && (
        <form action={clearFormularyMapping} className="mt-1">
          <input type="hidden" name="ward_id" value={wardId} />
          <input type="hidden" name="patient_id" value={patientId} />
          <input type="hidden" name="drug_key" value={drugKey} />
          <button type="submit" className="text-[10px] text-muted underline">
            Unlink
          </button>
        </form>
      )}
    </div>
  );
}
