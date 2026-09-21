-- A daily ceiling on photographs read by the AI, per ward.
--
-- Every photographed page is a paid model call, and twenty in one afternoon used up the whole
-- balance. This counts reads per ward per day (India time, the day a round is on) and lets the
-- app refuse the next one once the ceiling is reached.
--
-- claim_photo_read() is SECURITY INVOKER on purpose, like ward_screen(): it runs as the calling
-- doctor, so the table's own policies decide whether they may touch this ward's counter. The
-- ceiling is passed in by the app (PHOTO_READS_PER_WARD_DAY) so it can be changed without a
-- patch. That makes it a guard against a runaway bill, not a security boundary: a member who
-- called the function directly with a bigger number would only be raising their own ward's cap.
--
-- Idempotent + self-transaction-wrapped per repo convention.

begin;

create table if not exists public.photo_reads_daily (
  ward_id uuid not null references public.wards(id) on delete cascade,
  day     date not null,
  n       integer not null default 0,
  primary key (ward_id, day)
);

alter table public.photo_reads_daily enable row level security;

-- Table privileges run BEFORE RLS; a raw create table carries none (lesson of 0055/0059/0062).
grant select, insert, update on public.photo_reads_daily to authenticated;

drop policy if exists photo_reads_daily_read on public.photo_reads_daily;
create policy photo_reads_daily_read on public.photo_reads_daily for select to authenticated
  using (is_ward_member(ward_id));

drop policy if exists photo_reads_daily_insert on public.photo_reads_daily;
create policy photo_reads_daily_insert on public.photo_reads_daily for insert to authenticated
  with check (is_ward_member(ward_id));

drop policy if exists photo_reads_daily_update on public.photo_reads_daily;
create policy photo_reads_daily_update on public.photo_reads_daily for update to authenticated
  using (is_ward_member(ward_id))
  with check (is_ward_member(ward_id));

-- True when the read may go ahead (and is counted); false once the ward is at its ceiling.
-- One atomic statement, so two phones reading at once cannot both take the last slot.
create or replace function public.claim_photo_read(_ward uuid, _cap integer)
returns boolean
language sql
security invoker
as $$
  with claimed as (
    insert into public.photo_reads_daily as d (ward_id, day, n)
    values (_ward, (now() at time zone 'Asia/Kolkata')::date, 1)
    on conflict (ward_id, day) do update set n = d.n + 1
      where d.n < _cap
    returning 1
  )
  select exists (select 1 from claimed);
$$;

grant execute on function public.claim_photo_read(uuid, integer) to authenticated;

notify pgrst, 'reload schema';

commit;
