-- Ward checklists for four departments whose units had none: obstetrics & gynaecology, ENT,
-- ophthalmology and orthopaedics.
--
-- WHAT THIS SEEDS. For each template family, a checklist protocol (company_protocols + its
-- company_protocol_items), and one care_templates picker row so the family can be chosen on
-- the ward list. Same shape as 0061 / 0064 / 0067.
--
--   obstetrics_gynaecology  lscs, normal_delivery, pre_eclampsia, antenatal_admission
--   ent                     tonsillectomy, ear_surgery, fess, tracheostomy
--   ophthalmology           cataract_surgery, glaucoma_surgery, vitreoretinal_surgery, corneal_ulcer
--   orthopaedics            fracture_fixation, hip_fracture, arthroplasty, limb_in_cast, open_fracture
--
-- PHASE. lib/templates.ts phaseFor() gives 'after_surgery' once a patient has a surgery_date,
-- else 'before_surgery', and a protocol is matched on template_family + phase. So an operative
-- family gets two protocols — a pre-operative one ('before_surgery') and a post-operative one
-- ('after_surgery'). normal_delivery is treated the same way, on the assumption that the ward
-- records the delivery date where the operation date goes: 'before_surgery' is the labour
-- admission, 'after_surgery' is the postnatal checklist. The non-operative families
-- (pre_eclampsia, antenatal_admission, corneal_ulcer, limb_in_cast) get one 'before_surgery'
-- protocol only.
--
-- PICKER ROWS. All four packs use pickerPhase 'after_surgery', so every picker row below is
-- filed under 'after_surgery' — including the non-operative families — because that is the
-- phase the picker reads. The picker row carries no items; the protocol supplies them.
--
-- No drug doses anywhere. Drug names appear only as aliases (words a resident dictates).
--
-- CLINICAL CONTENT: REVIEWED (Dr Anubhav Verma, 2026-09-28) — seeded as draft; 0092 publishes it.
-- Drafts are invisible to residents (getTemplateForPatient matches published protocols only).
--
-- Requires: 0026, 0032, 0036, 0040, 0056, 0058, 0060.
-- Safe to run more than once — it rewrites the item set for a protocol of the same title, and
-- the picker rows are inserted only where missing.

begin;

-- =============================================================================================
-- OBSTETRICS & GYNAECOLOGY
-- =============================================================================================

-- ---------------------------------------------------------------------------
-- lscs
-- ---------------------------------------------------------------------------
do $$
declare
  pre_id uuid;
  post_id uuid;
begin
  select id into pre_id from company_protocols
   where title = 'Caesarean Section (LSCS) — Pre-operative Checklist' limit 1;
  if pre_id is null then
    insert into company_protocols (title, version, source_name, template_family, phase, status)
    values ('Caesarean Section (LSCS) — Pre-operative Checklist', 'v1-draft',
            'WardMate obstetrics & gynaecology pack', 'lscs', 'before_surgery', 'draft')
    returning id into pre_id;
  end if;

  delete from company_protocol_items where protocol_id = pre_id;

  insert into company_protocol_items
    (protocol_id, kind, position, prompt, importance, severity, soap_section, normal_phrase, aliases, trigger)
  values
    (pre_id, 'investigation', 1, 'indication for caesarean', 'core', null, 'assessment', null,
      array['indication','elective','emergency','previous lscs','fetal distress','non progress of labour','breech','cpd'], null),
    (pre_id, 'investigation', 2, 'gestational age and fetal heart', 'core', null, 'objective', 'Fetal heart rate regular',
      array['gestation','weeks','fhr','fhs','fetal heart','ctg'], null),
    (pre_id, 'investigation', 3, 'haemoglobin and blood group', 'core', null, 'objective', null,
      array['hb','haemoglobin','blood group','rh typing','abo'], null),
    (pre_id, 'immediate_action', 4, 'blood cross-matched and reserved', 'core', null, 'checks', null,
      array['crossmatch','cross match','blood reserved','units reserved','prbc'], null),
    (pre_id, 'investigation', 5, 'placental location on ultrasound', 'core', null, 'objective', null,
      array['placenta','usg','placenta previa','accreta','low lying placenta'], null),
    (pre_id, 'immediate_action', 6, 'aspiration prophylaxis given', 'core', null, 'plan', null,
      array['antacid','aspiration prophylaxis','pantoprazole','ranitidine','metoclopramide'], null),
    (pre_id, 'immediate_action', 7, 'antibiotic prophylaxis given', 'core', null, 'plan', null,
      array['antibiotic','prophylactic antibiotic','cefazolin','test dose'], null),
    (pre_id, 'immediate_action', 8, 'bladder catheterised', 'core', null, 'plan', null,
      array['foley','catheter','catheterised'], null),
    (pre_id, 'investigation', 9, 'fasting status', 'core', null, 'checks', null,
      array['npo','nil by mouth','nbm','fasting','last meal'], null),
    (pre_id, 'investigation', 10, 'consent', 'core', null, 'checks', null,
      array['consent taken','consented','high risk consent'], null),
    (pre_id, 'investigation', 11, 'fitness', 'core', null, 'checks', null,
      array['pac','anaesthetic clearance','fit for surgery','spinal'], null),
    (pre_id, 'red_flag', 12, 'fetal distress or cord prolapse', 'core', 'critical', 'assessment', 'No fetal distress',
      array['fetal bradycardia','cord prolapse','decelerations','thick meconium'], null),
    (pre_id, 'red_flag', 13, 'antepartum haemorrhage', 'core', 'urgent', 'objective', 'No bleeding per vaginum',
      array['aph','bleeding pv','abruption','bleeding per vaginum'], null),
    (pre_id, 'pathway_step', 14, 'neonatal team informed', 'optional', null, 'plan', null,
      array['paediatrician','nicu informed','neonatologist','paeds informed'], null);

  select id into post_id from company_protocols
   where title = 'Caesarean Section (LSCS) — Post-operative Checklist' limit 1;
  if post_id is null then
    insert into company_protocols (title, version, source_name, template_family, phase, status)
    values ('Caesarean Section (LSCS) — Post-operative Checklist', 'v1-draft',
            'WardMate obstetrics & gynaecology pack', 'lscs', 'after_surgery', 'draft')
    returning id into post_id;
  end if;

  delete from company_protocol_items where protocol_id = post_id;

  insert into company_protocol_items
    (protocol_id, kind, position, prompt, importance, severity, soap_section, normal_phrase, aliases, trigger)
  values
    (post_id, 'investigation', 1, 'post-operative day', 'core', null, 'assessment', null,
      array['pod','post op day','day'], null),
    (post_id, 'investigation', 2, 'vitals', 'core', null, 'objective', 'Stable',
      array['pulse','bp','blood pressure','temperature','spo2'], null),
    (post_id, 'red_flag', 3, 'postpartum haemorrhage', 'core', 'critical', 'objective', 'Lochia normal, no excess bleeding',
      array['pph','bleeding pv','lochia','clots','excess bleeding'], null),
    (post_id, 'investigation', 4, 'uterine tone and fundal height', 'core', null, 'objective', 'Uterus well contracted',
      array['uterus','fundus','fundal height','atonic','uterine tone'], null),
    (post_id, 'investigation', 5, 'wound', 'core', null, 'objective', 'Healthy, dry, no discharge',
      array['incision','dressing','suture line','pfannenstiel','stitch line'], null),
    (post_id, 'investigation', 6, 'urine output', 'core', null, 'objective', 'Adequate',
      array['uop','catheter output','urine'], null),
    (post_id, 'pathway_step', 7, 'catheter removed', 'core', null, 'plan', null,
      array['foley removed','catheter out','voided','passed urine'],
      '{"when": [{"type": "hours_since_surgery_gte", "hours": 12}]}'::jsonb),
    (post_id, 'investigation', 8, 'oral intake', 'core', null, 'objective', 'Tolerating orally',
      array['orals','diet','sips','tolerating orals'], null),
    (post_id, 'investigation', 9, 'flatus', 'core', null, 'objective', 'Passed',
      array['bowel sounds','passed flatus','motion'], null),
    (post_id, 'investigation', 10, 'ambulation', 'core', null, 'objective', 'Mobilising',
      array['mobilised','walking','out of bed'], null),
    (post_id, 'investigation', 11, 'breastfeeding', 'core', null, 'objective', 'Breastfeeding well',
      array['breast feeding','latching','lactation','feeds'], null),
    (post_id, 'investigation', 12, 'breasts', 'optional', null, 'objective', 'Soft, no engorgement',
      array['engorgement','cracked nipple','mastitis'], null),
    (post_id, 'pathway_step', 13, 'anti-D given if Rh negative', 'optional', null, 'plan', null,
      array['anti d','anti-d','rh immunoglobulin','kleihauer','cord blood group'],
      '{"when": [{"type": "history", "pattern": "rh negative|rh-negative|rh neg|rhesus negative|(a|b|ab|o) ?(neg|negative|-ve)"}], "effect": "core"}'::jsonb),
    (post_id, 'red_flag', 14, 'signs of sepsis or thromboembolism', 'core', 'urgent', 'assessment', 'Afebrile, no calf tenderness',
      array['fever','foul lochia','calf pain','calf tenderness','dvt','breathlessness','endometritis'], null),
    (post_id, 'pathway_step', 15, 'suture removal', 'core', null, 'plan', null,
      array['stitch removal','staples removed','sutures out'],
      '{"when": [{"type": "pod_gte", "days": 7}]}'::jsonb);
end $$;

-- ---------------------------------------------------------------------------
-- normal_delivery (before = labour admission, after = postnatal)
-- ---------------------------------------------------------------------------
do $$
declare
  pre_id uuid;
  post_id uuid;
