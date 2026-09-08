import { getWardActivity } from "@/lib/admin";
import { getSpecialtyPack } from "@/lib/specialty";
import { Cell, Empty, ErrorNote, Row, Section, Table, ago } from "../ui";

export const dynamic = "force-dynamic";

export default async function AdminWardsPage() {
  const { rows, error } = await getWardActivity();
  if (error) return <ErrorNote message={error} />;
  if (rows.length === 0) return <Empty>No units, or this sign-in is not an admin.</Empty>;

  const live = rows.filter((w) => !w.archived);
  const cold = live.filter((w) => (w.days_since_activity ?? 999) >= 14 || w.last_activity == null);

  // Group by department = shared specialty value (docs/specialty-packs.md).
  const byDept = new Map<string, typeof rows>();
  for (const w of live) {
    const label = getSpecialtyPack(w.specialty).label;
    if (!byDept.has(label)) byDept.set(label, []);
    byDept.get(label)!.push(w);
  }

  return (
    <>
      <Section
        title={`${live.length} active units`}
        subtitle={`${cold.length} cold (no activity in 14+ days) · ${
          rows.length - live.length
        } archived`}
      >
        {[...byDept.entries()].map(([dept, units]) => (
          <div key={dept} className="mt-3 first:mt-0">
            <div className="px-1 pb-1 text-[11px] uppercase tracking-wide text-muted">{dept}</div>
            <Table
              head={["Unit", "Members", "Patients", "Dict 7d", "Dict 30d", "Rounds 30d", "Last active"]}
            >
              {units.map((w) => (
                <Row key={w.ward_id}>
                  <Cell>
                    <div className="font-medium">{w.ward_name}</div>
                    <div className="text-[11px] text-muted">code {w.join_code}</div>
                  </Cell>
                  <Cell num>{w.members}</Cell>
                  <Cell num>
                    {w.active_patients}
                    <span className="text-muted"> / {w.total_patients}</span>
                  </Cell>
                  <Cell num>{w.entries_7d}</Cell>
                  <Cell num>{w.entries_30d}</Cell>
                  <Cell num>
                    {w.round_dictations_30d}
                    {w.round_discarded_30d > 0 && (
                      <span className="text-orange-600"> ({w.round_discarded_30d} binned)</span>
                    )}
                  </Cell>
                  <Cell
                    num
                    muted={(w.days_since_activity ?? 0) < 14}
                  >
                    <span className={(w.days_since_activity ?? 0) >= 14 ? "text-orange-600" : ""}>
                      {ago(w.last_activity)}
                    </span>
                  </Cell>
                </Row>
              ))}
            </Table>
          </div>
        ))}
      </Section>

      {rows.some((w) => w.archived) && (
        <Section title="Archived units">
          <Table head={["Unit", "Members", "Patients (all-time)", "Discharges", "Last active"]}>
            {rows
              .filter((w) => w.archived)
              .map((w) => (
                <Row key={w.ward_id}>
                  <Cell>{w.ward_name}</Cell>
                  <Cell num>{w.members}</Cell>
                  <Cell num>{w.total_patients}</Cell>
                  <Cell num>{w.discharges_finalised}</Cell>
                  <Cell num muted>
                    {ago(w.last_activity)}
                  </Cell>
                </Row>
              ))}
          </Table>
        </Section>
      )}
    </>
  );
}
