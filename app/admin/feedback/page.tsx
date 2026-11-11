import { getFeedbackResponses, getPaperReasons } from "@/lib/admin";
import { Cell, Empty, ErrorNote, Row, Section, Table, ago } from "../ui";
import FeedbackFormLink from "./form-link";

export default async function AdminFeedbackPage() {
  const [{ rows, error }, paper] = await Promise.all([getFeedbackResponses(), getPaperReasons()]);
  if (error) return <ErrorNote message={error} />;
  return <>
    <Section title="What made you reach for paper today?" subtitle="One answer a day per resident, from the handover screen">
      {paper.rows.length === 0 ? <Empty>No answers yet.</Empty> : <Table head={["When", "Unit", "Reason"]}>{paper.rows.map((r) => <Row key={r.id}><Cell muted>{ago(r.created_at)}</Cell><Cell>{r.ward_name ?? "—"}</Cell><Cell>{r.text}</Cell></Row>)}</Table>}
    </Section>
    <Section title="Feedback form" subtitle="Use this when you want to request feedback manually."><FeedbackFormLink /></Section>
    {rows.length === 0 ? <Empty>No feedback responses yet.</Empty> : <Section title={`${rows.length} feedback responses`} subtitle="Newest first"><Table head={["When", "Experience", "Improve first", "Use again", "Talk", "Notes"]}>{rows.map((row) => <Row key={row.id}><Cell muted>{ago(row.created_at)}</Cell><Cell>{row.experience}</Cell><Cell>{row.improvement}</Cell><Cell>{row.would_return}</Cell><Cell>{row.talk}{row.contact && <div className="mt-1 text-caption2 text-muted">{row.contact}</div>}</Cell><Cell>{row.open_feedback ?? "—"}</Cell></Row>)}</Table></Section>}
  </>;
}
