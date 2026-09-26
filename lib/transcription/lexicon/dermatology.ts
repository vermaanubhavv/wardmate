import type { MedicalLexiconEntry } from "./types";
import { PRIORITY } from "./types";

/**
 * The dermatology keyterm core.
 *
 * WHY THESE WORDS. A skin round is dictated in morphology — the shape, the surface, the edge
 * and the distribution of a lesion — and none of that vocabulary is ordinary English:
 * "annular scaly plaque with central clearing", "flaccid bullae with Nikolsky positive",
 * "hypopigmented anaesthetic patch". Alongside it sits the north-Indian casemix this
 * department actually carries: recalcitrant dermatophytosis, leprosy under the national
 * programme, severe drug reactions, and the sexually transmitted infections seen in the same
 * outpatient clinic.
 *
 * Everything here is tagged `dermatology`. Terms shared with medicine (the fever workup, HIV,
 * diabetes) are not repeated; the shared categories reach them.
 *
 * WHAT IS DELIBERATELY NOT IN THIS FILE: severity-index vocabulary (PASI, SCORTEN, BSA
 * percentages) beyond what a resident dictates as plain words. WardMate has built no
 * dermatological score, and a lexicon that makes an index easy to say is a step towards an app
 * that computes one it never reviewed.
 *
 * Auto-derived triggers below five characters are dropped by `entry()`;
 * `__tests__/dermatology-collisions.test.ts` pins that nothing left fires inside an unrelated
 * word.
 */

const DERM = "dermatology" as const;

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
    specialties: [DERM],
    triggers: [term, ...aliases, ...triggers]
      .map((t) => t.toLowerCase())
      .filter((t) => t.length >= 5),
    priority,
  };
}

const dx = (t: string, a: string[] = [], tr: string[] = []) =>
  entry(t, ["diagnosis"], a, tr, PRIORITY.EXACT_PATIENT);
const morph = (t: string, a: string[] = [], tr: string[] = []) =>
  entry(t, ["diagnosis"], a, tr, PRIORITY.SPECIALTY);
const drug = (t: string, a: string[] = [], tr: string[] = []) =>
  entry(t, ["medication"], a, tr, PRIORITY.RELATED);
const test = (t: string, a: string[] = [], tr: string[] = []) =>
  entry(t, ["investigation"], a, tr, PRIORITY.SCORING_OR_INVESTIGATION);
const proc = (t: string, a: string[] = [], tr: string[] = []) =>
  entry(t, ["procedure"], a, tr, PRIORITY.RELATED);

