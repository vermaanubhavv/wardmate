"use client";

import { useState } from "react";
import {
  BODY_WATER, BODY_WATER_CITE, CITES, INFUSATES, INFUSATE_CITE, SODIUM_LIMITS, workSodiumCorrection, type Cite,
} from "@/lib/fluids/sodium-correction";

/**
 * The chained sodium worksheet. Every result is amber arithmetic on what was typed, with the
 * book's line under it; nothing is stored, and no step is worded as an order.
 */
export default function SodiumWorksheet() {
  const [weight, setWeight] = useState(NaN);
  const [na, setNa] = useState(NaN);
  const [bodyWater, setBodyWater] = useState("");
  const [situation, setSituation] = useState("");
  const [infusate, setInfusate] = useState("ns3");
  const w = workSodiumCorrection({ weight, na, bodyWater, situation, infusate });
  const num = (set: (n: number) => void) => (e: React.ChangeEvent<HTMLInputElement>) => set(e.target.value === "" ? NaN : Number(e.target.value));

  return (
    <>
      <section className="px-4 pb-4">
        <p className="ios-group-header mb-2 px-4">The patient&apos;s numbers</p>
        <div className="ios-group grid gap-2 px-4 py-3">
          <Row label="Weight" unit="kg">
            <input type="number" inputMode="decimal" min={20} max={300} value={Number.isNaN(weight) ? "" : weight} onChange={num(setWeight)} className={inputCls} />
          </Row>
          <Row label="Serum sodium" unit="mEq/L">
            <input type="number" inputMode="decimal" min={90} max={129} value={Number.isNaN(na) ? "" : na} onChange={num(setNa)} className={inputCls} />
          </Row>
          <Row label="Body water (Table 1.1)">
            <select value={bodyWater} onChange={(e) => setBodyWater(e.target.value)} className={selectCls}>
              <option value="">Choose</option>
              {BODY_WATER.map((b) => <option key={b.id} value={b.id}>{b.label} · {b.percent}%</option>)}
            </select>
          </Row>
          <Row label="Onset and ODS risk">
            <select value={situation} onChange={(e) => setSituation(e.target.value)} className={selectCls}>
              <option value="">Choose</option>
              {SODIUM_LIMITS.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
            </select>
          </Row>
          <Row label="Fluid to test (Table 20.9)">
            <select value={infusate} onChange={(e) => setInfusate(e.target.value)} className={selectCls}>
              {INFUSATES.map((f) => <option key={f.id} value={f.id}>{f.label} · {f.na} mEq/L</option>)}
            </select>
          </Row>
        </div>
      </section>

      <section className="px-4 pb-4">
        <p className="ios-group-header mb-2 px-4">Worked through the book</p>
        {!w ? (
          <p className="ios-group px-4 py-3 text-[13px] text-muted">
            Enter weight (20–300 kg) and a sodium below 130 mEq/L, and choose body water and onset. At 130 or above the book&apos;s goal is already met.
          </p>
        ) : (
          <ol className="ios-group divide-y divide-line">
            <Step n={1} title="Total body water" value={`${w.tbw} L`} cites={[BODY_WATER_CITE]}>
              weight × {BODY_WATER.find((b) => b.id === bodyWater)?.percent}%
            </Step>
            <Step n={2} title="Most the sodium may rise in 24 hours" value={`${w.limit.limit} mEq/L → ${w.target} mEq/L`} cites={[w.limit.cite, ...(w.cappedAtGoal ? [CITES.goal] : [])]}>
              The book prints {w.limit.printed}; the upper end is used here.
              {w.cappedAtGoal && " Capped at 130 mEq/L, the book's goal."}
            </Step>
            <Step n={3} title={`Sodium to reach ${w.target} mEq/L`} value={`${w.mEq} mEq ≈ ${w.ml3pcByFormula} mL of 3% NaCl`} cites={[CITES.conventional, CITES.saline3, CITES.rule]}>
              ({w.target} − {na}) × {w.tbw} L; 3% NaCl holds 513 mEq per litre. By the 1 mL/kg rule the same rise is {w.ml3pcByRule} mL.
            </Step>
            <Step n={4} title={`One litre of ${w.infusate.label}`} value={`${w.risePerLitre > 0 ? "+" : ""}${w.risePerLitre} mEq/L`} cites={[CITES.adrogue, INFUSATE_CITE]}>
              ({w.infusate.na} − {na}) / ({w.tbw} + 1).{" "}
              {w.risePerLitre <= 0
                ? "This fluid would not raise the sodium: its sodium is at or below the patient's."
                : w.risePerLitre > w.limit.limit
                  ? `One litre is predicted to raise sodium by more than the ${w.limit.limit} mEq/L allowed in 24 hours.`
                  : `Within the ${w.limit.limit} mEq/L allowed in 24 hours for one litre.`}
            </Step>
          </ol>
        )}
        <div className="mt-3 rounded-[10px] border border-orange-300 bg-orange-50 px-3 py-2 text-[13px] text-orange-800">
          <p className="font-semibold">Rough guide only</p>
          <p className="mt-1">These are estimates; urine output, ongoing losses and fluid restriction all change the real rise. Consider checking sodium 2–4 hourly while correcting.</p>
          <Quotes cites={[CITES.unreliable, CITES.measure, CITES.monitor]} />
        </div>
      </section>

      <section className="px-4 pb-4">
        <p className="ios-group-header mb-2 px-4">Severe symptoms: the book&apos;s bolus</p>
        <div className="ios-group px-4 py-3 text-[13px]">
          <p>For vomiting, seizures or coma the book uses fixed boluses of 3% saline, not the formulas above, with a first goal of 4–6 mEq/L.</p>
          <Quotes cites={[CITES.bolusUs, CITES.bolusRepeat, CITES.bolusEu, CITES.initialGoal, CITES.ods]} />
        </div>
      </section>
    </>
  );
}

const inputCls = "w-24 rounded-[8px] border border-line bg-white px-2 py-1.5 text-right text-[15px] tabular-nums";
const selectCls = "max-w-[60%] rounded-[8px] border border-line bg-white px-2 py-1.5 text-[14px]";

function Row({ label, unit, children }: { label: string; unit?: string; children: React.ReactNode }) {
  return (
    <label className="flex items-center justify-between gap-3 text-[13px]">
      <span className="min-w-0 flex-1">{label}{unit && <span className="text-muted"> ({unit})</span>}</span>
      {children}
    </label>
  );
}

function Step({ n, title, value, cites, children }: { n: number; title: string; value: string; cites: Cite[]; children: React.ReactNode }) {
  return (
    <li className="px-4 py-3">
      <p className="text-[11px] font-bold uppercase tracking-wide text-muted">{n}. {title}</p>
      <p className="mt-1 rounded-[8px] bg-orange-50 px-3 py-2 text-[17px] font-semibold tabular-nums text-orange-800">{value}</p>
      <p className="mt-1 text-[12px] text-muted">{children}</p>
      <Quotes cites={cites} />
    </li>
  );
}

function Quotes({ cites }: { cites: Cite[] }) {
  return (
    <div className="mt-1.5 space-y-1">
      {cites.map((c) => (
        <blockquote key={c.text} className="border-l-2 border-accent pl-3 text-[12px] italic text-muted">
          “{c.text}” <span className="not-italic">— {c.pageKind === "book" ? "book p." : "PDF p."} {c.page}</span>
        </blockquote>
      ))}
    </div>
  );
}
