-- Tables nothing in app/, lib/ or scripts/ reads or writes any more, dropped ONLY IF EMPTY.
--
--   stt_comparisons      (0055) — the speech-to-text bake-off; the comparison screen is gone.
--   pathway_events       (0053) — the scoring engine never recorded events; no code inserts.
--   pathway_definitions  (0053) — definitions ship in lib/scoring/definitions/; no code reads rows.
--   the hospital layer   (0075, 0077, 0078, 0111) — hospitals, hospital_members, the
--                         hospital_role type, wards.hospital_id, is_hospital_member(),
--                         is_hospital_admin(), ward_hospital_admin_access(), and the five
--                         "hospital admins select …" policies on wards, patients, entries,
--                         observations and history_checks. Those policies only ever widened
--                         access for hospital admins; with no hospital rows they grant nothing,
--                         so removing them changes no one's access.
--
-- Why guarded: the rows could not be counted from where this was written. Each group is
-- dropped only when it holds no data at all; otherwise it is kept and a warning names it,
-- so nothing with rows in it can be lost. Each group runs in its own sub-block: an
-- unexpected dependency skips that group with a warning instead of failing the deploy.
-- Nothing is dropped with CASCADE.
--
-- Safe to run more than once.

begin;

do $$
begin
  -- stt_comparisons
  if to_regclass('public.stt_comparisons') is not null then
    if exists (select 1 from public.stt_comparisons) then
      raise warning 'stt_comparisons has rows: kept';
    else
      begin
        drop table public.stt_comparisons;
      exception when others then
        raise warning 'stt_comparisons not dropped: %', sqlerrm;
      end;
    end if;
  end if;

  -- pathway_events
  if to_regclass('public.pathway_events') is not null then
    if exists (select 1 from public.pathway_events) then
      raise warning 'pathway_events has rows: kept';
    else
      begin
        drop table public.pathway_events;
      exception when others then
        raise warning 'pathway_events not dropped: %', sqlerrm;
      end;
    end if;
  end if;

  -- pathway_definitions
  if to_regclass('public.pathway_definitions') is not null then
    if exists (select 1 from public.pathway_definitions) then
      raise warning 'pathway_definitions has rows: kept';
    else
      begin
        drop table public.pathway_definitions;
      exception when others then
        raise warning 'pathway_definitions not dropped: %', sqlerrm;
      end;
    end if;
  end if;

  -- The hospital layer, all or nothing: only when no hospital, no membership and no ward
  -- assigned to a hospital exist.
  if to_regclass('public.hospitals') is not null then
    if exists (select 1 from public.hospitals)
       or (to_regclass('public.hospital_members') is not null
           and exists (select 1 from public.hospital_members))
       or exists (select 1 from information_schema.columns
                  where table_schema = 'public' and table_name = 'wards'
                    and column_name = 'hospital_id')
          and exists (select 1 from public.wards where hospital_id is not null) then
      raise warning 'hospital layer holds data: kept';
    else
      begin
        drop policy if exists "hospital admins select wards" on public.wards;
        drop policy if exists "hospital admins select patients" on public.patients;
        drop policy if exists "hospital admins select entries" on public.entries;
        drop policy if exists "hospital admins select observations" on public.observations;
        drop policy if exists "hospital admins select history_checks" on public.history_checks;
        drop function if exists public.ward_hospital_admin_access(uuid);
        drop table if exists public.hospital_members;
        alter table public.wards drop column if exists hospital_id;
        -- The hospitals table's own policies call the two helpers, so it goes first.
        drop table public.hospitals;
        drop function if exists public.is_hospital_admin(uuid);
        drop function if exists public.is_hospital_member(uuid);
        drop type if exists public.hospital_role;
      exception when others then
        raise warning 'hospital layer not dropped: %', sqlerrm;
      end;
    end if;
  end if;
end $$;

commit;
