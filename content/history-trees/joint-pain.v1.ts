import type { HistoryTree } from "@/lib/history-check/types";
import { commonHpi, IMMUNOCOMPROMISE, MACLEODS, PREGNANCY, rce, val, yn } from "@/content/history-trees/_helpers";

/**
 * JOINT PAIN / POLYARTHRITIS — v1.0.0. CLINICAL CONTENT: PENDING CLINICIAN REVIEW.
 * Differentials: rheumatoid arthritis, osteoarthritis, gout, septic arthritis, reactive
 * arthritis, viral arthritis (chikungunya, dengue, hepatitis B), lupus and other connective
 * tissue disease, spondyloarthritis, rheumatic fever, tuberculous arthritis.
 */
export const jointPainV1: HistoryTree = {
  id: "joint_pain",
  version: "1.0.0",
  complaint: "Joint pain",
  triggers: ["joint pain", "joint pains", "polyarthritis", "arthritis", "arthralgia", "pain in joints", "swelling of joints", "joint swelling", "knee pain", "multiple joint", "body pains with joint"],
  setting: "Adult medicine ward, north India",
  reviewStatus: "pending_clinician_review",
  reviewedBy: null,
  references: [
    rce("Does this adult patient have septic arthritis?", 2007, "17405973"),
    { title: "2010 ACR/EULAR classification criteria for rheumatoid arthritis", source: "Arthritis Rheum", year: 2010, pmid: "20872595" },
    { title: "2015 ACR/EULAR gout classification criteria", source: "Arthritis Rheumatol", year: 2015, pmid: "26352873" },
    { title: "Chikungunya: clinical features and management (NCVBDC guidelines)", source: "NCVBDC / NVBDCP", year: 2016 },
    MACLEODS,
  ],
  slots: [
    ...commonHpi("joint pain"),
    val("hpi", "joints_involved", "Joints involved", "Which joints — small joints of the hands and feet, large joints, or the spine — and how many?", ["hands", "fingers", "wrists", "feet", "toes", "knees", "ankles", "elbows", "shoulders", "hips", "spine", "back", "neck", "small joints", "large joints", "one joint", "many joints", "joints"]),
    val("hpi", "pattern_spread", "Pattern of spread", "Is it one joint, a few, or many — symmetrical on both sides, or moving from joint to joint?", ["one joint", "monoarticular", "few", "many", "polyarticular", "symmetrical", "both sides", "same joints", "migratory", "moving", "additive", "spread"]),
    val("hpi", "morning_stiffness", "Morning stiffness", "Is there stiffness on waking, and for how long?", ["morning stiffness", "stiff", "stiffness", "on waking", "minutes", "hours", "loosens", "gelling"], { numeric: true }),
    val("hpi", "inflammatory_mechanical", "Worse with rest or with use", "Is the pain worse after rest and better with movement, or worse with use and better with rest?", ["after rest", "better with movement", "worse with use", "with activity", "end of the day", "better with rest", "worse in the morning", "mechanical", "inflammatory"]),
    yn("hpi", "swelling_warmth", "Swelling / warmth / redness", "Is there visible swelling, warmth or redness of the joint?", ["swelling", "swollen", "warm", "warmth", "hot", "red", "redness", "effusion"]),
    val("hpi", "onset_pace", "Pace of onset", "Did the pain reach its worst within hours, over days, or over weeks?", ["hours", "overnight", "days", "weeks", "months", "peak", "worst", "acute", "gradual"]),
    yn("hpi", "function", "Function", "What can the patient no longer do — walk, climb stairs, hold a glass, button clothes, squat?", ["walk", "climb", "stairs", "hold", "grip", "button", "squat", "sit on the floor", "cannot", "difficulty", "function", "activities"]),
    yn("hpi", "previous_attacks", "Previous attacks", "Has this happened before, which joints, and how did it settle?", ["previous", "before", "earlier", "attacks", "recurrent", "episodes", "settled", "first time"], { tier: "detailed" }),
    // Associated
    yn("associated", "fever", "Fever", "Any fever, and did it come before or with the joint pain?", ["fever", "febrile", "temperature", "chills", "rigors"]),
    yn("associated", "rash", "Rash / photosensitivity", "Any rash — on the face, sun-exposed skin, palms, trunk — or sensitivity to sunlight?", ["rash", "butterfly", "malar", "photosensitivity", "sun", "psoriasis", "scaly", "nodules", "erythema"]),
    yn("associated", "oral_ulcers_hair_loss", "Oral ulcers / hair loss", "Any mouth ulcers or hair loss?", ["mouth ulcers", "oral ulcers", "ulcers", "hair loss", "hair fall", "alopecia"], { tier: "detailed" }),
    yn("associated", "eye_symptoms", "Red or painful eye", "Any red, painful eye or dry eyes and dry mouth?", ["red eye", "eye pain", "uveitis", "dry eyes", "dry mouth", "gritty"], { tier: "detailed" }),
    yn("associated", "raynauds", "Colour change of fingers in cold", "Is there whitening or bluing of the fingers in the cold?", ["raynaud", "white fingers", "blue fingers", "cold", "colour change"], { tier: "detailed" }),
    yn("associated", "back_pain_night", "Back pain / heel pain", "Any low back pain that wakes the patient at night and improves with exercise, or heel pain?", ["back pain", "low back", "night", "improves with exercise", "heel pain", "buttock pain", "stiffness of back"], { tier: "detailed" }),
    yn("associated", "urethritis_diarrhoea_before", "Urethral discharge / diarrhoea / sore throat before", "Any urethral discharge, diarrhoea or sore throat in the weeks before the joint pain?", ["urethral discharge", "burning urine", "diarrhoea", "diarrhea", "sore throat", "throat infection", "weeks before", "dysentery"], { tier: "detailed" }),
    yn("associated", "weight_loss_appetite", "Weight loss / appetite", "Any weight loss or loss of appetite?", ["weight loss", "lost weight", "loss of appetite", "anorexia"], { tier: "detailed" }),
    yn("associated", "muscle_weakness", "Muscle weakness", "Any difficulty rising from a chair or combing the hair (proximal weakness)?", ["weakness", "rising from", "combing", "climbing", "proximal", "muscle pain", "myalgia"], { tier: "detailed" }),
    yn("associated", "breathlessness_chest", "Breathlessness / chest pain", "Any breathlessness or chest pain with the joint pain?", ["breathlessness", "breathless", "chest pain", "pleuritic", "pericarditis"], { tier: "detailed" }),
    // Red flags
    yn("red_flag", "single_hot_joint", "Single hot swollen joint", "Is one joint hot, swollen and too painful to move, especially with fever?", ["one joint", "single joint", "hot", "swollen", "cannot move", "unable to move", "very painful", "with fever", "monoarthritis"], { teach: "A single hot joint is septic arthritis until the fluid says otherwise; a day's delay destroys the cartilage." }),
    yn("red_flag", "fever_with_arthritis", "Fever with joint pain", "Is there fever with the joint pain?", ["fever", "febrile", "temperature", "chills"], { teach: "Fever with arthritis moves infection, viral arthritis, rheumatic fever and lupus flare to the front of the list." }),
    yn("red_flag", "neuro_symptoms", "Neurological symptoms", "Any numbness, weakness, or bladder or bowel disturbance with back or neck pain?", ["numbness", "weakness", "tingling", "bladder", "bowel", "incontinence", "retention", "cannot walk"], { teach: "Neck or back pain with neurological symptoms in an inflamed spine points to cord compression or atlanto-axial instability." }),
    yn("red_flag", "steroid_immunosuppressant_use", "Steroids / immunosuppressants", "Is the patient on steroids or immunosuppressants, or taking them from a chemist for joint pain?", ["steroid", "steroids", "prednisolone", "dexa", "wysolone", "methotrexate", "immunosuppressant", "from chemist", "joint pain tablets", "desi medicine"], { teach: "Steroid use from a chemist is common in India for joint pain; it masks infection, causes adrenal suppression and avascular necrosis, and is rarely mentioned." }),
    yn("red_flag", "prosthetic_joint_iv_drug", "Prosthetic joint / injection into joint / IV drug use", "Any artificial joint, recent injection into the joint, or intravenous drug use?", ["prosthetic", "artificial joint", "replacement", "injection into", "intra articular", "iv drug", "injecting"], { teach: "A recent joint injection or a prosthesis is the usual route of infection into a joint." }),
    yn("red_flag", "renal_cardiac_features", "Frothy urine / swelling / chest pain", "Any frothy urine, facial or leg swelling, or chest pain (lupus, rheumatic fever)?", ["frothy urine", "swelling", "oedema", "puffiness", "chest pain", "breathlessness", "palpitations"], { teach: "Kidney and heart involvement decide urgency in lupus and rheumatic fever; the joints are the least important organ." }),
    IMMUNOCOMPROMISE,
    PREGNANCY,
    // Exposures
    yn("exposure", "mosquito_outbreak", "Mosquito exposure / similar cases nearby", "Any recent fever with rash in the area, or similar joint pains in the neighbourhood (chikungunya, dengue)?", ["mosquito", "outbreak", "chikungunya", "dengue", "similar cases", "neighbourhood", "locality", "many people"]),
    yn("exposure", "diet_alcohol_diuretics", "Alcohol / diet / diuretics", "Any alcohol, meat-rich diet, or diuretic use (gout)?", ["alcohol", "beer", "meat", "red meat", "diuretic", "diuretics", "thiazide", "diet"], { tier: "detailed" }),
    yn("exposure", "family_history", "Family history", "Any family history of arthritis, psoriasis, or autoimmune disease?", ["family history", "mother", "father", "arthritis in family", "psoriasis", "autoimmune"], { tier: "detailed" }),
    yn("exposure", "tb_contact", "TB contact / past TB", "Any past tuberculosis or contact (tuberculous arthritis)?", ["tb", "tuberculosis", "koch", "att", "tb contact"], { tier: "detailed" }),
    yn("exposure", "sexual_history", "Sexual history", "Any recent new sexual contact or urethral discharge (gonococcal, reactive)?", ["sexual", "unprotected", "new partner", "discharge", "sti"], { tier: "detailed" }),
  ],
  differentials: [
    { id: "rheumatoid", name: "Rheumatoid arthritis", pointers: ["joints_involved", "pattern_spread", "morning_stiffness", "inflammatory_mechanical"], discriminators: ["joints_involved", "pattern_spread", "morning_stiffness", "inflammatory_mechanical", "swelling_warmth", "duration", "rash", "family_history"] },
    { id: "osteoarthritis", name: "Osteoarthritis", pointers: ["inflammatory_mechanical", "joints_involved"], discriminators: ["inflammatory_mechanical", "joints_involved", "morning_stiffness", "swelling_warmth", "duration", "fever"] },
    { id: "gout", name: "Gout", pointers: ["onset_pace", "single_hot_joint", "previous_attacks", "diet_alcohol_diuretics"], discriminators: ["onset_pace", "single_hot_joint", "previous_attacks", "diet_alcohol_diuretics", "joints_involved", "fever"] },
    { id: "septic", name: "Septic arthritis", pointers: ["single_hot_joint", "fever_with_arthritis", "prosthetic_joint_iv_drug", "steroid_immunosuppressant_use"], discriminators: ["single_hot_joint", "fever_with_arthritis", "prosthetic_joint_iv_drug", "steroid_immunosuppressant_use", "onset_pace", "immunocompromise", "sexual_history"] },
    { id: "reactive", name: "Reactive arthritis", pointers: ["urethritis_diarrhoea_before", "eye_symptoms", "back_pain_night"], discriminators: ["urethritis_diarrhoea_before", "eye_symptoms", "back_pain_night", "joints_involved", "sexual_history", "pattern_spread"] },
    { id: "viral", name: "Viral arthritis (chikungunya, dengue, hepatitis B)", pointers: ["fever", "mosquito_outbreak", "rash", "onset_pace"], discriminators: ["fever", "mosquito_outbreak", "rash", "onset_pace", "pattern_spread", "duration", "swelling_warmth"] },
    { id: "lupus_ctd", name: "Lupus / connective tissue disease", pointers: ["rash", "oral_ulcers_hair_loss", "raynauds", "renal_cardiac_features"], discriminators: ["rash", "oral_ulcers_hair_loss", "raynauds", "renal_cardiac_features", "fever", "breathlessness_chest", "muscle_weakness", "eye_symptoms"] },
    { id: "spondyloarthritis", name: "Spondyloarthritis (ankylosing, psoriatic)", pointers: ["back_pain_night", "rash", "eye_symptoms", "family_history"], discriminators: ["back_pain_night", "rash", "eye_symptoms", "family_history", "joints_involved", "pattern_spread"] },
    { id: "rheumatic_fever", name: "Rheumatic fever", pointers: ["pattern_spread", "urethritis_diarrhoea_before", "fever", "renal_cardiac_features"], discriminators: ["pattern_spread", "urethritis_diarrhoea_before", "fever", "renal_cardiac_features", "onset_pace", "joints_involved"] },
    { id: "tb_arthritis", name: "Tuberculous arthritis", pointers: ["tb_contact", "single_hot_joint", "weight_loss_appetite"], discriminators: ["tb_contact", "single_hot_joint", "weight_loss_appetite", "duration", "fever", "immunocompromise"] },
  ],
  output: {
    durationSlot: "duration",
    hpiOrder: ["onset", "duration", "onset_mode", "onset_pace", "joints_involved", "pattern_spread", "morning_stiffness", "inflammatory_mechanical", "swelling_warmth", "function", "previous_attacks", "progression", "prior_treatment", "prior_investigations"],
  },
};
