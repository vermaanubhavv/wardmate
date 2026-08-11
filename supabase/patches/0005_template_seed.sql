-- The starter template library — 20 templates across the four operations on this unit.
--
-- ⚠️ THIS CONTENT IS A STRAWMAN, DRAFTED BY SOMEONE WHO IS NOT A SURGEON.
-- It is written from general surgical practice, not from your unit's protocol, your
-- consultants' preferences, or what your hospital actually monitors. Expect to change it.
-- Corrections belong in this file: edit, re-run, done — it replaces the shared library each
-- time, so it is safe to run repeatedly.
--
-- "core" items are the ones whose absence is shown as a gap on the patient screen.
-- "optional" items appear as reminders but do not count as missing — otherwise every patient
-- would show a wall of red and you would stop reading it.
--
-- Run in the Supabase dashboard: SQL Editor -> New query -> paste -> Run.

begin;

-- Rebuild the shared library from scratch on every run. Ward-owned copies (ward_id not null)
-- are never touched, so a unit's own corrections survive an update to the starter set.
delete from care_templates where ward_id is null;

create or replace function seed_template(
  _family text, _variant text, _phase care_phase, _name text, _items jsonb
) returns void language plpgsql as $$
declare
  t uuid;
  item jsonb;
  i int := 0;
begin
  insert into care_templates (ward_id, family, variant, phase, name)
  values (null, _family, _variant, _phase, _name)
  returning id into t;

  for item in select * from jsonb_array_elements(_items) loop
    i := i + 1;
    insert into care_template_items (template_id, label, aliases, kind, importance, position, hint)
    values (
      t,
      item ->> 'label',
      coalesce(array(select jsonb_array_elements_text(item -> 'aliases')), '{}'),
      coalesce(item ->> 'kind', 'note'),
      coalesce(item ->> 'importance', 'core'),
      i,
      item ->> 'hint'
    );
  end loop;
end;
$$;

-- ---------------------------------------------------------------------------
-- Laparoscopic cholecystectomy
-- ---------------------------------------------------------------------------

select seed_template('lap_chole', null, 'before_surgery', 'Lap chole — before surgery', $j$[
  {"label":"imaging","kind":"lab","aliases":["usg","ultrasound","ultrasound findings","scan"],"hint":"USG findings"},
  {"label":"liver function","kind":"lab","aliases":["lft","bilirubin","alkaline phosphatase","sgpt","sgot"]},
  {"label":"jaundice","kind":"exam","aliases":["icterus","yellowing"]},
  {"label":"comorbidities","kind":"note","aliases":["diabetes","hypertension","cardiac","comorbid"]},
  {"label":"blood thinners","kind":"medication","aliases":["anticoagulants","aspirin","clopidogrel","warfarin"]},
  {"label":"fitness","kind":"note","aliases":["anaesthetic clearance","pac","pre anaesthetic checkup","fit for surgery"]},
  {"label":"consent","kind":"note","aliases":["consent taken","consented"]},
  {"label":"fasting status","kind":"note","aliases":["npo","nil by mouth","nbm","fasting"]},
  {"label":"previous episodes","kind":"note","importance":"optional","aliases":["past attacks","previous attacks","biliary colic"]},
  {"label":"plan","kind":"plan","importance":"optional","aliases":["posting","list date","planned for"]}
]$j$::jsonb);

select seed_template('lap_chole', null, 'after_surgery', 'Lap chole — after surgery', $j$[
  {"label":"post-operative day","kind":"day_number","aliases":["pod","post op day","day"]},
  {"label":"fever","kind":"vital","aliases":["temperature","afebrile","febrile","temp"]},
  {"label":"pain","kind":"exam","aliases":["pain score","abdominal pain"]},
  {"label":"abdomen","kind":"exam","aliases":["abdominal examination","soft","distended","tenderness"]},
  {"label":"port sites","kind":"exam","aliases":["wound","port site","incision","dressing"]},
  {"label":"drain","kind":"drain","aliases":["drain output","drain fluid","tube drain"],"hint":"output and colour, or say there is no drain"},
  {"label":"oral intake","kind":"intake_output","aliases":["orals","tolerating orals","diet","feeds"]},
  {"label":"flatus","kind":"intake_output","aliases":["bowel sounds","passed flatus","motion","bowels"]},
  {"label":"plan","kind":"plan","aliases":["discharge","drain removal","suture removal"]},
  {"label":"shoulder tip pain","kind":"exam","importance":"optional","aliases":["shoulder pain"]},
  {"label":"bile in drain","kind":"drain","importance":"optional","aliases":["bilious drain","bile leak","biliary leak"]},
  {"label":"vitals","kind":"vital","importance":"optional","aliases":["pulse","bp","blood pressure","saturation","spo2"]}
]$j$::jsonb);

