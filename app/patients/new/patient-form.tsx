"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { addPatient, type AddPatientState } from "../actions";
import { LOCATION_CHOICES, MANAGEMENT_CHOICES } from "@/lib/patients";
import DiagnosisCombobox from "../diagnosis-combobox";
import SpeakPatient from "./speak-patient";
import type { SpokenPatient } from "@/lib/read-new-patient";
import AdmissionPaper from "./admission-paper";
import type { AdmissionPaperPatient } from "@/lib/read-admission-paper";

/**
 * The one screen in the app where typing is allowed, because it happens once per admission
 * rather than once per round.
 */
/** Regimens the box suggests. Suggestions only — every unit writes these its own way and
 *  typing anything is allowed. Mirrors the list in ../edit-identity.tsx. */
const REGIMEN_SUGGESTIONS = [
  "ABVD", "AC-T", "BEACOPP", "BEP", "CAPOX", "DaraVRd", "FOLFIRI", "FOLFOX",
  "R-CHOP", "TCH", "VRd", "carboplatin-paclitaxel", "hyper-CVAD",
];

export default function PatientForm({
  wardId,
  diagnosisSuggestions,
  templateChoices,
  specialty = "general_surgery",
}: {
  wardId: string;
  diagnosisSuggestions: string[];
  templateChoices: { family: string; variant: string | null; label: string }[];
  /** The unit's department. Only an oncology unit is asked for a chemotherapy cycle. */
  specialty?: string;
}) {
  const oncology = specialty === "medical_oncology";
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
    uhid_ip_no: "",
    mrd_no: "",
    regimen: "",
    cycle_number: "",
    cycle_started_on: "",
  });

  // Admission date is controlled separately: it starts at today's date and a paper may
  // replace it, whereas everything above starts blank.
  const [admittedOn, setAdmittedOn] = useState("");

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
      uhid_ip_no: f.uhid_ip_no,
      mrd_no: f.mrd_no,
      regimen: f.regimen,
      cycle_number: f.cycle_number,
      cycle_started_on: f.cycle_started_on,
    }));
  }

  /**
   * A paper and speech behave the same way: fill only what was actually found.
   *
   * Every box the paper did not carry keeps whatever is already in it. Photographing a second
   * paper therefore adds to the form rather than resetting it, and a box typed by hand is
   * never overwritten by a null.
   */
  function fillFromPaper(p: AdmissionPaperPatient) {
    setFields((f) => ({
      ...f,
      bed: p.bed ?? f.bed,
      display_name: p.name ?? f.display_name,
      age_years: p.age_years !== null ? String(p.age_years) : f.age_years,
      sex: p.sex ?? f.sex,
      uhid_ip_no: p.uhid_ip_no ?? f.uhid_ip_no,
      mrd_no: p.mrd_no ?? f.mrd_no,
      primary_diagnosis: p.diagnosis ?? f.primary_diagnosis,
      procedure: p.procedure ?? f.procedure,
      // Only offered where they mean something. A regimen read off a paper on a surgical ward
      // has no field to land in, and filling a hidden box would store it unseen.
      regimen: oncology ? (p.regimen ?? f.regimen) : f.regimen,
      cycle_number: oncology
        ? (p.cycle_number !== null ? String(p.cycle_number) : f.cycle_number)
        : f.cycle_number,
      cycle_started_on: oncology ? (p.cycle_started_on ?? f.cycle_started_on) : f.cycle_started_on,
    }));
    if (p.admitted_on) setAdmittedOn(p.admitted_on);

    // DELIBERATELY NOT SET: management. An operation named on the paper does say the patient
    // arrives already operated, but choosing "Post-op" here would put a date of operation box
    // on screen pre-filled with today — a date nobody read off anything. The operation text is
    // kept (a hidden input carries it either way), and the resident chooses the phase and
    // types the real date.
  }

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <input type="hidden" name="ward_id" value={wardId} />

      {/* Above the boxes it fills, so the order on screen is the order of the work. */}
      <SpeakPatient onParsed={fillFromSpeech} />
      <AdmissionPaper onParsed={fillFromPaper} oncology={oncology} />

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
          <Field label="IP no.">
            <input
              name="uhid_ip_no"
              value={fields.uhid_ip_no}
              onChange={(e) => set("uhid_ip_no")(e.target.value)}
              className="w-full ios-group px-4 py-4 text-base outline-none focus:border-accent"
            />
          </Field>
        </div>
        <div className="flex-1">
          <Field label="MRD no.">
            <input
              name="mrd_no"
              value={fields.mrd_no}
              onChange={(e) => set("mrd_no")(e.target.value)}
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

      <Field label="Diagnosis" hint="The common ones are offered; type freely for anything else">
        <DiagnosisCombobox
          name="primary_diagnosis"
          value={fields.primary_diagnosis}
          onChange={set("primary_diagnosis")}
          extraSuggestions={diagnosisSuggestions}
          className="w-full ios-group px-4 py-4 text-base outline-none focus:border-accent"
        />
      </Field>

      <Field label="Admitted on">
        <input
          type="date"
          name="admitted_on"
          required
          value={admittedOn || localToday}
          max={localToday}
          onChange={(e) => setAdmittedOn(e.target.value)}
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

      {/* Chemotherapy. Asked only on an oncology unit, and asked at admission because the
          cycle is what the whole ward round then counts by — a patient admitted without it
          shows a hospital day until somebody goes back and fills it in. */}
      {oncology && (
        <>
          <Field
            label="Regimen"
            hint="Type anything. Leave blank if the patient is not on a named regimen"
          >
            <input
              name="regimen"
              list="new-regimen-suggestions"
              value={fields.regimen}
              onChange={(e) => set("regimen")(e.target.value)}
              autoCapitalize="characters"
              placeholder="e.g. R-CHOP"
              className="w-full ios-group px-4 py-4 text-base outline-none focus:border-accent"
            />
            <datalist id="new-regimen-suggestions">
              {REGIMEN_SUGGESTIONS.map((r) => (
                <option key={r} value={r} />
              ))}
            </datalist>
          </Field>

          {/* Only once there is a regimen to have a cycle OF. */}
          {fields.regimen.trim() && (
            <div className="flex gap-3">
              <div className="w-28 shrink-0">
                <Field label="Cycle">
                  <input
                    type="number"
                    name="cycle_number"
                    inputMode="numeric"
                    min={1}
                    max={60}
                    value={fields.cycle_number}
                    onChange={(e) => set("cycle_number")(e.target.value)}
                    className="w-full ios-group px-4 py-4 text-base outline-none focus:border-accent"
                  />
                </Field>
              </div>
              <div className="min-w-0 flex-1">
                <Field label="Cycle started" hint="Day 1 is the day the drugs went up">
                  <input
                    type="date"
                    name="cycle_started_on"
                    max={localToday}
                    value={fields.cycle_started_on}
                    onChange={(e) => set("cycle_started_on")(e.target.value)}
                    className="w-full ios-group px-4 py-4 text-base outline-none focus:border-accent"
                  />
                </Field>
              </div>
            </div>
          )}
        </>
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
