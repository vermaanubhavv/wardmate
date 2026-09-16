-- Who looked at a patient's record, and when.
--
-- Every other table here answers "who wrote this" (created_by, author_id). Nothing answered
-- "who read this" — which matters for a clinical record once something has to be investigated
-- (a complaint, a suspected leak, a DPDP Data Protection Board inquiry asking to show who
-- touched a specific patient's data). This adds that, and only that: one row per page view,
-- append-only, same shape as pathway_audit (0053).
--
-- Append-only is enforced twice, deliberately: no update/delete RLS policy is created below,
-- AND update/delete privileges are never granted to `authenticated` at all. A doctor who can
-- read and write patient data still cannot edit or erase their own access trail.
--
-- Writing this must never be able to block viewing a patient, so the app inserts it
-- fire-and-forget (see app/patients/[id]/page.tsx) rather than awaiting it before rendering.
--
-- Safe to run more than once.

begin;

create table if not exists patient_access_log (
  id          uuid primary key default gen_random_uuid(),
  patient_id  uuid not null references patients (id) on delete cascade,
  ward_id     uuid not null references wards (id) on delete cascade,
  actor_id    uuid references auth.users (id),
  occurred_at timestamptz not null default now()
);

create index if not exists patient_access_log_patient_idx
  on patient_access_log (patient_id, occurred_at desc);

alter table patient_access_log enable row level security;

drop policy if exists patient_access_log_read on patient_access_log;
drop policy if exists patient_access_log_write on patient_access_log;

-- Only the ward's owner reviews the trail — same bar as the other owner-only screens (unit
-- roster attestations, hospital formulary). A member's own view is still logged either way;
-- they just can't browse who looked at what.
create policy patient_access_log_read on patient_access_log for select
  using (is_ward_owner(ward_id));

-- Any ward member may log a view of a patient in their own ward, as themselves.
create policy patient_access_log_write on patient_access_log for insert
  with check (is_ward_member(ward_id) and actor_id = auth.uid());

grant select, insert on patient_access_log to authenticated;

commit;
