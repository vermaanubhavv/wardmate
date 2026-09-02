-- Make the public waitlist table actually accept a sign-up.
--
-- The table was created by hand. Two things were wrong by the time the /waitlist page shipped:
--
-- 1. MISSING COLUMNS. An earlier version of the table already existed (email, name,
--    year_of_residency), so re-running `create table if not exists waitlist (...)` with the
--    newer `college` / `department` columns silently did nothing — `if not exists` skips the
--    whole statement. PostgREST then rejected every insert mentioning `college` with
--    "PGRST204: could not find the 'college' column".
--
-- 2. NO TABLE GRANT. A raw `create table` in the SQL editor does not carry Supabase's
--    automatic role grants the way a dashboard-created table does, and RLS is only consulted
--    *after* the table-level privilege check — so inserts failed with
--    "42501: permission denied for table waitlist" before the policy was ever evaluated.
--
-- This block is idempotent. Columns are added nullable: a NOT NULL add would fail against any
-- existing row, and the API route (app/api/waitlist/route.ts) already rejects requests missing
-- email / college / department / year_of_residency before the insert.

alter table public.waitlist add column if not exists name text;
alter table public.waitlist add column if not exists college text;
alter table public.waitlist add column if not exists department text;
alter table public.waitlist add column if not exists year_of_residency text;

alter table public.waitlist enable row level security;

drop policy if exists "Anyone can join the waitlist" on public.waitlist;
create policy "Anyone can join the waitlist"
  on public.waitlist for insert to anon, authenticated
  with check (true);

grant select, insert on public.waitlist to anon, authenticated;

-- Refresh PostgREST's schema cache so the new columns are picked up immediately.
notify pgrst, 'reload schema';
