-- Dermatology — the seam widening only.
--
-- WHAT THIS DOES, IN PLAIN LANGUAGE.
--
-- The ninth department. 0060 added `wards.specialty`; 0063, 0078, 0081, 0082 and 0083 added
-- the six after it. This patch adds 'dermatology' and nothing else.
--
--   1. wards_specialty_check                    — now also allows 'dermatology'.
--   2. create_ward_for_current_user(text, text)  — its in-list guard now also allows it.
--
-- THAT IS THE WHOLE PATCH. A skin unit needs no new patient column: it counts from
-- `current_patients.admission_day`, which exists on every patient today.
--
-- WHY THERE IS NO "BODY SURFACE AREA" COLUMN, although a percentage decides how ill a patient
-- with a peeling rash is. That percentage is a bedside estimate a clinician makes and states;
-- it is not a property the app can hold safely. A column invites a number nobody said, and a
-- number in a column invites a severity grade nobody reviewed. It is recorded as spoken, in
-- the observation, or not at all. See the header of lib/specialty/dermatology.ts.
--
-- NOTHING CHANGES FOR AN EXISTING UNIT. Every ward keeps its specialty, the default is still
-- 'general_surgery', and a ward is only ever dermatology if it was created that way with the
-- picker (SPECIALTY_PACKS=on).
--
-- WHAT IS DELIBERATELY NOT HERE. No checklists and no skin-specific discharge templates: the
-- pack borrows the medicine ones. Clinical content needs the unit's own read-through first —
-- the hold-back pattern every seam patch since 0063 has applied.
--
-- Run in Supabase Dashboard -> SQL Editor -> New query -> paste -> Run.
-- Safe to run more than once.
-- Requires: 0060, 0063, 0078, 0081, 0082, 0083.

begin;

-- ---------------------------------------------------------------------------
-- 1. Allow the new specialty on the column.
-- ---------------------------------------------------------------------------

alter table wards drop constraint if exists wards_specialty_check;
alter table wards add constraint wards_specialty_check
  check (specialty in (
    'general_surgery', 'medical_oncology', 'internal_medicine', 'obstetrics_gynaecology',
    'pulmonary_medicine', 'ent', 'psychiatry', 'ophthalmology', 'dermatology'
  ));

-- ---------------------------------------------------------------------------
-- 2. Allow it when a unit is created.
--
--    0083's two-argument function with 'dermatology' added to the one guard list and
--    nothing else touched. The one-argument version 0028 shipped is still left alone, so an
--    un-redeployed client keeps making surgical units.
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
    'pulmonary_medicine', 'ent', 'psychiatry', 'ophthalmology', 'dermatology'
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
