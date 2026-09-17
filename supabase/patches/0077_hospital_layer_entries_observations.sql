-- 0076_hospital_layer_entries_observations.sql
-- Extends the 0075 hospital layer to entries/observations, mirroring their
-- exact existing read-access shape (reachable only through a patient in a
-- ward you belong to). Additive only, select-only — same as the 0075
-- patients policy. Nobody's existing ward-scoped access is touched.

begin;

drop policy if exists "hospital admins select entries" on entries;
create policy "hospital admins select entries"
on entries for select using (
  exists (
    select 1 from patients p
    where p.id = entries.patient_id
      and ward_hospital_admin_access(p.ward_id)
  )
);

drop policy if exists "hospital admins select observations" on observations;
create policy "hospital admins select observations"
on observations for select using (
  exists (
    select 1 from patients p
    where p.id = observations.patient_id
      and ward_hospital_admin_access(p.ward_id)
  )
);

commit;
