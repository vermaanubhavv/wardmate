"use client";

import { useState } from "react";

export type PatientTab = {
  key: string;
  label: string;
  /** What to say when the tab has nothing in it yet. Omitted when it always has content. */
  empty?: string;
  content: React.ReactNode;
};

/**
 * The patient record, filed into four screens instead of stacked into one.
 *
 * The page used to run nine sections deep — to do, scores, confirm, vitals, today, PAC,
 * treatment, case history, record by date, discharge — every one of them a card with a header,
 * all at the same visual weight. Nothing was hidden and nothing led, so the eye had no entry
 * point and a resident thumbed past four sections to reach the one they opened the page for.
 *
 * Nothing is removed here. The sections are grouped along the lines a round already thinks in
 * — how is the patient today, what are they on, what has the stay been, are they going home —
 * so each tab is a screen and a half rather than the whole record being one screen and nine.
 *
 * The control sits below the header rather than above it: name, bed, day count and diagnosis
 * are true on all four tabs, so they stay put and only the record beneath them changes.
 *
 * The tab resets to Today on every patient, deliberately. "Next" walks the ward bed by bed and
 * the question at each new bed is the same one — how is this patient this morning — so
 * carrying Discharge over from the last patient would be the wrong answer nine times out of
 * ten, and a wrong tab is more expensive than a tap.
 */
export default function PatientTabs({ tabs }: { tabs: PatientTab[] }) {
  const [active, setActive] = useState(tabs[0]?.key);
  const current = tabs.find((t) => t.key === active) ?? tabs[0];

  return (
    <>
      {/* iOS's segmented control: one track, the selected segment lifted onto a white slab.
          The track fill is Apple's own value rather than one of ours — this is the one piece of
          furniture on the page that people know from Settings, and a near-miss grey reads as
          wrong beside it. */}
      <div
        role="tablist"
        aria-label="Patient record"
        className="mx-4 mb-4 flex rounded-[9px] bg-[rgba(118,118,128,0.12)] p-0.5"
      >
        {tabs.map((tab) => {
          const on = tab.key === current?.key;
          return (
            <button
              key={tab.key}
              role="tab"
              type="button"
              aria-selected={on}
              aria-controls={`panel-${tab.key}`}
              id={`tab-${tab.key}`}
              onClick={() => setActive(tab.key)}
              className={
                "min-w-0 flex-1 truncate rounded-[7px] px-1 py-1.5 text-[13px] transition-colors active:opacity-60 " +
                (on ? "bg-card font-semibold shadow-sm" : "font-medium text-foreground/80")
              }
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Bottom padding clears the fixed speak bar, so the last thing on whichever tab is open
          stays reachable — it used to live on the discharge section, which was always last. */}
      <div
        role="tabpanel"
        id={`panel-${current?.key}`}
        aria-labelledby={`tab-${current?.key}`}
        className="pb-72"
      >
        {current?.empty ? (
          <section className="px-4 pb-6">
            <p className="ios-group p-5 text-[15px] text-muted">{current.empty}</p>
          </section>
        ) : (
          current?.content
        )}
      </div>
    </>
  );
}
