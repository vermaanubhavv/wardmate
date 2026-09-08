import { getFeatureUsage, getSttBreakdown } from "@/lib/admin";
import { Cell, Empty, ErrorNote, Row, Section, Table } from "../ui";

export const dynamic = "force-dynamic";

export default async function AdminUsagePage() {
  const [{ rows: usage, error }, { rows: stt }] = await Promise.all([
    getFeatureUsage(),
    getSttBreakdown(),
  ]);

  if (error) return <ErrorNote message={error} />;
  if (usage.length === 0) return <Empty>No usage yet, or this sign-in is not an admin.</Empty>;

  const byFeature = new Map<string, { metric: string; count: number }[]>();
  for (const u of usage) {
    if (!byFeature.has(u.feature)) byFeature.set(u.feature, []);
    byFeature.get(u.feature)!.push({ metric: u.metric, count: u.count });
  }

  return (
    <>
      {[...byFeature.entries()].map(([feature, metrics]) => {
        const total = metrics.reduce((s, m) => s + m.count, 0);
        return (
          <Section key={feature} title={feature}>
            <div className="ios-group divide-y divide-line/40">
              {metrics.map((m) => (
                <div key={m.metric} className="flex items-center justify-between px-4 py-2.5">
                  <span className="text-[13px]">{m.metric}</span>
                  <span className="flex items-center gap-2">
                    <span className="tabular-nums text-[13px] font-medium">{m.count}</span>
                    <span className="text-[11px] text-muted">
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
          <p className="ios-group px-4 py-3 text-[13px] text-muted">No voice dictations yet.</p>
        ) : (
          <Table head={["Provider", "Model", "Entries", "Extraction errors"]}>
            {stt.map((s, i) => (
              <Row key={i}>
                <Cell>{s.provider}</Cell>
                <Cell muted>{s.model}</Cell>
                <Cell num>{s.entries}</Cell>
                <Cell num>
                  <span className={s.errors > 0 ? "text-orange-600" : ""}>{s.errors}</span>
                </Cell>
              </Row>
            ))}
          </Table>
        )}
      </Section>
    </>
  );
}
