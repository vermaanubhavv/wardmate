"use client";

import { useActionState } from "react";
import { claimExpectedMember, type ClaimState } from "./actions";
import type { ExpectedMember } from "@/lib/expected-members";

/**
 * "Which one are you?" — shown to somebody who has joined but has no name set yet.
 *
 * It disappears the moment a name is claimed, because the profile then has a display name and
 * the page stops rendering this. Permanent chrome for a once-ever action is the mistake this
 * codebase has reverted twice; this is the once-ever version of it.
 */
export default function ClaimName({ options }: { options: ExpectedMember[] }) {
  const [state, formAction, pending] = useActionState<ClaimState, FormData>(claimExpectedMember, {
    error: null,
  });

  return (
    <form action={formAction}>
      <ul className="ios-group divide-y divide-line">
        {options.map((option) => (
          <li key={option.id}>
            <button
              name="id"
              value={option.id}
              disabled={pending}
              className="flex w-full items-baseline justify-between gap-3 px-4 py-3 text-left active:bg-chip disabled:opacity-50"
            >
              <span className="truncate text-[15px]">{option.full_name}</span>
              <span className="shrink-0 text-[13px] text-muted">{option.designation ?? "Tap if this is you"}</span>
            </button>
          </li>
        ))}
      </ul>
      {state.error && <p className="mt-2 text-[13px] text-orange-700">{state.error}</p>}
    </form>
  );
}
