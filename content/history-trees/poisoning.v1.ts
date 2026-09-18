import type { HistoryTree } from "@/lib/history-check/types";
import { commonHpi, MACLEODS, PREGNANCY, val, yn } from "@/content/history-trees/_helpers";

/**
 * POISONING / SELF-HARM INGESTION — v1.0.0. CLINICAL CONTENT: PENDING CLINICIAN REVIEW.
 * The commonest toxicological admission on Indian medicine wards. Differentials by agent:
 * organophosphate / carbamate, aluminium phosphide (celphos), paraquat, rodenticide
 * (anticoagulant, zinc phosphide, yellow phosphorus), paracetamol and other tablets,
 * corrosives, kerosene / hydrocarbons, plant poisons (oleander, datura), alcohol / methanol,
 * sedatives and antidepressants.
 */
export const poisoningV1: HistoryTree = {
  id: "poisoning",
  version: "1.0.0",
  complaint: "Poisoning / ingestion",
  triggers: ["poisoning", "poison", "consumed poison", "ingestion", "ingested", "overdose", "insecticide", "organophosphate", "op poisoning", "celphos", "aluminium phosphide", "rat poison", "rodenticide", "paraquat", "kerosene", "tablets consumed", "suicidal attempt", "self harm", "dsh", "consumed tablets"],
  setting: "Adult medicine ward, north India",
  reviewStatus: "pending_clinician_review",
  reviewedBy: null,
  references: [
    { title: "Management of acute organophosphorus pesticide poisoning", source: "Lancet", year: 2008, pmid: "18280328" },
    { title: "Aluminium phosphide poisoning: a review", source: "Journal of Medical Toxicology / Indian J Crit Care Med", year: 2011 },
    { title: "Paraquat poisoning: diagnosis and management (review)", source: "Crit Care", year: 2012 },
    { title: "WHO guidelines on the management of poisoning and the role of poison information centres", source: "World Health Organization" },
    { title: "Mental Healthcare Act 2017, Section 115 (presumption of severe stress in attempted suicide)", source: "Government of India", year: 2017 },
    MACLEODS,
  ],
  slots: [
    ...commonHpi("ingestion"),
    val("hpi", "agent", "What was taken", "What exactly was taken — the name on the container, its colour and smell, or the kind of shop it came from?", ["name", "container", "bottle", "packet", "sachet", "brand", "colour", "smell", "garlic", "kerosene", "insecticide", "pesticide", "spray", "celphos", "sulfas", "rat poison", "tablets", "acid", "phenyl", "agent", "took", "consumed", "drank"]),
    val("hpi", "amount", "Amount", "How much was taken — number of tablets, or millilitres or mouthfuls of liquid, from how full a container?", ["tablets", "number", "strips", "mouthful", "mouthfuls", "sips", "half bottle", "full bottle", "gulp", "amount", "quantity", "how much", "grams", "sachets"], { numeric: true }),
    val("hpi", "time_of_ingestion", "Time of ingestion", "At what time was it taken, and how long before arrival?", ["at", "am", "pm", "o'clock", "hours ago", "hours before", "last night", "this morning", "yesterday", "time", "minutes ago"], { numeric: true }),
    val("hpi", "route", "Route", "Was it swallowed, inhaled, injected, or spilled on the skin?", ["swallowed", "drank", "ate", "inhaled", "inhalation", "injected", "injection", "skin", "spilled", "contact", "route"]),
    val("hpi", "intent", "Intent and circumstances", "Was it intentional or accidental, and what happened just before — a quarrel, exam result, debt, illness?", ["intentional", "suicidal", "suicide", "self harm", "accidental", "accident", "by mistake", "quarrel", "fight", "argument", "exam", "debt", "loan", "scolded", "intent", "reason"]),
    val("hpi", "co_ingestants", "Alcohol or other substances with it", "Was alcohol or anything else taken along with it?", ["alcohol", "along with", "also took", "mixed", "with", "co-ingest", "other tablets", "drugs"]),
    yn("hpi", "vomiting_after", "Vomiting after", "Did the patient vomit afterwards, how soon, and what did the vomit contain or smell of?", ["vomited", "vomiting", "vomit", "smell", "garlic", "kerosene", "tablets in vomit", "induced vomiting", "gastric lavage"]),
    val("hpi", "first_aid", "What was done before arrival", "Was any first aid, lavage, home remedy, or treatment given at another hospital before arrival?", ["lavage", "washed", "stomach wash", "milk", "salt water", "home remedy", "referred from", "primary health", "phc", "given at", "injection given", "atropine", "first aid"]),
    yn("hpi", "symptoms_timeline", "Symptoms since ingestion", "What symptoms appeared since, and in what order — vomiting, sweating, salivation, breathlessness, drowsiness, burning in the mouth?", ["vomiting", "sweating", "salivation", "frothing", "breathlessness", "drowsy", "drowsiness", "burning", "abdominal pain", "diarrhoea", "twitching", "weakness", "since then", "symptoms"]),
    // Associated
    yn("associated", "cholinergic", "Sweating / salivation / small pupils / loose stools", "Any profuse sweating, salivation or frothing, watering of the eyes, loose stools, or passing urine involuntarily?", ["sweating", "salivation", "frothing", "watering", "lacrimation", "loose stools", "diarrhoea", "urination", "incontinence", "small pupils", "pinpoint", "twitching", "fasciculation"]),
    yn("associated", "gi_burning", "Burning of mouth / throat / chest", "Any burning in the mouth, throat or chest, drooling, or inability to swallow?", ["burning", "mouth", "throat", "chest burning", "drooling", "cannot swallow", "dysphagia", "corrosive", "acid"]),
    yn("associated", "breathlessness_cough", "Breathlessness / cough / choking", "Any breathlessness, cough, or choking at the time of ingestion (aspiration, kerosene)?", ["breathlessness", "breathless", "cough", "choking", "choked", "aspirat", "kerosene", "chest pain"]),
    yn("associated", "giddiness_palpitations", "Giddiness / palpitations / fainting", "Any giddiness, palpitations, or fainting (cardiotoxic agents, aluminium phosphide, oleander)?", ["giddiness", "giddy", "palpitations", "fainting", "fainted", "collapse", "low bp", "shock"]),
    yn("associated", "drowsiness_seizure", "Drowsiness / seizure", "Any drowsiness, confusion, or seizure since?", ["drowsy", "drowsiness", "confused", "unconscious", "seizure", "fit", "convulsion"]),
    yn("associated", "jaundice_reduced_urine", "Jaundice / reduced urine (delayed)", "Any yellowness or reduced urine in the days after (paracetamol, yellow phosphorus, paraquat)?", ["jaundice", "yellow", "reduced urine", "less urine", "dark urine", "oliguria", "days after"], { tier: "detailed" }),
    yn("associated", "bleeding", "Bleeding", "Any bleeding from gums, nose, or in urine or stool (anticoagulant rodenticide)?", ["bleeding", "gums", "nosebleed", "blood in urine", "haematuria", "black stools", "bruising"], { tier: "detailed" }),
    yn("associated", "visual_symptoms", "Blurred vision / dilated pupils / dry mouth", "Any blurring of vision, dilated pupils, dry mouth, or seeing things (datura, antihistamines, methanol)?", ["blurring", "blurred", "dilated pupils", "dry mouth", "hallucinations", "seeing things", "vision loss", "methanol", "datura"], { tier: "detailed" }),
    // Red flags
    yn("red_flag", "high_lethality_agent", "High-lethality agent", "Was the agent aluminium phosphide (celphos), paraquat, yellow phosphorus, an organophosphate, or a corrosive?", ["celphos", "aluminium phosphide", "sulfas", "quickphos", "paraquat", "gramoxone", "yellow phosphorus", "ratol", "organophosphate", "insecticide", "acid", "corrosive", "monocrotophos", "chlorpyrifos"], { teach: "The name of the compound decides everything that follows: some agents have no antidote and a narrow window, and the family's container is the most important investigation." }),
    yn("red_flag", "large_amount_or_delay", "Large amount or long delay", "Was the amount large, or more than a few hours between ingestion and arrival?", ["large", "full bottle", "many tablets", "strips", "hours ago", "last night", "delay", "late", "yesterday"], { teach: "Dose and delay together predict severity; a late arrival after a large dose has already lost the benefit of decontamination." }),
    yn("red_flag", "breathing_difficulty", "Breathing difficulty / excessive secretions", "Is there breathing difficulty, noisy breathing, or excessive secretions?", ["breathing difficulty", "breathless", "noisy breathing", "secretions", "frothing", "gurgling", "cannot breathe", "gasping"], { teach: "Respiratory failure from secretions, muscle weakness or aspiration is how organophosphate poisoning kills; the airway is the first decision." }),
    yn("red_flag", "altered_sensorium", "Drowsy or unresponsive", "Is the patient drowsy, confused, or unresponsive?", ["drowsy", "drowsiness", "confused", "unresponsive", "unconscious", "not responding", "coma"], { teach: "A falling level of consciousness threatens the airway and removes the patient's own account; the attendants' account becomes the history." }),
    yn("red_flag", "shock_symptoms", "Giddiness / cold hands / fainting", "Is there giddiness, cold clammy skin, or fainting?", ["giddiness", "cold", "clammy", "fainting", "collapse", "low bp", "shock", "sweating"], { teach: "Refractory shock within hours is the signature of aluminium phosphide and of cardiotoxic plant poisons." }),
    yn("red_flag", "corrosive_features", "Corrosive features", "Is there burning of the mouth or throat, drooling, or inability to swallow?", ["burning mouth", "burning throat", "drooling", "cannot swallow", "acid", "toilet cleaner", "blisters in mouth", "corrosive"], { teach: "Corrosive ingestion forbids lavage and blind tube passage; the mouth findings are the reason to ask before acting." }),
    yn("red_flag", "suicidal_intent_ongoing", "Ongoing suicidal intent / previous attempts", "Does the patient still wish to die, and have there been previous attempts?", ["still wants", "wish to die", "suicidal", "previous attempt", "attempted before", "earlier attempt", "hopeless", "plan"], { teach: "The person is at higher risk in the weeks after an attempt; asking directly does not increase risk, and the answer decides the psychiatric referral and the supervision on the ward." }),
    PREGNANCY,
    // Exposures
    yn("exposure", "occupation_access", "Occupation / access to pesticides", "Is the patient a farmer or farm worker, or is the substance kept at home?", ["farmer", "farm", "fields", "spraying", "pesticide at home", "kept at home", "shop", "access"]),
    yn("exposure", "psychiatric_history", "Psychiatric history / substance use", "Any known depression, psychiatric treatment, or alcohol or drug dependence?", ["depression", "psychiatric", "psychiatrist", "mental illness", "alcohol dependence", "drug use", "counselling"]),
    yn("exposure", "chronic_illness_medicines", "Chronic illness / medicines at home", "Any chronic illness in the patient or family whose medicines were available (insulin, heart tablets, anticonvulsants)?", ["medicines at home", "insulin", "heart tablets", "epilepsy tablets", "bp tablets", "sugar tablets", "grandmother's", "family medicines"], { tier: "detailed" }),
    yn("exposure", "social_support", "Social support / who accompanies", "Who is with the patient, and who will be at home after discharge?", ["accompanied by", "alone", "husband", "wife", "parents", "hostel", "support", "lives with"], { tier: "detailed" }),
  ],
  differentials: [
    { id: "organophosphate", name: "Organophosphate / carbamate poisoning", pointers: ["cholinergic", "high_lethality_agent", "breathing_difficulty", "occupation_access"], discriminators: ["cholinergic", "high_lethality_agent", "breathing_difficulty", "occupation_access", "agent", "time_of_ingestion", "first_aid"] },
    { id: "aluminium_phosphide", name: "Aluminium phosphide (celphos)", pointers: ["high_lethality_agent", "shock_symptoms", "giddiness_palpitations", "vomiting_after"], discriminators: ["high_lethality_agent", "shock_symptoms", "giddiness_palpitations", "vomiting_after", "agent", "amount", "time_of_ingestion"] },
    { id: "paraquat", name: "Paraquat", pointers: ["high_lethality_agent", "gi_burning", "jaundice_reduced_urine"], discriminators: ["high_lethality_agent", "gi_burning", "jaundice_reduced_urine", "breathlessness_cough", "amount", "agent"] },
    { id: "rodenticide", name: "Rodenticide (anticoagulant / zinc phosphide / yellow phosphorus)", pointers: ["agent", "bleeding", "jaundice_reduced_urine"], discriminators: ["agent", "bleeding", "jaundice_reduced_urine", "vomiting_after", "amount", "time_of_ingestion"] },
    { id: "tablets", name: "Tablet overdose (paracetamol, sedatives, antidepressants, others)", pointers: ["agent", "chronic_illness_medicines", "drowsiness_seizure"], discriminators: ["agent", "chronic_illness_medicines", "drowsiness_seizure", "amount", "time_of_ingestion", "jaundice_reduced_urine", "giddiness_palpitations"] },
    { id: "corrosive", name: "Corrosive ingestion", pointers: ["corrosive_features", "gi_burning"], discriminators: ["corrosive_features", "gi_burning", "agent", "amount", "breathlessness_cough"] },
    { id: "hydrocarbon", name: "Kerosene / hydrocarbon", pointers: ["breathlessness_cough", "agent"], discriminators: ["breathlessness_cough", "agent", "vomiting_after", "drowsiness_seizure"] },
    { id: "plant", name: "Plant poison (oleander, datura, others)", pointers: ["giddiness_palpitations", "visual_symptoms", "agent"], discriminators: ["giddiness_palpitations", "visual_symptoms", "agent", "drowsiness_seizure", "vomiting_after"] },
    { id: "alcohol_methanol", name: "Alcohol / methanol", pointers: ["co_ingestants", "visual_symptoms", "drowsiness_seizure"], discriminators: ["co_ingestants", "visual_symptoms", "drowsiness_seizure", "agent", "breathlessness_cough"] },
  ],
  output: {
    durationSlot: "duration",
    hpiOrder: ["onset", "duration", "agent", "amount", "time_of_ingestion", "route", "intent", "co_ingestants", "vomiting_after", "first_aid", "symptoms_timeline", "progression", "prior_treatment", "prior_investigations"],
  },
};
