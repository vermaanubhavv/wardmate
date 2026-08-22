-- Lets the app recognise "pt for X", "posted for X", "planned for X" — the phrase a case
-- history or round note uses to say what operation is intended — as its own kind, rather than
-- it landing as an undifferentiated 'note' or being missed entirely. See lib/extract.ts for the
-- new prompt rule and app/patients/[id]/entry-card.tsx for it being shown alongside diagnosis
-- at the top of a card, the same prominence.
--
-- This only makes the words visible and structured. It does NOT set the patient's
-- template_family/procedure_text — that stays a deliberate, manual choice at "Add patient",
-- exactly as before. Wiring one to the other automatically is a separate decision, not a side
-- effect of this patch.
--
-- A new enum value must be committed before any statement can use it — hence the split into two
-- transactions in one file, the same shape 0029_patient_trash.sql used for 'trashed'.

begin;
alter type observation_kind add value if not exists 'planned_procedure';
commit;

begin;
select 1; -- no-op transaction; the enum value above is now visible to the app.
commit;
