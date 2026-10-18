import { createClient } from "@/lib/supabase/server";
import { Cell, Empty, ErrorNote, Row, Section, Table, ago } from "../ui";
import { reviewShorthand } from "./actions";

type Suggestion = {
  id: string;
  specialty: string;
  long_form: string;
  short_form: string;
  times_seen: number;
  status: "pending" | "approved" | "rejected";
  last_seen_at: string;
};

/**
 * Ward shorthand residents taught by editing a value shorter (supabase/patches/0109). Approving
 * applies nothing: an approved pair is added to lib/transcription/lexicon/ward-shorthand.ts in
 * the next change, where the guard tests run on it — the line to paste is shown beside it.
 */
export default async function AdminShorthandPage() {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("admin_shorthand_suggestions");
  if (error) return <ErrorNote message={/does not exist/i.test(error.message) ? "run patch 0109 first." : error.message} />;
  const rows = (data ?? []) as Suggestion[];
  const pending = rows.filter((r) => r.status === "pending");
  const approved = rows.filter((r) => r.status === "approved");

  const verdict = (id: string, v: Suggestion["status"], label: string) => (
    <form action={reviewShorthand} className="inline">
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="verdict" value={v} />
      <button type="submit" className="mr-2 text-footnote text-accent active:opacity-60">{label}</button>
    </form>
  );

  return (
    <>
      {pending.length === 0 ? (
        <Empty>No shorthand suggestions waiting.</Empty>
      ) : (
        <Section title={`${pending.length} waiting`} subtitle="Pairs residents wrote by editing a value shorter. Nothing is applied until it is in the lexicon.">
          <Table head={["Unit", "Said", "Written", "Seen", "Last", ""]}>
            {pending.map((r) => (
              <Row key={r.id}>
                <Cell muted>{r.specialty}</Cell>
                <Cell>{r.long_form}</Cell>
                <Cell>{r.short_form}</Cell>
                <Cell num>{r.times_seen}</Cell>
                <Cell muted>{ago(r.last_seen_at)}</Cell>
                <Cell>{verdict(r.id, "approved", "Approve")}{verdict(r.id, "rejected", "Reject")}</Cell>
              </Row>
            ))}
          </Table>
        </Section>
      )}
      {approved.length > 0 && (
        <Section title={`${approved.length} approved`} subtitle="Add each line to lib/transcription/lexicon/ward-shorthand.ts, then run npx vitest run shorthand-table -u.">
          <Table head={["Unit", "Lexicon line", ""]}>
            {approved.map((r) => (
              <Row key={r.id}>
                <Cell muted>{r.specialty}</Cell>
                <Cell><code className="text-footnote">{`[${JSON.stringify(r.long_form)}, ${JSON.stringify(r.short_form)}],`}</code></Cell>
                <Cell>{verdict(r.id, "pending", "Undo")}</Cell>
              </Row>
            ))}
          </Table>
        </Section>
      )}
    </>
  );
}
