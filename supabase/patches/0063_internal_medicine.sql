-- Internal medicine — the seam widening only.
--
-- WHAT THIS DOES, IN PLAIN LANGUAGE.
--
-- Patch 0060 added `wards.specialty` and taught the app two departments: general surgery and
-- medical oncology. This patch adds a third — internal medicine — and nothing else.
--
--   1. wards_specialty_check                         — now also allows 'internal_medicine'.
--   2. create_ward_for_current_user(text, text)      — its in-list guard now also allows it.
--
-- THAT IS THE WHOLE PATCH. An internal medicine unit needs NO new patient columns: its day
-- counter is the hospital day, which is `current_patients.admission_day` — a column every
-- patient already has. There is no operation date to count from and no chemo cycle.
--
-- NOTHING CHANGES FOR AN EXISTING UNIT. Every ward already in the table keeps its specialty.
-- The default is still 'general_surgery'. A ward is only ever internal medicine if it was
-- created that way, with the picker (SPECIALTY_PACKS=on).
--
-- WHAT IS DELIBERATELY NOT HERE. The medicine discharge templates and the medicine checklists
-- (febrile-illness admission, DKA, hypertensive emergency, …) are clinical content and are
-- NOT seeded until the medicine unit has done its read-through — the same reason
-- MEDICINE_DISCHARGE_TEMPLATES is an empty array in lib/discharge-templates-medicine.ts. They
-- land in a later numbered patch, seeded 'draft', after sign-off. See docs/specialty-packs.md
-- §2a and §5.
--
-- Run in Supabase Dashboard -> SQL Editor -> New query -> paste -> Run.
-- Safe to run more than once.
-- Requires: 0060_specialty_packs.sql.

begin;

-- ---------------------------------------------------------------------------
-- 1. Allow the new specialty on the column.
-- ---------------------------------------------------------------------------

alter table wards drop constraint if exists wards_specialty_check;
alter table wards add constraint wards_specialty_check
  check (specialty in ('general_surgery', 'medical_oncology', 'internal_medicine'));

-- ---------------------------------------------------------------------------
-- 2. Allow it when a unit is created.
--
--    This is 0060's two-argument function with 'internal_medicine' added to the one guard
--    list and nothing else touched. The one-argument version 0028 shipped is still left
--    alone, so an un-redeployed client keeps making surgical units.
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
  if clean_specialty not in ('general_surgery', 'medical_oncology', 'internal_medicine') then
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
