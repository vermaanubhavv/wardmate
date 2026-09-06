import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/auth";
import { getSpecialtyPack } from "@/lib/specialty";

/**
 * Admin overview: every department, every unit in it, and how many active patients and
 * doctors each one has. Nobody's role gates this in the UI — the database does, via
 * `admin_ward_summary()` (patch 0065), which returns rows only to a profile with
 * `is_admin = true`. Everyone else gets an empty result, indistinguishable at this screen from
 * "no units exist yet" — the same "degrade, don't crash" the rest of the app uses rather than
 * a page that reveals whether admin access exists.
 *
 * "Department" is not stored anywhere — it is simply every ward sharing a `specialty` value
 * (docs/specialty-packs.md). This page is the one place that grouping is drawn on screen.
 */

type WardSummaryRow = {
  ward_id: string;
  ward_name: string;
  join_code: string;
  specialty: string | null;
  active_patients: number;
  doctors: number;
};

export default async function AdminUnitsPage() {
  const user = await getUser();
  if (!user) {
    return (
      <main className="flex-1 px-6 py-10 max-w-md mx-auto w-full">
        <h1 className="ios-large-title">Admin</h1>
        <p className="mt-4 text-[15px] text-[var(--muted)]">Sign in to see this page.</p>
      </main>
    );
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("admin_ward_summary");
  const rows = (data ?? []) as WardSummaryRow[];

  if (error) {
    return (
      <main className="flex-1 px-6 py-10 max-w-md mx-auto w-full">
        <h1 className="ios-large-title">Admin</h1>
        <p className="mt-4 ios-group px-4 py-3 text-[15px] text-orange-700">
          Could not read the database: {error.message}
        </p>
      </main>
    );
  }

  if (rows.length === 0) {
    return (
      <main className="flex-1 px-6 py-10 max-w-md mx-auto w-full">
        <h1 className="ios-large-title">Admin</h1>
        <p className="mt-4 text-[15px] text-[var(--muted)]">
          Nothing to show. Either there are no units yet, or this sign-in is not set up as an
          admin — that is done by hand in the database (see the bottom of{" "}
          <code className="text-[13px]">supabase/patches/0065_admin_dashboard.sql</code>).
        </p>
      </main>
    );
  }

  const byDept = new Map<string, WardSummaryRow[]>();
  for (const row of rows) {
    const label = getSpecialtyPack(row.specialty).label;
    if (!byDept.has(label)) byDept.set(label, []);
    byDept.get(label)!.push(row);
  }

  const totalPatients = rows.reduce((s, r) => s + Number(r.active_patients), 0);
  const totalDoctors = rows.reduce((s, r) => s + Number(r.doctors), 0);

  return (
    <main className="flex-1 px-6 py-10 max-w-md mx-auto w-full pb-24">
      <h1 className="ios-large-title">Admin</h1>
      <p className="mt-1 text-[15px] text-[var(--muted)]">
        {rows.length} unit{rows.length === 1 ? "" : "s"} · {totalPatients} active patient
        {totalPatients === 1 ? "" : "s"} · {totalDoctors} doctor{totalDoctors === 1 ? "" : "s"}
      </p>

      {[...byDept.entries()].map(([dept, units]) => {
        const deptPatients = units.reduce((s, r) => s + Number(r.active_patients), 0);
        const deptDoctors = units.reduce((s, r) => s + Number(r.doctors), 0);
        return (
          <section key={dept} className="mt-8">
            <div className="ios-group-header flex items-baseline justify-between px-1">
              <span>{dept}</span>
              <span>
                {units.length} unit{units.length === 1 ? "" : "s"} · {deptPatients} patient
                {deptPatients === 1 ? "" : "s"} · {deptDoctors} doctor{deptDoctors === 1 ? "" : "s"}
              </span>
            </div>
            <div className="ios-group mt-1">
              {units.map((u) => (
                <div key={u.ward_id} className="ios-row px-4 py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-[15px] font-medium truncate">{u.ward_name}</div>
                    <div className="text-[13px] text-[var(--muted)]">Code {u.join_code}</div>
                  </div>
                  <div className="text-right shrink-0 text-[13px] text-[var(--muted)]">
                    <div className="text-[15px] text-[var(--foreground)]">
                      {u.active_patients} patient{Number(u.active_patients) === 1 ? "" : "s"}
                    </div>
                    <div>
                      {u.doctors} doctor{Number(u.doctors) === 1 ? "" : "s"}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        );
      })}

      <p className="mt-8 text-[13px] text-[var(--muted)]">
        <Link href="/ward" className="underline">
          Back to your ward
        </Link>
      </p>
    </main>
  );
}
