# Admin console (`/admin`)

One owner's cross-unit audit view: adoption, ward activity, feature usage, friction points, a
raw activity log, and a summary of the client-side event stream. Extends the original
head-count dashboard from patch 0065.

## Turning it on

1. Paste **`supabase/patches/0068_admin_console.sql`** into the Supabase SQL editor and run it.
   Idempotent — safe to run more than once. It adds the `app_events` table and nine
   `SECURITY DEFINER` reporting functions, each gated by `admin_check()`.
2. Make yourself an admin (same as 0065):
   ```sql
   update profiles set is_admin = true
    where id = (select id from auth.users where email = 'you@example.com');
   ```
3. Deploy (`vercel --prod` — the project is not git-connected).

A link to **Admin console** then appears at the bottom of the home screen, for admins only.
`/admin/units` still works and redirects to `/admin/wards`.

## Security

Nothing in the app code gates access — the database does. Every RPC returns an **empty result**
(never an error) unless the caller's `profiles.is_admin` is true, so a non-admin who reaches
`/admin` sees a working page with nothing in it, indistinguishable from "no data yet". Same
"degrade, don't crash" as the rest of the app. There is no service-role key and no role system;
`is_admin` is one boolean set by hand.

## The tabs

| Tab | Source | Shows |
|---|---|---|
| Overview | `admin_overview`, `admin_signups_weekly` | Headline totals, 12-week signup bars, top 5 friction points |
| Users | `admin_users` | Per-user: units, voice/round/discharge counts, last-active; a "never dictated" list |
| Units | `admin_ward_activity` | Per-unit, grouped by department: members, patients, dictation volume 7d/30d, rounds binned, last activity (cold units flagged) |
| Feature usage | `admin_feature_usage`, `admin_stt_breakdown` | Dictation / round / register / discharge / confirmation outcomes; speech engine split |
| Friction | `admin_friction` | Quiet accounts, cold units, solo units, rounds discarded, discharges stuck in draft, unconfirmed dangerous values |
| Activity log | `admin_activity_log` | Unified reverse-chronological feed of the last 200 events |
| Events | `admin_event_summary` | The `app_events` stream, one row per event name |

## Event tracking

`app_events` is an append-only stream written by the app **as the signed-in doctor**. It holds
no clinical values — an event name, the route, an optional ward id, and a small app-controlled
`props` object.

- **`page_view`** — fired for every screen an authenticated user opens, by `<PageView>` in the
  root layout. The normalised screen path is in `props.screen`.
- **Named events** — call `track("name", { label: "…" })` from a client component
  (`lib/track.ts`) or `logEvent("name", …)` from a server action (`lib/analytics.ts`). The one
  wired so far is `round_recording_started` in `app/round-recorder.tsx` — copy that pattern to
  instrument discharge, case history, scoring, etc.

Both paths are fire-and-forget: a failed write is swallowed so a round never breaks to log
itself.
