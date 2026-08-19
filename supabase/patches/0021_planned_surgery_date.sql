-- The planned date of an upcoming operation, for a patient still pre-op.
--
-- Deliberately a second column rather than writing into surgery_date early: surgery_date is
-- what drives the post-op day count (see current_patients below) and the POST OP label — a
-- pre-op patient given a future surgery_date would show a negative POD and flip to "post-op"
-- before anything had actually happened to them. planned_surgery_date carries no such meaning;
-- it is informational only, shown so a pre-op patient's listed date is visible on the same
-- screen that later records the real one.
--
-- Run in the Supabase dashboard: SQL Editor -> New query -> paste -> Run.
--
-- Safe to run more than once.

begin;

alter table patients add column if not exists planned_surgery_date date;

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
