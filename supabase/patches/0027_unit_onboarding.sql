-- First-time unit choice.
--
-- New clinicians should decide whether to join a team or start one. Older versions created a
-- private "My unit" as part of the auth trigger, which made joining a real team leave behind an
-- unnecessary empty unit. This patch only changes future sign-ups; existing units are retained.
-- Safe to run once after 0018_ward_codes.sql.

begin;

create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into profiles (id) values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$;

-- Accounts created before this choice existed already have a unit membership but may not have
-- a selected unit. Keep them where they were instead of presenting onboarding retrospectively.
update profiles p
set current_ward_id = (
  select wm.ward_id
  from ward_members wm
  join wards w on w.id = wm.ward_id
  where wm.user_id = p.id and w.archived_at is null
  order by wm.added_at
  limit 1
)
where p.current_ward_id is null
  and exists (
    select 1
    from ward_members wm
    join wards w on w.id = wm.ward_id
    where wm.user_id = p.id and w.archived_at is null
  );

create or replace function create_ward_for_current_user(unit_name text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  new_ward uuid;
  clean_name text := btrim(unit_name);
begin
  if auth.uid() is null then
    raise exception 'You must be signed in.';
  end if;

  if clean_name is null or char_length(clean_name) = 0 then
    raise exception 'Enter a unit name.';
  end if;

  insert into wards (name, owner_id)
  values (left(clean_name, 60), auth.uid())
  returning id into new_ward;

  insert into ward_members (ward_id, user_id, role)
  values (new_ward, auth.uid(), 'owner');

  update profiles set current_ward_id = new_ward where id = auth.uid();
  return new_ward;
end;
$$;

grant execute on function create_ward_for_current_user(text) to authenticated;

commit;
