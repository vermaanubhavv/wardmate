import { getFriction } from "@/lib/admin";
import { Empty, ErrorNote, Section, SeverityDot, ago } from "../ui";

export const dynamic = "force-dynamic";

const ORDER: Record<string, number> = { high: 3, medium: 2, low: 1 };

export default async function AdminFrictionPage() {
  const { rows, error } = await getFriction();
  if (error) return <ErrorNote message={error} />;

  if (rows.length === 0)
    return (
      <Empty>
        Nothing flagged. No stalled accounts, no cold units, no dictations being binned — or
        this sign-in is not an admin.
      </Empty>
    );

  const byCategory = new Map<string, typeof rows>();
  for (const f of rows) {
    if (!byCategory.has(f.category)) byCategory.set(f.category, []);
    byCategory.get(f.category)!.push(f);
  }

  return (
    <>
      <p className="mt-4 text-[13px] text-muted">
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
                    <div className="text-[13px] font-medium">{f.subject}</div>
                    <div className="text-[12px] text-muted">{f.detail}</div>
                    {f.since && (
                      <div className="text-[11px] text-muted/80">since {ago(f.since)}</div>
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
