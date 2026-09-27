import type { AdviceItem } from "@/lib/discharge-entities";
import type { DischargeTemplate, TemplateMedication } from "@/lib/discharge-templates";

/**
 * ENT discharge templates. CLINICAL CONTENT: REVIEWED (Dr Anubhav Verma, 2026-09-28).
 *
 * One template per admission an ENT unit commonly discharges. Same rule as the surgical file:
 * what is written here prints as written unless the resident changes it, and a genuinely
 * patient-specific blank is written as `[ … ]` so it prints as a visible blank, never a guess.
 *
 * Medication lines are a STARTING SET to be checked against each patient — allergy, age,
 * weight, renal function, pregnancy, cultures and what they were already taking.
 *
 * Order matters: first match wins (lib/specialty/discharge.ts), so the peritonsillar / deep neck
 * abscess template is checked before tonsillectomy ("peritonsillar" contains "tonsil"), and FESS
 * before septoplasty (a combined septoplasty + FESS takes the FESS set).
 */

const adv = (items: { module: string; text: string }[]): AdviceItem[] =>
  items.map((it, i) => ({ id: `adv-${i}`, module: it.module, text: it.text }));

// --- reusable pieces -------------------------------------------------------------------

const M = {
  paracetamol: { generic: "Paracetamol", strength: "650 mg", route: "PO", frequency: "TDS", duration: "5 days", status: "new" } as TemplateMedication,
  paracetamolSos: { generic: "Paracetamol", strength: "650 mg", route: "PO", frequency: "SOS for pain", status: "prn" } as TemplateMedication,
  pantoprazole: { generic: "Pantoprazole", strength: "40 mg", route: "PO", frequency: "OD before breakfast", duration: "5 days", status: "new" } as TemplateMedication,
  amoxClav: { generic: "Amoxicillin-clavulanate", strength: "625 mg", route: "PO", frequency: "TDS", duration: "7 days", status: "new" } as TemplateMedication,
  levocetirizine: { generic: "Levocetirizine", strength: "5 mg", route: "PO", frequency: "HS", duration: "10 days", status: "new" } as TemplateMedication,
  oxymetazoline: { generic: "Oxymetazoline 0.05% nasal drops", dose: "2 drops each nostril", route: "intranasal", frequency: "BD", duration: "5 days", indication: "not beyond 5 days (rebound congestion)", status: "new" } as TemplateMedication,
  salineDouche: { generic: "Saline nasal douche / spray (isotonic)", route: "intranasal", frequency: "BD–TDS", duration: "4 weeks", indication: "clears crusts; start after the pack is removed", status: "new" } as TemplateMedication,
  chlorhexidineGargle: { generic: "Chlorhexidine 0.2% mouthwash (or povidone-iodine 1% gargle)", dose: "10 ml, diluted in water", route: "gargle", frequency: "QID after food", duration: "7 days", status: "new" } as TemplateMedication,
  metronidazole: { generic: "Metronidazole", strength: "400 mg", route: "PO", frequency: "TDS", duration: "7 days", indication: "anaerobic cover; no alcohol while taking it", status: "new" } as TemplateMedication,
};

const RF_BLEED = "Fresh bleeding from the nose or mouth that does not stop in 10 minutes, or spitting / vomiting blood";
const RF_FEVER = "High or persistent fever";
const RF_BREATH = "Noisy breathing, difficulty in breathing, or difficulty in swallowing saliva";

const ENT_OPD7 = "Attend the ENT OPD after 7 days for review.";
const ANTIBIOTICS = "Complete the prescribed course of antibiotics.";

// --- the eight -----------------------------------------------------------------------

