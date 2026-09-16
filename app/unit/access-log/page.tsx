import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/auth";
import { getCurrentWard } from "@/lib/ward";

type LogRow = {
  id: string;
  patient_id: string;
  actor_id: string | null;
  occurred_at: string;
  patients: { display_name: string; bed: string } | null;
};

const LIMIT = 200;

/**
 * Who looked at which patient, and when — owner only.
 *
 * Restricted at the database, not just here: patient_access_log_read (0072) only lets the
 * ward's owner select from this table at all, so this page showing nothing to anyone else is
 * enforced by Postgres even if this check were ever removed by mistake.
 */
export default async function AccessLogPage() {
  const { ward, error } = await getCurrentWard();

  if (error || !ward) {
    return (
      <main className="flex-1 px-6 py-10 max-w-md mx-auto w-full">
        <h1 className="ios-large-title">Access log</h1>
        <p className="mt-4 ios-group px-4 py-3 text-[15px] text-orange-700">
          {error ? `Could not read the database: ${error.message}` : "No ward found."}
        </p>
      </main>
    );
  }

  const user = await getUser();
  const isOwner = ward.owner_id === user?.id;

  if (!isOwner) {
    return (
      <main className="flex-1 px-6 py-10 max-w-md mx-auto w-full">
        <h1 className="ios-large-title">Access log</h1>
        <p className="mt-4 ios-group px-4 py-3 text-[15px] text-muted">
          Only {ward.name}&rsquo;s owner can see this.
        </p>
      </main>
    );
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from("patient_access_log")
    .select("id, patient_id, actor_id, occurred_at, patients(display_name, bed)")
    .eq("ward_id", ward.id)
    .order("occurred_at", { ascending: false })
    .limit(LIMIT);

  const entries = (data ?? []) as unknown as LogRow[];

  const actorIds = Array.from(new Set(entries.map((r) => r.actor_id).filter((id): id is string => Boolean(id))));
  const names = new Map<string, string | null>();
  if (actorIds.length > 0) {
    const { data: people } = await supabase
      .from("profiles")
      .select("id, display_name")
      .in("id", actorIds);
    for (const p of people ?? []) names.set(p.id, p.display_name);
  }

  return (
    <div className="flex-1 flex flex-col max-w-md mx-auto w-full">
      <header className="px-6 pt-8 pb-4">
        <Link href="/unit" className="text-[17px] text-accent">
          ‹ Unit
        </Link>
        <h1 className="mt-3 ios-large-title">Access log</h1>
        <p className="mt-0.5 text-[15px] text-muted">
          Who opened a patient&rsquo;s record on {ward.name}, most recent first. Last {LIMIT}.
        </p>
      </header>

      <section className="px-6 pb-16 flex flex-col gap-3">
        {entries.length === 0 ? (
          <p className="ios-group p-6 text-[15px] text-muted">No views logged yet.</p>
        ) : (
          <ul className="ios-group divide-y divide-line">
            {entries.map((row) => (
              <li key={row.id} className="px-4 py-3">
                <div className="flex items-baseline gap-2">
                  {row.patients && (
                    <span className="shrink-0 rounded-md bg-chip px-2 py-1 font-mono text-[13px]">
                      {row.patients.bed}
                    </span>
                  )}
                  <span className="truncate text-[15px]">
                    {row.patients?.display_name ?? "Deleted patient"}
                  </span>
                </div>
                <p className="mt-1 text-[13px] text-muted">
                  {(row.actor_id && names.get(row.actor_id)) || "Doctor"} ·{" "}
                  {whenViewed(row.occurred_at)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function whenViewed(iso: string): string {
  return new Date(iso).toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });
}
