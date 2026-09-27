import type { AdviceItem } from "@/lib/discharge-entities";
import type { DischargeTemplate, TemplateMedication } from "@/lib/discharge-templates";

/**
 * OPHTHALMOLOGY discharge templates. CLINICAL CONTENT: REVIEWED (Dr Anubhav Verma, 2026-09-28).
 *
 * One template per admission an eye unit commonly discharges. Same rule as the surgical file:
 * what is written here prints as written unless the resident changes it, and a genuinely
 * patient-specific blank — the eye, visual acuity, IOP, graft status — is written as `[ … ]`
 * so it prints as a visible blank, never a guess.
 *
 * Medication lines are a STARTING SET to be checked against each patient — allergy, the other
 * eye's drops, diabetes, glaucoma, pregnancy, smear / culture results. Eye-drop tapers are
 * written into `frequency` / `duration`.
 *
 * Order matters: first match wins (lib/specialty/discharge.ts). Trauma (open globe, chemical)
 * comes first, keratoplasty before corneal ulcer (therapeutic keratoplasty for an ulcer takes
 * the graft set), trabeculectomy and vitreoretinal before cataract (phacotrabeculectomy and
 * vitrectomy-with-IOL take the more specific set).
 */

const adv = (items: { module: string; text: string }[]): AdviceItem[] =>
  items.map((it, i) => ({ id: `adv-${i}`, module: it.module, text: it.text }));

// --- reusable pieces -------------------------------------------------------------------

const EYE = "operated eye [ right / left ]";

const M = {
  moxi: { generic: "Moxifloxacin 0.5% eye drops", dose: "1 drop", route: `topical — ${EYE}`, frequency: "QID", duration: "2 weeks", status: "new" } as TemplateMedication,
  pred6wk: { generic: "Prednisolone acetate 1% eye drops", dose: "1 drop", route: `topical — ${EYE}`, frequency: "6 times a day, tapering by one drop a day each week", duration: "6 weeks", indication: "shake well before use", status: "new" } as TemplateMedication,
  homatropine: { generic: "Homatropine 2% eye drops", dose: "1 drop", route: `topical — ${EYE}`, frequency: "BD", duration: "2 weeks", status: "new" } as TemplateMedication,
  atropine: { generic: "Atropine 1% eye drops", dose: "1 drop", route: `topical — ${EYE}`, frequency: "BD", duration: "2 weeks", status: "new" } as TemplateMedication,
  cmc: { generic: "Carboxymethylcellulose 0.5% eye drops", dose: "1 drop", route: `topical — ${EYE}`, frequency: "QID", duration: "1 month", status: "new" } as TemplateMedication,
  timolol: { generic: "Timolol 0.5% eye drops", dose: "1 drop", route: `topical — ${EYE}`, frequency: "BD", duration: "[ … ]", indication: "only if IOP is raised; avoid in asthma / heart block", status: "new" } as TemplateMedication,
  acetazolamide: { generic: "Acetazolamide", strength: "250 mg", route: "PO", frequency: "[ BD–TDS ]", duration: "[ … ] days", indication: "only if IOP is raised; with potassium supplement; avoid in sulfa allergy / renal impairment", status: "new" } as TemplateMedication,
  paracetamolSos: { generic: "Paracetamol", strength: "650 mg", route: "PO", frequency: "SOS for pain", status: "prn" } as TemplateMedication,
  paracetamol: { generic: "Paracetamol", strength: "650 mg", route: "PO", frequency: "TDS", duration: "5 days", status: "new" } as TemplateMedication,
  amoxClav: { generic: "Amoxicillin-clavulanate", strength: "625 mg", route: "PO", frequency: "TDS", duration: "5 days", status: "new" } as TemplateMedication,
};

const EYE_DROP_TECHNIQUE = {
  module: "Medication instructions",
  text: "Wash hands first. Pull the lower lid down and put one drop without touching the eye. Keep a 5-minute gap between different drops. Use the drops only in the operated eye unless told otherwise. Continue the usual drops in the other eye.",
};
const EYE_PROTECT = {
  module: "Eye care",
  text: "Wear the protective shield at night and dark glasses by day for [ 2 ] weeks. Do not rub or press the eye. Keep water, soap and dust out of the eye — no head bath for [ 1 ] week; clean the lids with boiled, cooled water and clean cotton.",
};

const RF_EYE = [
  "Increasing pain in the eye",
  "Vision getting worse",
  "Increasing redness, swelling of the lids, or sticky discharge",
];
const RF_IOP = "Severe eye pain with headache, nausea or vomiting";

// --- the eight -----------------------------------------------------------------------

