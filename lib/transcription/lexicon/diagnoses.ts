import type { MedicalLexiconEntry } from "./types";
import { PRIORITY } from "./types";

/**
 * Conditions and presentations a general-surgical unit in India admits.
 *
 * `family` tokens are the hook the selector matches a free-text diagnosis against: a charted
 * "Ac. cholecystitis with cholelithiasis" pulls in the whole biliary family, so the operative
 * anatomy, the scoring system and the right imaging all come along for that patient and no
 * other. The term itself is boosted to exact-patient priority when the charted diagnosis
 * contains it.
 */
export const DIAGNOSES: MedicalLexiconEntry[] = [
  // --- G. Hepatobiliary --------------------------------------------------------------
  dx("cholelithiasis", ["gallstone disease", "gall stone disease", "GB calculus", "cholelithiasis"], ["cholelithiasis", "gallstone", "gall stone", "gb calculus", "biliary"]),
  dx("acute cholecystitis", ["ac cholecystitis", "acute calculous cholecystitis"], ["cholecystitis", "biliary"]),
  dx("chronic cholecystitis", ["chr cholecystitis"], ["cholecystitis", "biliary"]),
  dx("mucocele gallbladder", ["mucocoele of gallbladder", "GB mucocele"], ["mucocele", "gallbladder", "biliary"]),
  dx("empyema gallbladder", ["empyema of gallbladder", "GB empyema", "pyocele gallbladder"], ["empyema gallbladder", "gallbladder", "biliary"]),
  dx("choledocholithiasis", ["CBD stone", "common bile duct stone", "CBD calculus", "choledocholithiasis"], ["choledocholithiasis", "cbd stone", "cbd calculus", "biliary", "obstructive jaundice"]),
  dx("acute cholangitis", ["ascending cholangitis", "cholangitis"], ["cholangitis", "biliary", "obstructive jaundice"]),
  dx("obstructive jaundice", ["surgical jaundice", "biliary obstruction"], ["obstructive jaundice", "biliary", "jaundice"]),
  dx("benign biliary stricture", ["biliary stricture", "post cholecystectomy stricture", "BBS"], ["biliary stricture", "biliary"]),
  dx("carcinoma gallbladder", ["gallbladder carcinoma", "GB carcinoma", "Ca GB", "carcinoma GB"], ["carcinoma gallbladder", "gallbladder", "biliary", "malignancy"]),
  dx("periampullary carcinoma", ["periampullary growth", "ampullary carcinoma"], ["periampullary", "biliary", "malignancy", "obstructive jaundice"]),
  dx("cholangiocarcinoma", ["Klatskin tumour", "hilar cholangiocarcinoma", "bile duct cancer"], ["cholangiocarcinoma", "biliary", "malignancy", "obstructive jaundice"]),

  // --- H. Pancreas ------------------------------------------------------------------
  dx("acute pancreatitis", ["ac pancreatitis", "acute pancreatitis"], ["pancreatitis", "pancreatic"]),
  dx("gallstone pancreatitis", ["biliary pancreatitis", "gall stone pancreatitis"], ["pancreatitis", "pancreatic", "biliary"]),
  dx("alcoholic pancreatitis", ["alcohol induced pancreatitis"], ["pancreatitis", "pancreatic"]),
  dx("necrotizing pancreatitis", ["necrotising pancreatitis", "severe acute pancreatitis", "SAP"], ["pancreatitis", "pancreatic", "necrosis"]),
  dx("acute necrotic collection", ["ANC", "peripancreatic collection"], ["pancreatitis", "pancreatic", "necrosis", "collection"]),
  dx("walled-off necrosis", ["walled off necrosis", "WON", "walled-off pancreatic necrosis"], ["pancreatitis", "pancreatic", "necrosis", "collection"]),
  dx("pancreatic pseudocyst", ["pseudocyst of pancreas", "pancreatic pseudo cyst"], ["pancreatitis", "pancreatic", "pseudocyst", "collection"]),
  dx("chronic pancreatitis", ["chr pancreatitis", "calcific pancreatitis"], ["pancreatitis", "pancreatic"]),

  // --- I. Appendix ----------------------------------------------------------------
  dx("acute appendicitis", ["ac appendicitis", "acute appendicitis"], ["appendicitis", "appendicular", "appendix"]),
  dx("appendicular lump", ["appendicular mass", "appendix lump"], ["appendicitis", "appendicular", "appendix", "lump", "mass"]),
  dx("appendicular abscess", ["appendix abscess", "peri-appendicular abscess"], ["appendicitis", "appendicular", "appendix", "abscess"]),
  dx("perforated appendicitis", ["appendicular perforation", "ruptured appendix"], ["appendicitis", "appendicular", "appendix", "perforation"]),

  // --- J. Intestinal obstruction / perforation -----------------------------------
  dx("acute intestinal obstruction", ["intestinal obstruction", "AIO", "acute abdomen obstruction"], ["obstruction", "intestinal obstruction"]),
  dx("small bowel obstruction", ["SBO", "small gut obstruction"], ["obstruction", "small bowel"]),
  dx("large bowel obstruction", ["LBO", "large gut obstruction", "colonic obstruction"], ["obstruction", "large bowel", "colonic"]),
  dx("adhesive intestinal obstruction", ["adhesive obstruction", "adhesive SBO", "band obstruction"], ["obstruction", "adhesive", "adhesion"]),
  dx("subacute intestinal obstruction", ["SAIO", "sub acute intestinal obstruction"], ["obstruction", "saio", "subacute"]),
  dx("strangulated obstruction", ["strangulation", "closed loop obstruction", "compromised bowel"], ["obstruction", "strangulat", "closed loop"]),
  dx("sigmoid volvulus", ["volvulus", "cecal volvulus", "caecal volvulus", "gut volvulus"], ["volvulus", "obstruction"]),
  dx("intussusception", ["ileocolic intussusception", "intussuception"], ["intussusception", "obstruction"]),
  dx("perforation peritonitis", ["hollow viscus perforation", "GI perforation", "perforative peritonitis"], ["perforation", "peritonitis", "hollow viscus", "pneumoperitoneum"]),
  dx("peptic perforation", ["duodenal perforation", "gastric perforation", "prepyloric perforation", "DU perforation"], ["perforation", "peptic", "peritonitis", "pneumoperitoneum"]),
  dx("ileal perforation", ["jejunal perforation", "typhoid perforation", "enteric perforation"], ["perforation", "ileal", "peritonitis", "koch's"]),
  dx("colonic perforation", ["large bowel perforation", "sigmoid perforation"], ["perforation", "colonic", "peritonitis", "feculent"]),
  dx("fecal peritonitis", ["faecal peritonitis", "biliary peritonitis", "four quadrant peritonitis"], ["peritonitis", "perforation"]),

  // --- K. Hernias ---------------------------------------------------------------
  dx("inguinal hernia", ["direct inguinal hernia", "indirect inguinal hernia", "bilateral inguinal hernia", "IH", "inguinal hernia"], ["hernia", "inguinal", "groin"]),
  dx("incarcerated hernia", ["irreducible hernia", "obstructed hernia", "strangulated hernia"], ["hernia", "incarcerat", "irreducible", "obstructed hernia", "strangulated hernia"]),
  dx("femoral hernia", ["femoral hernia right", "femoral hernia left"], ["hernia", "femoral"]),
  dx("umbilical hernia", ["paraumbilical hernia", "para-umbilical hernia", "supraumbilical hernia"], ["hernia", "umbilical"]),
  dx("epigastric hernia", ["epigastric hernia defect"], ["hernia", "epigastric"]),
  dx("incisional hernia", ["ventral hernia", "recurrent incisional hernia", "port site hernia"], ["hernia", "incisional", "ventral"]),
  dx("Richter's hernia", ["Richter hernia", "Maydl's hernia", "Maydl hernia"], ["hernia"]),

  // --- L. Colorectal / proctology ---------------------------------------------
  dx("hemorrhoids", ["haemorrhoids", "internal hemorrhoids", "external hemorrhoids", "piles", "prolapsed piles", "third degree hemorrhoids"], ["hemorrhoid", "haemorrhoid", "piles"]),
  dx("fissure in ano", ["anal fissure", "chronic fissure in ano", "fissure-in-ano"], ["fissure", "fissure in ano"]),
  dx("fistula in ano", ["anal fistula", "perianal fistula", "recurrent fistula in ano", "fistula-in-ano", "trans-sphincteric fistula"], ["fistula in ano", "anal fistula", "perianal fistula", "fistula"]),
  dx("perianal abscess", ["ischiorectal abscess", "perirectal abscess", "anorectal abscess"], ["perianal abscess", "ischiorectal", "anorectal", "abscess"]),
  dx("pilonidal sinus", ["sacrococcygeal pilonidal sinus", "pilonidal disease"], ["pilonidal"]),
  dx("rectal prolapse", ["complete rectal prolapse", "procidentia", "full thickness rectal prolapse"], ["rectal prolapse", "procidentia", "prolapse"]),
  dx("carcinoma colon", ["colon cancer", "Ca colon", "cecal growth", "ascending colon growth", "sigmoid growth", "colonic growth"], ["carcinoma colon", "colon cancer", "colonic", "colorectal", "growth", "malignancy"]),
  dx("carcinoma rectum", ["rectal carcinoma", "Ca rectum", "rectal growth", "lower rectal growth", "mid rectal growth"], ["carcinoma rectum", "rectal", "colorectal", "growth", "malignancy"]),
  dx("lower GI bleed", ["hematochezia", "haematochezia", "bleeding per rectum", "bleeding PR", "melena", "malena"], ["gi bleed", "lower gi bleed", "hematochezia", "melena", "bleeding pr"]),
  dx("upper GI bleed", ["hematemesis", "haematemesis", "coffee ground vomiting", "UGI bleed"], ["gi bleed", "upper gi bleed", "hematemesis"]),

  // --- M. Diabetic foot / wound / soft tissue -----------------------------------
  dx("diabetic foot", ["diabetic foot ulcer", "DFU", "diabetic foot infection", "diabetic foot cellulitis"], ["diabetic foot", "dfu", "foot ulcer", "diabetic ulcer"]),
  dx("cellulitis", ["spreading cellulitis", "lower limb cellulitis"], ["cellulitis", "soft tissue infection"]),
  dx("abscess", ["soft tissue abscess", "collection", "gluteal abscess", "thigh abscess"], ["abscess", "collection", "soft tissue infection"]),
  dx("necrotizing fasciitis", ["necrotising fasciitis", "nec fasc", "flesh eating infection", "Fournier's gangrene", "Fournier gangrene"], ["necrotizing", "necrotising", "fasciitis", "fournier", "gangrene"]),
  dx("wet gangrene", ["dry gangrene", "gas gangrene", "gangrene foot", "gangrenous changes"], ["gangrene", "diabetic foot"]),
  dx("non-healing ulcer", ["non healing ulcer", "chronic ulcer", "chronic non-healing wound"], ["ulcer", "non-healing", "wound"]),
  woundTerm("slough", ["sloughy", "sloughy wound", "sloughing", "necrotic slough"]),
  woundTerm("eschar", ["eschar over wound", "black eschar"]),
  woundTerm("granulation tissue", ["healthy granulation", "unhealthy granulation", "granulating wound", "granulation"]),
  woundTerm("discharging sinus", ["chronic sinus", "sinus tract", "discharging sinus tract"]),
  dx("pressure ulcer", ["pressure sore", "bed sore", "decubitus ulcer", "sacral sore"], ["pressure ulcer", "pressure sore", "bed sore", "decubitus"]),

  // --- N. Vascular -------------------------------------------------------------
  dx("peripheral arterial disease", ["PAD", "peripheral vascular disease", "PVD", "atherosclerotic PAD"], ["peripheral arterial disease", "peripheral vascular disease", "pad", "pvd", "claudication"]),
  dx("acute limb ischemia", ["acute limb ischaemia", "ALI", "embolic limb ischemia"], ["acute limb ischemia", "acute limb ischaemia", "limb ischemia", "ischemia", "ischaemia"]),
  dx("chronic limb-threatening ischemia", ["critical limb ischemia", "critical limb ischaemia", "CLTI", "CLI", "rest pain"], ["critical limb ischemia", "chronic limb", "clti", "rest pain", "ischemia"]),
  dx("deep vein thrombosis", ["DVT", "proximal DVT", "lower limb DVT", "venous thrombosis"], ["dvt", "deep vein thrombosis", "venous thrombosis"]),
  dx("varicose veins", ["primary varicose veins", "great saphenous vein reflux", "venous insufficiency", "venous ulcer"], ["varicose", "venous insufficiency", "venous ulcer"]),
  dx("Buerger's disease", ["thromboangiitis obliterans", "Buergers disease", "TAO"], ["buerger", "thromboangiitis"]),

  // --- O. Trauma --------------------------------------------------------------
  dx("blunt trauma abdomen", ["blunt abdominal trauma", "BTA", "blunt injury abdomen"], ["trauma", "blunt trauma", "rta", "polytrauma"]),
  dx("penetrating abdominal trauma", ["stab injury abdomen", "penetrating injury abdomen"], ["trauma", "penetrating", "stab"]),
  dx("polytrauma", ["multiple injuries", "road traffic accident", "RTA", "alleged history of RTA"], ["polytrauma", "trauma", "rta", "road traffic accident"]),
  dx("splenic injury", ["splenic laceration", "AAST splenic injury", "grade 3 splenic injury"], ["trauma", "splenic", "spleen", "hemoperitoneum"]),
  dx("liver injury", ["hepatic laceration", "AAST liver injury", "grade 3 liver injury"], ["trauma", "liver injury", "hepatic", "hemoperitoneum"]),
  dx("hollow viscus injury", ["bowel injury", "mesenteric injury", "traumatic bowel perforation"], ["trauma", "hollow viscus", "bowel injury", "mesenteric"]),
  dx("hemoperitoneum", ["haemoperitoneum", "free fluid abdomen", "intraperitoneal bleed"], ["trauma", "hemoperitoneum", "haemoperitoneum"]),

  // --- Misc high-value surgical diagnoses --------------------------------------
  dx("enterocutaneous fistula", ["ECF", "high output fistula", "small bowel fistula"], ["enterocutaneous fistula", "ecf", "fistula", "high output"]),
  dx("anastomotic leak", ["anastomotic dehiscence", "leak from anastomosis", "AL"], ["anastomotic leak", "leak", "anastomos"]),
  dx("burst abdomen", ["abdominal wound dehiscence", "fascial dehiscence", "platzbauch"], ["burst abdomen", "dehiscence", "wound dehiscence"]),
  dx("surgical site infection", ["SSI", "wound infection", "wound gaping with pus"], ["surgical site infection", "ssi", "wound infection"]),
  dx("abdominal tuberculosis", ["abdominal TB", "abdominal Koch's", "intestinal tuberculosis", "peritoneal tuberculosis"], ["tuberculosis", "koch's", "abdominal tb", "tubercular"]),
  dx("sigmoid diverticulitis", ["acute diverticulitis", "complicated diverticulitis", "Hinchey diverticulitis"], ["diverticulitis", "diverticular"]),
];

function dx(term: string, aliases: string[], family: string[]): MedicalLexiconEntry {
  return {
    term,
    aliases,
    categories: ["diagnosis"],
    diagnoses: family,
    specialties: ["general-surgery"],
    priority: PRIORITY.RELATED,
  };
}

/** A wound-bed descriptor — matched by the diagnosis family it belongs to, since it is never
 *  itself the charted diagnosis. */
function woundTerm(term: string, aliases: string[]): MedicalLexiconEntry {
  return {
    term,
    aliases,
    categories: ["diagnosis", "india-round"],
    diagnoses: ["ulcer", "wound", "diabetic foot", "gangrene", "abscess", "non-healing", "raw area", "cellulitis", "necrotizing"],
    priority: PRIORITY.SPECIALTY,
  };
}
