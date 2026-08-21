-- Lets a company protocol stand in for a procedure's checklist template — see
-- supabase/patches/0004_templates.sql / 0005_template_seed.sql for the system this is starting
-- to replace, one procedure at a time, from the authoring side rather than by touching how
-- "Where things stand" reads (see lib/templates.ts).
--
-- 'core' items are the ones "Where things stand" marks red when nothing has been recorded
-- against them; 'optional' items just never turn red. Aliases are the other words a resident
-- might say for the same thing ("usg" for "imaging") so a spoken value still finds its item.
-- Both concepts already existed on care_template_items; protocols didn't need them until a
-- protocol could also serve as a checklist.

begin;

alter table company_protocol_items add column if not exists importance text
  not null default 'core'
  check (importance in ('core', 'optional'));

alter table company_protocol_items add column if not exists aliases text[] not null default '{}';

commit;
