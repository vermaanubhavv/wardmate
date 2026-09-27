-- Internal medicine — third checklist tranche: the infection families the picker already offers.
--
-- WHAT THIS SEEDS. One 'before_surgery' company_protocols row plus its items for each of nine
-- template families whose picker rows (care_templates) were seeded back in 0064 but which had no
-- checklist until now:
--   sepsis, enteric_fever, malaria, scrub_typhus, cap, pyelonephritis, cellulitis,
--   pulmonary_tb, acute_febrile_encephalopathy
-- cap and pulmonary_tb are also offered by the pulmonary unit (0090), so these two checklists
-- reach its patients too. No care_templates rows are inserted — they already exist.
--
-- WHY phase = 'before_surgery'. Same as 0064: phaseFor() files every patient with no operation
-- date under 'before_surgery', which every medicine patient is.
--
-- TRIGGERS (patch 0058, lib/checklist-triggers.ts). Anchored on admission as in 0064:
-- `hours_since_admission_gte` for time-critical lines (cultures before antibiotics, antibiotic
-- within the hour, 48–72 h reviews), `history` patterns for lines that only apply to some
-- patients, `lab` for lactate and GCS, and `item_present` for the TB rifampicin-resistance line.
-- National programme lines follow NTEP (TB), NCVBDC (malaria, JE/AES) and IDSP notification.
-- No drug doses anywhere — drugs are named only where the question is whether they were given.
--
-- STATUS. Every protocol is 'draft', version 'v1-draft' — residents cannot see them until
-- published (getTemplateForPatient matches published protocols only).
--
-- CLINICAL CONTENT: REVIEWED (Dr Anubhav Verma, 2026-09-28) — seeded as draft; 0096 publishes it.
--
-- Requires: 0026, 0032, 0058, 0060, 0063, 0064.
-- Safe to run more than once — it rewrites the item set for a protocol of the same title.

begin;

-- =============================================================================
-- 1. Sepsis
-- =============================================================================
do $$
declare
  p_id uuid;
begin
  select id into p_id from company_protocols
   where title = 'Sepsis — Admission Checklist' limit 1;

  if p_id is null then
    insert into company_protocols (title, version, source_name, template_family, phase, status)
    values ('Sepsis — Admission Checklist', 'v1-draft', 'WardMate internal medicine pack',
            'sepsis', 'before_surgery', 'draft')
    returning id into p_id;
  end if;

  delete from company_protocol_items where protocol_id = p_id;

  insert into company_protocol_items
    (protocol_id, kind, position, prompt, importance, severity, soap_section, normal_phrase, aliases, trigger)
  values
    (p_id, 'immediate_action', 1, 'serum lactate measured', 'core', null, 'objective', null,
      array['lactate','serum lactate','lactic acid','abg lactate','vbg lactate'],
      null),
    (p_id, 'immediate_action', 2, 'blood cultures sent before antibiotics', 'core', null, 'objective', null,
      array['blood culture','cultures','culture sent','c/s','bactec','two sets'],
      '{"when": [{"type": "hours_since_admission_gte", "hours": 1}], "effect": "core"}'::jsonb),
    (p_id, 'immediate_action', 3, 'antibiotic given within 1 hour of recognition?', 'core', null, 'plan', null,
      array['antibiotic started','first dose','empirical antibiotic','door to antibiotic','time to antibiotic'],
      '{"when": [{"type": "hours_since_admission_gte", "hours": 1}], "effect": "core"}'::jsonb),
    (p_id, 'immediate_action', 4, 'fluid resuscitation started if hypotensive or lactate raised?', 'core', null, 'plan', null,
      array['fluid bolus','iv fluids','crystalloid','ringer lactate','normal saline','fluid challenge'],
      null),
    (p_id, 'investigation', 5, 'response to fluids reassessed (BP, perfusion, capillary refill)', 'core', null, 'objective', null,
      array['fluid response','map','capillary refill','perfusion','post bolus bp','fluid responsive'],
      '{"when": [{"type": "hours_since_admission_gte", "hours": 3}], "effect": "core"}'::jsonb),
    (p_id, 'investigation', 6, 'qSOFA / SOFA recorded', 'core', null, 'assessment', null,
      array['qsofa','sofa','sofa score','news','news2'],
      null),
    (p_id, 'investigation', 7, 'source of infection identified', 'core', null, 'assessment', null,
      array['source','focus','pneumonia','uti','cellulitis','abscess','cholangitis','line infection','source unknown'],
      null),
    (p_id, 'pathway_step', 8, 'source control needed (drainage, removal of catheter or line)?', 'optional', null, 'plan', null,
      array['source control','drainage','catheter removed','line removed','debridement'],
      null),
    (p_id, 'investigation', 9, 'hourly urine output charted', 'core', null, 'objective', null,
      array['urine output','uo','hourly urine','foley','oliguria','intake output chart'],
      null),
    (p_id, 'investigation', 10, 'repeat lactate if first value raised', 'core', null, 'objective', null,
      array['repeat lactate','lactate clearance','lactate trend'],
      '{"when": [{"type": "lab", "analyte": "lactate", "op": "gt", "value": 2}], "effect": "core"}'::jsonb),
    (p_id, 'investigation', 11, 'renal and liver function, platelets and coagulation', 'core', null, 'objective', null,
      array['creatinine','urea','lft','bilirubin','platelets','pt','inr','aptt','coagulation'],
      null),
    (p_id, 'red_flag', 12, 'hypotension persisting despite fluids — vasopressor needed?', 'core', 'critical', 'objective', 'Not hypotensive',
      array['septic shock','refractory hypotension','vasopressor','noradrenaline','norepinephrine','map below 65'],
      null),
    (p_id, 'red_flag', 13, 'new organ dysfunction (altered sensorium, hypoxia, oliguria)', 'core', 'urgent', 'objective', 'No new organ dysfunction',
      array['altered sensorium','confusion','hypoxia','desaturation','oliguria','aki','organ dysfunction'],
      null),
    (p_id, 'pathway_step', 14, 'ICU / HDU review discussed?', 'optional', null, 'plan', null,
      array['icu','hdu','micu','critical care','icu review'],
      '{"when": [{"type": "history", "pattern": "shock|vasopressor|noradrenaline|norepinephrine|intubat|ventilat"}], "effect": "core"}'::jsonb),
    (p_id, 'pathway_step', 15, 'antibiotic review / de-escalation at 48–72 hours', 'core', null, 'assessment', null,
      array['de-escalation','escalation','antibiotic review','culture result','sensitivity'],
      '{"when": [{"type": "hours_since_admission_gte", "hours": 48}], "effect": "core"}'::jsonb);
