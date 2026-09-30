-- Jev's (TypeSafe) reading of a plan, made once when it is extracted — see lib/jev-observations.ts.
--
-- The to-do filters run at render time over stored rows, often in the browser, so a model
-- cannot be asked there; the judgment is stored beside the plan instead. Both columns are
-- nullable and null means "not judged": every reader falls back to the keyword match it has
-- always used, so rows written before this patch, or while Jev is unavailable, behave exactly
-- as they did. The words themselves stay in value_text; these never replace them.
--
-- task_open is only ever TRUE: Jev may rescue a plan the keyword filter would hide, never hide
-- one it shows (lib/task-classification.ts explains why hiding is the dangerous direction).

begin;

alter table observations add column if not exists task_open boolean
  check (task_open is null or task_open);

alter table observations add column if not exists task_category text
  check (task_category in ('sampling', 'radiology', 'procedure', 'consent', 'other'));

-- Plans only, enforced here rather than trusted — the same rule as urgency and pac_verdict.
alter table observations drop constraint if exists observations_task_judgments_kind;
alter table observations
  add constraint observations_task_judgments_kind
  check ((task_open is null and task_category is null) or kind = 'plan');

commit;
