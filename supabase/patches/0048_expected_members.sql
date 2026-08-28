-- The people a unit expects, written before any of them has an account.
--
-- Four units start on the same day and none of the faculty or residents has signed in yet.
-- Nothing here can create their accounts: an account exists only once that person signs in
-- themselves, and this project deliberately holds no service-role key (see CONTEXT.md §3).
-- What CAN be done in advance is write down who each unit expects.
--
-- So the roster is a list of names owned by the ward, and joining becomes two steps: enter the
-- unit code, then tap your own name. Claiming copies the name and designation onto the
-- doctor's own profile, which is what the ward list, the handover and the landing page read.
-- Until somebody claims a name it sits there as "awaiting", which is also how the owner sees
-- at a glance who has not joined yet.
--
-- Why a name is claimed rather than assigned: an account is an email address, and this app is
-- never told which email belongs to which resident. The person tapping their own name is the
-- only reliable link between the two, and it costs them one tap they were going to spend
-- typing their name anyway.
--
-- Safe to run more than once.

begin;

create table if not exists ward_expected_members (
  id uuid primary key default gen_random_uuid(),
  ward_id uuid not null references wards (id) on delete cascade,
  full_name text not null,
  designation text check (designation is null or designation in
    ('Intern', 'JR-1', 'JR-2', 'JR-3', 'SR', 'AP', 'Medical Officer', 'Consultant')),
  claimed_by uuid references auth.users (id) on delete set null,
  claimed_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists ward_expected_members_ward_idx on ward_expected_members (ward_id);

-- One account can stand for only one name on a unit. Partial, so the many unclaimed rows do
-- not collide with each other on a null.
create unique index if not exists ward_expected_members_one_per_person
  on ward_expected_members (ward_id, claimed_by) where claimed_by is not null;

alter table ward_expected_members enable row level security;

-- Everyone on the unit reads the list: the joiner needs it to find their own name, and the
-- rest of the team seeing who is expected is the same information the roster already shows.
drop policy if exists ward_expected_members_read on ward_expected_members;
create policy ward_expected_members_read on ward_expected_members for select
  using (is_ward_member(ward_id));

-- Only the owner writes it. There is deliberately no update policy for members — claiming
-- goes through the function below, so a member cannot edit a name while claiming it.
drop policy if exists ward_expected_members_owner_write on ward_expected_members;
create policy ward_expected_members_owner_write on ward_expected_members for insert
  with check (is_ward_owner(ward_id));

drop policy if exists ward_expected_members_owner_update on ward_expected_members;
create policy ward_expected_members_owner_update on ward_expected_members for update
  using (is_ward_owner(ward_id)) with check (is_ward_owner(ward_id));

drop policy if exists ward_expected_members_owner_delete on ward_expected_members;
create policy ward_expected_members_owner_delete on ward_expected_members for delete
  using (is_ward_owner(ward_id));

grant select, insert, update, delete on ward_expected_members to authenticated;

/*
 * Claim a name off the roster.
 *
 * security definer for one reason only: it writes the caller's own profile and marks one
 * roster row, both as the caller and neither through a policy that would also let a member
 * rewrite somebody else's name. It is written as narrowly as the join function in 0018:
 *   * it claims for the CALLER and nobody else
 *   * it refuses a row on a ward the caller is not a member of
 *   * it refuses a name somebody else has already claimed
 *   * picking a second name releases the first, so a wrong tap is correctable
 *   * it copies the name onto the caller's profile and touches no other profile
 */
create or replace function claim_expected_member(member_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  row_ward uuid;
  row_name text;
  row_designation text;
  row_claimed uuid;
begin
  if auth.uid() is null then
    raise exception 'You must be signed in.';
  end if;

  select ward_id, full_name, designation, claimed_by
    into row_ward, row_name, row_designation, row_claimed
  from ward_expected_members where id = member_id;

  if row_ward is null then
    raise exception 'That name is no longer on the list.';
  end if;

  if not is_ward_member(row_ward) then
    raise exception 'You are not on that unit.';
  end if;

  if row_claimed is not null and row_claimed <> auth.uid() then
    raise exception 'Somebody has already taken that name. Ask the unit owner.';
  end if;

  -- Correcting a wrong tap: release whatever this person claimed on this unit before.
  update ward_expected_members
     set claimed_by = null, claimed_at = null
   where ward_id = row_ward and claimed_by = auth.uid() and id <> member_id;

  update ward_expected_members
     set claimed_by = auth.uid(), claimed_at = now()
   where id = member_id;

  -- The profile is what every screen actually reads. Designation only when the roster gave
  -- one, so a blank on the list never wipes something the doctor set themselves.
  update profiles
     set display_name = row_name,
         designation = coalesce(row_designation, designation)
   where id = auth.uid();
end;
$$;

grant execute on function claim_expected_member(uuid) to authenticated;

commit;