begin
  select id into pre_id from company_protocols
   where title = 'Normal Delivery — Labour Admission Checklist' limit 1;
  if pre_id is null then
    insert into company_protocols (title, version, source_name, template_family, phase, status)
    values ('Normal Delivery — Labour Admission Checklist', 'v1-draft',
            'WardMate obstetrics & gynaecology pack', 'normal_delivery', 'before_surgery', 'draft')
    returning id into pre_id;
  end if;

  delete from company_protocol_items where protocol_id = pre_id;

  insert into company_protocol_items
    (protocol_id, kind, position, prompt, importance, severity, soap_section, normal_phrase, aliases, trigger)
  values
    (pre_id, 'investigation', 1, 'gestational age', 'core', null, 'subjective', null,
      array['weeks','lmp','edd','gestation','term'], null),
    (pre_id, 'investigation', 2, 'onset of labour', 'core', null, 'subjective', null,
      array['labour pains','contractions','leaking pv','show','rupture of membranes','prom'], null),
    (pre_id, 'investigation', 3, 'fetal heart rate', 'core', null, 'objective', 'Fetal heart rate regular',
      array['fhr','fhs','fetal heart','ctg','doppler'], null),
    (pre_id, 'investigation', 4, 'presentation and lie', 'core', null, 'objective', null,
      array['cephalic','breech','vertex','lie','presentation'], null),
    (pre_id, 'investigation', 5, 'cervical dilatation and station', 'core', null, 'objective', null,
      array['pv','per vaginum','os','dilatation','effacement','station'], null),
    (pre_id, 'investigation', 6, 'liquor', 'core', null, 'objective', 'Clear liquor',
      array['meconium','amniotic fluid','membranes','draining liquor'], null),
    (pre_id, 'investigation', 7, 'haemoglobin, blood group and viral markers', 'core', null, 'objective', null,
      array['hb','blood group','rh','hiv','hbsag','vdrl','hcv'], null),
    (pre_id, 'pathway_step', 8, 'partograph started', 'core', null, 'plan', null,
      array['partograph','partogram','labour chart'], null),
    (pre_id, 'red_flag', 9, 'fetal distress', 'core', 'critical', 'assessment', 'No fetal distress',
      array['fetal bradycardia','decelerations','thick meconium','fetal tachycardia'], null),
    (pre_id, 'red_flag', 10, 'bleeding per vaginum', 'core', 'urgent', 'objective', 'No bleeding per vaginum',
      array['aph','bleeding pv','abruption'], null),
    (pre_id, 'red_flag', 11, 'raised blood pressure', 'core', 'warning', 'objective', 'Normotensive',
      array['bp','hypertension','pih','pre-eclampsia','headache','blurring of vision'], null),
    (pre_id, 'investigation', 12, 'consent', 'core', null, 'checks', null,
      array['consent taken','consented'], null);

  select id into post_id from company_protocols
   where title = 'Normal Delivery — Postnatal Checklist' limit 1;
  if post_id is null then
    insert into company_protocols (title, version, source_name, template_family, phase, status)
    values ('Normal Delivery — Postnatal Checklist', 'v1-draft',
            'WardMate obstetrics & gynaecology pack', 'normal_delivery', 'after_surgery', 'draft')
    returning id into post_id;
  end if;

  delete from company_protocol_items where protocol_id = post_id;

  insert into company_protocol_items
    (protocol_id, kind, position, prompt, importance, severity, soap_section, normal_phrase, aliases, trigger)
  values
    (post_id, 'investigation', 1, 'postnatal day', 'core', null, 'assessment', null,
      array['pnd','postnatal day','day','day of delivery'], null),
    (post_id, 'investigation', 2, 'vitals', 'core', null, 'objective', 'Stable',
      array['pulse','bp','blood pressure','temperature'], null),
    (post_id, 'red_flag', 3, 'postpartum haemorrhage', 'core', 'critical', 'objective', 'Lochia normal, no excess bleeding',
      array['pph','bleeding pv','lochia','clots','excess bleeding'], null),
    (post_id, 'investigation', 4, 'uterine tone and fundal height', 'core', null, 'objective', 'Uterus well contracted',
      array['uterus','fundus','fundal height','atonic','uterine tone'], null),
    (post_id, 'investigation', 5, 'perineum and episiotomy', 'core', null, 'objective', 'Episiotomy healthy',
      array['episiotomy','perineal tear','perineum','stitches','perineal haematoma'], null),
    (post_id, 'investigation', 6, 'passed urine', 'core', null, 'objective', 'Passing urine normally',
      array['voided','urinary retention','urine'], null),
    (post_id, 'investigation', 7, 'breastfeeding', 'core', null, 'objective', 'Breastfeeding well',
      array['breast feeding','latching','lactation','feeds'], null),
    (post_id, 'investigation', 8, 'breasts', 'optional', null, 'objective', 'Soft, no engorgement',
      array['engorgement','cracked nipple','mastitis'], null),
    (post_id, 'pathway_step', 9, 'anti-D given if Rh negative', 'optional', null, 'plan', null,
      array['anti d','anti-d','rh immunoglobulin','kleihauer','cord blood group'],
      '{"when": [{"type": "history", "pattern": "rh negative|rh-negative|rh neg|rhesus negative|(a|b|ab|o) ?(neg|negative|-ve)"}], "effect": "core"}'::jsonb),
    (post_id, 'red_flag', 10, 'fever or foul-smelling lochia', 'core', 'urgent', 'objective', 'Afebrile',
      array['fever','foul lochia','puerperal sepsis','endometritis'], null),
    (post_id, 'investigation', 11, 'baby reviewed', 'optional', null, 'objective', null,
      array['baby','neonate','newborn','apgar','birth weight'], null),
    (post_id, 'pathway_step', 12, 'contraception counselled', 'core', null, 'plan', null,
      array['contraception','ppiucd','family planning','cu-t','spacing'], null);
end $$;

-- ---------------------------------------------------------------------------
-- pre_eclampsia (non-operative)
-- ---------------------------------------------------------------------------
do $$
declare
  pe_id uuid;
begin
  select id into pe_id from company_protocols
   where title = 'Pre-eclampsia — Admission Checklist' limit 1;
  if pe_id is null then
    insert into company_protocols (title, version, source_name, template_family, phase, status)
    values ('Pre-eclampsia — Admission Checklist', 'v1-draft',
            'WardMate obstetrics & gynaecology pack', 'pre_eclampsia', 'before_surgery', 'draft')
    returning id into pe_id;
  end if;

  delete from company_protocol_items where protocol_id = pe_id;

  insert into company_protocol_items
    (protocol_id, kind, position, prompt, importance, severity, soap_section, normal_phrase, aliases, trigger)
  values
    (pe_id, 'investigation', 1, 'blood pressure trend', 'core', null, 'objective', null,
      array['bp','blood pressure','bp charting','systolic','diastolic'], null),
    (pe_id, 'investigation', 2, 'urine protein', 'core', null, 'objective', null,
      array['proteinuria','urine albumin','dipstick','upcr','24 hour urine protein'], null),
    (pe_id, 'red_flag', 3, 'imminent eclampsia symptoms', 'core', 'critical', 'subjective',
      'No headache, visual symptoms or epigastric pain',
      array['headache','blurring of vision','epigastric pain','right upper quadrant pain','vomiting','scotoma'], null),
    (pe_id, 'red_flag', 4, 'seizure', 'core', 'critical', 'objective', 'No seizures',
      array['convulsion','fits','eclampsia'], null),
    (pe_id, 'investigation', 5, 'platelets, renal and liver function', 'core', null, 'objective', null,
      array['platelets','creatinine','lft','sgot','sgpt','ldh','uric acid'], null),
    (pe_id, 'red_flag', 6, 'hellp syndrome features', 'optional', 'critical', 'assessment', null,
      array['hellp','haemolysis','low platelets','raised ldh','raised liver enzymes'],
      '{"when": [{"type": "lab", "analyte": "platelets", "op": "lt", "value": 100}], "effect": "core"}'::jsonb),
    (pe_id, 'investigation', 7, 'coagulation profile', 'optional', null, 'objective', null,
      array['pt','inr','aptt','coagulation'], null),
    (pe_id, 'investigation', 8, 'fetal wellbeing', 'core', null, 'objective', 'Fetal heart rate regular',
      array['fhr','ctg','nst','fetal movements','doppler','growth scan','afi'], null),
    (pe_id, 'immediate_action', 9, 'antihypertensive given', 'core', null, 'plan', null,
      array['labetalol','nifedipine','antihypertensive','bp controlled'], null),
    (pe_id, 'immediate_action', 10, 'magnesium sulphate decision', 'core', null, 'plan', null,
      array['mgso4','magnesium','pritchard','zuspan'], null),
    (pe_id, 'investigation', 11, 'magnesium toxicity monitoring', 'optional', null, 'objective',
      'Reflexes present, respiratory rate adequate',
      array['knee jerk','patellar reflex','respiratory rate','mgso4 toxicity'],
      '{"when": [{"type": "history", "pattern": "magnesium|mgso4|pritchard|zuspan"}], "effect": "core"}'::jsonb),
    (pe_id, 'investigation', 12, 'urine output', 'core', null, 'objective', 'Adequate',
      array['uop','input output','intake output','catheter output'], null),
    (pe_id, 'investigation', 13, 'antenatal corticosteroids', 'optional', null, 'plan', null,
      array['steroids','betamethasone','dexamethasone','lung maturity'], null),
    (pe_id, 'pathway_step', 14, 'delivery plan', 'core', null, 'plan', null,
      array['timing of delivery','induction','lscs','termination','expectant management'], null);
end $$;

-- ---------------------------------------------------------------------------
-- antenatal_admission (non-operative)
-- ---------------------------------------------------------------------------
do $$
declare
  an_id uuid;
begin
  select id into an_id from company_protocols
   where title = 'Antenatal Admission — Checklist' limit 1;
  if an_id is null then
    insert into company_protocols (title, version, source_name, template_family, phase, status)
    values ('Antenatal Admission — Checklist', 'v1-draft',
            'WardMate obstetrics & gynaecology pack', 'antenatal_admission', 'before_surgery', 'draft')
    returning id into an_id;
  end if;

  delete from company_protocol_items where protocol_id = an_id;

  insert into company_protocol_items
    (protocol_id, kind, position, prompt, importance, severity, soap_section, normal_phrase, aliases, trigger)
  values
    (an_id, 'investigation', 1, 'indication for admission', 'core', null, 'subjective', null,
      array['reason for admission','complaint','admitted for'], null),
    (an_id, 'investigation', 2, 'gestational age', 'core', null, 'subjective', null,
      array['weeks','lmp','edd','dating scan','gestation'], null),
    (an_id, 'investigation', 3, 'obstetric score', 'core', null, 'subjective', null,
      array['gravida','para','gpla','obstetric history','previous lscs'], null),
    (an_id, 'investigation', 4, 'fetal movements', 'core', null, 'subjective', 'Fetal movements perceived',
      array['fm','reduced fetal movements','quickening'], null),
    (an_id, 'investigation', 5, 'fetal heart rate', 'core', null, 'objective', 'Fetal heart rate regular',
      array['fhr','fhs','fetal heart','ctg','nst'], null),
    (an_id, 'investigation', 6, 'blood pressure', 'core', null, 'objective', 'Normotensive',
      array['bp','hypertension','pih'], null),
    (an_id, 'investigation', 7, 'haemoglobin, blood group and viral markers', 'core', null, 'objective', null,
      array['hb','blood group','rh','hiv','hbsag','vdrl','hcv'], null),
    (an_id, 'investigation', 8, 'urine routine', 'core', null, 'objective', null,
      array['urine albumin','urine sugar','urine culture','urinary infection'], null),
    (an_id, 'investigation', 9, 'glucose screening', 'core', null, 'objective', null,
      array['ogtt','gdm','blood sugar','dipsi'], null),
    (an_id, 'investigation', 10, 'latest ultrasound', 'core', null, 'objective', null,
      array['usg','growth scan','afi','placenta','doppler','anomaly scan'], null),
    (an_id, 'red_flag', 11, 'bleeding or leaking per vaginum', 'core', 'urgent', 'subjective',
      'No bleeding or leaking per vaginum',
      array['bleeding pv','leaking pv','aph','prom','pprom'], null),
    (an_id, 'red_flag', 12, 'preterm contractions', 'core', 'warning', 'subjective', 'No uterine contractions',
      array['contractions','labour pains','tightening','preterm labour'], null),
    (an_id, 'red_flag', 13, 'headache, visual symptoms or epigastric pain', 'core', 'urgent', 'subjective', 'None',
      array['headache','blurring of vision','epigastric pain','scotoma'], null),
    (an_id, 'investigation', 14, 'iron, folate and calcium supplementation', 'optional', null, 'plan', null,
      array['ifa','iron','calcium','folic acid'], null),
    (an_id, 'investigation', 15, 'tetanus immunisation', 'optional', null, 'plan', null,
      array['td','tt','tetanus toxoid'], null);
end $$;

-- =============================================================================================
-- ENT
-- =============================================================================================

-- ---------------------------------------------------------------------------
-- tonsillectomy
-- ---------------------------------------------------------------------------
do $$
declare
  pre_id uuid;
  post_id uuid;
