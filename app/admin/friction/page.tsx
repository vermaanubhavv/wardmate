import { getFriction, getUsageFriction, type UsageFriction } from "@/lib/admin";
import { Empty, ErrorNote, Section, SeverityDot, ago } from "../ui";

export const dynamic = "force-dynamic";

const ORDER: Record<string, number> = { high: 3, medium: 2, low: 1 };

export default async function AdminFrictionPage() {
  const [{ rows, error }, usage] = await Promise.all([getFriction(), getUsageFriction()]);
  if (error) return <ErrorNote message={error} />;

  const usageSection = (
    <>
      <Section
        title="Seen during use · last 30 days"
        subtitle="Places the app got in someone's way while they were using it — failures, corrections, screens opened and abandoned, work thrown away. Worst first."
      >
        {usage.error ? (
          <p className="ios-group px-4 py-3 text-footnote text-warn-fg">
            Unavailable — run <code>supabase/patches/0101_admin_activity_feed_usage_friction.sql</code> ({usage.error}).
          </p>
        ) : usage.rows.length === 0 ? (
          <p className="ios-group px-4 py-3 text-footnote text-muted">Nothing got in anyone&apos;s way in the last 30 days.</p>
        ) : (
          <div className="ios-group divide-y divide-line/40">
            {usage.rows.map((f) => (
              <UsageRow key={f.signal} f={f} />
            ))}
          </div>
        )}
      </Section>
      <p className="mt-8 px-1 text-caption text-muted">
        Below: accounts and units that stalled — who stopped, rather than what stopped them.
      </p>
    </>
  );

  if (rows.length === 0)
    return (
      <>
        {usageSection}
        <Empty>No stalled accounts or cold units.</Empty>
      </>
    );

  const byCategory = new Map<string, typeof rows>();
  for (const f of rows) {
    if (!byCategory.has(f.category)) byCategory.set(f.category, []);
    byCategory.get(f.category)!.push(f);
  }

  return (
    <>
      {usageSection}
      <p className="mt-4 text-footnote text-muted">
        {rows.length} signal{rows.length === 1 ? "" : "s"} across {byCategory.size} categor
        {byCategory.size === 1 ? "y" : "ies"}. Each is a place someone signed up or started and
        then stalled.
      </p>

      {[...byCategory.entries()].map(([category, items]) => (
        <Section key={category} title={`${category} · ${items.length}`}>
          <div className="ios-group divide-y divide-line/40">
            {items
              .sort((a, b) => (ORDER[b.severity] ?? 0) - (ORDER[a.severity] ?? 0))
              .map((f, i) => (
                <div key={i} className="flex items-start gap-2.5 px-4 py-3">
                  <SeverityDot severity={f.severity} />
                  <div className="min-w-0">
                    <div className="text-footnote font-medium">{f.subject}</div>
                    <div className="text-caption text-muted">{f.detail}</div>
                    {f.since && (
                      <div className="text-caption2 text-muted/80">since {ago(f.since)}</div>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </Section>
      ))}
    </>
  );
}

function UsageRow({ f }: { f: UsageFriction }) {
  const rate = f.out_of ? Math.round((f.occurrences / f.out_of) * 100) : null;
  return (
    <div className="flex items-start gap-2.5 px-4 py-3">
      <SeverityDot severity={f.severity} />
      <div className="min-w-0 flex-1">
        <div className="text-caption2 uppercase tracking-wide text-muted">{f.area}</div>
        <div className="text-footnote font-medium">{f.signal}</div>
        <div className="mt-0.5 text-footnote tabular-nums">
          {f.out_of ? `${f.occurrences} of ${f.out_of} (${rate}%)` : `${f.occurrences} time${f.occurrences === 1 ? "" : "s"}`}
          {f.people ? <span className="text-muted"> · {f.people} {f.people === 1 ? "person" : "people"}</span> : null}
        </div>
        <div className="text-caption text-muted">{f.detail}</div>
        {f.last_seen && <div className="text-caption2 text-muted/80">last {ago(f.last_seen)}</div>}
      </div>
    </div>
  );
}
