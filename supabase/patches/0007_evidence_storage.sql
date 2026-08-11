-- Storage for photographed lab reports.
--
-- The bucket is PRIVATE. Photos are never served from a public web address — the app hands
-- out short-lived signed links, one at a time, only to a doctor who is a member of the ward
-- the patient belongs to. A leaked path on its own gets you nothing.
--
-- Files are stored as  <patient_id>/<entry_id>.<ext>  so the first folder in the path is the
-- patient, which is what the rules below check membership against.
--
-- Safe to run more than once.

begin;

insert into storage.buckets (id, name, public)
values ('evidence', 'evidence', false)
on conflict (id) do nothing;

drop policy if exists evidence_read on storage.objects;
drop policy if exists evidence_insert on storage.objects;

create policy evidence_read on storage.objects for select to authenticated
using (
  bucket_id = 'evidence'
  and exists (
    select 1 from patients p
    where p.id::text = (storage.foldername(name))[1]
      and is_ward_member(p.ward_id)
  )
);

create policy evidence_insert on storage.objects for insert to authenticated
with check (
  bucket_id = 'evidence'
  and exists (
    select 1 from patients p
    where p.id::text = (storage.foldername(name))[1]
      and is_ward_member(p.ward_id)
  )
);

-- Deliberately no delete or update policy: a photograph is evidence for a stored value, and
-- the value keeps pointing at it. Nothing in the app may quietly replace or remove it.

commit;
