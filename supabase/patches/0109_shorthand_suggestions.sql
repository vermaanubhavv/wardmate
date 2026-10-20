-- Ward shorthand the residents teach by editing, kept as suggestions for an admin to approve.
--
-- lib/shorthand.ts shows findings and jobs in each department's ward shorthand, by rule, from
-- a table generated off the dictation lexicon. This is the layer that notices what the table
-- is missing: when a resident edits a value into a shorter form ("pain in the right iliac
-- fossa" → "pain RIF"), lib/shorthand.ts shorthandPair() reads the edit as a pair and the
-- patient page's save records it here.
--
-- NOTHING IS APPLIED FROM THIS TABLE. Not at three sightings, not on approval. An approved
-- pair is added to the lexicon (lib/transcription/lexicon/ward-shorthand.ts) in an ordinary
-- change, where the table-wide guard test proves it adds no number, side, site or negation
-- before any ward sees it. The table is a to-do list for that change, not a rule set.
--
-- Same shape as 0022_glossary_terms: no insert or update grant, so the only way in is the
-- SECURITY DEFINER function below, whose body can add a pair and do nothing else. The pair is
-- words, never a patient: shorthandPair() keeps only the span that changed, and drops any
-- edit with a number in it.
--
-- Requires: 0068_admin_console.sql (admin_check). Safe to run more than once.

begin;

create table if not exists shorthand_suggestions (
  id           uuid primary key default gen_random_uuid(),
  specialty    text not null,          -- the ward's pack key (lib/specialty), e.g. 'orthopaedics'
  long_form    text not null,          -- lowercase, as said: 'straight leg raising test'
  short_form   text not null,          -- as the resident wrote it: 'SLRT'
  times_seen   int not null default 1,
  status       text not null default 'pending'
                 check (status in ('pending', 'approved', 'rejected')),
  added_by     uuid references auth.users (id) on delete set null,
  created_at   timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  reviewed_by  uuid references auth.users (id) on delete set null,
  reviewed_at  timestamptz
);

create unique index if not exists shorthand_suggestions_pair_idx
  on shorthand_suggestions (specialty, long_form, short_form);

alter table shorthand_suggestions enable row level security;
-- No policy and no grant: read through admin_shorthand_suggestions(), written through the
-- two functions below.

create or replace function flag_shorthand_suggestion(spec text, long_text text, short_text text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  l text := btrim(lower(regexp_replace(coalesce(long_text, ''), '\s+', ' ', 'g')));
  s text := btrim(coalesce(short_text, ''));
begin
  -- The same limits shorthandPair() applies, held here so a caller cannot skip them.
  if l = '' or s = '' or length(l) > 80 or length(s) > 12 or l ~ '[0-9]' or s ~ '[0-9]' then
    return;
  end if;

  insert into shorthand_suggestions (specialty, long_form, short_form, added_by)
  values (coalesce(nullif(btrim(spec), ''), 'general_surgery'), l, s, auth.uid())
  on conflict (specialty, long_form, short_form) do update
    set times_seen   = shorthand_suggestions.times_seen + 1,
        last_seen_at = now();
end;
$$;

grant execute on function flag_shorthand_suggestion(text, text, text) to authenticated;

create or replace function admin_shorthand_suggestions()
returns setof shorthand_suggestions
language sql
security definer
set search_path = public
stable
as $$
  select * from shorthand_suggestions
  where admin_check()
  order by (status = 'pending') desc, times_seen desc, last_seen_at desc
  limit 500;
$$;

grant execute on function admin_shorthand_suggestions() to authenticated;

create or replace function admin_review_shorthand(suggestion_id uuid, verdict text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not admin_check() or verdict not in ('pending', 'approved', 'rejected') then return; end if;
  update shorthand_suggestions
     set status = verdict, reviewed_by = auth.uid(), reviewed_at = now()
   where id = suggestion_id;
end;
$$;

grant execute on function admin_review_shorthand(uuid, text) to authenticated;

commit;
