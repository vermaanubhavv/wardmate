-- Age and sex on the patient.
--
-- These belong on the ward list because "Sharma, 62/M, cholelithiasis" is how a surgical
-- patient is actually identified and handed over — a bare name is not enough to tell two
-- patients apart on a round, and age and sex change how a finding is read.
--
-- Age is stored as a plain number of years, not a date of birth. Two reasons: an admission
-- lasts days, so an age recorded at admission does not go stale within it; and a date of
-- birth is a stronger identifier than this app has any reason to hold. The app stores only
-- what is needed to identify a patient at the bedside — see the schema's note on holding no
-- hospital number, phone or address.
--
-- Both columns are nullable. Patients already on the ward were added before this existed and
-- must keep working without either, and a resident admitting at 3am should not be blocked by
-- a field they do not know yet.
--
-- Run in the Supabase dashboard: SQL Editor -> New query -> paste -> Run.
--
-- Safe to run more than once.

begin;

-- Bounded because a mistyped age is otherwise invisible: '620' would render as "620/M" and
-- look like nothing more than a formatting oddity. 0 is valid — neonates are operated on.
alter table patients add column if not exists age_years int
  check (age_years is null or (age_years >= 0 and age_years <= 120));

-- Free text is deliberately not allowed here. The card shows this letter next to the age, so
-- it has to be exactly one of a known set for that to read consistently.
alter table patients add column if not exists sex text
  check (sex is null or sex in ('M', 'F', 'other'));

-- current_patients selects p.*, which was frozen when the view was created, so new columns on
-- patients do not appear until it is rebuilt. See 0006 — this is the same step, for the same
-- reason, and must accompany any patch that adds a column to patients.
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
