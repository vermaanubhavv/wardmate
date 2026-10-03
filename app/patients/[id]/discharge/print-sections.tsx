"use client";

import { useState } from "react";

/**
 * Tick off the parts of the sheet to leave off paper. An unticked part fades on screen and drops
 * out of the printout; nothing is changed in the summary itself. The letterhead, patient details
 * and authentication always print.
 */
export default function PrintSections({ sections }: { sections: { id: string; title: string }[] }) {
  const [off, setOff] = useState<string[]>([]);
  const selector = off.map((id) => `[data-print="${id}"]`).join(",");

  return (
    <div className="ios-group px-4 py-3 print:hidden">
      {selector && (
        <style>{`${selector}{opacity:.35}@media print{${selector}{display:none}}`}</style>
      )}
      <p className="text-footnote font-semibold text-muted">Print these parts</p>
      {sections.map((s) => (
        <label key={s.id} className="mt-2 flex items-center gap-2 text-body">
          <input
            type="checkbox"
            checked={!off.includes(s.id)}
            onChange={(e) =>
              setOff((prev) => (e.target.checked ? prev.filter((x) => x !== s.id) : [...prev, s.id]))
            }
          />
          {s.title}
        </label>
      ))}
    </div>
  );
}
