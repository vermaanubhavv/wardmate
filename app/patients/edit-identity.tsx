"use client";

import { useActionState, useEffect, useRef } from "react";
import { updatePatientIdentity, type EditPatientState } from "./actions";
import { MANAGEMENT_CHOICES } from "@/lib/patients";

type Patient = {
  id: string;
  display_name: string;
  age_years: number | null;
  sex: string | null;
  surgery_date: string | null;
  management: string | null;
  template_family: string | null;
  template_variant: string | null;
};

type TemplateChoice = { family: string; variant: string | null; label: string };

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
}: {
  patient: Patient;
  templateChoices: TemplateChoice[];
}) {
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const [state, formAction, pending] = useActionState<EditPatientState, FormData>(
    updatePatientIdentity,
    { error: null }
  );

  // Close only once the save has actually succeeded, so a rejected value stays on screen with
  // its reason instead of the dialog vanishing and the old name still showing behind it.
  useEffect(() => {
    if (state.ok) dialogRef.current?.close();
  }, [state.ok]);

  return (
    <>
      <button
        type="button"
        aria-label={`Edit ${patient.display_name}`}
        onClick={(e) => {
          // The ward-list card is a link to the patient. Without this, editing a name would
          // also walk you into their record.
          e.preventDefault();
          e.stopPropagation();
          dialogRef.current?.showModal();
        }}
        className="shrink-0 rounded-lg p-2 text-muted active:bg-slate-700/60"
      >
        <PenIcon />
      </button>

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

          <p className="text-base font-semibold">Edit patient</p>

          <label className="flex flex-col gap-2">
            <span className="text-sm text-muted">Name</span>
            <input
              name="display_name"
              required
              defaultValue={patient.display_name}
              autoCapitalize="words"
              className="w-full rounded-xl border border-line bg-background px-4 py-4 text-base outline-none focus:border-accent"
            />
          </label>

          <div className="flex gap-3">
            <label className="flex flex-1 flex-col gap-2">
              <span className="text-sm text-muted">Age</span>
              <input
                type="number"
                name="age_years"
                inputMode="numeric"
                min={0}
                max={120}
                defaultValue={patient.age_years ?? ""}
                className="w-full rounded-xl border border-line bg-background px-4 py-4 text-base outline-none focus:border-accent"
              />
            </label>
            <label className="flex flex-1 flex-col gap-2">
              <span className="text-sm text-muted">Sex</span>
              <select
                name="sex"
                defaultValue={patient.sex ?? ""}
                className="w-full rounded-xl border border-line bg-background px-4 py-4 text-base outline-none focus:border-accent"
              >
                <option value="">—</option>
                <option value="M">M</option>
                <option value="F">F</option>
                <option value="other">Other</option>
              </select>
            </label>
          </div>

          <label className="flex flex-col gap-2">
            <span className="text-sm text-muted">Operation</span>
            <select
              name="template"
              defaultValue={
                patient.template_family
                  ? `${patient.template_family}|${patient.template_variant ?? ""}`
                  : ""
              }
              className="w-full rounded-xl border border-line bg-background px-4 py-4 text-base outline-none focus:border-accent"
            >
              <option value="">None recorded</option>
              {templateChoices.map((t) => (
                <option
                  key={`${t.family}|${t.variant ?? ""}`}
                  value={`${t.family}|${t.variant ?? ""}`}
                >
                  {t.label}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-sm text-muted">Management</span>
            {patient.surgery_date ? (
              // Not a choice once an operation has been recorded: the surgery date already
              // settles it, and letting it be overridden here would put "PRE OP" next to a
              // post-op day count.
              <p className="rounded-xl border border-line bg-background px-4 py-4 text-base text-muted">
                Post-op — set by the date of surgery
              </p>
            ) : (
              <select
                name="management"
                defaultValue={patient.management ?? ""}
                className="w-full rounded-xl border border-line bg-background px-4 py-4 text-base outline-none focus:border-accent"
              >
                <option value="">Not stated</option>
                {MANAGEMENT_CHOICES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            )}
          </label>

          {state.error && (
            <p className="rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
              {state.error}
            </p>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => dialogRef.current?.close()}
              className="flex-1 rounded-xl border border-line px-4 py-4 text-base text-muted"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={pending}
              className="flex-[2] rounded-xl bg-accent px-4 py-4 text-base font-semibold text-slate-900 disabled:opacity-50"
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
