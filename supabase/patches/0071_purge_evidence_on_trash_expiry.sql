-- Closes the gap noted in 0015: a purged patient's stored photos/audio were never reached by
-- the cascade delete, so they sat in the 'evidence' bucket forever — unreadable through the
-- app (the read policy requires a live patients row) but never actually gone. For a clinical
-- tool that has to show it erases patient data on schedule, "unreadable" isn't good enough.
--
-- This adds a narrowly-scoped delete policy: a file under '<patient_id>/...' may only be
-- deleted once that patient is trashed AND past the same 7-day window purge_expired_trash()
-- uses. It cannot be used to delete evidence behind a live record — the 0017 comment's
-- promise ("nothing in the app should be able to delete those out from under a record")
-- still holds for every patient that isn't already on its way out.
--
-- The app calls this from app/unit/trash/page.tsx, right before the existing opportunistic
-- purge_expired_trash() RPC, so storage cleanup and the DB row deletion happen together
-- instead of racing each other.
--
-- Safe to run more than once.

begin;

drop policy if exists evidence_delete_expired_trash on storage.objects;

create policy evidence_delete_expired_trash on storage.objects for delete to authenticated
using (
  bucket_id = 'evidence'
  and exists (
    select 1 from patients p
    where p.id::text = (storage.foldername(name))[1]
      and p.status = 'trashed'
      and p.trashed_at < now() - interval '7 days'
      and is_ward_member(p.ward_id)
  )
);

commit;
