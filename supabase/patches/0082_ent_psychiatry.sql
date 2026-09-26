-- ENT and psychiatry — the seam widening only.
--
-- WHAT THIS DOES, IN PLAIN LANGUAGE.
--
-- Patch 0060 added `wards.specialty` with general surgery and medical oncology; 0063 added
-- internal medicine, 0078 obstetrics & gynaecology, 0081 pulmonary medicine. This patch adds
-- the sixth and seventh departments — ENT (otorhinolaryngology, head and neck surgery) and
-- psychiatry — and nothing else.
--
--   1. wards_specialty_check                     — now also allows 'ent' and 'psychiatry'.
--   2. create_ward_for_current_user(text, text)   — its in-list guard now also allows both.
--
-- THAT IS THE WHOLE PATCH. Neither department needs a new patient column.
--
--   ENT is a surgical department and counts from `current_patients.post_op_day` when there is
--   an operation and from `admission_day` otherwise — exactly what general surgery already
--   does with columns that already exist. Laterality, audiometry numbers, packs, drains and
--   tracheostomy tube changes are all ordinary observations and existing drain fields.
--
--   PSYCHIATRY counts from `admission_day`, like internal medicine. The mental state
--   examination, the risk statements, the substance history and the Mental Healthcare Act
--   frame are all captured as dictated text. NO COLUMN IS ADDED FOR RISK, deliberately: a
--   structured risk field invites a value nobody said and a score nobody reviewed, and this
--   app's whole guarantee is that a stored value can be quoted from what was spoken. Risk is
--   recorded as words, with who said them, or not at all. See the header of
--   lib/specialty/psychiatry.ts.
--
-- NOTHING CHANGES FOR AN EXISTING UNIT. Every ward keeps its specialty, the default is still
-- 'general_surgery', and a ward is only ever ent or psychiatry if it was created that way with
-- the picker (SPECIALTY_PACKS=on).
--
-- WHAT IS DELIBERATELY NOT HERE. No checklist protocols and no department-specific discharge
-- templates: ENT borrows the surgical ones, psychiatry the medicine ones. Both are clinical
-- content needing the unit's own read-through first — the hold-back pattern 0063, 0078 and
-- 0081 all applied.
--
-- Run in Supabase Dashboard -> SQL Editor -> New query -> paste -> Run.
-- Safe to run more than once.
-- Requires: 0060_specialty_packs.sql, 0063_internal_medicine.sql,
--           0078_obstetrics_gynaecology.sql, 0081_pulmonary_medicine.sql.

begin;

-- ---------------------------------------------------------------------------
-- 1. Allow the new specialties on the column.
-- ---------------------------------------------------------------------------

alter table wards drop constraint if exists wards_specialty_check;
alter table wards add constraint wards_specialty_check
  check (specialty in (
    'general_surgery', 'medical_oncology', 'internal_medicine', 'obstetrics_gynaecology',
    'pulmonary_medicine', 'ent', 'psychiatry'
  ));

-- ---------------------------------------------------------------------------
-- 2. Allow them when a unit is created.
--
--    0081's two-argument function with the two new keys added to the one guard list and
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
    'pulmonary_medicine', 'ent', 'psychiatry'
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
