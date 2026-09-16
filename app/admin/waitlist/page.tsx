import { getWaitlist } from "@/lib/admin";
import { Cell, Empty, ErrorNote, Row, Section, Table, ago } from "../ui";

export const dynamic = "force-dynamic";

export default async function AdminWaitlistPage() {
  const { rows, error } = await getWaitlist();
  if (error) return <ErrorNote message={error} />;
  if (rows.length === 0) return <Empty>Nobody has joined yet, or this sign-in is not an admin.</Empty>;

  return (
    <Section title={`${rows.length} on the waitlist`} subtitle="Newest first">
      <Table head={["Name", "Email", "College", "Department", "Year", "Joined"]}>
        {rows.map((w) => (
          <Row key={w.id}>
            <Cell>{w.name ?? "—"}</Cell>
            <Cell muted>{w.email}</Cell>
            <Cell muted>{w.college ?? "—"}</Cell>
            <Cell muted>{w.department ?? "—"}</Cell>
            <Cell muted>{w.year_of_residency ?? "—"}</Cell>
            <Cell num muted>
              {ago(w.created_at)}
            </Cell>
          </Row>
        ))}
      </Table>
    </Section>
  );
}
