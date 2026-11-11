-- A job can be handed to one member of the unit.
--
-- Jobs are observations of kind 'plan' (0008). Until now a job belonged to the ward as a whole:
-- the handover said what was outstanding, never whose it was, and "I thought you were doing
-- that" is how a drain stays in a day longer. assigned_to names the member; assigned_by /
-- assigned_at say who handed it over and when. Null means anybody's — the state every job
-- lands in, since dictation never assigns.
--
-- Not part of observation_snapshot (0111): who holds a job is not a clinical value and its
-- changes are not part of the record's correction trail.
--
-- Safe to run more than once.

begin;

alter table observations add column if not exists assigned_to uuid references auth.users (id);
alter table observations add column if not exists assigned_by uuid references auth.users (id);
alter table observations add column if not exists assigned_at timestamptz;

-- "My jobs" on the to-do screen.
create index if not exists observations_assigned_open_idx
  on observations (assigned_to)
  where kind = 'plan' and done_at is null and deleted_at is null;

commit;