export const DERMATOLOGY: MedicalLexiconEntry[] = [
  // --- The morphology the round is dictated in --------------------------------------------
  morph("annular plaque", ["scaly plaque", "central clearing", "active border", "raised margin", "well defined plaque", "ill defined patch"], ["lesion"]),
  morph("macule and papule", ["erythematous papules", "follicular papules", "nodules present", "vesicles and bullae", "flaccid bullae", "tense bullae", "pustules seen"], ["lesion"]),
  morph("Nikolsky sign positive", ["bulla spread sign", "Asboe-Hansen sign", "Auspitz sign", "candle grease sign", "Koebner phenomenon"], ["blistering"]),
  morph("hypopigmented patch", ["depigmented macule", "hyperpigmented patch", "post-inflammatory hyperpigmentation", "anaesthetic patch", "loss of sensation over patch"], ["patch"]),
  morph("distribution of lesions", ["flexural distribution", "extensor surfaces", "photo-exposed areas", "acral distribution", "intertriginous areas", "symmetrical distribution", "web spaces involved"], ["lesion"]),
  morph("mucosal involvement", ["oral erosions", "genital erosions", "conjunctival congestion", "lip crusting", "haemorrhagic crusting"], ["erosions"]),

  // --- The casemix -------------------------------------------------------------------------
  dx("dermatophytosis", ["tinea corporis", "tinea cruris", "tinea faciei", "recalcitrant dermatophytosis", "steroid modified tinea"], ["itching"]),
  dx("scabies", ["burrows seen", "nocturnal itch", "family members affected", "crusted scabies", "Norwegian scabies"], ["itching"]),
  dx("eczema", ["atopic dermatitis", "contact dermatitis", "allergic contact dermatitis", "irritant contact dermatitis", "seborrhoeic dermatitis", "lichen simplex chronicus"], ["itching"]),
  dx("psoriasis vulgaris", ["chronic plaque psoriasis", "guttate psoriasis", "palmoplantar psoriasis", "psoriatic arthritis", "nail pitting", "scalp psoriasis"], ["scaly"]),
  dx("urticaria", ["acute urticaria", "chronic spontaneous urticaria", "angioedema present", "dermographism"], ["wheals"]),
  dx("leprosy", ["Hansen disease", "borderline tuberculoid", "lepromatous leprosy", "type 1 lepra reaction", "type 2 lepra reaction", "erythema nodosum leprosum", "nerve thickening", "claw hand deformity"], ["anaesthetic patch"]),
  dx("pemphigus vulgaris", ["pemphigus foliaceus", "bullous pemphigoid", "dermatitis herpetiformis"], ["blistering"]),
  dx("severe cutaneous adverse reaction", ["Stevens-Johnson syndrome", "toxic epidermal necrolysis", "drug reaction with eosinophilia and systemic symptoms", "acute generalised exanthematous pustulosis", "fixed drug eruption", "maculopapular drug rash"], ["new medicine"]),
  dx("vitiligo", ["segmental vitiligo", "non-segmental vitiligo", "repigmentation seen", "stable disease"], ["white patch"]),
  dx("acne vulgaris", ["comedones present", "nodulocystic acne", "acne scarring", "rosacea", "melasma", "post-acne pigmentation"], ["face"]),
  dx("alopecia areata", ["androgenetic alopecia", "telogen effluvium", "scarring alopecia", "exclamation mark hairs"], ["hair loss"]),
  dx("cutaneous sexually transmitted infection", ["genital ulcer disease", "herpes genitalis", "primary chancre", "secondary syphilis", "condylomata acuminata", "molluscum contagiosum"], ["genital lesion"]),
  dx("cellulitis and pyoderma", ["impetigo", "folliculitis", "furunculosis", "ecthyma", "necrotising fasciitis suspected"], ["painful red"]),
  dx("cutaneous tuberculosis", ["lupus vulgaris", "scrofuloderma", "tuberculosis verrucosa cutis"], ["chronic lesion"]),

  // --- Bedside tests and procedures ------------------------------------------------------------
  test("potassium hydroxide mount", ["KOH mount", "fungal hyphae seen", "Tzanck smear", "slit skin smear", "bacillary index", "Gram stain from lesion"], ["bedside test"]),
  test("skin biopsy", ["punch biopsy", "incisional biopsy", "direct immunofluorescence", "histopathology awaited"], ["biopsy"]),
  test("patch testing", ["Indian standard series", "prick test", "photopatch test"], ["contact"]),
  test("dermoscopy", ["dermatoscopic examination", "Wood lamp examination"], ["examination"]),
  proc("intralesional injection", ["cryotherapy session", "chemical peel", "phototherapy session", "narrow band UVB", "PUVA therapy", "excimer lamp"], ["procedure"]),

  // --- Drugs said by name on this round -----------------------------------------------------------
  drug("topical corticosteroid", ["potent topical steroid", "steroid cream misuse", "over the counter cream", "combination cream", "topical calcineurin inhibitor", "emollient advised"], ["applied"]),
  drug("systemic antifungal", ["itraconazole", "terbinafine", "griseofulvin", "fluconazole pulse"], ["fungal"]),
  drug("multidrug therapy for leprosy", ["MDT blister pack", "rifampicin monthly", "clofazimine daily", "dapsone daily", "paucibacillary regimen", "multibacillary regimen"], ["leprosy"]),
  drug("systemic immunosuppressant", ["methotrexate weekly", "azathioprine", "cyclosporine", "mycophenolate mofetil", "systemic steroid started", "biologic therapy"], ["immunosuppression"]),
  drug("permethrin application", ["benzyl benzoate", "ivermectin given", "whole family treated", "scabicide applied"], ["scabies"]),
];
