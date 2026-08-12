-- How soon a job has to happen: red, yellow, green.
--
-- Set two ways, and the difference matters.
--
-- 1. From the words. If the resident says "remove the drain this evening", the timeframe is
--    in the sentence and the app grades it red. If they say "repeat the haemoglobin" with no
--    timeframe at all, NOTHING is graded — the column stays null and the job is shown as
--    ungraded. Guessing an urgency nobody stated would be the same invention the extraction
--    rules exist to prevent, and here it is the more dangerous direction: a job quietly
--    graded green is a job that looks safe to leave.
--
-- 2. By tapping. The resident cycles the colour by hand, which both grades an ungraded job
--    and overrides a wrong reading. graded_by records that a person set it, so a later
--    re-extraction can never silently undo a human's decision.
--
-- Touches only observations, so current_patients does not need rebuilding (see 0006).
--
-- Run in the Supabase dashboard: SQL Editor -> New query -> paste -> Run.
--
-- Safe to run more than once.

begin;

alter table observations add column if not exists urgency text
  check (urgency is null or urgency in ('red', 'yellow', 'green'));

-- Null until a person taps: the grade the model read, and the grade a doctor stands behind,
-- are not the same claim, and the to-do list says which is which.
alter table observations add column if not exists graded_by uuid references auth.users (id);
alter table observations add column if not exists graded_at timestamptz;

-- The to-do screen asks for every open job across the ward at once, ordered by colour.
create index if not exists observations_open_plans_urgency_idx
  on observations (patient_id, urgency)
  where kind = 'plan' and done_at is null;

commit;
