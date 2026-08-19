import Mark from "./mark";

/**
 * The app's name, with the real mark beside it.
 *
 * The mark is vector now rather than the cropped raster it was — see app/mark.tsx for why the
 * designer's own file could not be used directly. Crisper at every size, and the same component
 * the recorder spins while the app is working, so the logo on the header and the logo standing
 * in for a spinner are never two different drawings.
 */
export default function Wordmark({ spinning = false }: { spinning?: boolean }) {
  return (
    <div className="flex items-center gap-1.5">
      <Mark className="h-6 w-6 shrink-0" spinning={spinning} />
      <span className="text-[15px] font-semibold tracking-[-0.02em]">
        ward<span className="text-accent">mate</span>
      </span>
    </div>
  );
}
