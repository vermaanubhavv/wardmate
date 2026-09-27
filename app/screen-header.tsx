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
 * `back` is where the user came FROM, not the screen's nearest parent in the sitemap: Formats
 * is reached from Unit, so its back is Unit. The chevron is flipped rather than a "←", so it
 * matches the one on every row that goes forward.
 */
export default function ScreenHeader({
  back = "/ward",
  backLabel = "Ward",
  title,
  subtitle,
  trailing,
  children,
}: {
  back?: string;
  backLabel?: string;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  /** Something for the right of the navigation bar — a count, a primary action. */
  trailing?: React.ReactNode;
  /** Anything belonging under the title — a control, a note. */
  children?: React.ReactNode;
}) {
  return (
    <>
      <div className="sticky top-0 z-10 flex min-h-11 items-center justify-between gap-2 border-b border-line/60 bg-background/80 px-2 pb-1.5 top-bar backdrop-blur-xl">
        <Link
          href={back}
          className="flex min-h-11 items-center pr-2 text-body text-accent active:opacity-60"
        >
          <ChevronIcon className="h-[18px] w-[18px] rotate-180" />
          {backLabel}
        </Link>
        {trailing && <div className="flex items-center pr-2">{trailing}</div>}
      </div>

      <header className="px-4 pb-3 pt-4">
        <h1 className="ios-large-title break-words">{title}</h1>
        {subtitle && <p className="mt-1 text-subhead text-muted">{subtitle}</p>}
        {children}
      </header>
    </>
  );
}
