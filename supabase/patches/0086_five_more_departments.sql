-- Orthopaedics, urology, neurosurgery, paediatrics and emergency medicine — the seam widening.
--
-- WHAT THIS DOES, IN PLAIN LANGUAGE.
--
-- Departments eleven to fifteen. 0060 added `wards.specialty`; 0063, 0078, 0081, 0082, 0083,
-- 0084 and 0085 added the nine after it. This patch adds five more and nothing else.
--
--   1. wards_specialty_check                     — now also allows the five below.
--   2. create_ward_for_current_user(text, text)   — its in-list guard now also allows them.
--
-- ONE PATCH FOR FIVE DEPARTMENTS, rather than five patches. Every one of these seam patches
-- rewrites the same two lists in full, so five separate files would rewrite them five times and
-- give five chances to drop a name that was already there. The whole list is stated once, below,
-- and it is the complete list of every department WardMate knows.
--
-- THAT IS THE WHOLE PATCH. None of the five needs a new patient column:
--
--   * Orthopaedics, urology and neurosurgery are surgical departments. They count from
--     `current_patients.post_op_day` when there is an operation and from `admission_day`
--     otherwise, both of which exist on every patient today. The fracture side, the stone side
--     and the spine level all belong to an OBSERVATION, not to the patient — a patient can have
--     a stone on each side and an operation on one of them in the same admission, so a
--     per-patient laterality column would force one of those to be dropped or guessed. Guessing
--     a side is the specific harm these packs' extraction guidance exists to prevent. The same
--     reasoning 0083 wrote down for the eye.
--   * Paediatrics and emergency medicine count from `admission_day`, exactly as internal
--     medicine does.
--
-- WHY THERE IS NO WEIGHT COLUMN FOR PAEDIATRICS, although every paediatric order is per
-- kilogram. A weight is a measurement taken on a day, revised as the child is treated — that is
-- an observation with a date and a source quote, which is what WardMate already stores well. A
-- single mutable column would silently become "the weight", and the moment a column holds "the
-- weight" something will be tempted to multiply a dose by it. Nothing in this app may calculate
-- a paediatric dose; see the extraction guidance in lib/specialty/paediatrics.ts, which forbids
-- it in the prompt itself. No column, no temptation.
--
-- WHY EMERGENCY MEDICINE GETS NO ARRIVAL-TIME COLUMN. `admitted_on` already carries when the
-- patient arrived, and hours since arrival are computed from it for the checklist triggers. The
-- time of each event within the stay belongs inside the observation that records it, in the words
-- dictated ("ROSC at 10:46"), not in a column that could only hold one of them.
--
-- NOTHING CHANGES FOR AN EXISTING UNIT. Every ward keeps its specialty, the default is still
-- 'general_surgery', and a ward is only ever one of these five if it was created that way with
-- the picker (SPECIALTY_PACKS=on).
--
-- WHAT IS DELIBERATELY NOT HERE. No checklists and no department-specific discharge templates:
-- each pack borrows (the surgical templates for the three surgical departments, the condition-
-- keyed medicine ones for paediatrics and emergency medicine) and each declares
-- `checklistFamilies: []`, so no department is handed another one's checklist. That is clinical
-- content and it needs a unit's own read-through first — the hold-back pattern every seam patch
-- since 0063 has applied.
--
-- Run in Supabase Dashboard -> SQL Editor -> New query -> paste -> Run.
-- Safe to run more than once.
-- Requires: 0060, 0063, 0078, 0081, 0082, 0083, 0084, 0085.

begin;

-- ---------------------------------------------------------------------------
-- 1. Allow the new specialties on the column.
-- ---------------------------------------------------------------------------

alter table wards drop constraint if exists wards_specialty_check;
alter table wards add constraint wards_specialty_check
  check (specialty in (
    'general_surgery', 'medical_oncology', 'internal_medicine', 'obstetrics_gynaecology',
    'pulmonary_medicine', 'ent', 'psychiatry', 'ophthalmology', 'dermatology',
    'burns_plastic_surgery',
    'orthopaedics', 'urology', 'neurosurgery', 'paediatrics', 'emergency_medicine'
  ));

-- ---------------------------------------------------------------------------
-- 2. Allow them when a unit is created.
--
--    0085's two-argument function with the five added to the one guard list and nothing else
--    touched. The one-argument version 0028 shipped is still left alone, so an un-redeployed
--    client keeps making surgical units.
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
    'burns_plastic_surgery',
    'orthopaedics', 'urology', 'neurosurgery', 'paediatrics', 'emergency_medicine'
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
