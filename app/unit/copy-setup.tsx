"use client";

import { useActionState } from "react";
import { copySetupFromWard, type CopySetupState } from "./actions";

/**
 * "Make this unit's paperwork the same as that one's."
 *
 * Offered only where it is true: a doctor with a single unit has nothing to copy from, and the
 * section does not render at all — see the Unit page.
 */
export default function CopySetup({
  wardId,
  options,
}: {
  wardId: string;
  options: { id: string; name: string }[];
}) {
  const [state, formAction, pending] = useActionState<CopySetupState, FormData>(
    copySetupFromWard,
    null
  );

  return (
    <form action={formAction} className="ios-group flex flex-col gap-3 p-4">
      <input type="hidden" name="ward_id" value={wardId} />
      <label className="flex flex-col gap-1.5">
        <span className="text-[13px] text-muted">Copy from</span>
        <select
          name="source_ward_id"
          defaultValue=""
          className="h-12 w-full rounded-[10px] border border-line bg-card px-3 text-[17px] outline-none focus:border-accent"
        >
          <option value="">Choose a unit…</option>
          {options.map((option) => (
            <option key={option.id} value={option.id}>
              {option.name}
            </option>
          ))}
        </select>
      </label>
      <button
        disabled={pending}
        className="rounded-[10px] bg-accent px-4 py-2.5 text-[15px] font-semibold text-accent-ink disabled:opacity-60"
      >
        {pending ? "Copying…" : "Copy setup"}
      </button>
      {state && (
        <p className={"text-[13px] leading-relaxed " + (state.ok ? "text-muted" : "text-orange-700")}>
          {state.message}
        </p>
      )}
      <p className="text-[13px] leading-relaxed text-muted">
        Brings across the other unit&rsquo;s formats — progress notes, discharge layout, OT
        notes, investigation slip, logo — its discharge heading, its hospital formulary and the drugs already confirmed against it.
        The heading&rsquo;s unit line is changed to this unit&rsquo;s name; everything else is
        copied exactly. Whatever this unit has now is replaced. Patients are never touched.
      </p>
    </form>
  );
}