end $$;

-- =============================================================================
-- 2. Enteric fever
-- =============================================================================
do $$
declare
  p_id uuid;
begin
  select id into p_id from company_protocols
   where title = 'Enteric Fever — Checklist' limit 1;

  if p_id is null then
    insert into company_protocols (title, version, source_name, template_family, phase, status)
    values ('Enteric Fever — Checklist', 'v1-draft', 'WardMate internal medicine pack',
            'enteric_fever', 'before_surgery', 'draft')
    returning id into p_id;
  end if;

  delete from company_protocol_items where protocol_id = p_id;

  insert into company_protocol_items
    (protocol_id, kind, position, prompt, importance, severity, soap_section, normal_phrase, aliases, trigger)
  values
    (p_id, 'investigation', 1, 'duration and pattern of fever', 'core', null, 'subjective', null,
      array['days of fever','stepladder','stepwise','continuous fever','fever chart'],
      null),
    (p_id, 'investigation', 2, 'food / water exposure and prior typhoid vaccination', 'optional', null, 'subjective', null,
      array['outside food','street food','water source','typhoid vaccine','vaccinated'],
      null),
    (p_id, 'immediate_action', 3, 'blood culture sent before antibiotics', 'core', null, 'objective', null,
      array['blood culture','cultures','culture sent','c/s','bactec','salmonella typhi','s. typhi','paratyphi'],
      '{"when": [{"type": "hours_since_admission_gte", "hours": 1}], "effect": "core"}'::jsonb),
    (p_id, 'investigation', 4, 'Widal interpreted with caution — single titre, endemic baseline, prior vaccination?', 'optional', null, 'assessment', null,
      array['widal','typhidot','o titre','h titre','paired sera','typhoid igm'],
      null),
    (p_id, 'investigation', 5, 'complete blood count (leucopenia, eosinopenia)', 'core', null, 'objective', null,
      array['cbc','tlc','leucopenia','leukopenia','eosinopenia','platelets'],
      null),
    (p_id, 'investigation', 6, 'liver function', 'core', null, 'objective', 'Normal',
      array['lft','sgot','sgpt','transaminases','bilirubin'],
      null),
    (p_id, 'investigation', 7, 'relative bradycardia / hepatosplenomegaly / rose spots examined', 'optional', null, 'objective', null,
      array['relative bradycardia','pulse temperature dissociation','hepatomegaly','splenomegaly','rose spots','coated tongue'],
      null),
    (p_id, 'immediate_action', 8, 'antibiotic started, choice documented against local resistance pattern', 'core', null, 'plan', null,
      array['antibiotic started','ceftriaxone','azithromycin','empirical antibiotic'],
      '{"when": [{"type": "hours_since_admission_gte", "hours": 4}], "effect": "core"}'::jsonb),
    (p_id, 'red_flag', 9, 'intestinal perforation — sudden abdominal pain, guarding, rigidity', 'core', 'critical', 'objective', 'No peritonism',
      array['perforation','peritonitis','guarding','rigidity','free air','air under diaphragm','acute abdomen'],
      null),
    (p_id, 'red_flag', 10, 'gastrointestinal bleeding (melaena, haematochezia)', 'core', 'urgent', 'objective', 'No GI bleed',
      array['melaena','malena','haematochezia','bleeding per rectum','gi bleed','fall in haemoglobin'],
      null),
    (p_id, 'red_flag', 11, 'altered sensorium / typhoid encephalopathy', 'core', 'urgent', 'objective', 'Sensorium normal',
      array['altered sensorium','delirium','encephalopathy','drowsy','confusion'],
      null),
    (p_id, 'pathway_step', 12, 'culture sensitivity reviewed (fluoroquinolone / ceftriaxone resistance)', 'core', null, 'assessment', null,
      array['sensitivity','antibiogram','nalidixic acid resistant','ciprofloxacin resistant','mdr','xdr'],
      '{"when": [{"type": "hours_since_admission_gte", "hours": 48}], "effect": "core"}'::jsonb),
    (p_id, 'pathway_step', 13, 'fever persisting on therapy — complications or resistance reconsidered?', 'core', null, 'assessment', null,
      array['persistent fever','still spiking','not defervesced','fever trend','defervescence'],
      '{"when": [{"type": "hours_since_admission_gte", "hours": 120}]}'::jsonb),
    (p_id, 'pathway_step', 14, 'hand and food hygiene advice; typhoid vaccination for household discussed?', 'optional', null, 'plan', null,
      array['hygiene advice','hand washing','typhoid conjugate vaccine','tcv','carrier'],
      null);
