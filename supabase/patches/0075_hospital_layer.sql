-- 0075_hospital_layer.sql
-- Adds a hospital layer ON TOP OF existing ward-level RLS. Additive only:
-- every existing ward_member/ward_owner access path is untouched. This
-- only ever *widens* access, and only for users explicitly added to
-- hospital_members with role = 'admin' — nobody gets new access by default.
--
-- Idempotent + self-transaction-wrapped per repo convention.

begin;

-- ---------------------------------------------------------------------
-- 1. Core tables
-- ---------------------------------------------------------------------

create table if not exists hospitals (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  owner_id    uuid not null references auth.users (id),
  created_at  timestamptz not null default now(),
  archived_at timestamptz
);

do $$ begin
  create type hospital_role as enum ('admin', 'member');
exception when duplicate_object then null;
end $$;

create table if not exists hospital_members (
  hospital_id uuid not null references hospitals (id) on delete cascade,
  user_id     uuid not null references auth.users (id) on delete cascade,
  role        hospital_role not null default 'member',
  added_at    timestamptz not null default now(),
  primary key (hospital_id, user_id)
);

-- Link wards to a hospital. Nullable: existing wards are unassigned by
-- default and stay exactly as accessible as they are today (ward-only
-- scoping) until someone explicitly assigns hospital_id.
alter table wards
  add column if not exists hospital_id uuid references hospitals (id);

-- ---------------------------------------------------------------------
-- 2. Helpers — mirror is_ward_member/is_ward_owner exactly.
-- ---------------------------------------------------------------------

create or replace function is_hospital_member(target_hospital uuid)
returns boolean language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from hospital_members m
    where m.hospital_id = target_hospital and m.user_id = auth.uid()
  );
$$;

create or replace function is_hospital_admin(target_hospital uuid)
returns boolean language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from hospital_members m
    where m.hospital_id = target_hospital
      and m.user_id = auth.uid()
      and m.role = 'admin'
  );
$$;

-- Bridges hospital-admin access down to a specific ward: true only if the
-- ward is assigned to a hospital AND the caller is an admin of that
-- hospital. A ward with hospital_id null is invisible to this path.
create or replace function ward_hospital_admin_access(target_ward uuid)
returns boolean language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from wards w
    where w.id = target_ward
      and w.hospital_id is not null
      and is_hospital_admin(w.hospital_id)
  );
$$;

-- ---------------------------------------------------------------------
-- 3. RLS on the new tables (deny-by-default, same house style).
-- ---------------------------------------------------------------------

alter table hospitals enable row level security;
alter table hospital_members enable row level security;

drop policy if exists "hospital members select hospitals" on hospitals;
create policy "hospital members select hospitals"
on hospitals for select
using (is_hospital_member(id));

drop policy if exists "hospital admins update hospitals" on hospitals;
create policy "hospital admins update hospitals"
on hospitals for update
using (is_hospital_admin(id))
with check (is_hospital_admin(id));

drop policy if exists "hospital members select membership" on hospital_members;
create policy "hospital members select membership"
on hospital_members for select
using (is_hospital_member(hospital_id));

drop policy if exists "hospital admins manage membership" on hospital_members;
create policy "hospital admins manage membership"
on hospital_members for all
using (is_hospital_admin(hospital_id))
with check (is_hospital_admin(hospital_id));

-- ---------------------------------------------------------------------
-- 4. Additive policy on `wards`: hospital admins can see wards under
--    their hospital, on top of (not replacing) is_ward_member/owner.
--    Multiple permissive policies on the same command OR together, so
--    this only adds visibility, never removes it.
-- ---------------------------------------------------------------------

drop policy if exists "hospital admins select wards" on wards;
create policy "hospital admins select wards"
on wards for select
using (hospital_id is not null and is_hospital_admin(hospital_id));

-- ---------------------------------------------------------------------
-- 5. Additive policy on `patients`: same OR-widening, gated through the
--    ward -> hospital chain via ward_hospital_admin_access().
--    NOTE: mirror this same pattern for `entries` and `observations` —
--    NOT included here because their exact existing RLS policies
--    (predicate names/shapes) weren't available when this patch was
--    drafted. Confirm those before extending; copying this policy's
--    `using` clause onto the wrong join column would be a silent
--    over-grant, not a syntax error.
-- ---------------------------------------------------------------------

drop policy if exists "hospital admins select patients" on patients;
create policy "hospital admins select patients"
on patients for select
using (ward_hospital_admin_access(ward_id));

commit;
