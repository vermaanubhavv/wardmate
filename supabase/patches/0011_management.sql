-- What kind of management a patient is under: pre-op, post-op, conservative, or workup.
--
-- Only ONE of the four can be worked out from what the app already holds. A patient with a
-- surgery_date has been operated on, so POST OP is derived and never stored — the same single
-- source of truth that already drives the post-op day count, so the badge and the day number
-- can never contradict each other, and a patient moves from pre-op to post-op automatically
-- on the day their operation is recorded.
--
-- The other three cannot be inferred at all. "Awaiting surgery", "being managed without an
-- operation" and "still being investigated" are decisions the unit makes; nothing in a
-- diagnosis or a date distinguishes them. So they are stored, set by the resident, and simply
-- absent until someone says which applies — the same rule the rest of the app follows.
--
-- That is why 'postop' is not an allowed value here: it would let a stored badge disagree
-- with the surgery date.
--
-- Run in the Supabase dashboard: SQL Editor -> New query -> paste -> Run.
--
-- Safe to run more than once.

begin;

alter table patients add column if not exists management text
  check (management is null or management in ('preop', 'conservative', 'workup'));

-- current_patients selects p.*, frozen at creation, so a new column on patients is invisible
-- until the view is rebuilt. See 0006 — required after every column added to patients.
drop view if exists current_patients;

create view current_patients with (security_invoker = true) as
select
  p.*,
  case
    when p.surgery_date is not null
      then ((current_timestamp at time zone 'Asia/Kolkata')::date - p.surgery_date)::int
    else null
  end as post_op_day,
  ((current_timestamp at time zone 'Asia/Kolkata')::date - p.admitted_on)::int as admission_day,
  (select max(e.recorded_at) from entries e where e.patient_id = p.id) as last_entry_at
from patients p;

grant select on current_patients to authenticated;

commit;