-- ---------------------------------------------------------------------------
-- Appendicectomy — acute
-- ---------------------------------------------------------------------------

select seed_template('appendicectomy', 'acute', 'before_surgery', 'Appendicectomy, acute — before surgery', $j$[
  {"label":"pain","kind":"exam","aliases":["abdominal pain","right iliac fossa pain","rif pain","migration","migratory pain"]},
  {"label":"duration of symptoms","kind":"note","aliases":["duration","since","days of pain"]},
  {"label":"fever","kind":"vital","aliases":["temperature","febrile","afebrile"]},
  {"label":"vitals","kind":"vital","aliases":["pulse","bp","blood pressure","tachycardia"]},
  {"label":"abdomen","kind":"exam","aliases":["tenderness","guarding","rebound","rigidity"]},
  {"label":"total count","kind":"lab","aliases":["tlc","wbc","white cell count","leucocyte count","counts"]},
  {"label":"imaging","kind":"lab","aliases":["usg","ultrasound","ct","ct abdomen"]},
  {"label":"antibiotics","kind":"medication","aliases":["antibiotic","started on"]},
  {"label":"fasting status","kind":"note","aliases":["npo","nil by mouth","nbm","fasting"]},
  {"label":"consent","kind":"note","aliases":["consent taken","consented"]},
  {"label":"fitness","kind":"note","aliases":["anaesthetic clearance","pac","fit for surgery"]},
  {"label":"vomiting","kind":"note","importance":"optional","aliases":["vomit","nausea"]},
  {"label":"urine examination","kind":"lab","importance":"optional","aliases":["urine routine","urine microscopy"]}
]$j$::jsonb);

select seed_template('appendicectomy', 'acute', 'after_surgery', 'Appendicectomy, acute — after surgery', $j$[
  {"label":"post-operative day","kind":"day_number","aliases":["pod","post op day","day"]},
  {"label":"fever","kind":"vital","aliases":["temperature","afebrile","febrile","temp"]},
  {"label":"pain","kind":"exam","aliases":["pain score","abdominal pain"]},
  {"label":"abdomen","kind":"exam","aliases":["abdominal examination","soft","distended","tenderness"]},
  {"label":"wound","kind":"exam","aliases":["incision","dressing","suture line","port sites"]},
  {"label":"drain","kind":"drain","aliases":["drain output","drain fluid"],"hint":"output and colour, or say there is no drain"},
  {"label":"oral intake","kind":"intake_output","aliases":["orals","tolerating orals","diet","feeds"]},
  {"label":"flatus","kind":"intake_output","aliases":["bowel sounds","passed flatus","motion","bowels"]},
  {"label":"ambulation","kind":"exam","aliases":["mobilised","walking","ambulating","out of bed"]},
  {"label":"plan","kind":"plan","aliases":["discharge","suture removal","antibiotics"]},
  {"label":"vitals","kind":"vital","importance":"optional","aliases":["pulse","bp","blood pressure"]},
  {"label":"histopathology","kind":"lab","importance":"optional","aliases":["hpe","biopsy","histopath","specimen"]}
]$j$::jsonb);

-- ---------------------------------------------------------------------------
-- Appendicectomy — interval
-- ---------------------------------------------------------------------------

