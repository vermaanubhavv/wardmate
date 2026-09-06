-- Scoring engine — on for every unit that exists today, and every one created from now on,
-- in every department.
--
-- WHAT "ON" MEANS HERE, PRECISELY. This patch only ever touches `ward_scoring_engine` — the
-- per-ward opt-in gate (lib/scoring/flag.ts). It does NOT change which pathway definitions are
-- active, and it does NOT change NEXT_PUBLIC_SCORING_ENGINE (the user already set that). A ward
-- with a row here and the global flag on will run whatever `status: "active"` pathways its own
-- specialty pack lists — see the header note at the bottom of this file for what that is,
-- department by department, today.
--
-- 1. BACKFILL — every ward that exists right now, regardless of specialty.
-- 2. GOING FORWARD — both create_ward_for_current_user() overloads (the one-arg version from
--    0028, still called by an un-redeployed client, and the two-arg version from 0060) now
--    insert a ward_scoring_engine row in the same transaction as the ward itself. A brand-new
--    unit — surgical, medicine or oncology — is opted in from the moment it is created; nobody
--    has to remember to flip anything for it later.
--
-- Requires: 0053_scoring_engine.sql (ward_scoring_engine table), 0060_specialty_packs.sql.
-- Safe to run more than once.

begin;

-- ---------------------------------------------------------------------------
-- 1. Backfill every existing ward.
-- ---------------------------------------------------------------------------

insert into ward_scoring_engine (ward_id)
select w.id from wards w
where not exists (select 1 from ward_scoring_engine e where e.ward_id = w.id);

-- ---------------------------------------------------------------------------
-- 2a. One-arg create_ward_for_current_user(text) — 0028's body, plus the opt-in row.
-- ---------------------------------------------------------------------------

create or replace function create_ward_for_current_user(unit_name text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare new_ward uuid; clean_name text := btrim(unit_name);
begin
  if auth.uid() is null or not clinician_can_enter() then raise exception 'Complete professional verification first.'; end if;
  if clean_name is null or char_length(clean_name) = 0 then raise exception 'Enter a unit name.'; end if;
  insert into wards (name, owner_id) values (left(clean_name, 60), auth.uid()) returning id into new_ward;
  insert into ward_members (ward_id, user_id, role) values (new_ward, auth.uid(), 'owner');
  insert into ward_scoring_engine (ward_id) values (new_ward);
  update profiles set current_ward_id = new_ward where id = auth.uid();
  return new_ward;
end;
$$;

grant execute on function create_ward_for_current_user(text) to authenticated;

-- ---------------------------------------------------------------------------
-- 2b. Two-arg create_ward_for_current_user(text, text) — 0063's body, plus the opt-in row.
-- ---------------------------------------------------------------------------

create or replace function create_ward_for_current_user(unit_name text, unit_specialty text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  new_ward uuid;
  clean_name text := btrim(unit_name);
  clean_specialty text := coalesce(nullif(btrim(lower(unit_specialty)), ''), 'general_surgery');
begin
  if auth.uid() is null or not clinician_can_enter() then
    raise exception 'Complete professional verification first.';
  end if;
  if clean_name is null or char_length(clean_name) = 0 then
    raise exception 'Enter a unit name.';
  end if;
  if clean_specialty not in ('general_surgery', 'medical_oncology', 'internal_medicine') then
    clean_specialty := 'general_surgery';
  end if;

  insert into wards (name, owner_id, specialty)
  values (left(clean_name, 60), auth.uid(), clean_specialty)
  returning id into new_ward;

  insert into ward_members (ward_id, user_id, role)
  values (new_ward, auth.uid(), 'owner');

  insert into ward_scoring_engine (ward_id) values (new_ward);

  update profiles set current_ward_id = new_ward where id = auth.uid();
  return new_ward;
end;
$$;

grant execute on function create_ward_for_current_user(text, text) to authenticated;

commit;

-- ---------------------------------------------------------------------------
-- What actually fires for each department right now, with the engine on everywhere:
--
--   General surgery    — Ranson's/BISAP (pancreatitis), AIR (appendicitis), TG18
--                         (cholecystitis, cholangitis), Glasgow-Blatchford (UGI bleed).
--                         ALL FIVE ARE STILL `status: "draft"` — clinical governance sign-off
--                         has not happened (lib/scoring/definitions/*.v1.ts). With the ward
--                         flag on but the definitions still draft, NOTHING SHOWS unless
--                         SCORING_ENGINE_ALLOW_DRAFTS=on is also set. This patch does not flip
--                         that, and does not flip the five definitions to "active" — that is a
--                         clinical-content decision affecting real patients (Unit Alpha), not a
--                         wiring one. Say the word and it is the same one-line change per file
--                         made for the four internal-medicine scores.
--
--   Internal medicine  — CURB-65, qSOFA+SIRS, CHA2DS2-VASc, HAS-BLED. Already `status: "active"`
--                         (pilot activation 2026-09-04). These fire now, on every internal
--                         medicine unit, the moment a matching diagnosis is recorded.
--
--   Medical oncology    — scoringKeys is EMPTY (lib/specialty/medical-oncology.ts) — no
--                         oncology score has been built yet (MASCC / Cairo-Bishop / ECOG were
--                         named as the next phase). Turning the ward flag on for an oncology
--                         unit is harmless and correct to do now, but nothing will appear until
--                         those definitions exist.
-- ---------------------------------------------------------------------------
