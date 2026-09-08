import { getActivityLog } from "@/lib/admin";
import { Empty, ErrorNote, Section, ago } from "../ui";

export const dynamic = "force-dynamic";

const KIND: Record<string, string> = {
  dictation: "bg-blue-100 text-blue-700",
  round: "bg-violet-100 text-violet-700",
  discharge: "bg-emerald-100 text-emerald-700",
  unit: "bg-amber-100 text-amber-700",
  member: "bg-neutral-200 text-neutral-600",
  event: "bg-neutral-100 text-neutral-500",
};

export default async function AdminActivityPage() {
  const { rows, error } = await getActivityLog(200);
  if (error) return <ErrorNote message={error} />;
  if (rows.length === 0) return <Empty>Nothing recorded yet, or this sign-in is not an admin.</Empty>;

  return (
    <Section title="Recent activity" subtitle={`Last ${rows.length} events, newest first`}>
      <div className="ios-group divide-y divide-line/40">
        {rows.map((r, i) => (
          <div key={i} className="flex items-start gap-2.5 px-4 py-2.5">
            <span
              className={`mt-0.5 shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-medium ${
                KIND[r.kind] ?? KIND.event
              }`}
            >
              {r.kind}
            </span>
            <div className="min-w-0 flex-1">
              <div className="text-[13px]">{r.summary}</div>
              <div className="text-[11px] text-muted">
                {r.actor}
                {r.ward ? ` · ${r.ward}` : ""} · {ago(r.at)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}
