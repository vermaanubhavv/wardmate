import { getFeedbackResponses } from "@/lib/admin";
import { Cell, Empty, ErrorNote, Row, Section, Table, ago } from "../ui";
import FeedbackFormLink from "./form-link";

export const dynamic = "force-dynamic";

export default async function AdminFeedbackPage() {
  const { rows, error } = await getFeedbackResponses();
  if (error) return <ErrorNote message={error} />;
  return <>
    <Section title="Feedback form" subtitle="Use this when you want to request feedback manually."><FeedbackFormLink /></Section>
    {rows.length === 0 ? <Empty>No feedback responses yet.</Empty> : <Section title={`${rows.length} feedback responses`} subtitle="Newest first"><Table head={["When", "Experience", "Improve first", "Use again", "Talk", "Notes"]}>{rows.map((row) => <Row key={row.id}><Cell muted>{ago(row.created_at)}</Cell><Cell>{row.experience}</Cell><Cell>{row.improvement}</Cell><Cell>{row.would_return}</Cell><Cell>{row.talk}{row.contact && <div className="mt-1 text-[11px] text-muted">{row.contact}</div>}</Cell><Cell>{row.open_feedback ?? "—"}</Cell></Row>)}</Table></Section>}
  </>;
}