end $$;

-- =============================================================================
-- 3. Malaria
-- =============================================================================
do $$
declare
  p_id uuid;
begin
  select id into p_id from company_protocols
   where title = 'Malaria — Checklist' limit 1;

  if p_id is null then
    insert into company_protocols (title, version, source_name, template_family, phase, status)
    values ('Malaria — Checklist', 'v1-draft', 'WardMate internal medicine pack',
            'malaria', 'before_surgery', 'draft')
    returning id into p_id;
  end if;

  delete from company_protocol_items where protocol_id = p_id;

  insert into company_protocol_items
    (protocol_id, kind, position, prompt, importance, severity, soap_section, normal_phrase, aliases, trigger)
  values
    (p_id, 'investigation', 1, 'peripheral smear (thick and thin) for malarial parasite', 'core', null, 'objective', null,
      array['mp smear','peripheral smear','thick smear','thin smear','malarial parasite','qbc'],
      null),
    (p_id, 'investigation', 2, 'malaria rapid diagnostic test (antigen)', 'core', null, 'objective', null,
      array['rdt','malaria antigen','bivalent rdt','pf hrp2','pldh','optimal test'],
      null),
    (p_id, 'investigation', 3, 'species identified (P. vivax / P. falciparum / mixed)', 'core', null, 'assessment', null,
      array['vivax','falciparum','pv','pf','mixed infection','species'],
      null),
    (p_id, 'investigation', 4, 'parasite density / parasitaemia', 'optional', null, 'objective', null,
      array['parasite density','parasitaemia','parasite index','ring forms','schizonts','gametocytes'],
      null),
    (p_id, 'investigation', 5, 'blood glucose', 'core', null, 'objective', null,
      array['grbs','rbs','cbg','blood sugar','hypoglycaemia'],
      null),
    (p_id, 'investigation', 6, 'CBC, renal function, bilirubin', 'core', null, 'objective', null,
      array['cbc','haemoglobin','platelets','creatinine','urea','bilirubin','lft'],
      null),
    (p_id, 'red_flag', 7, 'severe malaria — impaired consciousness or seizures', 'core', 'critical', 'objective', 'Sensorium normal, no seizures',
      array['cerebral malaria','impaired consciousness','gcs','seizure','convulsion','coma'],
      null),
    (p_id, 'red_flag', 8, 'severe malaria — respiratory distress / pulmonary oedema / shock', 'core', 'critical', 'objective', 'No respiratory distress or shock',
      array['respiratory distress','ards','pulmonary oedema','acidotic breathing','shock','hypotension','algid malaria'],
      null),
    (p_id, 'red_flag', 9, 'severe malaria — AKI, jaundice, severe anaemia, bleeding, hypoglycaemia', 'core', 'urgent', 'objective', 'No severe-malaria criteria',
      array['aki','oliguria','jaundice','severe anaemia','bleeding','dic','hypoglycaemia','blackwater','haemoglobinuria','hyperparasitaemia'],
      null),
    (p_id, 'immediate_action', 10, 'species-appropriate treatment started per national drug policy?', 'core', null, 'plan', null,
      array['act','artesunate','artemether lumefantrine','as+sp','chloroquine','antimalarial started','national drug policy'],
      '{"when": [{"type": "hours_since_admission_gte", "hours": 1}], "effect": "core"}'::jsonb),
    (p_id, 'investigation', 11, 'G6PD status checked before primaquine?', 'core', null, 'plan', null,
      array['g6pd','g6pd deficiency','g6pd screen','primaquine'],
      '{"when": [{"type": "history", "pattern": "vivax|ovale|mixed|\\bpv\\b"}], "effect": "core"}'::jsonb),
    (p_id, 'investigation', 12, 'pregnancy status in a woman of reproductive age', 'optional', null, 'assessment', null,
      array['pregnancy','upt','lmp','pregnant'],
      null),
    (p_id, 'investigation', 13, 'repeat smear for parasite clearance', 'optional', null, 'objective', null,
      array['repeat smear','parasite clearance','day 3 smear','smear negative'],
      '{"when": [{"type": "hours_since_admission_gte", "hours": 48}]}'::jsonb),
    (p_id, 'pathway_step', 14, 'case reported to the programme (NCVBDC / IDSP)?', 'optional', null, 'plan', null,
      array['notified','reported','ncvbdc','nvbdcp','idsp','ihip'],
      null);
end $$;

-- =============================================================================
-- 4. Scrub typhus
-- =============================================================================
do $$
declare
  p_id uuid;
