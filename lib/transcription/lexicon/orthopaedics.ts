import type { MedicalLexiconEntry } from "./types";
import { PRIORITY } from "./types";

/**
 * The orthopaedics keyterm core.
 *
 * WHY THESE WORDS. An orthopaedic round is dictated in bones, implants and initials: the fracture
 * ("intertrochanteric", "both bone forearm", "supracondylar"), the operation as letters ("DHS",
 * "PFN", "CRIF", "TKR"), the immobilisation ("above knee POP slab", "Thomas splint"), and the two
 * limb emergencies whose words must never be lost ("pain on passive stretch", "distal pulses").
 * Nova-3 Medical holds the common bones and almost none of the Indian trauma-ward shorthand.
 *
 * Everything here is tagged `orthopaedics`. Terms shared with general surgery (wound, soakage,
 * suture removal) and with medicine (diabetes, anticoagulation) are not repeated; the shared
 * categories reach them.
 *
 * Auto-derived triggers below five characters are dropped by `entry()`, so "DHS", "PFN", "POP",
 * "TKR", "THR", "ACL", "AKA" and "BKA" are never triggers — only spoken content the extractor
 * stores verbatim.
 */

const ORTHO = "orthopaedics" as const;

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
    specialties: [ORTHO],
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
const anat = (t: string, a: string[] = [], tr: string[] = []) =>
  entry(t, ["anatomy"], a, tr, PRIORITY.SPECIALTY);

