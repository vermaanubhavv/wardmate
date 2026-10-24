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
  children,
}: {
  back?: string;
  backLabel?: string;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  /** Anything belonging under the title — a control, a note. */
  children?: React.ReactNode;
}) {
  return (
    <>
      <BackBar href={back} label={backLabel} />

      <header className="px-4 pb-3 pt-4">
        <h1 className="ios-large-title break-words">{title}</h1>
        {subtitle && <p className="mt-1 text-subhead text-muted">{subtitle}</p>}
        {children}
      </header>
    </>
  );
}

/**
 * The way back, pinned under the status bar while the page scrolls. Every screen has one — a
 * back link written into a page's own header scrolled away with it, and on a long sheet the
 * only way out was all the way back up. `children` is the quiet line on the right ("Case
 * history · Shikha · bed 7"); `className` lets a padded page pull the bar to its edges.
 */
export function BackBar({
  href,
  label,
  children,
  className = "",
}: {
  href: string;
  label: string;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={
        "sticky top-0 z-10 flex min-h-11 items-center justify-between gap-2 border-b border-line/60 bg-background/80 px-2 pb-1.5 top-bar backdrop-blur-xl print:hidden " +
        className
      }
    >
      <Link href={href} className="flex min-h-11 shrink-0 items-center pr-2 text-body text-accent active:opacity-60">
        <ChevronIcon className="h-[18px] w-[18px] rotate-180" />
        {label}
      </Link>
      {children && <p className="min-w-0 truncate pr-2 text-footnote text-muted">{children}</p>}
    </div>
  );
}
