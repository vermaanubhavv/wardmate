import Link from "next/link";
import { getActivityFeed, getUsers, getWardActivity, type FeedRow } from "@/lib/admin";
import { screenLabel } from "@/lib/admin-insights";
import { Empty, ErrorNote, Section, ago } from "../ui";

export const dynamic = "force-dynamic";

/** The filter chips, in the order a day on the ward happens. `view` is last and off by default. */
const KINDS: { key: string; label: string; tone: string }[] = [
  { key: "patient", label: "Patients", tone: "bg-good-bg text-good-fg" },
  { key: "note", label: "Notes", tone: "bg-blue-100 text-blue-700" },
  { key: "round", label: "Ward rounds", tone: "bg-violet-100 text-violet-700" },
  { key: "register", label: "Register", tone: "bg-violet-100 text-violet-700" },
  { key: "discharge", label: "Discharges", tone: "bg-good-bg text-good-fg" },
  { key: "history", label: "History checks", tone: "bg-blue-100 text-blue-700" },
  { key: "unit", label: "Units", tone: "bg-warn-bg text-warn-fg" },
  { key: "feature", label: "Other actions", tone: "bg-neutral-200 text-neutral-600" },
  { key: "problem", label: "Problems", tone: "bg-critical-bg text-critical-fg" },
  { key: "view", label: "Screen views", tone: "bg-neutral-100 text-neutral-500" },
];
const TONE = Object.fromEntries(KINDS.map((k) => [k.key, k.tone]));
const KIND_LABEL = Object.fromEntries(KINDS.map((k) => [k.key, k.label]));

/** Named app events, in words. Anything not listed falls back to its name with spaces. */
const EVENT_WORDS: Record<string, string> = {
  round_recording_started: "Started recording a ward round",
  add_patient_failed: "Could not add a patient",
  round_recording_failed: "Round recording did not go through",
};

function words(r: FeedRow): string {
  if (r.kind !== "view" && r.kind !== "feature" && r.kind !== "problem") return r.summary;
  const [name, detail] = r.summary.split(" · ");
  if (name === "page_view") return `Opened ${screenLabel(detail ?? "")}`;
  const base = EVENT_WORDS[name];
  if (!base) return r.summary.includes("_") ? r.summary.replace(/_/g, " ") : r.summary;
  return detail ? `${base} — ${detail}` : base;
}

function dayHeading(iso: string): string {
  const d = new Date(iso);
  const today = new Date();
  const y = new Date(today);
  y.setDate(today.getDate() - 1);
  const same = (a: Date, b: Date) => a.toDateString() === b.toDateString();
  if (same(d, today)) return "Today";
  if (same(d, y)) return "Yesterday";
  return d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", timeZone: "Asia/Kolkata" });
}

type Params = { kind?: string; actor?: string; ward?: string; views?: string };

export default async function AdminActivityPage({ searchParams }: { searchParams: Promise<Params> }) {
  const p = await searchParams;
  const kind = KIND_LABEL[p.kind ?? ""] ? p.kind! : "";
  const [{ rows, error }, { rows: users }, { rows: wards }] = await Promise.all([
    getActivityFeed({ kind, actor: p.actor, ward: p.ward, views: p.views === "1" }),
    getUsers(),
    getWardActivity(),
  ]);
  if (error) return <ErrorNote message={error} />;

  const href = (next: Partial<Params>) => {
    const q = new URLSearchParams();
    for (const [k, v] of Object.entries({ ...p, ...next })) if (v) q.set(k, v);
    const s = q.toString();
    return `/admin/activity${s ? `?${s}` : ""}`;
  };

  // Group by day so a long feed reads like a diary rather than a log file.
  const days: { day: string; items: FeedRow[] }[] = [];
  for (const r of rows) {
    const day = dayHeading(r.at);
    if (days.at(-1)?.day !== day) days.push({ day, items: [] });
    days.at(-1)!.items.push(r);
  }

  return (
    <>
      <p className="mt-4 text-footnote text-muted">
        What people did in the app, newest first. Screen views are hidden unless you ask for them.
      </p>

      {/* Chips are links, so a filter is just a URL — shareable, back-button friendly, no JS. */}
      <div className="-mx-4 mt-3 overflow-x-auto px-4">
        <div className="flex gap-1.5 whitespace-nowrap pb-1">
          <Chip href={href({ kind: "" })} active={!kind}>All</Chip>
          {KINDS.map((k) => (
            <Chip key={k.key} href={href({ kind: k.key })} active={kind === k.key}>
              {k.label}
            </Chip>
          ))}
        </div>
      </div>

      <form method="get" className="mt-2 flex flex-wrap items-center gap-2">
        {kind && <input type="hidden" name="kind" value={kind} />}
        <select name="actor" defaultValue={p.actor ?? ""} className="ios-group min-w-0 flex-1 px-3 py-2 text-footnote">
          <option value="">Everyone</option>
          {users.map((u) => (
            <option key={u.user_id} value={u.user_id}>
              {u.name ?? u.email ?? u.user_id.slice(0, 8)}
            </option>
          ))}
        </select>
        <select name="ward" defaultValue={p.ward ?? ""} className="ios-group min-w-0 flex-1 px-3 py-2 text-footnote">
          <option value="">All units</option>
          {wards.map((w) => (
            <option key={w.ward_id} value={w.ward_id}>
              {w.ward_name}
            </option>
          ))}
        </select>
        <label className="flex items-center gap-1.5 text-footnote text-muted">
          <input type="checkbox" name="views" value="1" defaultChecked={p.views === "1"} />
          Include screen views
        </label>
        <button className="rounded-lg bg-accent px-3 py-2 text-footnote font-medium text-accent-ink active:opacity-70">
          Apply
        </button>
        {(p.actor || p.ward || p.views || kind) && (
          <Link href="/admin/activity" className="text-footnote text-accent underline">
            Clear
          </Link>
        )}
      </form>

      {rows.length === 0 ? (
        <Empty>Nothing matches these filters.</Empty>
      ) : (
        days.map((d) => (
          <Section key={d.day} title={`${d.day} · ${d.items.length}`}>
            <div className="ios-group divide-y divide-line/40">
              {d.items.map((r, i) => (
                <div key={i} className="flex items-start gap-2.5 px-4 py-2.5">
                  <span
                    className={`mt-0.5 shrink-0 rounded-full px-1.5 py-0.5 text-caption2 font-medium ${TONE[r.kind] ?? TONE.feature}`}
                  >
                    {KIND_LABEL[r.kind] ?? r.kind}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="text-footnote">{words(r)}</div>
                    <div className="text-caption2 text-muted">
                      {r.actor_id ? (
                        <Link href={href({ actor: r.actor_id })} className="underline decoration-line">
                          {r.actor}
                        </Link>
                      ) : (
                        r.actor
                      )}
                      {r.ward && r.ward_id ? (
                        <>
                          {" · "}
                          <Link href={href({ ward: r.ward_id })} className="underline decoration-line">
                            {r.ward}
                          </Link>
                        </>
                      ) : null}{" "}
                      · {ago(r.at)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Section>
        ))
      )}
      {rows.length >= 200 && (
        <p className="mt-3 px-1 text-caption text-muted">Showing the latest 200. Narrow the filters to see further back.</p>
      )}
    </>
  );
}

function Chip({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className={`rounded-full px-3 py-1 text-footnote ${active ? "bg-accent text-white" : "bg-chip text-foreground/70 active:opacity-60"}`}
    >
      {children}
    </Link>
  );
}
