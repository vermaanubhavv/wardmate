"use client";

import { useOptimistic, useTransition } from "react";
import { setPacVerdict } from "./actions";
import type { PacVerdict } from "@/lib/patient-state";

type Choice = "fit" | "unfit" | "not_done";

const FROM_VERDICT: Partial<Record<NonNullable<PacVerdict>, Choice>> = {
  fit: "fit",
  unfit: "unfit",
  pending: "not_done",
};

const TONE: Record<Choice | "", string> = {
  fit: "bg-good-bg text-good-fg",
  unfit: "bg-critical-bg text-critical-fg",
  not_done: "bg-warn-bg text-warn-fg",
  "": "bg-warn-bg text-warn-fg",
};

/** The PAC verdict as a dropdown. Changes the instant it is picked; the write follows. */
export default function PacSelect({ patientId, verdict }: { patientId: string; verdict: PacVerdict }) {
  const [, startTransition] = useTransition();
  const [value, setValue] = useOptimistic<Choice | "">((verdict && FROM_VERDICT[verdict]) || "");

  return (
    <select
      aria-label="PAC"
      value={value}
      onChange={(e) => {
        const next = e.target.value as Choice;
        startTransition(async () => {
          setValue(next);
          await setPacVerdict(patientId, next);
        });
      }}
      className={"min-h-9 rounded-full px-3 text-footnote font-semibold " + TONE[value]}
    >
      {value === "" && (
        <option value="" disabled>
          {verdict === "fit_with_conditions" ? "Fit — conditions" : "Not recorded"}
        </option>
      )}
      <option value="fit">Fit</option>
      <option value="unfit">Unfit</option>
      <option value="not_done">Not done</option>
    </select>
  );
}