begin
  select id into p_id from company_protocols
   where title = 'Scrub Typhus — Checklist' limit 1;

  if p_id is null then
    insert into company_protocols (title, version, source_name, template_family, phase, status)
    values ('Scrub Typhus — Checklist', 'v1-draft', 'WardMate internal medicine pack',
            'scrub_typhus', 'before_surgery', 'draft')
    returning id into p_id;
  end if;

  delete from company_protocol_items where protocol_id = p_id;

  insert into company_protocol_items
    (protocol_id, kind, position, prompt, importance, severity, soap_section, normal_phrase, aliases, trigger)
  values
    (p_id, 'investigation', 1, 'exposure history (farm work, bushes, rural stay)', 'core', null, 'subjective', null,
      array['farm work','agricultural','bushes','grass','rural','trekking','outdoor exposure'],
      null),
    (p_id, 'investigation', 2, 'eschar searched (axilla, groin, genitals, under breasts, waistline, behind ears)', 'core', null, 'objective', 'No eschar found',
      array['eschar','black scab','cigarette burn','eschar present'],
      null),
    (p_id, 'investigation', 3, 'regional lymphadenopathy / rash / hepatosplenomegaly', 'optional', null, 'objective', null,
      array['lymphadenopathy','rash','maculopapular rash','hepatomegaly','splenomegaly'],
      null),
    (p_id, 'investigation', 4, 'scrub typhus IgM ELISA sent', 'core', null, 'objective', null,
      array['scrub typhus igm','scrub igm','igm elisa','orientia','scrub pcr'],
      null),
    (p_id, 'investigation', 5, 'Weil-Felix, if done, interpreted with caution (low sensitivity)', 'optional', null, 'assessment', null,
      array['weil felix','ox-k','oxk','ox-2','ox-19'],
      null),
    (p_id, 'investigation', 6, 'co-infections tested (dengue, malaria, leptospirosis, enteric)', 'optional', null, 'objective', null,
      array['ns1','dengue serology','mp smear','malaria antigen','leptospira igm','widal'],
      null),
    (p_id, 'investigation', 7, 'CBC, liver and renal function', 'core', null, 'objective', null,
      array['cbc','platelets','lft','sgot','sgpt','creatinine','urea'],
      null),
    (p_id, 'immediate_action', 8, 'empirical anti-rickettsial started without waiting for serology?', 'core', null, 'plan', null,
      array['doxycycline','azithromycin','anti-rickettsial','empirical doxycycline'],
      '{"when": [{"type": "hours_since_admission_gte", "hours": 4}], "effect": "core"}'::jsonb),
    (p_id, 'investigation', 9, 'chest X-ray if respiratory symptoms', 'optional', null, 'objective', null,
      array['chest x-ray','cxr','infiltrates','ards'],
      '{"when": [{"type": "history", "pattern": "cough|breathless|dyspn|tachypn|desaturat|hypoxi"}], "effect": "core"}'::jsonb),
    (p_id, 'red_flag', 10, 'respiratory distress / ARDS', 'core', 'critical', 'objective', 'No respiratory distress',
      array['ards','hypoxia','desaturation','respiratory distress','pneumonitis'],
      null),
    (p_id, 'red_flag', 11, 'altered sensorium / meningoencephalitis', 'core', 'critical', 'objective', 'Sensorium normal',
      array['altered sensorium','meningoencephalitis','neck stiffness','seizure','gcs'],
      null),
    (p_id, 'red_flag', 12, 'shock / myocarditis', 'core', 'critical', 'objective', 'Haemodynamically stable',
      array['shock','hypotension','myocarditis','arrhythmia','raised troponin'],
      null),
    (p_id, 'red_flag', 13, 'AKI / oliguria', 'core', 'urgent', 'objective', 'Passing adequate urine',
      array['aki','oliguria','rising creatinine','low urine output'],
      null),
    (p_id, 'pathway_step', 14, 'defervescence within 48 hours of therapy? if not, diagnosis reconsidered', 'core', null, 'assessment', null,
      array['afebrile','defervesced','fever settled','still spiking','fever trend'],
      '{"when": [{"type": "hours_since_admission_gte", "hours": 48}], "effect": "core"}'::jsonb);
end $$;

-- =============================================================================
-- 5. Community-acquired pneumonia (also used by the pulmonary unit)
-- =============================================================================
do $$
declare
  p_id uuid;
