-- The to-do list.
--
-- Nothing new is captured here. Spoken plans ("remove drain tomorrow", "repeat haemoglobin")
-- are already stored as observations of kind 'plan', each carrying the sentence it came from.
-- All that was missing was a way to mark one done, so this adds two columns rather than a
-- second, parallel list that could drift out of step with what was actually said.
--
-- Touches only observations, not patients, so current_patients does not need rebuilding.
-- (See 0006 for why that matters.)
--
-- Safe to run more than once.

begin;

alter table observations add column if not exists done_at timestamptz;
alter table observations add column if not exists done_by uuid references auth.users (id);

-- The ward list asks "how many open jobs on this patient" for every card, so the open ones
-- are worth indexing on their own.
create index if not exists observations_open_plans_idx
  on observations (patient_id)
  where kind = 'plan' and done_at is null;

commit;
