-- Specialty packs — the seam, plus everything a medical oncology unit needs.
--
-- WHAT THIS DOES, IN PLAIN LANGUAGE.
--
-- WardMate was built for one general-surgery unit and the code assumes it everywhere: the day
-- counter is "post-op day", the dictation prompt says "a surgical resident", the discharge
-- templates are keyed to operations. This patch adds the ONE fact the app needs to stop
-- assuming that — which department a unit belongs to — plus the three patient fields a
-- medical oncology round actually counts by.
--
-- 1. wards.specialty     — 'general_surgery' (everyone today) or 'medical_oncology'.
-- 2. patients.regimen / cycle_number / cycle_started_on
--                        — the chemotherapy cycle a patient is on. Null for every surgical
--                          patient and for an oncology patient not currently on a cycle.
-- 3. current_patients    — gains cycle_day beside post_op_day and admission_day.
-- 4. ward_screen() / home_screen()  — return the unit's specialty so the app can pick the pack
--                          in the same round trip it already makes.
-- 5. create_ward_for_current_user(text, text)
--                        — a second, OPTIONAL argument for the specialty. The old one-argument
--                          version is left in place untouched, so an older client that has not
--                          been redeployed keeps working and keeps creating surgical units.
--
-- NOTHING CHANGES FOR AN EXISTING UNIT. Every ward already in the table gets
-- 'general_surgery', which is exactly what the app has always done. Every patient already in
-- the table gets null chemo fields, and null chemo fields mean "count the way you always did".
--
-- DAY COUNTING, AND WHY cycle_day STARTS AT 1 WHERE post_op_day STARTS AT 0.
-- A surgeon says POD 0 on the day of the operation. An oncologist says Day 1 on the day the
-- cycle starts — "C2D1" is the day the drugs go up, not the day after. These two counts are
-- deliberately different because the two wards genuinely speak differently, and the label
-- printed beside the number always says which is which.
--
-- Run in Supabase Dashboard -> SQL Editor -> New query -> paste -> Run.
-- Safe to run more than once.
-- Requires: 0054_pin_screen_profile_reads.sql (the ward_screen / home_screen bodies below are
-- 0054's, with the specialty field added and nothing else changed).

begin;

-- ---------------------------------------------------------------------------
-- 1. The unit's department.
-- ---------------------------------------------------------------------------

alter table wards
  add column if not exists specialty text not null default 'general_surgery';

alter table wards drop constraint if exists wards_specialty_check;
alter table wards add constraint wards_specialty_check
  check (specialty in ('general_surgery', 'medical_oncology'));

comment on column wards.specialty is
  'Which department this unit is. Set when the unit is created and it defines the unit: a '
  'unit''s join code makes residents of that department. Read by lib/specialty/ to choose the '
  'day counter, the dictation prompt, the checklist triggers and the discharge templates. '
  'Anything unrecognised falls back to general_surgery in code.';

-- ---------------------------------------------------------------------------
-- 2. The chemotherapy cycle a patient is on.
-- ---------------------------------------------------------------------------

alter table patients add column if not exists regimen text;
alter table patients add column if not exists cycle_number int;
alter table patients add column if not exists cycle_started_on date;

alter table patients drop constraint if exists patients_cycle_number_check;
alter table patients add constraint patients_cycle_number_check
  check (cycle_number is null or (cycle_number >= 1 and cycle_number <= 60));

comment on column patients.regimen is
  'The chemotherapy regimen as the unit names it — "ABVD", "FOLFOX", "R-CHOP". Free text on '
  'purpose: every unit writes these differently and the app must not decide which spelling is '
  'valid. Null for a patient not on a named regimen.';
comment on column patients.cycle_number is
  'Which cycle of that regimen the patient is on. 1-based, the way it is spoken.';
comment on column patients.cycle_started_on is
  'The date this cycle started (day 1). cycle_day counts from here. Null means the patient is '
  'not on an active cycle and the app counts hospital days for them instead.';

-- ---------------------------------------------------------------------------
-- 3. The view. current_patients selects p.*, frozen at creation, so new patient columns need
--    it rebuilt before the app can read them (the trap that bit 0010 and 0024).
-- ---------------------------------------------------------------------------

drop view if exists current_patients;

create view current_patients with (security_invoker = true) as
select
  p.*,
  case
    when p.surgery_date is not null
      then ((current_timestamp at time zone 'Asia/Kolkata')::date - p.surgery_date)::int
    else null
  end as post_op_day,
  -- 1-based: the day the cycle starts is day 1, not day 0. See the note at the top.
  case
    when p.cycle_started_on is not null
      then ((current_timestamp at time zone 'Asia/Kolkata')::date - p.cycle_started_on)::int + 1
    else null
  end as cycle_day,
  ((current_timestamp at time zone 'Asia/Kolkata')::date - p.admitted_on)::int as admission_day,
  (select max(e.recorded_at) from entries e where e.patient_id = p.id) as last_entry_at
from patients p;

grant select on current_patients to authenticated;

-- ---------------------------------------------------------------------------
-- 4. ward_screen() and home_screen() — 0054's bodies with 'specialty' added to the ward object.
--    The patients array is built with to_jsonb(p) over current_patients, so cycle_day arrives
--    there without any change here.
-- ---------------------------------------------------------------------------

create or replace function ward_screen()
returns jsonb
language sql
stable
security invoker
set search_path = public
as $$
  with me as (
    select current_ward_id from profiles where id = auth.uid() limit 1
  ),
  w as (
    select * from wards
    where archived_at is null
    order by (id = (select current_ward_id from me)) desc nulls last, created_at
    limit 1
  ),
  p as (
    select * from current_patients
    where ward_id = (select id from w) and status = 'active'
  ),
  obs as (
    select
      patient_id,
      count(*) filter (where needs_confirmation and confirmed_at is null) as unconfirmed,
      count(*) filter (where kind = 'plan' and done_at is null) as open_tasks
    from observations
    where patient_id in (select id from p)
    group by patient_id
  ),
  ent as (
    select patient_id, count(*) as entries
    from entries
    where patient_id in (select id from p)
    group by patient_id
  ),
  vit as (
    select o.patient_id, jsonb_agg(jsonb_build_object(
      'label', o.label, 'value_text', o.value_text, 'recorded_at', o.recorded_at
    )) as vitals
    from observations o
    where o.patient_id in (select id from p)
      and o.kind = 'vital'
      and o.recorded_at = (
        select max(o2.recorded_at) from observations o2
        where o2.patient_id = o.patient_id and o2.kind = 'vital'
      )
    group by o.patient_id
  ),
  latest_lab as (
    select distinct on (patient_id, lower(label))
      patient_id, label, value_text, ref_low, ref_high, ref_text, recorded_at
    from observations
    where patient_id in (select id from p) and kind = 'lab'
    order by patient_id, lower(label), recorded_at desc
  ),
  lab as (
    select patient_id, jsonb_agg(jsonb_build_object(
      'label', label, 'value_text', value_text,
      'ref_low', ref_low, 'ref_high', ref_high, 'ref_text', ref_text,
      'recorded_at', recorded_at
    )) as labs
    from latest_lab
    group by patient_id
  )
  select jsonb_build_object(
    'ward', (
      select jsonb_build_object(
        'id', id, 'name', name, 'owner_id', owner_id,
        'join_code', join_code, 'letterhead', letterhead,
        'specialty', specialty
      ) from w
    ),
    'patients', coalesce((
      select jsonb_agg(
        to_jsonb(p) || jsonb_build_object(
          'unconfirmed_count', coalesce(obs.unconfirmed, 0),
          'open_task_count',   coalesce(obs.open_tasks, 0),
          'entry_count',       coalesce(ent.entries, 0),
          'vitals',            coalesce(vit.vitals, '[]'::jsonb),
          'labs',              coalesce(lab.labs, '[]'::jsonb)
        )
      )
      from p
      left join obs on obs.patient_id = p.id
      left join ent on ent.patient_id = p.id
      left join vit on vit.patient_id = p.id
      left join lab on lab.patient_id = p.id
    ), '[]'::jsonb),
    'removed_count', (
      select count(*) from patients
      where ward_id = (select id from w) and status = 'discharged'
    ),
    -- Every checklist row, WITH its phase, rather than only the after-surgery ones. Which
    -- phase a unit's picker offers is now the specialty's call (pack.pickerPhase) and the
    -- filtering happens in lib/ward-screen.ts. A surgical unit still sees exactly the same
    -- list it always did.
    'procedures', coalesce((
      select jsonb_agg(jsonb_build_object(
        'family', family, 'variant', variant, 'name', name, 'phase', phase
      ))
      from care_templates
    ), '[]'::jsonb)
  );
$$;

grant execute on function ward_screen() to authenticated;

create or replace function home_screen()
returns jsonb
language sql
stable
security invoker
set search_path = public
as $$
  with me as (
    select display_name, designation, department, current_ward_id
    from profiles where id = auth.uid() limit 1
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
    'ward', (select jsonb_build_object('id', id, 'name', name, 'specialty', specialty) from w),
    'counts', (
      select jsonb_build_object(
        'ward', ward, 'icu', icu, 'emergency', emergency, 'total', total
      ) from counts
    )
  );
$$;

grant execute on function home_screen() to authenticated;

-- ---------------------------------------------------------------------------
-- 5. Creating a unit with a specialty.
--
--    A NEW OVERLOAD, not a replacement. The existing one-argument function stays exactly as
--    0028 left it, so a browser still running yesterday's JavaScript keeps creating units
--    (surgical ones) instead of erroring. The app calls the two-argument version.
-- ---------------------------------------------------------------------------

create or replace function create_ward_for_current_user(unit_name text, unit_specialty text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  new_ward uuid;
  clean_name text := btrim(unit_name);
  clean_specialty text := coalesce(nullif(btrim(lower(unit_specialty)), ''), 'general_surgery');
begin
  if auth.uid() is null or not clinician_can_enter() then
    raise exception 'Complete professional verification first.';
  end if;
  if clean_name is null or char_length(clean_name) = 0 then
    raise exception 'Enter a unit name.';
  end if;
  -- Degrade, don't crash: an unrecognised specialty makes a surgical unit rather than an error.
  if clean_specialty not in ('general_surgery', 'medical_oncology') then
    clean_specialty := 'general_surgery';
  end if;

  insert into wards (name, owner_id, specialty)
  values (left(clean_name, 60), auth.uid(), clean_specialty)
  returning id into new_ward;

  insert into ward_members (ward_id, user_id, role)
  values (new_ward, auth.uid(), 'owner');

  update profiles set current_ward_id = new_ward where id = auth.uid();
  return new_ward;
end;
$$;

grant execute on function create_ward_for_current_user(text, text) to authenticated;

commit;
