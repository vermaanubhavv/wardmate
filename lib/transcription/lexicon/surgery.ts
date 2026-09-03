import type { MedicalLexiconEntry } from "./types";
import { PRIORITY } from "./types";

/**
 * High-value operative anatomy.
 *
 * None of this is ever the charted diagnosis or procedure, so it is matched purely by the
 * `procedures` / `diagnoses` family tokens of the operation it belongs to. A lap chole patient
 * gets Calot's triangle, the cystic structures and the bile ducts; a hernia patient gets
 * Hesselbach's triangle and the cord structures; nobody gets both.
 */
export const SURGICAL_ANATOMY: MedicalLexiconEntry[] = [
  // --- Biliary ------------------------------------------------------------------
  anat("Calot's triangle", ["triangle of Calot", "hepatocystic triangle", "critical view of safety"], ["cholecystectomy", "chole", "lap chole"], ["cholecystitis", "cholelithiasis", "biliary"]),
  anat("cystic duct", ["cystic duct stump", "cystic duct clip"], ["cholecystectomy", "chole", "cbd exploration"], ["cholecystitis", "cholelithiasis", "biliary"]),
  anat("cystic artery", ["cystic artery clip"], ["cholecystectomy", "chole"], ["cholecystitis", "cholelithiasis", "biliary"]),
  anat("common bile duct", ["CBD", "common bile duct calibre", "dilated CBD"], ["cholecystectomy", "chole", "cbd exploration", "hepaticojejunostomy", "whipple", "ercp"], ["choledocholithiasis", "cbd stone", "obstructive jaundice", "cholangitis", "biliary", "periampullary"]),
  anat("common hepatic duct", ["CHD"], ["cholecystectomy", "cbd exploration", "hepaticojejunostomy"], ["biliary stricture", "cholangiocarcinoma", "biliary"]),
  anat("intrahepatic biliary radicles", ["IHBR", "dilated IHBR", "intra-hepatic biliary radicles"], ["cbd exploration", "hepaticojejunostomy", "ptbd", "ercp"], ["obstructive jaundice", "cholangitis", "cholangiocarcinoma", "periampullary"]),
  anat("porta hepatis", ["portal structures", "hepatoduodenal ligament"], ["cholecystectomy", "cbd exploration", "hepaticojejunostomy", "whipple"], ["carcinoma gallbladder", "cholangiocarcinoma"]),
  anat("ampulla of Vater", ["ampulla", "periampullary region"], ["ercp", "whipple", "cbd exploration"], ["periampullary", "choledocholithiasis", "obstructive jaundice"]),

  // --- Peritoneal spaces -------------------------------------------------------
  anat("Morrison's pouch", ["hepatorenal recess", "hepatorenal pouch", "Morison's pouch"], ["laparotomy", "laparoscopy"], ["trauma", "hemoperitoneum", "collection", "fast"]),
  anat("pouch of Douglas", ["rectovesical pouch", "rectouterine pouch", "POD collection"], ["laparotomy", "laparoscopy", "anterior resection", "apr"], ["collection", "peritonitis", "abscess", "perforation"]),
  anat("lesser sac", ["omental bursa"], ["necrosectomy", "cystogastrostomy", "distal pancreatectomy", "laparotomy"], ["pancreatitis", "pseudocyst", "walled-off", "collection"]),
  anat("paracolic gutter", ["right paracolic gutter", "left paracolic gutter"], ["laparotomy", "appendicectomy"], ["appendicitis", "perforation", "peritonitis", "collection"]),

  // --- Bowel landmarks --------------------------------------------------------
  anat("ileocaecal junction", ["ileocecal junction", "IC junction"], ["right hemicolectomy", "appendicectomy", "resection anastomosis"], ["appendicular", "carcinoma colon", "tuberculosis", "koch's"]),
  anat("duodenojejunal flexure", ["DJ flexure", "ligament of Treitz"], ["laparotomy", "adhesiolysis", "resection anastomosis"], ["obstruction", "malrotation", "trauma"]),
  anat("mesentery", ["small bowel mesentery", "mesenteric root", "mesenteric defect"], ["resection anastomosis", "laparotomy", "adhesiolysis"], ["obstruction", "ischemia", "internal hernia", "trauma"]),

  // --- Inguinal / abdominal wall ---------------------------------------------
  anat("Hesselbach's triangle", ["inguinal triangle", "Hesselbach triangle"], ["hernioplasty", "tapp", "tep", "hernia repair"], ["inguinal hernia", "hernia", "groin"]),
  anat("deep inguinal ring", ["internal inguinal ring", "deep ring"], ["hernioplasty", "tapp", "tep", "hernia repair"], ["inguinal hernia", "hernia", "groin"]),
  anat("superficial inguinal ring", ["external inguinal ring"], ["hernioplasty", "hernia repair"], ["inguinal hernia", "hernia"]),
  anat("spermatic cord", ["cord structures", "cord lipoma"], ["hernioplasty", "tapp", "tep", "hernia repair"], ["inguinal hernia", "hernia", "groin"]),
  anat("inferior epigastric vessels", ["inferior epigastric artery"], ["hernioplasty", "tapp", "tep", "hernia repair"], ["inguinal hernia", "hernia"]),
  anat("inguinal ligament", ["Poupart's ligament"], ["hernioplasty", "hernia repair"], ["inguinal hernia", "femoral hernia", "hernia"]),
  anat("myopectineal orifice", ["MPO", "Fruchaud's orifice"], ["tapp", "tep", "hernia repair"], ["inguinal hernia", "femoral hernia", "hernia"]),
  anat("rectus sheath", ["linea alba", "posterior rectus sheath", "arcuate line"], ["incisional hernia repair", "hernia repair", "laparotomy"], ["incisional hernia", "ventral hernia", "burst abdomen"]),
  anat("Scarpa's fascia", ["Camper's fascia", "superficial fascia of abdomen"], ["laparotomy", "hernia repair"], ["wound", "surgical site infection"]),

  // --- Colorectal planes ----------------------------------------------------
  anat("total mesorectal excision", ["TME", "mesorectum", "mesorectal plane", "holy plane"], ["anterior resection", "lar", "apr"], ["carcinoma rectum", "rectal growth"]),
  anat("inferior mesenteric artery", ["IMA", "IMA pedicle", "high tie", "low tie"], ["anterior resection", "left hemicolectomy", "sigmoid colectomy", "apr"], ["carcinoma colon", "carcinoma rectum"]),
];

function anat(
  term: string,
  aliases: string[],
  procedures: string[],
  diagnoses: string[]
): MedicalLexiconEntry {
  return {
    term,
    aliases,
    categories: ["anatomy"],
    procedures,
    diagnoses: diagnoses.length ? diagnoses : undefined,
    priority: PRIORITY.SPECIALTY,
  };
}
