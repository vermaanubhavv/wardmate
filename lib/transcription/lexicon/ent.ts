import type { MedicalLexiconEntry } from "./types";
import { PRIORITY } from "./types";

/**
 * The ENT (otorhinolaryngology) keyterm core.
 *
 * WHY THESE WORDS. Nova-3 Medical handles ordinary English anatomy. What it does not get is an
 * ENT round: the operations spoken as one token ("FESS", "MRM", "type 1 tympanoplasty",
 * "septoplasty"), the examination shorthand nobody spells out ("otoscopy", "DNS", "PNS view",
 * "indirect laryngoscopy", "Rinne and Weber"), the audiology vocabulary ("pure tone
 * audiometry", "air-bone gap", "impedance", "BERA"), and the north-Indian casemix this ward
 * actually admits — chronic otitis media with its sequelae, deep neck space infections, and
 * oral cavity and laryngeal malignancy in tobacco and areca-nut users.
 *
 * Everything here is tagged `ent`, so no other unit spends its keyterm budget on "mastoidectomy".
 * Terms ENT shares with general surgery (drain, suture, biopsy, the antibiotic brands) are not
 * repeated — the shared categories already reach them.
 *
 * Auto-derived triggers below five characters are dropped by `entry()`, and
 * `__tests__/ent-collisions.test.ts` pins that nothing left fires inside an unrelated word —
 * the "ANC ⊂ pancreatitis" bug class documented in docs/specialty-packs.md §9.
 *
 * "RT" IS DELIBERATELY ABSENT (radiotherapy or Ryle's tube — CONTEXT.md §2), and so is a bare
 * "CSOM": it is here spelled out as chronic otitis media, which is what the letters mean.
 */

const ENT = "ent" as const;

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
    specialties: [ENT],
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
const anat = (t: string, a: string[] = [], tr: string[] = []) =>
  entry(t, ["anatomy"], a, tr, PRIORITY.SPECIALTY);
const test = (t: string, a: string[] = [], tr: string[] = []) =>
  entry(t, ["investigation"], a, tr, PRIORITY.SCORING_OR_INVESTIGATION);
const device = (t: string, a: string[] = [], tr: string[] = []) =>
  entry(t, ["device"], a, tr, PRIORITY.RELATED);

