import { notFound } from "next/navigation";
import Link from "next/link";
import { historyCheckEnabled } from "@/lib/history-check/flag";
import { BackBar } from "@/app/screen-header";
import SodiumWorksheet from "./worksheet";

/**
 * Hyponatraemia correction worked step by step from chapter 20's printed formulas and limits.
 * A reading aid like the topic pages: the numbers are the book's and nothing is stored.
 */
export default function SodiumCorrectionPage() {
  if (!historyCheckEnabled()) notFound();
  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col">
      <BackBar href="/learn" label="Learn" className="mb-3">Sodium correction</BackBar>
      <section className="px-4 pb-4">
        <div className="ios-group px-4 py-3">
          <h1 className="text-[20px] font-semibold">Sodium correction worksheet</h1>
          <p className="mt-2 text-[13px]">
            Chains chapter 20&apos;s formulas for one set of numbers: body water, the 24-hour limit, the sodium that limit takes, and what a litre of a chosen fluid is predicted to do.
          </p>
          <p className="mt-2 rounded-[10px] bg-chip px-3 py-2 text-[12px] leading-relaxed text-muted">
            Every limit and formula is from Pandya&apos;s <span className="italic">Practical Guidelines on Fluid Therapy</span>, quoted with its page. It is arithmetic on what you type, not a prescription; nothing is saved.
            If glucose is high, correct the sodium first on the{" "}
            <Link href="/learn/fluids/hyponatraemia" className="text-accent underline">hyponatraemia page</Link>.
          </p>
        </div>
      </section>
      <SodiumWorksheet />
    </div>
  );
}