select seed_template('appendicectomy', 'interval', 'before_surgery', 'Appendicectomy, interval — before surgery', $j$[
  {"label":"index episode","kind":"note","aliases":["previous episode","first attack","when treated","index admission"]},
  {"label":"interval since episode","kind":"note","aliases":["interval","weeks since","months since"]},
  {"label":"conservative treatment","kind":"note","aliases":["managed conservatively","antibiotics given","drainage","abscess drained"]},
  {"label":"current symptoms","kind":"exam","aliases":["symptoms","pain","asymptomatic"]},
  {"label":"imaging","kind":"lab","aliases":["usg","ultrasound","ct","ct abdomen"]},
  {"label":"fitness","kind":"note","aliases":["anaesthetic clearance","pac","fit for surgery"]},
  {"label":"consent","kind":"note","aliases":["consent taken","consented"]},
  {"label":"fasting status","kind":"note","aliases":["npo","nil by mouth","nbm","fasting"]},
  {"label":"colonoscopy","kind":"lab","importance":"optional","aliases":["scopy","colonoscopy done"]},
  {"label":"comorbidities","kind":"note","importance":"optional","aliases":["diabetes","hypertension","cardiac"]}
]$j$::jsonb);

select seed_template('appendicectomy', 'interval', 'after_surgery', 'Appendicectomy, interval — after surgery', $j$[
  {"label":"post-operative day","kind":"day_number","aliases":["pod","post op day","day"]},
  {"label":"fever","kind":"vital","aliases":["temperature","afebrile","febrile","temp"]},
  {"label":"pain","kind":"exam","aliases":["pain score","abdominal pain"]},
  {"label":"abdomen","kind":"exam","aliases":["abdominal examination","soft","distended"]},
  {"label":"wound","kind":"exam","aliases":["incision","dressing","suture line","port sites"]},
  {"label":"oral intake","kind":"intake_output","aliases":["orals","tolerating orals","diet"]},
  {"label":"flatus","kind":"intake_output","aliases":["bowel sounds","passed flatus","motion"]},
  {"label":"plan","kind":"plan","aliases":["discharge","suture removal"]},
  {"label":"drain","kind":"drain","importance":"optional","aliases":["drain output","drain fluid"]},
  {"label":"ambulation","kind":"exam","importance":"optional","aliases":["mobilised","walking","ambulating"]},
  {"label":"histopathology","kind":"lab","importance":"optional","aliases":["hpe","biopsy","histopath"]}
]$j$::jsonb);

-- ---------------------------------------------------------------------------
-- Hernia — the four sites share most of their expectations; the differences are the
-- last few items in each list.
-- ---------------------------------------------------------------------------

select seed_template('hernia', 'inguinal', 'before_surgery', 'Inguinal hernia — before surgery', $j$[
  {"label":"side","kind":"exam","aliases":["laterality","right","left","bilateral","site"]},
  {"label":"reducibility","kind":"exam","aliases":["reducible","irreducible","reduces"]},
  {"label":"cough impulse","kind":"exam","aliases":["impulse on cough","expansile impulse"]},
  {"label":"obstruction signs","kind":"exam","aliases":["obstructed","strangulated","tender swelling","irreducible and tender"]},
  {"label":"raised intra-abdominal pressure","kind":"note","aliases":["chronic cough","copd","constipation","prostatism","straining","smoking"]},
  {"label":"testis and scrotum","kind":"exam","aliases":["testis","scrotum","scrotal examination"]},
  {"label":"repair planned","kind":"plan","aliases":["mesh","mesh repair","open repair","laparoscopic repair","tep","tapp"]},
  {"label":"fitness","kind":"note","aliases":["anaesthetic clearance","pac","fit for surgery"]},
  {"label":"consent","kind":"note","aliases":["consent taken","consented"]},
  {"label":"fasting status","kind":"note","aliases":["npo","nil by mouth","nbm","fasting"]},
  {"label":"duration","kind":"note","importance":"optional","aliases":["since","how long"]},
  {"label":"comorbidities","kind":"note","importance":"optional","aliases":["diabetes","hypertension","cardiac"]}
]$j$::jsonb);

