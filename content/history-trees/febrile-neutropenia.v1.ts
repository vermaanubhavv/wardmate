import type { HistoryTree } from "@/lib/history-check/types";
import { commonHpi, HUTCHISONS, IMMUNOCOMPROMISE, MACLEODS, rce, val, yn } from "@/content/history-trees/_helpers";

/**
 * FEVER IN A PATIENT ON CHEMOTHERAPY — v1.0.0. PENDING CLINICIAN REVIEW.
 * Medical oncology ward, north India. Fever in the days after chemotherapy is treated as
 * neutropenic until the count says otherwise, because the usual signs of infection are absent
 * when there are no neutrophils to make them. The single most decision-changing number in this
 * history is the days since the last cycle. Differentials: febrile neutropenia without an
 * identified source, line-associated infection, chest, urinary, gastrointestinal or skin focus,
 * mucositis-related bacteraemia, tumour fever, drug fever, and transfusion reaction.
 */
export const febrileNeutropeniaV1: HistoryTree = {
  id: "febrile_neutropenia",
  version: "1.0.0",
  complaint: "Fever on chemotherapy",
  triggers: ["fever on chemotherapy", "febrile neutropenia", "fever after chemo", "neutropenic fever", "fever post chemo", "fever after cycle", "low counts fever", "chemo fever"],
  setting: "Medical oncology ward, north India",
  reviewStatus: "pending_clinician_review",
  reviewedBy: null,
  references: [
    rce("Does this patient have clubbing?", 2001, "11466101"),
    MACLEODS,
    HUTCHISONS,
  ],
  slots: [
    ...commonHpi("fever"),
    val("hpi", "days_since_cycle", "Days since the last cycle", "How many days is it since the last chemotherapy was given, and which cycle number was it?", ["days since", "cycle", "last chemo", "given on", "day seven", "day ten", "nadir", "week ago", "number"], { numeric: true }),
    val("hpi", "regimen", "What was given", "What regimen or drugs were given, and was any growth-factor injection given afterwards?", ["regimen", "drugs", "chemotherapy", "injection", "growth factor", "gcsf", "given after", "protocol", "cycle"]),
    val("hpi", "fever_pattern_onc", "Fever pattern", "How high has the fever been, was it measured, and does it come with chills or rigors?", ["measured", "thermometer", "degrees", "high grade", "chills", "rigors", "spikes", "continuous", "once"], { numeric: true }),
    val("hpi", "last_counts", "Last blood counts", "When were the blood counts last checked and what were they, particularly the white cells and neutrophils?", ["counts", "checked", "white cells", "neutrophils", "anc", "low", "platelets", "haemoglobin", "date", "report"]),
    yn("associated", "line_site", "Central line or port", "Is there a central line, port or peripherally inserted catheter, and is the site red, painful or discharging?", ["central line", "port", "picc", "catheter", "site", "red", "painful", "discharge", "swelling", "tunnel"]),
    yn("associated", "mouth_throat", "Mouth ulcers or sore throat", "Any mouth ulcers, sore throat, or pain on swallowing?", ["mouth ulcers", "ulcers", "sore throat", "pain on swallowing", "mucositis", "cannot eat", "white patches"]),
    yn("associated", "cough_breathless_onc", "Cough or breathlessness", "Any cough, sputum, breathlessness, or chest pain?", ["cough", "sputum", "breathlessness", "chest pain", "sore chest", "blood in sputum"]),
    yn("associated", "urinary_onc", "Urinary symptoms", "Any burning on passing urine, passing urine often, or loin pain?", ["burning", "dysuria", "frequency", "loin pain", "cloudy", "foul"]),
    yn("associated", "gi_onc", "Abdominal pain or loose stools", "Any abdominal pain, loose stools, or pain around the back passage?", ["abdominal pain", "loose stools", "diarrhoea", "back passage", "perianal", "pain on sitting", "constipation"]),
    yn("associated", "skin_onc", "Skin changes", "Any rash, boils, redness, or a break in the skin anywhere?", ["rash", "boil", "redness", "break in skin", "wound", "cellulitis", "injection site"]),
    yn("associated", "bleeding_onc", "Bleeding or bruising", "Any bleeding from the gums or nose, bruising, or black stools?", ["bleeding", "gums", "nose", "bruising", "petechiae", "black stools", "blood in urine"]),
    yn("associated", "transfusion_recent", "Recent transfusion", "Was any blood or platelet transfusion given in the past day, and did the fever start during or soon after it?", ["transfusion", "blood", "platelets", "during", "soon after", "yesterday", "reaction"], { tier: "detailed" }),
    // Red flags
    yn("red_flag", "neutropenic_window", "Fever within three weeks of chemotherapy", "Did the fever begin within three weeks of the last chemotherapy, particularly between day seven and day fourteen?", ["within three weeks", "day seven", "day ten", "day fourteen", "after chemo", "nadir", "recently given"], { teach: "Fever in the days after chemotherapy is treated as neutropenic until the count is known, because the counts fall lowest in that window." }),
    yn("red_flag", "hypotension_onc", "Giddiness, cold peripheries or low blood pressure", "Any giddiness, cold hands and feet, drowsiness, or a recorded low blood pressure?", ["giddiness", "cold", "peripheries", "drowsy", "low bp", "hypotension", "confused", "clammy", "fast pulse"], { teach: "With no neutrophils to make pus or redness, a falling blood pressure can be the first outward sign that infection has become overwhelming." }),
    yn("red_flag", "no_localising_signs", "Fever with no obvious source", "Is there fever with no cough, no burning urine, no rash, and nothing obviously wrong anywhere?", ["no source", "nothing found", "no localising", "only fever", "no other symptom"], { teach: "The absence of any focus is itself the point: neutropenic patients cannot mount the inflammation that normally shows where an infection lies." }),
    yn("red_flag", "line_signs", "Redness or pain over the line", "Is the line site red, tender, swollen or discharging, or does fever spike when the line is flushed?", ["line", "port", "red", "tender", "swollen", "discharge", "pus", "spikes when flushed", "tunnel"], { teach: "A line is both a route in and a place where organisms hide, and fever timed to flushing points straight at it." }),
    yn("red_flag", "severe_mucositis", "Unable to eat or drink because of mouth pain", "Is the mouth so sore that eating, drinking or swallowing saliva is not possible?", ["cannot eat", "cannot drink", "cannot swallow", "severe", "ulcers", "mucositis", "drooling", "pain"], { teach: "A broken mucosal lining is a common route for gut organisms into the blood, and it also stops the patient maintaining their own fluid intake." }),
    yn("red_flag", "perianal_pain", "Pain around the back passage", "Any pain, swelling or discomfort around the back passage, especially on sitting?", ["perianal", "back passage", "pain on sitting", "swelling", "tender", "discomfort", "fissure"], { teach: "A perianal focus is easily missed and is specifically looked for in neutropenia, where it can seed the blood without forming an abscess." }),
    yn("red_flag", "breathlessness_hypoxia", "Breathlessness or low oxygen", "Any breathlessness at rest, or a low oxygen level recorded?", ["breathlessness", "at rest", "low oxygen", "saturation", "spo2", "gasping", "fast breathing"], { teach: "Breathlessness with few chest findings can mark an atypical or fungal chest infection, which the usual signs do not reveal." }),
    yn("red_flag", "altered_sensorium_onc", "Confusion or drowsiness", "Any confusion, drowsiness, severe headache, or neck stiffness?", ["confusion", "drowsy", "headache", "neck stiffness", "altered", "irrelevant talk", "unresponsive"], { teach: "Confusion in a neutropenic patient raises both sepsis and infection of the brain coverings, in whom the usual signs are often absent." }),
    IMMUNOCOMPROMISE,
    yn("exposure", "prophylaxis_antibiotics", "Antibiotics or preventive medicines", "Is any antibiotic, antifungal or antiviral being taken, including preventive ones, and was any taken for this fever?", ["antibiotic", "antifungal", "antiviral", "prophylaxis", "preventive", "taken", "outside", "started"]),
    yn("exposure", "steroids_onc", "Steroids", "Are steroids part of the regimen or being taken separately?", ["steroid", "steroids", "dexamethasone", "prednisolone", "part of regimen", "taking"]),
    yn("exposure", "previous_infection_onc", "Previous infections and organisms grown", "Any previous episode of fever on chemotherapy, and was any organism grown then?", ["previous", "episode", "before", "organism", "culture", "grew", "resistant", "admitted"]),
    yn("exposure", "contacts_onc", "Contact with infection", "Is anyone at home ill, and has there been contact with tuberculosis or chickenpox?", ["contact", "family", "ill", "tuberculosis", "tb", "chickenpox", "measles", "exposed"], { tier: "detailed" }),
  ],
  differentials: [
    { id: "fn_no_source", name: "Febrile neutropenia with no identified source", pointers: ["neutropenic_window", "no_localising_signs", "days_since_cycle"], discriminators: ["neutropenic_window", "no_localising_signs", "days_since_cycle", "last_counts", "hypotension_onc", "line_signs"] },
    { id: "line_infection", name: "Line-associated infection", pointers: ["line_signs", "line_site"], discriminators: ["line_signs", "line_site", "fever_pattern_onc", "no_localising_signs", "previous_infection_onc"] },
    { id: "chest_focus", name: "Chest focus", pointers: ["cough_breathless_onc", "breathlessness_hypoxia"], discriminators: ["cough_breathless_onc", "breathlessness_hypoxia", "days_since_cycle", "prophylaxis_antibiotics", "contacts_onc"] },
    { id: "urinary_focus", name: "Urinary focus", pointers: ["urinary_onc"], discriminators: ["urinary_onc", "no_localising_signs", "fever_pattern_onc"] },
    { id: "gi_perianal_focus", name: "Gastrointestinal or perianal focus", pointers: ["gi_onc", "perianal_pain"], discriminators: ["gi_onc", "perianal_pain", "severe_mucositis", "days_since_cycle"] },
    { id: "mucositis_bacteraemia", name: "Mucositis-related bloodstream infection", pointers: ["severe_mucositis", "mouth_throat", "neutropenic_window"], discriminators: ["severe_mucositis", "mouth_throat", "neutropenic_window", "no_localising_signs", "days_since_cycle"] },
    { id: "skin_focus_onc", name: "Skin or soft-tissue focus", pointers: ["skin_onc"], discriminators: ["skin_onc", "line_signs", "no_localising_signs"] },
    { id: "tumour_fever", name: "Tumour-related fever", pointers: ["fever_pattern_onc"], discriminators: ["fever_pattern_onc", "no_localising_signs", "days_since_cycle", "prophylaxis_antibiotics", "last_counts"] },
    { id: "drug_transfusion_fever", name: "Drug or transfusion reaction", pointers: ["transfusion_recent", "prophylaxis_antibiotics"], discriminators: ["transfusion_recent", "prophylaxis_antibiotics", "fever_pattern_onc", "onset", "skin_onc"] },
  ],
  output: {
    durationSlot: "duration",
    hpiOrder: ["onset", "duration", "days_since_cycle", "regimen", "fever_pattern_onc", "last_counts", "progression", "prior_treatment", "prior_investigations"],
  },
};
