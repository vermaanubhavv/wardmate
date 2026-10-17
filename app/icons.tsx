/**
 * The few icons the app uses, inline rather than from a package.
 *
 * Each is drawn on a 24-unit grid with a 2-unit stroke and inherits currentColor, so one set
 * works on the accent and on a plain border without a second variant. Sized by the caller.
 */

type IconProps = { className?: string };

/** The shared stroke attributes every outline icon is drawn with. */
function Svg({
  className = "h-4 w-4",
  strokeWidth = "2",
  children,
}: IconProps & { strokeWidth?: string; children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      {children}
    </svg>
  );
}

export function MicIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <rect x="9" y="2" width="6" height="11" rx="3" />
      <path d="M5 10a7 7 0 0 0 14 0" />
      <path d="M12 17v4" />
    </Svg>
  );
}

/** A photograph: the round register is read from a picture of a page. */
export function ImageIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <circle cx="8.5" cy="9.5" r="1.5" />
      <path d="m21 16-5-5L5 20" />
    </Svg>
  );
}

export function PlusIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M12 5v14M5 12h14" />
    </Svg>
  );
}

/** Shown while recording, in place of the mic. */
export function StopIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <rect x="6" y="6" width="12" height="12" rx="2" />
    </svg>
  );
}

/** The row-accessory chevron iOS puts at the right of anything that navigates. */
export function ChevronIcon({ className }: IconProps) {
  return (
    <Svg className={className} strokeWidth="3">
      <path d="m9 5 7 7-7 7" />
    </Svg>
  );
}

/** The "To do" capsule: a checklist. */
export function ChecklistIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="m4 6 1.5 1.5L8 5" />
      <path d="m4 12 1.5 1.5L8 11" />
      <path d="m4 18 1.5 1.5L8 17" />
      <path d="M12 6h8M12 12h8M12 18h8" />
    </Svg>
  );
}

/** The "Formats" capsule: the unit's own paperwork. */
export function DocumentIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M7 3h7l5 5v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" />
      <path d="M14 3v5h5" />
      <path d="M9 13h6M9 17h6" />
    </Svg>
  );
}

/** Edit: the patient header and an entry's controls row. */
export function PenIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </Svg>
  );
}

/**
 * iOS's Share button, as it looks in Safari's toolbar: a box with an arrow lifting out of it.
 *
 * Drawn to be recognised rather than described — the install instructions can say "tap this"
 * and point at the same shape the doctor is looking for at the bottom of their screen.
 */
export function ShareIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M12 15V3" />
      <path d="m8 7 4-4 4 4" />
      <path d="M8 11H6a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-8a1 1 0 0 0-1-1h-2" />
    </Svg>
  );
}

/** A home screen with room for one more app on it: the "Add to Home Screen" row. */
export function AddToHomeIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <rect x="3" y="3" width="18" height="18" rx="4" />
      <path d="M12 8v8M8 12h8" />
    </Svg>
  );
}
