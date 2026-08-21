"use client";

import { useActionState } from "react";
import { createWard, type CreateWardState } from "../unit/actions";

const initialState: CreateWardState = { error: null };

export default function CreateUnitForm() {
  const [state, formAction, pending] = useActionState(createWard, initialState);

  return (
    <form action={formAction} className="ios-group flex flex-col gap-3 p-4">
      <label className="flex flex-col gap-1.5">
        <span className="text-[15px] text-muted">Name your unit</span>
        <input
          name="name"
          required
          maxLength={60}
          autoFocus
          autoCapitalize="words"
          placeholder="e.g. Unit Alpha"
          className="h-12 w-full rounded-[10px] border border-line bg-card px-3 text-[17px] outline-none focus:border-accent"
        />
      </label>
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
