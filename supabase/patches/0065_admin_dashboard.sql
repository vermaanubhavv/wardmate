-- Admin dashboard — one owner's cross-unit view: department -> unit -> patient/doctor counts.
--
-- WHY THIS NEEDS A NEW, NARROW EXCEPTION. CONTEXT.md §4 is explicit: RLS is the real boundary,
-- and every screen in the app reads as the calling doctor (SECURITY INVOKER) so it only ever
-- sees the wards it is a member of. An admin overview is the one place that is deliberately not
-- true — it must count patients and doctors across EVERY ward. That cannot be done as the
-- calling user under RLS, so this adds a SECURITY DEFINER function, the same considered
-- exception flag_glossary_term() already is: a fixed body, and the ward-membership boundary
-- replaced with an explicit admin check inside the function, not removed.
--
-- WHAT THIS DOES NOT DO. It does not add a role system. `profiles.is_admin` is a single boolean
-- an existing admin sets by hand in the SQL editor for a specific person — there is no signup
-- path to it and no UI toggle. Nobody is an admin until this column says so.
--
-- "Department" IS NOT A NEW TABLE. As settled in docs/specialty-packs.md: a department is just
-- every ward sharing a `specialty` value. This patch adds no department table, because there is
-- nothing to store — the grouping is computed, in the function below and again in the page.
--
-- WHAT COUNTS AS A PATIENT / A DOCTOR, for this table. "Patients" = currently ACTIVE patients
-- on that ward (patients.status = 'active') — a unit's real caseload, not its all-time total,
-- which would only grow. "Doctors" = rows in ward_members for that ward, i.e. everyone who has
-- joined it, regardless of role.
--
-- Requires: 0023_home_screen.sql (profiles table). Safe to run more than once.

begin;

alter table profiles add column if not exists is_admin boolean not null default false;

create or replace function admin_ward_summary()
returns table (
  ward_id uuid,
  ward_name text,
  join_code text,
  specialty text,
  active_patients bigint,
  doctors bigint
)
language plpgsql
security definer
set search_path = public
as $$
begin
  -- The whole boundary this function replaces, re-drawn as an explicit check. Not an admin ->
  -- empty table, never an error, so a non-admin poking this RPC learns nothing (DOCX-style
  -- "degrade, don't crash" — see CONTEXT.md §5 for the same idea applied to a missing patch).
  if not exists (select 1 from profiles where id = auth.uid() and is_admin) then
    return;
  end if;

  return query
  select
    w.id,
    w.name,
    w.join_code,
    w.specialty,
    (select count(*) from patients p where p.ward_id = w.id and p.status = 'active'),
    (select count(*) from ward_members m where m.ward_id = w.id)
  from wards w
  where w.archived_at is null
  order by w.specialty, w.name;
end;
$$;

-- Every authenticated user may CALL this function, but only an admin's own row check inside it
-- lets any data out. That is deliberate: granting execute is not granting the data.
grant execute on function admin_ward_summary() to authenticated;

commit;

-- To make yourself the admin, run this separately with the email you sign in to WardMate with:
--
--   update profiles set is_admin = true
--    where id = (select id from auth.users where email = 'you@example.com');
