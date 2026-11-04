-- When a patient's observations last changed, so the scoring engine can tell a page view with
-- nothing new from one that needs its pathways recomputed.
--
-- syncPatientPathways (lib/scoring/store.ts) used to recompute every open pathway on every
-- open of the patient page — six or more queries per pathway, 200 ms typical and 1.3 s seen —
-- including the re-render after each tick. Observations are written from some twenty places
-- in the app, so the marker is kept by the database rather than by each of them: any insert,
-- update or delete of an observation stamps its patient. A delete or a tick counts as a
-- change, which a "newest recorded_at" could not see.
--
-- The trigger runs as the writer (no security definer): anyone allowed to write a patient's
-- observations is a member of that ward, and ward members may update the patient row.
--
-- current_patients is deliberately NOT rebuilt: the engine reads this column from `patients`
-- directly, and nothing on screen shows it.
--
-- Additive; safe to run more than once.

begin;

alter table public.patients add column if not exists observations_changed_at timestamptz;

create or replace function public.touch_patient_observations() returns trigger
language plpgsql as $$
begin
  update public.patients
     set observations_changed_at = now()
   where id = coalesce(new.patient_id, old.patient_id);
  return null;
end;
$$;

drop trigger if exists observations_touch_patient on public.observations;
create trigger observations_touch_patient
  after insert or update or delete on public.observations
  for each row execute function public.touch_patient_observations();

commit;
