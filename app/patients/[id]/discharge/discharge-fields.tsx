"use client";

import { useId, useMemo, useRef, useState } from "react";

/** Shared form controls for the discharge workspace and the one-off editor. */

/**
 * A field with a short list of common values behind it — pick one, or keep typing anything
 * else. Same combobox behaviour as app/patients/diagnosis-combobox.tsx (a plain input with its
 * own dropdown; a native <datalist> shows nothing on an empty field and orders nothing), just
 * generalised to take its option list rather than the fixed diagnosis lexicon. What is typed is
 * always kept exactly as written — the list only offers.
 */
export function SuggestField({
  label,
  value,
  onChange,
  options,
  placeholder,
}: {
  label: string;
  value: string | null;
  onChange: (v: string) => void;
  /** Shown before typing (all of them, short lists) or as the top matches once typing starts. */
  options: string[];
  placeholder?: string;
}) {
  const text = value ?? "";
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const blurTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const listId = useId();

  const matches = useMemo(() => {
    const q = text.trim().toLowerCase();
    if (!q) return options;
    const starts = options.filter((o) => o.toLowerCase().startsWith(q));
    const contains = options.filter((o) => !o.toLowerCase().startsWith(q) && o.toLowerCase().includes(q));
    return [...starts, ...contains];
  }, [text, options]);

  const exact = matches.length === 1 && matches[0].toLowerCase() === text.trim().toLowerCase();
  const show = open && matches.length > 0 && !exact;

  const choose = (o: string) => {
    onChange(o);
    setOpen(false);
    if (blurTimer.current) clearTimeout(blurTimer.current);
  };

  return (
    <label className="flex flex-col gap-1">
      <span className="text-[13px] text-muted">{label}</span>
      <div className="relative">
        <input
          type="text"
          role="combobox"
          aria-expanded={show}
          aria-controls={listId}
          aria-autocomplete="list"
          autoComplete="off"
          value={text}
          placeholder={placeholder}
          className="h-11 w-full rounded-[10px] border border-line bg-card px-3 text-[15px] outline-none focus:border-accent"
          onChange={(e) => {
            onChange(e.target.value);
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
              setActive((a) => Math.min(a + 1, matches.length - 1));
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setActive((a) => Math.max(a - 1, 0));
            } else if (e.key === "Enter") {
              e.preventDefault();
              choose(matches[active]);
            } else if (e.key === "Escape") {
              setOpen(false);
            }
          }}
        />
        {show && (
          <ul id={listId} role="listbox" className="absolute z-30 mt-1 max-h-64 w-full overflow-auto rounded-[10px] border border-line bg-card py-1 shadow-lg">
            {matches.map((o, i) => (
              <li key={o}>
                <button
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    choose(o);
                  }}
                  onMouseEnter={() => setActive(i)}
                  className={"block w-full px-3 py-2 text-left text-[15px] " + (i === active ? "bg-chip" : "")}
                >
                  {o}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </label>
  );
}

/** A short either/or choice with room for neither — e.g. Emergency / Elective admission. The
 *  two are the overwhelming majority of cases, so they get one tap; anything else is still a
 *  real, visible state ("Transferred", blank) rather than being forced into one of the two. */
export function SegmentedField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string | null;
  onChange: (v: string) => void;
  options: string[];
}) {
  const current = (value ?? "").trim();
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[13px] text-muted">{label}</span>
      <div className="flex gap-1.5">
        {options.map((o) => {
          const selected = current.toLowerCase() === o.toLowerCase();
          return (
            <button
              key={o}
              type="button"
              onClick={() => onChange(selected ? "" : o)}
              className={
                "h-11 flex-1 rounded-[10px] border text-[15px] font-medium transition-colors " +
                (selected ? "border-accent bg-accent text-accent-ink" : "border-line bg-card text-foreground")
              }
            >
              {o}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/**
 * A field that only ever holds one of a fixed set of values — unlike SuggestField, nothing
 * else can be typed. For something a unit already has one right answer for (its own
 * consultant), a free-text box only invites a typo a discharge summary then carries.
 *
 * `value` is always kept as an option even when it is not in `options`, so a name already on
 * the record is shown rather than silently swapped for the first option in the list.
 */
export function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string | null;
  onChange: (v: string) => void;
  options: string[];
}) {
  const current = (value ?? "").trim();
  const withCurrent = current && !options.some((o) => o.toLowerCase() === current.toLowerCase()) ? [current, ...options] : options;
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[13px] text-muted">{label}</span>
      <select
        value={current}
        onChange={(e) => onChange(e.target.value)}
        className="h-11 rounded-[10px] border border-line bg-card px-3 text-[15px] outline-none focus:border-accent"
      >
        {!current && <option value="">Not set</option>}
        {withCurrent.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </label>
  );
}

export function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string | null;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[13px] text-muted">{label}</span>
      <input
        type={type}
        value={value ?? ""}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="h-11 rounded-[10px] border border-line bg-card px-3 text-[15px] outline-none focus:border-accent"
      />
    </label>
  );
}

export function Area({
  label,
  value,
  onChange,
  rows = 4,
  placeholder,
}: {
  label?: string;
  value: string | null;
  onChange: (v: string) => void;
  rows?: number;
  placeholder?: string;
}) {
  return (
    <label className="flex flex-col gap-1">
      {label && <span className="text-[13px] text-muted">{label}</span>}
      <textarea
        value={value ?? ""}
        rows={rows}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-[10px] border border-line bg-card px-3 py-2 text-[15px] leading-relaxed outline-none focus:border-accent"
      />
    </label>
  );
}

export function StringList({
  items,
  onChange,
  placeholder,
  noneLabel,
}: {
  items: string[];
  onChange: (v: string[]) => void;
  placeholder: string;
  noneLabel: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      {items.length === 0 && <p className="text-[13px] text-muted">{noneLabel}</p>}
      {items.map((item, i) => (
        <div key={i} className="flex gap-2">
          <input
            value={item}
            placeholder={placeholder}
            onChange={(e) => onChange(items.map((x, j) => (j === i ? e.target.value : x)))}
            className="h-11 flex-1 rounded-[10px] border border-line bg-card px-3 text-[15px] outline-none focus:border-accent"
          />
          <button
            type="button"
            onClick={() => onChange(items.filter((_, j) => j !== i))}
            className="shrink-0 px-2 text-[13px] text-muted"
          >
            Remove
          </button>
        </div>
      ))}
      <button type="button" onClick={() => onChange([...items, ""])} className="self-start text-[13px] font-medium text-accent">
        + Add
      </button>
    </div>
  );
}