begin
  select id into pre_id from company_protocols
   where title = 'Tonsillectomy — Pre-operative Checklist' limit 1;
  if pre_id is null then
    insert into company_protocols (title, version, source_name, template_family, phase, status)
    values ('Tonsillectomy — Pre-operative Checklist', 'v1-draft', 'WardMate ENT pack',
            'tonsillectomy', 'before_surgery', 'draft')
    returning id into pre_id;
  end if;

  delete from company_protocol_items where protocol_id = pre_id;

  insert into company_protocol_items
    (protocol_id, kind, position, prompt, importance, severity, soap_section, normal_phrase, aliases, trigger)
  values
    (pre_id, 'investigation', 1, 'indication', 'core', null, 'assessment', null,
      array['recurrent tonsillitis','episodes per year','osa','snoring','quinsy','peritonsillar abscess'], null),
    (pre_id, 'investigation', 2, 'bleeding tendency', 'core', null, 'subjective', 'No bleeding tendency',
      array['bleeding disorder','easy bruising','family history of bleeding','blood thinner'], null),
    (pre_id, 'investigation', 3, 'current throat infection', 'core', null, 'objective', 'No active infection',
      array['acute tonsillitis','sore throat','last episode','fever'], null),
    (pre_id, 'investigation', 4, 'loose teeth', 'optional', null, 'objective', 'No loose teeth',
      array['loose tooth','dentition','milk teeth'], null),
    (pre_id, 'investigation', 5, 'palate', 'optional', null, 'objective', 'No submucous cleft',
      array['bifid uvula','submucous cleft','palate'], null),
    (pre_id, 'investigation', 6, 'haemoglobin and coagulation profile', 'core', null, 'objective', null,
      array['hb','bt','ct','pt','inr','aptt','coagulation'], null),
    (pre_id, 'investigation', 7, 'blood grouping', 'optional', null, 'objective', null,
      array['blood group','crossmatch'], null),
    (pre_id, 'red_flag', 8, 'sleep apnoea features', 'core', 'warning', 'subjective', 'No obstructive sleep apnoea features',
      array['osa','apnoea','snoring','daytime somnolence','mouth breathing'], null),
    (pre_id, 'investigation', 9, 'fasting status', 'core', null, 'checks', null,
      array['npo','nil by mouth','nbm','fasting'], null),
    (pre_id, 'investigation', 10, 'consent', 'core', null, 'checks', null,
      array['consent taken','consented'], null),
    (pre_id, 'investigation', 11, 'fitness', 'core', null, 'checks', null,
      array['pac','anaesthetic clearance','fit for surgery'], null);

  select id into post_id from company_protocols
   where title = 'Tonsillectomy — Post-operative Checklist' limit 1;
  if post_id is null then
    insert into company_protocols (title, version, source_name, template_family, phase, status)
    values ('Tonsillectomy — Post-operative Checklist', 'v1-draft', 'WardMate ENT pack',
            'tonsillectomy', 'after_surgery', 'draft')
    returning id into post_id;
  end if;

  delete from company_protocol_items where protocol_id = post_id;

  insert into company_protocol_items
    (protocol_id, kind, position, prompt, importance, severity, soap_section, normal_phrase, aliases, trigger)
  values
    (post_id, 'investigation', 1, 'post-operative day', 'core', null, 'assessment', null,
      array['pod','post op day','day'], null),
    (post_id, 'investigation', 2, 'vitals', 'core', null, 'objective', 'Stable',
      array['pulse','bp','blood pressure','spo2'], null),
    (post_id, 'red_flag', 3, 'bleeding from tonsillar fossa', 'core', 'critical', 'objective',
      'No bleeding from tonsillar fossa',
      array['bleeding','blood in saliva','spitting blood','fresh blood','repeated swallowing','reactionary haemorrhage'], null),
    (post_id, 'investigation', 4, 'tonsillar fossa', 'core', null, 'objective', 'Slough healthy, no clot',
      array['fossa','slough','white slough','clot in fossa'], null),
    (post_id, 'red_flag', 5, 'airway compromise', 'core', 'critical', 'objective', 'No stridor or desaturation',
      array['stridor','desaturation','noisy breathing','respiratory distress'], null),
    (post_id, 'investigation', 6, 'pain', 'core', null, 'subjective', null,
      array['throat pain','odynophagia','referred ear pain','otalgia','pain score'], null),
    (post_id, 'investigation', 7, 'oral intake', 'core', null, 'objective', 'Tolerating orally',
      array['orals','cold liquids','soft diet','swallowing'], null),
    (post_id, 'investigation', 8, 'fever', 'core', null, 'objective', 'Afebrile',
      array['temperature','febrile','temp'], null),
    (post_id, 'pathway_step', 9, 'secondary haemorrhage advice given', 'core', null, 'plan', null,
      array['bleeding advice','when to come back','red flag advice'], null),
    (post_id, 'pathway_step', 10, 'discharge plan', 'core', null, 'plan', null,
      array['discharge','follow up','diet advice'], null);
end $$;

-- ---------------------------------------------------------------------------
-- ear_surgery (tympanoplasty / mastoidectomy)
-- ---------------------------------------------------------------------------
do $$
declare
  pre_id uuid;
  post_id uuid;
begin
  select id into pre_id from company_protocols
   where title = 'Ear Surgery (Tympanoplasty / Mastoidectomy) — Pre-operative Checklist' limit 1;
  if pre_id is null then
    insert into company_protocols (title, version, source_name, template_family, phase, status)
    values ('Ear Surgery (Tympanoplasty / Mastoidectomy) — Pre-operative Checklist', 'v1-draft',
            'WardMate ENT pack', 'ear_surgery', 'before_surgery', 'draft')
    returning id into pre_id;
  end if;

  delete from company_protocol_items where protocol_id = pre_id;

  insert into company_protocol_items
    (protocol_id, kind, position, prompt, importance, severity, soap_section, normal_phrase, aliases, trigger)
  values
    (pre_id, 'investigation', 1, 'side', 'core', null, 'objective', null,
      array['laterality','right ear','left ear','operated ear'], null),
    (pre_id, 'investigation', 2, 'ear discharge', 'core', null, 'subjective', 'Ear dry',
      array['discharge','otorrhoea','dry ear','active discharge','dry for'], null),
    (pre_id, 'investigation', 3, 'type of disease', 'core', null, 'assessment', null,
      array['mucosal','squamosal','cholesteatoma','safe','unsafe','csom','perforation'], null),
    (pre_id, 'investigation', 4, 'pure tone audiometry', 'core', null, 'objective', null,
      array['pta','audiogram','hearing test','air bone gap','tuning fork'], null),
    (pre_id, 'investigation', 5, 'facial nerve function', 'core', null, 'objective', 'Facial nerve intact',
      array['facial nerve','house brackmann','facial palsy','face movement'], null),
    (pre_id, 'investigation', 6, 'imaging', 'optional', null, 'objective', null,
      array['hrct temporal bone','ct temporal','mri'], null),
    (pre_id, 'red_flag', 7, 'complications of otitis media', 'core', 'urgent', 'assessment',
      'No intracranial or intratemporal complication',
      array['vertigo','headache','neck stiffness','mastoid abscess','facial weakness','meningitis','labyrinthitis'], null),
    (pre_id, 'investigation', 8, 'routine blood investigations', 'core', null, 'objective', null,
      array['hb','cbc','rbs','viral markers','bt ct'], null),
    (pre_id, 'investigation', 9, 'site marked', 'core', null, 'checks', null,
      array['site marking','side marked','shaved','hair clipped'], null),
    (pre_id, 'investigation', 10, 'fasting status', 'core', null, 'checks', null,
      array['npo','nil by mouth','nbm','fasting'], null),
    (pre_id, 'investigation', 11, 'consent', 'core', null, 'checks', null,
      array['consent taken','consented'], null),
    (pre_id, 'investigation', 12, 'fitness', 'core', null, 'checks', null,
      array['pac','anaesthetic clearance','fit for surgery'], null);

  select id into post_id from company_protocols
   where title = 'Ear Surgery (Tympanoplasty / Mastoidectomy) — Post-operative Checklist' limit 1;
  if post_id is null then
    insert into company_protocols (title, version, source_name, template_family, phase, status)
    values ('Ear Surgery (Tympanoplasty / Mastoidectomy) — Post-operative Checklist', 'v1-draft',
            'WardMate ENT pack', 'ear_surgery', 'after_surgery', 'draft')
    returning id into post_id;
  end if;

  delete from company_protocol_items where protocol_id = post_id;

  insert into company_protocol_items
    (protocol_id, kind, position, prompt, importance, severity, soap_section, normal_phrase, aliases, trigger)
  values
    (post_id, 'investigation', 1, 'post-operative day', 'core', null, 'assessment', null,
      array['pod','post op day','day'], null),
    (post_id, 'investigation', 2, 'fever', 'core', null, 'objective', 'Afebrile',
      array['temperature','febrile','temp'], null),
    (post_id, 'red_flag', 3, 'facial nerve weakness', 'core', 'critical', 'objective', 'Facial nerve intact',
      array['facial palsy','facial weakness','deviation of angle of mouth','eye closure'], null),
    (post_id, 'red_flag', 4, 'vertigo or nystagmus', 'core', 'urgent', 'subjective', 'No vertigo',
      array['giddiness','nystagmus','vomiting','imbalance'], null),
    (post_id, 'investigation', 5, 'mastoid dressing', 'core', null, 'objective', 'Clean and dry',
      array['dressing','head bandage','mastoid bandage','soakage'], null),
    (post_id, 'investigation', 6, 'wound', 'core', null, 'objective', 'Healthy, dry, no discharge',
      array['incision','suture line','postaural','endaural'], null),
    (post_id, 'investigation', 7, 'ear canal pack', 'core', null, 'objective', null,
      array['ear pack','gelfoam','pack','canal pack'], null),
    (post_id, 'red_flag', 8, 'haematoma or bleeding', 'core', 'warning', 'objective', 'No haematoma',
      array['bleeding','haematoma','swelling behind ear'], null),
    (post_id, 'investigation', 9, 'hearing', 'optional', null, 'objective', null,
      array['tuning fork','weber','hearing check'], null),
    (post_id, 'pathway_step', 10, 'ear precautions advised', 'core', null, 'plan', null,
      array['keep ear dry','no nose blowing','sneeze with mouth open','water precautions'], null),
    (post_id, 'pathway_step', 11, 'pack removal and follow-up date', 'core', null, 'plan', null,
      array['pack removal','follow up','review date'], null),
    (post_id, 'pathway_step', 12, 'suture removal', 'core', null, 'plan', null,
      array['stitch removal','sutures out'],
      '{"when": [{"type": "pod_gte", "days": 7}]}'::jsonb);
end $$;

-- ---------------------------------------------------------------------------
-- fess
-- ---------------------------------------------------------------------------
do $$
declare
  pre_id uuid;
  post_id uuid;
