-- Who the doctor is, and where each patient physically is.
--
-- Two additions that the landing page needs and nothing before it did.
--
-- WHERE THE PATIENT IS. `bed` has carried the location in its text since the beginning —
-- 'SW-12', 'ICU-3' — and counting ICU patients by reading those strings would mean deciding
-- that 'SW' means ward and 'EMG' means emergency, for every way every unit writes a bed. That
-- is a guess, and a number on a landing page that is quietly wrong is worse than no number.
-- So location is asked for and stored. Existing patients all become 'ward', which is true of
-- most of them and correctable on the patient's own page for the rest — nothing is inferred.
--
-- WHO THE DOCTOR IS. profiles has had display_name since the first schema and it has never
-- been filled in: handle_new_user inserts the id alone. Designation and department join it.
-- All three are the doctor's own to set, under the self-read/self-update policies that are
-- already on that table, so no new policy is needed here.
--
-- Safe to run more than once.

begin;

alter table patients add column if not exists location text
  not null default 'ward'
  check (location in ('ward', 'icu', 'emergency'));

alter table profiles add column if not exists designation text
  check (designation is null or designation in ('JR-1', 'JR-2', 'JR-3', 'SR', 'AP'));
alter table profiles add column if not exists department text;

-- current_patients selects p.*, frozen at creation, so a new column on patients is invisible
-- until the view is rebuilt. See 0006 — required after every column added to patients.
drop view if exists current_patients;

create view current_patients with (security_invoker = true) as
select
  p.*,
  case
    when p.surgery_date is not null
      then ((current_timestamp at time zone 'Asia/Kolkata')::date - p.surgery_date)::int
    else null
  end as post_op_day,
  ((current_timestamp at time zone 'Asia/Kolkata')::date - p.admitted_on)::int as admission_day,
  (select max(e.recorded_at) from entries e where e.patient_id = p.id) as last_entry_at
from patients p;

grant select on current_patients to authenticated;

-- The landing screen in one trip, for the same reason ward_screen() exists: every query costs
-- about the same regardless of what it asks, so the count of trips IS the loading time. This
-- would otherwise be four — profile, ward, and a count per location.
--
-- SECURITY INVOKER, like ward_screen. It runs as the doctor who called it and every table it
-- touches is filtered by exactly the same row policies as before; it grants nothing.
create or replace function home_screen()
returns jsonb
language sql
stable
security invoker
set search_path = public
as $$
  with me as (
    -- Row security restricts profiles to the caller's own row, so no where clause is needed.
    select display_name, designation, department, current_ward_id from profiles limit 1
  ),
  w as (
    select * from wards
    where archived_at is null
    order by (id = (select current_ward_id from me)) desc nulls last, created_at
    limit 1
  ),
  counts as (
    select
      count(*) filter (where location = 'ward')      as ward,
      count(*) filter (where location = 'icu')       as icu,
      count(*) filter (where location = 'emergency') as emergency,
      count(*)                                       as total
    from patients
    where ward_id = (select id from w) and status = 'active'
  )
  select jsonb_build_object(
    'doctor', (
      select jsonb_build_object(
        'display_name', display_name, 'designation', designation, 'department', department
      ) from me
    ),
    'ward', (select jsonb_build_object('id', id, 'name', name) from w),
    'counts', (
      select jsonb_build_object(
        'ward', ward, 'icu', icu, 'emergency', emergency, 'total', total
      ) from counts
    )
  );
$$;

grant execute on function home_screen() to authenticated;

commit;
