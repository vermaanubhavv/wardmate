-- The hospital's own reference ranges, learned from the reports the unit actually photographs.
--
-- Every laboratory report already prints the range beside the result — "Haemoglobin 8.2 g/dL
-- (13.0 – 17.0)". That printed range is more authoritative than any table this app could ship:
-- it is this hospital's laboratory, on this assay, on the same page as the number. So it is read
-- off the report along with the value and kept in two places:
--
--   1. On the observation itself, as the range that came with THAT result. Nothing beats it,
--      because it was printed next to the very number it describes.
--   2. Accumulated per ward in lab_reference_ranges, so a value dictated on a round — with no
--      report to read — can still be judged against the range this unit's lab actually uses.
--
-- Accumulation is by vote, not by overwrite. Each distinct range seen for an analyte is its own
-- row with a seen_count, and the ward's range is whichever has been seen most. A single
-- misread photograph therefore cannot displace a range that fifty clean reports agree on,
-- which is the failure this design exists to prevent.

begin;

-- The range printed beside this particular result.
alter table observations add column if not exists ref_low numeric;
alter table observations add column if not exists ref_high numeric;
-- As printed, so a human can check it against the photograph exactly like source_quote.
alter table observations add column if not exists ref_text text;

create table if not exists lab_reference_ranges (
  id uuid primary key default gen_random_uuid(),
  ward_id uuid not null references wards (id) on delete cascade,
  -- Canonical name, so "Haemoglobin", "HAEMOGLOBIN" and "Hb" accumulate onto one row.
  analyte text not null,
  -- '' rather than null, so the uniqueness below behaves: in Postgres two nulls are distinct,
  -- which would let the same range be inserted over and over instead of being counted.
  unit text not null default '',
  ref_low numeric not null,
  ref_high numeric not null,
  ref_text text,
  seen_count integer not null default 1,
  first_seen_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  constraint lab_reference_ranges_order check (ref_low <= ref_high),
  unique (ward_id, analyte, unit, ref_low, ref_high)
);

create index if not exists lab_reference_ranges_lookup
  on lab_reference_ranges (ward_id, analyte, seen_count desc);

alter table lab_reference_ranges enable row level security;

drop policy if exists lab_reference_ranges_read on lab_reference_ranges;
create policy lab_reference_ranges_read on lab_reference_ranges
  for select to authenticated using (is_ward_member(ward_id));

drop policy if exists lab_reference_ranges_insert on lab_reference_ranges;
create policy lab_reference_ranges_insert on lab_reference_ranges
  for insert to authenticated with check (is_ward_member(ward_id));

drop policy if exists lab_reference_ranges_update on lab_reference_ranges;
create policy lab_reference_ranges_update on lab_reference_ranges
  for update to authenticated using (is_ward_member(ward_id));

grant select, insert, update on public.lab_reference_ranges to authenticated;

-- Records one sighting of a range. Deliberately SECURITY INVOKER: it runs as the doctor who
-- photographed the report, so the policies above are the thing deciding what may be written,
-- rather than this function being trusted to check for itself.
create or replace function record_lab_range(
  _ward uuid, _analyte text, _unit text, _low numeric, _high numeric, _text text
) returns void
language sql
as $$
  insert into lab_reference_ranges (ward_id, analyte, unit, ref_low, ref_high, ref_text)
  values (_ward, _analyte, coalesce(_unit, ''), _low, _high, _text)
  on conflict (ward_id, analyte, unit, ref_low, ref_high)
  do update set seen_count = lab_reference_ranges.seen_count + 1, last_seen_at = now();
$$;

grant execute on function record_lab_range(uuid, text, text, numeric, numeric, text) to authenticated;

commit;
