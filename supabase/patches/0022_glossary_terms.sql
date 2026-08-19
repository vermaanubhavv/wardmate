-- The unit's own glossary of what the speech engine mishears.
--
-- lib/corrections.ts already holds a hand-written list — lap chole, PAC, Ryle's tube — which
-- is tested, reviewed, and works with nothing in this table at all. This is the layer that
-- GROWS: every unit mishears its own drug names and its own shorthand, and no list written in
-- advance can know them. A resident flags a term once at the bedside and it is learned.
--
-- WHY A FUNCTION RATHER THAN AN INSERT POLICY. Two things the app cannot do safely on its own:
--
--   1. The count. Reading times_seen and writing back times_seen + 1 is not atomic, so two
--      residents flagging the same word in the same minute lose an increment between them.
--      "on conflict do update" makes it one statement the database settles itself.
--   2. The promotion. A term becomes 'confirmed' at three sightings, and that decision has to
--      happen in the same breath as the increment or it can be missed entirely.
--
-- SECURITY DEFINER, deliberately, and this is the one place in the schema that uses it. The
-- table has no insert or update policy, so the ONLY way to write to it is this function, whose
-- body is fixed: a caller can add a correction pair, and can do nothing else. That is the same
-- protection the spec wanted from a service-role key, without putting one in the app — a key
-- that could write to every table in the database, to protect one.
--
-- search_path is pinned so the function cannot be redirected at a table of somebody else's.
--
-- Safe to run more than once.

begin;

create table if not exists glossary_terms (
  id           uuid primary key default gen_random_uuid(),
  wrong_term   text not null,          -- normalised: lowercase, punctuation stripped
  correct_term text not null,          -- as the unit writes it, case preserved
  category     text check (category is null or category in
                 ('drug', 'procedure', 'ward_shorthand', 'anatomy')),
  times_seen   int not null default 1,
  confidence   text not null default 'unconfirmed'
                 check (confidence in ('unconfirmed', 'confirmed')),
  added_by     uuid references auth.users (id),
  created_at   timestamptz not null default now(),
  last_seen_at timestamptz not null default now()
);

-- What makes the upsert below possible, and what stops the same mishearing becoming twenty
-- rows that each never reach the confirmation threshold.
create unique index if not exists glossary_terms_wrong_idx on glossary_terms (wrong_term);

-- Ranked by frequency on every structuring call, so it earns its index.
create index if not exists glossary_terms_confirmed_idx
  on glossary_terms (confidence, times_seen desc);

alter table glossary_terms enable row level security;

-- Readable by anyone signed in. Deliberately not restricted per ward: a mishearing of
-- "ceftriaxone" is a fact about the speech engine, not about a patient, and there is nothing
-- in this table that belongs to anybody.
drop policy if exists glossary_read on glossary_terms;
create policy glossary_read on glossary_terms for select
  using (auth.role() = 'authenticated');

grant select on glossary_terms to authenticated;
-- No insert, update or delete grant. Writes go through the function below or not at all.

create or replace function flag_glossary_term(
  wrong text,
  correct text,
  term_category text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  normalised text;
  cleaned    text;
begin
  -- Same normalisation the read path uses, done here so a caller cannot skip it and create a
  -- row nothing will ever match.
  normalised := btrim(lower(regexp_replace(coalesce(wrong, ''), '[^[:alnum:][:space:]-]', '', 'g')));
  cleaned    := btrim(coalesce(correct, ''));

  -- Nothing useful to record, and nothing to complain about either: a resident who opened the
  -- box and thought better of it has not made an error.
  if normalised = '' or cleaned = '' then return; end if;

  -- A term that "corrects" to itself is not a correction. Left out rather than stored, so it
  -- cannot reach a prompt and spend tokens saying nothing.
  if normalised = lower(cleaned) then return; end if;

  insert into glossary_terms (wrong_term, correct_term, category, added_by)
  values (normalised, cleaned, term_category, auth.uid())
  on conflict (wrong_term) do update
    set times_seen   = glossary_terms.times_seen + 1,
        last_seen_at = now(),
        -- Three sightings is the line between one resident's slip and something this ward
        -- actually says. Only ever promotes; a confirmed term is not demoted by this.
        confidence   = case
                         when glossary_terms.times_seen + 1 >= 3 then 'confirmed'
                         else glossary_terms.confidence
                       end;
end;
$$;

grant execute on function flag_glossary_term(text, text, text) to authenticated;

commit;
