import type { MedicalLexiconEntry } from "./types";
import { PRIORITY } from "./types";

/**
 * The ophthalmology keyterm core.
 *
 * WHY THESE WORDS. An eye round is dictated almost entirely in notation and shorthand:
 * acuities ("6 by 12", "counting fingers at 3 metres", "hand movements", "perception of light
 * present"), the operations as initials ("phaco with PCIOL", "SICS", "trabeculectomy", "pars
 * plana vitrectomy"), the examination in instruments ("slit lamp", "applanation", "fundus with
 * plus 90", "gonioscopy"), and the Indian cataract-camp vocabulary this speciality runs on.
 * Nova-3 Medical does not reliably hold any of it.
 *
 * Everything here is tagged `ophthalmology`. Terms shared with medicine (diabetes,
 * hypertension, the antibiotic brands) are not repeated; the shared categories reach them.
 *
 * Auto-derived triggers below five characters are dropped by `entry()`;
 * `__tests__/ophthalmology-collisions.test.ts` pins that nothing left fires inside an unrelated
 * word. "IOP", "IOL", "PL", "CF" and "HM" are therefore never triggers, only spoken content the
 * extractor stores verbatim.
 */

const EYE = "ophthalmology" as const;

function entry(
  term: string,
  categories: MedicalLexiconEntry["categories"],
  aliases: string[] = [],
  triggers: string[] = [],
  priority: number = PRIORITY.SPECIALTY
): MedicalLexiconEntry {
  return {
    term,
    aliases,
    categories,
    specialties: [EYE],
    triggers: [term, ...aliases, ...triggers]
      .map((t) => t.toLowerCase())
      .filter((t) => t.length >= 5),
    priority,
  };
}

const dx = (t: string, a: string[] = [], tr: string[] = []) =>
  entry(t, ["diagnosis"], a, tr, PRIORITY.EXACT_PATIENT);
const proc = (t: string, a: string[] = [], tr: string[] = []) =>
  entry(t, ["procedure"], a, tr, PRIORITY.RELATED);
const test = (t: string, a: string[] = [], tr: string[] = []) =>
  entry(t, ["investigation"], a, tr, PRIORITY.SCORING_OR_INVESTIGATION);
const drug = (t: string, a: string[] = [], tr: string[] = []) =>
  entry(t, ["medication"], a, tr, PRIORITY.RELATED);
const anat = (t: string, a: string[] = [], tr: string[] = []) =>
  entry(t, ["anatomy"], a, tr, PRIORITY.SPECIALTY);

