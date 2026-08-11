-- Fixes "permission denied for table wards" (and the same error on any other CoreResident
-- table) after running schema.sql.
--
-- Row-level security policies decide WHICH ROWS a signed-in doctor can see. They do nothing
-- on their own — Postgres also needs the more basic grant that says the "authenticated" role
-- (i.e. anyone signed in) may touch the table AT ALL. Supabase's dashboard table editor adds
-- that grant automatically when you create a table by clicking; running schema.sql by hand
-- skipped it. This script adds the missing grants. It is safe to run more than once.
--
-- Run in the Supabase dashboard: SQL Editor -> New query -> paste -> Run.

begin;

grant usage on schema public to authenticated;

grant select, insert, update on public.profiles     to authenticated;
grant select, insert, update on public.wards         to authenticated;
grant select, insert, delete on public.ward_members  to authenticated;
grant select, insert, update on public.patients      to authenticated;
grant select, insert         on public.entries       to authenticated;
grant select, insert, update on public.observations  to authenticated;
grant select                 on public.current_patients to authenticated;

grant execute on function public.is_ward_member(uuid) to authenticated;
grant execute on function public.is_ward_owner(uuid)  to authenticated;

commit;
