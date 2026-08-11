-- Two changes.
--
-- 1. Patients get a primary_diagnosis, typed once when the patient is added. The schema
--    originally carried diagnosis only as a spoken observation, which meant a patient had no
--    diagnosis at all until someone recorded a voice note — so the ward list card would be
--    blank on the day of admission, which is exactly when you need it.
--
-- 2. Day numbers are now counted in Indian time, not UTC.
--
--    This was a real bug. Postgres's current_date on Supabase is UTC. India is UTC+5:30, so
--    from midnight until 05:30 IST, UTC is still on the previous calendar day. Ward rounds
--    happen inside that window. A patient operated on the 10th, seen at 07:00 IST on the
--    13th, is post-op day 3 — but a round started at 05:00 IST would have computed UTC's
--    "12th" and displayed day 2. The number would have been silently wrong, on rounds, in
--    the early morning, which is the only time it is ever read.
--
-- Safe to run more than once.

begin;

alter table patients add column if not exists primary_diagnosis text;

-- Dropped rather than replaced. current_patients selects p.*, so adding a column to patients
-- shifts the view's later columns along by one, and "create or replace view" refuses to
-- change the name of an existing column position. A view holds no data of its own, so
-- rebuilding it costs nothing.
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
