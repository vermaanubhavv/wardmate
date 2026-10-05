"use client";

import { useEffect, useState } from "react";
import { medicationFields } from "@/lib/medication-fields";
import { DRUG_NAMES, canonicalDrug, drugStrengths, strengthsFromFormulary } from "@/lib/drug-strengths";
import { findFormularyOptions } from "./discharge/actions";

/** Value is what gets written; label is what the dropdown shows. "Before dinner" is stored in
 *  words because a bare "BD" is read everywhere else (lib/medication-fields.ts, the discharge
 *  prescription) as twice daily — the same two letters would double the dispensed quantity. */
const SCHEDULES: { value: string; label: string }[] = [
  { value: "", label: "—" },
  { value: "OD", label: "OD" },
  { value: "BD", label: "BD (twice daily)" },
  { value: "TDS", label: "TDS" },
  { value: "QID", label: "QID" },
  { value: "q4h", label: "q4h" },
  { value: "q6h", label: "q6h" },
  { value: "q8h", label: "q8h" },
  { value: "q12h", label: "q12h" },
  { value: "HS", label: "HS" },
  { value: "BBF", label: "BBF (before breakfast)" },
  { value: "BL", label: "BL (before lunch)" },
  { value: "before dinner", label: "BD (before dinner)" },
  { value: "SOS", label: "SOS" },
  { value: "STAT", label: "STAT" },
];
const UNITS = ["mg", "g", "U", "mcg", "ml"];
const OTHER = "__other";

/** Read a dictated medication back into the editor's fields — only what was said, so a field
 *  nobody dictated opens blank rather than on a likely-looking default. */
function initial(label: string, value: string | null) {
  const f = medicationFields(label, value);
  const said = `${label} ${value ?? ""}`;
  const form = /\b(tab|tabs|tablet|cap|caps|capsule)\b/i.test(said)
    ? "Tab"
    : /\b(inj|injection|iv|im|s\/?c)\b/i.test(said)
      ? "Inj"
      : "";
  const meal = said.match(/\b(BBF|BL)\b/i)?.[1].toUpperCase() ?? (/before dinner/i.test(said) ? "before dinner" : null);
  const freq = f.frequencyCode ? (f.frequencyCode.startsWith("Q") && f.frequencyCode !== "QID" ? f.frequencyCode.toLowerCase() : f.frequencyCode) : "";
  const dose = f.dose?.replace(/\bgm\b/, "g").replace(/\bIU\b/, "U") ?? "";
  return { form, drug: f.drug, dose, schedule: meal ?? freq, route: f.routeCode, duration: f.duration };
}

export default function MedicationEditor({
  wardId,
  label,
  value,
  onSave,
  onCancel,
}: {
  wardId: string;
  label: string;
  value: string | null;
  onSave: (label: string, value: string) => void;
  onCancel: () => void;
}) {
  const start = initial(label, value);
  const [form, setForm] = useState(start.form);
  const [drug, setDrug] = useState(start.drug);
  const [schedule, setSchedule] = useState(start.schedule);
  // The ward's formulary entries for this drug; the built-in list only stands in when the
  // ward has none (no formulary imported, or a drug it does not stock).
  const [formulary, setFormulary] = useState<string[]>([]);
  useEffect(() => {
    const name = canonicalDrug(drug);
    if (name.length < 3) return;
    let live = true;
    const t = setTimeout(() => {
      findFormularyOptions(wardId, name).then((items) => live && setFormulary(items), () => {});
    }, 300);
    return () => {
      live = false;
      clearTimeout(t);
    };
  }, [wardId, drug]);
  const fromFormulary = strengthsFromFormulary(formulary, form);
  const strengths = fromFormulary.length ? fromFormulary : drugStrengths(drug, form);
  // The dictated dose is always an option, even when it is not a strength the list knows —
  // the dropdown never quietly swaps what was said for something else.
  const options = start.dose && !strengths.includes(start.dose) ? [start.dose, ...strengths] : strengths;
  const [dose, setDose] = useState(start.dose);
  const [amount, setAmount] = useState("");
  const [unit, setUnit] = useState("mg");

  const finalDose = dose === OTHER ? (amount.trim() ? `${amount.trim()} ${unit}` : "") : dose;
  // Route and duration have no field here; whatever was dictated rides along unchanged.
  const route = start.route && !(form === "Tab" && start.route === "PO") ? start.route : null;
  const text = [form, finalDose, route, schedule, start.duration && `for ${start.duration}`].filter(Boolean).join(" ");

  return (
    <div className="mt-2 flex flex-col gap-2">
      <div className="grid grid-cols-[6rem_1fr] gap-2">
        <select value={form} onChange={(e) => setForm(e.target.value)} className="field" aria-label="Form">
          <option value="">—</option>
          <option value="Tab">Tab</option>
          <option value="Inj">Inj</option>
        </select>
        <input
          value={drug}
          onChange={(e) => setDrug(e.target.value)}
          list="drug-names"
          aria-label="Drug"
          className="field min-w-0"
        />
        <datalist id="drug-names">
          {DRUG_NAMES.map((n) => (
            <option key={n} value={n} />
          ))}
        </datalist>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <select value={dose} onChange={(e) => setDose(e.target.value)} className="field" aria-label="Dose">
          <option value="">Dose —</option>
          {options.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
          <option value={OTHER}>Other…</option>
        </select>
        <select value={schedule} onChange={(e) => setSchedule(e.target.value)} className="field" aria-label="Schedule">
          {SCHEDULES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>
      {dose === OTHER && (
        <div className="grid grid-cols-[1fr_6rem] gap-2">
          <input
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            inputMode="decimal"
            placeholder="Dose"
            aria-label="Dose amount"
            className="field min-w-0"
          />
          <select value={unit} onChange={(e) => setUnit(e.target.value)} className="field" aria-label="Unit">
            {UNITS.map((u) => (
              <option key={u}>{u}</option>
            ))}
          </select>
        </div>
      )}
      <div className="flex items-center justify-end gap-4">
        <button type="button" onClick={onCancel} className="tap px-1 text-subhead text-muted">
          Cancel
        </button>
        <button
          type="button"
          disabled={!drug.trim()}
          onClick={() => onSave(drug.trim(), text)}
          className="tap px-1 text-subhead font-semibold text-accent"
        >
          Save
        </button>
      </div>
    </div>
  );
}