select seed_template('hernia', 'inguinal', 'after_surgery', 'Inguinal hernia — after surgery', $j$[
  {"label":"post-operative day","kind":"day_number","aliases":["pod","post op day","day"]},
  {"label":"pain","kind":"exam","aliases":["pain score","groin pain"]},
  {"label":"wound","kind":"exam","aliases":["incision","dressing","suture line"]},
  {"label":"scrotal swelling","kind":"exam","aliases":["scrotum","scrotal oedema","scrotal edema"]},
  {"label":"urinary retention","kind":"intake_output","aliases":["passed urine","retention","catheter","voiding"]},
  {"label":"oral intake","kind":"intake_output","aliases":["orals","tolerating orals","diet"]},
  {"label":"ambulation","kind":"exam","aliases":["mobilised","walking","ambulating","out of bed"]},
  {"label":"plan","kind":"plan","aliases":["discharge","suture removal","activity restriction","lifting"]},
  {"label":"seroma","kind":"exam","importance":"optional","aliases":["collection","swelling at site","fluid collection"]},
  {"label":"fever","kind":"vital","importance":"optional","aliases":["temperature","afebrile","febrile"]}
]$j$::jsonb);

select seed_template('hernia', 'umbilical', 'before_surgery', 'Umbilical hernia — before surgery', $j$[
  {"label":"defect size","kind":"exam","aliases":["size","size of defect","swelling size"]},
  {"label":"reducibility","kind":"exam","aliases":["reducible","irreducible","reduces"]},
  {"label":"cough impulse","kind":"exam","aliases":["impulse on cough","expansile impulse"]},
  {"label":"obstruction signs","kind":"exam","aliases":["obstructed","strangulated","tender swelling"]},
  {"label":"skin over swelling","kind":"exam","aliases":["skin","overlying skin","ulceration"]},
  {"label":"raised intra-abdominal pressure","kind":"note","aliases":["chronic cough","copd","constipation","ascites","obesity"]},
  {"label":"repair planned","kind":"plan","aliases":["mesh","mesh repair","anatomical repair"]},
  {"label":"fitness","kind":"note","aliases":["anaesthetic clearance","pac","fit for surgery"]},
  {"label":"consent","kind":"note","aliases":["consent taken","consented"]},
  {"label":"fasting status","kind":"note","aliases":["npo","nil by mouth","nbm","fasting"]},
  {"label":"comorbidities","kind":"note","importance":"optional","aliases":["diabetes","hypertension","cardiac"]}
]$j$::jsonb);

select seed_template('hernia', 'umbilical', 'after_surgery', 'Umbilical hernia — after surgery', $j$[
  {"label":"post-operative day","kind":"day_number","aliases":["pod","post op day","day"]},
  {"label":"pain","kind":"exam","aliases":["pain score"]},
  {"label":"wound","kind":"exam","aliases":["incision","dressing","suture line"]},
  {"label":"oral intake","kind":"intake_output","aliases":["orals","tolerating orals","diet"]},
  {"label":"ambulation","kind":"exam","aliases":["mobilised","walking","ambulating"]},
  {"label":"plan","kind":"plan","aliases":["discharge","suture removal","activity restriction"]},
  {"label":"seroma","kind":"exam","importance":"optional","aliases":["collection","swelling at site"]},
  {"label":"fever","kind":"vital","importance":"optional","aliases":["temperature","afebrile","febrile"]}
]$j$::jsonb);

select seed_template('hernia', 'epigastric', 'before_surgery', 'Epigastric hernia — before surgery', $j$[
  {"label":"defect size","kind":"exam","aliases":["size","size of defect","swelling size"]},
  {"label":"reducibility","kind":"exam","aliases":["reducible","irreducible","reduces"]},
  {"label":"cough impulse","kind":"exam","aliases":["impulse on cough","expansile impulse"]},
  {"label":"obstruction signs","kind":"exam","aliases":["obstructed","strangulated","tender swelling"]},
  {"label":"raised intra-abdominal pressure","kind":"note","aliases":["chronic cough","copd","constipation","straining"]},
  {"label":"repair planned","kind":"plan","aliases":["mesh","mesh repair","anatomical repair"]},
  {"label":"fitness","kind":"note","aliases":["anaesthetic clearance","pac","fit for surgery"]},
  {"label":"consent","kind":"note","aliases":["consent taken","consented"]},
  {"label":"fasting status","kind":"note","aliases":["npo","nil by mouth","nbm","fasting"]},
  {"label":"comorbidities","kind":"note","importance":"optional","aliases":["diabetes","hypertension","cardiac"]}
]$j$::jsonb);

