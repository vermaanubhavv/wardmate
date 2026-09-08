import { getEventSummary } from "@/lib/admin";
import { Cell, Empty, ErrorNote, Row, Section, Table, ago } from "../ui";

export const dynamic = "force-dynamic";

export default async function AdminEventsPage() {
  const { rows, error } = await getEventSummary();
  if (error) return <ErrorNote message={error} />;

  if (rows.length === 0)
    return (
      <Empty>
        No events logged yet. The app started sending them from this deploy — screen views
        appear within minutes of someone opening a page, and named events (like
        <code className="mx-1 text-[12px]">round_recording_started</code>) as those features get
        used. Or this sign-in is not an admin.
      </Empty>
    );

  const pageViews = rows.filter((r) => r.name === "page_view");
  const named = rows.filter((r) => r.name !== "page_view");

  return (
    <>
      <Section title="Named events" subtitle="Feature-level events the app reports explicitly">
        {named.length === 0 ? (
          <p className="ios-group px-4 py-3 text-[13px] text-muted">
            None yet — only screen views so far.
          </p>
        ) : (
          <Table head={["Event", "Total", "People", "Last 7d", "Last seen"]}>
            {named.map((r) => (
              <Row key={r.name}>
                <Cell>{r.name}</Cell>
                <Cell num>{r.events}</Cell>
                <Cell num>{r.actors}</Cell>
                <Cell num>{r.events_7d}</Cell>
                <Cell num muted>
                  {ago(r.last_seen)}
                </Cell>
              </Row>
            ))}
          </Table>
        )}
      </Section>

      <Section title="Screen views" subtitle="page_view — how often each screen is opened">
        {pageViews.length === 0 ? (
          <p className="ios-group px-4 py-3 text-[13px] text-muted">No screen views yet.</p>
        ) : (
          <Table head={["", "Total", "People", "Last 7d"]}>
            <Row>
              <Cell>page_view (all screens)</Cell>
              <Cell num>{pageViews[0].events}</Cell>
              <Cell num>{pageViews[0].actors}</Cell>
              <Cell num>{pageViews[0].events_7d}</Cell>
            </Row>
          </Table>
        )}
        <p className="mt-2 px-1 text-[12px] text-muted">
          Per-screen breakdown lives in the <code className="text-[11px]">props.screen</code> of
          each row — a future tab can chart it; the raw rows are in the
          <code className="mx-1 text-[11px]">app_events</code> table.
        </p>
      </Section>
    </>
  );
}
