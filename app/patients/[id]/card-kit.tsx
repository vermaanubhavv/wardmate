"use client";

/**
 * The card-stack look, shared between the discharge workspace and the case-history workspace.
 *
 * One card per section, walked through in order like a terminal multi-select: every choice the
 * resident can make by tapping a pill, an option row or a toggle rather than typing. Both
 * surfaces import these so they stay visually identical — see
 * app/patients/[id]/discharge/discharge-workspace.tsx, which is where this originally lived.
 */

export function IconCheck({ className = "h-[17px] w-[17px]" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M4 10.5 8.5 15 16 5" />
    </svg>
  );
}

/** The small grey/teal/amber status pill shown beside a section title. */
export function statusChip(text: string, tone: "ok" | "warn" | "muted") {
  return (
    <span
      className={
        "shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium " +
        (tone === "ok"
          ? "bg-accent/10 text-accent"
          : tone === "warn"
            ? "bg-orange-100 text-orange-700"
            : "bg-chip text-muted")
      }
    >
      {text}
    </span>
  );
}

/** A pill the resident taps on/off — the Claude-Code multi-select feel. */
export function SelChip({
  selected,
  onClick,
  children,
  tone = "plain",
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
  /** "note" tints an un-selected chip amber, for a value that still needs a look. */
  tone?: "plain" | "note";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[13px] transition-colors " +
        (selected
          ? "border-accent bg-accent text-accent-ink"
          : tone === "note"
            ? "border-orange-300 bg-orange-100 text-orange-700"
            : "border-line bg-card text-muted")
      }
    >
      {selected && <IconCheck className="h-3 w-3" />}
      {children}
    </button>
  );
}

/** A full-width option row — one tap to choose. `dashed` is the "add another" row. */
export function OptionRow({
  selected,
  onClick,
  children,
  dashed,
}: {
  selected?: boolean;
  onClick: () => void;
  children: React.ReactNode;
  dashed?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        "flex items-center gap-2.5 rounded-[10px] border px-3.5 py-3 text-left text-[14.5px] " +
        (selected
          ? "border-accent bg-accent text-accent-ink"
          : dashed
            ? "border-dashed border-line text-muted"
            : "border-line bg-card")
      }
    >
      <span className="flex-1">{children}</span>
      {selected && <IconCheck className="h-[17px] w-[17px] shrink-0" />}
    </button>
  );
}

/** iOS-style toggle. */
export function Toggle({ on, onClick }: { on: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={onClick}
      className={
        "relative h-[29px] w-[47px] shrink-0 rounded-full transition-colors " +
        (on ? "bg-accent" : "bg-chip")
      }
    >
      <span
        className={
          "absolute top-[2px] h-[25px] w-[25px] rounded-full bg-white shadow transition-all " +
          (on ? "left-[20px]" : "left-[2px]")
        }
      />
    </button>
  );
}

export const genBtn =
  "self-start rounded-[10px] border border-line px-3 py-1.5 text-[13px] font-medium text-accent disabled:opacity-50";
export const approveBtn =
  "self-start rounded-[10px] bg-accent px-3 py-1.5 text-[13px] font-semibold text-accent-ink disabled:opacity-50";
