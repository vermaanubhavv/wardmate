import Link from "next/link";
import { getOverview, getSignupsWeekly, getFriction } from "@/lib/admin";
import { Empty, ErrorNote, Section, Stat, StatGrid, SeverityDot } from "./ui";

export const dynamic = "force-dynamic";

export default async function AdminOverviewPage() {
  const [{ row: o, error }, { rows: weeks }, { rows: friction }] = await Promise.all([
    getOverview(),
    getSignupsWeekly(),
    getFriction(),
  ]);

  if (error) return <ErrorNote message={error} />;
  if (!o) return <Empty>Nothing to show yet, or this sign-in is not an admin.</Empty>;

  const maxWeek = Math.max(1, ...weeks.map((w) => w.signups));
  const topFriction = [...friction]
    .sort((a, b) => sev(b.severity) - sev(a.severity))
    .slice(0, 5);

  return (
    <>
      <Section title="People">
        <StatGrid>
          <Stat label="Total users" value={o.users} hint={`${o.admins} admin`} />
          <Stat label="Active last 7d" value={o.active_users_7d} />
          <Stat label="New this week" value={o.signups_7d} hint={`${o.signups_30d} in 30d`} />
        </StatGrid>
      </Section>

      <Section title="Units & patients">
        <StatGrid>
          <Stat label="Active units" value={o.wards_active} hint={`${o.wards_archived} archived`} />
          <Stat label="Units active 7d" value={o.active_wards_7d} />
          <Stat
            label="Active patients"
            value={o.patients_active}
            hint={`${o.patients_total} all-time`}
          />
        </StatGrid>
      </Section>

      <Section title="What's being produced">
        <StatGrid>
          <Stat label="Voice dictations" value={o.voice_entries} />
          <Stat label="Photo reads" value={o.photo_entries} />
          <Stat label="Round dictations" value={o.round_dictations} />
          <Stat
            label="Discharge summaries"
            value={o.discharges_finalised}
            hint={`${o.discharges_draft} in draft`}
          />
          <Stat label="Events logged 7d" value={o.events_7d} />
        </StatGrid>
      </Section>

      <Section title="Signups — last 12 weeks">
        <div className="ios-group px-3 py-3">
          {weeks.length === 0 ? (
            <p className="text-[13px] text-muted">No signups recorded.</p>
          ) : (
            <div className="flex items-end gap-1" style={{ height: 72 }}>
              {weeks.map((w) => (
                <div key={w.week} className="flex flex-1 flex-col items-center gap-1">
                  <div
                    className="w-full rounded-sm bg-accent/70"
                    style={{ height: `${(w.signups / maxWeek) * 56}px` }}
                    title={`${w.week}: ${w.signups}`}
                  />
                  <span className="text-[9px] tabular-nums text-muted">{w.signups}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </Section>

      <Section title="Top friction points" subtitle="Full list on the Friction tab">
        {topFriction.length === 0 ? (
          <p className="ios-group px-4 py-3 text-[13px] text-muted">
            Nothing flagged — no stalled accounts or cold units.
          </p>
        ) : (
          <div className="ios-group divide-y divide-line/40">
            {topFriction.map((f, i) => (
              <div key={i} className="flex items-start gap-2 px-4 py-2.5">
                <SeverityDot severity={f.severity} />
                <div className="min-w-0">
                  <div className="text-[13px] font-medium">
                    {f.category} · <span className="font-normal">{f.subject}</span>
                  </div>
                  <div className="text-[12px] text-muted">{f.detail}</div>
                </div>
              </div>
            ))}
          </div>
        )}
        <p className="mt-2 px-1 text-[12px]">
          <Link href="/admin/friction" className="text-accent underline">
            See all friction points
          </Link>
        </p>
      </Section>
    </>
  );
}

function sev(s: string) {
  return s === "high" ? 3 : s === "medium" ? 2 : 1;
}
