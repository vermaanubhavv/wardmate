"use client";

import { useActionState } from "react";
import { createWard, type CreateWardState } from "../unit/actions";
import type { SpecialtyKey } from "@/lib/specialty";

const initialState: CreateWardState = { error: null };

/** autoFocus only where this form is the whole point of the screen — on the Unit page it sits
 *  well down a long page, and focusing it there would scroll the page out from under a thumb. */
export default function CreateUnitForm({
  autoFocus = false,
  specialties = [],
}: {
  autoFocus?: boolean;
  /**
   * The departments this build offers. EMPTY unless the SPECIALTY_PACKS flag is on, in which
   * case the picker is not rendered at all and every unit is created as general surgery — the
   * way it has always worked.
   *
   * There is no changing this afterwards. The unit's department decides how its days are
   * counted, what its checklists ask and what its discharge summaries look like, and everyone
   * who joins with its code joins that department.
   */
  specialties?: { key: SpecialtyKey; label: string; blurb: string }[];
}) {
  const [state, formAction, pending] = useActionState(createWard, initialState);

  return (
    <form action={formAction} className="ios-group flex flex-col gap-3 p-4">
      <label className="flex flex-col gap-1.5">
        <span className="text-[15px] text-muted">Name your unit</span>
        <input
          name="name"
          required
          maxLength={60}
          autoFocus={autoFocus}
          autoCapitalize="words"
          placeholder="e.g. Unit Alpha"
          className="h-12 w-full rounded-[10px] border border-line bg-card px-3 text-[17px] outline-none focus:border-accent"
        />
      </label>
      {specialties.length > 1 && (
        <fieldset className="flex flex-col gap-1.5">
          <legend className="text-[15px] text-muted">Department</legend>
          <p className="text-[13px] leading-relaxed text-muted">
            This cannot be changed later — it decides how the unit counts days, what its
            checklists ask and how its discharge summaries read.
          </p>
          <div className="mt-1 flex flex-col gap-2">
            {specialties.map((s, i) => (
              <label
                key={s.key}
                className="flex items-start gap-3 rounded-[10px] border border-line bg-card px-3 py-2.5"
              >
                <input
                  type="radio"
                  name="specialty"
                  value={s.key}
                  defaultChecked={i === 0}
                  className="mt-1 size-4 accent-[var(--accent)]"
                />
                <span className="min-w-0">
                  <span className="block text-[17px]">{s.label}</span>
                  <span className="block text-[13px] leading-snug text-muted">{s.blurb}</span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>
      )}
      {state.error && <p className="text-[13px] text-red-700">{state.error}</p>}
      <button
        disabled={pending}
        className="rounded-[10px] bg-accent px-4 py-3 text-[17px] font-semibold text-accent-ink disabled:opacity-60"
      >
        {pending ? "Creating…" : "Create unit"}
      </button>
    </form>
  );
}
