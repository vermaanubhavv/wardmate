-- A department-neutral base: the `general` specialty.
--
-- Until now general surgery was the app's frame — the column default, and what the unit
-- function fell back to for an unrecognised department. `general` is the pack with no
-- department (lib/specialty/general.ts); every department, general surgery included, is a pack
-- on top of it.
--
-- NOTHING CHANGES FOR AN EXISTING UNIT. Every ward keeps the specialty it has. Only a unit
-- created without a recognised department — the picker switched off, an older client, an
-- unknown value — is now `general` instead of `general_surgery`.
--
--   1. wards_specialty_check   — also allows 'general'.
--   2. wards.specialty default — 'general'.
--   3. create_ward_for_current_user(text, text) — 0086's function with 'general' added to the
--      guard list and as the fallback. Nothing else in it is touched.
--
-- Requires: 0086.

begin;

alter table wards drop constraint if exists wards_specialty_check;
alter table wards add constraint wards_specialty_check
  check (specialty in (
    'general',
    'general_surgery', 'medical_oncology', 'internal_medicine', 'obstetrics_gynaecology',
    'pulmonary_medicine', 'ent', 'psychiatry', 'ophthalmology', 'dermatology',
    'burns_plastic_surgery',
    'orthopaedics', 'urology', 'neurosurgery', 'paediatrics', 'emergency_medicine'
  ));

alter table wards alter column specialty set default 'general';

create or replace function create_ward_for_current_user(unit_name text, unit_specialty text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  new_ward uuid;
  clean_name text := btrim(unit_name);
  clean_specialty text := coalesce(nullif(btrim(lower(unit_specialty)), ''), 'general');
begin
  if auth.uid() is null or not clinician_can_enter() then
    raise exception 'Complete professional verification first.';
  end if;
  if clean_name is null or char_length(clean_name) = 0 then
    raise exception 'Enter a unit name.';
  end if;
  -- Degrade, don't crash: an unrecognised specialty makes a general unit rather than an error.
  if clean_specialty not in (
    'general',
    'general_surgery', 'medical_oncology', 'internal_medicine', 'obstetrics_gynaecology',
    'pulmonary_medicine', 'ent', 'psychiatry', 'ophthalmology', 'dermatology',
    'burns_plastic_surgery',
    'orthopaedics', 'urology', 'neurosurgery', 'paediatrics', 'emergency_medicine'
  ) then
    clean_specialty := 'general';
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
