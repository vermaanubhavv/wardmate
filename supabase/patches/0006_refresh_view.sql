-- Rebuilds current_patients so it includes the template columns added in 0004.
--
-- Why this is needed: a view expands "p.*" ONCE, when it is created, and then holds that
-- fixed column list forever. Adding a column to the patients table afterwards does not
-- appear in the view. Patch 0004 added template_family and template_variant to patients but
-- did not rebuild the view, so the patient screen asked the view for a column it did not
-- have, got nothing back, and showed 404.
--
-- The lesson for later: any patch that adds a column to patients must also re-run this.
--
-- Safe to run more than once.

begin;

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