export const OPHTHALMOLOGY_DISCHARGE_TEMPLATES: DischargeTemplate[] = [
  // ---- Open-globe injury repair ----
  {
    key: "eye_open_globe",
    label: "Open-globe injury repair",
    match: /open[- ]globe|globe (injury|rupture|repair)|corneo-?scleral (tear|laceration|repair|perforation)|(corneal|scleral) (tear|laceration)|penetrating (eye|ocular) injury|perforating (eye|ocular) injury|intraocular foreign body|\bIOFB\b/i,
    scaffold: {
      indication:
        "Patient was admitted with an open-globe injury of the [ right / left ] eye following [ mechanism ] on [ date ], requiring primary repair.",
      primaryDiagnosis: "[ Right / left ] open-globe injury — [ corneal / corneoscleral / scleral ] [ laceration / rupture ] [ with uveal prolapse / traumatic cataract / IOFB ], zone [ I / II / III ]",
      procedure: {
        name: "[ Right / left ] primary [ corneal / corneoscleral / scleral ] tear repair [ + uveal tissue abscission / reposition ] [ + lens removal ] [ + IOFB removal ]",
        anaesthesia: "[ General / peribulbar ] anaesthesia",
        findings: "[ wound site, length and zone; tissue prolapse; lens; vitreous; number of sutures; IOFB ]",
        drains: "",
        complications: "Nil",
        outcome: "Globe integrity restored; wound watertight.",
      },
      clinicalCourse:
        "Presented [ __ ] hours after injury with an open globe of the [ right / left ] eye; a shield was applied, tetanus prophylaxis and intravenous antibiotics were given, and primary repair was performed on [ date ]. Postoperatively the wound is well apposed with a formed anterior chamber and no signs of endophthalmitis. Visual acuity at discharge [ __ ]; IOP [ __ ]. [ B-scan: __. ] [ Further surgery planned: __. ]",
      medications: [
        M.moxi,
        M.pred6wk,
        M.atropine,
        { generic: "Ciprofloxacin", strength: "750 mg", route: "PO", frequency: "BD", duration: "7 days", indication: "systemic cover against endophthalmitis; or as charted", status: "new" },
        M.paracetamol,
        { ...M.timolol },
      ],
      advice: adv([
        EYE_DROP_TECHNIQUE,
        { module: "Eye care", text: "Wear the shield day and night until told otherwise. Never rub or press the eye. Keep the eye dry." },
        { module: "Activity restrictions", text: "No bending, lifting or straining. Avoid dusty and crowded places. Wear protective glasses at work in future." },
      ]),
      redFlags: [
        ...RF_EYE,
        "Sudden drop in vision with increasing pain (possible infection inside the eye)",
        "Watery discharge or a gush of fluid from the eye",
        "Blurring, pain or redness in the OTHER eye",
      ],
      patientActions: [
        "Attend the Eye OPD after 3 days, then at 1 week and 2 weeks.",
        "[ Attend for suture removal / further surgery on [ date ]. ]",
        "Report any symptom in the other eye at once.",
      ],
      primaryCareActions: ["Complete the tetanus immunisation schedule.", "Refer back urgently with pain or reduced vision in either eye."],
      conditionAllSatisfactory: false,
    },
    clerkingFocus:
      "Mechanism (sharp / blunt / projectile, hammering metal on metal), time since injury, object and its material; loss of vision; pain; prior vision and spectacles; previous eye surgery; tetanus status; last meal; other injuries. Examination (without pressure on the globe): visual acuity, RAPD, lids, wound site and extent, uveal prolapse, Seidel test, anterior chamber, pupil shape, lens, fundus if visible; the other eye. Baseline: X-ray orbit / CT orbit for IOFB (no MRI if a metallic body is possible), B-scan only after closure, pre-anaesthetic workup.",
    progressNote:
      "Each day — visual acuity; pain; lids; wound apposition and sutures; Seidel; anterior chamber depth and cells / hypopyon; fibrin; IOP; red reflex / fundus; signs of endophthalmitis; the other eye. Discharge day — wound watertight, AC formed, no endophthalmitis; drops taught.",
  },

  // ---- Chemical injury ----
  {
    key: "eye_chemical_injury",
    label: "Chemical injury of the eye",
    match: /chemical (injury|burn|splash)|(alkali|acid|lime|chuna) (injury|burn)|(ocular|eye) burn/i,
    scaffold: {
      indication:
        "Patient was admitted with a [ alkali / acid ] chemical injury to the [ right / left / both ] eye(s) from [ agent ] on [ date ], requiring irrigation and intensive topical treatment.",
      primaryDiagnosis: "[ Right / left / bilateral ] [ alkali / acid ] chemical injury — [ Roper-Hall / Dua ] grade [ __ ]",
      procedure: {
        name: "[ Copious irrigation; removal of particulate matter ] [ + amniotic membrane transplantation ] [ + debridement ]",
        anaesthesia: "[ Topical / local ] anaesthesia",
        findings: "[ pH before and after irrigation; epithelial defect size; limbal ischaemia (clock hours); corneal haze; conjunctival involvement ]",
        drains: "",
        complications: "Nil",
        outcome: "[ pH neutralised; epithelial defect __ at discharge ]",
      },
      clinicalCourse:
        "Irrigated until the pH was neutral; particulate matter was removed from the fornices. Treated with intensive topical steroid, antibiotic, cycloplegic and lubricants [ with oral vitamin C and doxycycline ]. [ Amniotic membrane was applied on [ date ]. ] The epithelial defect [ is reducing / has healed ]; IOP [ __ ]; visual acuity at discharge [ __ ]. Fornices were swept [ daily ] to prevent adhesions.",
      medications: [
        { generic: "Prednisolone acetate 1% eye drops", dose: "1 drop", route: "topical — affected eye(s)", frequency: "[ … ] times a day, tapering as advised", duration: "[ … ]", indication: "high-frequency steroid is limited to the first 10–14 days; tapered at review", status: "new" },
        { ...M.moxi, route: "topical — affected eye(s)", indication: "until the epithelium has healed" },
        { ...M.homatropine, route: "topical — affected eye(s)" },
        { generic: "Preservative-free carboxymethylcellulose 0.5% eye drops", dose: "1 drop", route: "topical — affected eye(s)", frequency: "every 2 hours while awake", duration: "[ 3 ] months", status: "new" },
        { generic: "Ascorbic acid (vitamin C)", strength: "500 mg", route: "PO", frequency: "QID", duration: "[ … ] weeks", indication: "alkali injury; avoid in renal stones / impairment", status: "new" },
        { generic: "Doxycycline", strength: "100 mg", route: "PO", frequency: "BD", duration: "[ … ] weeks", indication: "anti-collagenase; not in pregnancy or children under 8", status: "new" },
        { ...M.timolol, route: "topical — affected eye(s)" },
      ],
      advice: adv([
        EYE_DROP_TECHNIQUE,
        { module: "Eye care", text: "Do not rub the eye. Wear dark glasses outdoors. Use the lubricating drops often — they protect the healing surface." },
        { module: "Activity restrictions", text: "Wear protective goggles when handling lime, cement, cleaning agents or batteries. If a chemical ever enters the eye again, wash it immediately with plenty of clean tap water for at least 15–30 minutes, then come to the hospital." },
      ]),
      redFlags: [
        ...RF_EYE,
        "A white or cloudy patch appearing on the black part of the eye",
        "The eyelids sticking to the eyeball, or unable to close the eye",
        RF_IOP,
      ],
      patientActions: [
        "Attend the Eye OPD after 3 days, then every week until the surface heals — steroid drops are changed at each visit.",
        "Do not stop or continue the steroid drops beyond what the doctor writes at each visit.",
      ],
      primaryCareActions: ["Refer back urgently if vision drops or pain increases."],
      conditionAllSatisfactory: false,
    },
    clerkingFocus:
      "Agent (alkali — lime / chuna, cement, cleaning agents; acid — battery, toilet cleaner), time of injury, first aid given and how long the eye was washed, one or both eyes; pain, vision; other burns; previous eye disease. Examination: check and record pH first and irrigate before full examination; visual acuity; lids and lashes; fornices (evert the lids for particles); conjunctival and limbal ischaemia in clock hours; fluorescein epithelial defect; corneal haze; AC; IOP. Grade by Roper-Hall / Dua. Baseline: pH strips, fluorescein, IOP.",
    progressNote:
      "Each day — pain; visual acuity; epithelial defect size (fluorescein); limbal ischaemia; corneal haze and thinning; AC reaction; IOP; symblepharon (sweep the fornices); steroid frequency and taper day. Discharge day — defect healing, IOP controlled, drop schedule written down.",
  },

  // ---- Keratoplasty ----
  {
    key: "eye_keratoplasty",
    label: "Keratoplasty (corneal transplant)",
    match: /keratoplasty|\bPKP?\b|\bDALK\b|\bDSA?EK\b|\bDMEK\b|corneal (transplant|graft)/i,
    scaffold: {
      indication:
        "Patient was admitted with [ corneal opacity / corneal perforation / non-healing corneal ulcer / bullous keratopathy / keratoconus ] of the [ right / left ] eye, for [ optical / therapeutic / tectonic ] keratoplasty.",
      primaryDiagnosis: "[ Right / left ] [ indication ] — status post [ penetrating / lamellar / endothelial ] keratoplasty",
      procedure: {
        name: "[ Right / left ] [ penetrating keratoplasty / DALK / DSEK / DMEK ] [ + cataract extraction with IOL / + anterior vitrectomy ]",
        anaesthesia: "[ Peribulbar / general ] anaesthesia",
        findings: "[ host and donor trephine size; suture type and number (interrupted / continuous); donor cornea details; lens status ]",
        drains: "",
        complications: "Nil",
        outcome: "Graft in place, sutures intact, anterior chamber formed.",
      },
      clinicalCourse:
        "[ Procedure ] was performed on [ date ]. Postoperatively the graft is [ clear / mildly oedematous ], sutures are intact and buried, the anterior chamber is formed and there is no wound leak. [ Epithelium: healed / defect __ ]. IOP [ __ ]. Visual acuity at discharge [ __ ]. [ For a therapeutic graft: no recurrence of infection; continuing antimicrobials as per culture. ]",
      medications: [
        M.moxi,
        { generic: "Prednisolone acetate 1% eye drops", dose: "1 drop", route: `topical — ${EYE}`, frequency: "6 times a day, tapering slowly as advised at each visit", duration: "[ … ] months (often long-term low dose)", indication: "[ withhold / delay if therapeutic graft for fungal keratitis — as the surgeon decides ]", status: "new" },
        M.homatropine,
        { generic: "Preservative-free carboxymethylcellulose 0.5% eye drops", dose: "1 drop", route: `topical — ${EYE}`, frequency: "6 times a day", duration: "3 months", status: "new" },
        M.timolol,
        { generic: "[ Antifungal / antiviral as per the original infection ]", route: "[ … ]", frequency: "[ … ]", duration: "[ … ]", indication: "therapeutic keratoplasty only", status: "new" },
      ],
      advice: adv([
        EYE_DROP_TECHNIQUE,
        EYE_PROTECT,
        { module: "Eye care", text: "The graft can be rejected at any time, even years later. Never stop the steroid drops on your own. Protect the eye from any injury." },
        { module: "Activity restrictions", text: "No bending, lifting or straining for 4 weeks. Avoid dust, smoke and swimming." },
      ]),
      redFlags: [
        "Redness, sensitivity to light, reduced vision or pain in the operated eye (remember: RSVP) — possible graft rejection, come the same day",
        ...RF_EYE,
        "A loose or broken stitch causing a foreign-body feeling",
        RF_IOP,
      ],
      patientActions: [
        "Attend the Eye OPD the day after discharge, then at 1 week, 2 weeks and monthly as advised.",
        "Suture removal is done in stages over months — attend every visit.",
        "Continue the steroid drops exactly as written at each visit.",
      ],
      primaryCareActions: ["Refer back the same day with any red, painful or blurred operated eye."],
      conditionAllSatisfactory: true,
    },
    clerkingFocus:
      "Indication and its history — previous keratitis (organism, treatment), trauma, keratoconus, previous surgery; duration of visual loss; previous grafts and rejection; glaucoma; herpes; dry eye, lid disease, diabetes. Examination: visual acuity (both eyes), lids and lashes, tear film, corneal opacity / thinning / perforation, vascularisation (quadrants), AC, lens, IOP, B-scan if the fundus is not visible, fellow eye. Baseline: B-scan, IOP, blood sugar, pre-anaesthetic workup; smear and culture if active infection.",
    progressNote:
      "Each day — visual acuity; pain; graft clarity; epithelium (fluorescein); sutures (loose, exposed); wound leak (Seidel); AC depth and reaction; IOP; signs of rejection or recurrent infection. Discharge day — graft in place, AC formed, IOP controlled; drops taught; rejection symptoms explained.",
  },

  // ---- Corneal ulcer (medical) ----
  {
    key: "eye_corneal_ulcer",
    label: "Corneal ulcer / infective keratitis (medical)",
    match: /corneal ulcer|(bacterial|fungal|microbial|infective|infectious|suppurative|acanthamoeba|herpetic) keratitis|keratomycosis|hypopyon/i,
    scaffold: {
      indication:
        "Patient was admitted with a [ bacterial / fungal / acanthamoeba / mixed ] corneal ulcer of the [ right / left ] eye [ with hypopyon ] for intensive topical treatment and close monitoring.",
      primaryDiagnosis: "[ Right / left ] [ bacterial / fungal / acanthamoeba ] keratitis — [ organism on smear / culture ]; size [ __ × __ mm ]",
      procedure: {
        name: "[ Corneal scraping for smear and culture ] [ + intrastromal / intracameral antimicrobial injection ] [ + debridement ]",
        anaesthesia: "[ Topical / local ] anaesthesia",
        findings: "[ smear (Gram / KOH): __; culture: __ ]",
        drains: "",
        complications: "Nil",
        outcome: "[ Responding to treatment — infiltrate reducing, epithelium healing ]",
      },
      clinicalCourse:
        "Corneal scrapings were sent on [ date ] [ smear: __; culture: __ ]. Treated with [ hourly topical antimicrobials, tapered with response ], cycloplegic [ and antiglaucoma medication ]. The ulcer is responding — the infiltrate is [ reducing / consolidating ], the epithelial defect is [ __ mm / healed ], and the hypopyon has [ resolved / reduced ]. Visual acuity at discharge [ __ ]. No thinning or perforation.",
      medications: [
        { generic: "Natamycin 5% eye drops", dose: "1 drop", route: "topical — affected eye [ right / left ]", frequency: "[ … ] (tapered with response)", duration: "[ … ] — continue for at least 2 weeks after healing", indication: "FUNGAL keratitis — as per smear / culture", status: "new" },
        { generic: "Moxifloxacin 0.5% eye drops", dose: "1 drop", route: "topical — affected eye [ right / left ]", frequency: "[ … ] (tapered with response)", duration: "[ … ]", indication: "BACTERIAL keratitis / cover — as per smear / culture", status: "new" },
        { ...M.atropine, route: "topical — affected eye [ right / left ]", duration: "[ … ]" },
        { ...M.timolol, route: "topical — affected eye [ right / left ]" },
        M.paracetamolSos,
        { generic: "[ Oral antifungal — e.g. ketoconazole / voriconazole ]", strength: "[ … ]", route: "PO", frequency: "[ … ]", duration: "[ … ]", indication: "deep fungal ulcer only; check liver function", status: "new" },
      ],
      advice: adv([
        EYE_DROP_TECHNIQUE,
        { module: "Medication instructions", text: "Do not use any steroid drops or home remedies in the eye. Do not stop the drops when the eye feels better — continue until the doctor stops them." },
        { module: "Eye care", text: "Do not rub the eye or patch it. Wear dark glasses. Stop contact-lens use. Keep the drops' bottle tip clean." },
      ]),
      redFlags: [
        ...RF_EYE,
        "Watery gush from the eye or sudden relief of pain with worse vision (possible perforation)",
        "White fluid level visible at the bottom of the black part of the eye getting larger",
        RF_IOP,
      ],
      patientActions: [
        "Attend the Eye OPD after [ 2–3 ] days, then weekly until healed — drop frequency is changed at each visit.",
        "Bring all the eye drops to every visit.",
      ],
      primaryCareActions: [
        "Check blood sugar and treat diabetes.",
        "Refer back urgently if the eye worsens; never start topical steroid for a red eye with an ulcer.",
      ],
      conditionAllSatisfactory: false,
    },
    clerkingFocus:
      "Injury with vegetable matter (crop, stick), contact-lens wear, use of steroid or home-remedy drops, previous eye surgery or herpes; duration of pain, redness, watering, photophobia, reduced vision; diabetes, immunosuppression. Examination: visual acuity; lids and lacrimal sac (regurgitation — dacryocystitis); ulcer size, depth, margins (feathery / satellite lesions), infiltrate, thinning; epithelial defect (fluorescein); hypopyon height; IOP (digital if needed); corneal sensation; fellow eye. Baseline: corneal scraping — Gram stain, KOH mount, culture; blood sugar; B-scan if no fundal view.",
    progressNote:
      "Each day — symptoms; visual acuity; ulcer size (infiltrate and epithelial defect in mm); thinning / Descemetocele / perforation; hypopyon height; IOP; smear / culture results; drop frequency and taper; liver function if on oral antifungal. Discharge day — infiltrate reducing and defect healing on a stable regimen; drop schedule written down.",
  },

  // ---- Trabeculectomy ----
  {
    key: "eye_trabeculectomy",
    label: "Trabeculectomy (glaucoma surgery)",
    match: /trabeculectomy|glaucoma (filtering |filtration )?surgery|filtering surgery|\bAGV\b|ahmed (glaucoma )?valve|glaucoma drainage device/i,
    scaffold: {
      indication:
        "Patient was admitted with [ primary open-angle / angle-closure / secondary ] glaucoma of the [ right / left ] eye, uncontrolled on maximal medical therapy, for trabeculectomy.",
      primaryDiagnosis: "[ Right / left ] [ POAG / PACG / secondary ] glaucoma — pre-op IOP [ __ mmHg ], CDR [ __ ]",
      procedure: {
        name: "[ Right / left ] trabeculectomy [ with mitomycin C ] [ + phacoemulsification / SICS with IOL ]",
        anaesthesia: "[ Peribulbar / sub-Tenon ] anaesthesia",
        findings: "[ flap; releasable sutures; MMC concentration and time; AC at end ]",
        drains: "",
        complications: "Nil",
        outcome: "Procedure completed successfully; bleb formed.",
      },
      clinicalCourse:
        "Trabeculectomy was performed on [ date ]. Postoperatively the bleb is [ diffuse, well formed ], the anterior chamber is [ deep / formed ], there is no wound leak (Seidel negative) and no choroidal detachment. IOP at discharge [ __ mmHg ]; visual acuity [ __ ]. All antiglaucoma medication in the operated eye has been stopped.",
      medications: [
        M.moxi,
        { ...M.pred6wk, frequency: "6–8 times a day, tapering slowly as advised", duration: "6–8 weeks" },
        M.homatropine,
        { generic: "[ Antiglaucoma drops ]", route: "topical — OTHER eye", status: "continue", indication: "fellow eye only, as before" },
        { generic: "Antiglaucoma drops in the operated eye / acetazolamide", status: "stopped", indication: "IOP now controlled by surgery" },
        M.paracetamolSos,
      ],
      advice: adv([
        EYE_DROP_TECHNIQUE,
        EYE_PROTECT,
        { module: "Eye care", text: "Do not rub or press the eye — pressure on the bleb can lower the eye pressure too much or open the wound. Do not stop the steroid drops early." },
        { module: "Activity restrictions", text: "No bending, heavy lifting, straining or swimming for 4 weeks." },
      ]),
      redFlags: [
        ...RF_EYE,
        "Sticky discharge with a red eye at any time in future — the bleb can get infected even years later; come the same day",
        "Watery discharge from the operated eye",
        RF_IOP,
      ],
      patientActions: [
        "Attend the Eye OPD the day after discharge, then at 1 week, 2 weeks, 1 month and 3 months.",
        "[ Attend for release / adjustment of sutures as advised. ]",
        "Lifelong glaucoma follow-up — bring all drops to every visit.",
      ],
      primaryCareActions: ["Refer back the same day with a red, sticky, painful operated eye (bleb infection)."],
      conditionAllSatisfactory: true,
    },
    clerkingFocus:
      "Duration of glaucoma; drops used, adherence and side effects; previous laser or surgery; episodes of pain, haloes and redness (angle closure); steroid use; family history; diabetes, hypertension, asthma (timolol), sulfa allergy (acetazolamide). Examination: visual acuity; IOP (Goldmann) with time; gonioscopy; AC depth; lens; optic disc (CDR, notching, haemorrhage); conjunctiva (bleb site). Baseline: perimetry (visual fields), OCT RNFL, pachymetry, IOP phasing, blood sugar, pre-anaesthetic workup.",
    progressNote:
      "Each day — visual acuity; pain; bleb (height, extent, vascularity); Seidel test; AC depth; hyphaema; IOP; choroidal detachment; fundus. Discharge day — bleb formed, AC deep, IOP [ __ ], no leak; drops taught; operated-eye antiglaucoma drops stopped.",
  },

  // ---- Vitreoretinal surgery ----
  {
    key: "eye_vitreoretinal",
    label: "Vitreoretinal surgery (vitrectomy / RD repair)",
    match: /vitrectomy|\bPPV\b|retinal detachment|\bRRD\b|scleral buckl|vitreo-?retinal|silicone oil|gas tamponade|\b(SF6|C3F8)\b|macular hole|vitreous (haemorrhage|hemorrhage)|epiretinal membrane/i,
    scaffold: {
      indication:
        "Patient was admitted with [ rhegmatogenous retinal detachment / vitreous haemorrhage / macular hole / tractional detachment ] of the [ right / left ] eye, for vitreoretinal surgery.",
      primaryDiagnosis: "[ Right / left ] [ macula-on / macula-off rhegmatogenous retinal detachment / vitreous haemorrhage — cause / macular hole ]",
      procedure: {
        name: "[ Right / left ] [ pars plana vitrectomy / scleral buckling ] [ + endolaser ] [ + membrane peeling ] with [ silicone oil / SF6 / C3F8 gas / air ] tamponade [ + lens removal / IOL ]",
        anaesthesia: "[ Peribulbar / general ] anaesthesia",
        findings: "[ extent of detachment; breaks (number and site); PVR grade; macula status; tamponade used ]",
        drains: "",
        complications: "Nil",
        outcome: "[ Retina attached under tamponade ]",
      },
      clinicalCourse:
        "[ Procedure ] was performed on [ date ]. Postoperatively the retina is [ attached ] under [ tamponade ], and the patient maintained [ face-down / right-side / left-side ] posture. IOP [ __ mmHg ]. Visual acuity at discharge [ __ ]. [ Silicone oil removal planned after __ months. ]",
      medications: [
        M.moxi,
        M.pred6wk,
        M.atropine,
        M.timolol,
        M.acetazolamide,
        M.paracetamolSos,
      ],
      advice: adv([
        { module: "Posturing", text: "Keep the head in the [ face-down / right side down / left side down ] position for [ 50 minutes of every hour ] for [ __ ] days, including while sleeping. This keeps the gas / oil pressing on the retina." },
        { module: "Posturing", text: "[ Gas in the eye: do NOT travel by air or go to hill stations until the gas has gone (about [ 2–8 ] weeks). Tell any doctor giving anaesthesia that there is gas in the eye — nitrous oxide must not be used. ]" },
        { module: "Posturing", text: "Do not lie flat on the back." },
        EYE_DROP_TECHNIQUE,
        EYE_PROTECT,
        { module: "Activity restrictions", text: "No bending, heavy lifting or straining for 4 weeks." },
      ]),
      redFlags: [
        ...RF_EYE,
        "A new shadow or curtain coming across the vision, or new flashes and floaters",
        RF_IOP,
      ],
      patientActions: [
        "Attend the Eye OPD (retina clinic) the day after discharge, then at 1 week, 2 weeks and 1 month.",
        "Keep up the posture exactly as advised until the doctor says to stop.",
        "[ Attend for silicone oil removal after [ __ ] months. ]",
      ],
      primaryCareActions: [
        "Control blood sugar and blood pressure (diabetic eye disease).",
        "Do not use nitrous oxide anaesthesia while gas is in the eye.",
      ],
      conditionAllSatisfactory: true,
    },
    clerkingFocus:
      "Floaters, flashes, curtain-like field loss — onset, progression, whether central vision is affected (macula on / off); myopia; previous cataract surgery or trauma; diabetes and its control; fellow-eye history. Examination: visual acuity, RAPD, IOP, AC, lens / IOL, dilated fundus with indirect ophthalmoscopy (extent of detachment, breaks, PVR, macula), fellow-eye fundus. Baseline: B-scan if media opaque, OCT macula, blood sugar / HbA1c, blood pressure, renal function, pre-anaesthetic workup.",
    progressNote:
      "Each day — visual acuity; pain; IOP (raised with gas / oil); AC (oil in AC, fibrin); fill of tamponade; retina attached on indirect ophthalmoscopy; posturing adherence. Discharge day — retina attached, IOP controlled; posture and flight / gas restrictions explained.",
  },

  // ---- Cataract surgery ----
  {
    key: "eye_cataract",
    label: "Cataract surgery (SICS / phaco with IOL)",
    match: /cataract|\bSICS\b|phaco|\bIOL\b|\bECCE\b|pseudophak/i,
    scaffold: {
      indication:
        "Patient was admitted with [ senile / complicated / traumatic ] cataract of the [ right / left ] eye with visual acuity [ __ ], for cataract extraction with intraocular lens implantation.",
      primaryDiagnosis: "[ Right / left ] [ immature / mature / hypermature ] [ senile / complicated / traumatic ] cataract",
      procedure: {
        name: "[ Right / left ] [ manual small-incision cataract surgery (SICS) / phacoemulsification ] with [ posterior-chamber ] IOL implantation",
        anaesthesia: "[ Peribulbar / topical ] anaesthesia",
        findings: "[ nucleus grade; IOL type and power; posterior capsule intact / rent; vitreous loss ]",
        drains: "",
        complications: "Nil",
        outcome: "Procedure completed successfully; IOL in the bag.",
      },
      clinicalCourse:
        "[ SICS / phacoemulsification ] with IOL implantation was performed on [ date ]. On the first postoperative day the wound was well apposed, the cornea [ clear / mild oedema ], the anterior chamber formed with [ mild ] reaction, the IOL centred and the pupil round. Unaided visual acuity at discharge [ __ ]; IOP [ __ ].",
      medications: [
        { ...M.moxi, duration: "1 week" },
        M.pred6wk,
        { ...M.homatropine, duration: "1 week" },
        M.cmc,
        { generic: "Nepafenac 0.1% eye drops", dose: "1 drop", route: `topical — ${EYE}`, frequency: "TDS", duration: "4 weeks", indication: "diabetic / uveitic eye — prevents macular oedema", status: "new" },
        M.paracetamolSos,
      ],
      advice: adv([
        EYE_DROP_TECHNIQUE,
        EYE_PROTECT,
        { module: "Activity restrictions", text: "Normal walking, eating, reading and TV are fine. Avoid bending with the head below the waist, heavy lifting and straining for 2 weeks. No swimming for 4 weeks." },
        { module: "Return-to-work advice", text: "Light work after 1 week; dusty or heavy work after [ 4 ] weeks." },
      ]),
      redFlags: [
        ...RF_EYE,
        "Sudden drop in vision with pain in the first 6 weeks (possible infection inside the eye) — come the same day",
        RF_IOP,
      ],
      patientActions: [
        "Attend the Eye OPD the day after surgery [ if discharged the same day ], then at 1 week and 6 weeks.",
        "Final glasses are prescribed at the 6-week visit.",
        "Continue all the usual medicines — blood pressure, diabetes, and drops in the other eye.",
      ],
      primaryCareActions: ["Control blood sugar in diabetics.", "Refer back the same day with a painful red eye after surgery."],
      conditionAllSatisfactory: true,
    },
    clerkingFocus:
      "Gradual painless loss of vision — duration, glare, uniocular diplopia, change in glasses; trauma, steroid use, uveitis; diabetes, hypertension, COPD / BPH (ability to lie flat, alpha-blockers — floppy iris), anticoagulants; previous eye surgery; fellow-eye vision. Examination: visual acuity and pinhole, lids and lacrimal sac (ROPLAS / regurgitation — must be clear), cornea, AC depth, pupil and dilatation, lens grading, IOP, fundus / B-scan if no view, fellow eye. Baseline: keratometry and A-scan biometry (IOL power), IOP, syringing, blood sugar, blood pressure, urine routine.",
    progressNote:
      "POD 1 — visual acuity; pain; lids; wound apposition; corneal clarity; AC depth and cells / flare; IOL position; pupil; IOP; red reflex / fundus. Plan: discharge with drops taught and follow-up dates.",
  },

  // ---- Dacryocystorhinostomy ----
  {
    key: "eye_dcr",
    label: "Dacryocystorhinostomy (DCR)",
    match: /dacryocystorhinostomy|\bDCR\b|dacryocystitis|nasolacrimal duct (obstruction|block)|\bNLDO\b|mucocele of (the )?lacrimal sac/i,
    scaffold: {
      indication:
        "Patient was admitted with [ chronic dacryocystitis / nasolacrimal duct obstruction ] of the [ right / left ] side with epiphora [ and discharge ], for dacryocystorhinostomy.",
      primaryDiagnosis: "[ Right / left ] [ chronic dacryocystitis / primary acquired nasolacrimal duct obstruction / mucocele of the lacrimal sac ]",
      procedure: {
        name: "[ Right / left ] [ external / endoscopic ] dacryocystorhinostomy [ + silicone intubation ]",
        anaesthesia: "[ Local / general ] anaesthesia",
        findings: "[ sac size and contents; flaps; osteotomy; stent ]",
        drains: "[ nasal pack — removed on POD __ / silicone stent in situ ]",
        complications: "Nil",
        outcome: "Procedure completed successfully; patency confirmed on table.",
      },
      clinicalCourse:
        "[ External / endoscopic ] DCR was performed on [ date ]. [ The nasal pack was removed on POD __. ] There was no significant bleeding. The wound is healthy [ and the silicone stent is in place ]. The patient is comfortable at discharge.",
      medications: [
        M.amoxClav,
        M.paracetamol,
        { ...M.moxi, route: "topical — operated side eye [ right / left ]" },
        { generic: "Oxymetazoline 0.05% nasal drops", dose: "2 drops", route: "intranasal — operated side", frequency: "BD", duration: "5 days", status: "new" },
        { generic: "Saline nasal spray (isotonic)", dose: "2 sprays", route: "intranasal — operated side", frequency: "TDS", duration: "2 weeks", status: "new" },
      ],
      advice: adv([
        { module: "Wound care", text: "[ External DCR: keep the wound clean and dry. ]" },
        { module: "Nasal care", text: "Do not blow the nose forcefully for 2 weeks; sneeze with the mouth open. Mild blood-stained nasal discharge for a few days is expected. Avoid hot drinks for 2 days." },
        { module: "Eye care", text: "[ Do not pull the silicone tube at the inner corner of the eye. ] Some watering continues until healing and stent removal." },
      ]),
      redFlags: [
        "Heavy nose bleeding that does not stop in 10 minutes",
        "Swelling, redness or pus at the inner corner of the eye or the wound",
        "Severe pain or swelling around the eye with fever",
        "High fever",
      ],
      patientActions: [
        "Attend the Eye OPD after 7 days for review [ and suture removal ].",
        "[ Attend for stent removal after [ 6–12 ] weeks. ]",
        "Complete the prescribed course of antibiotics.",
      ],
      primaryCareActions: [],
      conditionAllSatisfactory: true,
    },
    clerkingFocus:
      "Watering — duration, one or both eyes; discharge; swelling at the inner canthus; previous acute dacryocystitis or abscess; nasal symptoms, trauma, sinus surgery; planned cataract surgery (sac must be clear first). Examination: lids and puncta, regurgitation on pressure over the sac (ROPLAS), sac swelling, fluorescein dye disappearance test, nasal examination / endoscopy. Baseline: lacrimal syringing and probing, CBC, bleeding and clotting time, blood sugar, pre-anaesthetic workup; dacryocystogram / CT if atypical.",
    progressNote:
      "POD 0 — no active nasal bleed; wound dry; pain controlled. POD 1 — pack removed, no bleed; wound healthy; stent in place. Plan: discharge with nasal-care advice and follow-up.",
  },
];

