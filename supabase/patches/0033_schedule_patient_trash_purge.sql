-- Automatically purge patient records only after their seven-day trash retention has elapsed.
-- Requires 0029_patient_trash.sql. Supabase Cron runs this daily at 02:15 UTC; the function
-- itself keeps the date boundary, so changing its cadence cannot purge a newer record.

do $$
declare existing_job bigint;
begin
  if not exists (select 1 from pg_namespace where nspname = 'cron') then
    raise exception 'Enable the pg_cron extension in Supabase, then run this patch again.';
  end if;

  select jobid into existing_job from cron.job where jobname = 'purge-expired-patient-trash';
  if existing_job is not null then
    perform cron.unschedule(existing_job);
  end if;

  perform cron.schedule(
    'purge-expired-patient-trash',
    '15 2 * * *',
    'select public.purge_expired_trash();'
  );
end;
$$;