export const ENT_LEXICON: MedicalLexiconEntry[] = [
  // --- Ear -------------------------------------------------------------------------------
  dx("chronic otitis media", ["chronic suppurative otitis media", "mucosal disease", "squamous disease", "safe ear", "unsafe ear"], ["discharging ear"]),
  dx("cholesteatoma", ["attic perforation", "retraction pocket", "keratin debris"], ["unsafe ear", "foul discharge"]),
  dx("acute otitis media", ["bulging tympanic membrane", "otitis media with effusion", "glue ear"], ["earache"]),
  dx("otitis externa", ["diffuse otitis externa", "furunculosis of ear", "otomycosis", "skull base osteomyelitis"], ["earache"]),
  dx("tympanic membrane perforation", ["central perforation", "marginal perforation", "traumatic perforation", "dry perforation"], ["hearing loss"]),
  dx("otosclerosis", ["stapes fixation", "conductive deafness"], ["hearing loss"]),
  dx("sensorineural hearing loss", ["sudden sensorineural hearing loss", "presbycusis", "noise induced hearing loss", "ototoxicity"], ["hearing loss"]),
  dx("benign paroxysmal positional vertigo", ["BPPV", "positional vertigo", "Dix-Hallpike", "Epley manoeuvre"], ["giddiness"]),
  dx("Meniere disease", ["Meniere's disease", "endolymphatic hydrops", "aural fullness"], ["giddiness", "hearing loss"]),
  dx("mastoiditis", ["coalescent mastoiditis", "postaural abscess", "subperiosteal abscess"], ["swelling behind ear"]),
  anat("tympanic membrane", ["pars tensa", "pars flaccida", "handle of malleus", "cone of light"], ["otoscopy"]),
  proc("tympanoplasty", ["type 1 tympanoplasty", "myringoplasty", "cortical mastoidectomy", "modified radical mastoidectomy", "canal wall down"], ["ear surgery"]),
  proc("myringotomy", ["grommet insertion", "ventilation tube"], ["ear surgery"]),
  test("pure tone audiometry", ["audiogram", "air-bone gap", "bone conduction", "PTA report", "impedance audiometry", "tympanogram", "BERA", "OAE screening"], ["hearing"]),
  test("tuning fork tests", ["Rinne test", "Weber test", "absolute bone conduction"], ["hearing"]),

  // --- Nose and sinuses --------------------------------------------------------------------
  dx("deviated nasal septum", ["septal deviation", "DNS with spur", "septal spur"], ["nasal obstruction"]),
  dx("chronic rhinosinusitis", ["sinusitis", "nasal polyposis", "ethmoidal polyp", "antrochoanal polyp", "fungal sinusitis"], ["nasal obstruction", "headache"]),
  dx("allergic rhinitis", ["perennial rhinitis", "seasonal rhinitis", "turbinate hypertrophy"], ["sneezing"]),
  dx("epistaxis", ["anterior epistaxis", "posterior epistaxis", "Little's area bleed", "Kiesselbach plexus"], ["bleeding nose"]),
  dx("juvenile nasopharyngeal angiofibroma", ["angiofibroma", "JNA lesion"], ["bleeding nose", "nasal mass"]),
  dx("rhino-orbital mucormycosis", ["mucormycosis", "invasive fungal sinusitis", "black eschar palate"], ["diabetic", "facial swelling"]),
  proc("functional endoscopic sinus surgery", ["FESS procedure", "endoscopic sinus surgery", "uncinectomy", "middle meatal antrostomy", "polypectomy"], ["sinus surgery"]),
  proc("septoplasty", ["submucous resection", "turbinoplasty", "turbinate reduction"], ["nasal surgery"]),
  proc("nasal packing", ["anterior nasal packing", "posterior nasal packing", "merocel pack", "ribbon gauze pack"], ["bleeding nose"]),
  test("diagnostic nasal endoscopy", ["nasal endoscopy", "DNE findings", "PNS view", "CT paranasal sinuses"], ["nasal"]),

  // --- Throat, larynx and neck ---------------------------------------------------------------
  dx("chronic tonsillitis", ["recurrent tonsillitis", "membranous tonsillitis", "tonsillar hypertrophy", "adenoid hypertrophy"], ["throat pain"]),
  dx("peritonsillar abscess", ["quinsy", "parapharyngeal abscess", "retropharyngeal abscess", "Ludwig angina"], ["throat pain", "trismus"]),
  dx("acute epiglottitis", ["supraglottitis", "laryngotracheobronchitis", "croup"], ["stridor"]),
  dx("vocal cord palsy", ["recurrent laryngeal nerve palsy", "cord immobility", "bowing of cord"], ["hoarseness"]),
  dx("vocal nodules", ["vocal polyp", "Reinke oedema", "laryngopharyngeal reflux"], ["hoarseness"]),
  dx("laryngeal carcinoma", ["glottic carcinoma", "supraglottic carcinoma", "hypopharyngeal carcinoma", "pyriform fossa growth"], ["hoarseness", "tobacco"]),
  dx("oral cavity carcinoma", ["buccal mucosa carcinoma", "tongue carcinoma", "oral submucous fibrosis", "leukoplakia patch", "erythroplakia"], ["areca", "tobacco"]),
  dx("laryngeal tuberculosis", ["tubercular laryngitis"], ["hoarseness"]),
  proc("tonsillectomy", ["adenotonsillectomy", "adenoidectomy", "coblation tonsillectomy"], ["throat surgery"]),
  proc("tracheostomy", ["emergency tracheostomy", "elective tracheostomy", "tracheostomy tube change", "decannulation"], ["airway"]),
  proc("direct laryngoscopy", ["microlaryngeal surgery", "rigid oesophagoscopy", "foreign body removal airway"], ["airway"]),
  proc("neck dissection", ["modified radical neck dissection", "selective neck dissection", "total laryngectomy", "hemiglossectomy"], ["malignancy"]),
  test("indirect laryngoscopy", ["flexible laryngoscopy", "videolaryngoscopy", "stroboscopy"], ["hoarseness"]),
  test("fine needle aspiration cytology neck", ["FNAC neck node", "ultrasound neck", "contrast CT neck"], ["neck swelling"]),
  device("nasogastric feeding after airway surgery", ["Ryle's tube feeding", "tracheostomy tube", "cuffed tube", "fenestrated tube", "speaking valve"], ["airway"]),
];
