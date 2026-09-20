-- A deleted patient stays in Trash for 48 hours, not 7 days.
--
-- Patches 0029 and 0071 fixed the window at seven days, in two places that must agree: the
-- function that deletes the patient row, and the storage policy that lets their photos and
-- audio be deleted first. Both are redefined here with the same 48-hour window.
--
-- The daily 02:15 UTC job of 0033 would now let an expired patient sit for up to a day past
-- their 48 hours, so it is rescheduled to run hourly. The function keeps the time boundary
-- itself, so running it more often can never purge a record early.
--
-- Idempotent + self-transaction-wrapped per repo convention.

begin;

create or replace function purge_expired_trash()
returns void
language sql
security definer
set search_path = public
as $$
  delete from patients
  where status = 'trashed' and trashed_at < now() - interval '48 hours';
$$;

grant execute on function purge_expired_trash() to authenticated;

drop policy if exists evidence_delete_expired_trash on storage.objects;

create policy evidence_delete_expired_trash on storage.objects for delete to authenticated
using (
  bucket_id = 'evidence'
  and exists (
    select 1 from patients p
    where p.id::text = (storage.foldername(name))[1]
      and p.status = 'trashed'
      and p.trashed_at < now() - interval '48 hours'
      and is_ward_member(p.ward_id)
  )
);

do $$
declare existing_job bigint;
begin
  if exists (select 1 from pg_namespace where nspname = 'cron') then
    select jobid into existing_job from cron.job where jobname = 'purge-expired-patient-trash';
    if existing_job is not null then
      perform cron.unschedule(existing_job);
    end if;
    perform cron.schedule('purge-expired-patient-trash', '15 * * * *', 'select public.purge_expired_trash();');
  end if;
end;
$$;

commit;
