-- Sonnet's last proofread of a discharge summary, run as it is finalised — see lib/final-check.ts.
--
-- { checkedAt, fixes: [{ field, kind, before, after }], questions: [string] }. The fixes are
-- already applied to the section columns; this keeps the record of what changed and the
-- questions it raised, shown on the finalised summary. Null means it never ran (rows finalised
-- before this patch, or the pass failed), and nothing reads it as anything else.

begin;

alter table discharge_summaries add column if not exists final_check jsonb;

commit;
