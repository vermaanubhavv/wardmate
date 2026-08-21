-- Professional access gate for WardMate.
--
-- Authentication confirms an email address, not clinical eligibility. This separate table is
-- deliberately not writable through ordinary row-level policies: it can only be populated by
-- the narrowly scoped function below. Unit creation and joining then require that attestation.
-- A registration number is recorded in a normalised form for a later registry/hospital review;
-- no global registry is assumed to exist or to be reliable for every intern.

begin;

-- 0023 originally restricted this list to the resident ladder. Interns and appropriately
-- designated doctors must also be eligible for the entry gate.
alter table profiles drop constraint if exists profiles_designation_check;
alter table profiles add constraint profiles_designation_check
  check (designation is null or designation in ('Intern', 'JR-1', 'JR-2', 'JR-3', 'SR', 'AP', 'Medical Officer', 'Consultant'));

create table if not exists clinician_access (
  user_id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null,
  registration_number text not null,
  hospital_name text not null,
  department text not null,
  designation text not null check (designation in ('Intern', 'JR-1', 'JR-2', 'JR-3', 'SR', 'AP', 'Medical Officer', 'Consultant')),
  verification_status text not null default 'self_attested'
    check (verification_status in ('self_attested', 'verified', 'rejected', 'legacy')),
  attested_at timestamptz not null default now(),
  verified_at timestamptz,
  verified_by uuid references auth.users (id)
);

alter table clinician_access enable row level security;

drop policy if exists clinician_access_self_read on clinician_access;
create policy clinician_access_self_read on clinician_access for select using (user_id = auth.uid());

-- Current signed-in clinicians retain access. New accounts must complete the screen below.
insert into clinician_access (user_id, full_name, registration_number, hospital_name, department, designation, verification_status)
select p.id, coalesce(nullif(p.display_name, ''), 'Existing clinician'), 'LEGACY', 'Existing hospital',
       coalesce(nullif(p.department, ''), 'Not recorded'), coalesce(nullif(p.designation, ''), 'JR-1'), 'legacy'
from profiles p
where exists (select 1 from ward_members wm where wm.user_id = p.id)
on conflict (user_id) do nothing;

create or replace function complete_clinician_onboarding(
  clinician_name text,
  clinician_registration_number text,
  clinician_hospital_name text,
  clinician_department text,
  clinician_designation text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  clean_name text := btrim(clinician_name);
  clean_registration text := upper(regexp_replace(btrim(clinician_registration_number), '[^A-Za-z0-9/-]', '', 'g'));
  clean_hospital text := btrim(clinician_hospital_name);
  clean_department text := btrim(clinician_department);
  allowed_designations text[] := array['Intern', 'JR-1', 'JR-2', 'JR-3', 'SR', 'AP', 'Medical Officer', 'Consultant'];
begin
  if auth.uid() is null then raise exception 'You must be signed in.'; end if;
  if clean_name is null or char_length(clean_name) < 2 then raise exception 'Enter your full name.'; end if;
  if clean_hospital is null or char_length(clean_hospital) < 2 then raise exception 'Enter your hospital name.'; end if;
  if clean_department is null or char_length(clean_department) < 2 then raise exception 'Enter your department.'; end if;
  -- Numbers vary by council and interns may have an institutional registration; reject only
  -- implausible values while retaining the unambiguous normalised number for later verification.
  if clean_registration is null or char_length(clean_registration) < 4 or char_length(clean_registration) > 40 then
    raise exception 'Enter a valid registration or intern ID.';
  end if;
  if clinician_designation <> all(allowed_designations) then raise exception 'Choose a clinical designation.'; end if;

  insert into clinician_access (user_id, full_name, registration_number, hospital_name, department, designation)
  values (auth.uid(), left(clean_name, 120), clean_registration, left(clean_hospital, 160), left(clean_department, 120), clinician_designation)
  on conflict (user_id) do update set
    full_name = excluded.full_name, registration_number = excluded.registration_number,
    hospital_name = excluded.hospital_name, department = excluded.department,
    designation = excluded.designation, attested_at = now();

  update profiles set display_name = left(clean_name, 120), department = left(clean_department, 120), designation = clinician_designation
  where id = auth.uid();
end;
$$;

create or replace function clinician_can_enter()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from clinician_access
    where user_id = auth.uid() and verification_status in ('self_attested', 'verified', 'legacy')
  );
$$;

-- Require an approved professional attestation before either route to a unit is possible.
create or replace function join_ward_by_code(code text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare target uuid;
begin
  if auth.uid() is null or not clinician_can_enter() then return null; end if;
  select id into target from wards where join_code = upper(btrim(code)) and archived_at is null;
  if target is null then return null; end if;
  insert into ward_members (ward_id, user_id, role) values (target, auth.uid(), 'member') on conflict (ward_id, user_id) do nothing;
  update profiles set current_ward_id = target where id = auth.uid();
  return target;
end;
$$;

create or replace function create_ward_for_current_user(unit_name text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare new_ward uuid; clean_name text := btrim(unit_name);
begin
  if auth.uid() is null or not clinician_can_enter() then raise exception 'Complete professional verification first.'; end if;
  if clean_name is null or char_length(clean_name) = 0 then raise exception 'Enter a unit name.'; end if;
  insert into wards (name, owner_id) values (left(clean_name, 60), auth.uid()) returning id into new_ward;
  insert into ward_members (ward_id, user_id, role) values (new_ward, auth.uid(), 'owner');
  update profiles set current_ward_id = new_ward where id = auth.uid();
  return new_ward;
end;
$$;

grant execute on function complete_clinician_onboarding(text, text, text, text, text) to authenticated;
grant execute on function clinician_can_enter() to authenticated;
grant execute on function join_ward_by_code(text) to authenticated;
grant execute on function create_ward_for_current_user(text) to authenticated;

commit;
