-- Deleting a patient no longer destroys anything immediately.
--
-- Patch 0025 granted every ward member a direct, one-step delete on any active patient —
-- superseding the schema's original two-step design (remove, then delete) with a single JS
-- confirm() dialog as the only thing between a mis-tap and a permanently destroyed record.
-- That is reversed here, and a further safety net is added on top rather than just restoring
-- what was there before:
--
--   active  --Remove from ward-->  discharged  --Move to trash-->  trashed  --7 days-->  gone
--
-- Every arrow left of "gone" is reversible from the app. Only the last one is real, and it
-- only ever happens seven days after a SECOND deliberate act, not the first.
--
-- Two transactions, deliberately. ALTER TYPE ... ADD VALUE cannot be used in the same
-- transaction that adds it — Postgres refuses — so the new status is added and committed on
-- its own before anything below references it.
--
-- Safe to run more than once.

begin;
alter type patient_status add value if not exists 'trashed';
commit;

begin;

alter table patients add column if not exists trashed_at timestamptz;

-- Direct deletion is withdrawn entirely, not just narrowed. The only thing that is ever
-- allowed to remove a row from patients again is purge_expired_trash() below, which runs as
-- its own definer and is not reachable through ordinary row access at all — so even a bug
-- elsewhere in the app cannot delete a patient outright, only trash one, which is recoverable.
drop policy if exists patients_delete on patients;
revoke delete on patients from authenticated;

-- Called once, opportunistically, whenever the Trash screen is opened — see app/unit/trash.
-- No scheduled job exists in this project, and none is needed: a doctor opens this page in
-- the ordinary course of things, and "purge on the next visit after expiry" is close enough to
-- "purge after 7 days" for a queue nobody is racing. SECURITY DEFINER because deleting rows
-- older than a threshold is a narrow, self-limiting operation — it can never remove anything
-- that has not already sat trashed for a full week, however it is invoked or how often.
create or replace function purge_expired_trash()
returns void
language sql
security definer
set search_path = public
as $$
  delete from patients
  where status = 'trashed' and trashed_at < now() - interval '7 days';
$$;

grant execute on function purge_expired_trash() to authenticated;

commit;
