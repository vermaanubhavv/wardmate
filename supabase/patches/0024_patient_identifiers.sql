-- Hospital identifiers, entered only where the unit needs them on the patient record.
--
-- This deliberately changes WardMate's earlier minimal-data stance at the unit's request.
-- Both fields are optional because an emergency admission may arrive before the MRD record is
-- created. They are opaque text: different hospitals use different formats and the app must
-- not decide which is valid.
--
-- Run in Supabase Dashboard -> SQL Editor -> New query -> paste -> Run.
-- Safe to run more than once.

begin;

alter table patients add column if not exists uhid_ip_no text;
alter table patients add column if not exists mrd_no text;

-- current_patients selects p.*, frozen at creation, so new patient fields need the view
-- rebuilt before the app can read them.
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