begin
  select id into p_id from company_protocols
   where title = 'Community-Acquired Pneumonia — Checklist' limit 1;

  if p_id is null then
    insert into company_protocols (title, version, source_name, template_family, phase, status)
    values ('Community-Acquired Pneumonia — Checklist', 'v1-draft', 'WardMate internal medicine pack',
            'cap', 'before_surgery', 'draft')
    returning id into p_id;
  end if;

  delete from company_protocol_items where protocol_id = p_id;

  insert into company_protocol_items
    (protocol_id, kind, position, prompt, importance, severity, soap_section, normal_phrase, aliases, trigger)
  values
    (p_id, 'investigation', 1, 'CURB-65 recorded', 'core', null, 'assessment', null,
      array['curb-65','curb65','curb 65','crb-65','psi','severity score'],
      null),
    (p_id, 'investigation', 2, 'SpO2 on room air and oxygen requirement', 'core', null, 'objective', null,
      array['spo2','saturation','room air','oxygen requirement','nasal prongs','face mask','hypoxia'],
      null),
    (p_id, 'investigation', 3, 'chest X-ray', 'core', null, 'objective', null,
      array['chest x-ray','cxr','consolidation','infiltrate','air bronchogram','lobar pneumonia'],
      null),
    (p_id, 'investigation', 4, 'sputum Gram stain and culture', 'core', null, 'objective', null,
      array['sputum culture','sputum gram stain','sputum c/s','sputum sent'],
      null),
    (p_id, 'immediate_action', 5, 'blood cultures sent before antibiotics', 'core', null, 'objective', null,
      array['blood culture','cultures','culture sent','c/s','bactec'],
      '{"when": [{"type": "hours_since_admission_gte", "hours": 1}], "effect": "core"}'::jsonb),
    (p_id, 'immediate_action', 6, 'first antibiotic given within 4 hours of admission?', 'core', null, 'plan', null,
      array['antibiotic started','first dose','empirical antibiotic','ceftriaxone','azithromycin','amoxicillin clavulanate'],
      '{"when": [{"type": "hours_since_admission_gte", "hours": 4}], "effect": "core"}'::jsonb),
    (p_id, 'investigation', 7, 'CBC, urea, creatinine and electrolytes', 'core', null, 'objective', null,
      array['cbc','tlc','urea','bun','creatinine','sodium','electrolytes'],
      null),
    (p_id, 'investigation', 8, 'sputum CBNAAT / AFB if cough over 2 weeks or TB symptoms?', 'optional', null, 'objective', null,
      array['cbnaat','genexpert','xpert','truenat','afb','sputum afb'],
      '{"when": [{"type": "history", "pattern": "2 weeks|two weeks|chronic cough|weight loss|night sweat|haemoptysis|hemoptysis|past tb|tuberculosis"}], "effect": "core"}'::jsonb),
    (p_id, 'investigation', 9, 'influenza / SARS-CoV-2 testing considered in season?', 'optional', null, 'objective', null,
      array['influenza','h1n1','covid','sars-cov-2','rt-pcr','throat swab'],
      null),
    (p_id, 'red_flag', 10, 'hypoxia despite oxygen / rising work of breathing', 'core', 'critical', 'objective', 'No respiratory distress',
      array['respiratory failure','hypoxia','rising oxygen requirement','accessory muscles','tachypnoea','niv','hfnc'],
      null),
    (p_id, 'red_flag', 11, 'hypotension / septic shock', 'core', 'critical', 'objective', 'Haemodynamically stable',
      array['septic shock','hypotension','vasopressor','noradrenaline'],
      null),
    (p_id, 'red_flag', 12, 'parapneumonic effusion / empyema', 'core', 'urgent', 'objective', 'No effusion',
      array['pleural effusion','parapneumonic effusion','empyema','pleural tap','icd'],
      null),
    (p_id, 'pathway_step', 13, 'clinical stability reviewed — switch to oral antibiotic?', 'core', null, 'assessment', null,
      array['clinically stable','afebrile','iv to oral','oral switch','step down'],
      '{"when": [{"type": "hours_since_admission_gte", "hours": 48}], "effect": "core"}'::jsonb),
    (p_id, 'pathway_step', 14, 'pneumococcal and influenza vaccination offered at discharge?', 'optional', null, 'plan', null,
      array['pneumococcal vaccine','pcv','ppsv23','influenza vaccine','flu vaccine','vaccination'],
      '{"when": [{"type": "hours_since_admission_gte", "hours": 48}]}'::jsonb),
    (p_id, 'pathway_step', 15, 'smoking cessation advice given?', 'optional', null, 'plan', null,
      array['smoking cessation','quit smoking','tobacco cessation'],
      '{"when": [{"type": "history", "pattern": "smok|bidi|cigarette|tobacco"}], "effect": "core"}'::jsonb);
end $$;

-- =============================================================================
-- 6. Acute pyelonephritis / complicated UTI
-- =============================================================================
do $$
declare
  p_id uuid;
