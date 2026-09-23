-- Burns & plastic surgery — the seam, plus the one clock this department cannot borrow.
--
-- WHAT THIS DOES, IN PLAIN LANGUAGE.
--
-- The tenth department, and the first since medical oncology (0060) that needs more than a new
-- key. Every other department added since has counted days on a clock that already existed:
-- the operation, the chemotherapy cycle, or the admission. A burns unit counts from neither —
-- it counts from the burn, which usually happened before the patient reached the hospital.
--
--   1. wards_specialty_check / create_ward_for_current_user  — allow 'burns_plastic_surgery'.
--   2. patients.burn_date                                    — the date of the injury.
--   3. current_patients.burn_day                             — days since, 1-based.
--
-- WHY A NEW COLUMN HERE, WHEN OPHTHALMOLOGY AND DERMATOLOGY GOT NONE. The test this project
-- applies is whether the app would otherwise have to GUESS. An eye's laterality and a rash's
-- body surface area are said aloud on the round and belong inside the observation; storing
-- them as patient columns would invite a value nobody spoke. The burn date is different: it is
-- a single, unchanging fact about the admission, it is always known, and every count on the
-- ward is read from it. Deriving it from the admission date would be a guess — a patient
-- burned on Tuesday who reaches the ward on Thursday is on post-burn day 3, not day 1, and a
-- note that says otherwise is wrong about the only number this ward navigates by.
--
-- DAY COUNTING, AND WHY burn_day IS 1-BASED LIKE cycle_day AND NOT 0-BASED LIKE post_op_day.
-- A surgeon says POD 0 on the day of the operation. A burns unit speaks of the first 24 hours
-- as the first day: the day of the injury is post-burn day 1. These counts are deliberately
-- different because the wards genuinely speak differently, and the label printed beside the
-- number always says which clock it came from — "PBD 3" is never confusable with "POD 3".
--
-- WHAT IS DELIBERATELY NOT HERE:
--
--   * NO TOTAL BODY SURFACE AREA COLUMN. A percentage is a bedside estimate that is revised as
--     the burn declares itself, and it is the input to fluid calculations this app does not and
--     will not make. It is dictated into the record as spoken, with whose estimate it is. A
--     column would invite a number nobody said and then a calculation nobody reviewed.
--   * NO TIME OF INJURY COLUMN, only the date. The hour matters enormously in the first day and
--     is captured verbatim by the burns history tree's own `time_of_injury` slot, where it
--     carries its source quote. A date column drives a day counter; an hour column would drive
--     arithmetic, and that is the line this app does not cross.
--   * No checklists and no burns-specific discharge templates — clinical content, pending a
--     unit read-through, the hold-back pattern every seam patch since 0063 has applied.
--
-- NOTHING CHANGES FOR AN EXISTING UNIT. Every ward keeps its specialty, the default is still
-- 'general_surgery'. Every patient already in the table gets a null burn_date, and a null
-- burn_date means "count the way you always did".
--
-- Run in Supabase Dashboard -> SQL Editor -> New query -> paste -> Run.
-- Safe to run more than once.
-- Requires: 0060, 0063, 0078, 0081, 0082, 0083, 0084.

begin;

-- ---------------------------------------------------------------------------
-- 1. Allow the new specialty.
-- ---------------------------------------------------------------------------

alter table wards drop constraint if exists wards_specialty_check;
alter table wards add constraint wards_specialty_check
  check (specialty in (
    'general_surgery', 'medical_oncology', 'internal_medicine', 'obstetrics_gynaecology',
    'pulmonary_medicine', 'ent', 'psychiatry', 'ophthalmology', 'dermatology',
    'burns_plastic_surgery'
  ));

-- ---------------------------------------------------------------------------
-- 2. The date of the burn.
-- ---------------------------------------------------------------------------

alter table patients add column if not exists burn_date date;

comment on column patients.burn_date is
  'The date the burn happened — which is often before admission. burn_day counts from here, '
  '1-based (the day of the injury is post-burn day 1). Null for every patient who is not a '
  'burns admission, and null means the app counts the way it always did. The TIME of injury is '
  'deliberately not stored here: it is dictated into the history, where it carries its own '
  'source quote, because a date drives a counter and an hour would drive arithmetic this app '
  'does not do.';

-- ---------------------------------------------------------------------------
-- 3. The view. current_patients selects p.*, frozen at creation, so a new patient column needs
--    it rebuilt before the app can read it (the trap that bit 0010, 0024 and 0060). This is
--    0060's view with burn_day added and nothing else changed.
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
  -- 1-based: the day the cycle starts is day 1, not day 0. See 0060.
  case
    when p.cycle_started_on is not null
      then ((current_timestamp at time zone 'Asia/Kolkata')::date - p.cycle_started_on)::int + 1
    else null
  end as cycle_day,
  -- 1-based, like the cycle and unlike the operation: the day of the burn is post-burn day 1.
  case
    when p.burn_date is not null
      then ((current_timestamp at time zone 'Asia/Kolkata')::date - p.burn_date)::int + 1
    else null
  end as burn_day,
  ((current_timestamp at time zone 'Asia/Kolkata')::date - p.admitted_on)::int as admission_day,
  (select max(e.recorded_at) from entries e where e.patient_id = p.id) as last_entry_at
from patients p;

grant select on current_patients to authenticated;

-- ---------------------------------------------------------------------------
-- 4. Allow the specialty when a unit is created.
--
--    0084's two-argument function with 'burns_plastic_surgery' added to the one guard list and
--    nothing else touched. The one-argument version 0028 shipped is still left alone.
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
  if clean_specialty not in (
    'general_surgery', 'medical_oncology', 'internal_medicine', 'obstetrics_gynaecology',
    'pulmonary_medicine', 'ent', 'psychiatry', 'ophthalmology', 'dermatology',
    'burns_plastic_surgery'
  ) then
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
