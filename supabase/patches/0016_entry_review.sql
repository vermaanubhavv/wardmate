-- Accepting, correcting or throwing away what was heard.
--
-- Until now an entry was final the moment it was saved. The transcript could be read, in a
-- fold, and nothing could be done about it — a mis-heard sentence stayed on the record with
-- its wrong values hanging off it, and the only remedy was to say the whole thing again and
-- leave the wrong version sitting underneath.
--
-- Three things are now possible, and the schema has to allow each:
--
--   accept  — the resident has read what was heard and stands behind it. Recorded on the
--             entry, and it confirms the values that came out of it in the same act, because
--             those are the same claim: these words, and therefore these numbers.
--
--   edit    — the words were misheard. The transcript is corrected and the values are worked
--             out again from the corrected words. Nothing is patched by hand: the corrected
--             transcript goes back through the same extraction, with the same verbatim-quote
--             check, so a value can never end up on the record without a sentence containing
--             it. Correcting therefore replaces the entry's observations rather than editing
--             them, which is why entries needs an update policy AND observations a delete one.
--
--   delete  — it should not have been recorded at all: the wrong patient, a false start, a
--             conversation caught by an open microphone. This is the first delete policy on
--             entries, and it cascades to that entry's observations.
--
-- Deleting is limited to entries the doctor recorded themselves. A ward is shared, and one
-- resident quietly removing another's note is a different act from correcting your own.
--
-- Safe to run more than once.

begin;

alter table entries add column if not exists accepted_at timestamptz;
alter table entries add column if not exists accepted_by uuid references auth.users (id);

-- Corrections are recorded rather than silent: what the engine first heard is kept, so an
-- edited entry can still be compared against the audio it came from.
alter table entries add column if not exists original_transcript text;
alter table entries add column if not exists edited_at timestamptz;
alter table entries add column if not exists edited_by uuid references auth.users (id);

drop policy if exists entries_update on entries;
drop policy if exists entries_delete on entries;

create policy entries_update on entries for update
  using (
    exists (select 1 from patients p where p.id = entries.patient_id and is_ward_member(p.ward_id))
  )
  with check (
    exists (select 1 from patients p where p.id = entries.patient_id and is_ward_member(p.ward_id))
  );

create policy entries_delete on entries for delete
  using (
    author_id = auth.uid()
    and exists (
      select 1 from patients p where p.id = entries.patient_id and is_ward_member(p.ward_id)
    )
  );

-- Re-extraction replaces an entry's observations, so they have to be removable. Scoped to
-- observations reachable through a patient on one of your wards, exactly like the rest.
drop policy if exists observations_delete on observations;

create policy observations_delete on observations for delete
  using (
    exists (
      select 1 from patients p
      where p.id = observations.patient_id and is_ward_member(p.ward_id)
    )
  );

grant update, delete on entries      to authenticated;
grant delete          on observations to authenticated;

commit;
