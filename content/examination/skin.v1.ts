import type { ExamChecklist, ExamItem } from "@/lib/history-check/exam-types";
import { HUTCHISONS, IADVL, MACLEODS, NLEP } from "@/content/history-trees/_helpers";

/**
 * DERMATOLOGICAL EXAMINATION — v1.0.0. CLINICAL CONTENT: PENDING CLINICIAN REVIEW.
 *
 * Look at all of the skin, in daylight, before touching any of it; describe the primary lesion
 * before the secondary change; then the pattern, the special signs, the mucosae, the appendages
 * and, because leprosy is still found in every north Indian skin OPD, the nerves and sensation
 * over every hypopigmented or anaesthetic-looking patch.
 *
 * Each item says how to elicit the sign and what it is associated with. Nothing names a
 * treatment, and nothing tells the reader what the patient has.
 */
const item = (
  id: string,
  label: string,
  how: string,
  significance: string,
  extra: Partial<Pick<ExamItem, "normal" | "tier">> = {}
): ExamItem => ({ id, label, how, significance, ...extra });

const d = { tier: "detailed" as const };

export const skinV1: ExamChecklist = {
  id: "skin",
  version: "1.0.0",
  title: "Dermatological examination",
  setting: "Dermatology ward and OPD, north India",
  reviewStatus: "pending_clinician_review",
  reviewedBy: null,
  references: [IADVL, NLEP, MACLEODS, HUTCHISONS],
  sections: [
    {
      id: "survey",
      title: "General survey",
      intro: "Undress the patient fully with a chaperone, in natural daylight where possible. Survey the whole skin before focusing on the lesion the patient points to.",
      items: [
        item("whole_skin", "Whole-skin survey in good light", "Examine scalp, face, ears, trunk front and back, limbs, palms, soles, web spaces, flexures, genitals and buttocks in good light, using a hand lens where needed.", "Lesions unnoticed by the patient, especially on the back, scalp, soles and genitals, often change the pattern and so the interpretation; examining only the presenting patch is the commonest cause of a missed finding.", { normal: "Whole skin examined, findings limited to the areas described." }),
        item("general_state", "General condition and vital signs", "Record temperature, pulse, blood pressure and hydration, and look for pallor, lymph node enlargement and oedema.", "Fever, tachycardia and dehydration with widespread skin disease are associated with erythroderma, severe drug reactions and blistering disease, where the skin has failed as an organ.", { normal: "Afebrile, haemodynamically stable." }),
        item("bsa", "Extent — percentage of body surface area", "Estimate the area involved using the patient's palm with fingers as about one percent, or the rule of nines for extensive disease; record erythema and detached skin separately.", "The extent involved, and especially the area of detached or detachable skin, is associated with severity and outcome in blistering and drug-related eruptions, and over ninety percent erythema defines erythroderma.", d),
      ],
    },
    {
      id: "morphology",
      title: "Morphology of the lesion",
      intro: "Describe the primary lesion first — type, size, shape, colour, margin, surface and consistency — then what has happened to it.",
      items: [
        item("macule_patch", "Macule or patch", "Look and feel: a flat change in colour, not raised, not palpable. Record size (macule small, patch larger), colour and margin, and compare the colour with surrounding skin.", "Hypopigmented patches are associated with leprosy, pityriasis versicolor and pityriasis alba; depigmented chalk-white macules with vitiligo; purpuric macules that do not blanch with bleeding and vasculitis.", { normal: "No macules." }),
        item("papule_plaque", "Papule, plaque and nodule", "Run a fingertip across the lesion to feel elevation and depth. A papule is small and raised, a plaque is a raised area broader than its thickness, and a nodule is larger and deeper, felt in the dermis or below.", "Scaly plaques are associated with psoriasis and dermatophyte infection; violaceous flat-topped papules with lichen planus; skin-coloured or erythematous nodules with leprosy, erythema nodosum and cutaneous tuberculosis.", { normal: "No papules, plaques or nodules." }),
        item("vesicle_bulla", "Vesicle and bulla", "Note blister size, whether the roof is tense or flaccid, the fluid (clear, turbid, haemorrhagic), and where on the body it lies.", "Grouped vesicles on a red base are associated with herpes infection; tense bullae with subepidermal blistering including bullous pemphigoid; flaccid, easily broken bullae with intraepidermal blistering including pemphigus.", { normal: "No vesicles or bullae." }),
        item("pustule", "Pustule", "Look for visible pus in a raised lesion and note whether it arises from a hair follicle.", "Follicular pustules are associated with folliculitis and acne; sheets of non-follicular sterile pustules on red skin with pustular psoriasis and acute generalised pustular drug eruption.", d),
        item("secondary_changes", "Secondary changes", "Record scale (fine, silvery, greasy), crust, erosion, ulcer, excoriation, lichenification, fissuring, atrophy and scarring, and the edge of any ulcer.", "Excoriation and lichenification are associated with chronic itch; honey-coloured crusts with impetigo; silvery scale with psoriasis; a scaly advancing edge with central clearing with dermatophyte infection.", d),
        item("colour_texture_temp", "Colour, blanching and temperature", "Press a glass slide on a red lesion to see if it blanches, and feel the lesion and surroundings with the back of the hand.", "Non-blanching lesions are associated with purpura; an apple-jelly colour on diascopy with lupus vulgaris and granulomatous disease; warmth with spreading erythema from cellulitis.", d),
      ],
    },
    {
      id: "pattern",
      title: "Distribution and configuration",
      items: [
        item("distribution", "Distribution", "Map where the lesions are: symmetrical or not, flexural or extensor, photo-exposed areas, acral, truncal, along a dermatome, or at sites of contact.", "Extensor symmetrical plaques are associated with psoriasis; flexural lesions with atopic dermatitis and intertrigo; photo-exposed distribution with photosensitivity and pellagra; a single dermatome with herpes zoster; the web spaces, wrists and genitals with scabies.", { normal: "Distribution recorded on a body map." }),
        item("configuration", "Configuration", "Describe how lesions relate to one another: annular, arcuate, linear, grouped, target, reticulate, serpiginous.", "Annular lesions are associated with dermatophyte infection and leprosy; target lesions with erythema multiforme; linear lesions with contact, scratching and the Koebner phenomenon; grouped lesions with herpes.", d),
      ],
    },
    {
      id: "special_signs",
      title: "Special signs",
      items: [
        item("nikolsky", "Nikolsky sign", "Apply firm sliding pressure with a finger on apparently normal skin next to a blister, and on the blister margin, and see whether the upper layer shears off.", "A positive sign is associated with loss of cohesion within the epidermis, as in pemphigus, and with toxic epidermal necrolysis and staphylococcal scalded skin, and is usually negative in subepidermal blistering.", { normal: "Nikolsky sign negative." }),
        item("bulla_spread", "Bulla spread sign", "Press gently on the top of an intact bulla and watch whether the fluid spreads into the surrounding apparently normal skin.", "Spread of the bulla into adjacent skin is associated with fragile intraepidermal blisters, as in pemphigus.", d),
        item("auspitz", "Auspitz sign and grattage", "Scrape a scaly plaque gently with a glass slide edge: silvery scale comes off, then a thin membrane, then pinpoint bleeding points appear.", "Silvery scale on grattage followed by pinpoint bleeding is associated with psoriasis.", d),
        item("koebner", "Koebner phenomenon", "Look for lesions arranged along lines of scratches, scars or other trauma.", "Lesions in lines of trauma are associated with psoriasis, lichen planus, vitiligo and viral warts; the finding narrows the list rather than settling it.", d),
        item("dermographism", "Dermographism", "Stroke the skin of the back firmly with a blunt object and watch for a raised weal along the line over a few minutes.", "A raised weal along the stroke is associated with physical urticaria.", d),
      ],
    },
    {
      id: "mucosa_appendages",
      title: "Mucosae, hair and nails",
      items: [
        item("oral_mucosa", "Oral mucosa", "Inspect lips, buccal mucosa, gums, palate and tongue for erosions, white lacy streaks, blisters and ulcers.", "Oral erosions are associated with pemphigus, where they often come first, and with Stevens-Johnson syndrome; white lacy streaks with lichen planus.", { normal: "Oral mucosa normal." }),
        item("eye_mucosa", "Conjunctivae", "Inspect the conjunctivae for redness, discharge, erosions and adhesions between lid and globe.", "Conjunctival involvement is associated with Stevens-Johnson syndrome and mucous membrane pemphigoid and needs early ophthalmology input because scarring threatens sight.", { normal: "Conjunctivae normal." }),
        item("genital_mucosa", "Genital and perianal mucosa", "With a chaperone, inspect the genital and perianal skin and mucosa for erosions, ulcers, papules and discharge.", "Genital erosions are associated with severe drug reactions and blistering disease; an ulcer or papules with sexually transmitted infection, which changes both the history and the workup.", { normal: "Genital mucosa normal." }),
        item("hair", "Hair and scalp", "Inspect the scalp and hair for pattern of loss, scaling, broken hairs, exclamation-mark hairs and scarring; do a gentle pull test.", "Patchy non-scarring loss with exclamation-mark hairs is associated with alopecia areata; scaly patches with broken hairs with tinea capitis; scarring loss with lupus and lichen planopilaris.", { normal: "Hair and scalp normal." }),
        item("nails", "Nails", "Inspect finger and toe nails for pitting, onycholysis, subungual thickening, discoloration, ridging, and the nail folds for swelling.", "Pitting and onycholysis are associated with psoriasis; thick yellow crumbly nails with fungal infection; swollen nail folds with paronychia; longitudinal ridging and thinning with lichen planus.", { normal: "Nails normal." }),
      ],
    },
    {
      id: "nerves_nodes",
      title: "Nerves, sensation and lymph nodes",
      intro: "Every hypopigmented or erythematous patch in this setting is tested for sensation, and the peripheral nerves are felt.",
      items: [
        item("patch_sensation", "Sensation over patches", "With the patient's eyes closed, test touch with a wisp of cotton, pain with a pin and temperature with warm and cold tubes over the centre of the patch, comparing with normal skin nearby. Test sweating and hair over the patch.", "Loss of sensation, sweating and hair over a hypopigmented or erythematous patch is associated with leprosy and is one of the cardinal signs used for case detection.", { normal: "Sensation intact over all patches." }),
        item("nerve_thickening", "Peripheral nerve thickening", "Palpate both sides with the pulp of the fingers: great auricular in the neck on turning the head, ulnar behind the medial epicondyle, radial cutaneous at the wrist, common peroneal at the fibular neck, posterior tibial behind the medial malleolus, and any cutaneous nerve near a patch. Note thickening, beading and tenderness.", "Thickened or tender peripheral nerves are associated with leprosy, and tenderness with nerve inflammation that threatens function; thickening is also seen in some hereditary neuropathies.", { normal: "No peripheral nerve thickening." }),
        item("nerve_function", "Sensory and motor function in nerve territories", "Test sensation on the palms and soles, and the small muscles of the hand, grip, wrist and foot dorsiflexion, looking for claw hand, foot drop and lagophthalmos.", "Loss of protective sensation and weakness in a nerve territory are associated with leprous neuropathy and predict ulcers and deformity; the baseline disability grade is recorded for follow-up.", d),
        item("lymph_nodes_skin", "Regional lymph nodes", "Palpate the nodes draining the involved skin, and the generalised groups where the eruption is widespread.", "Enlarged draining nodes are associated with secondary infection, cutaneous tuberculosis and skin malignancy; generalised enlargement with widespread disease, drug reactions with systemic involvement, and lymphoma.", { normal: "No significant lymphadenopathy." }),
      ],
    },
  ],
};