export const ORTHOPAEDICS: MedicalLexiconEntry[] = [
  // --- The fractures that fill an Indian trauma ward ---------------------------------------
  dx("intertrochanteric femur fracture", ["neck of femur fracture", "subtrochanteric fracture", "shaft of femur fracture", "peritrochanteric fracture"], ["fall at home", "hip pain"]),
  dx("both bone forearm fracture", ["radius and ulna fracture", "distal radius fracture", "Colles fracture", "Galeazzi", "Monteggia"], ["forearm injury"]),
  dx("supracondylar humerus fracture", ["shaft of humerus fracture", "proximal humerus fracture", "olecranon fracture", "lateral condyle fracture"], ["elbow injury"]),
  dx("tibial shaft fracture", ["tibial plateau fracture", "distal tibia fracture", "pilon fracture", "ankle bimalleolar fracture", "calcaneum fracture", "metatarsal fracture"], ["leg injury"]),
  dx("open fracture", ["compound fracture", "Gustilo grade", "degloving injury", "wound over fracture site"], ["road traffic accident"]),
  dx("comminuted displaced fracture", ["undisplaced fracture", "greenstick fracture", "pathological fracture", "non-union", "malunion", "delayed union", "implant failure"], ["fracture"]),
  dx("pelvic fracture", ["acetabular fracture", "pubic rami fracture", "sacroiliac disruption", "open book pelvis"], ["polytrauma"]),
  dx("dislocation of shoulder", ["posterior hip dislocation", "recurrent dislocation", "fracture dislocation", "reduced under sedation"], ["dislocation"]),

  // --- The joint, the spine and the bone infection -----------------------------------------
  dx("osteoarthritis knee", ["tricompartmental osteoarthritis", "varus deformity", "avascular necrosis of hip", "rheumatoid arthritis joint", "frozen shoulder", "adhesive capsulitis"], ["knee pain", "joint pain"]),
  dx("lumbar disc prolapse", ["prolapsed intervertebral disc", "lumbar canal stenosis", "spondylolisthesis", "cauda equina syndrome", "sciatica radiating", "straight leg raise restricted"], ["low back pain"]),
  dx("Potts spine", ["tuberculosis of spine", "tubercular arthritis", "cold abscess", "gibbus deformity", "paradiscal lesion"], ["back pain", "evening rise of temperature"]),
  dx("osteomyelitis", ["chronic osteomyelitis", "septic arthritis", "sequestrum", "discharging sinus over bone", "implant related infection", "diabetic foot osteomyelitis"], ["discharging sinus", "bone infection"]),
  dx("ligament and cartilage injury", ["anterior cruciate ligament tear", "posterior cruciate ligament tear", "medial meniscus tear", "collateral ligament injury", "rotator cuff tear", "tendon achilles rupture"], ["twisting injury", "knee giving way"]),
  dx("club foot", ["congenital talipes equinovarus", "developmental dysplasia of hip", "Perthes disease", "slipped capital femoral epiphysis", "rickets deformity"], ["deformity since birth"]),

  // --- Operations and implants, as they are spoken -----------------------------------------
  proc("dynamic hip screw fixation", ["proximal femoral nail", "cephalomedullary nail", "hemiarthroplasty of hip", "bipolar hemiarthroplasty", "total hip replacement"], ["hip fracture surgery"]),
  proc("open reduction and internal fixation", ["closed reduction and internal fixation", "plating done", "interlocking nail", "K-wire fixation", "tension band wiring", "screw fixation", "percutaneous pinning"], ["fracture fixation"]),
  proc("total knee replacement", ["unicondylar knee replacement", "knee arthroscopy", "arthroscopic ACL reconstruction", "meniscectomy", "shoulder arthroscopy", "arthrodesis"], ["joint replacement"]),
  proc("external fixator application", ["spanning external fixator", "Ilizarov ring fixator", "limb lengthening", "damage control orthopaedics"], ["open fracture"]),
  proc("debridement and wound wash", ["serial debridement", "sequestrectomy", "saucerisation", "flap cover for exposed bone", "split skin grafting over granulating wound"], ["open fracture", "osteomyelitis"]),
  proc("spinal decompression and fixation", ["laminectomy", "discectomy", "transforaminal lumbar interbody fusion", "pedicle screw fixation", "posterior instrumentation"], ["disc prolapse", "spine fracture"]),
  proc("amputation", ["above knee amputation", "below knee amputation", "ray amputation", "disarticulation", "stump revision"], ["gangrene", "crush injury"]),
  proc("implant removal", ["plate removal", "wire removal", "nail removal", "spacer exchange"], ["orthopaedic implant"]),

  // --- Immobilisation, traction and the things at the bedside ------------------------------
  dev("above knee POP cast", ["below knee POP slab", "above elbow slab", "below elbow cast", "U slab", "cast changed", "cast split", "spica cast", "functional brace", "cervical collar", "lumbosacral corset", "knee immobiliser", "arm pouch sling"], ["immobilisation"]),
  dev("skin traction", ["skeletal traction", "Thomas splint", "Bohler Braun frame", "traction weight", "Steinmann pin traction", "Denham pin"], ["skeletal traction applied"]),
  dev("walker and crutches", ["axillary crutch", "elbow crutch", "walking frame", "prosthesis fitted", "orthosis given"], ["mobilisation"]),

  // --- The daily observations that actually change ----------------------------------------
  anat("weight bearing status", ["non-weight bearing", "toe touch weight bearing", "partial weight bearing", "full weight bearing", "mobilised with walker", "sitting up with support", "bed mobilisation"], ["mobilisation", "physiotherapy"]),
  anat("range of movement", ["knee flexion range", "elbow extension lag", "shoulder abduction restricted", "quadriceps drill", "ankle pumps", "static quadriceps", "terminal extension lag"], ["physiotherapy"]),
  anat("distal neurovascular status", ["distal pulses palpable", "dorsalis pedis pulse", "capillary refill time", "sensation over first web space", "dorsiflexion of great toe", "pain on passive stretch", "compartment tense", "cast feels tight"], ["limb check", "swelling increasing"]),
  anat("pin site and wound", ["pin site discharge", "pin tract infection", "wound soakage", "wound gaping", "suture line healthy", "drain output", "haematoma over wound"], ["wound care"]),

  // --- Imaging and the numbers read off it ------------------------------------------------
  test("radiograph of the limb", ["check X-ray", "anteroposterior and lateral view", "oblique view", "callus formation seen", "fracture line visible", "implant in position", "screw backing out", "joint space reduced", "union progressing"], ["X-ray"]),
  test("CT and MRI for bone and joint", ["CT with three dimensional reconstruction", "MRI knee", "MRI spine", "bone scan", "DEXA scan", "nerve conduction study"], ["imaging"]),
  test("orthopaedic blood work", ["erythrocyte sedimentation rate", "C reactive protein", "serum uric acid", "vitamin D level", "alkaline phosphatase", "culture from pus", "GeneXpert on tissue"], ["infection", "bone pain"]),
];
