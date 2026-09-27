-- Ward checklists for four medical-style departments: dermatology, psychiatry, paediatrics and
-- emergency medicine. Seventeen protocols (company_protocols + company_protocol_items) and one
-- care_templates picker row for each family.
--
--   dermatology:        sjs_ten, autoimmune_blistering, erythroderma, leprosy_reaction
--   psychiatry:         acute_psychosis, alcohol_withdrawal, suicide_risk, mania
--   paediatrics:        paediatric_pneumonia, paediatric_dehydration, neonatal_sepsis,
--                       febrile_seizure, severe_acute_malnutrition
--   emergency_medicine: polytrauma, poisoning, snakebite, heat_illness
--
-- Same shape as 0061 / 0064 / 0067. phase = 'before_surgery' because lib/templates.ts
-- phaseFor() computes that for every patient with no operation date, and each pack's
-- pickerPhase offers the same rows (see 0061's header for the full reasoning).
--
-- CONTENT RULES. No drug or fluid dose or volume anywhere, and never a paediatric dose. Items
-- name what the round should have covered; a treatment decision (e.g. ASV) is a question for
-- the clinician, never an instruction. Triggers only where time is the point (a 6-hourly
-- CIWA-Ar, a repeat 20WBCT, a 24-hour tertiary survey).
--
-- CLINICAL CONTENT: PENDING CLINICIAN REVIEW — seeded as draft; a later patch publishes it.
--
-- Requires: 0004, 0026, 0032, 0036, 0040, 0056, 0058, 0060.
-- Safe to run more than once — it rewrites the item set for a protocol of the same title.

begin;

-- =============================================================================
-- DERMATOLOGY
-- =============================================================================

-- 1. SJS / TEN
do $$
declare
  p_id uuid;
begin
  select id into p_id from company_protocols
   where title = 'SJS / TEN — Admission Checklist' limit 1;

  if p_id is null then
    insert into company_protocols (title, version, source_name, template_family, phase, status)
    values ('SJS / TEN — Admission Checklist', 'v1-draft', 'WardMate dermatology pack',
            'sjs_ten', 'before_surgery', 'draft')
    returning id into p_id;
  end if;

  delete from company_protocol_items where protocol_id = p_id;

  insert into company_protocol_items
    (protocol_id, kind, severity, position, prompt, importance, soap_section, normal_phrase, aliases, trigger)
  values
    (p_id, 'immediate_action', null, 1, 'suspected culprit drug identified and stopped', 'core', 'plan', null,
      array['culprit drug','offending drug','drug stopped','drug timeline','anticonvulsant','allopurinol','sulfa','nevirapine'], null),
    (p_id, 'investigation', null, 2, 'body surface area of epidermal detachment', 'core', 'objective', null,
      array['bsa','detachment','percent bsa','skin detachment','nikolsky'], null),
    (p_id, 'investigation', null, 3, 'mucosal sites involved (eyes, oral, genital)', 'core', 'objective', null,
      array['mucosa','oral erosions','conjunctivitis','genital erosions','mucosal involvement'], null),
    (p_id, 'investigation', null, 4, 'SCORTEN calculated', 'core', 'assessment', null,
      array['scorten','severity score'],
      '{"when": [{"type": "hours_since_admission_gte", "hours": 24}], "effect": "core"}'::jsonb),
    (p_id, 'pathway_step', null, 5, 'ophthalmology review for eye involvement', 'core', 'plan', null,
      array['ophthalmology','eye review','eye care','symblepharon'], null),
    (p_id, 'investigation', null, 6, 'fluid balance and urine output', 'core', 'checks', 'Adequate urine output',
      array['intake output','urine output','fluid balance','i/o chart'], null),
    (p_id, 'investigation', null, 7, 'renal function, electrolytes, glucose', 'core', 'objective', null,
      array['creatinine','urea','sodium','potassium','bicarbonate','blood sugar'], null),
    (p_id, 'investigation', null, 8, 'skin swabs and blood culture if febrile', 'core', 'objective', null,
      array['skin swab','blood culture','culture','sepsis screen'], null),
    (p_id, 'pathway_step', null, 9, 'barrier nursing and non-adherent dressings', 'core', 'plan', null,
      array['barrier nursing','dressings','skin care','isolation','warm room'], null),
    (p_id, 'investigation', null, 10, 'oral intake and nutrition', 'core', 'subjective', 'Tolerating orally',
      array['oral intake','feeding','nutrition','ryles tube','dysphagia'], null),
    (p_id, 'investigation', null, 11, 'pain score', 'optional', 'subjective', 'Pain controlled',
      array['pain','analgesia','pain score'], null),
    (p_id, 'red_flag', 'critical', 12, 'signs of sepsis or shock', 'core', 'assessment', 'No signs of sepsis',
      array['sepsis','hypotension','tachycardia','fever','shock'], null),
    (p_id, 'red_flag', 'urgent', 13, 'respiratory or airway mucosal involvement', 'core', 'assessment', null,
      array['respiratory distress','hypoxia','spo2','bronchial involvement','stridor'], null);
end $$;

-- 2. Autoimmune blistering disease (pemphigus / pemphigoid)
do $$
declare
  p_id uuid;
begin
  select id into p_id from company_protocols
   where title = 'Autoimmune Blistering Disease — Checklist' limit 1;

  if p_id is null then
    insert into company_protocols (title, version, source_name, template_family, phase, status)
    values ('Autoimmune Blistering Disease — Checklist', 'v1-draft', 'WardMate dermatology pack',
            'autoimmune_blistering', 'before_surgery', 'draft')
    returning id into p_id;
  end if;

  delete from company_protocol_items where protocol_id = p_id;

  insert into company_protocol_items
    (protocol_id, kind, severity, position, prompt, importance, soap_section, normal_phrase, aliases, trigger)
  values
    (p_id, 'investigation', null, 1, 'type of blister (flaccid / tense) and Nikolsky sign', 'core', 'objective', null,
      array['flaccid bullae','tense bullae','nikolsky','asboe-hansen','pemphigus','pemphigoid'], null),
    (p_id, 'investigation', null, 2, 'body surface area involved', 'core', 'objective', null,
      array['bsa','extent','erosions','percent bsa'], null),
    (p_id, 'investigation', null, 3, 'new blisters since last review', 'core', 'objective', 'No new blisters',
      array['new blisters','new lesions','disease activity','fresh bullae'], null),
    (p_id, 'investigation', null, 4, 'mucosal involvement', 'core', 'objective', 'No mucosal involvement',
      array['oral erosions','mucosa','oral ulcers','genital erosions','conjunctiva'], null),
    (p_id, 'investigation', null, 5, 'skin biopsy for histopathology and direct immunofluorescence', 'core', 'plan', null,
      array['biopsy','hpe','dif','direct immunofluorescence','tzanck'], null),
    (p_id, 'investigation', null, 6, 'serology sent (desmoglein / BP180 / BP230)', 'optional', 'objective', null,
      array['desmoglein','dsg1','dsg3','bp180','bp230','elisa','iif'], null),
    (p_id, 'investigation', null, 7, 'screening before immunosuppression (HBsAg, HCV, HIV, chest X-ray, TB)', 'core', 'objective', null,
      array['hbsag','hcv','hiv','viral markers','chest x-ray','tb screen','mantoux','igra'], null),
    (p_id, 'investigation', null, 8, 'blood glucose and blood pressure monitoring on steroids', 'core', 'checks', 'Within target',
      array['blood sugar','grbs','bp','steroid monitoring'],
      '{"when": [{"type": "history", "pattern": "steroid|prednisolone|dexamethasone|methylpred|pulse"}], "effect": "core"}'::jsonb),
    (p_id, 'investigation', null, 9, 'fluid balance, electrolytes and albumin', 'core', 'objective', null,
      array['intake output','sodium','potassium','albumin','protein loss'], null),
    (p_id, 'investigation', null, 10, 'oral intake and nutrition', 'core', 'subjective', 'Tolerating orally',
      array['oral intake','feeding','nutrition','odynophagia'], null),
    (p_id, 'red_flag', 'urgent', 11, 'secondary infection of erosions', 'core', 'assessment', 'No secondary infection',
      array['secondary infection','pus','crusting','impetiginisation','herpes','eczema herpeticum'], null),
    (p_id, 'red_flag', 'critical', 12, 'signs of sepsis', 'core', 'assessment', 'No signs of sepsis',
      array['sepsis','fever','hypotension','tachycardia'], null);
end $$;

-- 3. Erythroderma
do $$
declare
  p_id uuid;
begin
  select id into p_id from company_protocols
   where title = 'Erythroderma — Checklist' limit 1;

  if p_id is null then
    insert into company_protocols (title, version, source_name, template_family, phase, status)
    values ('Erythroderma — Checklist', 'v1-draft', 'WardMate dermatology pack',
            'erythroderma', 'before_surgery', 'draft')
    returning id into p_id;
  end if;

  delete from company_protocol_items where protocol_id = p_id;

  insert into company_protocol_items
    (protocol_id, kind, severity, position, prompt, importance, soap_section, normal_phrase, aliases, trigger)
  values
    (p_id, 'investigation', null, 1, 'underlying cause considered (psoriasis, eczema, drug, lymphoma, idiopathic)', 'core', 'assessment', null,
      array['cause','psoriasis','eczema','drug reaction','ctcl','sezary','pityriasis rubra pilaris'], null),
    (p_id, 'investigation', null, 2, 'drug history including recent new drugs and stopped steroids', 'core', 'subjective', null,
      array['drug history','new drug','steroid withdrawal','methotrexate stopped'], null),
    (p_id, 'investigation', null, 3, 'body surface area of erythema and scaling', 'core', 'objective', null,
      array['bsa','erythema','scaling','percent bsa'], null),
    (p_id, 'investigation', null, 4, 'temperature, including hypothermia', 'core', 'checks', 'Normothermic',
      array['temperature','hypothermia','fever','thermoregulation'], null),
    (p_id, 'investigation', null, 5, 'fluid balance and urine output', 'core', 'checks', 'Adequate urine output',
      array['intake output','urine output','dehydration','fluid balance'], null),
    (p_id, 'investigation', null, 6, 'electrolytes, renal function and albumin', 'core', 'objective', null,
      array['sodium','potassium','creatinine','albumin','hypoalbuminaemia'], null),
    (p_id, 'investigation', null, 7, 'lymph nodes and organomegaly examined', 'core', 'objective', 'No lymphadenopathy',
      array['lymphadenopathy','lymph nodes','hepatosplenomegaly','organomegaly'], null),
    (p_id, 'investigation', null, 8, 'skin biopsy', 'optional', 'plan', null,
      array['biopsy','hpe','histopathology'], null),
    (p_id, 'investigation', null, 9, 'peripheral smear for atypical cells', 'optional', 'objective', null,
      array['peripheral smear','sezary cells','atypical lymphocytes','eosinophils'], null),
    (p_id, 'pathway_step', null, 10, 'emollients and skin care', 'core', 'plan', null,
      array['emollients','liquid paraffin','skin care','bland care'], null),
    (p_id, 'investigation', null, 11, 'pruritus and sleep', 'optional', 'subjective', null,
      array['itching','pruritus','sleep'], null),
    (p_id, 'red_flag', 'urgent', 12, 'high-output cardiac failure', 'core', 'assessment', 'No features of cardiac failure',
      array['breathlessness','pedal oedema','raised jvp','tachycardia','heart failure'], null),
    (p_id, 'red_flag', 'critical', 13, 'signs of sepsis', 'core', 'assessment', 'No signs of sepsis',
      array['sepsis','fever','hypotension','rigors'], null);
end $$;

-- 4. Leprosy reaction
do $$
declare
  p_id uuid;
begin
  select id into p_id from company_protocols
   where title = 'Leprosy Reaction — Checklist' limit 1;

  if p_id is null then
    insert into company_protocols (title, version, source_name, template_family, phase, status)
    values ('Leprosy Reaction — Checklist', 'v1-draft', 'WardMate dermatology pack',
            'leprosy_reaction', 'before_surgery', 'draft')
    returning id into p_id;
  end if;

  delete from company_protocol_items where protocol_id = p_id;

  insert into company_protocol_items
    (protocol_id, kind, severity, position, prompt, importance, soap_section, normal_phrase, aliases, trigger)
  values
    (p_id, 'investigation', null, 1, 'type of reaction (type 1 reversal / type 2 ENL)', 'core', 'assessment', null,
      array['type 1 reaction','reversal reaction','type 2 reaction','enl','erythema nodosum leprosum','lucio'], null),
    (p_id, 'investigation', null, 2, 'leprosy classification (PB / MB) and MDT status', 'core', 'subjective', null,
      array['paucibacillary','multibacillary','mdt','mdt status','months of mdt','rfm'], null),
    (p_id, 'investigation', null, 3, 'MDT continued during the reaction', 'core', 'plan', null,
      array['mdt continued','continue mdt'], null),
    (p_id, 'investigation', null, 4, 'peripheral nerves palpated for thickening and tenderness', 'core', 'objective', null,
      array['nerve thickening','nerve tenderness','ulnar nerve','common peroneal','posterior tibial','neuritis'], null),
    (p_id, 'investigation', null, 5, 'voluntary muscle testing and sensory testing (VMT / ST)', 'core', 'objective', null,
      array['vmt','st','sensory testing','monofilament','muscle testing','nerve function assessment'], null),
    (p_id, 'investigation', null, 6, 'eyes examined (lagophthalmos, iritis, corneal sensation)', 'core', 'objective', 'Eyes normal',
      array['lagophthalmos','iritis','red eye','corneal sensation','eye'], null),
    (p_id, 'investigation', null, 7, 'systemic features of ENL (fever, joint pain, orchitis, lymphadenitis)', 'core', 'objective', null,
      array['fever','arthritis','orchitis','lymphadenitis','malaise'], null),
    (p_id, 'investigation', null, 8, 'WHO disability grade recorded', 'core', 'assessment', null,
      array['disability grade','who grade','grade 0','grade 1','grade 2'], null),
    (p_id, 'investigation', null, 9, 'screening before steroids (glucose, blood pressure, TB, strongyloides risk)', 'core', 'objective', null,
      array['blood sugar','bp','tb screen','stool','strongyloides'], null),
    (p_id, 'pathway_step', null, 10, 'protection of anaesthetic hands and feet counselled', 'optional', 'plan', null,
      array['self care','footwear','mcr footwear','hand care','ulcer prevention'], null),
    (p_id, 'red_flag', 'urgent', 11, 'new nerve function impairment (weakness or sensory loss within six months)', 'core', 'assessment', 'No new nerve function impairment',
      array['new weakness','new sensory loss','claw hand','foot drop','nfi','silent neuritis'], null),
    (p_id, 'red_flag', 'urgent', 12, 'eye threatened (iridocyclitis, exposure keratitis)', 'core', 'assessment', null,
      array['iridocyclitis','exposure keratitis','painful red eye','reduced vision'], null);
end $$;

-- =============================================================================
-- PSYCHIATRY
-- =============================================================================

-- 5. Acute psychosis
do $$
declare
  p_id uuid;
begin
  select id into p_id from company_protocols
   where title = 'Acute Psychosis — Admission Checklist' limit 1;

  if p_id is null then
    insert into company_protocols (title, version, source_name, template_family, phase, status)
    values ('Acute Psychosis — Admission Checklist', 'v1-draft', 'WardMate psychiatry pack',
            'acute_psychosis', 'before_surgery', 'draft')
    returning id into p_id;
  end if;

  delete from company_protocol_items where protocol_id = p_id;

  insert into company_protocol_items
    (protocol_id, kind, severity, position, prompt, importance, soap_section, normal_phrase, aliases, trigger)
  values
    (p_id, 'investigation', null, 1, 'collateral history from family or informant', 'core', 'subjective', null,
      array['collateral','informant','family history','attendant'], null),
    (p_id, 'investigation', null, 2, 'mental status examination', 'core', 'objective', null,
      array['mse','delusions','hallucinations','thought disorder','affect','insight'], null),
    (p_id, 'investigation', null, 3, 'organic cause screened (vitals, glucose, infection, head injury, substances)', 'core', 'assessment', null,
      array['organic','glucose','head injury','substance use','cannabis','fever'], null),
    (p_id, 'investigation', null, 4, 'orientation and attention (delirium excluded)', 'core', 'objective', 'Oriented, attentive',
      array['orientation','attention','sensorium','delirium','confusion'], null),
    (p_id, 'investigation', null, 5, 'risk to self and others assessed', 'core', 'assessment', null,
      array['risk assessment','aggression','violence','suicidal ideation','self harm'], null),
    (p_id, 'investigation', null, 6, 'admission status under the Mental Healthcare Act 2017 and capacity', 'core', 'plan', null,
      array['mhca','independent admission','supported admission','capacity','nominated representative'], null),
    (p_id, 'investigation', null, 7, 'restraint or seclusion documented with review time, if used', 'optional', 'checks', null,
      array['restraint','seclusion','physical restraint','chemical restraint'], null),
    (p_id, 'investigation', null, 8, 'baseline weight, glucose, lipids and ECG before antipsychotics', 'core', 'objective', null,
      array['weight','bmi','fasting sugar','lipid profile','ecg','qtc'], null),
    (p_id, 'investigation', null, 9, 'extrapyramidal side effects', 'core', 'objective', 'No EPS',
      array['eps','dystonia','akathisia','parkinsonism','rigidity','tremor'], null),
    (p_id, 'investigation', null, 10, 'sleep and food intake', 'optional', 'subjective', 'Sleeping and eating well',
      array['sleep','appetite','food intake'], null),
    (p_id, 'red_flag', 'critical', 11, 'features of neuroleptic malignant syndrome (fever, rigidity, altered sensorium, autonomic instability)', 'core', 'assessment', 'No features of NMS',
      array['nms','neuroleptic malignant','hyperthermia','cpk','autonomic instability'], null),
    (p_id, 'red_flag', 'urgent', 12, 'command hallucinations or intent to harm', 'core', 'assessment', null,
      array['command hallucinations','intent to harm','homicidal','threats'], null);
end $$;

-- 6. Alcohol withdrawal
do $$
declare
  p_id uuid;
begin
  select id into p_id from company_protocols
   where title = 'Alcohol Withdrawal — Checklist' limit 1;

  if p_id is null then
    insert into company_protocols (title, version, source_name, template_family, phase, status)
    values ('Alcohol Withdrawal — Checklist', 'v1-draft', 'WardMate psychiatry pack',
            'alcohol_withdrawal', 'before_surgery', 'draft')
    returning id into p_id;
  end if;

  delete from company_protocol_items where protocol_id = p_id;

  insert into company_protocol_items
    (protocol_id, kind, severity, position, prompt, importance, soap_section, normal_phrase, aliases, trigger)
  values
    (p_id, 'investigation', null, 1, 'time of last drink and usual daily intake', 'core', 'subjective', null,
      array['last drink','last alcohol','daily intake','units','quarter','pattern of use'], null),
    (p_id, 'investigation', null, 2, 'past withdrawal seizures or delirium tremens', 'core', 'subjective', 'None in the past',
      array['withdrawal seizure','rum fits','past withdrawal','past dts'], null),
    (p_id, 'investigation', null, 3, 'CIWA-Ar score on admission', 'core', 'checks', null,
      array['ciwa','ciwa-ar','withdrawal score'], null),
    -- The recurring line. A CIWA-Ar with nothing charted six hours in is the finding.
    (p_id, 'investigation', null, 4, 'CIWA-Ar charted at the set interval', 'core', 'checks', null,
      array['ciwa chart','repeat ciwa','6 hourly ciwa','withdrawal chart'],
      '{"when": [{"type": "hours_since_admission_gte", "hours": 6}], "effect": "core"}'::jsonb),
    (p_id, 'immediate_action', null, 5, 'thiamine given before any glucose', 'core', 'plan', null,
      array['thiamine','vitamin b1','before glucose','wernicke prophylaxis'], null),
    (p_id, 'investigation', null, 6, 'Wernicke features (confusion, ophthalmoplegia, ataxia)', 'core', 'objective', 'No features of Wernicke encephalopathy',
      array['wernicke','ophthalmoplegia','nystagmus','ataxia'], null),
    (p_id, 'investigation', null, 7, 'glucose, electrolytes (sodium, potassium, magnesium), LFT', 'core', 'objective', null,
      array['blood sugar','sodium','potassium','magnesium','lft','ggt'], null),
    (p_id, 'investigation', null, 8, 'head injury, GI bleed and infection excluded', 'core', 'assessment', null,
      array['head injury','fall','melaena','haematemesis','pneumonia','aspiration'], null),
    (p_id, 'investigation', null, 9, 'signs of chronic liver disease', 'optional', 'objective', null,
      array['jaundice','ascites','spider naevi','cld','cirrhosis'], null),
    (p_id, 'pathway_step', null, 10, 'motivation assessed and de-addiction plan discussed', 'core', 'plan', null,
      array['motivation','de-addiction','relapse prevention','aa','anticraving'],
      '{"when": [{"type": "hours_since_admission_gte", "hours": 72}]}'::jsonb),
    (p_id, 'red_flag', 'critical', 11, 'delirium tremens (disorientation, hallucinations, autonomic hyperactivity)', 'core', 'assessment', 'No features of delirium tremens',
      array['delirium tremens','dts','disoriented','visual hallucinations','sweating','tachycardia'], null),
    (p_id, 'red_flag', 'urgent', 12, 'withdrawal seizure on the ward', 'core', 'assessment', 'No seizure',
      array['seizure','fit','convulsion','rum fit'], null);
end $$;

-- 7. Suicide risk (depression / after self-harm)
do $$
declare
  p_id uuid;
begin
  select id into p_id from company_protocols
   where title = 'Suicide Risk — Checklist' limit 1;

  if p_id is null then
    insert into company_protocols (title, version, source_name, template_family, phase, status)
    values ('Suicide Risk — Checklist', 'v1-draft', 'WardMate psychiatry pack',
            'suicide_risk', 'before_surgery', 'draft')
    returning id into p_id;
  end if;

  delete from company_protocol_items where protocol_id = p_id;

  insert into company_protocol_items
    (protocol_id, kind, severity, position, prompt, importance, soap_section, normal_phrase, aliases, trigger)
  values
    (p_id, 'investigation', null, 1, 'medical fitness after self-harm confirmed', 'core', 'objective', null,
      array['medically fit','medical clearance','poisoning','overdose','injury'], null),
    (p_id, 'investigation', null, 2, 'suicide risk assessment (intent, plan, lethality, preparation, rescue)', 'core', 'assessment', null,
      array['suicide risk','intent','plan','lethality','suicide note','final acts','sad persons'], null),
    (p_id, 'investigation', null, 3, 'current suicidal ideation', 'core', 'subjective', null,
      array['suicidal ideation','death wish','thoughts of self harm','hopelessness'], null),
    (p_id, 'immediate_action', null, 4, 'observation level set and documented', 'core', 'checks', null,
      array['observation level','one to one','constant observation','close observation','intermittent observation'], null),
    (p_id, 'immediate_action', null, 5, 'means restriction (belongings searched, ligature points, sharps, medicines kept by staff)', 'core', 'checks', null,
      array['means restriction','belongings','ligature','sharps','medicines with staff','room search'], null),
    (p_id, 'investigation', null, 6, 'depression severity and psychotic features', 'core', 'assessment', null,
      array['depression','phq-9','ham-d','psychotic depression','anhedonia'], null),
    (p_id, 'investigation', null, 7, 'substance use', 'core', 'subjective', null,
      array['alcohol','substance use','cannabis','intoxication'], null),
    (p_id, 'investigation', null, 8, 'protective factors and supports', 'core', 'subjective', null,
      array['protective factors','family support','reasons for living','supports'], null),
    (p_id, 'investigation', null, 9, 'collateral history from family', 'core', 'subjective', null,
      array['collateral','informant','family'], null),
    (p_id, 'investigation', null, 10, 'medico-legal case documentation, where applicable', 'optional', 'plan', null,
      array['mlc','medico legal','police intimation'], null),
    (p_id, 'pathway_step', null, 11, 'safety plan and family psychoeducation before leave or discharge', 'core', 'plan', null,
      array['safety plan','crisis plan','psychoeducation','helpline','follow up'],
      '{"when": [{"type": "hours_since_admission_gte", "hours": 24}]}'::jsonb),
    (p_id, 'red_flag', 'critical', 12, 'persistent intent or a new plan on the ward', 'core', 'assessment', null,
      array['persistent intent','new plan','attempt on ward','absconding'], null);
end $$;

-- 8. Mania
do $$
declare
  p_id uuid;
begin
  select id into p_id from company_protocols
   where title = 'Mania — Admission Checklist' limit 1;

  if p_id is null then
    insert into company_protocols (title, version, source_name, template_family, phase, status)
    values ('Mania — Admission Checklist', 'v1-draft', 'WardMate psychiatry pack',
            'mania', 'before_surgery', 'draft')
    returning id into p_id;
  end if;

  delete from company_protocol_items where protocol_id = p_id;

  insert into company_protocol_items
    (protocol_id, kind, severity, position, prompt, importance, soap_section, normal_phrase, aliases, trigger)
  values
    (p_id, 'investigation', null, 1, 'collateral history and past episodes', 'core', 'subjective', null,
      array['collateral','past episodes','bipolar','previous admission','informant'], null),
    (p_id, 'investigation', null, 2, 'mental status examination', 'core', 'objective', null,
      array['mse','elevated mood','irritability','pressured speech','flight of ideas','grandiosity'], null),
    (p_id, 'investigation', null, 3, 'sleep hours', 'core', 'subjective', null,
      array['sleep','decreased need for sleep','hours of sleep'], null),
    (p_id, 'investigation', null, 4, 'risk assessment (aggression, sexual disinhibition, financial, driving)', 'core', 'assessment', null,
      array['risk','aggression','disinhibition','spending','reckless'], null),
    (p_id, 'investigation', null, 5, 'substance use and antidepressant exposure', 'core', 'subjective', null,
      array['substance use','cannabis','alcohol','antidepressant','steroids'], null),
    (p_id, 'investigation', null, 6, 'organic cause screened (thyroid, neurological, infection)', 'core', 'assessment', null,
      array['organic','thyroid','head injury','neurological'], null),
    (p_id, 'investigation', null, 7, 'admission status under the Mental Healthcare Act 2017 and capacity', 'core', 'plan', null,
      array['mhca','supported admission','independent admission','capacity'], null),
    (p_id, 'investigation', null, 8, 'baseline renal, thyroid, glucose, lipids, ECG, and pregnancy test where relevant', 'core', 'objective', null,
      array['creatinine','tft','tsh','lipids','ecg','upt','pregnancy test'], null),
    (p_id, 'investigation', null, 9, 'serum lithium level', 'core', 'objective', null,
      array['lithium level','serum lithium'],
      '{"when": [{"type": "history", "pattern": "lithium"}], "effect": "core"}'::jsonb),
    (p_id, 'investigation', null, 10, 'food and fluid intake', 'optional', 'checks', 'Eating and drinking',
      array['intake','food intake','hydration'], null),
    (p_id, 'red_flag', 'urgent', 11, 'lithium toxicity features (coarse tremor, vomiting, ataxia, confusion)', 'core', 'assessment', null,
      array['lithium toxicity','coarse tremor','ataxia','vomiting','confusion'],
      '{"when": [{"type": "history", "pattern": "lithium"}]}'::jsonb),
    (p_id, 'red_flag', 'urgent', 12, 'exhaustion or dehydration from overactivity', 'core', 'assessment', null,
      array['exhaustion','dehydration','not eating','overactivity'], null);
end $$;

-- =============================================================================
-- PAEDIATRICS
-- =============================================================================

-- 9. Paediatric pneumonia
do $$
declare
  p_id uuid;
begin
  select id into p_id from company_protocols
   where title = 'Paediatric Pneumonia — Checklist' limit 1;

  if p_id is null then
    insert into company_protocols (title, version, source_name, template_family, phase, status)
    values ('Paediatric Pneumonia — Checklist', 'v1-draft', 'WardMate paediatrics pack',
            'paediatric_pneumonia', 'before_surgery', 'draft')
    returning id into p_id;
  end if;

  delete from company_protocol_items where protocol_id = p_id;

  insert into company_protocol_items
    (protocol_id, kind, severity, position, prompt, importance, soap_section, normal_phrase, aliases, trigger)
  values
    (p_id, 'investigation', null, 1, 'general danger signs (unable to drink or breastfeed, vomits everything, convulsions, lethargic or unconscious)', 'core', 'assessment', 'No danger signs',
      array['danger signs','imnci','unable to feed','vomits everything','convulsions','lethargic'], null),
    (p_id, 'investigation', null, 2, 'respiratory rate counted for a full minute against the age cut-off', 'core', 'objective', null,
      array['respiratory rate','rr','fast breathing','tachypnoea'], null),
    (p_id, 'investigation', null, 3, 'chest indrawing', 'core', 'objective', 'No chest indrawing',
      array['chest indrawing','subcostal retractions','intercostal retractions','work of breathing'], null),
    (p_id, 'investigation', null, 4, 'oxygen saturation on room air', 'core', 'objective', null,
      array['spo2','saturation','pulse oximetry','hypoxia'], null),
    (p_id, 'investigation', null, 5, 'feeding and hydration', 'core', 'subjective', 'Feeding well',
      array['feeding','breastfeeding','oral intake','urine output'], null),
    (p_id, 'investigation', null, 6, 'weight recorded', 'core', 'objective', null,
      array['weight','kg'], null),
    (p_id, 'investigation', null, 7, 'nutritional status and immunisation status', 'core', 'subjective', null,
      array['nutrition','malnutrition','immunisation','vaccination','measles','pcv','hib'], null),
    (p_id, 'investigation', null, 8, 'chest X-ray if severe or not improving', 'optional', 'objective', null,
      array['chest x-ray','cxr','consolidation'], null),
    (p_id, 'investigation', null, 9, 'blood glucose if unwell or not feeding', 'optional', 'objective', null,
      array['glucose','grbs','hypoglycaemia'], null),
    (p_id, 'investigation', null, 10, 'response reviewed at 48 hours', 'core', 'assessment', null,
      array['48 hour review','improving','not improving','fever settling'],
      '{"when": [{"type": "hours_since_admission_gte", "hours": 48}], "effect": "core"}'::jsonb),
    (p_id, 'red_flag', 'critical', 11, 'severe respiratory distress, grunting, cyanosis or apnoea', 'core', 'assessment', null,
      array['grunting','cyanosis','apnoea','head nodding','severe distress'], null),
    (p_id, 'red_flag', 'urgent', 12, 'empyema or effusion suspected (persistent fever, dull note)', 'core', 'assessment', null,
      array['empyema','effusion','dull note','persistent fever'], null);
end $$;

-- 10. Paediatric dehydration (diarrhoea)
do $$
declare
  p_id uuid;
begin
  select id into p_id from company_protocols
   where title = 'Paediatric Dehydration — Checklist' limit 1;

  if p_id is null then
    insert into company_protocols (title, version, source_name, template_family, phase, status)
    values ('Paediatric Dehydration — Checklist', 'v1-draft', 'WardMate paediatrics pack',
            'paediatric_dehydration', 'before_surgery', 'draft')
    returning id into p_id;
  end if;

  delete from company_protocol_items where protocol_id = p_id;

  insert into company_protocol_items
    (protocol_id, kind, severity, position, prompt, importance, soap_section, normal_phrase, aliases, trigger)
  values
    (p_id, 'investigation', null, 1, 'general danger signs', 'core', 'assessment', 'No danger signs',
      array['danger signs','imnci','unable to drink','lethargic','unconscious','convulsions'], null),
    (p_id, 'investigation', null, 2, 'duration of diarrhoea, blood in stool, vomiting', 'core', 'subjective', null,
      array['loose stools','diarrhoea','dysentery','blood in stool','vomiting','frequency'], null),
    (p_id, 'investigation', null, 3, 'dehydration signs (sensorium, sunken eyes, thirst, skin pinch)', 'core', 'objective', null,
      array['sunken eyes','skin pinch','thirst','drinks eagerly','restless','irritable'], null),
    (p_id, 'investigation', null, 4, 'dehydration classified (none / some / severe) and WHO plan chosen', 'core', 'assessment', null,
      array['plan a','plan b','plan c','some dehydration','severe dehydration','no dehydration'], null),
    (p_id, 'investigation', null, 5, 'weight on admission and daily', 'core', 'objective', null,
      array['weight','kg','weight gain'], null),
    (p_id, 'investigation', null, 6, 'urine output', 'core', 'checks', 'Passing urine',
      array['urine output','passed urine','wet nappies'], null),
    (p_id, 'investigation', null, 7, 'reassessed after the rehydration phase', 'core', 'checks', null,
      array['reassessment','rehydrated','after plan b','after plan c'],
      '{"when": [{"type": "hours_since_admission_gte", "hours": 4}], "effect": "core"}'::jsonb),
    (p_id, 'pathway_step', null, 8, 'ORS and zinc started, feeding continued', 'core', 'plan', null,
      array['ors','zinc','continue feeding','breastfeeding'], null),
    (p_id, 'investigation', null, 9, 'electrolytes and renal function if severe', 'optional', 'objective', null,
      array['sodium','potassium','creatinine','urea','hypernatraemia'], null),
    (p_id, 'investigation', null, 10, 'nutritional status (malnutrition changes the rehydration plan)', 'core', 'assessment', null,
      array['sam','malnutrition','muac','wasting','oedema'], null),
    (p_id, 'red_flag', 'critical', 11, 'shock (cold extremities, weak fast pulse, prolonged capillary refill)', 'core', 'assessment', 'No signs of shock',
      array['shock','cold extremities','crt','capillary refill','weak pulse'], null),
    (p_id, 'red_flag', 'urgent', 12, 'abdominal distension or ileus', 'core', 'assessment', 'No distension',
      array['distension','ileus','hypokalaemia','absent bowel sounds'], null);
end $$;

-- 11. Neonatal sepsis
do $$
declare
  p_id uuid;
begin
  select id into p_id from company_protocols
   where title = 'Neonatal Sepsis — Checklist' limit 1;

  if p_id is null then
    insert into company_protocols (title, version, source_name, template_family, phase, status)
    values ('Neonatal Sepsis — Checklist', 'v1-draft', 'WardMate paediatrics pack',
            'neonatal_sepsis', 'before_surgery', 'draft')
    returning id into p_id;
  end if;

  delete from company_protocol_items where protocol_id = p_id;

  insert into company_protocol_items
    (protocol_id, kind, severity, position, prompt, importance, soap_section, normal_phrase, aliases, trigger)
  values
    (p_id, 'investigation', null, 1, 'gestational age, birth weight, day of life', 'core', 'subjective', null,
      array['gestation','preterm','birth weight','day of life','dol'], null),
    (p_id, 'investigation', null, 2, 'maternal risk factors (PROM, maternal fever, foul-smelling liquor)', 'core', 'subjective', null,
      array['prom','maternal fever','foul smelling liquor','chorioamnionitis','maternal uti'], null),
    -- The time-critical line: a gap once the baby is an hour in.
    (p_id, 'investigation', null, 3, 'blood culture sent before antibiotics', 'core', 'objective', null,
      array['blood culture','culture','culture sent'],
      '{"when": [{"type": "hours_since_admission_gte", "hours": 1}], "effect": "core"}'::jsonb),
    (p_id, 'investigation', null, 4, 'sepsis screen (CBC, CRP)', 'core', 'objective', null,
      array['sepsis screen','crp','cbc','itr','micro esr'], null),
    (p_id, 'investigation', null, 5, 'blood glucose', 'core', 'objective', null,
      array['glucose','grbs','hypoglycaemia'], null),
    (p_id, 'investigation', null, 6, 'temperature and thermal care', 'core', 'checks', 'Normothermic',
      array['temperature','hypothermia','warmer','kangaroo care'], null),
    (p_id, 'investigation', null, 7, 'feeding (sucking, tolerance, abdominal distension)', 'core', 'subjective', 'Feeding well',
      array['feeding','sucking','breastfeeding','feed intolerance','distension'], null),
    (p_id, 'investigation', null, 8, 'perfusion (capillary refill) and heart rate', 'core', 'objective', 'Well perfused',
      array['crt','capillary refill','perfusion','heart rate'], null),
    (p_id, 'investigation', null, 9, 'lumbar puncture considered', 'core', 'plan', null,
      array['lp','lumbar puncture','csf','meningitis'], null),
    (p_id, 'investigation', null, 10, 'jaundice', 'optional', 'objective', 'No jaundice',
      array['jaundice','bilirubin','phototherapy'], null),
    (p_id, 'investigation', null, 11, 'weight daily', 'optional', 'objective', null,
      array['weight','weight loss'], null),
    (p_id, 'red_flag', 'critical', 12, 'apnoea, seizures or shock', 'core', 'assessment', null,
      array['apnoea','seizure','shock','bradycardia','cyanosis'], null),
    (p_id, 'red_flag', 'urgent', 13, 'lethargy, poor cry or bulging fontanelle', 'core', 'assessment', null,
      array['lethargy','poor cry','bulging fontanelle','hypotonia'], null);
end $$;

-- 12. Febrile seizure
do $$
declare
  p_id uuid;
begin
  select id into p_id from company_protocols
   where title = 'Febrile Seizure — Checklist' limit 1;

  if p_id is null then
    insert into company_protocols (title, version, source_name, template_family, phase, status)
    values ('Febrile Seizure — Checklist', 'v1-draft', 'WardMate paediatrics pack',
            'febrile_seizure', 'before_surgery', 'draft')
    returning id into p_id;
  end if;

  delete from company_protocol_items where protocol_id = p_id;

  insert into company_protocol_items
    (protocol_id, kind, severity, position, prompt, importance, soap_section, normal_phrase, aliases, trigger)
  values
    (p_id, 'investigation', null, 1, 'seizure description (type, duration, focal features, number in 24 hours)', 'core', 'subjective', null,
      array['seizure','fit','convulsion','generalised','focal','duration of seizure'], null),
    (p_id, 'investigation', null, 2, 'simple or complex febrile seizure', 'core', 'assessment', null,
      array['simple febrile seizure','complex febrile seizure','atypical'], null),
    (p_id, 'investigation', null, 3, 'age, past febrile seizures, family history, development', 'core', 'subjective', null,
      array['age','past seizures','family history','developmental delay'], null),
    (p_id, 'investigation', null, 4, 'focus of fever', 'core', 'assessment', null,
      array['source of fever','urti','otitis','uti','pneumonia','focus'], null),
    (p_id, 'investigation', null, 5, 'signs of meningitis or encephalitis', 'core', 'objective', 'No meningeal signs',
      array['neck stiffness','bulging fontanelle','kernig','meningism','encephalitis'], null),
    (p_id, 'investigation', null, 6, 'lumbar puncture considered (young infant, meningeal signs, prior antibiotics)', 'core', 'plan', null,
      array['lp','lumbar puncture','csf'], null),
    (p_id, 'investigation', null, 7, 'blood glucose', 'core', 'objective', null,
      array['glucose','grbs'], null),
    (p_id, 'investigation', null, 8, 'return to baseline consciousness', 'core', 'checks', 'Back to baseline',
      array['post ictal','conscious','gcs','baseline','alert'],
      '{"when": [{"type": "hours_since_admission_gte", "hours": 2}], "effect": "core"}'::jsonb),
    (p_id, 'investigation', null, 9, 'temperature', 'core', 'checks', 'Afebrile',
      array['fever','temperature'], null),
    (p_id, 'pathway_step', null, 10, 'parents counselled on seizure first aid and recurrence risk', 'core', 'plan', null,
      array['counselling','first aid','recurrence','parent education'], null),
    (p_id, 'red_flag', 'critical', 11, 'seizure lasting beyond five minutes or recurring without recovery', 'core', 'assessment', null,
      array['status epilepticus','prolonged seizure','recurrent seizure'], null),
    (p_id, 'red_flag', 'urgent', 12, 'focal neurological deficit or persistent drowsiness', 'core', 'assessment', 'No focal deficit',
      array['focal deficit','todd palsy','drowsy','altered sensorium'], null);
end $$;

-- 13. Severe acute malnutrition (WHO ten steps — steps only, no amounts)
do $$
declare
  p_id uuid;
begin
  select id into p_id from company_protocols
   where title = 'Severe Acute Malnutrition — Checklist' limit 1;

  if p_id is null then
    insert into company_protocols (title, version, source_name, template_family, phase, status)
    values ('Severe Acute Malnutrition — Checklist', 'v1-draft', 'WardMate paediatrics pack',
            'severe_acute_malnutrition', 'before_surgery', 'draft')
    returning id into p_id;
  end if;

  delete from company_protocol_items where protocol_id = p_id;

  insert into company_protocol_items
    (protocol_id, kind, severity, position, prompt, importance, soap_section, normal_phrase, aliases, trigger)
  values
    (p_id, 'investigation', null, 1, 'anthropometry (weight-for-height z score, MUAC, bilateral pitting oedema)', 'core', 'objective', null,
      array['weight for height','whz','muac','oedema','wasting','anthropometry'], null),
    (p_id, 'investigation', null, 2, 'danger signs and medical complications', 'core', 'assessment', null,
      array['danger signs','complicated sam','medical complications','imnci'], null),
    (p_id, 'investigation', null, 3, 'appetite test', 'optional', 'objective', null,
      array['appetite test','rutf test'], null),
    (p_id, 'investigation', null, 4, 'hypoglycaemia checked and prevented', 'core', 'checks', null,
      array['glucose','grbs','hypoglycaemia','frequent feeds'], null),
    (p_id, 'investigation', null, 5, 'hypothermia checked and prevented', 'core', 'checks', 'Normothermic',
      array['temperature','hypothermia','kangaroo care','covered'], null),
    (p_id, 'investigation', null, 6, 'dehydration assessed with SAM-specific caution', 'core', 'assessment', null,
      array['dehydration','resomal','signs of dehydration'], null),
    (p_id, 'pathway_step', null, 7, 'electrolyte imbalance corrected (potassium, magnesium)', 'core', 'plan', null,
      array['potassium','magnesium','electrolytes'], null),
    (p_id, 'pathway_step', null, 8, 'infection treated (antibiotics started, sources looked for)', 'core', 'plan', null,
      array['antibiotics','infection','sepsis screen','tb','uti','hiv'], null),
    (p_id, 'pathway_step', null, 9, 'micronutrients given (vitamin A, folic acid, zinc; iron deferred)', 'core', 'plan', null,
      array['vitamin a','micronutrients','zinc','folic acid','multivitamin'], null),
    (p_id, 'pathway_step', null, 10, 'cautious initial feeding (starter formula) with feed chart', 'core', 'plan', null,
      array['f-75','starter formula','feed chart','initial feeding','stabilisation'], null),
    (p_id, 'pathway_step', null, 11, 'transition to catch-up growth feeding with weight gain tracked', 'core', 'plan', null,
      array['f-100','catch up','rutf','rehabilitation','weight gain'],
      '{"when": [{"type": "hours_since_admission_gte", "hours": 48}]}'::jsonb),
    (p_id, 'pathway_step', null, 12, 'sensory stimulation and mother counselled', 'optional', 'plan', null,
      array['stimulation','play','mother counselling','nrc'], null),
    (p_id, 'pathway_step', null, 13, 'follow-up after discharge arranged', 'optional', 'plan', null,
      array['follow up','nrc follow up','anganwadi','discharge criteria'], null),
    (p_id, 'red_flag', 'critical', 14, 'signs of heart failure or fluid overload during rehydration or feeding', 'core', 'assessment', null,
      array['fast breathing','raised jvp','liver enlarging','basal crepitations','fluid overload','refeeding'], null);
end $$;

-- =============================================================================
-- EMERGENCY MEDICINE
-- =============================================================================

-- 14. Polytrauma
do $$
declare
  p_id uuid;
begin
  select id into p_id from company_protocols
   where title = 'Polytrauma — Checklist' limit 1;

  if p_id is null then
    insert into company_protocols (title, version, source_name, template_family, phase, status)
    values ('Polytrauma — Checklist', 'v1-draft', 'WardMate emergency medicine pack',
            'polytrauma', 'before_surgery', 'draft')
    returning id into p_id;
  end if;

  delete from company_protocol_items where protocol_id = p_id;

  insert into company_protocol_items
    (protocol_id, kind, severity, position, prompt, importance, soap_section, normal_phrase, aliases, trigger)
  values
    (p_id, 'immediate_action', null, 1, 'airway with cervical spine protection', 'core', 'objective', 'Airway patent, c-spine protected',
      array['airway','c-spine','cervical collar','c collar'], null),
    (p_id, 'immediate_action', null, 2, 'breathing (tension pneumothorax, haemothorax, flail chest excluded)', 'core', 'objective', 'Bilateral air entry',
      array['breathing','air entry','pneumothorax','haemothorax','flail chest','spo2'], null),
    (p_id, 'immediate_action', null, 3, 'circulation and external haemorrhage control', 'core', 'objective', null,
      array['circulation','haemorrhage','pulse','bp','tourniquet','external bleeding'], null),
    (p_id, 'investigation', null, 4, 'GCS and pupils', 'core', 'objective', null,
      array['gcs','pupils','disability','sensorium','head injury'], null),
    (p_id, 'investigation', null, 5, 'exposure and hypothermia prevention', 'core', 'checks', null,
      array['exposure','log roll','temperature','hypothermia'], null),
    (p_id, 'investigation', null, 6, 'eFAST', 'core', 'objective', null,
      array['fast','efast','free fluid','ultrasound'], null),
    (p_id, 'investigation', null, 7, 'chest and pelvis X-ray', 'core', 'objective', null,
      array['chest x-ray','pelvis x-ray','cxr','pelvic fracture'], null),
    (p_id, 'investigation', null, 8, 'blood grouping and cross-match sent', 'core', 'objective', null,
      array['grouping','cross match','blood group','crossmatch'], null),
    (p_id, 'investigation', null, 9, 'secondary survey (AMPLE history, head to toe)', 'core', 'subjective', null,
      array['secondary survey','ample','head to toe','mechanism of injury'], null),
    (p_id, 'immediate_action', null, 10, 'tetanus immunisation status and prophylaxis', 'core', 'plan', null,
      array['tetanus','tt','td','tetanus toxoid'], null),
    (p_id, 'investigation', null, 11, 'medico-legal case registered', 'core', 'plan', null,
      array['mlc','medico legal','police intimation'], null),
    (p_id, 'investigation', null, 12, 'tertiary survey for missed injuries', 'core', 'assessment', null,
      array['tertiary survey','missed injury','repeat examination'],
      '{"when": [{"type": "hours_since_admission_gte", "hours": 24}], "effect": "core"}'::jsonb),
    (p_id, 'red_flag', 'critical', 13, 'haemodynamic instability despite resuscitation', 'core', 'assessment', 'Haemodynamically stable',
      array['hypotension','non responder','transient responder','shock'], null),
    (p_id, 'red_flag', 'critical', 14, 'falling GCS or unequal pupils', 'core', 'assessment', null,
      array['falling gcs','unequal pupils','anisocoria','lateralising signs'], null);
end $$;

-- 15. Poisoning
do $$
declare
  p_id uuid;
begin
  select id into p_id from company_protocols
   where title = 'Poisoning — Checklist' limit 1;

  if p_id is null then
    insert into company_protocols (title, version, source_name, template_family, phase, status)
    values ('Poisoning — Checklist', 'v1-draft', 'WardMate emergency medicine pack',
            'poisoning', 'before_surgery', 'draft')
    returning id into p_id;
  end if;

  delete from company_protocol_items where protocol_id = p_id;

  insert into company_protocol_items
    (protocol_id, kind, severity, position, prompt, importance, soap_section, normal_phrase, aliases, trigger)
  values
    (p_id, 'immediate_action', null, 1, 'airway, breathing, circulation', 'core', 'objective', null,
      array['abc','airway','breathing','circulation','spo2'], null),
    (p_id, 'investigation', null, 2, 'substance, time of exposure, route, container seen', 'core', 'subjective', null,
      array['compound','poison','time of ingestion','container','bottle','route'], null),
    (p_id, 'investigation', null, 3, 'toxidrome identified', 'core', 'assessment', null,
      array['toxidrome','cholinergic','anticholinergic','sympathomimetic','opioid','sedative'], null),
    (p_id, 'investigation', null, 4, 'decontamination (clothes removed, skin washed, gastric decontamination considered)', 'core', 'plan', null,
      array['decontamination','skin wash','clothes removed','gastric lavage','activated charcoal'], null),
    (p_id, 'investigation', null, 5, 'pupils, secretions, heart rate, chest', 'core', 'objective', null,
      array['pupils','miosis','secretions','bradycardia','crepitations'], null),
    -- Organophosphate / carbamate: the atropinisation end-points, checked at each review.
    (p_id, 'investigation', null, 6, 'atropinisation end-points (clear chest, dry axillae, heart rate and systolic BP above target, pupils no longer pinpoint)', 'core', 'checks', 'Atropinised',
      array['atropinisation','clear chest','dry axilla','atropinised'],
      '{"when": [{"type": "history", "pattern": "organophosph|op poison|op compound|carbamate|pesticide|insecticide"}], "effect": "core"}'::jsonb),
    (p_id, 'investigation', null, 7, 'atropine toxicity checked (agitation, hyperthermia, absent bowel sounds, urinary retention)', 'core', 'checks', 'No atropine toxicity',
      array['atropine toxicity','agitation','delirium','hyperthermia','urinary retention'],
      '{"when": [{"type": "history", "pattern": "organophosph|op poison|op compound|carbamate|pesticide|insecticide"}]}'::jsonb),
    (p_id, 'investigation', null, 8, 'serum cholinesterase, ABG, renal and liver function', 'optional', 'objective', null,
      array['pseudocholinesterase','cholinesterase','abg','creatinine','lft'], null),
    (p_id, 'investigation', null, 9, 'neck flexion strength and breathing (intermediate syndrome watch)', 'core', 'checks', 'Neck flexion strong',
      array['neck flexion','intermediate syndrome','single breath count','proximal weakness'],
      '{"when": [{"type": "hours_since_admission_gte", "hours": 24}]}'::jsonb),
    (p_id, 'investigation', null, 10, 'medico-legal case registered', 'core', 'plan', null,
      array['mlc','medico legal','police intimation'], null),
    (p_id, 'pathway_step', null, 11, 'psychiatry review for intent once medically fit', 'core', 'plan', null,
      array['psychiatry','suicide risk','intentional','self harm'], null),
    (p_id, 'red_flag', 'critical', 12, 'respiratory failure (falling saturation, weak cough, rising respiratory rate)', 'core', 'assessment', null,
      array['respiratory failure','intubation','ventilation','weak cough','desaturation'], null),
    (p_id, 'red_flag', 'urgent', 13, 'arrhythmia or prolonged QTc', 'core', 'assessment', null,
      array['arrhythmia','qtc','ecg','ventricular tachycardia'], null);
end $$;

-- 16. Snakebite
do $$
declare
  p_id uuid;
begin
  select id into p_id from company_protocols
   where title = 'Snakebite — Checklist' limit 1;

  if p_id is null then
    insert into company_protocols (title, version, source_name, template_family, phase, status)
    values ('Snakebite — Checklist', 'v1-draft', 'WardMate emergency medicine pack',
            'snakebite', 'before_surgery', 'draft')
    returning id into p_id;
  end if;

  delete from company_protocol_items where protocol_id = p_id;

  insert into company_protocol_items
    (protocol_id, kind, severity, position, prompt, importance, soap_section, normal_phrase, aliases, trigger)
  values
    (p_id, 'investigation', null, 1, 'time and site of bite, snake seen or brought', 'core', 'subjective', null,
      array['time of bite','site of bite','snake identified','krait','cobra','viper','russell'], null),
    (p_id, 'investigation', null, 2, 'first aid given (limb immobilised; any tight ligature or tourniquet noted)', 'core', 'subjective', null,
      array['first aid','ligature','tourniquet','immobilised','incision'], null),
    (p_id, 'investigation', null, 3, '20-minute whole blood clotting test (20WBCT) on arrival', 'core', 'objective', null,
      array['20wbct','wbct','clotting test','whole blood clotting'], null),
    -- Repeat clotting test: a gap if nothing is charted six hours in.
    (p_id, 'investigation', null, 4, '20WBCT repeated at the set interval', 'core', 'checks', null,
      array['repeat 20wbct','6 hourly wbct','serial wbct'],
      '{"when": [{"type": "hours_since_admission_gte", "hours": 6}], "effect": "core"}'::jsonb),
    (p_id, 'investigation', null, 5, 'local swelling margin marked and its progression', 'core', 'checks', 'No progression of swelling',
      array['swelling','local swelling','progression','bullae','necrosis'], null),
    (p_id, 'investigation', null, 6, 'neurotoxic signs (ptosis, neck flexion, single breath count, bulbar weakness)', 'core', 'checks', 'No neurotoxic signs',
      array['ptosis','neck flexion','single breath count','dysphagia','diplopia','neuroparalysis'], null),
    (p_id, 'investigation', null, 7, 'bleeding (gums, puncture sites, haematuria)', 'core', 'objective', 'No bleeding',
      array['bleeding','gum bleeding','haematuria','bleeding from site'], null),
    (p_id, 'investigation', null, 8, 'urine output and renal function', 'core', 'checks', null,
      array['urine output','creatinine','aki','oliguria'], null),
    (p_id, 'investigation', null, 9, 'does the patient meet the criteria for ASV?', 'core', 'assessment', null,
      array['asv','anti snake venom','antivenom','asv indicated'], null),
    -- History pattern, not item_present: answering the line above with "ASV not indicated"
    -- must not raise the reaction watch (history matching skips negated mentions).
    (p_id, 'investigation', null, 10, 'watched for ASV reaction during and after infusion', 'core', 'checks', 'No ASV reaction',
      array['asv reaction','anaphylaxis','urticaria','rigors'],
      '{"when": [{"type": "history", "pattern": "asv|anti.?snake venom|antivenom"}], "effect": "core"}'::jsonb),
    (p_id, 'immediate_action', null, 11, 'tetanus immunisation status', 'core', 'plan', null,
      array['tetanus','tt','td'], null),
    (p_id, 'red_flag', 'critical', 12, 'respiratory weakness (falling single breath count, paradoxical breathing)', 'core', 'assessment', null,
      array['respiratory paralysis','ventilation','paradoxical breathing','falling sbc'], null),
    (p_id, 'red_flag', 'urgent', 13, 'compartment syndrome suspected (tense limb, pain on passive stretch)', 'core', 'assessment', null,
      array['compartment syndrome','tense swelling','pain on stretch','pulseless'], null);
end $$;

-- 17. Heat illness
do $$
declare
  p_id uuid;
begin
  select id into p_id from company_protocols
   where title = 'Heat Illness — Checklist' limit 1;

  if p_id is null then
    insert into company_protocols (title, version, source_name, template_family, phase, status)
    values ('Heat Illness — Checklist', 'v1-draft', 'WardMate emergency medicine pack',
            'heat_illness', 'before_surgery', 'draft')
    returning id into p_id;
  end if;

  delete from company_protocol_items where protocol_id = p_id;

  insert into company_protocol_items
    (protocol_id, kind, severity, position, prompt, importance, soap_section, normal_phrase, aliases, trigger)
  values
    (p_id, 'investigation', null, 1, 'core temperature (rectal) on arrival', 'core', 'objective', null,
      array['core temperature','rectal temperature','temperature','hyperthermia'], null),
    (p_id, 'investigation', null, 2, 'exposure history (outdoor work, exertion, heatwave, elderly living alone)', 'core', 'subjective', null,
      array['heat exposure','exertion','sun exposure','heatwave','outdoor work'], null),
    (p_id, 'investigation', null, 3, 'mental status (heat stroke vs heat exhaustion)', 'core', 'assessment', null,
      array['sensorium','confusion','gcs','heat stroke','heat exhaustion'], null),
    (p_id, 'immediate_action', null, 4, 'active cooling started', 'core', 'plan', null,
      array['cooling','ice packs','evaporative cooling','cold water immersion','tepid sponging'], null),
    (p_id, 'investigation', null, 5, 'cooling end-point temperature reached and cooling stopped', 'core', 'checks', null,
      array['target temperature','cooling stopped','end point'],
      '{"when": [{"type": "hours_since_admission_gte", "hours": 1}], "effect": "core"}'::jsonb),
    (p_id, 'investigation', null, 6, 'blood glucose', 'core', 'objective', null,
      array['glucose','grbs'], null),
    (p_id, 'investigation', null, 7, 'electrolytes and renal function', 'core', 'objective', null,
      array['sodium','potassium','creatinine','urea'], null),
    (p_id, 'investigation', null, 8, 'CK and urine colour (rhabdomyolysis)', 'core', 'objective', null,
      array['ck','cpk','rhabdomyolysis','myoglobinuria','cola coloured urine'], null),
    (p_id, 'investigation', null, 9, 'LFT and coagulation (PT/INR, platelets)', 'core', 'objective', null,
      array['lft','transaminases','pt','inr','platelets'], null),
    (p_id, 'investigation', null, 10, 'urine output', 'core', 'checks', 'Adequate urine output',
      array['urine output','catheter','oliguria'], null),
    (p_id, 'investigation', null, 11, 'other causes of fever and altered sensorium excluded (malaria, meningitis, drugs)', 'core', 'assessment', null,
      array['malaria','meningitis','sepsis','drug induced','anticholinergic','nms'], null),
    (p_id, 'red_flag', 'critical', 12, 'seizures, coma or persistent hyperthermia despite cooling', 'core', 'assessment', null,
      array['seizure','coma','persistent hyperthermia'], null),
    (p_id, 'red_flag', 'urgent', 13, 'bleeding or DIC', 'core', 'assessment', 'No bleeding',
      array['bleeding','dic','petechiae','oozing'], null);
end $$;

-- =============================================================================
-- Picker rows. Idempotent by hand (ward_id and variant are null, so ON CONFLICT would not
-- catch a re-run) — same pattern as 0061.
-- =============================================================================

insert into care_templates (ward_id, family, variant, phase, name)
select null::uuid, v.family, v.variant, v.phase, v.name
from (values
  ('sjs_ten',                   null::text, 'before_surgery'::care_phase, 'SJS / TEN'),
  ('autoimmune_blistering',     null,       'before_surgery',             'Pemphigus / pemphigoid'),
  ('erythroderma',              null,       'before_surgery',             'Erythroderma'),
  ('leprosy_reaction',          null,       'before_surgery',             'Leprosy reaction'),
  ('acute_psychosis',           null,       'before_surgery',             'Acute psychosis'),
  ('alcohol_withdrawal',        null,       'before_surgery',             'Alcohol withdrawal'),
  ('suicide_risk',              null,       'before_surgery',             'Suicide risk / after self-harm'),
  ('mania',                     null,       'before_surgery',             'Mania'),
  ('paediatric_pneumonia',      null,       'before_surgery',             'Pneumonia (child)'),
  ('paediatric_dehydration',    null,       'before_surgery',             'Diarrhoea with dehydration (child)'),
  ('neonatal_sepsis',           null,       'before_surgery',             'Neonatal sepsis'),
  ('febrile_seizure',           null,       'before_surgery',             'Febrile seizure'),
  ('severe_acute_malnutrition', null,       'before_surgery',             'Severe acute malnutrition'),
  ('polytrauma',                null,       'before_surgery',             'Polytrauma'),
  ('poisoning',                 null,       'before_surgery',             'Poisoning'),
  ('snakebite',                 null,       'before_surgery',             'Snakebite'),
  ('heat_illness',              null,       'before_surgery',             'Heat illness / heat stroke')
) as v(family, variant, phase, name)
where not exists (
  select 1 from care_templates c
  where c.ward_id is null
    and c.family = v.family
    and c.variant is not distinct from v.variant
    and c.phase = v.phase
);

commit;