select seed_template('hernia', 'epigastric', 'after_surgery', 'Epigastric hernia — after surgery', $j$[
  {"label":"post-operative day","kind":"day_number","aliases":["pod","post op day","day"]},
  {"label":"pain","kind":"exam","aliases":["pain score"]},
  {"label":"wound","kind":"exam","aliases":["incision","dressing","suture line"]},
  {"label":"oral intake","kind":"intake_output","aliases":["orals","tolerating orals","diet"]},
  {"label":"ambulation","kind":"exam","aliases":["mobilised","walking","ambulating"]},
  {"label":"plan","kind":"plan","aliases":["discharge","suture removal","activity restriction"]},
  {"label":"seroma","kind":"exam","importance":"optional","aliases":["collection","swelling at site"]},
  {"label":"fever","kind":"vital","importance":"optional","aliases":["temperature","afebrile","febrile"]}
]$j$::jsonb);

select seed_template('hernia', 'incisional', 'before_surgery', 'Incisional hernia — before surgery', $j$[
  {"label":"previous surgery","kind":"note","aliases":["prior operation","previous operation","old scar","index surgery"]},
  {"label":"defect size","kind":"exam","aliases":["size","size of defect","defect"]},
  {"label":"reducibility","kind":"exam","aliases":["reducible","irreducible","reduces"]},
  {"label":"obstruction signs","kind":"exam","aliases":["obstructed","strangulated","tender swelling"]},
  {"label":"skin condition","kind":"exam","aliases":["skin","overlying skin","scar","ulceration"]},
  {"label":"raised intra-abdominal pressure","kind":"note","aliases":["chronic cough","copd","constipation","obesity","ascites"]},
  {"label":"repair planned","kind":"plan","aliases":["mesh","mesh repair","onlay","sublay","component separation"]},
  {"label":"fitness","kind":"note","aliases":["anaesthetic clearance","pac","fit for surgery"]},
  {"label":"consent","kind":"note","aliases":["consent taken","consented"]},
  {"label":"fasting status","kind":"note","aliases":["npo","nil by mouth","nbm","fasting"]},
  {"label":"imaging","kind":"lab","importance":"optional","aliases":["ct","ct abdomen","usg"]},
  {"label":"comorbidities","kind":"note","importance":"optional","aliases":["diabetes","hypertension","cardiac"]}
]$j$::jsonb);

select seed_template('hernia', 'incisional', 'after_surgery', 'Incisional hernia — after surgery', $j$[
  {"label":"post-operative day","kind":"day_number","aliases":["pod","post op day","day"]},
  {"label":"pain","kind":"exam","aliases":["pain score"]},
  {"label":"wound","kind":"exam","aliases":["incision","dressing","suture line"]},
  {"label":"drain","kind":"drain","aliases":["drain output","drain fluid"],"hint":"output and colour, or say there is no drain"},
  {"label":"abdomen","kind":"exam","aliases":["abdominal examination","distension","soft","distended"]},
  {"label":"oral intake","kind":"intake_output","aliases":["orals","tolerating orals","diet"]},
  {"label":"flatus","kind":"intake_output","aliases":["bowel sounds","passed flatus","motion"]},
  {"label":"ambulation","kind":"exam","aliases":["mobilised","walking","ambulating"]},
  {"label":"plan","kind":"plan","aliases":["discharge","drain removal","suture removal","abdominal binder"]},
  {"label":"seroma","kind":"exam","importance":"optional","aliases":["collection","swelling at site"]},
  {"label":"fever","kind":"vital","importance":"optional","aliases":["temperature","afebrile","febrile"]}
]$j$::jsonb);

-- ---------------------------------------------------------------------------
-- Perianal surgery
-- ---------------------------------------------------------------------------

