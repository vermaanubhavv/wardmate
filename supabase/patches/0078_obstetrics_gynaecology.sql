-- Obstetrics & gynaecology — the seam widening only.
--
-- WHAT THIS DOES, IN PLAIN LANGUAGE.
--
-- Patch 0060 added `wards.specialty` and taught the app general surgery and medical oncology.
-- Patch 0063 added internal medicine. This patch adds a fourth department — obstetrics &
-- gynaecology — and nothing else.
--
--   1. wards_specialty_check                         — now also allows 'obstetrics_gynaecology'.
--   2. create_ward_for_current_user(text, text)      — its in-list guard now also allows it.
--
-- THAT IS THE WHOLE PATCH. An O&G unit needs NO new patient columns: like general surgery, an
-- operated or delivered patient is counted from `current_patients.post_op_day`; everyone else
-- from `admission_day`. Both columns already exist on every patient. The current pregnancy's
-- own detail (gravida/para, LMP/EDD/POG) is captured as clerking text under "menstrual and
-- obstetric history" — a section every specialty already has — not as new structured columns;
-- see the header of lib/specialty/obstetrics-gynaecology.ts for why that is deliberate.
--
-- NOTHING CHANGES FOR AN EXISTING UNIT. Every ward already in the table keeps its specialty.
-- The default is still 'general_surgery'. A ward is only ever obstetrics_gynaecology if it was
-- created that way, with the picker (SPECIALTY_PACKS=on).
--
-- WHAT IS DELIBERATELY NOT HERE. No checklist protocols and no condition-specific discharge
-- templates — clinical content that needs the unit's own read-through first, the same hold-back
-- pattern internal medicine's seam patch (0063) applied to its own condition templates. See
-- docs/specialty-packs.md and the header of lib/specialty/obstetrics-gynaecology.ts.
--
-- Run in Supabase Dashboard -> SQL Editor -> New query -> paste -> Run.
-- Safe to run more than once.
-- Requires: 0060_specialty_packs.sql, 0063_internal_medicine.sql.

begin;

-- ---------------------------------------------------------------------------
-- 1. Allow the new specialty on the column.
-- ---------------------------------------------------------------------------

alter table wards drop constraint if exists wards_specialty_check;
alter table wards add constraint wards_specialty_check
  check (specialty in (
    'general_surgery', 'medical_oncology', 'internal_medicine', 'obstetrics_gynaecology'
  ));

-- ---------------------------------------------------------------------------
-- 2. Allow it when a unit is created.
--
--    0063's two-argument function with 'obstetrics_gynaecology' added to the one guard list
--    and nothing else touched. The one-argument version 0028 shipped is still left alone, so
--    an un-redeployed client keeps making surgical units.
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
    'general_surgery', 'medical_oncology', 'internal_medicine', 'obstetrics_gynaecology'
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
