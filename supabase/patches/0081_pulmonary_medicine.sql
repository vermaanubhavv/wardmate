-- Pulmonary medicine — the seam widening only.
--
-- WHAT THIS DOES, IN PLAIN LANGUAGE.
--
-- Patch 0060 added `wards.specialty` and taught the app general surgery and medical oncology.
-- 0063 added internal medicine, 0078 added obstetrics & gynaecology. This patch adds a fifth
-- department — pulmonary medicine, the same department a hospital may call chest medicine or
-- respiratory medicine — and nothing else.
--
--   1. wards_specialty_check                    — now also allows 'pulmonary_medicine'.
--   2. create_ward_for_current_user(text, text)  — its in-list guard now also allows it.
--
-- THAT IS THE WHOLE PATCH. A chest unit needs NO new patient columns. Like internal medicine
-- it counts from `current_patients.admission_day`, which already exists on every patient. The
-- things this ward rounds on that a surgical ward does not — the saturation with its delivery
-- device, the blood gas, the drain column and air leak, the anti-tubercular regimen — are all
-- ordinary observations and existing drain fields, captured as dictated. Nothing about them
-- needs a column, and giving them one would only invite a value nobody said. See the header of
-- lib/specialty/pulmonary-medicine.ts.
--
-- NOTHING CHANGES FOR AN EXISTING UNIT. Every ward already in the table keeps its specialty,
-- the default is still 'general_surgery', and a ward is only ever pulmonary_medicine if it was
-- created that way with the picker (SPECIALTY_PACKS=on).
--
-- WHAT IS DELIBERATELY NOT HERE. No checklist protocols and no chest-specific discharge
-- templates: the pack borrows the medicine templates, which already carry pulmonary
-- tuberculosis and community-acquired pneumonia. Both are clinical content that needs the
-- unit's own read-through first — the hold-back pattern 0063 and 0078 both applied.
--
-- Run in Supabase Dashboard -> SQL Editor -> New query -> paste -> Run.
-- Safe to run more than once.
-- Requires: 0060_specialty_packs.sql, 0063_internal_medicine.sql,
--           0078_obstetrics_gynaecology.sql.

begin;

-- ---------------------------------------------------------------------------
-- 1. Allow the new specialty on the column.
-- ---------------------------------------------------------------------------

alter table wards drop constraint if exists wards_specialty_check;
alter table wards add constraint wards_specialty_check
  check (specialty in (
    'general_surgery', 'medical_oncology', 'internal_medicine', 'obstetrics_gynaecology',
    'pulmonary_medicine'
  ));

-- ---------------------------------------------------------------------------
-- 2. Allow it when a unit is created.
--
--    0078's two-argument function with 'pulmonary_medicine' added to the one guard list and
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
    'pulmonary_medicine'
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
