-- The operation, in the unit's own words.
--
-- Until now the operation could only be one of the entries in the template library, because
-- the name shown on the card WAS the template's name. That conflated two different things:
-- what an operation is called, and which checklist the app should prompt against. A unit does
-- plenty of operations no starter template covers, and those patients were left with no
-- procedure on the card at all.
--
-- So the name is now stored in its own right. template_family still decides what the app
-- expects to be told; procedure_text decides what the card says. When the typed name matches
-- an operation in the library the two are set together, and the template comes along with it.
-- When it does not, the name is kept and no template applies — which is honest: nobody has
-- told the app what to expect for that operation, and inventing a checklist for it would be
-- the same fabrication the rest of the app refuses.
--
-- current_patients selects p.*, frozen at creation, so a new column on patients is invisible
-- until the view is rebuilt. See 0006.
--
-- Run in the Supabase dashboard: SQL Editor -> New query -> paste -> Run.
--
-- Safe to run more than once.

begin;

alter table patients add column if not exists procedure_text text;

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
