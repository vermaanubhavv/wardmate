"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
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
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  // The menu is rendered in a portal on <body>, not inside this card. The row list is an
  // .ios-group, which clips its corners with overflow:hidden — a menu positioned inside it
  // was cut off at the card's edge (see the "doesn't show fully" report). Fixed positioning
  // from <body> escapes that; the trade-off is we place it by hand from the button's rect.
  const [coords, setCoords] = useState<{ top: number; right: number } | null>(null);

  useEffect(() => {
    if (!open) return;
    const place = () => {
      const r = buttonRef.current?.getBoundingClientRect();
      if (!r) return;
      setCoords({ top: r.bottom + 4, right: Math.max(8, window.innerWidth - r.right) });
    };
    place();
    // Any scroll or resize would leave the menu stranded where the button used to be, so we
    // just close it — the same call the old outside-click made, and what a bedside tap on the
    // list expects anyway.
    const dismiss = () => setOpen(false);
    window.addEventListener("resize", dismiss);
    window.addEventListener("scroll", dismiss, true);
    return () => {
      window.removeEventListener("resize", dismiss);
      window.removeEventListener("scroll", dismiss, true);
    };
  }, [open]);

  // A tap anywhere outside the button or the menu closes it.
  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      const t = e.target as Node;
      if (buttonRef.current?.contains(t) || menuRef.current?.contains(t)) return;
      setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("click", close);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("click", close);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function openEditor() {
    setOpen(false);
    setEditSignal((n) => n + 1);
  }

  return (
    <div className="relative">
      <button
        ref={buttonRef}
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

      {open &&
        coords &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            ref={menuRef}
            style={{ position: "fixed", top: coords.top, right: coords.right }}
            className="z-50 w-56 overflow-hidden ios-group shadow-lg"
            onClick={(e) => {
              // Stop the tap reaching the card link underneath. Preventing the default here
              // would also cancel the submit on Discharge and Delete.
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
          </div>,
          document.body
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