export const ENT_DISCHARGE_TEMPLATES: DischargeTemplate[] = [
  // ---- Tracheostomy (discharged with a tube) ----
  {
    key: "ent_tracheostomy",
    label: "Tracheostomy — discharged with a tube",
    match: /tracheostomy|tracheotomy/i,
    scaffold: {
      indication:
        "Patient was admitted with [ upper airway obstruction / prolonged ventilation / inability to protect the airway ] due to [ cause ], requiring tracheostomy.",
      primaryDiagnosis: "[ Underlying condition ] — status post tracheostomy",
      procedure: {
        name: "[ Elective / emergency ] [ surgical / percutaneous ] tracheostomy",
        anaesthesia: "[ General / local ] anaesthesia",
        findings: "[ tracheal ring level; stoma; tube type (cuffed / uncuffed / metal), size and inner cannula ]",
        drains: "",
        complications: "Nil",
        outcome: "Procedure completed successfully; airway secured.",
      },
      clinicalCourse:
        "Tracheostomy was performed on [ date ]. The first tube change was done on POD [ __ ] [ and the tube changed to a __ ]. The stoma is healthy. The patient and caregiver were trained in suctioning, inner-cannula cleaning, tie care and emergency tube reinsertion, and demonstrated them on the ward. The patient is maintaining saturation on room air [ with humidification ] at discharge. [ Plan for decannulation / long-term tube. ]",
      medications: [
        { generic: "Normal saline nebulisation / humidification", dose: "3 ml", route: "via tracheostomy", frequency: "QID", indication: "keeps secretions thin; also saline drops before suction if secretions are thick", status: "new" },
        M.paracetamolSos,
        { generic: "Suction catheters, spare tube of the same size and one size smaller, ties, gauze", status: "new" },
        { generic: "[ Medicines for the underlying condition ]", status: "continue" },
      ],
      advice: adv([
        { module: "Tracheostomy care", text: "Clean the inner cannula [ 2–3 times a day and whenever blocked ]. Suction when secretions are heard. Clean the stoma skin daily and keep it dry. Change the ties when soiled — one finger should fit under them. Always keep the spare tube, obturator, scissors and suction ready." },
        { module: "Tracheostomy care", text: "Cover the tube with a moist gauze or heat-moisture exchanger. Do not let water enter the tube — no swimming; cover the tube while bathing." },
        { module: "Activity restrictions", text: "Avoid dust, smoke and crowded places. Do not sleep in a way that bends the neck over the tube." },
        { module: "Diet", text: "[ Normal / soft ] diet; sit upright while eating [ and deflate the cuff only as taught ]." },
      ]),
      redFlags: [
        "Difficulty in breathing, noisy breathing, or the tube feels blocked and suction does not clear it",
        "The tube comes out — reinsert the spare tube as taught and come to the hospital immediately",
        "Bleeding from or around the tube",
        "Thick, foul-smelling or blood-stained secretions, or fever",
        "Redness, swelling or pus around the stoma",
      ],
      patientActions: [
        "Attend the ENT OPD after 7 days for a tube and stoma review.",
        "Attend for the scheduled tube change on [ date ].",
        "[ Attend for the decannulation assessment on [ date ]. ]",
        "Keep the emergency kit with the patient at all times, including while travelling.",
      ],
      primaryCareActions: [
        "Review the stoma and the caregiver's tube care.",
        "Arrange suction supplies and a home suction machine if needed.",
        "Treat chest infection early.",
      ],
      conditionAllSatisfactory: false,
    },
    clerkingFocus:
      "Indication — stridor (onset, progression, positional), hoarseness, dysphagia, neck swelling, trauma, prolonged intubation; underlying disease (laryngeal malignancy, bilateral cord palsy, neuromuscular disease); smoking; previous neck surgery or radiotherapy. Examination: respiratory distress, stridor, saturation, neck (goitre, nodes, landmarks), indirect laryngoscopy / flexible endoscopy of the larynx. Baseline: CBC, coagulation profile, chest X-ray, soft-tissue neck X-ray / CT neck as indicated, ABG if distressed.",
    progressNote:
      "Each day — breathing and saturation; secretions (amount, colour); tube patency and inner-cannula cleaning; stoma (bleeding, emphysema, infection); cuff pressure; humidification; chest. POD [ 3–5 ] — first tube change done. Before discharge — caregiver trained and has demonstrated suction, cannula cleaning, tie change and emergency reinsertion; kit and supplies arranged.",
  },

  // ---- Microlaryngeal surgery ----
  {
    key: "ent_microlaryngeal",
    label: "Microlaryngeal surgery (vocal cord lesion)",
    match: /microlaryngo|micro-?laryngeal|\bMLS\b|vocal (cord|fold) (polyp|nodule|cyst|lesion|mass|leukoplakia|papilloma)|reinke|laryngeal (polyp|papilloma|cyst|nodule)/i,
    scaffold: {
      indication:
        "Patient was admitted with hoarseness of voice for [ duration ] due to a [ right / left / bilateral ] vocal cord [ polyp / nodule / cyst / leukoplakia / lesion ], for microlaryngeal surgery.",
      primaryDiagnosis: "[ Right / left / bilateral ] vocal cord [ polyp / nodules / cyst / Reinke's oedema / leukoplakia / lesion ]",
      procedure: {
        name: "Microlaryngeal surgery — [ excision / excision biopsy / decortication ] of [ lesion ] [ cold steel / laser ]",
        anaesthesia: "General anaesthesia",
        findings: "[ lesion site, size and extent; anterior commissure; mobility; the other cord ]",
        drains: "",
        complications: "Nil",
        outcome: "Procedure completed successfully; specimen sent for histopathology.",
      },
      clinicalCourse:
        "Microlaryngeal surgery was performed on [ date ] under general anaesthesia. Recovery was uneventful; there was no stridor or bleeding, and oral intake was resumed. The patient was counselled on strict voice rest. The patient is comfortable at discharge.",
      medications: [
        { ...M.amoxClav, duration: "5 days" },
        M.paracetamol,
        { ...M.pantoprazole, frequency: "BD before meals", duration: "[ 4–8 ] weeks", indication: "reflux control helps the cord heal" },
        { generic: "Steam inhalation", route: "inhalation", frequency: "BD", duration: "1 week", status: "new" },
      ],
      advice: adv([
        { module: "Voice care", text: "Complete voice rest for [ 7 ] days — no talking and no whispering; write instead. Then use the voice gently; avoid shouting, singing and long telephone calls until reviewed." },
        { module: "Voice care", text: "Drink plenty of warm water. Stop smoking completely. Avoid throat clearing — take a sip of water instead." },
        { module: "Diet", text: "Normal diet; avoid spicy and fried food, and do not lie down for 2 hours after meals (reflux)." },
      ]),
      redFlags: [
        RF_BREATH,
        "Coughing or spitting more than streaks of blood",
        RF_FEVER,
      ],
      patientActions: [
        ENT_OPD7,
        "Bring the histopathology report to the follow-up visit.",
        "Attend speech / voice therapy as advised.",
        ANTIBIOTICS,
      ],
      primaryCareActions: ["Support smoking cessation.", "Refer back if hoarseness persists beyond 3 weeks after surgery."],
      conditionAllSatisfactory: true,
    },
    clerkingFocus:
      "Hoarseness — onset, duration, progression, voice use (teacher, singer, vendor); breathlessness or stridor; dysphagia, odynophagia, referred otalgia; cough, haemoptysis; reflux symptoms; smoking and alcohol; weight loss; previous thyroid or neck surgery. Examination: voice quality, indirect / video laryngoscopy (lesion site, cord mobility), neck nodes, thyroid. Baseline: pre-anaesthetic workup, video laryngostroboscopy, CT neck if malignancy is suspected.",
    progressNote:
      "POD 0 — no stridor; no haemoptysis beyond streaks; orals started; voice rest explained. POD 1 — comfortable, tolerating diet, afebrile. Plan: discharge with voice rest and reflux advice; histopathology awaited.",
  },

  // ---- Peritonsillar / deep neck abscess (before tonsillectomy — "peritonsillar" contains "tonsil") ----
  {
    key: "ent_neck_abscess",
    label: "Peritonsillar / deep neck abscess (drained)",
    match: /peritonsillar|quinsy|(deep neck|parapharyngeal|retropharyngeal|submandibular|masticator|neck) (space )?abscess|ludwig/i,
    scaffold: {
      indication:
        "Patient was admitted with [ fever, sore throat, odynophagia, trismus / neck swelling ] due to a [ right / left ] [ peritonsillar / parapharyngeal / retropharyngeal / submandibular ] abscess, requiring incision and drainage and intravenous antibiotics.",
      primaryDiagnosis: "[ Right / left ] [ peritonsillar abscess (quinsy) / parapharyngeal / retropharyngeal / submandibular space abscess / Ludwig's angina ] [ source — tonsillar / dental ]",
      procedure: {
        name: "[ Needle aspiration / incision and drainage ] of [ site ] abscess [ intraoral / external cervical approach ]",
        anaesthesia: "[ Local / general ] anaesthesia",
        findings: "[ volume and nature of pus; spaces involved; pus sent for culture ]",
        drains: "[ corrugated drain — removed on POD __ / nil ]",
        complications: "Nil",
        outcome: "Abscess drained; airway maintained.",
      },
      clinicalCourse:
        "Admitted with [ site ] abscess; the airway was monitored. [ Procedure ] was performed on [ date ] with [ volume ] of pus drained, and intravenous antibiotics were given [ adjusted to the culture report ]. Fever, trismus and swelling settled, and oral intake was resumed. [ The drain was removed on POD __. ] [ Blood sugar was checked and controlled. ] The patient is afebrile, swallowing normally and breathing comfortably at discharge.",
      medications: [
        { ...M.amoxClav, duration: "[ 7–10 ] days", indication: "or as per the pus culture sensitivity" },
        M.metronidazole,
        M.paracetamol,
        M.pantoprazole,
        M.chlorhexidineGargle,
      ],
      advice: adv([
        { module: "Wound care", text: "[ External wound: keep the dressing clean and dry; attend for dressing as advised. ] Warm saline gargles after every meal." },
        { module: "Diet", text: "Soft diet and plenty of fluids; return to normal food as swallowing eases." },
        { module: "Medication instructions", text: "Complete the full antibiotic course. [ Keep blood sugar controlled. ] [ Get the causative tooth treated by a dentist. ]" },
      ]),
      redFlags: [
        RF_BREATH,
        "Neck swelling increasing again, or unable to open the mouth",
        RF_FEVER,
        "Chest pain",
        "Bleeding from the mouth or the wound",
      ],
      patientActions: [
        ENT_OPD7,
        ANTIBIOTICS,
        "[ Interval tonsillectomy after 6 weeks for recurrent quinsy — attend for the date. ]",
        "[ See the dentist for the source tooth. ]",
      ],
      primaryCareActions: ["Check blood sugar and treat diabetes if present.", "Arrange dental treatment of any source tooth."],
      conditionAllSatisfactory: true,
    },
    clerkingFocus:
      "Sore throat, odynophagia, drooling, trismus, hot-potato voice, neck swelling and pain, fever; breathing difficulty or stridor; dental pain or recent extraction; recurrent tonsillitis; diabetes, immunosuppression, IV drug use. Examination: airway and stridor first, trismus (inter-incisor distance), soft-palate bulge and uvula deviation, tonsils, dentition, neck swelling and spaces, torticollis, chest. Baseline: CBC, blood sugar / HbA1c, renal function, CECT neck (± chest if extension suspected), pus culture and sensitivity.",
    progressNote:
      "Each day — airway and saturation; fever curve; trismus; swallowing and oral intake; neck swelling and drain output; wound; culture result and antibiotic changes; blood sugar. Discharge day — afebrile 24–48 h, swallowing, swelling settling, drain out; switched to oral antibiotics.",
  },

  // ---- Tonsillectomy / adenotonsillectomy ----
  {
    key: "ent_tonsillectomy",
    label: "Tonsillectomy / adenotonsillectomy",
    match: /tonsillectomy|adenoidectomy|(chronic|recurrent) tonsillitis|adeno-?tonsillar hypertrophy|tonsillar hypertrophy/i,
    scaffold: {
      indication:
        "Patient was admitted with [ recurrent tonsillitis / tonsillar hypertrophy with obstructive sleep-disordered breathing / adenoid hypertrophy ] for [ tonsillectomy / adenotonsillectomy ].",
      primaryDiagnosis: "[ Chronic / recurrent tonsillitis / adenotonsillar hypertrophy ]",
      procedure: {
        name: "[ Bilateral tonsillectomy / adenotonsillectomy ] — [ dissection and snare / coblation / bipolar ] method",
        anaesthesia: "General anaesthesia",
        findings: "[ tonsil size and grade; adenoid size; haemostasis ]",
        drains: "",
        complications: "Nil",
        outcome: "Procedure completed successfully; [ specimen sent for histopathology ].",
      },
      clinicalCourse:
        "[ Tonsillectomy / adenotonsillectomy ] was performed on [ date ] under general anaesthesia. There was no primary haemorrhage. Oral fluids were started after recovery and a soft diet was tolerated from POD 1. The tonsillar fossae are clean with a normal slough, and there is no bleeding at discharge.",
      medications: [
        { ...M.paracetamol, frequency: "QID", duration: "7 days", indication: "take regularly for the first week; weight-based dose for a child" },
        M.amoxClav,
        M.chlorhexidineGargle,
        M.pantoprazole,
      ],
      advice: adv([
        { module: "Diet", text: "Cold, soft food and plenty of fluids for the first days, then a normal diet — eating normally helps healing. Avoid hot, spicy and hard, sharp foods for 2 weeks." },
        { module: "Medication instructions", text: "Take the painkiller regularly, especially 30 minutes before meals. Do not take aspirin." },
        { module: "Activity restrictions", text: "Rest at home for 10–14 days; avoid crowds, strenuous activity and swimming for 2 weeks." },
        { module: "Return-to-work advice", text: "Return to school or work after 10–14 days." },
        { module: "Wound care", text: "A white coating in the throat is normal healing, not infection. Ear pain in the first week is common and comes from the throat." },
      ]),
      redFlags: [
        RF_BLEED,
        RF_FEVER,
        "Unable to drink enough fluids, or passing very little urine",
        "Breathing difficulty",
      ],
      patientActions: [
        ENT_OPD7,
        "Any bleeding in the first 2 weeks — come to the ENT emergency immediately; do not wait.",
        ANTIBIOTICS,
      ],
      primaryCareActions: ["Refer back immediately with any post-tonsillectomy bleed."],
      conditionAllSatisfactory: true,
    },
    clerkingFocus:
      "Episodes of sore throat per year (and missed school / work), fever, odynophagia; quinsy; snoring, mouth breathing, witnessed apnoeas, daytime sleepiness; ear symptoms (otitis media with effusion); bleeding tendency and family history of bleeding; recent URI; rheumatic fever. Examination: tonsil size and grade, anterior pillar congestion, jugulodigastric nodes, adenoid facies, ears (tympanic membranes), nose. Baseline: CBC, bleeding and clotting time / coagulation profile, pre-anaesthetic workup; X-ray soft-tissue nasopharynx for adenoids.",
    progressNote:
      "POD 0 — no bleeding from the mouth or nose; vitals stable; oral fluids taken; pain controlled. POD 1 — tolerating soft diet, afebrile, fossae clean with slough, no bleeding. Plan: discharge with bleeding warnings and diet advice.",
  },

  // ---- Tympanoplasty / mastoidectomy (CSOM) ----
  {
    key: "ent_tympanoplasty_mastoid",
    label: "Tympanoplasty / mastoidectomy (CSOM)",
    match: /tympanoplasty|myringoplasty|mastoidectomy|ossiculoplasty|\bCSOM\b|chronic (suppurative )?otitis media|cholesteatoma|(central|attic|marginal) perforation|tympanic membrane perforation/i,
    scaffold: {
      indication:
        "Patient was admitted with chronic otitis media of the [ right / left ] ear [ mucosal / squamous (cholesteatoma) type ] with [ ear discharge / hearing loss ], for [ tympanoplasty / mastoidectomy ].",
      primaryDiagnosis: "[ Right / left ] chronic otitis media — [ mucosal (inactive / active) / squamous with cholesteatoma ]",
      procedure: {
        name: "[ Right / left ] [ type I tympanoplasty / cortical mastoidectomy with tympanoplasty / modified radical mastoidectomy / canal wall down mastoidectomy ] [ + ossiculoplasty ]",
        anaesthesia: "[ General / local ] anaesthesia",
        findings: "[ perforation size and site; middle-ear mucosa; ossicular chain; cholesteatoma extent; facial nerve and dural plate; graft (temporalis fascia / tragal perichondrium) and technique ]",
        drains: "",
        complications: "Nil",
        outcome: "Procedure completed successfully; ear canal packed.",
      },
      clinicalCourse:
        "[ Procedure ] was performed on [ date ] under [ general / local ] anaesthesia through a [ postaural / endaural / transcanal ] approach. Postoperatively there was no facial weakness, vertigo or wound collection. The mastoid dressing was removed on POD [ 1 ]. The patient is afebrile and comfortable, with the canal pack in place and the wound healthy at discharge.",
      medications: [
        M.amoxClav,
        M.paracetamol,
        M.pantoprazole,
        M.levocetirizine,
        { ...M.oxymetazoline, indication: "keeps the Eustachian tube open; not beyond 5 days" },
        { generic: "[ Ciprofloxacin 0.3% ear drops ]", route: "ear, on the pack", frequency: "[ … ]", duration: "[ … ]", indication: "only if the surgeon advises — starts after the pack / as instructed", status: "new" },
      ],
      advice: adv([
        { module: "Ear care", text: "Keep the operated ear completely dry — plug it with cotton smeared with petroleum jelly while bathing; no head bath and no swimming until allowed. Do not remove the pack or put anything in the ear." },
        { module: "Activity restrictions", text: "Do not blow the nose forcefully; sneeze with the mouth open. Avoid lifting heavy weights, bending, and air travel for [ 4–6 ] weeks." },
        { module: "Wound care", text: "Keep the postaural wound clean and dry." },
      ]),
      redFlags: [
        "Weakness of the face on the operated side, or difficulty closing the eye",
        "Severe spinning of the head, vomiting, or sudden loss of hearing",
        "Severe headache, neck stiffness, drowsiness or fits",
        "Foul-smelling discharge or bleeding from the ear, or swelling behind the ear",
        RF_FEVER,
      ],
      patientActions: [
        "Attend the ENT OPD after 7 days for suture removal.",
        "Attend after [ 2–3 ] weeks for removal of the ear pack.",
        "Attend after 3 months for a hearing test (pure tone audiometry).",
        ANTIBIOTICS,
      ],
      primaryCareActions: ["Treat nasal infection and allergy early.", "Refer back with any ear discharge or facial weakness."],
      conditionAllSatisfactory: true,
    },
    clerkingFocus:
      "Ear discharge — duration, character (mucoid / scanty foul-smelling), blood-stained; hearing loss; tinnitus, vertigo, facial weakness, headache, fever (complications); nasal and throat infection, allergy; previous ear surgery; diabetes. Examination: otoscopy / otoendoscopy (perforation site and size, cholesteatoma, granulations, polyp), tuning-fork tests, fistula test, facial nerve, nose and throat, cranial nerves. Baseline: pure tone audiometry, ear swab culture if discharging, HRCT temporal bone for squamous disease, pre-anaesthetic workup.",
    progressNote:
      "POD 0 — facial nerve intact; no vertigo or nystagmus; mastoid dressing dry; pain controlled. POD 1 — dressing removed, wound healthy, no haematoma; facial nerve intact; afebrile. Plan: discharge with ear-care advice; pack removal date given.",
  },

  // ---- FESS (sinusitis / polyps) ----
  {
    key: "ent_fess",
    label: "FESS (chronic sinusitis / nasal polyps)",
    match: /\bFESS\b|functional endoscopic sinus|endoscopic sinus surgery|sinusitis|(nasal|sinonasal|ethmoidal|antrochoanal) polyp|polyposis|fungal sinus/i,
    scaffold: {
      indication:
        "Patient was admitted with [ chronic rhinosinusitis with / without nasal polyps / antrochoanal polyp / fungal sinusitis ] not responding to medical treatment, for functional endoscopic sinus surgery.",
      primaryDiagnosis: "[ Chronic rhinosinusitis with nasal polyposis / without polyps / antrochoanal polyp / allergic fungal rhinosinusitis ]",
      procedure: {
        name: "[ Bilateral / right / left ] functional endoscopic sinus surgery — [ uncinectomy, middle meatal antrostomy, anterior / posterior ethmoidectomy, frontal / sphenoid clearance ] [ + polypectomy ] [ + septoplasty ]",
        anaesthesia: "General anaesthesia",
        findings: "[ polyp extent; sinuses involved; mucin / fungal debris; skull base and lamina papyracea intact ]",
        drains: "[ nasal packs — removed on POD __ ]",
        complications: "Nil",
        outcome: "Procedure completed successfully; specimen sent for histopathology [ and fungal studies ].",
      },
      clinicalCourse:
        "Functional endoscopic sinus surgery was performed on [ date ]. There was no orbital or skull-base complication. Nasal packs were removed on POD [ __ ] with no active bleeding. The patient is breathing through the nose, afebrile and comfortable at discharge.",
      medications: [
        M.amoxClav,
        M.paracetamol,
        M.pantoprazole,
        M.levocetirizine,
        M.salineDouche,
        { generic: "Mometasone furoate nasal spray (50 mcg / puff)", dose: "2 puffs each nostril", route: "intranasal", frequency: "OD", duration: "[ … ] months", indication: "start after crusts clear, as advised; long-term for polyps", status: "new" },
        { generic: "[ Prednisolone ]", strength: "[ … ]", route: "PO", frequency: "[ tapering course ]", duration: "[ … ]", indication: "only if prescribed for polyposis / allergic fungal sinusitis", status: "new" },
      ],
      advice: adv([
        { module: "Nasal care", text: "Do the saline douche as taught, 2–3 times a day, to clear crusts. Do not blow the nose forcefully for 2 weeks; sneeze with the mouth open. Some blood-stained discharge for a few days is expected." },
        { module: "Activity restrictions", text: "Avoid heavy lifting, bending, and dusty places for 2 weeks; avoid air travel for 2 weeks." },
        { module: "Medication instructions", text: "Use the steroid nasal spray regularly for as long as advised — stopping early lets polyps come back." },
      ]),
      redFlags: [
        "Heavy nose bleeding that does not stop in 10 minutes",
        "Swelling around the eye, double vision, or reduced vision",
        "Clear watery discharge from the nose that is salty or increases on bending forward",
        "Severe headache, neck stiffness, or fever",
      ],
      patientActions: [
        ENT_OPD7,
        "Attend for nasal endoscopic cleaning (debridement) at 1, 2 and 4 weeks as advised.",
        "Bring the histopathology report to the follow-up visit.",
        ANTIBIOTICS,
      ],
      primaryCareActions: ["Treat allergic rhinitis and asthma; support long-term steroid-spray use."],
      conditionAllSatisfactory: true,
    },
    clerkingFocus:
      "Nasal obstruction, discharge (anterior / postnasal, character), facial pain or pressure, reduced smell, headache; duration and medical treatment tried; allergy, asthma, aspirin sensitivity; epistaxis; visual symptoms or eye swelling; diabetes, immunosuppression; previous nasal surgery. Examination: anterior rhinoscopy, diagnostic nasal endoscopy (polyp grade, discharge, septum), eyes, facial swelling. Baseline: CT paranasal sinuses (coronal), CBC with eosinophil count, blood sugar, pre-anaesthetic workup.",
    progressNote:
      "POD 0 — packs in situ; no active bleed; eyes normal (no proptosis, periorbital swelling or diplopia); no CSF leak. POD 1–2 — packs removed, no bleed, breathing through the nose, afebrile. Plan: discharge with saline douche and debridement dates.",
  },

  // ---- Septoplasty ----
  {
    key: "ent_septoplasty",
    label: "Septoplasty (deviated nasal septum)",
    match: /septoplasty|septal (deviation|spur)|deviated (nasal )?septum|\bDNS\b|submucous resection|\bSMR\b/i,
    scaffold: {
      indication:
        "Patient was admitted with nasal obstruction due to a deviated nasal septum [ with spur to the right / left ], for septoplasty.",
      primaryDiagnosis: "Deviated nasal septum [ to the right / left; C / S shaped; with spur ]",
      procedure: {
        name: "Septoplasty [ + inferior turbinate reduction ]",
        anaesthesia: "[ General / local ] anaesthesia",
        findings: "[ deviation site and type; spur; turbinate hypertrophy ]",
        drains: "[ nasal packs / septal splints — removed on POD __ ]",
        complications: "Nil",
        outcome: "Procedure completed successfully.",
      },
      clinicalCourse:
        "Septoplasty was performed on [ date ]. Nasal packs were removed on POD [ __ ]; there was no active bleeding or septal haematoma. The patient is breathing through both nostrils, afebrile and comfortable at discharge [ with septal splints in place ].",
      medications: [
        { ...M.amoxClav, duration: "5 days" },
        M.paracetamol,
        M.pantoprazole,
        M.levocetirizine,
        M.oxymetazoline,
        { ...M.salineDouche, duration: "2 weeks" },
      ],
      advice: adv([
        { module: "Nasal care", text: "Do not blow the nose forcefully for 2 weeks; sneeze with the mouth open. Use saline as advised to clear crusts. Mild blood-stained discharge for a few days is expected." },
        { module: "Activity restrictions", text: "Avoid heavy lifting, bending, contact sports and injury to the nose for 4 weeks; sleep with the head raised for the first week." },
        { module: "Return-to-work advice", text: "Light work after 1 week." },
      ]),
      redFlags: [
        "Heavy nose bleeding that does not stop in 10 minutes",
        "Increasing blockage of both nostrils with pain and swelling of the nose (septal haematoma)",
        RF_FEVER,
      ],
      patientActions: [
        ENT_OPD7,
        "[ Attend for removal of the septal splints on [ date ]. ]",
        ANTIBIOTICS,
      ],
      primaryCareActions: [],
      conditionAllSatisfactory: true,
    },
    clerkingFocus:
      "Nasal obstruction — side, constant or alternating; mouth breathing, snoring; headache; epistaxis; sinusitis symptoms; allergic rhinitis; nasal trauma; previous nasal surgery; nasal-spray use. Examination: external nose, Cottle's test, anterior rhinoscopy and nasal endoscopy (deviation, spur, turbinates), cold-spatula test. Baseline: pre-anaesthetic workup; CT paranasal sinuses if sinus disease is suspected.",
    progressNote:
      "POD 0 — packs in situ; no active bleed or ooze; vitals stable. POD 1 — packs removed, no bleed, no septal haematoma; breathing through the nose. Plan: discharge with nasal-care advice.",
  },

  // ---- Epistaxis managed with packing ----
  {
    key: "ent_epistaxis",
    label: "Epistaxis managed with nasal packing",
    match: /epistaxis|nose ?bleed|nasal (bleed|pack)|anterior pack|posterior pack/i,
    scaffold: {
      indication:
        "Patient was admitted with [ recurrent / active ] [ anterior / posterior ] epistaxis from the [ right / left ] nasal cavity, requiring nasal packing and inpatient observation.",
      primaryDiagnosis: "[ Anterior / posterior ] epistaxis [ right / left ] — [ cause: Little's area / hypertension / anticoagulant / idiopathic / other ]",
      procedure: {
        name: "[ Anterior nasal packing / posterior nasal packing / nasal endoscopic cauterisation ] [ right / left ]",
        anaesthesia: "[ Local / general ] anaesthesia",
        findings: "[ bleeding site; pack type; blood pressure at presentation ]",
        drains: "[ packs removed on day __ ]",
        complications: "Nil",
        outcome: "Bleeding controlled.",
      },
      clinicalCourse:
        "Admitted with epistaxis; resuscitated [ and blood pressure controlled ]. [ Pack type ] was placed on [ date ] with antibiotic cover. [ Anticoagulant / antiplatelet was withheld and reviewed. ] Packs were removed on day [ __ ] with no rebleed during [ 24 ] hours of observation. Haemoglobin at discharge [ __ g/dl ]. The patient is haemodynamically stable at discharge.",
      medications: [
        { generic: "Petroleum jelly / mupirocin 2% nasal ointment", route: "intranasal (inside the nostril)", frequency: "BD", duration: "7 days", indication: "keeps the lining moist", status: "new" },
        { generic: "Saline nasal spray (isotonic)", dose: "2 sprays each nostril", route: "intranasal", frequency: "TDS", duration: "2 weeks", status: "new" },
        M.paracetamolSos,
        { generic: "[ Antihypertensive ]", status: "continue", indication: "blood-pressure control" },
        { generic: "[ Anticoagulant / antiplatelet ]", status: "changed", indication: "[ restart / hold — as decided with the prescribing team ]" },
        { generic: "[ Ferrous sulfate ]", route: "PO", frequency: "OD", indication: "if anaemic", status: "new" },
      ],
      advice: adv([
        { module: "Nasal care", text: "Do not pick or blow the nose; sneeze with the mouth open. Avoid hot drinks, hot baths and straining for 1 week." },
        { module: "Nasal care", text: "If bleeding starts: sit up, lean forward, pinch the soft part of the nose firmly for 10 minutes and breathe through the mouth; spit out blood, do not swallow it." },
        { module: "Activity restrictions", text: "Avoid heavy lifting and strenuous exercise for 1–2 weeks." },
        { module: "Medication instructions", text: "Take the blood-pressure medicines regularly. Do not take painkillers like aspirin or ibuprofen without asking the doctor." },
      ]),
      redFlags: [
        "Nose bleeding that does not stop after 10–15 minutes of pressing",
        "Blood trickling down the throat, or vomiting blood",
        "Dizziness, fainting, or feeling very weak",
      ],
      patientActions: [
        ENT_OPD7,
        "Get the blood pressure checked every week and bring the record.",
        "[ Attend for nasal endoscopy to look for the cause. ]",
      ],
      primaryCareActions: [
        "Control blood pressure.",
        "Review the need for anticoagulants / antiplatelets and check INR if on warfarin.",
        "Recheck haemoglobin after 2 weeks if anaemic.",
      ],
      conditionAllSatisfactory: true,
    },
    clerkingFocus:
      "Bleeding — side, amount, duration, anterior or trickling into the throat, recurrence; trauma, nose picking; hypertension; anticoagulant, antiplatelet or NSAID use; bleeding elsewhere, easy bruising; liver disease; nasal obstruction, blood-stained discharge, facial swelling (neoplasm); in adolescent males, nasal obstruction (angiofibroma); family history. Examination: haemodynamic status first, blood pressure, anterior rhinoscopy / endoscopy for the bleeding site, oropharynx, neck nodes. Baseline: CBC, blood group and crossmatch, coagulation profile, INR if on warfarin, renal and liver function.",
    progressNote:
      "Each day — any fresh bleed from the pack or into the throat; pack in place; pulse and blood pressure; haemoglobin trend; antibiotic cover while packed; blood-pressure control. After pack removal — no rebleed for 24 h. Plan: discharge with first-aid and nasal-care advice.",
  },
];

