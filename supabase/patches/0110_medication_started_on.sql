-- When an antibiotic course started, so the treatment chart can print its day ("Day 3").
--
-- The Medications card owns the standing drug list outright and rewrites every `medication`
-- observation each time it is saved (replaceActiveMedications), so a row's own recorded_at is
-- the date of the last save, not of the first dose. started_on is carried across those
-- rewrites by drug name, set to the save date for an antibiotic seen for the first time, and
-- adjusted by the resident on the card (Day − / +) when the course began earlier.
--
-- Null for anything that is not an antibiotic, and for every row written before this patch.
-- Additive; safe to run more than once.

alter table public.observations add column if not exists started_on date;