begin
  select id into p_id from company_protocols
   where title = 'Pyelonephritis — Checklist' limit 1;

  if p_id is null then
    insert into company_protocols (title, version, source_name, template_family, phase, status)
    values ('Pyelonephritis — Checklist', 'v1-draft', 'WardMate internal medicine pack',
            'pyelonephritis', 'before_surgery', 'draft')
    returning id into p_id;
  end if;

  delete from company_protocol_items where protocol_id = p_id;

  insert into company_protocol_items
    (protocol_id, kind, position, prompt, importance, severity, soap_section, normal_phrase, aliases, trigger)
  values
    (p_id, 'investigation', 1, 'recent catheterisation / instrumentation / recurrent UTI', 'optional', null, 'subjective', null,
      array['catheter','instrumentation','recurrent uti','stones','dj stent','prostate'],
      null),
    (p_id, 'investigation', 2, 'urine routine and microscopy', 'core', null, 'objective', null,
      array['urine routine','urinalysis','pus cells','nitrite','leucocyte esterase','urine microscopy'],
      null),
    (p_id, 'immediate_action', 3, 'urine culture sent before antibiotics', 'core', null, 'objective', null,
      array['urine culture','urine c/s','midstream urine','msu culture'],
      '{"when": [{"type": "hours_since_admission_gte", "hours": 1}], "effect": "core"}'::jsonb),
    (p_id, 'investigation', 4, 'blood cultures if febrile with rigors or septic', 'optional', null, 'objective', null,
      array['blood culture','cultures','bactec'],
      '{"when": [{"type": "history", "pattern": "rigor|chill|hypotens|sepsis|shock"}], "effect": "core"}'::jsonb),
    (p_id, 'investigation', 5, 'renal function and electrolytes', 'core', null, 'objective', null,
      array['creatinine','urea','electrolytes','egfr','potassium'],
      null),
    (p_id, 'investigation', 6, 'blood glucose / diabetes status', 'core', null, 'objective', null,
      array['grbs','rbs','blood sugar','hba1c','diabetes'],
      null),
    (p_id, 'investigation', 7, 'pregnancy status in a woman of reproductive age', 'optional', null, 'assessment', null,
      array['pregnancy','upt','lmp','pregnant'],
      null),
    (p_id, 'investigation', 8, 'ultrasound KUB (obstruction, abscess)', 'core', null, 'objective', null,
      array['usg kub','ultrasound','hydronephrosis','renal abscess','calculus','obstruction'],
      null),
    (p_id, 'red_flag', 9, 'obstructed infected kidney — urology review for drainage?', 'core', 'critical', 'assessment', 'No obstruction',
      array['obstruction','hydronephrosis','pyonephrosis','pcn','dj stent','urology review'],
      null),
    (p_id, 'red_flag', 10, 'sepsis / hypotension', 'core', 'critical', 'objective', 'Haemodynamically stable',
      array['urosepsis','septic shock','hypotension','qsofa'],
      null),
    (p_id, 'red_flag', 11, 'gas in the kidney (emphysematous pyelonephritis)', 'core', 'critical', 'objective', 'No gas on imaging',
      array['emphysematous pyelonephritis','gas in kidney','epn','ct kub'],
      '{"when": [{"type": "history", "pattern": "diabet|dm|t2dm|hba1c|hyperglyc"}]}'::jsonb),
    (p_id, 'pathway_step', 12, 'antibiotic reviewed against culture sensitivity', 'core', null, 'assessment', null,
      array['sensitivity','culture result','de-escalation','esbl','antibiogram'],
      '{"when": [{"type": "hours_since_admission_gte", "hours": 48}], "effect": "core"}'::jsonb),
    (p_id, 'pathway_step', 13, 'no response at 72 hours — CT for abscess or obstruction?', 'core', null, 'plan', null,
      array['ct kub','cect abdomen','persistent fever','renal abscess','perinephric abscess'],
      '{"when": [{"type": "hours_since_admission_gte", "hours": 72}]}'::jsonb);
end $$;

-- =============================================================================
-- 7. Cellulitis / soft-tissue infection
-- =============================================================================
do $$
declare
  p_id uuid;
begin
  select id into p_id from company_protocols
   where title = 'Cellulitis — Checklist' limit 1;

  if p_id is null then
    insert into company_protocols (title, version, source_name, template_family, phase, status)
    values ('Cellulitis — Checklist', 'v1-draft', 'WardMate internal medicine pack',
            'cellulitis', 'before_surgery', 'draft')
    returning id into p_id;
  end if;

  delete from company_protocol_items where protocol_id = p_id;

  insert into company_protocol_items
    (protocol_id, kind, position, prompt, importance, severity, soap_section, normal_phrase, aliases, trigger)
  values
    (p_id, 'investigation', 1, 'portal of entry (tinea pedis, ulcer, trauma, bite)', 'core', null, 'subjective', null,
      array['portal of entry','tinea pedis','interdigital','ulcer','trauma','insect bite','cracked heel'],
      null),
    (p_id, 'immediate_action', 2, 'erythema margin marked with date and time', 'core', null, 'objective', null,
      array['margin marked','marked margin','erythema margin','extent of erythema'],
      null),
    (p_id, 'investigation', 3, 'blood glucose / diabetes status', 'core', null, 'objective', null,
      array['grbs','rbs','blood sugar','hba1c','diabetes'],
      null),
    (p_id, 'investigation', 4, 'CBC and renal function', 'core', null, 'objective', null,
      array['cbc','tlc','creatinine','urea'],
      null),
    (p_id, 'investigation', 5, 'blood culture if systemically unwell', 'optional', null, 'objective', null,
      array['blood culture','cultures','bactec'],
      '{"when": [{"type": "history", "pattern": "rigor|chill|hypotens|sepsis|shock|high grade"}], "effect": "core"}'::jsonb),
    (p_id, 'investigation', 6, 'venous Doppler if DVT cannot be excluded', 'optional', null, 'objective', null,
      array['venous doppler','doppler','dvt','compression ultrasound'],
      '{"when": [{"type": "history", "pattern": "calf|unilateral (leg|limb) swelling|immobil|dvt"}]}'::jsonb),
    (p_id, 'red_flag', 7, 'pain out of proportion, crepitus, bullae, skin necrosis — necrotising fasciitis?', 'core', 'critical', 'objective', 'No features of necrotising infection',
      array['necrotising fasciitis','crepitus','bullae','skin necrosis','pain out of proportion','gas gangrene','lrinec'],
      null),
    (p_id, 'red_flag', 8, 'sepsis — hypotension, tachycardia, altered sensorium', 'core', 'critical', 'objective', 'Haemodynamically stable',
      array['sepsis','septic shock','hypotension','tachycardia','qsofa'],
      null),
    (p_id, 'red_flag', 9, 'abscess / collection — drainage needed?', 'core', 'urgent', 'objective', 'No collection',
      array['abscess','fluctuation','collection','pus','incision and drainage','i&d','usg local part'],
      null),
    (p_id, 'pathway_step', 10, 'limb elevation', 'core', null, 'plan', null,
      array['limb elevation','elevation','leg elevated'],
      null),
    (p_id, 'pathway_step', 11, 'spread of margin reviewed at 48 hours', 'core', null, 'assessment', null,
      array['margin receding','margin spreading','erythema reducing','response','spreading'],
      '{"when": [{"type": "hours_since_admission_gte", "hours": 48}], "effect": "core"}'::jsonb),
    (p_id, 'pathway_step', 12, 'predisposing factor addressed at discharge (foot care, tinea, oedema)?', 'optional', null, 'plan', null,
      array['foot care','antifungal','tinea treatment','compression','lymphoedema','footwear'],
      '{"when": [{"type": "hours_since_admission_gte", "hours": 48}]}'::jsonb);