export const OPHTHALMOLOGY: MedicalLexiconEntry[] = [
  // --- Lens, and the operation this speciality does most -----------------------------------
  dx("immature senile cataract", ["mature cataract", "hypermature cataract", "nuclear sclerosis", "posterior subcapsular cataract", "traumatic cataract"], ["diminution of vision"]),
  proc("phacoemulsification", ["phaco with posterior chamber intraocular lens", "small incision cataract surgery", "extracapsular cataract extraction", "intraocular lens implanted", "sulcus fixated lens", "aphakia left"], ["cataract surgery"]),
  dx("posterior capsular opacification", ["after cataract", "capsular thickening"], ["vision dropped again"]),
  proc("YAG capsulotomy", ["laser capsulotomy"], ["after cataract"]),

  // --- Glaucoma -------------------------------------------------------------------------------
  dx("primary open angle glaucoma", ["angle closure glaucoma", "acute angle closure", "ocular hypertension", "glaucomatous optic neuropathy", "cup disc ratio increased"], ["raised pressure"]),
  test("intraocular pressure", ["applanation tonometry", "Goldmann applanation", "non-contact tonometry", "digital tension", "pressure in millimetres of mercury"], ["glaucoma"]),
  test("gonioscopy", ["angle open", "angle closed", "peripheral anterior synechiae"], ["glaucoma"]),
  test("visual field testing", ["perimetry report", "Humphrey field analyser", "arcuate scotoma", "tunnel vision"], ["glaucoma"]),
  proc("trabeculectomy", ["glaucoma filtration surgery", "bleb formed", "laser peripheral iridotomy", "glaucoma drainage device"], ["glaucoma surgery"]),

  // --- Retina and the diabetic eye ----------------------------------------------------------------
  dx("diabetic retinopathy", ["non-proliferative diabetic retinopathy", "proliferative diabetic retinopathy", "diabetic macular oedema", "clinically significant macular oedema"], ["diabetic eye"]),
  dx("retinal detachment", ["rhegmatogenous detachment", "tractional detachment", "retinal break", "horseshoe tear", "macula on", "macula off"], ["curtain", "floaters"]),
  dx("vitreous haemorrhage", ["dense vitreous bleed", "fundus not visible"], ["sudden loss of vision"]),
  dx("retinal vein occlusion", ["central retinal vein occlusion", "branch retinal vein occlusion", "central retinal artery occlusion", "cherry red spot"], ["sudden painless loss"]),
  dx("age-related macular degeneration", ["dry macular degeneration", "wet macular degeneration", "choroidal neovascular membrane", "drusen seen"], ["central vision"]),
  dx("retinopathy of prematurity", ["ROP screening", "zone and stage recorded", "plus disease noted"], ["preterm baby"]),
  proc("pars plana vitrectomy", ["vitrectomy with endolaser", "scleral buckling", "silicone oil in situ", "gas tamponade", "pan retinal photocoagulation", "focal laser"], ["retinal surgery"]),
  drug("intravitreal injection", ["anti-VEGF injection", "ranibizumab given", "bevacizumab given", "intravitreal steroid implant"], ["macular oedema"]),

  // --- Cornea, ocular surface and infection ----------------------------------------------------
  dx("corneal ulcer", ["infective keratitis", "fungal keratitis", "bacterial keratitis", "hypopyon present", "corneal opacity", "descemetocele"], ["white spot"]),
  dx("conjunctivitis", ["viral conjunctivitis", "bacterial conjunctivitis", "vernal keratoconjunctivitis", "allergic conjunctivitis"], ["red eye"]),
  dx("pterygium", ["pinguecula", "dry eye disease", "meibomian gland dysfunction", "blepharitis"], ["irritation"]),
  dx("anterior uveitis", ["iridocyclitis", "keratic precipitates", "cells and flare", "posterior synechiae", "panuveitis"], ["photophobia"]),
  dx("endophthalmitis", ["post-operative endophthalmitis", "vitreous exudates", "post-injection endophthalmitis"], ["pain after surgery"]),
  proc("keratoplasty", ["penetrating keratoplasty", "therapeutic keratoplasty", "corneal graft", "amniotic membrane grafting", "tarsorrhaphy done"], ["corneal surgery"]),

  // --- Lids, orbit, squint and trauma -------------------------------------------------------------
  dx("chalazion", ["hordeolum externum", "stye", "lid abscess", "ptosis noted", "entropion", "ectropion"], ["lid swelling"]),
  dx("dacryocystitis", ["chronic dacryocystitis", "regurgitation test positive", "nasolacrimal duct block", "watering eye"], ["watering"]),
  proc("dacryocystorhinostomy", ["DCR surgery", "syringing and probing"], ["watering"]),
  dx("orbital cellulitis", ["preseptal cellulitis", "proptosis present", "restricted ocular movements"], ["lid swelling", "fever"]),
  dx("open globe injury", ["penetrating ocular injury", "corneal tear", "scleral tear", "iris prolapse", "traumatic hyphaema", "intraocular foreign body"], ["eye injury"]),
  dx("strabismus", ["esotropia", "exotropia", "amblyopia", "cover test done", "prism cover test"], ["squint"]),

  // --- Examination and imaging ---------------------------------------------------------------------
  test("visual acuity recorded", ["Snellen acuity", "counting fingers", "hand movements", "perception of light", "projection of rays", "unaided vision", "best corrected visual acuity", "pinhole improvement"], ["visual acuity"]),
  test("slit lamp examination", ["anterior segment examination", "fundus examination", "indirect ophthalmoscopy", "plus ninety lens", "dilated fundus evaluation"], ["examination"]),
  test("optical coherence tomography", ["OCT macula", "OCT retinal nerve fibre layer", "fundus fluorescein angiography", "B-scan ultrasonography", "specular microscopy", "biometry done", "keratometry reading"], ["imaging"]),
  anat("anterior chamber", ["anterior chamber depth", "pupillary reaction", "relative afferent pupillary defect", "posterior segment", "optic disc", "macula reflex", "fovea"], ["examination"]),
  drug("topical eye drops", ["antibiotic eye drops", "steroid eye drops", "lubricating drops", "timolol drops", "atropine ointment", "cycloplegic drops", "drops tapered"], ["eye drops"]),
];
