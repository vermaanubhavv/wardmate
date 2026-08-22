-- Files the remaining nine procedures (eighteen templates) from
-- supabase/patches/0005_template_seed.sql as protocol cards, word for word, the same pattern
-- 0037_lap_chole_checklist_protocol_seed.sql used for Lap Chole. All filed as 'draft' —
-- publishing each one, procedure by procedure, is what actually switches
-- "Where things stand" over from care_templates to here; see lib/templates.ts.
--
-- care_templates itself is left in place and untouched: any procedure whose protocol is not
-- yet published keeps reading from it exactly as before.

begin;

do $$
declare
  publisher_id uuid := (select id from auth.users where lower(email) = 'anubhavsinhmar@gmail.com');
  new_id uuid;
begin

  if not exists (select 1 from company_protocols where title = 'Appendicectomy, Acute — Before Surgery Checklist' and version = 'v1') then
    insert into company_protocols
      (title, version, source_name, phase, template_family, template_variant, status, created_by)
    values
      ('Appendicectomy, Acute — Before Surgery Checklist', 'v1', 'Unit protocol', 'before_surgery', 'appendicectomy', 'acute', 'draft', publisher_id)
    returning id into new_id;

    insert into company_protocol_items (protocol_id, kind, position, prompt, importance, aliases) values
      (new_id, 'investigation', 1, 'pain', 'core', array['abdominal pain','right iliac fossa pain','rif pain','migration','migratory pain']),
      (new_id, 'investigation', 2, 'duration of symptoms', 'core', array['duration','since','days of pain']),
      (new_id, 'investigation', 3, 'fever', 'core', array['temperature','febrile','afebrile']),
      (new_id, 'investigation', 4, 'vitals', 'core', array['pulse','bp','blood pressure','tachycardia']),
      (new_id, 'investigation', 5, 'abdomen', 'core', array['tenderness','guarding','rebound','rigidity']),
      (new_id, 'investigation', 6, 'total count', 'core', array['tlc','wbc','white cell count','leucocyte count','counts']),
      (new_id, 'investigation', 7, 'imaging', 'core', array['usg','ultrasound','ct','ct abdomen']),
      (new_id, 'investigation', 8, 'antibiotics', 'core', array['antibiotic','started on']),
      (new_id, 'investigation', 9, 'fasting status', 'core', array['npo','nil by mouth','nbm','fasting']),
      (new_id, 'investigation', 10, 'consent', 'core', array['consent taken','consented']),
      (new_id, 'investigation', 11, 'fitness', 'core', array['anaesthetic clearance','pac','fit for surgery']),
      (new_id, 'investigation', 12, 'vomiting', 'optional', array['vomit','nausea']),
      (new_id, 'investigation', 13, 'urine examination', 'optional', array['urine routine','urine microscopy']);
  end if;

  if not exists (select 1 from company_protocols where title = 'Appendicectomy, Acute — After Surgery Checklist' and version = 'v1') then
    insert into company_protocols
      (title, version, source_name, phase, template_family, template_variant, status, created_by)
    values
      ('Appendicectomy, Acute — After Surgery Checklist', 'v1', 'Unit protocol', 'after_surgery', 'appendicectomy', 'acute', 'draft', publisher_id)
    returning id into new_id;

    insert into company_protocol_items (protocol_id, kind, position, prompt, importance, aliases) values
      (new_id, 'investigation', 1, 'post-operative day', 'core', array['pod','post op day','day']),
      (new_id, 'investigation', 2, 'fever', 'core', array['temperature','afebrile','febrile','temp']),
      (new_id, 'investigation', 3, 'pain', 'core', array['pain score','abdominal pain']),
      (new_id, 'investigation', 4, 'abdomen', 'core', array['abdominal examination','soft','distended','tenderness']),
      (new_id, 'investigation', 5, 'wound', 'core', array['incision','dressing','suture line','port sites']),
      (new_id, 'investigation', 6, 'drain', 'core', array['drain output','drain fluid']),
      (new_id, 'investigation', 7, 'oral intake', 'core', array['orals','tolerating orals','diet','feeds']),
      (new_id, 'investigation', 8, 'flatus', 'core', array['bowel sounds','passed flatus','motion','bowels']),
      (new_id, 'investigation', 9, 'ambulation', 'core', array['mobilised','walking','ambulating','out of bed']),
      (new_id, 'pathway_step', 10, 'plan', 'core', array['discharge','suture removal','antibiotics']),
      (new_id, 'investigation', 11, 'vitals', 'optional', array['pulse','bp','blood pressure']),
      (new_id, 'investigation', 12, 'histopathology', 'optional', array['hpe','biopsy','histopath','specimen']);
  end if;

  if not exists (select 1 from company_protocols where title = 'Appendicectomy, Interval — Before Surgery Checklist' and version = 'v1') then
    insert into company_protocols
      (title, version, source_name, phase, template_family, template_variant, status, created_by)
    values
      ('Appendicectomy, Interval — Before Surgery Checklist', 'v1', 'Unit protocol', 'before_surgery', 'appendicectomy', 'interval', 'draft', publisher_id)
    returning id into new_id;

    insert into company_protocol_items (protocol_id, kind, position, prompt, importance, aliases) values
      (new_id, 'investigation', 1, 'index episode', 'core', array['previous episode','first attack','when treated','index admission']),
      (new_id, 'investigation', 2, 'interval since episode', 'core', array['interval','weeks since','months since']),
      (new_id, 'investigation', 3, 'conservative treatment', 'core', array['managed conservatively','antibiotics given','drainage','abscess drained']),
      (new_id, 'investigation', 4, 'current symptoms', 'core', array['symptoms','pain','asymptomatic']),
      (new_id, 'investigation', 5, 'imaging', 'core', array['usg','ultrasound','ct','ct abdomen']),
      (new_id, 'investigation', 6, 'fitness', 'core', array['anaesthetic clearance','pac','fit for surgery']),
      (new_id, 'investigation', 7, 'consent', 'core', array['consent taken','consented']),
      (new_id, 'investigation', 8, 'fasting status', 'core', array['npo','nil by mouth','nbm','fasting']),
      (new_id, 'investigation', 9, 'colonoscopy', 'optional', array['scopy','colonoscopy done']),
      (new_id, 'investigation', 10, 'comorbidities', 'optional', array['diabetes','hypertension','cardiac']);
  end if;

  if not exists (select 1 from company_protocols where title = 'Appendicectomy, Interval — After Surgery Checklist' and version = 'v1') then
    insert into company_protocols
      (title, version, source_name, phase, template_family, template_variant, status, created_by)
    values
      ('Appendicectomy, Interval — After Surgery Checklist', 'v1', 'Unit protocol', 'after_surgery', 'appendicectomy', 'interval', 'draft', publisher_id)
    returning id into new_id;

    insert into company_protocol_items (protocol_id, kind, position, prompt, importance, aliases) values
      (new_id, 'investigation', 1, 'post-operative day', 'core', array['pod','post op day','day']),
      (new_id, 'investigation', 2, 'fever', 'core', array['temperature','afebrile','febrile','temp']),
      (new_id, 'investigation', 3, 'pain', 'core', array['pain score','abdominal pain']),
      (new_id, 'investigation', 4, 'abdomen', 'core', array['abdominal examination','soft','distended']),
      (new_id, 'investigation', 5, 'wound', 'core', array['incision','dressing','suture line','port sites']),
      (new_id, 'investigation', 6, 'oral intake', 'core', array['orals','tolerating orals','diet']),
      (new_id, 'investigation', 7, 'flatus', 'core', array['bowel sounds','passed flatus','motion']),
      (new_id, 'pathway_step', 8, 'plan', 'core', array['discharge','suture removal']),
      (new_id, 'investigation', 9, 'drain', 'optional', array['drain output','drain fluid']),
      (new_id, 'investigation', 10, 'ambulation', 'optional', array['mobilised','walking','ambulating']),
      (new_id, 'investigation', 11, 'histopathology', 'optional', array['hpe','biopsy','histopath']);
  end if;

  if not exists (select 1 from company_protocols where title = 'Inguinal Hernia — Before Surgery Checklist' and version = 'v1') then
    insert into company_protocols
      (title, version, source_name, phase, template_family, template_variant, status, created_by)
    values
      ('Inguinal Hernia — Before Surgery Checklist', 'v1', 'Unit protocol', 'before_surgery', 'hernia', 'inguinal', 'draft', publisher_id)
    returning id into new_id;

    insert into company_protocol_items (protocol_id, kind, position, prompt, importance, aliases) values
      (new_id, 'investigation', 1, 'side', 'core', array['laterality','right','left','bilateral','site']),
      (new_id, 'investigation', 2, 'reducibility', 'core', array['reducible','irreducible','reduces']),
      (new_id, 'investigation', 3, 'cough impulse', 'core', array['impulse on cough','expansile impulse']),
      (new_id, 'investigation', 4, 'obstruction signs', 'core', array['obstructed','strangulated','tender swelling','irreducible and tender']),
      (new_id, 'investigation', 5, 'raised intra-abdominal pressure', 'core', array['chronic cough','copd','constipation','prostatism','straining','smoking']),
      (new_id, 'investigation', 6, 'testis and scrotum', 'core', array['testis','scrotum','scrotal examination']),
      (new_id, 'pathway_step', 7, 'repair planned', 'core', array['mesh','mesh repair','open repair','laparoscopic repair','tep','tapp']),
      (new_id, 'investigation', 8, 'fitness', 'core', array['anaesthetic clearance','pac','fit for surgery']),
      (new_id, 'investigation', 9, 'consent', 'core', array['consent taken','consented']),
      (new_id, 'investigation', 10, 'fasting status', 'core', array['npo','nil by mouth','nbm','fasting']),
      (new_id, 'investigation', 11, 'duration', 'optional', array['since','how long']),
      (new_id, 'investigation', 12, 'comorbidities', 'optional', array['diabetes','hypertension','cardiac']);
  end if;

  if not exists (select 1 from company_protocols where title = 'Inguinal Hernia — After Surgery Checklist' and version = 'v1') then
    insert into company_protocols
      (title, version, source_name, phase, template_family, template_variant, status, created_by)
    values
      ('Inguinal Hernia — After Surgery Checklist', 'v1', 'Unit protocol', 'after_surgery', 'hernia', 'inguinal', 'draft', publisher_id)
    returning id into new_id;

    insert into company_protocol_items (protocol_id, kind, position, prompt, importance, aliases) values
      (new_id, 'investigation', 1, 'post-operative day', 'core', array['pod','post op day','day']),
      (new_id, 'investigation', 2, 'pain', 'core', array['pain score','groin pain']),
      (new_id, 'investigation', 3, 'wound', 'core', array['incision','dressing','suture line']),
      (new_id, 'investigation', 4, 'scrotal swelling', 'core', array['scrotum','scrotal oedema','scrotal edema']),
      (new_id, 'investigation', 5, 'urinary retention', 'core', array['passed urine','retention','catheter','voiding']),
      (new_id, 'investigation', 6, 'oral intake', 'core', array['orals','tolerating orals','diet']),
      (new_id, 'investigation', 7, 'ambulation', 'core', array['mobilised','walking','ambulating','out of bed']),
      (new_id, 'pathway_step', 8, 'plan', 'core', array['discharge','suture removal','activity restriction','lifting']),
      (new_id, 'investigation', 9, 'seroma', 'optional', array['collection','swelling at site','fluid collection']),
      (new_id, 'investigation', 10, 'fever', 'optional', array['temperature','afebrile','febrile']);
  end if;

  if not exists (select 1 from company_protocols where title = 'Umbilical Hernia — Before Surgery Checklist' and version = 'v1') then
    insert into company_protocols
      (title, version, source_name, phase, template_family, template_variant, status, created_by)
    values
      ('Umbilical Hernia — Before Surgery Checklist', 'v1', 'Unit protocol', 'before_surgery', 'hernia', 'umbilical', 'draft', publisher_id)
    returning id into new_id;

    insert into company_protocol_items (protocol_id, kind, position, prompt, importance, aliases) values
      (new_id, 'investigation', 1, 'defect size', 'core', array['size','size of defect','swelling size']),
      (new_id, 'investigation', 2, 'reducibility', 'core', array['reducible','irreducible','reduces']),
      (new_id, 'investigation', 3, 'cough impulse', 'core', array['impulse on cough','expansile impulse']),
      (new_id, 'investigation', 4, 'obstruction signs', 'core', array['obstructed','strangulated','tender swelling']),
      (new_id, 'investigation', 5, 'skin over swelling', 'core', array['skin','overlying skin','ulceration']),
      (new_id, 'investigation', 6, 'raised intra-abdominal pressure', 'core', array['chronic cough','copd','constipation','ascites','obesity']),
      (new_id, 'pathway_step', 7, 'repair planned', 'core', array['mesh','mesh repair','anatomical repair']),
      (new_id, 'investigation', 8, 'fitness', 'core', array['anaesthetic clearance','pac','fit for surgery']),
      (new_id, 'investigation', 9, 'consent', 'core', array['consent taken','consented']),
      (new_id, 'investigation', 10, 'fasting status', 'core', array['npo','nil by mouth','nbm','fasting']),
      (new_id, 'investigation', 11, 'comorbidities', 'optional', array['diabetes','hypertension','cardiac']);
  end if;

  if not exists (select 1 from company_protocols where title = 'Umbilical Hernia — After Surgery Checklist' and version = 'v1') then
    insert into company_protocols
      (title, version, source_name, phase, template_family, template_variant, status, created_by)
    values
      ('Umbilical Hernia — After Surgery Checklist', 'v1', 'Unit protocol', 'after_surgery', 'hernia', 'umbilical', 'draft', publisher_id)
    returning id into new_id;

    insert into company_protocol_items (protocol_id, kind, position, prompt, importance, aliases) values
      (new_id, 'investigation', 1, 'post-operative day', 'core', array['pod','post op day','day']),
      (new_id, 'investigation', 2, 'pain', 'core', array['pain score']),
      (new_id, 'investigation', 3, 'wound', 'core', array['incision','dressing','suture line']),
      (new_id, 'investigation', 4, 'oral intake', 'core', array['orals','tolerating orals','diet']),
      (new_id, 'investigation', 5, 'ambulation', 'core', array['mobilised','walking','ambulating']),
      (new_id, 'pathway_step', 6, 'plan', 'core', array['discharge','suture removal','activity restriction']),
      (new_id, 'investigation', 7, 'seroma', 'optional', array['collection','swelling at site']),
      (new_id, 'investigation', 8, 'fever', 'optional', array['temperature','afebrile','febrile']);
  end if;

  if not exists (select 1 from company_protocols where title = 'Epigastric Hernia — Before Surgery Checklist' and version = 'v1') then
    insert into company_protocols
      (title, version, source_name, phase, template_family, template_variant, status, created_by)
    values
      ('Epigastric Hernia — Before Surgery Checklist', 'v1', 'Unit protocol', 'before_surgery', 'hernia', 'epigastric', 'draft', publisher_id)
    returning id into new_id;

    insert into company_protocol_items (protocol_id, kind, position, prompt, importance, aliases) values
      (new_id, 'investigation', 1, 'defect size', 'core', array['size','size of defect','swelling size']),
      (new_id, 'investigation', 2, 'reducibility', 'core', array['reducible','irreducible','reduces']),
      (new_id, 'investigation', 3, 'cough impulse', 'core', array['impulse on cough','expansile impulse']),
      (new_id, 'investigation', 4, 'obstruction signs', 'core', array['obstructed','strangulated','tender swelling']),
      (new_id, 'investigation', 5, 'raised intra-abdominal pressure', 'core', array['chronic cough','copd','constipation','straining']),
      (new_id, 'pathway_step', 6, 'repair planned', 'core', array['mesh','mesh repair','anatomical repair']),
      (new_id, 'investigation', 7, 'fitness', 'core', array['anaesthetic clearance','pac','fit for surgery']),
      (new_id, 'investigation', 8, 'consent', 'core', array['consent taken','consented']),
      (new_id, 'investigation', 9, 'fasting status', 'core', array['npo','nil by mouth','nbm','fasting']),
      (new_id, 'investigation', 10, 'comorbidities', 'optional', array['diabetes','hypertension','cardiac']);
  end if;

  if not exists (select 1 from company_protocols where title = 'Epigastric Hernia — After Surgery Checklist' and version = 'v1') then
    insert into company_protocols
      (title, version, source_name, phase, template_family, template_variant, status, created_by)
    values
      ('Epigastric Hernia — After Surgery Checklist', 'v1', 'Unit protocol', 'after_surgery', 'hernia', 'epigastric', 'draft', publisher_id)
    returning id into new_id;

    insert into company_protocol_items (protocol_id, kind, position, prompt, importance, aliases) values
      (new_id, 'investigation', 1, 'post-operative day', 'core', array['pod','post op day','day']),
      (new_id, 'investigation', 2, 'pain', 'core', array['pain score']),
      (new_id, 'investigation', 3, 'wound', 'core', array['incision','dressing','suture line']),
      (new_id, 'investigation', 4, 'oral intake', 'core', array['orals','tolerating orals','diet']),
      (new_id, 'investigation', 5, 'ambulation', 'core', array['mobilised','walking','ambulating']),
      (new_id, 'pathway_step', 6, 'plan', 'core', array['discharge','suture removal','activity restriction']),
      (new_id, 'investigation', 7, 'seroma', 'optional', array['collection','swelling at site']),
      (new_id, 'investigation', 8, 'fever', 'optional', array['temperature','afebrile','febrile']);
  end if;

  if not exists (select 1 from company_protocols where title = 'Incisional Hernia — Before Surgery Checklist' and version = 'v1') then
    insert into company_protocols
      (title, version, source_name, phase, template_family, template_variant, status, created_by)
    values
      ('Incisional Hernia — Before Surgery Checklist', 'v1', 'Unit protocol', 'before_surgery', 'hernia', 'incisional', 'draft', publisher_id)
    returning id into new_id;

    insert into company_protocol_items (protocol_id, kind, position, prompt, importance, aliases) values
      (new_id, 'investigation', 1, 'previous surgery', 'core', array['prior operation','previous operation','old scar','index surgery']),
      (new_id, 'investigation', 2, 'defect size', 'core', array['size','size of defect','defect']),
      (new_id, 'investigation', 3, 'reducibility', 'core', array['reducible','irreducible','reduces']),
      (new_id, 'investigation', 4, 'obstruction signs', 'core', array['obstructed','strangulated','tender swelling']),
      (new_id, 'investigation', 5, 'skin condition', 'core', array['skin','overlying skin','scar','ulceration']),
      (new_id, 'investigation', 6, 'raised intra-abdominal pressure', 'core', array['chronic cough','copd','constipation','obesity','ascites']),
      (new_id, 'pathway_step', 7, 'repair planned', 'core', array['mesh','mesh repair','onlay','sublay','component separation']),
      (new_id, 'investigation', 8, 'fitness', 'core', array['anaesthetic clearance','pac','fit for surgery']),
      (new_id, 'investigation', 9, 'consent', 'core', array['consent taken','consented']),
      (new_id, 'investigation', 10, 'fasting status', 'core', array['npo','nil by mouth','nbm','fasting']),
      (new_id, 'investigation', 11, 'imaging', 'optional', array['ct','ct abdomen','usg']),
      (new_id, 'investigation', 12, 'comorbidities', 'optional', array['diabetes','hypertension','cardiac']);
  end if;

  if not exists (select 1 from company_protocols where title = 'Incisional Hernia — After Surgery Checklist' and version = 'v1') then
    insert into company_protocols
      (title, version, source_name, phase, template_family, template_variant, status, created_by)
    values
      ('Incisional Hernia — After Surgery Checklist', 'v1', 'Unit protocol', 'after_surgery', 'hernia', 'incisional', 'draft', publisher_id)
    returning id into new_id;

    insert into company_protocol_items (protocol_id, kind, position, prompt, importance, aliases) values
      (new_id, 'investigation', 1, 'post-operative day', 'core', array['pod','post op day','day']),
      (new_id, 'investigation', 2, 'pain', 'core', array['pain score']),
      (new_id, 'investigation', 3, 'wound', 'core', array['incision','dressing','suture line']),
      (new_id, 'investigation', 4, 'drain', 'core', array['drain output','drain fluid']),
      (new_id, 'investigation', 5, 'abdomen', 'core', array['abdominal examination','distension','soft','distended']),
      (new_id, 'investigation', 6, 'oral intake', 'core', array['orals','tolerating orals','diet']),
      (new_id, 'investigation', 7, 'flatus', 'core', array['bowel sounds','passed flatus','motion']),
      (new_id, 'investigation', 8, 'ambulation', 'core', array['mobilised','walking','ambulating']),
      (new_id, 'pathway_step', 9, 'plan', 'core', array['discharge','drain removal','suture removal','abdominal binder']),
      (new_id, 'investigation', 10, 'seroma', 'optional', array['collection','swelling at site']),
      (new_id, 'investigation', 11, 'fever', 'optional', array['temperature','afebrile','febrile']);
  end if;

  if not exists (select 1 from company_protocols where title = 'Anal Fissure — Before Surgery Checklist' and version = 'v1') then
    insert into company_protocols
      (title, version, source_name, phase, template_family, template_variant, status, created_by)
    values
      ('Anal Fissure — Before Surgery Checklist', 'v1', 'Unit protocol', 'before_surgery', 'perianal', 'fissure', 'draft', publisher_id)
    returning id into new_id;

    insert into company_protocol_items (protocol_id, kind, position, prompt, importance, aliases) values
      (new_id, 'investigation', 1, 'pain', 'core', array['pain during defecation','painful defecation','burning']),
      (new_id, 'investigation', 2, 'bleeding', 'core', array['bleeding per rectum','pr bleed','streaking','blood in stool']),
      (new_id, 'investigation', 3, 'duration', 'core', array['since','how long','symptom duration']),
      (new_id, 'investigation', 4, 'chronicity', 'core', array['acute','chronic','sentinel tag','skin tag']),
      (new_id, 'investigation', 5, 'bowel habit', 'core', array['constipation','straining','hard stools','laxatives']),
      (new_id, 'investigation', 6, 'local examination', 'core', array['pr examination','per rectal examination','position','clock position','inspection']),
      (new_id, 'investigation', 7, 'sphincter spasm', 'core', array['spasm','sphincter tone','tone']),
      (new_id, 'investigation', 8, 'continence', 'core', array['incontinence','control','soiling']),
      (new_id, 'investigation', 9, 'fitness', 'core', array['anaesthetic clearance','pac','fit for surgery']),
      (new_id, 'investigation', 10, 'consent', 'core', array['consent taken','consented']),
      (new_id, 'investigation', 11, 'bowel preparation', 'core', array['enema','bowel prep','prep given']),
      (new_id, 'investigation', 12, 'previous treatment', 'optional', array['previous surgery','ointment','conservative treatment']);
  end if;

  if not exists (select 1 from company_protocols where title = 'Anal Fissure — After Surgery Checklist' and version = 'v1') then
    insert into company_protocols
      (title, version, source_name, phase, template_family, template_variant, status, created_by)
    values
      ('Anal Fissure — After Surgery Checklist', 'v1', 'Unit protocol', 'after_surgery', 'perianal', 'fissure', 'draft', publisher_id)
    returning id into new_id;

    insert into company_protocol_items (protocol_id, kind, position, prompt, importance, aliases) values
      (new_id, 'investigation', 1, 'post-operative day', 'core', array['pod','post op day','day']),
      (new_id, 'investigation', 2, 'pain', 'core', array['pain score','perianal pain']),
      (new_id, 'investigation', 3, 'bleeding', 'core', array['bleeding per rectum','pr bleed','soakage']),
      (new_id, 'investigation', 4, 'first bowel motion', 'core', array['motion passed','bowels opened','passed stool','defecation']),
      (new_id, 'investigation', 5, 'urinary retention', 'core', array['passed urine','retention','catheter','voiding']),
      (new_id, 'investigation', 6, 'dressing', 'core', array['pack','pack removed','wound','local dressing']),
      (new_id, 'pathway_step', 7, 'sitz bath', 'core', array['sitz baths','warm water bath','hip bath']),
      (new_id, 'investigation', 8, 'stool softener', 'core', array['laxative','lactulose','isabgol','softener']),
      (new_id, 'pathway_step', 9, 'plan', 'core', array['discharge','review','follow up']),
      (new_id, 'investigation', 10, 'continence', 'optional', array['incontinence','control','soiling']),
      (new_id, 'investigation', 11, 'fever', 'optional', array['temperature','afebrile','febrile']);
  end if;

  if not exists (select 1 from company_protocols where title = 'Anal Fistula — Before Surgery Checklist' and version = 'v1') then
    insert into company_protocols
      (title, version, source_name, phase, template_family, template_variant, status, created_by)
    values
      ('Anal Fistula — Before Surgery Checklist', 'v1', 'Unit protocol', 'before_surgery', 'perianal', 'fistula', 'draft', publisher_id)
    returning id into new_id;

    insert into company_protocol_items (protocol_id, kind, position, prompt, importance, aliases) values
      (new_id, 'investigation', 1, 'discharge', 'core', array['pus discharge','purulent discharge','soiling','serous discharge']),
      (new_id, 'investigation', 2, 'pain', 'core', array['perianal pain','pain']),
      (new_id, 'investigation', 3, 'duration', 'core', array['since','how long','symptom duration']),
      (new_id, 'investigation', 4, 'external opening', 'core', array['opening','external openings','clock position','position']),
      (new_id, 'investigation', 5, 'internal opening', 'core', array['internal openings','tract','fistula tract']),
      (new_id, 'investigation', 6, 'imaging', 'core', array['mri','mri fistulogram','fistulogram','usg']),
      (new_id, 'investigation', 7, 'continence', 'core', array['incontinence','control','soiling']),
      (new_id, 'investigation', 8, 'previous surgery', 'core', array['previous operation','prior surgery','recurrent','seton']),
      (new_id, 'investigation', 9, 'bowel habit', 'core', array['constipation','straining']),
      (new_id, 'investigation', 10, 'fitness', 'core', array['anaesthetic clearance','pac','fit for surgery']),
      (new_id, 'investigation', 11, 'consent', 'core', array['consent taken','consented']),
      (new_id, 'investigation', 12, 'bowel preparation', 'core', array['enema','bowel prep','prep given']);
  end if;

  if not exists (select 1 from company_protocols where title = 'Anal Fistula — After Surgery Checklist' and version = 'v1') then
    insert into company_protocols
      (title, version, source_name, phase, template_family, template_variant, status, created_by)
    values
      ('Anal Fistula — After Surgery Checklist', 'v1', 'Unit protocol', 'after_surgery', 'perianal', 'fistula', 'draft', publisher_id)
    returning id into new_id;

    insert into company_protocol_items (protocol_id, kind, position, prompt, importance, aliases) values
      (new_id, 'investigation', 1, 'post-operative day', 'core', array['pod','post op day','day']),
      (new_id, 'investigation', 2, 'pain', 'core', array['pain score','perianal pain']),
      (new_id, 'investigation', 3, 'bleeding', 'core', array['bleeding per rectum','pr bleed','soakage']),
      (new_id, 'investigation', 4, 'discharge', 'core', array['pus discharge','serous discharge','soiling']),
      (new_id, 'investigation', 5, 'seton', 'core', array['seton in situ','seton tight','thread']),
      (new_id, 'investigation', 6, 'first bowel motion', 'core', array['motion passed','bowels opened','passed stool']),
      (new_id, 'investigation', 7, 'urinary retention', 'core', array['passed urine','retention','catheter','voiding']),
      (new_id, 'investigation', 8, 'dressing', 'core', array['pack','pack removed','wound','local dressing']),
      (new_id, 'pathway_step', 9, 'sitz bath', 'core', array['sitz baths','warm water bath','hip bath']),
      (new_id, 'investigation', 10, 'stool softener', 'core', array['laxative','lactulose','isabgol','softener']),
      (new_id, 'investigation', 11, 'continence', 'core', array['incontinence','control','soiling']),
      (new_id, 'pathway_step', 12, 'plan', 'core', array['discharge','review','follow up','seton tightening']),
      (new_id, 'investigation', 13, 'fever', 'optional', array['temperature','afebrile','febrile']);
  end if;

  if not exists (select 1 from company_protocols where title = 'Haemorrhoids — Before Surgery Checklist' and version = 'v1') then
    insert into company_protocols
      (title, version, source_name, phase, template_family, template_variant, status, created_by)
    values
      ('Haemorrhoids — Before Surgery Checklist', 'v1', 'Unit protocol', 'before_surgery', 'perianal', 'haemorrhoids', 'draft', publisher_id)
    returning id into new_id;

    insert into company_protocol_items (protocol_id, kind, position, prompt, importance, aliases) values
      (new_id, 'investigation', 1, 'bleeding', 'core', array['bleeding per rectum','pr bleed','painless bleeding','blood in stool']),
      (new_id, 'investigation', 2, 'prolapse', 'core', array['mass per rectum','something coming out','reduces spontaneously','manual reduction']),
      (new_id, 'investigation', 3, 'grade', 'core', array['grading','first degree','second degree','third degree','fourth degree']),
      (new_id, 'investigation', 4, 'position', 'core', array['clock position','number of piles','primary piles']),
      (new_id, 'investigation', 5, 'pain', 'core', array['perianal pain','thrombosed','painful']),
      (new_id, 'investigation', 6, 'duration', 'core', array['since','how long','symptom duration']),
      (new_id, 'investigation', 7, 'bowel habit', 'core', array['constipation','straining','hard stools']),
      (new_id, 'investigation', 8, 'haemoglobin', 'core', array['hb','hemoglobin','anaemia','anemia']),
      (new_id, 'investigation', 9, 'local examination', 'core', array['pr examination','per rectal examination','proctoscopy','inspection']),
      (new_id, 'investigation', 10, 'fitness', 'core', array['anaesthetic clearance','pac','fit for surgery']),
      (new_id, 'investigation', 11, 'consent', 'core', array['consent taken','consented']),
      (new_id, 'investigation', 12, 'bowel preparation', 'core', array['enema','bowel prep','prep given']),
      (new_id, 'investigation', 13, 'previous treatment', 'optional', array['banding','sclerotherapy','previous surgery']);
  end if;

  if not exists (select 1 from company_protocols where title = 'Haemorrhoids — After Surgery Checklist' and version = 'v1') then
    insert into company_protocols
      (title, version, source_name, phase, template_family, template_variant, status, created_by)
    values
      ('Haemorrhoids — After Surgery Checklist', 'v1', 'Unit protocol', 'after_surgery', 'perianal', 'haemorrhoids', 'draft', publisher_id)
    returning id into new_id;

    insert into company_protocol_items (protocol_id, kind, position, prompt, importance, aliases) values
      (new_id, 'investigation', 1, 'post-operative day', 'core', array['pod','post op day','day']),
      (new_id, 'investigation', 2, 'pain', 'core', array['pain score','perianal pain']),
      (new_id, 'investigation', 3, 'bleeding', 'core', array['bleeding per rectum','pr bleed','soakage','reactionary bleed']),
      (new_id, 'investigation', 4, 'first bowel motion', 'core', array['motion passed','bowels opened','passed stool','defecation']),
      (new_id, 'investigation', 5, 'urinary retention', 'core', array['passed urine','retention','catheter','voiding']),
      (new_id, 'investigation', 6, 'dressing', 'core', array['pack','pack removed','wound','local dressing']),
      (new_id, 'pathway_step', 7, 'sitz bath', 'core', array['sitz baths','warm water bath','hip bath']),
      (new_id, 'investigation', 8, 'stool softener', 'core', array['laxative','lactulose','isabgol','softener']),
      (new_id, 'pathway_step', 9, 'plan', 'core', array['discharge','review','follow up']),
      (new_id, 'investigation', 10, 'prolapse', 'optional', array['residual prolapse','mass']),
      (new_id, 'investigation', 11, 'continence', 'optional', array['incontinence','control','soiling']),
      (new_id, 'investigation', 12, 'fever', 'optional', array['temperature','afebrile','febrile']);
  end if;
end $$;

commit;
