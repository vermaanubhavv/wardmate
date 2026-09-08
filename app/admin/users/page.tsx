import { getUsers } from "@/lib/admin";
import { Cell, Empty, ErrorNote, Row, Section, Table, ago } from "../ui";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const { rows, error } = await getUsers();
  if (error) return <ErrorNote message={error} />;
  if (rows.length === 0) return <Empty>No users, or this sign-in is not an admin.</Empty>;

  const quiet = rows.filter((u) => u.entries === 0 && u.round_dictations === 0);

  return (
    <>
      <Section
        title={`${rows.length} users`}
        subtitle={`${quiet.length} have never dictated · sorted by last activity`}
      >
        <Table
          head={["User", "Joined", "Units", "Voice", "Rounds", "Discharges", "Last active"]}
        >
          {rows.map((u) => (
            <Row key={u.user_id}>
              <Cell>
                <div className="font-medium">{u.name ?? "—"}</div>
                <div className="text-[11px] text-muted">{u.email ?? u.user_id.slice(0, 8)}</div>
                {u.is_admin && (
                  <span className="text-[10px] font-medium uppercase text-accent">admin</span>
                )}
              </Cell>
              <Cell num muted>
                {ago(u.joined_at)}
              </Cell>
              <Cell num>{u.wards}</Cell>
              <Cell num>{u.voice_entries}</Cell>
              <Cell num>{u.round_dictations}</Cell>
              <Cell num>{u.discharges}</Cell>
              <Cell num muted>
                {ago(u.last_active)}
              </Cell>
            </Row>
          ))}
        </Table>
      </Section>

      {quiet.length > 0 && (
        <Section title="Never dictated" subtitle="Signed up but no voice or round dictation yet">
          <div className="ios-group divide-y divide-line/40">
            {quiet.map((u) => (
              <div key={u.user_id} className="flex items-center justify-between px-4 py-2.5">
                <div>
                  <div className="text-[13px] font-medium">{u.name ?? u.email ?? "—"}</div>
                  <div className="text-[11px] text-muted">
                    joined {ago(u.joined_at)} · {u.wards} unit{u.wards === 1 ? "" : "s"}
                  </div>
                </div>
                <span className="text-[11px] text-muted">
                  {u.days_since_signup != null ? `${Math.round(u.days_since_signup)}d` : ""}
                </span>
              </div>
            ))}
          </div>
        </Section>
      )}
    </>
  );
}
