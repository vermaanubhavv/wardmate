-- Copying the handover out of WardMate ("Copy for WhatsApp") becomes a unit setting.
--
-- The copied text is the full handover — names, beds, diagnoses — and once it is pasted into
-- WhatsApp it is outside anything WardMate can protect or delete. So whether a unit copies it
-- out is the unit head's decision, switched by the unit owner (the wards update policy already
-- lets nobody else change a ward row).
--
-- Units that already exist keep it on, so a unit mid-pilot does not lose the button overnight;
-- a unit created from now on starts with it off (owner's decision, 2026-11-25). Adding the
-- column with default true fills every existing row with true; the default then moves to false
-- for rows inserted later. Re-running changes nothing: the column is already there, and the
-- default is set to the same value again.
--
-- No view to rebuild: this is a column on wards, not on patients (current_patients selects
-- from patients only).

begin;

alter table wards add column if not exists handover_copy_enabled boolean not null default true;
alter table wards alter column handover_copy_enabled set default false;

commit;
