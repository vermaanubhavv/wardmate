-- Where the fields sit on a unit's uploaded "notes" format, so a printed progress note can lay
-- text into the paper's own boxes instead of only ever printing on a generic page.
--
-- Detected once, when the format is uploaded — see lib/read-form-layout.ts and
-- app/formats/actions.ts — not recomputed on every print. layout_error records why detection
-- did not produce anything usable, so the app can say so rather than silently falling back with
-- no explanation. A row with layout = null and layout_error = null simply has not had detection
-- attempted yet (a PDF format, for instance, which this does not currently read).

begin;

alter table ward_formats add column if not exists layout jsonb;
alter table ward_formats add column if not exists layout_model text;
alter table ward_formats add column if not exists layout_error text;

commit;
