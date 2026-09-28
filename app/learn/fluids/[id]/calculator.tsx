"use client";

import { useState } from "react";
import { CALCULATORS, runCalculator, type CalcKey, type Calculator as Calc } from "@/lib/fluids/calc";

/**
 * Works one of the book's formulas for the numbers typed in. The result is shown amber: it is
 * arithmetic on what the resident entered, not a value recorded for any patient, and the page
 * says so beside it. Nothing here is stored.
 */
export default function Calculator({ calc }: { calc: CalcKey }) {
  const c: Calc = CALCULATORS[calc];
  const [values, setValues] = useState<Record<string, number>>({});
  const result = runCalculator(calc, values);
  return (
    <div className="mt-3 rounded-[10px] border border-line bg-chip/40 p-3">
      <p className="text-[11px] font-bold uppercase tracking-wide text-muted">Work it</p>
      <div className="mt-2 grid gap-2">
        {c.inputs.map((i) => (
          <label key={i.key} className="flex items-center justify-between gap-3 text-[13px]">
            <span className="min-w-0 flex-1">
              {i.label}
              {i.unit && <span className="text-muted"> ({i.unit})</span>}
            </span>
            <input
              type="number"
              inputMode="decimal"
              min={i.min}
              max={i.max}
              step={i.step ?? "any"}
              value={values[i.key] ?? ""}
              onChange={(e) => setValues({ ...values, [i.key]: e.target.value === "" ? NaN : Number(e.target.value) })}
              className="w-24 rounded-[8px] border border-line bg-white px-2 py-1.5 text-right text-[15px] tabular-nums"
            />
          </label>
        ))}
      </div>
      <div className="mt-3 rounded-[8px] bg-orange-50 px-3 py-2 text-orange-800">
        {result ? (
          <>
            <p className="text-[17px] font-semibold tabular-nums">
              {result.value} <span className="text-[13px] font-normal">{result.unit}</span>
            </p>
            {result.note && <p className="mt-0.5 text-[12px]">{result.note}</p>}
          </>
        ) : (
          <p className="text-[12px]">Enter every value within its range to see the result.</p>
        )}
        <p className="mt-1 text-[11px]">Arithmetic on the numbers typed above — check it against the patient before acting on it.</p>
      </div>
    </div>
  );
}
