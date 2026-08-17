import Link from "next/link";
import { ChevronIcon } from "./icons";

/**
 * The top of every screen that is not the ward list: a back link, a large title, and a line
 * of explanation.
 *
 * One component rather than the same three elements written eleven times, because that is how
 * the app came to have four different back links and three title sizes. iOS is strict about
 * this and the strictness is the point — a resident should never have to look for the way
 * back.
 *
 * The chevron is flipped rather than a "←", so it matches the one on every row that goes
 * forward.
 */
export default function ScreenHeader({
  back = "/",
  backLabel = "Ward",
  title,
  subtitle,
  children,
}: {
  back?: string;
  backLabel?: string;
  title: string;
  subtitle?: React.ReactNode;
  /** Anything belonging in the header itself — a count, an action. */
  children?: React.ReactNode;
}) {
  return (
    <>
      <div className="sticky top-0 z-10 flex items-center gap-1 border-b border-line/60 bg-background/80 px-2 py-2.5 backdrop-blur-xl">
        <Link
          href={back}
          className="flex items-center text-[17px] text-accent active:opacity-60"
        >
          <ChevronIcon className="h-[18px] w-[18px] rotate-180" />
          {backLabel}
        </Link>
      </div>

      <header className="px-4 pb-3 pt-4">
        <h1 className="ios-large-title">{title}</h1>
        {subtitle && <p className="mt-1 text-[15px] text-muted">{subtitle}</p>}
        {children}
      </header>
    </>
  );
}