begin
  select id into pre_id from company_protocols
   where title = 'FESS — Pre-operative Checklist' limit 1;
  if pre_id is null then
    insert into company_protocols (title, version, source_name, template_family, phase, status)
    values ('FESS — Pre-operative Checklist', 'v1-draft', 'WardMate ENT pack',
            'fess', 'before_surgery', 'draft')
    returning id into pre_id;
  end if;

  delete from company_protocol_items where protocol_id = pre_id;

  insert into company_protocol_items
    (protocol_id, kind, position, prompt, importance, severity, soap_section, normal_phrase, aliases, trigger)
  values
    (pre_id, 'investigation', 1, 'indication', 'core', null, 'assessment', null,
      array['chronic rhinosinusitis','polyps','fungal sinusitis','ethmoidal polyp','antrochoanal polyp'], null),
    (pre_id, 'investigation', 2, 'ct paranasal sinuses reviewed', 'core', null, 'objective', null,
      array['ct pns','ncct pns','ct scan','lamina papyracea','skull base','keros'], null),
    (pre_id, 'investigation', 3, 'diagnostic nasal endoscopy', 'core', null, 'objective', null,
      array['dne','nasal endoscopy','polyp grade','septal deviation'], null),
    (pre_id, 'investigation', 4, 'asthma and aspirin sensitivity', 'core', null, 'subjective', 'No asthma',
      array['asthma','wheeze','samter','aspirin sensitivity','nsaid allergy'], null),
    (pre_id, 'investigation', 5, 'baseline vision', 'core', null, 'objective', 'Vision normal both eyes',
      array['visual acuity','vision','eye movements','diplopia'], null),
    (pre_id, 'investigation', 6, 'bleeding tendency', 'core', null, 'subjective', 'No bleeding tendency',
      array['bleeding disorder','easy bruising','epistaxis'], null),
    (pre_id, 'investigation', 7, 'blood thinners', 'optional', null, 'checks', null,
      array['aspirin','clopidogrel','warfarin','anticoagulant','antiplatelet stopped'], null),
    (pre_id, 'investigation', 8, 'routine blood investigations', 'core', null, 'objective', null,
      array['hb','cbc','rbs','viral markers','coagulation'], null),
    (pre_id, 'investigation', 9, 'fasting status', 'core', null, 'checks', null,
      array['npo','nil by mouth','nbm','fasting'], null),
    (pre_id, 'investigation', 10, 'consent', 'core', null, 'checks', null,
      array['consent taken','consented'], null),
    (pre_id, 'investigation', 11, 'fitness', 'core', null, 'checks', null,
      array['pac','anaesthetic clearance','fit for surgery'], null);

  select id into post_id from company_protocols
   where title = 'FESS — Post-operative Checklist' limit 1;
  if post_id is null then
    insert into company_protocols (title, version, source_name, template_family, phase, status)
    values ('FESS — Post-operative Checklist', 'v1-draft', 'WardMate ENT pack',
            'fess', 'after_surgery', 'draft')
    returning id into post_id;
  end if;

  delete from company_protocol_items where protocol_id = post_id;

  insert into company_protocol_items
    (protocol_id, kind, position, prompt, importance, severity, soap_section, normal_phrase, aliases, trigger)
  values
    (post_id, 'investigation', 1, 'post-operative day', 'core', null, 'assessment', null,
      array['pod','post op day','day'], null),
    (post_id, 'red_flag', 2, 'nasal bleeding', 'core', 'urgent', 'objective', 'No active bleeding',
      array['epistaxis','bleeding','pack soaked','blood in throat'], null),
    (post_id, 'red_flag', 3, 'orbital complications', 'core', 'critical', 'objective',
      'Vision normal, no periorbital swelling',
      array['vision','proptosis','periorbital swelling','diplopia','orbital haematoma','eye pain'], null),
    (post_id, 'red_flag', 4, 'csf leak', 'core', 'critical', 'objective', 'No CSF rhinorrhoea',
      array['csf rhinorrhoea','clear nasal discharge','salty taste','watery discharge'], null),
    (post_id, 'investigation', 5, 'drip pad', 'core', null, 'objective', 'Clean',
      array['moustache dressing','soakage','nasal dressing'], null),
    (post_id, 'pathway_step', 6, 'nasal pack removed', 'core', null, 'plan', null,
      array['pack removal','merocel removed','pack out','nasal pack'],
      '{"when": [{"type": "hours_since_surgery_gte", "hours": 24}]}'::jsonb),
    (post_id, 'investigation', 7, 'fever', 'core', null, 'objective', 'Afebrile',
      array['temperature','febrile','temp'], null),
    (post_id, 'investigation', 8, 'oral intake', 'optional', null, 'objective', 'Tolerating orally',
      array['orals','diet'], null),
    (post_id, 'pathway_step', 9, 'nasal douching advised', 'core', null, 'plan', null,
      array['saline douche','nasal wash','douching'], null),
    (post_id, 'pathway_step', 10, 'follow-up endoscopic cleaning', 'core', null, 'plan', null,
      array['debridement','endoscopic toilet','follow up','crust removal'], null);
end $$;

-- ---------------------------------------------------------------------------
-- tracheostomy
-- ---------------------------------------------------------------------------
do $$
declare
  pre_id uuid;
  post_id uuid;
begin
  select id into pre_id from company_protocols
   where title = 'Tracheostomy — Pre-operative Checklist' limit 1;
  if pre_id is null then
    insert into company_protocols (title, version, source_name, template_family, phase, status)
    values ('Tracheostomy — Pre-operative Checklist', 'v1-draft', 'WardMate ENT pack',
            'tracheostomy', 'before_surgery', 'draft')
    returning id into pre_id;
  end if;

  delete from company_protocol_items where protocol_id = pre_id;

  insert into company_protocol_items
    (protocol_id, kind, position, prompt, importance, severity, soap_section, normal_phrase, aliases, trigger)
  values
    (pre_id, 'investigation', 1, 'indication', 'core', null, 'assessment', null,
      array['prolonged intubation','upper airway obstruction','laryngeal growth','bilateral vocal cord palsy','pulmonary toilet'], null),
    (pre_id, 'investigation', 2, 'elective or emergency', 'core', null, 'assessment', null,
      array['emergency','elective','planned'], null),
    (pre_id, 'red_flag', 3, 'impending airway obstruction', 'core', 'critical', 'objective', 'No stridor',
      array['stridor','desaturation','accessory muscles','air hunger','respiratory distress'], null),
    (pre_id, 'investigation', 4, 'neck examination', 'core', null, 'objective', null,
      array['neck','landmarks','thyroid','short neck','neck extension'], null),
    (pre_id, 'investigation', 5, 'coagulation profile and platelets', 'core', null, 'objective', null,
      array['pt','inr','aptt','platelets','coagulation'], null),
    (pre_id, 'investigation', 6, 'ventilator settings and oxygen requirement', 'optional', null, 'objective', null,
      array['fio2','peep','ventilator','oxygen requirement'], null),
    (pre_id, 'pathway_step', 7, 'tube size and type selected', 'core', null, 'plan', null,
      array['tube size','cuffed','uncuffed','portex','fenestrated'], null),
    (pre_id, 'investigation', 8, 'blood grouping', 'optional', null, 'objective', null,
      array['blood group','crossmatch'], null),
    (pre_id, 'investigation', 9, 'fasting status', 'core', null, 'checks', null,
      array['npo','nil by mouth','nbm','fasting','feeds held'], null),
    (pre_id, 'investigation', 10, 'consent', 'core', null, 'checks', null,
      array['consent taken','consented','relative consent'], null),
    (pre_id, 'investigation', 11, 'fitness', 'core', null, 'checks', null,
      array['pac','anaesthetic clearance','fit for surgery'], null);

  select id into post_id from company_protocols
   where title = 'Tracheostomy — Post-operative Checklist' limit 1;
  if post_id is null then
    insert into company_protocols (title, version, source_name, template_family, phase, status)
    values ('Tracheostomy — Post-operative Checklist', 'v1-draft', 'WardMate ENT pack',
            'tracheostomy', 'after_surgery', 'draft')
    returning id into post_id;
  end if;

  delete from company_protocol_items where protocol_id = post_id;

  insert into company_protocol_items
    (protocol_id, kind, position, prompt, importance, severity, soap_section, normal_phrase, aliases, trigger)
  values
    (post_id, 'investigation', 1, 'post-operative day', 'core', null, 'assessment', null,
      array['pod','post op day','day'], null),
    (post_id, 'investigation', 2, 'tube type and size', 'core', null, 'objective', null,
      array['tube','cuffed','uncuffed','size','portex'], null),
    (post_id, 'investigation', 3, 'tube secured', 'core', null, 'objective', 'Tube secured with tapes',
      array['tie','tapes','flange sutures','flange','secured'], null),
    (post_id, 'investigation', 4, 'cuff pressure', 'core', null, 'objective', null,
      array['cuff','cuff deflated','cuff inflated'], null),
    (post_id, 'investigation', 5, 'suction and secretions', 'core', null, 'objective', 'Minimal secretions',
      array['suction','secretions','sputum','plugs','crusting'], null),
    (post_id, 'immediate_action', 6, 'humidification', 'core', null, 'plan', null,
      array['humidifier','hme','nebulisation','saline drops'], null),
    (post_id, 'investigation', 7, 'stoma site', 'core', null, 'objective', 'Healthy, no bleeding',
      array['stoma','peristomal','granulation'], null),
    (post_id, 'immediate_action', 8, 'spare tube and obturator at bedside', 'core', null, 'checks', null,
      array['spare tube','obturator','tracheal dilator','emergency kit','bedside kit'], null),
    (post_id, 'red_flag', 9, 'tube displacement or blockage', 'core', 'critical', 'objective', 'Tube patent and in position',
      array['displaced tube','decannulated','blocked tube','no air entry','desaturation'], null),
    (post_id, 'red_flag', 10, 'bleeding from stoma', 'core', 'urgent', 'objective', 'No bleeding',
      array['bleeding','haemorrhage','fresh blood in secretions'], null),
    (post_id, 'red_flag', 11, 'surgical emphysema or pneumothorax', 'core', 'urgent', 'objective', 'No surgical emphysema',
      array['subcutaneous emphysema','crepitus','pneumothorax','chest x-ray'], null),
    (post_id, 'pathway_step', 12, 'first tube change', 'core', null, 'plan', null,
      array['tube change','first change'],
      '{"when": [{"type": "pod_gte", "days": 5}]}'::jsonb),
    (post_id, 'pathway_step', 13, 'decannulation plan', 'optional', null, 'plan', null,
      array['decannulation','corking','downsizing','spigot'], null);
end $$;

-- =============================================================================================
-- OPHTHALMOLOGY
-- =============================================================================================

-- ---------------------------------------------------------------------------
-- cataract_surgery
-- ---------------------------------------------------------------------------
do $$
declare
  pre_id uuid;
  post_id uuid;
begin
  select id into pre_id from company_protocols
   where title = 'Cataract Surgery — Pre-operative Checklist' limit 1;
  if pre_id is null then
    insert into company_protocols (title, version, source_name, template_family, phase, status)
    values ('Cataract Surgery — Pre-operative Checklist', 'v1-draft', 'WardMate ophthalmology pack',
            'cataract_surgery', 'before_surgery', 'draft')
    returning id into pre_id;
  end if;

  delete from company_protocol_items where protocol_id = pre_id;

  insert into company_protocol_items
    (protocol_id, kind, position, prompt, importance, severity, soap_section, normal_phrase, aliases, trigger)
  values
    (pre_id, 'investigation', 1, 'eye to be operated', 'core', null, 'objective', null,
      array['operated eye','right eye','left eye','laterality','re','le'], null),
    (pre_id, 'investigation', 2, 'visual acuity', 'core', null, 'objective', null,
      array['va','vision','snellen','bcva','pinhole'], null),
    (pre_id, 'investigation', 3, 'intraocular pressure', 'core', null, 'objective', null,
      array['iop','tonometry','nct','eye pressure'], null),
    (pre_id, 'investigation', 4, 'lacrimal sac syringing', 'core', null, 'objective', 'Patent, no regurgitation',
      array['syringing','sac syringing','regurgitation','dacryocystitis','nld'], null),
    (pre_id, 'investigation', 5, 'biometry and iol power', 'core', null, 'objective', null,
      array['biometry','a-scan','keratometry','iol power','lens power'], null),
    (pre_id, 'investigation', 6, 'fundus / b-scan', 'optional', null, 'objective', null,
      array['fundus','b-scan','posterior segment','retina'], null),
    (pre_id, 'investigation', 7, 'blood sugar and blood pressure', 'core', null, 'objective', null,
      array['rbs','fbs','sugar','bp','diabetes','hypertension'], null),
    (pre_id, 'red_flag', 8, 'local infection', 'core', 'urgent', 'objective', 'No lid or conjunctival infection',
      array['conjunctivitis','blepharitis','stye','discharge','sticky eye'], null),
    (pre_id, 'immediate_action', 9, 'pupil dilated', 'core', null, 'checks', null,
      array['dilated','pupil dilatation','mydriasis','well dilated'], null),
    (pre_id, 'investigation', 10, 'eye marked', 'core', null, 'checks', null,
      array['site marked','marking'], null),
    (pre_id, 'investigation', 11, 'consent', 'core', null, 'checks', null,
      array['consent taken','consented'], null),
    (pre_id, 'investigation', 12, 'fitness', 'core', null, 'checks', null,
      array['pac','physician clearance','fit for surgery'], null);

  select id into post_id from company_protocols
   where title = 'Cataract Surgery — Post-operative Checklist' limit 1;
  if post_id is null then
    insert into company_protocols (title, version, source_name, template_family, phase, status)
    values ('Cataract Surgery — Post-operative Checklist', 'v1-draft', 'WardMate ophthalmology pack',
            'cataract_surgery', 'after_surgery', 'draft')
    returning id into post_id;
  end if;

  delete from company_protocol_items where protocol_id = post_id;

  insert into company_protocol_items
    (protocol_id, kind, position, prompt, importance, severity, soap_section, normal_phrase, aliases, trigger)
  values
    (post_id, 'investigation', 1, 'post-operative day', 'core', null, 'assessment', null,
      array['pod','post op day','day'], null),
    (post_id, 'investigation', 2, 'visual acuity', 'core', null, 'objective', null,
      array['va','vision','snellen','pinhole'], null),
    (post_id, 'red_flag', 3, 'endophthalmitis signs', 'core', 'critical', 'objective', 'No pain, no hypopyon',
      array['eye pain','hypopyon','diminished vision','lid oedema','discharge','endophthalmitis'], null),
    (post_id, 'investigation', 4, 'cornea', 'core', null, 'objective', 'Clear',
      array['corneal oedema','striate keratopathy','clear cornea'], null),
    (post_id, 'investigation', 5, 'anterior chamber', 'core', null, 'objective', 'Quiet, formed',
      array['ac','cells','flare','ac reaction','ac depth'], null),
    (post_id, 'investigation', 6, 'intraocular pressure', 'core', null, 'objective', null,
      array['iop','tonometry','digital tension'], null),
    (post_id, 'investigation', 7, 'iol position', 'core', null, 'objective', 'IOL in bag, well centred',
      array['iol','lens','pciol','decentred'], null),
    (post_id, 'investigation', 8, 'wound', 'core', null, 'objective', 'Wound sealed',
      array['incision','seidel','wound leak','tunnel','sutures'], null),
    (post_id, 'pathway_step', 9, 'eye drops explained', 'core', null, 'plan', null,
      array['drops','instillation','steroid drops','antibiotic drops'], null),
    (post_id, 'pathway_step', 10, 'eye protection and hygiene advised', 'core', null, 'plan', null,
      array['eye shield','dark glasses','no rubbing','no water in eye'], null),
    (post_id, 'pathway_step', 11, 'follow-up and refraction date', 'core', null, 'plan', null,
      array['follow up','refraction','glasses','review'], null);
