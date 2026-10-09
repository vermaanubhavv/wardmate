"use client";

import { useMemo, useState } from "react";
import { commonDiagnosesFor } from "@/lib/specialty/intake";
import { SuggestField } from "./[id]/discharge/discharge-fields";

/**
 * The diagnosis box, with the unit's commonest diagnoses behind it (lib/specialty/intake.ts,
 * frequency-ordered, per department). Before the resident types, the top five are offered; as they type, the
 * list narrows to what matches — the ward's own past diagnoses first, then the standard list.
 * The combobox itself is SuggestField; this only builds the deduplicated diagnosis list.
 *
 * Works controlled (`value` + `onChange`) or uncontrolled inside a form (`name` + `defaultValue`).
 */
export default function DiagnosisCombobox({
  name,
  value,
  defaultValue,
  onChange,
  placeholder,
  className,
  extraSuggestions = [],
  specialty,
}: {
  name?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (v: string) => void;
  placeholder?: string;
  className?: string;
  /** The ward's own past diagnoses, offered ahead of the standard list. */
  extraSuggestions?: string[];
  /** The unit's department — decides the standard list. Omitted means general surgery. */
  specialty?: string;
}) {
  const controlled = value !== undefined && onChange !== undefined;
  const [inner, setInner] = useState(defaultValue ?? "");
  const text = controlled ? (value as string) : inner;
  const setText = (v: string) => {
    if (controlled) onChange!(v);
    else setInner(v);
  };

  const all = useMemo(() => {
    const seen = new Set<string>();
    const out: string[] = [];
    for (const d of [...extraSuggestions, ...commonDiagnosesFor(specialty)]) {
      const key = d.trim().toLowerCase();
      if (!d.trim() || seen.has(key)) continue;
      seen.add(key);
      out.push(d.trim());
    }
    return out;
  }, [extraSuggestions, specialty]);

  // Top five on an empty field, the eight best matches once typing starts. SuggestField's own
  // filter keeps this order, so it only has to be cut here.
  const options = useMemo(() => {
    const q = text.trim().toLowerCase();
    if (!q) return all.slice(0, 5);
    const starts = all.filter((d) => d.toLowerCase().startsWith(q));
    const contains = all.filter((d) => !d.toLowerCase().startsWith(q) && d.toLowerCase().includes(q));
    return [...starts, ...contains].slice(0, 8);
  }, [text, all]);

  return (
    <SuggestField
      name={name}
      value={text}
      onChange={setText}
      options={options}
      placeholder={placeholder}
      className={className}
      heading="Common"
    />
  );
}
