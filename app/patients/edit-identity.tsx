"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { updatePatientIdentity, type EditPatientState } from "./actions";
import { COMMON_DIAGNOSES, MANAGEMENT_CHOICES } from "@/lib/patients";

type Patient = {
  id: string;
  display_name: string;
  bed: string;
  age_years: number | null;
  sex: string | null;
  primary_diagnosis: string | null;
  surgery_date: string | null;
  planned_surgery_date: string | null;
  management: string | null;
  procedure_text: string | null;
  template_family: string | null;
  template_variant: string | null;
};

/** What the Management select shows right now, given what's stored. Post-op is a fourth
 *  option here even though it is never itself stored — see readManagement in actions.ts. */
function currentManagementChoice(patient: Patient): string {
  if (patient.surgery_date) return "postop";
  return patient.management ?? "";
}

type TemplateChoice = { family: string; variant: string | null; label: string };

/** What to put in the box: the unit's own wording if there is any, otherwise the name of the
 *  template this patient was linked to before free text existed. */
function currentProcedure(patient: Patient, choices: TemplateChoice[]): string {
  if (patient.procedure_text) return patient.procedure_text;
  const match = choices.find(
    (c) =>
      c.family === patient.template_family &&
      (c.variant ?? null) === (patient.template_variant ?? null)
  );
  return match?.label ?? "";
}

/**
 * The pen beside a patient's name. Opens a small dialog holding only name, age and sex — the
 * three facts typed in a hurry at admission and corrected later, and the only way a patient
 * added before age and sex existed can gain them.
 *
 * A dialog rather than its own screen because this gets used mid-round: nothing is navigated
 * away from, so a half-finished correction never costs you your place in the ward list.
 */
