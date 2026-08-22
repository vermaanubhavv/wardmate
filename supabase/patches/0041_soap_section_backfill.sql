-- Backfills soap_section on every checklist protocol filed so far (Lap Chole from 0037 plus the
-- eighteen from 0038), so "Current progress" can group them as SOAP.
--
-- Scoped to titles ending in "Checklist", which is exactly the set of protocols that stand in
-- for a procedure's care_template. The clinical Quick Mode cards (IV Fluids and anything filed
-- like it) are deliberately left null: they are reference guidance, not a per-patient checklist,
-- and have nothing to group.
--
-- The classification is the item's own filed kind plus two short label lists — things that are
-- the patient's account rather than a measurement (pain, bleeding, duration...), and things that
-- are administrative rather than clinical (consent, fitness, fasting status...). Verified to
-- reproduce, statement for statement, the per-item version this replaced.
--
-- Idempotent: re-running sets the same values again.

begin;

update company_protocol_items i
set soap_section = case
  -- Filed as a pathway step, i.e. something to be done rather than found.
  when i.kind = 'pathway_step' then 'plan'
  -- Drugs to start, stop or continue: a job, not a finding.
  when i.prompt in ('stool softener', 'blood thinners', 'antibiotics') then 'plan'
  -- Administrative or background-history items. These are the reason there is a fifth bucket
  -- at all: "consent taken" is not subjective, objective, an assessment or a plan.
  when i.prompt in (
    'consent', 'fitness', 'fasting status', 'bowel preparation', 'previous treatment',
    'previous episodes', 'index episode', 'interval since episode', 'conservative treatment',
    'previous surgery', 'comorbidities', 'raised intra-abdominal pressure', 'continence'
  ) then 'checks'
  -- What the patient reports, as opposed to what was measured or seen.
  when i.prompt in (
    'pain', 'bleeding', 'discharge', 'prolapse', 'duration', 'duration of symptoms',
    'current symptoms', 'vomiting', 'chronicity', 'bowel habit'
  ) then 'subjective'
  -- Everything else is examined, measured or resulted.
  else 'objective'
end
from company_protocols p
where p.id = i.protocol_id
  and p.version = 'v1'
  and p.title like '%Checklist';

commit;