end $$;

-- ---------------------------------------------------------------------------
-- glaucoma_surgery
-- ---------------------------------------------------------------------------
do $$
declare
  pre_id uuid;
  post_id uuid;
begin
  select id into pre_id from company_protocols
   where title = 'Glaucoma Surgery — Pre-operative Checklist' limit 1;
  if pre_id is null then
    insert into company_protocols (title, version, source_name, template_family, phase, status)
    values ('Glaucoma Surgery — Pre-operative Checklist', 'v1-draft', 'WardMate ophthalmology pack',
            'glaucoma_surgery', 'before_surgery', 'draft')
    returning id into pre_id;
  end if;

  delete from company_protocol_items where protocol_id = pre_id;

  insert into company_protocol_items
    (protocol_id, kind, position, prompt, importance, severity, soap_section, normal_phrase, aliases, trigger)
  values
    (pre_id, 'investigation', 1, 'eye to be operated', 'core', null, 'objective', null,
      array['operated eye','right eye','left eye','laterality'], null),
    (pre_id, 'investigation', 2, 'visual acuity', 'core', null, 'objective', null,
      array['va','vision','snellen','bcva'], null),
    (pre_id, 'investigation', 3, 'intraocular pressure', 'core', null, 'objective', null,
      array['iop','tonometry','gat','applanation'], null),
    (pre_id, 'investigation', 4, 'visual fields', 'core', null, 'objective', null,
      array['hfa','perimetry','fields','field defect'], null),
    (pre_id, 'investigation', 5, 'gonioscopy', 'core', null, 'objective', null,
      array['angle','open angle','closed angle','narrow angle'], null),
    (pre_id, 'investigation', 6, 'optic disc', 'core', null, 'objective', null,
      array['cup disc ratio','cdr','disc','oct rnfl'], null),
    (pre_id, 'investigation', 7, 'current glaucoma medication', 'core', null, 'subjective', null,
      array['timolol','latanoprost','brimonidine','dorzolamide','acetazolamide','antiglaucoma drops'], null),
    (pre_id, 'investigation', 8, 'blood sugar and blood pressure', 'core', null, 'objective', null,
      array['rbs','fbs','sugar','bp','diabetes','hypertension'], null),
    (pre_id, 'red_flag', 9, 'acute angle closure', 'core', 'critical', 'subjective', 'No acute pain or haloes',
      array['eye pain','haloes','headache','vomiting','red eye','raised iop'], null),
    (pre_id, 'investigation', 10, 'eye marked', 'core', null, 'checks', null,
      array['site marked','marking'], null),
    (pre_id, 'investigation', 11, 'consent', 'core', null, 'checks', null,
      array['consent taken','consented'], null),
    (pre_id, 'investigation', 12, 'fitness', 'core', null, 'checks', null,
      array['pac','physician clearance','fit for surgery'], null);

  select id into post_id from company_protocols
   where title = 'Glaucoma Surgery — Post-operative Checklist' limit 1;
  if post_id is null then
    insert into company_protocols (title, version, source_name, template_family, phase, status)
    values ('Glaucoma Surgery — Post-operative Checklist', 'v1-draft', 'WardMate ophthalmology pack',
            'glaucoma_surgery', 'after_surgery', 'draft')
    returning id into post_id;
  end if;

  delete from company_protocol_items where protocol_id = post_id;

  insert into company_protocol_items
    (protocol_id, kind, position, prompt, importance, severity, soap_section, normal_phrase, aliases, trigger)
  values
    (post_id, 'investigation', 1, 'post-operative day', 'core', null, 'assessment', null,
      array['pod','post op day','day'], null),
    (post_id, 'investigation', 2, 'visual acuity', 'core', null, 'objective', null,
      array['va','vision','snellen'], null),
    (post_id, 'investigation', 3, 'intraocular pressure', 'core', null, 'objective', null,
      array['iop','tonometry','digital tension'], null),
    (post_id, 'investigation', 4, 'bleb', 'core', null, 'objective', 'Bleb formed, diffuse',
      array['bleb height','flat bleb','bleb leak','seidel'], null),
    (post_id, 'investigation', 5, 'anterior chamber depth', 'core', null, 'objective', 'Formed',
      array['ac depth','shallow ac','flat ac','ac'], null),
    (post_id, 'investigation', 6, 'hyphaema', 'core', null, 'objective', 'No hyphaema',
      array['hyphema','blood in ac'], null),
    (post_id, 'red_flag', 7, 'hypotony or choroidal detachment', 'core', 'urgent', 'objective', 'No hypotony',
      array['low iop','hypotony','choroidal','shallow chamber'], null),
    (post_id, 'red_flag', 8, 'endophthalmitis or blebitis', 'core', 'critical', 'objective', 'No pain, no hypopyon',
      array['eye pain','hypopyon','blebitis','discharge','diminished vision'], null),
    (post_id, 'pathway_step', 9, 'glaucoma drops stopped in operated eye', 'core', null, 'plan', null,
      array['stopped drops','operated eye drops'], null),
    (post_id, 'pathway_step', 10, 'fellow eye treatment continued', 'core', null, 'plan', null,
      array['other eye','fellow eye','contralateral drops'], null),
    (post_id, 'pathway_step', 11, 'suture adjustment and follow-up', 'core', null, 'plan', null,
      array['suture lysis','releasable suture','follow up'], null);
end $$;

-- ---------------------------------------------------------------------------
-- vitreoretinal_surgery
-- ---------------------------------------------------------------------------
do $$
declare
  pre_id uuid;
  post_id uuid;
begin
  select id into pre_id from company_protocols
   where title = 'Vitreoretinal Surgery — Pre-operative Checklist' limit 1;
  if pre_id is null then
    insert into company_protocols (title, version, source_name, template_family, phase, status)
    values ('Vitreoretinal Surgery — Pre-operative Checklist', 'v1-draft', 'WardMate ophthalmology pack',
            'vitreoretinal_surgery', 'before_surgery', 'draft')
    returning id into pre_id;
  end if;

  delete from company_protocol_items where protocol_id = pre_id;

  insert into company_protocol_items
    (protocol_id, kind, position, prompt, importance, severity, soap_section, normal_phrase, aliases, trigger)
  values
    (pre_id, 'investigation', 1, 'eye to be operated', 'core', null, 'objective', null,
      array['operated eye','right eye','left eye','laterality'], null),
    (pre_id, 'investigation', 2, 'diagnosis', 'core', null, 'assessment', null,
      array['retinal detachment','rd','vitreous haemorrhage','macular hole','diabetic retinopathy','pdr'], null),
    (pre_id, 'investigation', 3, 'visual acuity', 'core', null, 'objective', null,
      array['va','vision','snellen','hand movements','pl pr'], null),
    (pre_id, 'investigation', 4, 'intraocular pressure', 'core', null, 'objective', null,
      array['iop','tonometry'], null),
    (pre_id, 'investigation', 5, 'macula status', 'core', null, 'objective', null,
      array['macula on','macula off','macula'], null),
    (pre_id, 'investigation', 6, 'b-scan ultrasound', 'core', null, 'objective', null,
      array['b-scan','usg eye','ultrasound b scan'], null),
    (pre_id, 'investigation', 7, 'blood sugar and blood pressure', 'core', null, 'objective', null,
      array['rbs','fbs','sugar','hba1c','bp','diabetes','hypertension'], null),
    (pre_id, 'investigation', 8, 'ability to posture', 'core', null, 'checks', null,
      array['posturing','prone position','face down','neck problems'], null),
    (pre_id, 'investigation', 9, 'eye marked', 'core', null, 'checks', null,
      array['site marked','marking'], null),
    (pre_id, 'investigation', 10, 'fasting status', 'optional', null, 'checks', null,
      array['npo','nil by mouth','nbm','fasting'], null),
    (pre_id, 'investigation', 11, 'consent', 'core', null, 'checks', null,
      array['consent taken','consented'], null),
    (pre_id, 'investigation', 12, 'fitness', 'core', null, 'checks', null,
      array['pac','physician clearance','fit for surgery'], null);

  select id into post_id from company_protocols
   where title = 'Vitreoretinal Surgery — Post-operative Checklist' limit 1;
  if post_id is null then
    insert into company_protocols (title, version, source_name, template_family, phase, status)
    values ('Vitreoretinal Surgery — Post-operative Checklist', 'v1-draft', 'WardMate ophthalmology pack',
            'vitreoretinal_surgery', 'after_surgery', 'draft')
    returning id into post_id;
  end if;

  delete from company_protocol_items where protocol_id = post_id;

  insert into company_protocol_items
    (protocol_id, kind, position, prompt, importance, severity, soap_section, normal_phrase, aliases, trigger)
  values
    (post_id, 'investigation', 1, 'post-operative day', 'core', null, 'assessment', null,
      array['pod','post op day','day'], null),
    (post_id, 'investigation', 2, 'visual acuity', 'core', null, 'objective', null,
      array['va','vision','snellen'], null),
    (post_id, 'investigation', 3, 'intraocular pressure', 'core', null, 'objective', null,
      array['iop','tonometry','digital tension'], null),
    (post_id, 'red_flag', 4, 'raised pressure symptoms', 'core', 'urgent', 'subjective', 'No eye pain or vomiting',
      array['eye pain','vomiting','headache','corneal oedema','high iop'], null),
    (post_id, 'investigation', 5, 'tamponade', 'core', null, 'objective', null,
      array['gas','sf6','c3f8','silicone oil','oil fill','air fill'], null),
    (post_id, 'investigation', 6, 'posturing compliance', 'core', null, 'objective', 'Maintaining posture',
      array['prone','face down','posturing','head position'], null),
    (post_id, 'investigation', 7, 'retina', 'core', null, 'objective', 'Retina attached',
      array['flat retina','attached','redetachment','fundus'], null),
    (post_id, 'investigation', 8, 'anterior chamber', 'core', null, 'objective', 'Quiet',
      array['ac','cells','flare','ac reaction'], null),
    (post_id, 'red_flag', 9, 'endophthalmitis signs', 'core', 'critical', 'objective', 'No pain, no hypopyon',
      array['hypopyon','diminished vision','lid oedema','discharge','endophthalmitis'], null),
    (post_id, 'pathway_step', 10, 'no air travel or nitrous oxide with gas in eye', 'optional', null, 'plan', null,
      array['air travel','altitude','flying','nitrous oxide','gas bubble'],
      '{"when": [{"type": "history", "pattern": "gas|sf6|c3f8"}], "effect": "core"}'::jsonb),
    (post_id, 'pathway_step', 11, 'silicone oil removal planned', 'optional', null, 'plan', null,
      array['oil removal','sor'],
      '{"when": [{"type": "history", "pattern": "silicone oil|oil fill"}]}'::jsonb),
    (post_id, 'pathway_step', 12, 'follow-up date', 'core', null, 'plan', null,
      array['follow up','review','next visit'], null);
