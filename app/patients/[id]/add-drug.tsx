"use client";

import { useState, useTransition } from "react";
import MedicationEditor, { medLine } from "./medication-editor";
import { replaceActiveMedications } from "./note/actions";

/** "+ Add a drug" on the patient page's Plan & treatment: the structured picker (form, drug,
 *  ward-formulary strength, route, schedule), added to the standing drug list in one tap. */
export default function AddDrug({ patientId, wardId, current }: { patientId: string; wardId: string; current: string[] }) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  if (!open)
    return (
      <button type="button" onClick={() => setOpen(true)} className="tap px-4 py-2.5 text-left text-subhead font-medium text-accent">
        + Add a drug
      </button>
    );
  return (
    <div className="px-4 py-2.5">
      <MedicationEditor
        wardId={wardId}
        label=""
        value={null}
        onSave={(label, value) =>
          start(async () => {
            const r = await replaceActiveMedications(patientId, [...current, medLine(label, value)]);
            if (r.ok) setOpen(false);
            setError(r.ok ? null : (r.error ?? "Could not save."));
          })
        }
        onCancel={() => setOpen(false)}
      />
      {pending && <p className="mt-1 text-footnote text-muted">Saving…</p>}
      {error && <p className="mt-1 text-footnote text-warn-fg">{error}</p>}
    </div>
  );
}
