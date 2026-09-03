import type { MedicalLexiconEntry } from "./types";
import { PRIORITY } from "./types";

/**
 * Indian hospital documentation language and daily surgical ward-round phrases.
 *
 * Almost all of this is priority 60 and carries NO specialty tag, so a term here is sent only
 * when the patient context or note type actually pulls it in (a pre-op note → consent and
 * fitness vocabulary; a post-op note → the round phrases). This is the vocabulary Nova-3
 * Medical is least likely to have met and most likely to write an ordinary English word for,
 * but it is still not worth spending budget on all of it every time.
 */
export const INDIA: MedicalLexiconEntry[] = [
  // --- A. Documentation / clinical examination shorthand -------------------------------
  entry("per rectal examination", ["P/R", "per rectum", "digital rectal examination", "DRE"]),
  entry("known case of", ["K/C/O", "known to have"]),
  entry("history of present illness", ["HPI", "history of presenting illness"]),
  entry("no history of", ["no H/O", "not a known case of"]),
  entry("on examination", ["O/E"]),
  entry("general condition fair", ["general condition stable", "GC fair", "GC stable"]),
  entry("conscious and oriented", ["conscious oriented", "C/C/C", "conscious cooperative oriented"]),
  entry("afebrile", ["febrile"], ["fever", "temperature"]),
  entry("pallor", ["pallor present", "no pallor"]),
  entry("icterus", ["icterus present", "no icterus"], ["jaundice"]),
  entry("cyanosis", ["no cyanosis"]),
  entry("clubbing", ["no clubbing"]),
  entry("lymphadenopathy", ["no lymphadenopathy", "significant lymphadenopathy"]),
  entry("pedal edema", ["pedal oedema", "pedal edema present", "no pedal edema"]),
  entry("hemodynamically stable", ["haemodynamically stable", "vitally stable"]),
  entry("maintaining saturation", ["maintaining saturation on room air", "maintaining sats"]),
  entry("room air", ["on room air"]),
  entry("oxygen support", ["on oxygen support", "on oxygen"]),

  // --- Counselling, consent, blood, clearances --------------------------------------
  entry("patient attendant", ["patient party", "attender", "attendants", "relatives"]),
  entry("patient counselled", ["attendants counselled", "relative counselled", "counselling done"]),
  entry("prognosis explained", ["guarded prognosis explained", "poor prognosis explained"]),
  entry("guarded prognosis", ["poor prognosis"]),
  entry("high risk consent", ["high-risk consent", "HR consent"], ["consent"], ["pre-op"]),
  entry("written informed consent", ["consent taken", "consent obtained", "informed consent"], ["consent"]),
  entry("blood arranged", ["blood reserved", "blood cross matched", "blood requisition sent"]),
  entry("crossmatch", ["cross match", "crossmatched blood", "grouping and crossmatch"]),
  entry("PAC", ["pre-anaesthetic check-up", "pre anaesthetic checkup", "pre-anaesthetic clearance", "PAC done", "PAC fitness"], ["pac", "anaesthesia"], ["pre-op"]),
  entry("anaesthesia clearance", ["anesthesia clearance", "pre-anaesthetic clearance"], ["clearance"], ["pre-op"]),
  entry("medicine clearance", ["physician clearance", "medical clearance"], ["clearance"], ["pre-op"]),
  entry("cardiology clearance", ["cardiac clearance"], ["clearance"], ["pre-op"]),
  entry("surgical fitness", ["fitness obtained", "fit for surgery", "fit for anaesthesia"], ["fitness"], ["pre-op"]),
  entry("taken up for surgery", ["planned for surgery", "posted for surgery", "shifted to OT"], ["surgery", "operation"]),

  // --- Ward locations -------------------------------------------------------------
  entry("shifted to ward", ["shifted to the ward", "shifted back to ward"]),
  entry("shifted to ICU", ["shifted to SICU", "shifted to HDU", "shifted to intensive care"]),
  entry("casualty", ["emergency department", "casualty admission"]),
  entry("OPD", ["outpatient department", "OPD basis"]),
  entry("IPD", ["inpatient department", "inpatient basis"]),
  entry("SICU", ["surgical ICU", "surgical intensive care unit"]),
  entry("HDU", ["high dependency unit"]),
  entry("minor OT", ["minor operation theatre", "minor procedure room"]),
  entry("CSSD", ["central sterile supply department"]),
  entry("junior resident", ["JR", "junior resident on call"]),
  entry("senior resident", ["SR", "senior resident on call"]),

  // --- B. Daily surgical ward-round terms -----------------------------------------
  round("pre-op", ["preoperative", "pre operative"]),
  round("post-op", ["postoperative", "post operative"]),
  round("pain controlled", ["pain decreased", "pain increased", "pain well controlled"]),
  round("not passing flatus", ["flatus not passed"]),
  round("bowels not opened", ["bowels not moved", "no bowel movement"]),
  round("clear liquids", ["clear liquid diet", "sips of water"]),
  round("liquid diet", ["liquids started", "on liquids"]),
  round("soft diet", ["soft solids", "semi-solid diet"]),
  round("diet as tolerated", ["normal diet", "full diet", "regular diet"]),
  round("ambulating", ["ambulation", "ambulating well", "bedside mobilisation", "mobilised"]),
  round("incentive spirometry", ["spirometry", "chest physiotherapy", "chest physio"]),
  round("dressing done", ["dressing changed", "dressing dry", "dressing soaked", "dressing intact"]),
  round("soakage", ["no soakage", "minimal soakage", "significant soakage"]),
  round("wound gaping", ["wound gape", "gaping wound"], ["wound"]),
  round("wound discharge", ["purulent discharge", "serous discharge", "serosanguinous discharge", "seropurulent discharge"], ["wound", "discharge"]),
  round("sutures removed", ["suture removal", "stitches removed", "staples removed", "stitch removal"], ["suture", "staple"]),
  round("planned for discharge", ["discharge planned", "fit for discharge", "for discharge today"], ["discharge"]),
];

function entry(
  term: string,
  aliases: string[] = [],
  triggers: string[] = [],
  noteTypes: MedicalLexiconEntry["noteTypes"] = []
): MedicalLexiconEntry {
  return {
    term,
    aliases,
    categories: ["india-ward"],
    triggers: triggers.length ? triggers : undefined,
    noteTypes: noteTypes && noteTypes.length ? noteTypes : undefined,
    priority: PRIORITY.INDIA_WARD,
  };
}

function round(term: string, aliases: string[] = [], triggers: string[] = []): MedicalLexiconEntry {
  return {
    term,
    aliases,
    categories: ["india-round"],
    triggers: triggers.length ? triggers : undefined,
    noteTypes: ["ward-round", "post-op"],
    priority: PRIORITY.INDIA_WARD,
  };
}
