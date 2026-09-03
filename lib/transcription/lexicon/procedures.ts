import type { MedicalLexiconEntry } from "./types";
import { PRIORITY } from "./types";

/**
 * Operations and bedside procedures.
 *
 * `procedures` tokens let a charted or planned operation ("Lap chole + IOC", "Lichtenstein
 * hernioplasty") boost the exact term to top priority and pull in the sibling operations a
 * surgeon might mention in the same breath (a conversion, an on-table decision). `diagnoses`
 * tokens are set where a procedure is the answer to a condition rather than a scheduled
 * operation ("debridement" for a diabetic foot), so it comes in for that patient too.
 */
export const PROCEDURES: MedicalLexiconEntry[] = [
  // --- Laparotomy / emergency ------------------------------------------------------
  proc("exploratory laparotomy", ["ex lap", "emergency laparotomy", "exploratory laparotomy proceed", "laparotomy"], ["laparotomy", "ex lap"], ["perforation", "peritonitis", "obstruction", "trauma", "hemoperitoneum", "ischemia"]),
  proc("diagnostic laparoscopy", ["laparoscopy proceed", "staging laparoscopy"], ["laparoscopy", "diagnostic laparoscopy"], ["carcinoma", "ascites", "tuberculosis", "chronic pain"]),
  proc("adhesiolysis", ["release of adhesions", "laparoscopic adhesiolysis"], ["adhesiolysis"], ["adhesive", "obstruction"]),
  proc("resection and anastomosis", ["resection anastomosis", "small bowel resection anastomosis", "R and A"], ["resection anastomosis", "resection and anastomosis"], ["obstruction", "strangulat", "ischemia", "perforation", "gangrene"]),

  // --- Appendix -------------------------------------------------------------------
  proc("laparoscopic appendicectomy", ["lap appendicectomy", "laparoscopic appendectomy"], ["appendicectomy", "appendectomy"], ["appendicitis", "appendicular"]),
  proc("open appendicectomy", ["open appendectomy", "grid iron appendicectomy"], ["appendicectomy", "appendectomy"], ["appendicitis", "appendicular"]),

  // --- Biliary -------------------------------------------------------------------
  proc("laparoscopic cholecystectomy", ["lap chole", "lap cholecystectomy", "LC", "laparoscopic cholecystectomy with IOC", "elective lap chole"], ["cholecystectomy", "lap chole", "chole"], ["cholelithiasis", "cholecystitis", "gallstone", "biliary"]),
  proc("open cholecystectomy", ["converted to open cholecystectomy", "open chole"], ["cholecystectomy", "chole"], ["cholecystitis", "gallstone", "biliary"]),
  proc("common bile duct exploration", ["CBD exploration", "CBDE", "lap CBD exploration", "choledochotomy"], ["cbd exploration", "choledochotomy"], ["choledocholithiasis", "cbd stone", "cholangitis", "obstructive jaundice"]),
  proc("hepaticojejunostomy", ["Roux-en-Y hepaticojejunostomy", "HJ", "bilioenteric anastomosis"], ["hepaticojejunostomy"], ["biliary stricture", "choledochal cyst", "cholangiocarcinoma", "bile duct injury"]),
  proc("ERCP and stenting", ["ERCP with CBD stenting", "biliary stenting", "CBD stenting", "endoscopic sphincterotomy"], ["ercp", "biliary stent", "cbd stent"], ["choledocholithiasis", "cbd stone", "cholangitis", "obstructive jaundice", "periampullary"]),
  proc("percutaneous transhepatic biliary drainage", ["PTBD", "percutaneous biliary drainage"], ["ptbd"], ["cholangitis", "obstructive jaundice", "cholangiocarcinoma", "periampullary"]),
  proc("pancreaticoduodenectomy", ["Whipple procedure", "Whipple's procedure", "Whipple", "PD"], ["whipple", "pancreaticoduodenectomy"], ["periampullary", "pancreatic head", "cholangiocarcinoma", "carcinoma gallbladder"]),
  proc("distal pancreatectomy", ["distal pancreatectomy with splenectomy", "spleen preserving distal pancreatectomy"], ["distal pancreatectomy"], ["pancreatic", "pseudocyst", "pancreatic tumour"]),
  proc("cystogastrostomy", ["endoscopic cystogastrostomy", "pseudocyst drainage"], ["cystogastrostomy"], ["pseudocyst", "walled-off necrosis", "collection"]),
  proc("necrosectomy", ["pancreatic necrosectomy", "step-up necrosectomy", "VARD"], ["necrosectomy"], ["necrotizing", "necrosis", "walled-off"]),

  // --- Stoma -------------------------------------------------------------------
  proc("loop ileostomy", ["defunctioning ileostomy", "diversion ileostomy", "double barrel ileostomy", "end ileostomy"], ["ileostomy"], ["perforation", "obstruction", "anastomotic leak", "low anterior resection"]),
  proc("loop colostomy", ["end colostomy", "sigmoid colostomy", "transverse colostomy"], ["colostomy"], ["perforation", "obstruction", "carcinoma rectum", "volvulus"]),
  proc("stoma reversal", ["ileostomy closure", "colostomy closure", "Hartmann's reversal", "stoma closure"], ["stoma reversal", "ileostomy closure", "colostomy closure"], ["stoma", "ileostomy", "colostomy"]),

  // --- Colorectal resections --------------------------------------------------
  proc("right hemicolectomy", ["extended right hemicolectomy", "lap right hemicolectomy"], ["hemicolectomy", "right hemicolectomy"], ["carcinoma colon", "cecal growth", "ascending colon", "ileocaecal"]),
  proc("left hemicolectomy", ["lap left hemicolectomy"], ["hemicolectomy", "left hemicolectomy"], ["carcinoma colon", "descending colon", "splenic flexure"]),
  proc("sigmoid colectomy", ["sigmoidectomy", "lap sigmoid colectomy"], ["sigmoid colectomy", "sigmoidectomy"], ["carcinoma colon", "sigmoid growth", "diverticulitis", "volvulus"]),
  proc("anterior resection", ["low anterior resection", "LAR", "high anterior resection", "ultra low anterior resection"], ["anterior resection", "lar"], ["carcinoma rectum", "rectal growth", "rectosigmoid"]),
  proc("abdominoperineal resection", ["APR", "abdomino-perineal resection", "extralevator APR"], ["abdominoperineal resection", "apr"], ["carcinoma rectum", "low rectal growth", "anal canal"]),
  proc("Hartmann's procedure", ["Hartmann procedure", "Hartmann's resection"], ["hartmann"], ["perforation", "obstruction", "carcinoma rectum", "diverticulitis", "volvulus"]),

  // --- Hernia -----------------------------------------------------------------
  proc("Lichtenstein hernioplasty", ["Lichtenstein repair", "open mesh hernioplasty", "mesh hernioplasty", "open mesh repair", "tension free mesh repair"], ["hernioplasty", "lichtenstein", "hernia repair", "mesh repair"], ["inguinal hernia", "hernia"]),
  proc("laparoscopic TAPP repair", ["TAPP", "transabdominal preperitoneal repair", "lap TAPP"], ["tapp", "hernioplasty", "hernia repair"], ["inguinal hernia", "hernia"]),
  proc("laparoscopic TEP repair", ["TEP", "totally extraperitoneal repair", "eTEP", "extended totally extraperitoneal repair", "lap TEP"], ["tep", "hernioplasty", "hernia repair"], ["inguinal hernia", "hernia"]),
  proc("open incisional hernia repair", ["IPOM", "IPOM plus", "ventral hernia repair", "incisional hernia mesh repair", "retrorectus mesh repair", "Rives-Stoppa repair"], ["hernia repair", "hernioplasty", "ipom"], ["incisional hernia", "ventral hernia", "hernia"]),
  proc("mesh repair", ["onlay mesh", "sublay mesh", "preperitoneal mesh", "component separation"], ["mesh repair", "hernioplasty"], ["hernia"]),

  // --- Proctology -----------------------------------------------------------
  proc("hemorrhoidectomy", ["haemorrhoidectomy", "Milligan Morgan hemorrhoidectomy", "open hemorrhoidectomy", "stapled hemorrhoidopexy", "stapled haemorrhoidopexy"], ["hemorrhoidectomy", "haemorrhoidectomy", "hemorrhoidopexy"], ["hemorrhoid", "haemorrhoid", "piles"]),
  proc("lateral internal sphincterotomy", ["LIS", "lateral sphincterotomy"], ["sphincterotomy", "lis"], ["fissure", "fissure in ano"]),
  proc("fistulectomy", ["fistulotomy", "lay open of fistula", "fistulectomy with seton"], ["fistulectomy", "fistulotomy"], ["fistula in ano", "anal fistula", "perianal fistula"]),
  proc("seton placement", ["loose seton", "cutting seton", "seton", "LIFT procedure"], ["seton", "lift procedure"], ["fistula in ano", "anal fistula", "perianal fistula"]),
  proc("pilonidal sinus excision", ["excision of pilonidal sinus", "Limberg flap", "Karydakis flap", "Bascom procedure"], ["pilonidal"], ["pilonidal"]),
  proc("rectopexy", ["laparoscopic ventral mesh rectopexy", "Delorme's procedure", "Altemeier procedure"], ["rectopexy"], ["rectal prolapse", "procidentia"]),

  // --- Wound / soft tissue -----------------------------------------------------
  proc("wound debridement", ["debridement", "serial debridement", "surgical debridement", "wound wash", "slough excision"], ["debridement"], ["diabetic foot", "ulcer", "necrotizing", "abscess", "gangrene", "wound", "non-healing", "cellulitis", "slough"]),
  proc("incision and drainage", ["I and D", "incision drainage", "drainage of abscess"], ["incision and drainage", "i and d", "drainage of abscess"], ["abscess", "collection", "perianal abscess", "cellulitis"]),
  proc("fasciotomy", ["four compartment fasciotomy", "lower limb fasciotomy"], ["fasciotomy"], ["compartment syndrome", "acute limb ischemia", "reperfusion"]),
  proc("VAC dressing", ["vacuum assisted closure", "negative pressure wound therapy", "NPWT", "vac therapy"], ["vac dressing", "npwt", "negative pressure"], ["wound", "diabetic foot", "ulcer", "burst abdomen", "non-healing", "raw area"]),
  proc("split skin grafting", ["split thickness skin graft", "SSG", "STSG", "skin grafting"], ["skin graft", "ssg", "stsg"], ["ulcer", "raw area", "wound", "burn", "granulation", "diabetic foot"]),
  proc("below knee amputation", ["BKA", "below-knee amputation", "trans-tibial amputation"], ["amputation", "bka"], ["gangrene", "diabetic foot", "critical limb ischemia", "peripheral arterial disease"]),
  proc("above knee amputation", ["AKA", "above-knee amputation", "trans-femoral amputation"], ["amputation", "aka"], ["gangrene", "critical limb ischemia", "peripheral arterial disease"]),
  proc("ray amputation", ["toe amputation", "ray amputation of foot", "transmetatarsal amputation", "TMA"], ["amputation", "ray amputation", "toe amputation"], ["diabetic foot", "gangrene", "osteomyelitis"]),

  // --- Trauma / other ---------------------------------------------------------
  proc("splenectomy", ["emergency splenectomy", "laparoscopic splenectomy"], ["splenectomy"], ["splenic injury", "hypersplenism", "ITP"]),
  proc("damage control laparotomy", ["damage control surgery", "abbreviated laparotomy", "laparostomy"], ["damage control"], ["trauma", "polytrauma", "hemoperitoneum"]),
  proc("primary repair of perforation", ["Graham's patch", "omental patch repair", "primary closure of perforation"], ["primary repair", "graham patch", "omental patch"], ["perforation", "peptic perforation", "peritonitis"]),
];

function proc(
  term: string,
  aliases: string[],
  procedures: string[],
  diagnoses: string[]
): MedicalLexiconEntry {
  return {
    term,
    aliases,
    categories: ["procedure"],
    procedures,
    diagnoses: diagnoses.length ? diagnoses : undefined,
    specialties: ["general-surgery"],
    priority: PRIORITY.RELATED,
  };
}
