import Mark from "./mark";

/** The app's name, with the mark beside it. */
export default function Wordmark() {
  return (
    <div className="flex items-center gap-1.5">
      <Mark className="h-6 w-6 shrink-0" />
      <span className="text-subhead font-semibold tracking-[-0.02em]">
        ward<span className="text-accent">mate</span>
      </span>
    </div>
  );
}
