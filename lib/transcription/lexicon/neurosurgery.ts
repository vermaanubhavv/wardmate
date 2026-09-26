import type { MedicalLexiconEntry } from "./types";
import { PRIORITY } from "./types";

/**
 * The neurosurgery keyterm core.
 *
 * WHY THESE WORDS. A neurosurgical round is dictated in a conscious level and a comparison: the
 * coma scale in components ("E3V4M5"), the pupils with a side, the bleed as initials ("SDH",
 * "EDH", "SAH") with a measurement, the hardware ("VP shunt", "EVD"), and the spine by level.
 * Nova-3 Medical does not reliably hold the initials or the shunt vocabulary, and a mis-heard
 * "EVD" is a drain nobody can account for.
 *
 * Everything here is tagged `neurosurgery`. Terms shared with medicine (seizure drugs, glucose,
 * ventilation) live in the shared categories.
 *
 * Auto-derived triggers below five characters are dropped by `entry()`, so "GCS", "EVD", "SDH",
 * "EDH", "SAH", "ICH", "ICP" and "TBI" are never triggers — only spoken content stored verbatim.
 */

const NEURO = "neurosurgery" as const;

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
    specialties: [NEURO],
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
const dev = (t: string, a: string[] = [], tr: string[] = []) =>
  entry(t, ["device"], a, tr, PRIORITY.RELATED);
const drug = (t: string, a: string[] = [], tr: string[] = []) =>
  entry(t, ["medication"], a, tr, PRIORITY.RELATED);
const anat = (t: string, a: string[] = [], tr: string[] = []) =>
  entry(t, ["anatomy"], a, tr, PRIORITY.SPECIALTY);

