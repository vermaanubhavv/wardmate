-- Lets a round entry point at the company protocols it looks related to.
--
-- Populated by the same extraction call that already turns a transcript into observations —
-- see lib/extract.ts. The model is given the list of published protocol titles and asked
-- whether the transcript relates to any of them; a match is enforced in code to be one of the
-- titles actually offered, the same "never trust the free-text output" pattern the quote check
-- already uses for observations. Nothing is added to a patient's plan automatically — this only
-- surfaces a suggestion for the resident to open and act on themselves.

begin;

alter table entries add column if not exists matched_protocol_ids uuid[] not null default '{}';

commit;
