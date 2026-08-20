-- A confirmed permanent delete happens directly from the ward list.
--
-- This supersedes patch 0015's two-step "remove, then delete" policy. The app still asks for
-- confirmation and names what will be destroyed; this policy simply makes that confirmed act
-- work in one step for a doctor who belongs to the patient's ward.
--
-- Run in Supabase Dashboard -> SQL Editor -> New query -> paste -> Run.
-- Safe to run more than once.

begin;

drop policy if exists patients_delete on patients;

create policy patients_delete on patients for delete
  using (is_ward_member(ward_id));

grant delete on patients to authenticated;

commit;