select seed_template('perianal', 'fissure', 'before_surgery', 'Anal fissure — before surgery', $j$[
  {"label":"pain","kind":"exam","aliases":["pain during defecation","painful defecation","burning"]},
  {"label":"bleeding","kind":"exam","aliases":["bleeding per rectum","pr bleed","streaking","blood in stool"]},
  {"label":"duration","kind":"note","aliases":["since","how long","symptom duration"]},
  {"label":"chronicity","kind":"exam","aliases":["acute","chronic","sentinel tag","skin tag"]},
  {"label":"bowel habit","kind":"note","aliases":["constipation","straining","hard stools","laxatives"]},
  {"label":"local examination","kind":"exam","aliases":["pr examination","per rectal examination","position","clock position","inspection"]},
  {"label":"sphincter spasm","kind":"exam","aliases":["spasm","sphincter tone","tone"]},
  {"label":"continence","kind":"note","aliases":["incontinence","control","soiling"]},
  {"label":"fitness","kind":"note","aliases":["anaesthetic clearance","pac","fit for surgery"]},
  {"label":"consent","kind":"note","aliases":["consent taken","consented"]},
  {"label":"bowel preparation","kind":"note","aliases":["enema","bowel prep","prep given"]},
  {"label":"previous treatment","kind":"note","importance":"optional","aliases":["previous surgery","ointment","conservative treatment"]}
]$j$::jsonb);

select seed_template('perianal', 'fissure', 'after_surgery', 'Anal fissure — after surgery', $j$[
  {"label":"post-operative day","kind":"day_number","aliases":["pod","post op day","day"]},
  {"label":"pain","kind":"exam","aliases":["pain score","perianal pain"]},
  {"label":"bleeding","kind":"exam","aliases":["bleeding per rectum","pr bleed","soakage"]},
  {"label":"first bowel motion","kind":"intake_output","aliases":["motion passed","bowels opened","passed stool","defecation"]},
  {"label":"urinary retention","kind":"intake_output","aliases":["passed urine","retention","catheter","voiding"]},
  {"label":"dressing","kind":"exam","aliases":["pack","pack removed","wound","local dressing"]},
  {"label":"sitz bath","kind":"plan","aliases":["sitz baths","warm water bath","hip bath"]},
  {"label":"stool softener","kind":"medication","aliases":["laxative","lactulose","isabgol","softener"]},
  {"label":"plan","kind":"plan","aliases":["discharge","review","follow up"]},
  {"label":"continence","kind":"note","importance":"optional","aliases":["incontinence","control","soiling"]},
  {"label":"fever","kind":"vital","importance":"optional","aliases":["temperature","afebrile","febrile"]}
]$j$::jsonb);

select seed_template('perianal', 'fistula', 'before_surgery', 'Anal fistula — before surgery', $j$[
  {"label":"discharge","kind":"exam","aliases":["pus discharge","purulent discharge","soiling","serous discharge"]},
  {"label":"pain","kind":"exam","aliases":["perianal pain","pain"]},
  {"label":"duration","kind":"note","aliases":["since","how long","symptom duration"]},
  {"label":"external opening","kind":"exam","aliases":["opening","external openings","clock position","position"]},
  {"label":"internal opening","kind":"exam","aliases":["internal openings","tract","fistula tract"]},
  {"label":"imaging","kind":"lab","aliases":["mri","mri fistulogram","fistulogram","usg"]},
  {"label":"continence","kind":"note","aliases":["incontinence","control","soiling"]},
  {"label":"previous surgery","kind":"note","aliases":["previous operation","prior surgery","recurrent","seton"]},
  {"label":"bowel habit","kind":"note","aliases":["constipation","straining"]},
  {"label":"fitness","kind":"note","aliases":["anaesthetic clearance","pac","fit for surgery"]},
  {"label":"consent","kind":"note","aliases":["consent taken","consented"]},
  {"label":"bowel preparation","kind":"note","aliases":["enema","bowel prep","prep given"]}
]$j$::jsonb);