end $$;

-- ---------------------------------------------------------------------------
-- corneal_ulcer (non-operative)
-- ---------------------------------------------------------------------------
do $$
declare
  cu_id uuid;
begin
  select id into cu_id from company_protocols
   where title = 'Corneal Ulcer — Admission Checklist' limit 1;
  if cu_id is null then
    insert into company_protocols (title, version, source_name, template_family, phase, status)
    values ('Corneal Ulcer — Admission Checklist', 'v1-draft', 'WardMate ophthalmology pack',
            'corneal_ulcer', 'before_surgery', 'draft')
    returning id into cu_id;
  end if;

  delete from company_protocol_items where protocol_id = cu_id;

  insert into company_protocol_items
    (protocol_id, kind, position, prompt, importance, severity, soap_section, normal_phrase, aliases, trigger)
  values
    (cu_id, 'investigation', 1, 'eye affected', 'core', null, 'objective', null,
      array['right eye','left eye','laterality','re','le'], null),
    (cu_id, 'investigation', 2, 'duration and predisposing factor', 'core', null, 'subjective', null,
      array['trauma','vegetative matter','contact lens','injury','duration','native medicine'], null),
    (cu_id, 'investigation', 3, 'visual acuity', 'core', null, 'objective', null,
      array['va','vision','snellen','counting fingers','hand movements'], null),
    (cu_id, 'investigation', 4, 'ulcer size and depth', 'core', null, 'objective', null,
      array['size','infiltrate','epithelial defect','depth','thinning','slit lamp'], null),
    (cu_id, 'investigation', 5, 'hypopyon', 'core', null, 'objective', 'No hypopyon',
      array['ac reaction','hypopyon height'], null),
    (cu_id, 'investigation', 6, 'corneal scraping sent', 'core', null, 'objective', null,
      array['scraping','koh','gram stain','culture','smear'], null),
    (cu_id, 'immediate_action', 7, 'treatment started after scraping', 'core', null, 'plan', null,
      array['natamycin','moxifloxacin','fortified drops','antifungal drops','antibiotic drops'], null),
    (cu_id, 'red_flag', 8, 'impending or actual perforation', 'core', 'critical', 'objective',
      'No perforation, Seidel negative',
      array['perforation','seidel positive','descemetocele','flat ac','iris prolapse'], null),
    (cu_id, 'investigation', 9, 'response to treatment', 'core', null, 'assessment', null,
      array['healing','infiltrate reducing','epithelial defect smaller','worsening'],
      '{"when": [{"type": "hours_since_admission_gte", "hours": 48}], "effect": "core"}'::jsonb),
    (cu_id, 'investigation', 10, 'intraocular pressure', 'optional', null, 'objective', null,
      array['iop','digital tension'], null),
    (cu_id, 'investigation', 11, 'blood sugar', 'core', null, 'objective', null,
      array['rbs','fbs','diabetes','sugar'], null),
    (cu_id, 'investigation', 12, 'lacrimal sac syringing', 'optional', null, 'objective', 'Patent, no regurgitation',
      array['syringing','regurgitation','dacryocystitis'], null),
    (cu_id, 'pathway_step', 13, 'therapeutic keratoplasty considered', 'optional', null, 'plan', null,
      array['tpk','keratoplasty','glue','bandage contact lens'], null);
end $$;

-- =============================================================================================
-- ORTHOPAEDICS
-- =============================================================================================

-- ---------------------------------------------------------------------------
-- fracture_fixation
-- ---------------------------------------------------------------------------
do $$
declare
  pre_id uuid;
  post_id uuid;
begin
  select id into pre_id from company_protocols
   where title = 'Fracture Fixation — Pre-operative Checklist' limit 1;
  if pre_id is null then
    insert into company_protocols (title, version, source_name, template_family, phase, status)
    values ('Fracture Fixation — Pre-operative Checklist', 'v1-draft', 'WardMate orthopaedics pack',
            'fracture_fixation', 'before_surgery', 'draft')
    returning id into pre_id;
  end if;

  delete from company_protocol_items where protocol_id = pre_id;

  insert into company_protocol_items
    (protocol_id, kind, position, prompt, importance, severity, soap_section, normal_phrase, aliases, trigger)
  values
    (pre_id, 'investigation', 1, 'fracture site and side', 'core', null, 'assessment', null,
      array['side','laterality','site','bone','classification','fracture'], null),
    (pre_id, 'investigation', 2, 'mechanism and time of injury', 'core', null, 'subjective', null,
      array['rta','fall','mechanism','time of injury'], null),
    (pre_id, 'investigation', 3, 'distal neurovascular status', 'core', null, 'objective',
      'Distal pulses palpable, sensation and movement intact',
      array['distal pulses','neurovascular','sensation','capillary refill','dnvd','dnv'], null),
    (pre_id, 'red_flag', 4, 'compartment syndrome', 'core', 'critical', 'objective', 'Compartments soft',
      array['pain on passive stretch','tense compartment','pain out of proportion','compartment'], null),
    (pre_id, 'investigation', 5, 'skin over fracture', 'core', null, 'objective', 'Skin intact',
      array['skin','blisters','abrasion','tenting','swelling'], null),
    (pre_id, 'investigation', 6, 'x-rays reviewed', 'core', null, 'objective', null,
      array['x-ray','xray','radiograph','ap lateral','ct'], null),
    (pre_id, 'immediate_action', 7, 'limb immobilised and elevated', 'core', null, 'plan', null,
      array['slab','splint','traction','immobilised','elevation'], null),
    (pre_id, 'investigation', 8, 'routine blood investigations', 'core', null, 'objective', null,
      array['cbc','hb','rft','rbs','viral markers','coagulation'], null),
    (pre_id, 'investigation', 9, 'blood grouping and cross-match', 'core', null, 'checks', null,
      array['blood group','crossmatch','cross match','units reserved'], null),
    (pre_id, 'investigation', 10, 'site marked', 'core', null, 'checks', null,
      array['site marking','side marked','limb marked'], null),
    (pre_id, 'investigation', 11, 'fasting status', 'core', null, 'checks', null,
      array['npo','nil by mouth','nbm','fasting'], null),
    (pre_id, 'investigation', 12, 'consent', 'core', null, 'checks', null,
      array['consent taken','consented'], null),
    (pre_id, 'investigation', 13, 'fitness', 'core', null, 'checks', null,
      array['pac','anaesthetic clearance','fit for surgery'], null);

  select id into post_id from company_protocols
   where title = 'Fracture Fixation — Post-operative Checklist' limit 1;
  if post_id is null then
    insert into company_protocols (title, version, source_name, template_family, phase, status)
    values ('Fracture Fixation — Post-operative Checklist', 'v1-draft', 'WardMate orthopaedics pack',
            'fracture_fixation', 'after_surgery', 'draft')
    returning id into post_id;
  end if;

  delete from company_protocol_items where protocol_id = post_id;

  insert into company_protocol_items
    (protocol_id, kind, position, prompt, importance, severity, soap_section, normal_phrase, aliases, trigger)
  values
    (post_id, 'investigation', 1, 'post-operative day', 'core', null, 'assessment', null,
      array['pod','post op day','day'], null),
    (post_id, 'investigation', 2, 'pain', 'core', null, 'subjective', 'No fresh pain',
      array['pain score','limb pain'], null),
    (post_id, 'investigation', 3, 'distal neurovascular status', 'core', null, 'objective',
      'Distal pulses palpable, sensation and movement intact',
      array['distal pulses','neurovascular','sensation','capillary refill','dnvd','dnv'], null),
    (post_id, 'red_flag', 4, 'compartment syndrome', 'core', 'critical', 'objective', 'Compartments soft',
      array['pain on passive stretch','tense compartment','pain out of proportion','compartment'], null),
    (post_id, 'investigation', 5, 'wound', 'core', null, 'objective', 'Healthy, dry, no discharge',
      array['incision','dressing','suture line','soakage'], null),
    (post_id, 'investigation', 6, 'drain', 'optional', null, 'objective', 'Serous, not excessive',
      array['drain output','drain fluid','romovac'], null),
    (post_id, 'investigation', 7, 'check x-ray', 'core', null, 'objective', null,
      array['post op x-ray','implant position','reduction','alignment'], null),
    (post_id, 'investigation', 8, 'haemoglobin', 'optional', null, 'objective', null,
      array['hb','post op hb'], null),
    (post_id, 'immediate_action', 9, 'limb elevation', 'core', null, 'plan', null,
      array['elevation','pillow','limb elevated'], null),
    (post_id, 'red_flag', 10, 'fat embolism features', 'core', 'critical', 'assessment',
      'No breathlessness, confusion or petechiae',
      array['breathlessness','desaturation','confusion','petechiae','fat embolism'], null),
    (post_id, 'pathway_step', 11, 'dvt prophylaxis', 'core', null, 'plan', null,
      array['dvt','thromboprophylaxis','enoxaparin','stockings'], null),
    (post_id, 'pathway_step', 12, 'physiotherapy and weight-bearing status', 'core', null, 'plan', null,
      array['physio','range of motion','rom exercises','quadriceps exercises','non weight bearing','nwb','walker'], null),
    (post_id, 'pathway_step', 13, 'suture removal', 'core', null, 'plan', null,
      array['stitch removal','staples removed','sutures out'],
      '{"when": [{"type": "pod_gte", "days": 12}]}'::jsonb);
end $$;

-- ---------------------------------------------------------------------------
-- hip_fracture
-- ---------------------------------------------------------------------------
do $$
declare
  pre_id uuid;
  post_id uuid;
