"use client";

import { useRouter } from "next/navigation";
import type { AntibioticDayPosition } from "@/lib/antibiotics";
import { setAntibioticDayPosition } from "./actions";

const CHOICES: { value: AntibioticDayPosition; label: string }[] = [
  { value: "before", label: "Before" },
  { value: "after", label: "After" },
  { value: "off", label: "Off" },
];

/** Where an antibiotic's "Day N" goes on the printed drug list. Remembered on this device. */
export default function AntibioticDayToggle({ value }: { value: AntibioticDayPosition }) {
  const router = useRouter();
  async function pick(v: AntibioticDayPosition) {
    await setAntibioticDayPosition(v);
    router.refresh();
  }
  return (
    <div className="flex items-center justify-between gap-3 print:hidden">
      <span className="text-footnote text-muted">Antibiotic day</span>
      <div className="flex gap-1.5">
        {CHOICES.map((c) => (
          <button
            key={c.value}
            type="button"
            onClick={() => pick(c.value)}
            className={"rounded-full px-3 py-1 text-footnote " + (value === c.value ? "bg-accent text-accent-ink" : "bg-chip text-muted")}
          >
            {c.label}
          </button>
        ))}
      </div>
    </div>
  );
}
