-- The consultant in charge of a unit.
--
-- Needed on every discharge summary ("Consultant: …"). It is a standing fact about the unit,
-- not something re-typed per patient, so it lives on the ward and the unit owner sets it once
-- on the Unit page. lib/unit-consultants.ts holds the same defaults as a runtime fallback for
-- a ward whose name says which unit it is but which has no value stored yet.
--
-- wards is already granted to authenticated (0001) and its UPDATE policy is owner-only, so no
-- new grant or policy is needed.
--
-- Safe to run more than once.

alter table wards add column if not exists consultant_in_charge text;

-- Seed the four surgical units by the unit number in their name — Arabic ("Unit 3") or Roman
-- ("UNIT-III"). Only fills a ward that has no value yet, so re-running it never overwrites an
-- edit. A unit whose name matches nothing is left null and gets set from the Unit page.
update wards set consultant_in_charge = 'Dr. Neeraj'
  where consultant_in_charge is null
    and (name ~* '(^|[^a-z0-9])unit[ ._-]*1([^0-9]|$)' or name ~* '(^|[^a-z0-9])unit[ ._-]*i([^a-z]|$)');

update wards set consultant_in_charge = 'Dr. Vikas'
  where consultant_in_charge is null
    and (name ~* '(^|[^a-z0-9])unit[ ._-]*2([^0-9]|$)' or name ~* '(^|[^a-z0-9])unit[ ._-]*ii([^a-z]|$)');

update wards set consultant_in_charge = 'Dr. Shaji Thomas'
  where consultant_in_charge is null
    and (name ~* '(^|[^a-z0-9])unit[ ._-]*3([^0-9]|$)' or name ~* '(^|[^a-z0-9])unit[ ._-]*iii([^a-z]|$)');

update wards set consultant_in_charge = 'Dr. Vivek'
  where consultant_in_charge is null
    and (name ~* '(^|[^a-z0-9])unit[ ._-]*4([^0-9]|$)' or name ~* '(^|[^a-z0-9])unit[ ._-]*iv([^a-z]|$)');