begin
  select id into pre_id from company_protocols
   where title = 'Hip Fracture — Pre-operative Checklist' limit 1;
  if pre_id is null then
    insert into company_protocols (title, version, source_name, template_family, phase, status)
    values ('Hip Fracture — Pre-operative Checklist', 'v1-draft', 'WardMate orthopaedics pack',
            'hip_fracture', 'before_surgery', 'draft')
    returning id into pre_id;
  end if;

  delete from company_protocol_items where protocol_id = pre_id;

  insert into company_protocol_items
    (protocol_id, kind, position, prompt, importance, severity, soap_section, normal_phrase, aliases, trigger)
  values
    (pre_id, 'investigation', 1, 'fracture type and side', 'core', null, 'assessment', null,
      array['neck of femur','intertrochanteric','subtrochanteric','garden','nof','it fracture'], null),
    (pre_id, 'investigation', 2, 'mechanism of fall', 'core', null, 'subjective', null,
      array['fall','syncope','trip','mechanical fall','blackout'], null),
    (pre_id, 'investigation', 3, 'pre-injury mobility', 'core', null, 'subjective', null,
      array['walking aid','independent','mobility before fall','lives with'], null),
    (pre_id, 'investigation', 4, 'cognition', 'core', null, 'objective', 'Oriented',
      array['amts','confusion','dementia','delirium','orientation'], null),
    (pre_id, 'investigation', 5, 'comorbidities and medications', 'core', null, 'subjective', null,
      array['diabetes','hypertension','cardiac','anticoagulant','blood thinner'], null),
    (pre_id, 'investigation', 6, 'pressure areas', 'core', null, 'objective', 'Intact',
      array['heels','sacrum','bedsore','pressure sore','skin'], null),
    (pre_id, 'immediate_action', 7, 'analgesia', 'core', null, 'plan', null,
      array['pain relief','fascia iliaca block','nerve block'], null),
    (pre_id, 'investigation', 8, 'routine bloods, ecg and chest x-ray', 'core', null, 'objective', null,
      array['cbc','rft','electrolytes','sodium','ecg','cxr','echo'], null),
    (pre_id, 'investigation', 9, 'blood grouping and cross-match', 'core', null, 'checks', null,
      array['blood group','crossmatch','cross match','units reserved'], null),
    (pre_id, 'immediate_action', 10, 'skin traction', 'optional', null, 'plan', null,
      array['traction','buck traction'], null),
    (pre_id, 'red_flag', 11, 'surgery delayed beyond 48 hours', 'optional', 'warning', 'assessment', null,
      array['delay','reason for delay','ot not available','medical optimisation'],
      '{"when": [{"type": "hours_since_admission_gte", "hours": 48}], "effect": "core"}'::jsonb),
    (pre_id, 'investigation', 12, 'fasting status', 'core', null, 'checks', null,
      array['npo','nil by mouth','nbm','fasting'], null),
    (pre_id, 'investigation', 13, 'consent', 'core', null, 'checks', null,
      array['consent taken','consented','high risk consent'], null),
    (pre_id, 'investigation', 14, 'fitness', 'core', null, 'checks', null,
      array['pac','anaesthetic clearance','fit for surgery','cardiology clearance'], null);

  select id into post_id from company_protocols
   where title = 'Hip Fracture — Post-operative Checklist' limit 1;
  if post_id is null then
    insert into company_protocols (title, version, source_name, template_family, phase, status)
    values ('Hip Fracture — Post-operative Checklist', 'v1-draft', 'WardMate orthopaedics pack',
            'hip_fracture', 'after_surgery', 'draft')
    returning id into post_id;
  end if;

  delete from company_protocol_items where protocol_id = post_id;

  insert into company_protocol_items
    (protocol_id, kind, position, prompt, importance, severity, soap_section, normal_phrase, aliases, trigger)
  values
    (post_id, 'investigation', 1, 'post-operative day', 'core', null, 'assessment', null,
      array['pod','post op day','day'], null),
    (post_id, 'investigation', 2, 'pain', 'core', null, 'subjective', 'No fresh pain',
      array['pain score','hip pain'], null),
    (post_id, 'red_flag', 3, 'delirium', 'core', 'urgent', 'objective', 'Conscious, oriented',
      array['confusion','agitation','disoriented','sensorium'], null),
    (post_id, 'investigation', 4, 'wound', 'core', null, 'objective', 'Healthy, dry, no discharge',
      array['incision','dressing','suture line','soakage'], null),
    (post_id, 'investigation', 5, 'haemoglobin', 'core', null, 'objective', null,
      array['hb','post op hb','transfusion'], null),
    (post_id, 'investigation', 6, 'urine output and catheter', 'core', null, 'objective', 'Adequate',
      array['uop','catheter','urine output','retention'], null),
    (post_id, 'investigation', 7, 'pressure areas', 'core', null, 'objective', 'Intact',
      array['heels','sacrum','bedsore','pressure sore'], null),
    (post_id, 'investigation', 8, 'check x-ray', 'core', null, 'objective', null,
      array['post op x-ray','implant position','reduction'], null),
    (post_id, 'pathway_step', 9, 'mobilised out of bed', 'optional', null, 'plan', null,
      array['sat up','out of bed','weight bearing','walker','day 1 mobilisation'],
      '{"when": [{"type": "pod_gte", "days": 1}], "effect": "core"}'::jsonb),
    (post_id, 'pathway_step', 10, 'dvt prophylaxis', 'core', null, 'plan', null,
      array['dvt','thromboprophylaxis','enoxaparin','stockings'], null),
    (post_id, 'red_flag', 11, 'chest infection or thromboembolism', 'core', 'urgent', 'assessment',
      'Chest clear, no calf tenderness',
      array['cough','desaturation','calf swelling','dvt','pe','pneumonia'], null),
    (post_id, 'investigation', 12, 'bowels', 'optional', null, 'objective', 'Passed',
      array['constipation','motion'], null),
    (post_id, 'pathway_step', 13, 'bone health and falls assessment', 'core', null, 'plan', null,
      array['osteoporosis','vitamin d','calcium','bone health','falls risk'], null),
    (post_id, 'pathway_step', 14, 'suture removal', 'core', null, 'plan', null,
      array['stitch removal','staples removed','sutures out'],
      '{"when": [{"type": "pod_gte", "days": 12}]}'::jsonb);
end $$;

-- ---------------------------------------------------------------------------
-- arthroplasty
-- ---------------------------------------------------------------------------
do $$
declare
  pre_id uuid;
  post_id uuid;
begin
  select id into pre_id from company_protocols
   where title = 'Joint Replacement (Arthroplasty) — Pre-operative Checklist' limit 1;
  if pre_id is null then
    insert into company_protocols (title, version, source_name, template_family, phase, status)
    values ('Joint Replacement (Arthroplasty) — Pre-operative Checklist', 'v1-draft',
            'WardMate orthopaedics pack', 'arthroplasty', 'before_surgery', 'draft')
    returning id into pre_id;
  end if;

  delete from company_protocol_items where protocol_id = pre_id;

  insert into company_protocol_items
    (protocol_id, kind, position, prompt, importance, severity, soap_section, normal_phrase, aliases, trigger)
  values
    (pre_id, 'investigation', 1, 'joint and side', 'core', null, 'assessment', null,
      array['knee','hip','tkr','thr','right','left'], null),
    (pre_id, 'investigation', 2, 'indication', 'core', null, 'assessment', null,
      array['osteoarthritis','rheumatoid','avascular necrosis','avn'], null),
    (pre_id, 'investigation', 3, 'x-rays and templating', 'core', null, 'objective', null,
      array['x-ray','templating','standing x-ray','deformity'], null),
    (pre_id, 'investigation', 4, 'skin over operative site', 'core', null, 'objective', 'Intact, no infection',
      array['skin','scratch','ulcer','dermatitis'], null),
    (pre_id, 'red_flag', 5, 'active infection anywhere', 'core', 'urgent', 'assessment', 'No active infection',
      array['dental infection','uti','urine infection','skin infection','boils','caries'], null),
    (pre_id, 'investigation', 6, 'blood sugar control', 'core', null, 'objective', null,
      array['hba1c','rbs','diabetes','sugar'], null),
    (pre_id, 'investigation', 7, 'routine bloods, ecg and chest x-ray', 'core', null, 'objective', null,
      array['cbc','rft','viral markers','ecg','cxr','echo'], null),
    (pre_id, 'investigation', 8, 'blood grouping and cross-match', 'core', null, 'checks', null,
      array['blood group','crossmatch','cross match','units reserved'], null),
    (pre_id, 'investigation', 9, 'implant availability confirmed', 'core', null, 'checks', null,
      array['implant','prosthesis','sizes available'], null),
    (pre_id, 'pathway_step', 10, 'pre-operative physiotherapy', 'optional', null, 'plan', null,
      array['physio','quadriceps exercises','walker training'], null),
    (pre_id, 'investigation', 11, 'site marked', 'core', null, 'checks', null,
      array['site marking','side marked','limb marked'], null),
    (pre_id, 'investigation', 12, 'fasting status', 'core', null, 'checks', null,
      array['npo','nil by mouth','nbm','fasting'], null),
    (pre_id, 'investigation', 13, 'consent', 'core', null, 'checks', null,
      array['consent taken','consented'], null),
    (pre_id, 'investigation', 14, 'fitness', 'core', null, 'checks', null,
      array['pac','anaesthetic clearance','fit for surgery'], null);

  select id into post_id from company_protocols
   where title = 'Joint Replacement (Arthroplasty) — Post-operative Checklist' limit 1;
  if post_id is null then
    insert into company_protocols (title, version, source_name, template_family, phase, status)
    values ('Joint Replacement (Arthroplasty) — Post-operative Checklist', 'v1-draft',
            'WardMate orthopaedics pack', 'arthroplasty', 'after_surgery', 'draft')
    returning id into post_id;
  end if;

  delete from company_protocol_items where protocol_id = post_id;

  insert into company_protocol_items
    (protocol_id, kind, position, prompt, importance, severity, soap_section, normal_phrase, aliases, trigger)
  values
    (post_id, 'investigation', 1, 'post-operative day', 'core', null, 'assessment', null,
      array['pod','post op day','day'], null),
    (post_id, 'investigation', 2, 'pain', 'core', null, 'subjective', 'No fresh pain',
      array['pain score','joint pain'], null),
    (post_id, 'investigation', 3, 'distal neurovascular status', 'core', null, 'objective',
      'Distal pulses palpable, sensation and movement intact',
      array['distal pulses','neurovascular','foot drop','sensation','dnvd','dnv'], null),
    (post_id, 'investigation', 4, 'wound', 'core', null, 'objective', 'Healthy, dry, no discharge',
      array['incision','dressing','suture line','soakage'], null),
    (post_id, 'investigation', 5, 'drain', 'optional', null, 'objective', 'Serous, not excessive',
      array['drain output','drain fluid','romovac'], null),
    (post_id, 'investigation', 6, 'haemoglobin', 'core', null, 'objective', null,
      array['hb','post op hb','transfusion'], null),
    (post_id, 'investigation', 7, 'check x-ray', 'core', null, 'objective', null,
      array['post op x-ray','implant position','component alignment'], null),
    (post_id, 'red_flag', 8, 'hip dislocation signs', 'optional', 'urgent', 'objective', 'Limb in neutral, no shortening',
      array['dislocation','shortening','internal rotation','sudden pain'],
      '{"when": [{"type": "history", "pattern": "thr|total hip|hip replacement|hemiarthroplasty"}]}'::jsonb),
    (post_id, 'red_flag', 9, 'dvt or pe features', 'core', 'urgent', 'assessment', 'No calf tenderness or breathlessness',
      array['calf pain','calf swelling','dvt','pe','breathlessness','desaturation'], null),
    (post_id, 'investigation', 10, 'urinary retention', 'optional', null, 'objective', 'Passing urine normally',
      array['retention','catheter','voided'], null),
    (post_id, 'pathway_step', 11, 'dvt prophylaxis', 'core', null, 'plan', null,
      array['dvt','thromboprophylaxis','enoxaparin','stockings'], null),
    (post_id, 'pathway_step', 12, 'range of motion and mobilisation', 'core', null, 'plan', null,
      array['knee bending','flexion','cpm','weight bearing','walker','rom'], null),
    (post_id, 'pathway_step', 13, 'joint precautions advised', 'core', null, 'plan', null,
      array['hip precautions','no cross legs','no low chairs','precautions'], null),
    (post_id, 'pathway_step', 14, 'suture removal', 'core', null, 'plan', null,
      array['stitch removal','staples removed','sutures out'],
      '{"when": [{"type": "pod_gte", "days": 12}]}'::jsonb);
end $$;

-- ---------------------------------------------------------------------------
-- limb_in_cast (cast / slab / traction care — non-operative)
-- ---------------------------------------------------------------------------
do $$
declare
  lc_id uuid;
