"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { addPatient, type AddPatientState } from "../actions";
import { MANAGEMENT_CHOICES } from "@/lib/patients";

/**
 * The one screen in the app where typing is allowed, because it happens once per admission
 * rather than once per round.
 */
export default function PatientForm({
  wardId,
  diagnosisSuggestions,
  templateChoices,
}: {
  wardId: string;
  diagnosisSuggestions: string[];
  templateChoices: { family: string; variant: string | null; label: string }[];
}) {
  const [state, formAction, pending] = useActionState<AddPatientState, FormData>(addPatient, {
    error: null,
  });

  // Today according to the phone, not the server. A server in UTC would offer yesterday's
  // date to anyone admitting a patient before 05:30 IST.
  const today = new Date();
  const localToday = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  const [operated, setOperated] = useState(false);

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <input type="hidden" name="ward_id" value={wardId} />

      <Field label="Bed" hint="Include the location, e.g. SW-12 or ICU-3">
        <input
          name="bed"
          required
          autoFocus
          autoCapitalize="characters"
          className="w-full rounded-xl border border-line bg-card px-4 py-4 text-base outline-none focus:border-accent"
        />
      </Field>

      <Field label="Name">
        <input
          name="display_name"
          required
          autoCapitalize="words"
          className="w-full rounded-xl border border-line bg-card px-4 py-4 text-base outline-none focus:border-accent"
        />
      </Field>

      {/* Age and sex sit on one row, in the order they are spoken and written: "62/M". */}
      <div className="flex gap-3">
        <div className="flex-1">
          <Field label="Age" hint="Years">
            <input
              type="number"
              name="age_years"
              inputMode="numeric"
              min={0}
              max={120}
              className="w-full rounded-xl border border-line bg-card px-4 py-4 text-base outline-none focus:border-accent"
            />
          </Field>
        </div>
        <div className="flex-1">
          <Field label="Sex">
            <select
              name="sex"
              defaultValue=""
              className="w-full rounded-xl border border-line bg-card px-4 py-4 text-base outline-none focus:border-accent"
            >
              <option value="">—</option>
              <option value="M">M</option>
              <option value="F">F</option>
              <option value="other">Other</option>
            </select>
          </Field>
        </div>
      </div>

      <Field label="Diagnosis" hint="Type freely — past entries are offered as you type">
        <input
          name="primary_diagnosis"
          list="diagnosis-suggestions"
          autoCapitalize="none"
          className="w-full rounded-xl border border-line bg-card px-4 py-4 text-base outline-none focus:border-accent"
        />
        <datalist id="diagnosis-suggestions">
          {diagnosisSuggestions.map((d) => (
            <option key={d} value={d} />
          ))}
        </datalist>
      </Field>

      <Field
        label="Operation"
        hint="Type anything. Picking one of the suggestions also brings its checklist of what to mention."
      >
        <input
          name="procedure"
          list="operation-suggestions"
          autoCapitalize="none"
          className="w-full rounded-xl border border-line bg-card px-4 py-4 text-base outline-none focus:border-accent"
        />
        <datalist id="operation-suggestions">
          {templateChoices.map((t) => (
            <option key={`${t.family}|${t.variant ?? ""}`} value={t.label} />
          ))}
        </datalist>
      </Field>

      <Field label="Admitted on">
        <input
          type="date"
          name="admitted_on"
          required
          defaultValue={localToday}
          max={localToday}
          className="w-full rounded-xl border border-line bg-card px-4 py-4 text-base outline-none focus:border-accent"
        />
      </Field>

      <label className="flex items-center gap-3 text-base">
        <input
          type="checkbox"
          checked={operated}
          onChange={(e) => setOperated(e.target.checked)}
          className="h-5 w-5 accent-sky-400"
        />
        <span>Has been operated</span>
      </label>

      {operated ? (
        <Field label="Date of surgery" hint="The day count on the card is taken from this">
          <input
            type="date"
            name="surgery_date"
            required
            defaultValue={localToday}
            max={localToday}
            className="w-full rounded-xl border border-line bg-card px-4 py-4 text-base outline-none focus:border-accent"
          />
        </Field>
      ) : (
        // Only asked for patients not yet operated. Once there is a date of surgery the
        // patient is post-op, and that is taken from the date rather than chosen here.
        <Field label="Management" hint="Leave blank until the unit has decided">
          <select
            name="management"
            defaultValue=""
            className="w-full rounded-xl border border-line bg-card px-4 py-4 text-base outline-none focus:border-accent"
          >
            <option value="">Not stated</option>
            {MANAGEMENT_CHOICES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </Field>
      )}

      {state.error && (
        <p className="rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
          {state.error}
        </p>
      )}

      <div className="flex gap-3 pt-2">
        <Link
          href="/"
          className="flex-1 rounded-xl border border-line px-4 py-4 text-center text-base text-muted"
        >
          Cancel
        </Link>
        <button
          type="submit"
          disabled={pending}
          className="flex-[2] rounded-xl bg-accent px-4 py-4 text-base font-semibold text-slate-900 disabled:opacity-50"
        >
          {pending ? "Adding…" : "Add patient"}
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-sm text-muted">{label}</span>
      {children}
      {hint && <span className="text-xs text-muted">{hint}</span>}
    </label>
  );
}
