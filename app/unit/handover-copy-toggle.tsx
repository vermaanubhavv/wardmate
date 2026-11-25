"use client";

import { useState, useTransition } from "react";
import { Toggle } from "@/app/patients/[id]/card-kit";
import { setHandoverCopyEnabled } from "./actions";

/**
 * Whether "Copy for WhatsApp" shows on the handover (patch 0120). Optimistic, the same as
 * EsicTemplateToggle: the switch moves at once and the server action runs behind it.
 */
export default function HandoverCopyToggle({ wardId, initial }: { wardId: string; initial: boolean }) {
  const [on, setOn] = useState(initial);
  const [, startTransition] = useTransition();

  return (
    <Toggle
      on={on}
      onClick={() => {
        const next = !on;
        setOn(next);
        startTransition(() => {
          setHandoverCopyEnabled(wardId, next);
        });
      }}
    />
  );
}