export const NEUROSURGERY: MedicalLexiconEntry[] = [
  // --- Head injury, which arrives at night -------------------------------------------------
  dx("traumatic brain injury", ["acute subdural haematoma", "extradural haematoma", "chronic subdural haematoma", "traumatic subarachnoid haemorrhage", "cerebral contusion", "diffuse axonal injury", "depressed skull fracture", "base of skull fracture"], ["head injury", "road traffic accident"]),
  dx("midline shift", ["mass effect present", "effaced basal cisterns", "uncal herniation", "diffuse cerebral oedema", "loss of grey white differentiation", "pneumocephalus"], ["computed tomography head", "neurological deterioration"]),
  dx("raised intracranial pressure", ["papilloedema present", "Cushing response", "pupillary asymmetry", "posturing noted", "decerebrate posturing", "decorticate posturing"], ["drowsiness", "vomiting"]),

  // --- The vascular brain -----------------------------------------------------------------
  dx("spontaneous intracerebral haemorrhage", ["basal ganglia bleed", "thalamic bleed", "lobar haemorrhage", "intraventricular extension", "cerebellar haematoma", "brainstem bleed"], ["sudden weakness", "hypertensive bleed"]),
  dx("aneurysmal subarachnoid haemorrhage", ["ruptured aneurysm", "anterior communicating artery aneurysm", "middle cerebral artery aneurysm", "vasospasm", "rebleed", "arteriovenous malformation"], ["worst headache", "thunderclap headache"]),
  dx("hydrocephalus", ["obstructive hydrocephalus", "communicating hydrocephalus", "normal pressure hydrocephalus", "periventricular lucency", "shunt malfunction", "shunt infection", "post-meningitic hydrocephalus"], ["shunt", "head enlargement"]),

  // --- Tumour, infection and the spine ----------------------------------------------------
  dx("intracranial space occupying lesion", ["glioma", "glioblastoma", "meningioma", "pituitary adenoma", "acoustic schwannoma", "metastatic brain lesion", "posterior fossa tumour", "colloid cyst"], ["focal deficit", "new seizure in an adult"]),
  dx("intracranial infection", ["brain abscess", "subdural empyema", "tubercular meningitis with hydrocephalus", "tuberculoma", "neurocysticercosis"], ["fever with seizure"]),
  dx("spine injury and compression", ["burst fracture of dorsal spine", "compression fracture", "traumatic spondylolisthesis", "cervical spine fracture", "spinal cord injury", "cauda equina compression", "conus level lesion"], ["spine injury", "bladder involvement"]),
  dx("degenerative spine disease", ["cervical myelopathy", "cervical radiculopathy", "lumbar canal stenosis", "prolapsed intervertebral disc", "ossified posterior longitudinal ligament", "Potts spine with compression"], ["neck pain", "limb weakness"]),
  dx("congenital and paediatric neurosurgery", ["myelomeningocele", "encephalocele", "tethered cord", "craniosynostosis", "Chiari malformation", "Dandy Walker malformation"], ["swelling on back since birth"]),

  // --- The operations and the hardware ----------------------------------------------------
  proc("decompressive craniectomy", ["craniotomy and clot removal", "burr hole drainage", "bone flap replaced", "duroplasty done", "cranioplasty later", "bifrontal decompression"], ["head injury surgery"]),
  proc("ventriculoperitoneal shunt", ["shunt revision", "external ventricular drain placement", "endoscopic third ventriculostomy", "Ommaya reservoir", "lumboperitoneal shunt", "shunt tap done"], ["hydrocephalus"]),
  proc("aneurysm clipping", ["endovascular coiling", "AVM excision", "digital subtraction angiography done", "embolisation"], ["subarachnoid haemorrhage"]),
  proc("tumour excision", ["gross total excision", "subtotal excision", "decompression of tumour", "stereotactic biopsy", "transsphenoidal excision", "awake craniotomy", "neuronavigation used"], ["brain tumour"]),
  proc("spinal decompression and instrumentation", ["laminectomy and discectomy", "anterior cervical discectomy and fusion", "posterior cervical fixation", "pedicle screw fixation", "transforaminal lumbar interbody fusion", "corpectomy with cage"], ["spine surgery"]),

  // --- What is examined and recorded every few hours --------------------------------------
  anat("Glasgow coma scale components", ["eye opening response", "verbal response", "best motor response", "obeying commands", "localising to pain", "withdrawing to pain", "abnormal flexion", "extensor response", "not opening eyes", "tracheostomised so verbal not assessable"], ["conscious level"]),
  anat("pupillary examination", ["pupils equal and reacting", "pupil sluggishly reacting", "pupil not reacting", "anisocoria noted", "fixed and dilated pupil", "corneal reflex present", "doll's eye movement", "gag reflex present"], ["pupils"]),
  anat("motor power and sensory level", ["power in both lower limbs", "grade four power", "hemiplegia", "paraplegia", "quadriparesis", "tone increased", "plantar extensor", "sensory level at umbilicus", "bladder and bowel involvement", "perianal sensation preserved"], ["weakness", "spine"]),

  // --- Drains, tubes and drugs ------------------------------------------------------------
  dev("external ventricular drain", ["EVD at ten centimetres", "EVD draining clear CSF", "EVD clamped", "subgaleal drain", "lumbar drain in situ", "intracranial pressure monitor", "shunt chamber refilling", "tracheostomy tube in situ"], ["ventricular drain", "cerebrospinal fluid"]),
  drug("osmotherapy and antiepileptics", ["mannitol given", "three percent saline infusion", "levetiracetam loading dose", "phenytoin loaded", "sodium valproate", "dexamethasone for oedema", "nimodipine for vasospasm"], ["raised intracranial pressure", "seizure control"]),

  // --- Imaging, read out as a report ------------------------------------------------------
  test("computed tomography of the head", ["non-contrast CT head", "repeat CT head", "no fresh bleed", "haematoma thickness measured", "CT angiography brain", "CT venography", "MRI brain with contrast", "MRI spine whole", "diffusion weighted imaging", "MR spectroscopy", "tractography"], ["imaging"]),
  test("CSF and neuro investigations", ["cerebrospinal fluid analysis", "CSF cell count", "CSF protein and sugar", "CSF culture", "serum sodium monitoring", "serum osmolality", "electroencephalogram", "visual evoked potential"], ["cerebrospinal fluid study", "neurological investigation"]),
];
