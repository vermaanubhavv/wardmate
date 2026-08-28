-- Let a unit store its hospital logo.
--
-- 0017 created ward_formats with a check constraint naming the five kinds the unit was asked
-- for. A sixth, 'logo', was later added to FORMAT_KINDS in lib/formats.ts so a discharge
-- summary could print each unit's own seal instead of a hardcoded one — and no patch ever
-- extended the constraint to match. The slot appeared on the Formats screen, the file uploaded
-- into storage, and the row insert was then refused by the database. What the resident saw was
-- a server error and a logo that stayed "not uploaded", with nothing naming the cause.
--
-- The five original kinds are repeated here because a check constraint is replaced whole, not
-- appended to.
--
-- Safe to run more than once.

begin;

alter table ward_formats drop constraint if exists ward_formats_kind_check;

alter table ward_formats add constraint ward_formats_kind_check
  check (kind in (
    'investigation',      -- investigation / lab request form
    'interdepartmental',  -- referral or call to another department
    'discharge',          -- discharge summary layout
    'notes',              -- daily / progress notes
    'ot_notes',           -- operation notes
    'logo'                -- the hospital's seal, printed on discharge summaries
  ));

commit;
