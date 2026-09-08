/**
 * Shared building blocks for the admin console. Plain server components — no interactivity, so
 * every page stays a single server render with no client bundle beyond the sub-nav.
 *
 * The look borrows the app's iOS grouping (`ios-group` / `ios-row`) so the console does not
 * feel like a different product bolted on.
 */

export function ErrorNote({ message }: { message: string }) {
  return (
    <p className="mt-4 ios-group px-4 py-3 text-[14px] text-orange-700">
      Could not read the database: {message}
    </p>
  );
}

export function Empty({ children }: { children: React.ReactNode }) {
  return <p className="mt-4 text-[14px] text-muted">{children}</p>;
}

/** A grid of headline numbers. */
export function StatGrid({ children }: { children: React.ReactNode }) {
  return <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">{children}</div>;
}

export function Stat({
  label,
  value,
  hint,
}: {
  label: string;
  value: React.ReactNode;
  hint?: string;
}) {
  return (
    <div className="ios-group px-3 py-2.5">
      <div className="text-[22px] font-semibold tabular-nums leading-tight">{value}</div>
      <div className="mt-0.5 text-[12px] text-muted">{label}</div>
      {hint && <div className="text-[11px] text-muted/80">{hint}</div>}
    </div>
  );
}

export function Section({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-8">
      <div className="ios-group-header px-1">{title}</div>
      {subtitle && <p className="px-1 pb-1 text-[12px] text-muted">{subtitle}</p>}
      <div className="mt-1">{children}</div>
    </section>
  );
}

/** A horizontally scrollable table — the console is used on a phone. */
export function Table({
  head,
  children,
}: {
  head: React.ReactNode[];
  children: React.ReactNode;
}) {
  return (
    <div className="ios-group overflow-x-auto">
      <table className="w-full min-w-full border-collapse text-[13px]">
        <thead>
          <tr className="border-b border-line/60 text-left text-[11px] uppercase tracking-wide text-muted">
            {head.map((h, i) => (
              <th key={i} className="whitespace-nowrap px-3 py-2 font-medium">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

export function Row({ children }: { children: React.ReactNode }) {
  return <tr className="border-b border-line/40 last:border-0">{children}</tr>;
}

export function Cell({
  children,
  num,
  muted,
}: {
  children: React.ReactNode;
  num?: boolean;
  muted?: boolean;
}) {
  return (
    <td
      className={[
        "px-3 py-2 align-top",
        num ? "tabular-nums whitespace-nowrap" : "",
        muted ? "text-muted" : "",
      ].join(" ")}
    >
      {children}
    </td>
  );
}

const SEV: Record<string, string> = {
  high: "bg-red-100 text-red-700",
  medium: "bg-amber-100 text-amber-700",
  low: "bg-neutral-200 text-neutral-600",
};

export function SeverityDot({ severity }: { severity: string }) {
  return (
    <span
      className={`inline-block rounded-full px-1.5 py-0.5 text-[10px] font-medium uppercase ${
        SEV[severity] ?? SEV.low
      }`}
    >
      {severity}
    </span>
  );
}

/** "3 days ago", "just now", "—". */
export function ago(iso: string | null | undefined): string {
  if (!iso) return "—";
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "—";
  const s = Math.max(0, (Date.now() - then) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  const d = Math.floor(s / 86400);
  if (d < 30) return `${d}d ago`;
  if (d < 365) return `${Math.floor(d / 30)}mo ago`;
  return `${Math.floor(d / 365)}y ago`;
}