// --- generic -------------------------------------------------------------------------

export const ENT_GENERIC_DISCHARGE_TEMPLATE: DischargeTemplate = {
  key: "ent_generic",
  label: "ENT — generic template",
  match: /.^/,
  scaffold: {
    indication:
      "Patient was admitted with [ presenting problem ] for [ investigation / ENT procedure / medical management ].",
    primaryDiagnosis: "",
    procedure: {
      name: "[ Procedure during this admission, if any ]",
      anaesthesia: "",
      findings: "[ relevant operative / endoscopic findings ]",
      drains: "[ packs / drains / tube at discharge, if any ]",
      complications: "Nil",
      outcome: "[ Outcome ]",
    },
    clinicalCourse:
      "Admitted on [ date ] with [ presenting complaint ]. [ Procedure / treatment during the admission. ] The patient improved, was afebrile and stable, and was fit for discharge on [ date ] with the plan below.",
    medications: [],
    advice: adv([
      { module: "Medication instructions", text: "Take the medicines exactly as listed. Do not stop or change a dose without asking the doctor." },
      { module: "Wound care", text: "[ wound, pack or ear / nasal care instructions, if applicable ]" },
      { module: "Follow-up", text: "Attend the ENT OPD on [ … ] with all reports." },
    ]),
    redFlags: [
      "Bleeding from the nose, mouth or ear that does not stop",
      RF_BREATH,
      RF_FEVER,
      "Weakness of the face, or severe spinning of the head",
    ],
    patientActions: [
      "Attend the ENT OPD on [ … ].",
      "Bring this summary and all reports to every visit.",
    ],
    primaryCareActions: [],
    conditionAllSatisfactory: true,
  },
  clerkingFocus:
    "Presenting complaint with onset, duration and course; ear (discharge, hearing loss, tinnitus, vertigo, otalgia), nose (obstruction, discharge, bleeding, smell), throat (sore throat, dysphagia, hoarseness, stridor) and neck swelling; past medical, surgical and drug history; smoking and alcohol. Examination: otoscopy, anterior rhinoscopy / endoscopy, oral cavity and oropharynx, indirect laryngoscopy, neck, cranial nerves. Baseline: CBC and the condition-specific tests (audiometry, CT, endoscopy).",
  progressNote:
    "Each day — symptoms; vitals; airway; bleeding; wound / pack / drain; oral intake; the results back and the plan. For discharge — afebrile, stable, no bleeding, tolerating orals, oral medicines prescribed, and follow-up written down.",
};
