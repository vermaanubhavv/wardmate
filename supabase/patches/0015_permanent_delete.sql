-- Permanently deleting a patient added by mistake.
--
-- The schema has had no delete policy on patients since the beginning, deliberately: a
-- discharge sets a status, and the record survives. That stays true for every patient who was
-- really treated. What it did not allow for is the patient who should never have existed —
-- created by a misheard bed number, or by a name read wrong off a register. Those are not
-- clinical records; they are noise, and now that patients can be created by voice and by
-- photograph the app makes them faster than a person can.
--
-- The policy allows deletion ONLY of a patient already removed from the ward. That makes it
-- two deliberate acts rather than one, enforced by the database rather than by the interface:
-- remove first, and then, from the removed list, delete. A tap on a ward card cannot destroy
-- anything, however badly it is misaimed.
--
-- Deleting cascades to their entries and observations, which is the point — a mistaken
-- patient's mistaken entries go with them — and it is why the app puts this behind an undo
-- list rather than beside "remove". Anything on this list can be put back until it is
-- deleted, and after that it is gone.
--
-- Stored photographs are not reached by the cascade. They stay in the evidence bucket,
-- orphaned and unreadable through the app, until they are cleared separately.
--
-- Safe to run more than once.

begin;

drop policy if exists patients_delete on patients;

create policy patients_delete on patients for delete
  using (is_ward_member(ward_id) and status = 'discharged');

grant delete on patients to authenticated;

commit;