end $$;

-- =============================================================================
-- 8. Pulmonary tuberculosis — NTEP (also used by the pulmonary unit)
-- =============================================================================
do $$
declare
  p_id uuid;
begin
  select id into p_id from company_protocols
   where title = 'Pulmonary Tuberculosis — NTEP Checklist' limit 1;

  if p_id is null then
    insert into company_protocols (title, version, source_name, template_family, phase, status)
    values ('Pulmonary Tuberculosis — NTEP Checklist', 'v1-draft', 'WardMate internal medicine pack',
            'pulmonary_tb', 'before_surgery', 'draft')
    returning id into p_id;
  end if;

  delete from company_protocol_items where protocol_id = p_id;

  insert into company_protocol_items
    (protocol_id, kind, position, prompt, importance, severity, soap_section, normal_phrase, aliases, trigger)
  values
    (p_id, 'investigation', 1, 'sputum NAAT (CBNAAT / Truenat) sent', 'core', null, 'objective', null,
      array['cbnaat','genexpert','xpert','truenat','naat','mtb detected','mtb not detected'],
      null),
    (p_id, 'investigation', 2, 'rifampicin resistance result recorded', 'core', null, 'assessment', null,
      array['rif resistance','rifampicin resistance','rr-tb','rif sensitive','rif not detected','line probe assay','lpa'],
      '{"when": [{"type": "item_present", "label": "cbnaat"}], "effect": "core"}'::jsonb),
    (p_id, 'investigation', 3, 'sputum smear microscopy for AFB', 'optional', null, 'objective', null,
      array['sputum afb','afb smear','zn stain','smear positive','smear negative'],
      null),
    (p_id, 'investigation', 4, 'chest X-ray', 'core', null, 'objective', null,
      array['chest x-ray','cxr','cavity','upper lobe','fibrocavitary','miliary'],
      null),
    (p_id, 'investigation', 5, 'HIV test offered', 'core', null, 'plan', null,
      array['hiv','retroviral','hiv rapid','ictc'],
      null),
    (p_id, 'investigation', 6, 'diabetes screened (blood glucose / HbA1c)', 'core', null, 'objective', null,
      array['rbs','fbs','hba1c','blood sugar','diabetes'],
      null),
    (p_id, 'investigation', 7, 'baseline liver and renal function', 'core', null, 'objective', null,
      array['lft','sgot','sgpt','bilirubin','creatinine','urea'],
      null),
    (p_id, 'investigation', 8, 'weight recorded (for weight-band treatment)', 'core', null, 'objective', null,
      array['weight','body weight','weight band','bmi'],
      null),
    (p_id, 'pathway_step', 9, 'notified on Ni-kshay?', 'core', null, 'plan', null,
      array['nikshay','ni-kshay','notified','tb notification','nikshay id'],
      '{"when": [{"type": "hours_since_admission_gte", "hours": 24}], "effect": "core"}'::jsonb),
    (p_id, 'pathway_step', 10, 'airborne infection control (mask, cough etiquette, ventilated bed)', 'core', null, 'plan', null,
      array['airborne precautions','n95','mask','cough etiquette','isolation','respiratory isolation'],
      null),
    (p_id, 'pathway_step', 11, 'household contacts listed for screening and TB preventive therapy', 'core', null, 'plan', null,
      array['contact tracing','household contacts','tpt','preventive therapy','children under 5'],
      null),
    (p_id, 'pathway_step', 12, 'linked to treatment supporter and Ni-kshay Poshan Yojana?', 'optional', null, 'plan', null,
      array['treatment supporter','dot','nikshay poshan yojana','npy','nutrition support','dbt'],
      null),
    (p_id, 'red_flag', 13, 'massive haemoptysis', 'core', 'critical', 'objective', 'No haemoptysis',
      array['haemoptysis','hemoptysis','massive haemoptysis','blood in sputum'],
      null),
    (p_id, 'red_flag', 14, 'respiratory failure / hypoxia', 'core', 'critical', 'objective', 'No respiratory distress',
      array['hypoxia','desaturation','respiratory failure','spo2','pneumothorax'],
      null),
    (p_id, 'red_flag', 15, 'drug-induced hepatitis on treatment (jaundice, vomiting, rising transaminases)', 'core', 'urgent', 'objective', 'No features of hepatotoxicity',
      array['dili','drug induced hepatitis','att hepatitis','jaundice','vomiting','raised transaminases'],
      '{"when": [{"type": "history", "pattern": "\\batt\\b|\\bakt\\b|hrze|anti-?tubercular|on treatment"}], "effect": "core"}'::jsonb);
