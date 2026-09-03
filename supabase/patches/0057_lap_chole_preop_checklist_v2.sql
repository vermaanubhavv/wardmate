-- Reworks the "Lap Chole — Before Surgery Checklist" to what the unit actually asks before a
-- laparoscopic cholecystectomy. Changes, from the resident's list:
--
--   * drop 'comorbidities'   — already on the diagnosis line at the top of the patient page,
--                              and assumed none when nothing is recorded (see the "assume
--                              none" convention); a second slot here was noise.
--   * drop 'fasting status'  — a same-morning nursing check, not part of the surgical work-up.
--   * drop 'plan'            — the to-do list already carries the posting; a bare "plan —
--                              not recorded" line added nothing.
--   * 'fitness'  -> 'PAC fitness'   (what it has always meant here).
--   * 'previous episodes' -> 'last biliary colic episode'  (core, not optional).
--   * add the gallstone-disease history that decides whether a CBD stone has to be excluded
--     before theatre: history of jaundice, acute cholecystitis / pancreatitis history, fever
--     with chills (cholangitis), and a palpable lump.
--   * add 'MRCP' — surfaced only for patients whose record already carries a reason to
--     exclude choledocholithiasis (pancreatitis, jaundice, deranged LFT, dilated or stone-
--     bearing CBD, cholangitis). The showing rule lives in lib/templates.ts CONDITIONAL_ITEMS,
--     the same mechanism that hides 'blood thinners' unless there is a cardiac or
--     anticoagulant history.
--
-- Idempotent: rewrites the item set for every protocol row with this title.

begin;

do $$
declare
  p record;
begin
  for p in select id from company_protocols where title = 'Lap Chole — Before Surgery Checklist'
  loop
    delete from company_protocol_items where protocol_id = p.id;

    insert into company_protocol_items
      (protocol_id, kind, position, prompt, importance, soap_section, normal_phrase, aliases)
    values
      (p.id, 'investigation',  1, 'imaging',                                   'core', 'objective', null,
        array['usg','ultrasound','ultrasound findings','scan','number of stones','gallbladder wall','cbd diameter']),
      (p.id, 'investigation',  2, 'liver function',                            'core', 'objective', 'Normal',
        array['lft','bilirubin','alkaline phosphatase','sgpt','sgot','ggt']),
      (p.id, 'investigation',  3, 'icterus',                                   'core', 'objective', 'No icterus',
        array['jaundice on examination','scleral icterus','yellow sclera']),
      (p.id, 'investigation',  4, 'history of jaundice',                       'core', 'subjective', 'No past jaundice',
        array['past jaundice','yellowing of eyes','dark urine','clay coloured stool','h/o jaundice']),
      (p.id, 'investigation',  5, 'last biliary colic episode',                'core', 'subjective', null,
        array['biliary colic','pain episode','last attack','previous attacks','past attacks','ruq pain']),
      (p.id, 'investigation',  6, 'acute cholecystitis or pancreatitis history','core', 'subjective', 'No prior attacks',
        array['cholecystitis','pancreatitis','acute attack','hospitalised for pain','gallstone pancreatitis']),
      (p.id, 'investigation',  7, 'fever with chills',                         'core', 'subjective', 'No fever with chills',
        array['rigors','chills','cholangitis','febrile episode','fever with rigors']),
      (p.id, 'investigation',  8, 'palpable lump',                             'core', 'objective', 'No palpable lump',
        array['gallbladder mass','palpable gallbladder','lump','mass','courvoisier']),
      (p.id, 'investigation',  9, 'blood thinners',                            'core', 'plan', null,
        array['anticoagulants','aspirin','clopidogrel','warfarin','acitrom']),
      (p.id, 'investigation', 10, 'PAC fitness',                               'core', 'checks', null,
        array['fitness','anaesthetic clearance','pac','pre anaesthetic checkup','fit for surgery','pac done']),
      (p.id, 'investigation', 11, 'consent',                                   'core', 'checks', null,
        array['consent taken','consented','high risk consent']),
      (p.id, 'investigation', 12, 'MRCP',                                      'core', 'plan', null,
        array['mrcp','mrcp done','mrcp planned','mrcp report','mr cholangiopancreatography']);
  end loop;
end $$;

commit;
