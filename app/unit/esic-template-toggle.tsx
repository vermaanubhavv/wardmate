"use client";

import { useState, useTransition } from "react";
import { Toggle } from "@/app/patients/[id]/card-kit";
import { setProgressNoteTemplate } from "./actions";

/**
 * Flips which printable layout this unit's progress notes print on. Optimistic: the switch
 * moves immediately, and the server action runs behind it — the same "ESIC Faridabad" boolean
 * app/patients/[id]/note/page.tsx reads on the next print.
 */
export default function EsicTemplateToggle({
  wardId,
  initial,
}: {
  wardId: string;
  initial: boolean;
}) {
  const [on, setOn] = useState(initial);
  const [, startTransition] = useTransition();

  return (
    <Toggle
      on={on}
      onClick={() => {
        const next = !on;
        setOn(next);
        startTransition(() => {
          setProgressNoteTemplate(wardId, next);
        });
      }}
    />
  );
}
