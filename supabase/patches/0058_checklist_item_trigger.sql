-- Auto-triggers on checklist items. `trigger` is a JSON rule (schema: lib/checklist-triggers.ts)
-- that decides whether an item shows at all for a given patient, and whether it shows as a
-- gap. Two families of condition — history/entry based (a diagnosis, a drug, a lab over a
-- threshold, another line answered) and time based (post-op day, hours since surgery /
-- admission). An item with no trigger behaves exactly as before: always shown.
--
-- This patch also moves the two rules that were hard-coded in lib/templates.ts
-- (CONDITIONAL_ITEMS) onto the data, across every checklist protocol that has those items:
--   * "blood thinners" — shown only with a cardiac or anticoagulant history
--   * "MRCP"           — shown only with a pointer to a common-bile-duct stone
--
-- Safe to run more than once.

begin;

alter table care_template_items   add column if not exists trigger jsonb;
alter table company_protocol_items add column if not exists trigger jsonb;

update company_protocol_items i
set trigger = jsonb_build_object(
  'when', jsonb_build_array(
    jsonb_build_object(
      'type', 'history',
      'pattern',
        'cad|coronary artery disease|ihd|ischemic heart disease|ischaemic heart disease|angina|nstemi|stemi|acute coronary syndrome|myocardial infarction|angioplasty|coronary stent|drug eluting stent|cabg|bypass graft|atrial fibrillation|afib|prosthetic valve|metallic valve|mechanical valve|valve replacement|deep vein thrombosis|dvt|pulmonary embolism|cerebrovascular accident|ischemic stroke|ischaemic stroke|transient ischemic|transient ischaemic|anticoagula|blood thinner|antiplatelet|warfarin|acitrom|acenocoumarol|apixaban|eliquis|rivaroxaban|xarelto|dabigatran|edoxaban|doac|noac|clopidogrel|plavix|ticagrelor|prasugrel|aspirin|ecosprin|asprin|dipyridamole|heparin|enoxaparin|clexane|lmwh|dalteparin|fondaparinux'
    )
  )
)
from company_protocols p
where p.id = i.protocol_id
  and p.title like '%Checklist'
  and lower(btrim(i.prompt)) = 'blood thinners'
  and i.trigger is null;

update company_protocol_items i
set trigger = jsonb_build_object(
  'when', jsonb_build_array(
    jsonb_build_object(
      'type', 'history',
      'pattern',
        'pancreatitis|choledocholithiasis|cbd calcul|calculus in cbd|calculus in the cbd|stone in cbd|stone in the cbd|cbd stone|dilated cbd|dilated common bile duct|cholangitis|obstructive jaundice|deranged lft|deranged liver function|raised bilirubin|conjugated hyperbilirubin|conjugated bilirubin|raised alp|raised alkaline phosphatase|raised ggt|raised gamma gt|yellowing of eyes|yellowing of skin|clay coloured stool|clay-coloured stool|dark urine|past jaundice|h/o jaundice|history of jaundice'
    )
  )
)
from company_protocols p
where p.id = i.protocol_id
  and p.title like '%Checklist'
  and lower(btrim(i.prompt)) = 'mrcp'
  and i.trigger is null;

commit;
