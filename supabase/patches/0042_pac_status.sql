-- Pre-anaesthetic checkup as a thing the app actually tracks, rather than a checklist row that
-- only ever says "recorded" or "not recorded".
--
-- A PAC verdict is not a one-off fact: a patient is found unfit, something is optimised, and
-- they are seen again and cleared. So this is stored as an ordinary observation — one row per
-- time it was said, newest wins for "where things stand now", and the earlier ones stay on the
-- record as the history of how the patient got to fit. Same shape as every other value on this
-- app, including the verbatim source_quote that has to be a real span of what was said.
--
-- pac_verdict is the normalised reading of that sentence, and exists only so the screen can
-- colour it and sort it. The words themselves stay in value_text exactly as spoken — the
-- verdict never replaces them. Kind-specific in the same way `urgency` is plans-only.
--
-- A new enum value must be committed before any later statement can use it, hence the split
-- into two transactions in one file — the same shape 0029_patient_trash.sql used for 'trashed'.

begin;
alter type observation_kind add value if not exists 'pac_status';
commit;

begin;

alter table observations add column if not exists pac_verdict text
  check (pac_verdict in ('fit', 'fit_with_conditions', 'unfit', 'pending'));

-- Only a PAC row may carry a verdict. Enforced here rather than trusted, for the same reason
-- the source_quote check exists: the extraction step asking nicely is not a guarantee.
alter table observations drop constraint if exists observations_pac_verdict_kind;
alter table observations
  add constraint observations_pac_verdict_kind
  check (pac_verdict is null or kind = 'pac_status');

create index if not exists observations_pac_idx
  on observations (patient_id, recorded_at desc)
  where kind = 'pac_status';

commit;