// --- generic -------------------------------------------------------------------------

export const OPHTHALMOLOGY_GENERIC_DISCHARGE_TEMPLATE: DischargeTemplate = {
  key: "ophthalmology_generic",
  label: "Ophthalmology — generic template",
  match: /.^/,
  scaffold: {
    indication:
      "Patient was admitted with [ presenting problem ] of the [ right / left / both ] eye(s) for [ investigation / eye surgery / medical management ].",
    primaryDiagnosis: "",
    procedure: {
      name: "[ Procedure during this admission, if any — eye and side ]",
      anaesthesia: "",
      findings: "[ relevant operative findings ]",
      drains: "",
      complications: "Nil",
      outcome: "[ Outcome ]",
    },
    clinicalCourse:
      "Admitted on [ date ] with [ presenting complaint ]. [ Procedure / treatment during the admission. ] Visual acuity at discharge [ right __ / left __ ]; IOP [ right __ / left __ ]. The patient was fit for discharge on [ date ] with the plan below.",
    medications: [],
    advice: adv([
      EYE_DROP_TECHNIQUE,
      { module: "Eye care", text: "[ eye protection and hygiene instructions, if applicable ]" },
      { module: "Follow-up", text: "Attend the Eye OPD on [ … ] with all reports and all the eye drops." },
    ]),
    redFlags: [...RF_EYE, RF_IOP],
    patientActions: [
      "Attend the Eye OPD on [ … ].",
      "Bring this summary, all reports and all eye drops to every visit.",
    ],
    primaryCareActions: [],
    conditionAllSatisfactory: true,
  },
  clerkingFocus:
    "Presenting complaint with eye, onset, duration and course — vision loss, pain, redness, watering, discharge, photophobia, floaters, diplopia; trauma; previous eye disease, surgery and glasses; diabetes, hypertension, steroid use; drug and allergy history. Examination: visual acuity (both eyes, with pinhole), pupils and RAPD, lids and adnexa, conjunctiva, cornea (fluorescein), AC, lens, IOP, fundus. Baseline: condition-specific tests (B-scan, OCT, fields, smear / culture), blood sugar.",
  progressNote:
    "Each day — symptoms; visual acuity; pain; anterior segment findings; IOP; fundus; the results back and the plan. For discharge — stable, IOP controlled, drops taught, and follow-up written down.",
};
