-- The unit's letterhead, for the top of a discharge summary.
--
-- A real discharge summary opens with eight lines that never change: hospital, address,
-- department, unit, the consultants, and which days are OPD and OT. None of it belongs to a
-- patient, none of it can be derived from anything the app records, and typing it once per
-- discharge is exactly the kind of work this app exists to remove.
--
-- Held on the ward for the same reason patients are: a resident rotating out should not take
-- the unit's letterhead with them, and everyone on the unit should get the same one.
--
-- Free text rather than columns for hospital / department / consultants, because every unit
-- lays its heading out differently and a schema that guessed would be wrong for the next one.
-- It is reproduced verbatim, so what the resident types is what prints.
--
-- Safe to run more than once.

begin;

alter table wards add column if not exists letterhead text;

commit;
