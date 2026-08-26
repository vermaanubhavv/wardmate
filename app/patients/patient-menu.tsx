"use client";

import { useEffect, useRef, useState } from "react";
import { stripPatientHonorific } from "@/lib/patients";
import EditIdentity from "./edit-identity";
import { deletePatientForever, dischargePatient } from "./actions";

type Patient = {
  id: string;
  display_name: string;
  bed: string;
  uhid_ip_no: string | null;
  mrd_no: string | null;
  age_years: number | null;
  sex: string | null;
  primary_diagnosis: string | null;
  location: string;
  surgery_date: string | null;
  planned_surgery_date: string | null;
  management: string | null;
  procedure_text: string | null;
  template_family: string | null;
  template_variant: string | null;
  entry_count?: number;
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
  const patientName = stripPatientHonorific(patient.display_name);
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
        aria-label={`More for ${patientName}`}
        onClick={(e) => {
          // The card is a link to the patient; without this the menu also walks you in.
          e.preventDefault();
          e.stopPropagation();
          setOpen((o) => !o);
        }}
        className="shrink-0 rounded-lg px-2 py-1 text-lg leading-none text-muted active:bg-chip"
      >
        ⋯
      </button>

      {open && (
        <div
          className="absolute right-0 top-8 z-20 w-56 overflow-hidden ios-group shadow-lg"
          onClick={(e) => {
            // This menu is already a sibling of the patient link, so it only needs to stop
            // propagation. Preventing the default here also cancels the submit on Remove and
            // Delete, making both menu actions appear to do nothing.
            e.stopPropagation();
          }}
        >
          <button
            type="button"
            onClick={openEditor}
            className="block w-full px-4 py-3 text-left text-[17px] active:bg-chip"
          >
            Change bed
          </button>
          <button
            type="button"
            onClick={openEditor}
            className="block w-full border-t border-line px-4 py-3 text-left text-[17px] active:bg-chip"
          >
            Change name, age, sex
          </button>

          <form action={dischargePatient} className="border-t border-line">
            <input type="hidden" name="patient_id" value={patient.id} />
            <button
              type="submit"
              onClick={(e) => {
                if (
                  !confirm(
                    `Discharge ${patientName} from the ward?\n\nTheir record will move to the Discharged list and can be restored if needed.`
                  )
                ) {
                  e.preventDefault();
                }
              }}
              className="block w-full px-4 py-3 text-left text-[17px] active:bg-chip"
            >
              Discharge from ward
            </button>
          </form>

          <form action={deletePatientForever} className="border-t border-line">
            <input type="hidden" name="patient_id" value={patient.id} />
            <button
              type="submit"
              onClick={(e) => {
                if (
                  !confirm(
                    `Delete ${patientName}?\n\nThey will move to the trash bin now, remain recoverable for 7 days, and then be permanently deleted automatically.`
                  )
                ) {
                  e.preventDefault();
                }
              }}
              className="block w-full px-4 py-3 text-left text-[17px] text-red-600 active:bg-chip"
            >
              Delete permanently
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
