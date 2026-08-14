"use client";

import { useEffect, useRef, useState } from "react";
import EditIdentity from "./edit-identity";
import { removePatient } from "./actions";

type Patient = {
  id: string;
  display_name: string;
  bed: string;
  age_years: number | null;
  sex: string | null;
  surgery_date: string | null;
  management: string | null;
  procedure_text: string | null;
  template_family: string | null;
  template_variant: string | null;
};

type TemplateChoice = { family: string; variant: string | null; label: string };

/**
 * The ⋯ on a patient's card.
 *
 * Both edit items open the same dialog — it already holds bed, name, age and sex — but they
 * are listed separately because at a bedside you are looking for the thing you came to
 * change, not for a screen that contains it.
 */
export default function PatientMenu({
  patient,
  templateChoices,
}: {
  patient: Patient;
  templateChoices: TemplateChoice[];
}) {
  const [open, setOpen] = useState(false);
  const [editSignal, setEditSignal] = useState(0);
  const rootRef = useRef<HTMLDivElement | null>(null);

  // A tap anywhere else closes it. Without this the menu survives a scroll and sits over
  // the next patient's card.
  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [open]);

  function openEditor() {
    setOpen(false);
    setEditSignal((n) => n + 1);
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-label={`More for ${patient.display_name}`}
        onClick={(e) => {
          // The card is a link to the patient; without this the menu also walks you in.
          e.preventDefault();
          e.stopPropagation();
          setOpen((o) => !o);
        }}
        className="shrink-0 rounded-lg px-2 py-1 text-lg leading-none text-muted active:bg-slate-700/60"
      >
        ⋯
      </button>

      {open && (
        <div
          className="absolute right-0 top-8 z-20 w-56 overflow-hidden rounded-xl border border-line bg-card shadow-lg"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          <button
            type="button"
            onClick={openEditor}
            className="block w-full px-4 py-3 text-left text-sm active:bg-slate-700/60"
          >
            Change bed
          </button>
          <button
            type="button"
            onClick={openEditor}
            className="block w-full border-t border-line px-4 py-3 text-left text-sm active:bg-slate-700/60"
          >
            Change name, age, sex
          </button>

          <form action={removePatient} className="border-t border-line">
            <input type="hidden" name="patient_id" value={patient.id} />
            <button
              type="submit"
              // Asked before it happens, because the ⋯ is a small target next to a card you
              // may only have meant to open, and this is the one item that changes the ward.
              onClick={(e) => {
                if (
                  !confirm(
                    `Remove ${patient.display_name} from the ward list?\n\nTheir record is kept — nothing recorded about them is deleted.`
                  )
                ) {
                  e.preventDefault();
                }
              }}
              className="block w-full px-4 py-3 text-left text-sm text-red-300 active:bg-slate-700/60"
            >
              Remove from ward
            </button>
          </form>
        </div>
      )}

      {/* No pen of its own — the menu above is its only way in. */}
      <EditIdentity
        patient={patient}
        templateChoices={templateChoices}
        openSignal={editSignal}
        hideTrigger
      />
    </div>
  );
}