end $$;

-- =============================================================================
-- 9. Acute febrile encephalopathy (AES)
-- =============================================================================
do $$
declare
  p_id uuid;
begin
  select id into p_id from company_protocols
   where title = 'Acute Febrile Encephalopathy — Checklist' limit 1;

  if p_id is null then
    insert into company_protocols (title, version, source_name, template_family, phase, status)
    values ('Acute Febrile Encephalopathy — Checklist', 'v1-draft', 'WardMate internal medicine pack',
            'acute_febrile_encephalopathy', 'before_surgery', 'draft')
    returning id into p_id;
  end if;

  delete from company_protocol_items where protocol_id = p_id;

  insert into company_protocol_items
    (protocol_id, kind, position, prompt, importance, severity, soap_section, normal_phrase, aliases, trigger)
  values
    (p_id, 'investigation', 1, 'GCS recorded', 'core', null, 'objective', null,
      array['gcs','glasgow coma scale','e v m','sensorium'],
      null),
    (p_id, 'immediate_action', 2, 'airway protected — intubation considered for GCS 8 or below?', 'core', null, 'plan', null,
      array['airway','intubation','intubated','ett','ventilator','airway protection'],
      '{"when": [{"type": "lab", "analyte": "gcs", "op": "lte", "value": 8}], "effect": "core"}'::jsonb),
    (p_id, 'investigation', 3, 'blood glucose', 'core', null, 'objective', null,
      array['grbs','rbs','cbg','blood sugar','hypoglycaemia'],
      null),
    (p_id, 'investigation', 4, 'meningeal signs and focal neurological deficit', 'core', null, 'objective', null,
      array['neck stiffness','kernig','brudzinski','meningeal signs','focal deficit','hemiparesis','cranial nerve palsy'],
      null),
    (p_id, 'investigation', 5, 'fundus examined before lumbar puncture', 'core', null, 'objective', 'No papilloedema',
      array['fundus','fundoscopy','papilloedema','disc edema'],
      null),
    (p_id, 'investigation', 6, 'CT / MRI brain before LP if focal signs, papilloedema or low GCS', 'core', null, 'objective', null,
      array['ct brain','ncct head','mri brain','neuroimaging','thalamic','temporal lobe'],
      null),
    (p_id, 'investigation', 7, 'lumbar puncture once safe — CSF cells, protein, sugar, Gram stain, culture', 'core', null, 'objective', null,
      array['lp','lumbar puncture','csf','csf analysis','csf protein','csf sugar','csf culture'],
      null),
    (p_id, 'investigation', 8, 'CSF HSV PCR', 'core', null, 'objective', null,
      array['hsv pcr','herpes pcr','csf pcr','meningitis encephalitis panel'],
      null),
    (p_id, 'investigation', 9, 'aetiology panel — JE IgM (serum / CSF), dengue, malaria, scrub typhus, leptospirosis', 'core', null, 'objective', null,
      array['je igm','japanese encephalitis','ns1','dengue serology','mp smear','malaria antigen','scrub typhus igm','leptospira'],
      null),
    (p_id, 'immediate_action', 10, 'blood cultures sent before antibiotics', 'core', null, 'objective', null,
      array['blood culture','cultures','bactec'],
      '{"when": [{"type": "hours_since_admission_gte", "hours": 1}], "effect": "core"}'::jsonb),
    (p_id, 'immediate_action', 11, 'empirical antibiotic and acyclovir started without waiting for LP?', 'core', null, 'plan', null,
      array['acyclovir','aciclovir','ceftriaxone','empirical antibiotic','doxycycline'],
      '{"when": [{"type": "hours_since_admission_gte", "hours": 1}], "effect": "core"}'::jsonb),
    (p_id, 'investigation', 12, 'sodium, renal and liver function', 'core', null, 'objective', null,
      array['sodium','hyponatraemia','creatinine','urea','lft','ammonia'],
      null),
    (p_id, 'red_flag', 13, 'raised intracranial pressure / herniation signs', 'core', 'critical', 'objective', 'No signs of raised ICP',
      array['raised icp','herniation','unequal pupils','cushing reflex','bradycardia hypertension','decerebrate','decorticate'],
      null),
    (p_id, 'red_flag', 14, 'seizures / status epilepticus', 'core', 'urgent', 'objective', 'No seizures',
      array['seizure','convulsion','status epilepticus','fits'],
      null),
    (p_id, 'pathway_step', 15, 'AES case notified (NCVBDC / IDSP)?', 'optional', null, 'plan', null,
      array['notified','aes notification','ncvbdc','nvbdcp','idsp','ihip'],
      null);
end $$;

commit;