select seed_template('perianal', 'fistula', 'after_surgery', 'Anal fistula — after surgery', $j$[
  {"label":"post-operative day","kind":"day_number","aliases":["pod","post op day","day"]},
  {"label":"pain","kind":"exam","aliases":["pain score","perianal pain"]},
  {"label":"bleeding","kind":"exam","aliases":["bleeding per rectum","pr bleed","soakage"]},
  {"label":"discharge","kind":"exam","aliases":["pus discharge","serous discharge","soiling"]},
  {"label":"seton","kind":"exam","aliases":["seton in situ","seton tight","thread"]},
  {"label":"first bowel motion","kind":"intake_output","aliases":["motion passed","bowels opened","passed stool"]},
  {"label":"urinary retention","kind":"intake_output","aliases":["passed urine","retention","catheter","voiding"]},
  {"label":"dressing","kind":"exam","aliases":["pack","pack removed","wound","local dressing"]},
  {"label":"sitz bath","kind":"plan","aliases":["sitz baths","warm water bath","hip bath"]},
  {"label":"stool softener","kind":"medication","aliases":["laxative","lactulose","isabgol","softener"]},
  {"label":"continence","kind":"note","aliases":["incontinence","control","soiling"]},
  {"label":"plan","kind":"plan","aliases":["discharge","review","follow up","seton tightening"]},
  {"label":"fever","kind":"vital","importance":"optional","aliases":["temperature","afebrile","febrile"]}
]$j$::jsonb);

select seed_template('perianal', 'haemorrhoids', 'before_surgery', 'Haemorrhoids — before surgery', $j$[
  {"label":"bleeding","kind":"exam","aliases":["bleeding per rectum","pr bleed","painless bleeding","blood in stool"]},
  {"label":"prolapse","kind":"exam","aliases":["mass per rectum","something coming out","reduces spontaneously","manual reduction"]},
  {"label":"grade","kind":"exam","aliases":["grading","first degree","second degree","third degree","fourth degree"]},
  {"label":"position","kind":"exam","aliases":["clock position","number of piles","primary piles"]},
  {"label":"pain","kind":"exam","aliases":["perianal pain","thrombosed","painful"]},
  {"label":"duration","kind":"note","aliases":["since","how long","symptom duration"]},
  {"label":"bowel habit","kind":"note","aliases":["constipation","straining","hard stools"]},
  {"label":"haemoglobin","kind":"lab","aliases":["hb","hemoglobin","anaemia","anemia"]},
  {"label":"local examination","kind":"exam","aliases":["pr examination","per rectal examination","proctoscopy","inspection"]},
  {"label":"fitness","kind":"note","aliases":["anaesthetic clearance","pac","fit for surgery"]},
  {"label":"consent","kind":"note","aliases":["consent taken","consented"]},
  {"label":"bowel preparation","kind":"note","aliases":["enema","bowel prep","prep given"]},
  {"label":"previous treatment","kind":"note","importance":"optional","aliases":["banding","sclerotherapy","previous surgery"]}
]$j$::jsonb);

select seed_template('perianal', 'haemorrhoids', 'after_surgery', 'Haemorrhoids — after surgery', $j$[
  {"label":"post-operative day","kind":"day_number","aliases":["pod","post op day","day"]},
  {"label":"pain","kind":"exam","aliases":["pain score","perianal pain"]},
  {"label":"bleeding","kind":"exam","aliases":["bleeding per rectum","pr bleed","soakage","reactionary bleed"]},
  {"label":"first bowel motion","kind":"intake_output","aliases":["motion passed","bowels opened","passed stool","defecation"]},
  {"label":"urinary retention","kind":"intake_output","aliases":["passed urine","retention","catheter","voiding"]},
  {"label":"dressing","kind":"exam","aliases":["pack","pack removed","wound","local dressing"]},
  {"label":"sitz bath","kind":"plan","aliases":["sitz baths","warm water bath","hip bath"]},
  {"label":"stool softener","kind":"medication","aliases":["laxative","lactulose","isabgol","softener"]},
  {"label":"plan","kind":"plan","aliases":["discharge","review","follow up"]},
  {"label":"prolapse","kind":"exam","importance":"optional","aliases":["residual prolapse","mass"]},
  {"label":"continence","kind":"note","importance":"optional","aliases":["incontinence","control","soiling"]},
  {"label":"fever","kind":"vital","importance":"optional","aliases":["temperature","afebrile","febrile"]}
]$j$::jsonb);

drop function seed_template(text, text, care_phase, text, jsonb);

commit;
