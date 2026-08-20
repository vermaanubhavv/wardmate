"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { addPatient, type AddPatientState } from "../actions";
import { LOCATION_CHOICES, MANAGEMENT_CHOICES } from "@/lib/patients";
import SpeakPatient from "./speak-patient";
import type { SpokenPatient } from "@/lib/read-new-patient";

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

  const [management, setManagement] = useState("");

  // Controlled so speech can fill them. Each starts empty and is only ever written to by a
  // field the resident actually spoke — see fillFromSpeech.
  const [fields, setFields] = useState({
    bed: "",
    display_name: "",
    age_years: "",
    sex: "",
    primary_diagnosis: "",
    procedure: "",
  });

  const set = (k: keyof typeof fields) => (v: string) =>
    setFields((f) => ({ ...f, [k]: v }));

  /**
   * Fill in what was heard, and only that.
   *
   * A field nobody spoke is left exactly as it is rather than cleared — speaking a bed after
   * typing a name must not wipe the name, and a half-heard sentence must not undo work
   * already done by hand.
   */
  function fillFromSpeech(p: SpokenPatient) {
    setFields((f) => ({
      bed: p.bed ?? f.bed,
      display_name: p.name ?? f.display_name,
      age_years: p.age_years !== null ? String(p.age_years) : f.age_years,
      sex: p.sex ?? f.sex,
      primary_diagnosis: p.diagnosis ?? f.primary_diagnosis,
      procedure: p.procedure ?? f.procedure,
    }));
  }

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <input type="hidden" name="ward_id" value={wardId} />

      {/* Above the boxes it fills, so the order on screen is the order of the work. */}
      <SpeakPatient onParsed={fillFromSpeech} />

      {/* Bed and location together: the bed label often already says ICU, but the label is
          free text and the landing page counts real rows, so where a patient is gets asked
          rather than read out of how somebody happened to write their bed. */}
      <div className="flex gap-3">
        <div className="flex-[3]">
          <Field label="Bed" hint="e.g. SW-12">
            <input
              name="bed"
              required
              autoFocus
              autoCapitalize="characters"
              value={fields.bed}
              onChange={(e) => set("bed")(e.target.value)}
              className="w-full ios-group px-4 py-4 text-base outline-none focus:border-accent"
            />
          </Field>
        </div>
        <div className="flex-[2]">
          <Field label="Location">
            <select
              name="location"
              defaultValue="ward"
              className="w-full ios-group px-4 py-4 text-base outline-none focus:border-accent"
            >
              {LOCATION_CHOICES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </Field>
        </div>
      </div>

      <Field label="Name">
        <input
          name="display_name"
          required
          autoCapitalize="words"
          value={fields.display_name}
          onChange={(e) => set("display_name")(e.target.value)}
          className="w-full ios-group px-4 py-4 text-base outline-none focus:border-accent"
        />
      </Field>

      <div className="flex gap-3">
        <div className="flex-1">
          <Field label="UHID / IP no.">
            <input
              name="uhid_ip_no"
              className="w-full ios-group px-4 py-4 text-base outline-none focus:border-accent"
            />
          </Field>
        </div>
        <div className="flex-1">
          <Field label="MRD no.">
            <input
              name="mrd_no"
              className="w-full ios-group px-4 py-4 text-base outline-none focus:border-accent"
            />
          </Field>
        </div>
      </div>

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
              value={fields.age_years}
              onChange={(e) => set("age_years")(e.target.value)}
              className="w-full ios-group px-4 py-4 text-base outline-none focus:border-accent"
            />
          </Field>
        </div>
        <div className="flex-1">
          <Field label="Sex">
            <select
              name="sex"
              value={fields.sex}
              onChange={(e) => set("sex")(e.target.value)}
              className="w-full ios-group px-4 py-4 text-base outline-none focus:border-accent"
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
          value={fields.primary_diagnosis}
          onChange={(e) => set("primary_diagnosis")(e.target.value)}
          className="w-full ios-group px-4 py-4 text-base outline-none focus:border-accent"
        />
        <datalist id="diagnosis-suggestions">
          {diagnosisSuggestions.map((d) => (
            <option key={d} value={d} />
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
          className="w-full ios-group px-4 py-4 text-base outline-none focus:border-accent"
        />
      </Field>

      {/* Management leads, and decides what else is worth asking. A conservative or workup
          patient has no operation to name and no date to give, so neither is put in front of
          somebody admitting at 3am. "Post-op" is offered here but never stored as management —
          see readManagement in ../actions.ts; choosing it records the surgery date, which is
          what the POD count and the POST OP badge are both derived from. */}
      <Field label="Management" hint="Leave blank until the unit has decided">
        <select
          name="management"
          value={management}
          onChange={(e) => setManagement(e.target.value)}
          className="w-full ios-group px-4 py-4 text-base outline-none focus:border-accent"
        >
          <option value="">Not stated</option>
          {MANAGEMENT_CHOICES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
          <option value="postop">Post-op</option>
        </select>
      </Field>

      {(management === "preop" || management === "postop") && (
        <>
          <Field
            label="Operation"
            hint="Type anything. Picking one of the suggestions also brings its checklist of what to mention."
          >
            <input
              name="procedure"
              list="operation-suggestions"
              value={fields.procedure}
              onChange={(e) => set("procedure")(e.target.value)}
              autoCapitalize="none"
              className="w-full ios-group px-4 py-4 text-base outline-none focus:border-accent"
            />
            <datalist id="operation-suggestions">
              {templateChoices.map((t) => (
                <option key={`${t.family}|${t.variant ?? ""}`} value={t.label} />
              ))}
            </datalist>
          </Field>

          <Field
            label={management === "postop" ? "Date of operation" : "Planned date of operation"}
            hint={
              management === "postop"
                ? "The day count on the card is taken from this"
                : "Left blank if the date is not fixed yet"
            }
          >
            <input
              type="date"
              name="operation_date"
              required={management === "postop"}
              // An operation that has happened cannot be in the future. A planned one is
              // deliberately unbounded: a postponed list still needs its old date recorded.
              max={management === "postop" ? localToday : undefined}
              defaultValue={management === "postop" ? localToday : ""}
              className="w-full ios-group px-4 py-4 text-base outline-none focus:border-accent"
            />
          </Field>
        </>
      )}

      {/* Nothing spoken is lost because a dropdown above it happens to be unset. The visible
          Operation box only appears for pre-op and post-op, but if the resident named an
          operation out loud it still goes with the patient. */}
      {management !== "preop" && management !== "postop" && fields.procedure && (
        <input type="hidden" name="procedure" value={fields.procedure} />
      )}

      {state.error && (
        <p className="ios-group px-4 py-3 text-[15px] text-orange-700">
          {state.error}
        </p>
      )}

      <div className="flex gap-3 pt-2">
        <Link
          href="/ward"
          className="flex-1 rounded-[10px] border border-line px-4 py-4 text-center text-base text-muted"
        >
          Cancel
        </Link>
        <button
          type="submit"
          disabled={pending}
          className="flex-[2] rounded-[10px] bg-accent px-4 py-3 text-[17px] font-semibold text-accent-ink disabled:opacity-50"
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
      <span className="text-[15px] text-muted">{label}</span>
      {children}
      {hint && <span className="text-[13px] text-muted">{hint}</span>}
    </label>
  );
}
