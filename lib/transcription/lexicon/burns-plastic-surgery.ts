import type { MedicalLexiconEntry } from "./types";
import { PRIORITY } from "./types";

/**
 * The burns and plastic surgery keyterm core.
 *
 * WHY THESE WORDS. A burns round is dictated in depth, area and what is covering the wound:
 * "superficial partial thickness", "deep dermal", "escharotomy done", "collagen sheet applied",
 * "split thickness skin graft from the right thigh, 80 percent take". Alongside it sits the
 * reconstructive vocabulary the same unit uses on a different round — flaps, their names and
 * their monitoring — and the north-Indian casemix: kitchen flame burns, kerosene and cylinder
 * injuries, high-tension electrical burns, chemical splashes and post-burn contractures
 * presenting months later.
 *
 * Everything here is tagged `burns_plastic_surgery`. Terms shared with general surgery (the
 * dressings, the drains, the antibiotic brands) are not repeated.
 *
 * WHAT IS DELIBERATELY NOT IN THIS FILE: fluid-formula vocabulary. "Parkland", "4 ml per kg
 * per percent", "Brooke" and the rest are absent on purpose. This app does not calculate a
 * resuscitation and must never look as though it is about to; a fluid volume a resident
 * dictates is recorded as an ordinary fluid observation in the words they used.
 *
 * Auto-derived triggers below five characters are dropped by `entry()`;
 * `__tests__/burns-plastic-surgery-collisions.test.ts` pins that nothing left fires inside an
 * unrelated word.
 */

const BURNS = "burns_plastic_surgery" as const;

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
    specialties: [BURNS],
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
const device = (t: string, a: string[] = [], tr: string[] = []) =>
  entry(t, ["device"], a, tr, PRIORITY.RELATED);
const test = (t: string, a: string[] = [], tr: string[] = []) =>
  entry(t, ["investigation"], a, tr, PRIORITY.SCORING_OR_INVESTIGATION);
const drug = (t: string, a: string[] = [], tr: string[] = []) =>
  entry(t, ["medication"], a, tr, PRIORITY.RELATED);

export const BURNS_PLASTIC_SURGERY: MedicalLexiconEntry[] = [
  // --- The burn itself -------------------------------------------------------------------
  dx("flame burn", ["scald injury", "contact burn", "friction burn", "chemical burn", "electrical burn", "high tension electrical injury", "low voltage injury", "cylinder blast injury", "kerosene stove burn"], ["burnt"]),
  dx("depth of burn", ["superficial burn", "superficial partial thickness", "deep partial thickness", "deep dermal burn", "full thickness burn", "mixed depth burn", "indeterminate depth"], ["burn wound"]),
  dx("total body surface area involved", ["percentage burns", "rule of nines", "Lund and Browder chart", "palmar method", "estimated involvement"], ["burn wound"]),
  dx("inhalational injury", ["singed nasal hair", "soot in sputum", "carbonaceous sputum", "hoarse voice after burn", "closed space burn", "carbon monoxide exposure"], ["airway"]),
  dx("circumferential burn", ["circumferential limb burn", "circumferential chest burn", "constricting eschar", "compartment pressure rising"], ["tight limb"]),
  dx("post-burn contracture", ["flexion contracture", "neck contracture", "axillary contracture", "hypertrophic scar", "keloid formation", "post-burn deformity"], ["old burn"]),
  dx("burn wound infection", ["wound sepsis", "graft loss due to infection", "pseudomonas colonisation", "green discharge from wound", "slough present", "granulation tissue seen"], ["wound"]),

  // --- What is done to the wound ------------------------------------------------------------
  proc("escharotomy", ["chest escharotomy", "limb escharotomy", "fasciotomy done", "release incisions"], ["circumferential"]),
  proc("burn wound debridement", ["tangential excision", "fascial excision", "serial debridement", "wound wash given", "dressing under anaesthesia"], ["wound"]),
  proc("split thickness skin graft", ["STSG harvested", "meshed graft", "sheet graft", "donor site thigh", "graft take percentage", "graft slough", "staged grafting"], ["grafting"]),
  proc("full thickness skin graft", ["composite graft", "graft inset", "tie over dressing"], ["grafting"]),
  proc("flap cover", ["local flap", "fasciocutaneous flap", "muscle flap", "free flap", "pedicled flap", "flap monitoring", "flap congestion", "flap pale", "capillary refill of flap"], ["reconstruction"]),
  proc("contracture release", ["Z-plasty", "scar release with grafting", "tissue expander placed", "serial expansion"], ["contracture"]),
  device("burn dressing", ["collagen sheet applied", "paraffin gauze", "silver dressing", "negative pressure wound therapy", "vacuum dressing", "bandage soaked", "dressing soaked through", "dressing change under sedation"], ["wound"]),

  // --- What is watched -----------------------------------------------------------------------
  test("urine output monitoring", ["hourly urine output", "urine output per hour", "catheter draining", "cola coloured urine", "pigmenturia", "myoglobinuria suspected"], ["monitoring"]),
  test("wound swab culture", ["tissue culture sent", "blood culture from burns patient", "swab sensitivity report"], ["infection"]),
  test("serial haematocrit", ["electrolytes after burn", "serum albumin low", "arterial blood gas after burn", "carboxyhaemoglobin level"], ["monitoring"]),
  drug("tetanus prophylaxis", ["tetanus toxoid given", "tetanus immunoglobulin", "immunisation status unknown"], ["injury"]),
  drug("topical antimicrobial for burns", ["silver sulphadiazine", "mupirocin ointment", "povidone iodine dressing", "topical agent changed"], ["dressing"]),
  drug("analgesia for dressing", ["analgesia before dressing", "sedation for dressing", "patient controlled analgesia", "pain during dressing"], ["dressing"]),
  drug("nutrition support after burn", ["high protein diet", "nasogastric feeding started", "calorie requirement increased", "feeds tolerated"], ["feeding after burn"]),
];