begin
  select id into lc_id from company_protocols
   where title = 'Cast, Slab and Traction Care — Checklist' limit 1;
  if lc_id is null then
    insert into company_protocols (title, version, source_name, template_family, phase, status)
    values ('Cast, Slab and Traction Care — Checklist', 'v1-draft', 'WardMate orthopaedics pack',
            'limb_in_cast', 'before_surgery', 'draft')
    returning id into lc_id;
  end if;

  delete from company_protocol_items where protocol_id = lc_id;

  insert into company_protocol_items
    (protocol_id, kind, position, prompt, importance, severity, soap_section, normal_phrase, aliases, trigger)
  values
    (lc_id, 'investigation', 1, 'type of immobilisation', 'core', null, 'objective', null,
      array['cast','slab','pop','plaster','traction','skeletal traction','skin traction','splint'], null),
    (lc_id, 'investigation', 2, 'distal neurovascular status', 'core', null, 'objective',
      'Distal pulses palpable, sensation and movement intact',
      array['distal pulses','neurovascular','sensation','capillary refill','dnvd','dnv'], null),
    (lc_id, 'red_flag', 3, 'compartment syndrome or tight cast', 'core', 'critical', 'objective',
      'No pain on passive stretch, cast not tight',
      array['tight cast','pain on passive stretch','numbness','bivalve','pain out of proportion'], null),
    (lc_id, 'investigation', 4, 'swelling of digits', 'core', null, 'objective', 'No swelling',
      array['finger swelling','toe swelling','oedema'], null),
    (lc_id, 'investigation', 5, 'cast condition', 'core', null, 'objective', 'Intact, dry',
      array['soft cast','broken','wet','loose'], null),
    (lc_id, 'investigation', 6, 'pressure areas and cast edges', 'core', null, 'objective', 'No pressure sores',
      array['edges','padding','heel','pressure sore'], null),
    (lc_id, 'immediate_action', 7, 'limb elevation', 'core', null, 'plan', null,
      array['elevation','pillow','limb elevated'], null),
    (lc_id, 'investigation', 8, 'traction weights and alignment', 'optional', null, 'objective', null,
      array['weights','free hanging','traction alignment'],
      '{"when": [{"type": "history", "pattern": "traction"}], "effect": "core"}'::jsonb),
    (lc_id, 'investigation', 9, 'pin site', 'optional', null, 'objective', 'Clean, no discharge',
      array['pin tract','steinmann pin','pin site infection'],
      '{"when": [{"type": "history", "pattern": "skeletal traction|steinmann|denham|pin"}], "effect": "core"}'::jsonb),
    (lc_id, 'investigation', 10, 'check x-ray after reduction', 'core', null, 'objective', null,
      array['check x-ray','post reduction x-ray','alignment'], null),
    (lc_id, 'pathway_step', 11, 'finger and toe exercises', 'core', null, 'plan', null,
      array['finger movements','toe movements','active movements','exercises'], null),
    (lc_id, 'pathway_step', 12, 'dvt prophylaxis', 'optional', null, 'plan', null,
      array['dvt','thromboprophylaxis','enoxaparin','stockings'], null),
    (lc_id, 'pathway_step', 13, 'cast care advice', 'core', null, 'plan', null,
      array['keep dry','cast advice','warning signs','when to come back'], null);
end $$;

-- ---------------------------------------------------------------------------
-- open_fracture
-- ---------------------------------------------------------------------------
do $$
declare
  pre_id uuid;
  post_id uuid;
begin
  select id into pre_id from company_protocols
   where title = 'Open Fracture — Pre-operative Checklist' limit 1;
  if pre_id is null then
    insert into company_protocols (title, version, source_name, template_family, phase, status)
    values ('Open Fracture — Pre-operative Checklist', 'v1-draft', 'WardMate orthopaedics pack',
            'open_fracture', 'before_surgery', 'draft')
    returning id into pre_id;
  end if;

  delete from company_protocol_items where protocol_id = pre_id;

  insert into company_protocol_items
    (protocol_id, kind, position, prompt, importance, severity, soap_section, normal_phrase, aliases, trigger)
  values
    (pre_id, 'investigation', 1, 'fracture site and side', 'core', null, 'assessment', null,
      array['side','laterality','site','bone','fracture'], null),
    (pre_id, 'investigation', 2, 'time of injury', 'core', null, 'subjective', null,
      array['hours since injury','rta','mechanism'], null),
    (pre_id, 'investigation', 3, 'wound size and contamination', 'core', null, 'objective', null,
      array['wound','gustilo','contamination','soil','bone exposed'], null),
    (pre_id, 'immediate_action', 4, 'wound photographed and covered', 'core', null, 'plan', null,
      array['photograph','sterile dressing','saline gauze','covered'], null),
    (pre_id, 'immediate_action', 5, 'antibiotic given and time', 'core', null, 'plan', null,
      array['antibiotic','first dose','cefazolin','gentamicin'],
      '{"when": [{"type": "hours_since_admission_gte", "hours": 1}], "effect": "core"}'::jsonb),
    (pre_id, 'immediate_action', 6, 'tetanus prophylaxis', 'core', null, 'plan', null,
      array['tetanus','tt','td','tig','ats'], null),
    (pre_id, 'investigation', 7, 'distal neurovascular status', 'core', null, 'objective',
      'Distal pulses palpable, sensation and movement intact',
      array['distal pulses','neurovascular','sensation','capillary refill','dnvd','dnv'], null),
    (pre_id, 'red_flag', 8, 'hard signs of vascular injury', 'core', 'critical', 'objective', 'No hard signs',
      array['pulseless','expanding haematoma','pulsatile bleeding','cold limb','doppler'], null),
    (pre_id, 'red_flag', 9, 'compartment syndrome', 'core', 'critical', 'objective', 'Compartments soft',
      array['pain on passive stretch','tense compartment','pain out of proportion','compartment'], null),
    (pre_id, 'immediate_action', 10, 'limb splinted', 'core', null, 'plan', null,
      array['slab','splint','immobilised','traction'], null),
    (pre_id, 'investigation', 11, 'x-rays reviewed', 'core', null, 'objective', null,
      array['x-ray','xray','radiograph','ap lateral'], null),
    (pre_id, 'investigation', 12, 'blood grouping and cross-match', 'core', null, 'checks', null,
      array['blood group','crossmatch','cross match','units reserved','hb'], null),
    (pre_id, 'investigation', 13, 'fasting status', 'core', null, 'checks', null,
      array['npo','nil by mouth','nbm','fasting'], null),
    (pre_id, 'investigation', 14, 'consent', 'core', null, 'checks', null,
      array['consent taken','consented'], null),
    (pre_id, 'investigation', 15, 'fitness', 'core', null, 'checks', null,
      array['pac','anaesthetic clearance','fit for surgery'], null);

  select id into post_id from company_protocols
   where title = 'Open Fracture — Post-operative Checklist' limit 1;
  if post_id is null then
    insert into company_protocols (title, version, source_name, template_family, phase, status)
    values ('Open Fracture — Post-operative Checklist', 'v1-draft', 'WardMate orthopaedics pack',
            'open_fracture', 'after_surgery', 'draft')
    returning id into post_id;
  end if;

  delete from company_protocol_items where protocol_id = post_id;

  insert into company_protocol_items
    (protocol_id, kind, position, prompt, importance, severity, soap_section, normal_phrase, aliases, trigger)
  values
    (post_id, 'investigation', 1, 'post-operative day', 'core', null, 'assessment', null,
      array['pod','post op day','day'], null),
    (post_id, 'investigation', 2, 'fever', 'core', null, 'objective', 'Afebrile',
      array['temperature','febrile','temp'], null),
    (post_id, 'investigation', 3, 'wound', 'core', null, 'objective', 'Healthy, dry, no discharge',
      array['incision','dressing','soakage','wound bed'], null),
    (post_id, 'red_flag', 4, 'wound infection', 'core', 'urgent', 'objective', 'No discharge or spreading redness',
      array['pus','discharge','foul smell','cellulitis','erythema'], null),
    (post_id, 'investigation', 5, 'distal neurovascular status', 'core', null, 'objective',
      'Distal pulses palpable, sensation and movement intact',
      array['distal pulses','neurovascular','sensation','capillary refill','dnvd','dnv'], null),
    (post_id, 'red_flag', 6, 'compartment syndrome', 'core', 'critical', 'objective', 'Compartments soft',
      array['pain on passive stretch','tense compartment','pain out of proportion','compartment'], null),
    (post_id, 'investigation', 7, 'external fixator pin sites', 'optional', null, 'objective', 'Clean, no discharge',
      array['pin site','ex fix','fixator'], null),
    (post_id, 'investigation', 8, 'check x-ray', 'core', null, 'objective', null,
      array['post op x-ray','implant position','reduction','alignment'], null),
    (post_id, 'investigation', 9, 'haemoglobin', 'optional', null, 'objective', null,
      array['hb','post op hb'], null),
    (post_id, 'pathway_step', 10, 'antibiotic duration reviewed', 'core', null, 'plan', null,
      array['antibiotic review','stop antibiotics','wound culture'], null),
    (post_id, 'pathway_step', 11, 'relook debridement or soft-tissue cover planned', 'core', null, 'plan', null,
      array['relook','second look','debridement','flap','skin graft','wound cover','vac'], null),
    (post_id, 'pathway_step', 12, 'limb elevation and physiotherapy', 'core', null, 'plan', null,
      array['elevation','physio','range of motion','non weight bearing'], null),
    (post_id, 'pathway_step', 13, 'dvt prophylaxis', 'core', null, 'plan', null,
      array['dvt','thromboprophylaxis','enoxaparin','stockings'], null);
end $$;

-- ---------------------------------------------------------------------------
-- Picker rows. All four packs use pickerPhase 'after_surgery', so every row is filed there.
-- Idempotent by hand rather than ON CONFLICT: ward_id and variant are null, and Postgres
-- treats nulls as distinct in the unique index (see 0061).
-- ---------------------------------------------------------------------------
insert into care_templates (ward_id, family, variant, phase, name)
select null::uuid, v.family, v.variant, v.phase, v.name
from (values
  ('lscs',                  null::text, 'after_surgery'::care_phase, 'Caesarean section (LSCS)'),
  ('normal_delivery',       null,       'after_surgery',             'Normal delivery (postnatal)'),
  ('pre_eclampsia',         null,       'after_surgery',             'Pre-eclampsia'),
  ('antenatal_admission',   null,       'after_surgery',             'Antenatal admission'),
  ('tonsillectomy',         null,       'after_surgery',             'Tonsillectomy'),
  ('ear_surgery',           null,       'after_surgery',             'Ear surgery (tympanoplasty / mastoidectomy)'),
  ('fess',                  null,       'after_surgery',             'FESS (endoscopic sinus surgery)'),
  ('tracheostomy',          null,       'after_surgery',             'Tracheostomy'),
  ('cataract_surgery',      null,       'after_surgery',             'Cataract surgery'),
  ('glaucoma_surgery',      null,       'after_surgery',             'Glaucoma surgery (trabeculectomy)'),
  ('vitreoretinal_surgery', null,       'after_surgery',             'Vitreoretinal surgery'),
  ('corneal_ulcer',         null,       'after_surgery',             'Corneal ulcer'),
  ('fracture_fixation',     null,       'after_surgery',             'Fracture fixation'),
  ('hip_fracture',          null,       'after_surgery',             'Hip fracture'),
  ('arthroplasty',          null,       'after_surgery',             'Joint replacement (arthroplasty)'),
  ('limb_in_cast',          null,       'after_surgery',             'Cast / slab / traction care'),
  ('open_fracture',         null,       'after_surgery',             'Open fracture')
) as v(family, variant, phase, name)
where not exists (
  select 1 from care_templates c
  where c.ward_id is null
    and c.family = v.family
    and c.variant is not distinct from v.variant
    and c.phase = v.phase
);

commit;
