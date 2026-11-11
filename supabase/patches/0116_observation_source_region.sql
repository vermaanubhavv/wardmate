-- Where on the photograph a value was read from.
--
-- A value off a photo already carries the printed line it was copied from (source_quote).
-- This adds the place: {x, y, width, height}, fractions of the full image, top-left origin —
-- the smallest box around that line, as the reader placed it. Null when the reader could not
-- place it, which is allowed and never guessed: the quote is the evidence, the crop is only
-- a faster way to look at it. Read by the confirm screen (app/confirm) to show each value
-- beside its own piece of the photo. Spoken and typed values never have one.
--
-- Safe to run more than once.

begin;

alter table observations add column if not exists source_region jsonb;

commit;
