"use client";

import { useActionState } from "react";
import { joinWard, type JoinState } from "./actions";

export default function JoinForm({ autoFocus = false }: { autoFocus?: boolean }) {
  const [state, formAction, pending] = useActionState<JoinState, FormData>(joinWard, {
    error: null,
  });

  return (
    <form action={formAction} className="flex flex-col gap-2">
      <div className="flex gap-2">
        <input
          name="code"
          aria-label="Unit code"
          placeholder="ABCD2345"
          required
          autoFocus={autoFocus}
          autoCapitalize="characters"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          maxLength={8}
          className="field min-w-0 flex-1 font-mono tracking-widest"
        />
        <button
          type="submit"
          disabled={pending}
          className="btn btn-primary shrink-0"
        >
          {pending ? "Joining…" : "Join"}
        </button>
      </div>
      {state.error && <p role="alert" className="text-footnote text-warn-fg">{state.error}</p>}
    </form>
  );
}
