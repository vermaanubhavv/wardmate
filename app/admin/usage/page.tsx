import { getFeatureUsage, getScreenUsage, getSttBreakdown } from "@/lib/admin";
import { groupScreens } from "@/lib/admin-insights";
import { Cell, Empty, ErrorNote, Row, Section, Table, ago } from "../ui";

export const dynamic = "force-dynamic";

export default async function AdminUsagePage() {
  const [{ rows: usage, error }, { rows: stt }, { rows: screenRows }] = await Promise.all([
    getFeatureUsage(),
    getSttBreakdown(),
    getScreenUsage(),
  ]);
  const screens = groupScreens(screenRows);

  if (error) return <ErrorNote message={error} />;
  if (usage.length === 0) return <Empty>No usage yet, or this sign-in is not an admin.</Empty>;

  const byFeature = new Map<string, { metric: string; count: number }[]>();
  for (const u of usage) {
    if (!byFeature.has(u.feature)) byFeature.set(u.feature, []);
    byFeature.get(u.feature)!.push({ metric: u.metric, count: u.count });
  }

  return (
    <>
      <Section
        title="Screens people open"
        subtitle="Every screen view, grouped by screen. Sorted by the last 30 days — the bottom of this list is what nobody finds."
      >
        {screens.length === 0 ? (
          <p className="ios-group px-4 py-3 text-footnote text-muted">No screen views recorded yet.</p>
        ) : (
          <Table head={["Screen", "Views 30d", "People 30d", "All-time", "Last opened"]}>
            {screens.map((s) => (
              <Row key={s.label}>
                <Cell>{s.label}</Cell>
                <Cell num>{s.views_30d}</Cell>
                <Cell num>{s.people_30d}</Cell>
                <Cell num muted>{s.views}</Cell>
                <Cell num muted>{ago(s.last_seen)}</Cell>
              </Row>
            ))}
          </Table>
        )}
      </Section>

      <p className="mt-8 px-1 text-caption text-muted">
        Below: what each feature produced, all-time. The percentage is the share within that
        feature — e.g. how many round dictations were applied versus thrown away.
      </p>
      {[...byFeature.entries()].map(([feature, metrics]) => {
        const total = metrics.reduce((s, m) => s + m.count, 0);
        return (
          <Section key={feature} title={feature}>
            <div className="ios-group divide-y divide-line/40">
              {metrics.map((m) => (
                <div key={m.metric} className="flex items-center justify-between px-4 py-2.5">
                  <span className="text-footnote">{m.metric}</span>
                  <span className="flex items-center gap-2">
                    <span className="tabular-nums text-footnote font-medium">{m.count}</span>
                    <span className="text-caption2 text-muted">
                      {total > 0 ? `${Math.round((m.count / total) * 100)}%` : ""}
                    </span>
                  </span>
                </div>
              ))}
            </div>
          </Section>
        );
      })}

      <Section title="Speech engine" subtitle="Voice dictations by provider / model">
        {stt.length === 0 ? (
          <p className="ios-group px-4 py-3 text-footnote text-muted">No voice dictations yet.</p>
        ) : (
          <Table head={["Provider", "Model", "Entries", "Extraction errors"]}>
            {stt.map((s, i) => (
              <Row key={i}>
                <Cell>{s.provider}</Cell>
                <Cell muted>{s.model}</Cell>
                <Cell num>{s.entries}</Cell>
                <Cell num>
                  <span className={s.errors > 0 ? "text-warn-fg" : ""}>{s.errors}</span>
                </Cell>
              </Row>
            ))}
          </Table>
        )}
      </Section>
    </>
  );
}
