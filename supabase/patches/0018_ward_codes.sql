-- Joining a unit by code, so a whole team works one patient list.
--
-- Sharing was designed for from the start — patients hang off a ward, membership is its own
-- table, and every policy already asks "are you a member of this ward" rather than "did you
-- create this row". What was missing was any way IN: only the owner could add a member, so a
-- new resident had to be added by somebody who was already there and knew their user id.
--
-- A code turns that around. The unit shows its code; each resident enters it once.
--
-- join_ward_by_code is security definer because the whole point is to let somebody who is NOT
-- yet a member write a membership row for themselves — which every policy on the table
-- correctly forbids. It is written to be the narrowest possible exception:
--   * it adds the CALLER and nobody else, so a code cannot be used to add a third party
--   * it always adds them as 'member', never 'owner'
--   * it does nothing at all if the code matches no ward, and cannot be used to discover
--     whether a code exists beyond returning null
--   * on conflict it does nothing, so entering the code twice is harmless
--
-- Codes are eight characters from an alphabet with no O/0 or I/1/l, because these get read
-- aloud across a ward and written on a whiteboard.
--
-- Safe to run more than once.

begin;

alter table wards add column if not exists join_code text;

create or replace function generate_ward_code()
returns text
language sql
volatile
as $$
  select string_agg(
    substr('ABCDEFGHJKMNPQRSTUVWXYZ23456789',
           floor(random() * 31 + 1)::int, 1), '')
  from generate_series(1, 8);
$$;

-- Existing wards, including every account's automatically created one, need a code too.
update wards set join_code = generate_ward_code() where join_code is null;

alter table wards alter column join_code set default generate_ward_code();
alter table wards alter column join_code set not null;

create unique index if not exists wards_join_code_idx on wards (join_code);

-- Which ward the app is currently showing. Held per doctor, because once somebody belongs to
-- two units "the oldest one" stops being a sensible answer — a resident who joins a unit
-- would otherwise keep landing on the empty ward their account was created with.
alter table profiles add column if not exists current_ward_id uuid references wards (id);

create or replace function join_ward_by_code(code text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  target uuid;
begin
  if auth.uid() is null then
    return null;
  end if;

  select id into target from wards
  where join_code = upper(btrim(code)) and archived_at is null;

  if target is null then
    return null;
  end if;

  insert into ward_members (ward_id, user_id, role)
  values (target, auth.uid(), 'member')
  on conflict (ward_id, user_id) do nothing;

  -- Land them on the unit they just joined rather than leaving them to find it.
  update profiles set current_ward_id = target where id = auth.uid();

  return target;
end;
$$;

grant execute on function join_ward_by_code(text) to authenticated;
grant execute on function generate_ward_code() to authenticated;

-- Members can read who else is on the unit. The roster is already readable by members; this
-- lets a name be shown beside it rather than a bare id.
drop policy if exists profiles_ward_read on profiles;

create policy profiles_ward_read on profiles for select
  using (
    id = auth.uid()
    or exists (
      select 1 from ward_members mine
      join ward_members theirs on theirs.ward_id = mine.ward_id
      where mine.user_id = auth.uid() and theirs.user_id = profiles.id
    )
  );

-- Leaving a unit you joined. The owner-only delete policy from the original schema stays for
-- removing OTHER people; this adds removing yourself.
drop policy if exists ward_members_leave on ward_members;

create policy ward_members_leave on ward_members for delete
  using (user_id = auth.uid());

commit;
