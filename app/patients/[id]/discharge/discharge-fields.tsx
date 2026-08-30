"use client";

/** Shared form controls for the discharge workspace and the one-off editor. */

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
