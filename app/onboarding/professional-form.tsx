"use client";

import { useActionState } from "react";
import { completeProfessionalOnboarding, type ProfessionalState } from "./actions";

const initialState: ProfessionalState = { error: null };
const designations = ["Intern", "JR-1", "JR-2", "JR-3", "SR", "AP", "Medical Officer", "Consultant"];

export default function ProfessionalForm() {
  const [state, formAction, pending] = useActionState(completeProfessionalOnboarding, initialState);
  return (
    <form action={formAction} className="ios-group mt-6 flex flex-col gap-3 p-4">
      <Field label="Full name" name="name" placeholder="Dr. Asha Mehta" autoCapitalize="words" />
      <Field label="Medical registration or intern ID" name="registration_number" placeholder="e.g. DMC/R/12345" autoCapitalize="characters" />
      <Field label="Hospital" name="hospital" placeholder="Name of hospital" autoCapitalize="words" />
      <Field label="Department" name="department" placeholder="e.g. General Surgery" autoCapitalize="words" />
      <label className="flex flex-col gap-1.5">
        <span className="text-[15px] text-muted">Designation</span>
        <select name="designation" required defaultValue="" className="h-12 rounded-[10px] border border-line bg-card px-3 text-[17px] outline-none focus:border-accent">
          <option value="" disabled>Select designation</option>
          {designations.map((designation) => <option key={designation} value={designation}>{designation}</option>)}
        </select>
      </label>
      <label className="flex items-start gap-2 text-[13px] leading-relaxed text-muted">
        <input name="attestation" type="checkbox" required className="mt-0.5 h-4 w-4 accent-accent" />
        <span>I confirm that I am a doctor or medical intern and these details are accurate.</span>
      </label>
      {state.error && <p className="text-[13px] text-red-700">{state.error}</p>}
      <button disabled={pending} className="rounded-[10px] bg-accent px-4 py-3 text-[17px] font-semibold text-accent-ink disabled:opacity-60">
        {pending ? "Continuing…" : "Continue"}
      </button>
    </form>
  );
}

function Field({ label, name, placeholder, autoCapitalize }: { label: string; name: string; placeholder: string; autoCapitalize: "words" | "characters" }) {
  return <label className="flex flex-col gap-1.5"><span className="text-[15px] text-muted">{label}</span><input name={name} required minLength={name === "registration_number" ? 4 : 2} maxLength={name === "registration_number" ? 40 : 160} placeholder={placeholder} autoCapitalize={autoCapitalize} className="h-12 rounded-[10px] border border-line bg-card px-3 text-[17px] outline-none focus:border-accent" /></label>;
}
