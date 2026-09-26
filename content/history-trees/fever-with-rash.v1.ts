import type { HistoryTree } from "@/lib/history-check/types";
import { commonHpi, HUTCHISONS, IMMUNOCOMPROMISE, MACLEODS, PREGNANCY, val, yn } from "@/content/history-trees/_helpers";

/**
 * FEVER WITH RASH — v1.0.0. CLINICAL CONTENT: REVIEWED (Dr Anubhav Verma).
 * Adult medicine ward, north India. The single most useful question is whether the rash blanches
 * on pressure, because a non-blanching rash with fever is a different emergency from everything
 * else on this list. Seasonal and vector context matters here: dengue, chikungunya and scrub
 * typhus dominate the post-monsoon months. Differentials: dengue, chikungunya, scrub typhus,
 * measles, enteric fever, meningococcaemia, drug reaction including severe cutaneous reactions,
 * varicella, acute HIV seroconversion, leptospirosis.
 */
export const feverWithRashV1: HistoryTree = {
  id: "fever_with_rash",
  version: "1.0.0",
  complaint: "Fever with rash",
  triggers: ["fever with rash", "rash", "skin rash", "spots on body", "red spots", "petechiae", "purpura", "eruption", "rash with fever", "daane", "blisters"],
  setting: "Adult medicine ward, north India",
  reviewStatus: "reviewed",
  reviewedBy: "Dr Anubhav Verma",
  references: [MACLEODS, HUTCHISONS],
  slots: [
    ...commonHpi("fever with rash"),
    val("hpi", "rash_first_site", "Where the rash started", "Where did the rash start, and where did it spread to?", ["started on", "face", "trunk", "chest", "abdomen", "arms", "legs", "palms", "soles", "spread", "behind the ears", "hairline"]),
    val("hpi", "rash_appearance", "Appearance of the rash", "What does the rash look like — flat red spots, raised bumps, blisters, or pinpoint dots?", ["flat", "red spots", "macular", "raised", "papules", "blisters", "vesicles", "pinpoint", "pustules", "wheals", "hives", "target"]),
    yn("hpi", "blanching", "Does the rash fade on pressure", "When a glass or finger is pressed on the rash, does it fade, or does it stay?", ["fades", "blanches", "does not fade", "stays", "non blanching", "glass test", "pressure", "remains"]),
    yn("hpi", "itching_pain", "Itching or pain in the rash", "Is the rash itchy, painful, or burning?", ["itching", "itchy", "pruritus", "painful", "burning", "tender", "not itchy", "no itching"]),
    val("hpi", "fever_pattern", "Fever pattern", "How high is the fever, and does it come down fully between spikes?", ["high grade", "low grade", "continuous", "intermittent", "comes down", "spikes", "with chills", "evening rise", "saddle back", "biphasic"]),
    yn("hpi", "rash_timing", "When the rash appeared in relation to the fever", "Did the rash appear with the fever, or only after some days of fever?", ["with the fever", "after", "days of fever", "third day", "fifth day", "as fever settled", "before the fever", "same day"]),
    yn("associated", "headache_retroorbital", "Headache / pain behind the eyes / body ache", "Any headache, pain behind the eyes, or severe body and joint aches?", ["headache", "behind the eyes", "retro orbital", "body ache", "joint pain", "back pain", "break bone", "myalgia"]),
    yn("associated", "bleeding", "Bleeding from any site", "Any bleeding from the gums or nose, black stools, or bleeding under the skin?", ["bleeding", "gums", "nose bleed", "epistaxis", "black stools", "melaena", "bruising", "under the skin", "vomiting blood"]),
    yn("associated", "mucosal_involvement", "Sores in the mouth, eyes or genitals", "Any sores or ulcers in the mouth, redness of the eyes, or sores on the genitals?", ["mouth sores", "oral ulcers", "red eyes", "conjunctivitis", "genital sores", "lips", "peeling", "crusting", "mucosa"]),
    yn("associated", "joint_swelling", "Joint pain and swelling", "Any swelling of joints, or pain severe enough to stop walking or gripping?", ["joint swelling", "swollen joints", "cannot walk", "cannot grip", "severe joint pain", "small joints", "hands", "stooped"]),
    yn("associated", "respiratory_gi", "Cough / loose stools / abdominal pain", "Any cough, loose stools, vomiting, or abdominal pain?", ["cough", "loose stools", "diarrhoea", "vomiting", "abdominal pain", "coryza", "runny nose"]),
    yn("associated", "neuro_symptoms", "Confusion / neck stiffness / seizure", "Any confusion, drowsiness, neck stiffness, or seizure?", ["confusion", "drowsy", "neck stiffness", "seizure", "fits", "altered sensorium", "irrelevant talk", "unconscious"]),
    yn("associated", "urine_output_swelling", "Reduced urine / swelling / yellow eyes", "Any reduction in urine, swelling, or yellowness of the eyes?", ["reduced urine", "less urine", "swelling", "puffiness", "yellow eyes", "jaundice", "dark urine"], { tier: "detailed" }),
    yn("associated", "eschar", "A painless black scab", "Any small painless black scab or ulcer anywhere on the body, including the armpit, groin or waist?", ["eschar", "black scab", "scab", "painless ulcer", "armpit", "groin", "waist", "bite mark", "crusted"], { tier: "detailed" }),
    // Red flags
    yn("red_flag", "non_blanching_rash", "Rash that does not fade on pressure", "Does the rash stay visible when pressed with a glass, with rapidly worsening fever?", ["does not fade", "non blanching", "stays", "purpura", "petechiae", "glass test", "spreading fast", "bruise like"], { teach: "A fever with a rash that will not blanch is treated as meningococcal sepsis until shown otherwise, because the interval to act is measured in hours." }),
    yn("red_flag", "shock_features", "Giddiness / cold extremities / reduced urine", "Any giddiness on standing, cold hands and feet, restlessness, or a marked fall in urine?", ["giddiness", "cold hands", "cold extremities", "restless", "reduced urine", "low bp", "hypotension", "clammy", "fainting"], { teach: "Cold peripheries and falling urine with a febrile rash mark the leak of fluid out of the circulation seen in severe dengue and in sepsis." }),
    yn("red_flag", "mucosal_peeling", "Skin peeling / blistering / lips crusting", "Is the skin blistering or peeling in sheets, or are the lips crusted and raw?", ["peeling", "blistering", "sheets", "lips crusted", "raw", "denuded", "sloughing", "skin comes off", "burn like"], { teach: "Blistering with peeling skin and raw lips marks a severe drug reaction, where stopping the culprit early changes survival." }),
    yn("red_flag", "new_drug", "New medicine in the past weeks", "Any new medicine started in the past six weeks, including antibiotics, antiepileptics, or painkillers?", ["new medicine", "new drug", "antibiotic", "antiepileptic", "phenytoin", "carbamazepine", "painkillers", "sulfa", "allopurinol", "started recently", "six weeks"], { teach: "Almost every severe skin reaction traces back to a drug started in the preceding weeks, and only the history can find it." }),
    yn("red_flag", "bleeding_severe", "Heavy bleeding / vomiting blood / black stools", "Any heavy bleeding, vomiting of blood, or black stools?", ["heavy bleeding", "vomiting blood", "haematemesis", "black stools", "melaena", "continuous bleeding", "clots"], { teach: "Bleeding beyond a few petechiae, with fever, marks a falling platelet count or a consumptive process." }),
    yn("red_flag", "altered_sensorium", "Drowsiness / confusion / neck stiffness", "Any drowsiness, confusion, or neck stiffness?", ["drowsy", "confusion", "neck stiffness", "altered", "unresponsive", "irrelevant talk", "seizure"], { teach: "Brain involvement with a febrile rash widens the list to meningococcaemia, scrub typhus and viral encephalitis at once." }),
    yn("red_flag", "breathlessness", "Breathlessness / chest pain", "Any breathlessness, chest pain, or inability to lie flat?", ["breathlessness", "breathless", "chest pain", "cannot lie flat", "fast breathing", "effusion"], { tier: "detailed", teach: "Breathlessness with a febrile illness can mark fluid collecting in the chest or the lungs being involved directly." }),
    IMMUNOCOMPROMISE,
    PREGNANCY,
    yn("exposure", "mosquito_season_outbreak", "Mosquito exposure / similar cases nearby", "Any mosquito exposure, water stagnation, or similar fevers in the family or neighbourhood?", ["mosquito", "stagnant water", "cooler", "neighbourhood", "family", "outbreak", "similar cases", "dengue", "chikungunya", "monsoon"]),
    yn("exposure", "rural_field_exposure", "Field, grass or animal exposure", "Any work in fields or grass, contact with rodents, or wading through flood water?", ["field", "grass", "scrub", "rodents", "rats", "flood water", "wading", "farming", "mites", "cattle", "paddy"]),
    yn("exposure", "travel", "Recent travel", "Any travel in the past month, and to where?", ["travel", "travelled", "visited", "village", "outstation", "past month", "returned from"]),
    yn("exposure", "contact_rash_illness", "Contact with someone with rash", "Any contact with a person who had a fever with rash, including chickenpox or measles?", ["contact", "chickenpox", "measles", "similar rash", "family member", "school", "exposed"], { tier: "detailed" }),
    yn("exposure", "immunisation", "Measles and rubella immunisation", "Was measles immunisation received in childhood?", ["immunisation", "vaccination", "measles", "mmr", "vaccinated", "not vaccinated", "schedule"], { tier: "detailed" }),
    yn("exposure", "hiv_risk", "HIV risk exposure", "Any unprotected sexual exposure, needle sharing, or transfusion in the past months?", ["unprotected", "sexual exposure", "needle", "transfusion", "hiv risk", "new partner"], { tier: "detailed" }),
  ],
  differentials: [
    { id: "dengue", name: "Dengue", pointers: ["headache_retroorbital", "bleeding", "mosquito_season_outbreak", "rash_timing"], discriminators: ["headache_retroorbital", "bleeding", "mosquito_season_outbreak", "rash_timing", "shock_features", "fever_pattern", "blanching"] },
    { id: "chikungunya", name: "Chikungunya", pointers: ["joint_swelling", "mosquito_season_outbreak", "headache_retroorbital"], discriminators: ["joint_swelling", "mosquito_season_outbreak", "rash_timing", "fever_pattern", "bleeding"] },
    { id: "scrub_typhus", name: "Scrub typhus", pointers: ["eschar", "rural_field_exposure", "fever_pattern"], discriminators: ["eschar", "rural_field_exposure", "breathlessness", "altered_sensorium", "urine_output_swelling", "fever_pattern"] },
    { id: "measles", name: "Measles", pointers: ["rash_first_site", "respiratory_gi", "immunisation", "contact_rash_illness"], discriminators: ["rash_first_site", "respiratory_gi", "immunisation", "contact_rash_illness", "mucosal_involvement", "rash_timing"] },
    { id: "enteric_fever", name: "Enteric fever", pointers: ["fever_pattern", "respiratory_gi", "rash_appearance"], discriminators: ["fever_pattern", "respiratory_gi", "rash_appearance", "rash_first_site", "duration"] },
    { id: "meningococcaemia", name: "Meningococcaemia", pointers: ["non_blanching_rash", "shock_features", "altered_sensorium"], discriminators: ["non_blanching_rash", "shock_features", "altered_sensorium", "onset_mode", "neuro_symptoms"] },
    { id: "drug_reaction", name: "Drug reaction including severe cutaneous reactions", pointers: ["new_drug", "mucosal_peeling", "mucosal_involvement", "itching_pain"], discriminators: ["new_drug", "mucosal_peeling", "mucosal_involvement", "itching_pain", "rash_appearance", "rash_timing"] },
    { id: "varicella", name: "Varicella", pointers: ["rash_appearance", "contact_rash_illness", "itching_pain"], discriminators: ["rash_appearance", "contact_rash_illness", "itching_pain", "rash_first_site", "immunocompromise"] },
    { id: "acute_hiv", name: "Acute HIV seroconversion", pointers: ["hiv_risk", "mucosal_involvement"], discriminators: ["hiv_risk", "mucosal_involvement", "rash_appearance", "duration", "respiratory_gi"] },
    { id: "leptospirosis", name: "Leptospirosis", pointers: ["rural_field_exposure", "urine_output_swelling", "bleeding"], discriminators: ["rural_field_exposure", "urine_output_swelling", "bleeding", "headache_retroorbital", "breathlessness"] },
  ],
  output: {
    durationSlot: "duration",
    hpiOrder: ["onset", "duration", "onset_mode", "fever_pattern", "rash_timing", "rash_first_site", "rash_appearance", "blanching", "itching_pain", "progression", "prior_treatment", "prior_investigations"],
  },
};
