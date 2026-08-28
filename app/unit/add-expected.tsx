"use client";

import { useActionState } from "react";
import { addExpectedMembers, type ExpectedState } from "./actions";

/** Paste the unit list as it arrives: one per line, designation after a comma. */
export default function AddExpected({ wardId }: { wardId: string }) {
  const [state, formAction, pending] = useActionState<ExpectedState, FormData>(
    addExpectedMembers,
    null
  );

  return (
    <form action={formAction} className="ios-group flex flex-col gap-3 p-4">
      <input type="hidden" name="ward_id" value={wardId} />
      <textarea
        name="names"
        rows={6}
        placeholder={"Dr Mehta, Consultant\nDr Rao, AP\nDr Sharma, SR\nDr Iqbal, JR-2\nDr Nair, Intern"}
        className="w-full rounded-[10px] border border-line bg-card px-3 py-2.5 text-[15px] leading-relaxed outline-none focus:border-accent"
      />
      <button
        disabled={pending}
        className="rounded-[10px] bg-accent px-4 py-2.5 text-[15px] font-semibold text-accent-ink disabled:opacity-60"
      >
        {pending ? "Adding…" : "Add to list"}
      </button>
      {state && (
        <p className={"text-[13px] " + (state.ok ? "text-muted" : "text-orange-700")}>
          {state.message}
        </p>
      )}
      <p className="text-[13px] leading-relaxed text-muted">
        One person per line. The part after the comma is their designation — leave it out if you
        are not sure. This does not create their account; they still sign in themselves and tap
        their own name.
      </p>
    </form>
  );
}
