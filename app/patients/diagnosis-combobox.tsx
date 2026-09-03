"use client";

import { useId, useMemo, useRef, useState } from "react";
import { COMMON_DIAGNOSES } from "@/lib/patients";

/**
 * The diagnosis box, with the ward's 30 commonest diagnoses behind it (lib/patients.ts,
 * frequency-ordered). Before the resident types, the top five are offered; as they type, the
 * list narrows to what matches — the ward's own past diagnoses first, then the standard list.
 *
 * A native <datalist> was tried and does not do this: Chrome shows every partial match with no
 * ordering and nothing at all on an empty field. This is a plain text input with a small
 * dropdown — anything typed is still kept exactly as written, the list only offers.
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
  autoFocus,
}: {
  name?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (v: string) => void;
  placeholder?: string;
  className?: string;
  /** The ward's own past diagnoses, offered ahead of the standard list. */
  extraSuggestions?: string[];
  autoFocus?: boolean;
}) {
  const controlled = value !== undefined && onChange !== undefined;
  const [inner, setInner] = useState(defaultValue ?? "");
  const text = controlled ? (value as string) : inner;
  const setText = (v: string) => {
    if (controlled) onChange!(v);
    else setInner(v);
  };

  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const blurTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const listId = useId();

  const options = useMemo(() => {
    const seen = new Set<string>();
    const all: string[] = [];
    for (const d of [...extraSuggestions, ...COMMON_DIAGNOSES]) {
      const key = d.trim().toLowerCase();
      if (!d.trim() || seen.has(key)) continue;
      seen.add(key);
      all.push(d.trim());
    }
    const q = text.trim().toLowerCase();
    if (!q) return all.slice(0, 5);
    const starts = all.filter((d) => d.toLowerCase().startsWith(q));
    const contains = all.filter((d) => !d.toLowerCase().startsWith(q) && d.toLowerCase().includes(q));
    return [...starts, ...contains].slice(0, 8);
  }, [text, extraSuggestions]);

  const exact = options.length === 1 && options[0].toLowerCase() === text.trim().toLowerCase();
  const show = open && options.length > 0 && !exact;

  const choose = (d: string) => {
    setText(d);
    setOpen(false);
    if (blurTimer.current) clearTimeout(blurTimer.current);
  };

  return (
    <div className="relative">
      {name && <input type="hidden" name={name} value={text} />}
      <input
        type="text"
        role="combobox"
        aria-expanded={show}
        aria-controls={listId}
        aria-autocomplete="list"
        autoComplete="off"
        autoFocus={autoFocus}
        value={text}
        placeholder={placeholder}
        className={className}
        onChange={(e) => {
          setText(e.target.value);
          setOpen(true);
          setActive(0);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => {
          blurTimer.current = setTimeout(() => setOpen(false), 120);
        }}
        onKeyDown={(e) => {
          if (!show) return;
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setActive((a) => Math.min(a + 1, options.length - 1));
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setActive((a) => Math.max(a - 1, 0));
          } else if (e.key === "Enter") {
            e.preventDefault();
            choose(options[active]);
          } else if (e.key === "Escape") {
            setOpen(false);
          }
        }}
      />
      {show && (
        <ul id={listId} role="listbox" className="absolute z-30 mt-1 max-h-64 w-full overflow-auto rounded-[10px] border border-line bg-card py-1 shadow-lg">
          {!text.trim() && (
            <li className="px-3 pb-1 pt-0.5 text-[11px] font-medium uppercase tracking-[0.05em] text-muted">
              Common
            </li>
          )}
          {options.map((d, i) => (
            <li key={d}>
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  choose(d);
                }}
                onMouseEnter={() => setActive(i)}
                className={
                  "block w-full px-3 py-2 text-left text-[15px] " + (i === active ? "bg-chip" : "")
                }
              >
                {d}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
