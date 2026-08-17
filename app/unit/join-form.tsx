"use client";

import { useActionState } from "react";
import { joinWard, type JoinState } from "./actions";

export default function JoinForm() {
  const [state, formAction, pending] = useActionState<JoinState, FormData>(joinWard, {
    error: null,
  });

  return (
    <form action={formAction} className="flex flex-col gap-2">
      <div className="flex gap-2">
        <input
          name="code"
          placeholder="ABCD2345"
          autoCapitalize="characters"
          autoComplete="off"
          spellCheck={false}
          maxLength={8}
          className="min-w-0 flex-1 ios-group px-4 py-3 font-mono text-base tracking-widest outline-none focus:border-accent"
        />
        <button
          type="submit"
          disabled={pending}
          className="shrink-0 rounded-[10px] bg-accent px-4 py-3 text-[17px] font-semibold text-accent-ink disabled:opacity-50"
        >
          {pending ? "Joining…" : "Join"}
        </button>
      </div>
      {state.error && <p className="text-[13px] text-orange-700">{state.error}</p>}
    </form>
  );
}
