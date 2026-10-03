import { getEventSummary, getWaitSummary } from "@/lib/admin";
import { Cell, Empty, ErrorNote, Row, Section, Table, ago } from "../ui";

export const dynamic = "force-dynamic";

export default async function AdminEventsPage() {
  const [{ rows, error }, waits] = await Promise.all([getEventSummary(), getWaitSummary()]);
  if (error) return <ErrorNote message={error} />;

  if (rows.length === 0)
    return (
      <Empty>
        No events logged yet. The app started sending them from this deploy — screen views
        appear within minutes of someone opening a page, and named events (like
        <code className="mx-1 text-caption">round_recording_started</code>) as those features get
        used. Or this sign-in is not an admin.
      </Empty>
    );

  const pageViews = rows.filter((r) => r.name === "page_view");
  const named = rows.filter((r) => r.name !== "page_view");

  return (
    <>
      <Section title="Waits" subtitle="What residents sit and watch, last 30 days — slowest first">
        {waits.error ? (
          <p className="ios-group px-4 py-3 text-footnote text-muted">{waits.error}</p>
        ) : waits.rows.length === 0 ? (
          <p className="ios-group px-4 py-3 text-footnote text-muted">No waits timed yet.</p>
        ) : (
          <Table head={["Wait", "Times", "People", "Median", "90%", "Slowest", "Failed"]}>
            {waits.rows.map((r) => (
              <Row key={r.what}>
                <Cell>{r.what}</Cell>
                <Cell num>{r.waits}</Cell>
                <Cell num>{r.people}</Cell>
                <Cell num>{secs(r.p50_ms)}</Cell>
                <Cell num>{secs(r.p90_ms)}</Cell>
                <Cell num muted>
                  {secs(r.max_ms)}
                </Cell>
                <Cell num>{r.failed}</Cell>
              </Row>
            ))}
          </Table>
        )}
      </Section>

      <Section title="Named events" subtitle="Feature-level events the app reports explicitly">
        {named.length === 0 ? (
          <p className="ios-group px-4 py-3 text-footnote text-muted">
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
          <p className="ios-group px-4 py-3 text-footnote text-muted">No screen views yet.</p>
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
        <p className="mt-2 px-1 text-caption text-muted">
          Per-screen breakdown is on the Feature usage tab.
        </p>
      </Section>
    </>
  );
}

function secs(ms: number | null): string {
  return ms == null ? "—" : `${(ms / 1000).toFixed(1)} s`;
}