export default function EditIdentity({
  patient,
  templateChoices,
  openSignal,
  hideTrigger = false,
}: {
  patient: Patient;
  templateChoices: TemplateChoice[];
  /** Bumped by a parent (the ⋯ menu) to open the dialog without its own pen button. */
  openSignal?: number;
  hideTrigger?: boolean;
}) {
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const [state, formAction, pending] = useActionState<EditPatientState, FormData>(
    updatePatientIdentity,
    { error: null }
  );
  const [management, setManagement] = useState(() => currentManagementChoice(patient));

  // Close only once the save has actually succeeded, so a rejected value stays on screen with
  // its reason instead of the dialog vanishing and the old name still showing behind it.
  useEffect(() => {
    if (state.ok) dialogRef.current?.close();
  }, [state.ok]);

  // A counter rather than a boolean: choosing the same menu item twice has to reopen the
  // dialog, and a boolean that is already true produces no change to react to.
  useEffect(() => {
    if (!openSignal) return;
    // The dialog element stays mounted between opens, so without this a management choice made
    // and saved on a previous open would still be showing on this one, even though the ward
    // list has since revalidated and patient.surgery_date has changed under it. This reacts to
    // a menu click (openSignal), not to patient changing, so it belongs here rather than in a
    // separate effect keyed on patient.
    /* eslint-disable-next-line react-hooks/set-state-in-effect */
    setManagement(currentManagementChoice(patient));
    dialogRef.current?.showModal();
    // Deliberately keyed on openSignal only, not patient: this must fire on every menu click,
    // not on every patient prop change (which happens on every ward-list revalidation).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openSignal]);

  return (
    <>
      {!hideTrigger && (
        <button
          type="button"
          aria-label={`Edit ${patient.display_name}`}
          onClick={(e) => {
            // The ward-list card is a link to the patient. Without this, editing a name would
            // also walk you into their record.
            e.preventDefault();
            e.stopPropagation();
            setManagement(currentManagementChoice(patient));
            dialogRef.current?.showModal();
          }}
          className="shrink-0 rounded-lg p-2 text-muted active:bg-chip"
        >
          <PenIcon />
        </button>
      )}

      <dialog
        ref={dialogRef}
        onClick={(e) => {
          // Tapping the backdrop closes. The panel below stops its own clicks reaching here.
          if (e.target === dialogRef.current) dialogRef.current?.close();
        }}
        className="m-auto w-[min(24rem,calc(100vw-2rem))] rounded-2xl border border-line bg-card p-0 text-foreground backdrop:bg-black/60"
      >
        <form action={formAction} className="flex flex-col gap-5 p-6" onClick={(e) => e.stopPropagation()}>
          <input type="hidden" name="patient_id" value={patient.id} />

          <p className="text-[17px] font-semibold">Edit patient</p>

          <label className="flex flex-col gap-2">
            <span className="text-[15px] text-muted">Name</span>
            <input
              name="display_name"
              required
              defaultValue={patient.display_name}
              autoCapitalize="words"
              className="w-full rounded-[10px] border border-line bg-card px-4 py-3 text-[17px] outline-none focus:border-accent"
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-[15px] text-muted">Bed</span>
            <input
              name="bed"
              required
              defaultValue={patient.bed}
              autoCapitalize="characters"
              className="w-full rounded-[10px] border border-line bg-card px-4 py-3 text-[17px] outline-none focus:border-accent"
            />
            {/* Moving a bed reorders the whole ward list, since the list walks in bed order. */}
            <span className="text-[13px] text-muted">
              Include the location, e.g. SW-12 or ICU-3
            </span>
          </label>

          <div className="flex gap-3">
            <label className="flex flex-1 flex-col gap-2">
              <span className="text-[15px] text-muted">Age</span>
              <input
                type="number"
                name="age_years"
                inputMode="numeric"
                min={0}
                max={120}
                defaultValue={patient.age_years ?? ""}
                className="w-full rounded-[10px] border border-line bg-card px-4 py-3 text-[17px] outline-none focus:border-accent"
              />
            </label>
            <label className="flex flex-1 flex-col gap-2">
              <span className="text-[15px] text-muted">Sex</span>
              <select
                name="sex"
                defaultValue={patient.sex ?? ""}
                className="w-full rounded-[10px] border border-line bg-card px-4 py-3 text-[17px] outline-none focus:border-accent"
              >
                <option value="">—</option>
                <option value="M">M</option>
                <option value="F">F</option>
                <option value="other">Other</option>
              </select>
            </label>
          </div>

          <label className="flex flex-col gap-2">
            <span className="text-[15px] text-muted">Diagnosis</span>
            <input
              name="primary_diagnosis"
              list="diagnosis-suggestions"
              defaultValue={patient.primary_diagnosis ?? ""}
              autoCapitalize="sentences"
              className="w-full rounded-[10px] border border-line bg-card px-4 py-3 text-[17px] outline-none focus:border-accent"
            />
            <datalist id="diagnosis-suggestions">
              {COMMON_DIAGNOSES.map((d) => (
                <option key={d} value={d} />
              ))}
            </datalist>
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-[15px] text-muted">Operation</span>
            <input
              name="procedure"
              list="operation-suggestions"
              defaultValue={currentProcedure(patient, templateChoices)}
              autoCapitalize="none"
              className="w-full rounded-[10px] border border-line bg-card px-4 py-3 text-[17px] outline-none focus:border-accent"
            />
            <datalist id="operation-suggestions">
              {templateChoices.map((t) => (
                <option key={`${t.family}|${t.variant ?? ""}`} value={t.label} />
              ))}
            </datalist>
            <span className="text-[13px] text-muted">
              Type anything. Picking one of the suggestions also brings its checklist.
            </span>
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-[15px] text-muted">Management</span>
            <select
              name="management"
              value={management}
              onChange={(e) => setManagement(e.target.value)}
              className="w-full rounded-[10px] border border-line bg-card px-4 py-3 text-[17px] outline-none focus:border-accent"
            >
              <option value="">Not stated</option>
              {MANAGEMENT_CHOICES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
              <option value="postop">Post-op</option>
            </select>
          </label>

          {/* Only pre-op and post-op say anything about an operation date — conservative and
              workup patients have no operation to date. */}
          {(management === "preop" || management === "postop") && (
            <label className="flex flex-col gap-2">
              <span className="text-[15px] text-muted">
                {management === "postop" ? "Date of operation" : "Planned date of operation"}
              </span>
              <input
                type="date"
                name="operation_date"
                required={management === "postop"}
                defaultValue={
                  management === "postop"
                    ? (patient.surgery_date ?? "")
                    : (patient.planned_surgery_date ?? "")
                }
                className="w-full rounded-[10px] border border-line bg-card px-4 py-3 text-[17px] outline-none focus:border-accent"
              />
              {management === "postop" && (
                <span className="text-[13px] text-muted">
                  Sets the post-op day count shown on the ward list.
                </span>
              )}
            </label>
          )}

          {state.error && (
            <p className="ios-group px-4 py-3 text-[15px] text-orange-700">
              {state.error}
            </p>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => dialogRef.current?.close()}
              className="flex-1 rounded-[10px] bg-card px-4 py-3 text-[17px] text-muted"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={pending}
              className="flex-[2] rounded-[10px] bg-accent px-4 py-3 text-[17px] font-semibold text-accent-ink disabled:opacity-50"
            >
              {pending ? "Saving…" : "Save"}
            </button>
          </div>
        </form>
      </dialog>
    </>
  );
}

function PenIcon() {
  return (
    <svg
      width="18"
      height="18"
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
