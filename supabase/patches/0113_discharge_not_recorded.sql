-- A positive "nothing to list here" on the discharge summary.
--
-- An empty section prints a blank line, and the checks treat an empty medication list against
-- a record full of drugs as a gap to fix. Both are right until the resident has looked and
-- decided there is nothing to put there — and that decision needs somewhere to live that is
-- not "the list happens to be empty". This column holds the section ids the resident has
-- marked so (lib/discharge-entities.ts DischargeSectionId). The summary prints the mark as
-- words ("No medications on discharge"), never as a blank that could be read as forgotten.
--
-- Safe to run more than once.

begin;

alter table discharge_summaries
  add column if not exists not_recorded jsonb not null default '[]'::jsonb;

commit;
