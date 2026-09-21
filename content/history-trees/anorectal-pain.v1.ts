import type { HistoryTree } from "@/lib/history-check/types";
import { commonHpi, HUTCHISONS, IMMUNOCOMPROMISE, MACLEODS, val, yn } from "@/content/history-trees/_helpers";

/**
 * ANORECTAL PAIN AND PERIANAL COMPLAINT — v1.0.0. CLINICAL CONTENT: PENDING CLINICIAN REVIEW.
 * Adult surgical ward, north India. The relationship of the pain to passing stool separates most
 * of this list: pain during and after defaecation with bright bleeding is a fissure, constant
 * throbbing pain with fever is a collection. Differentials: anal fissure, perianal or
 * ischiorectal abscess, fistula in ano, thrombosed external pile, prolapsed pile, pilonidal
 * sinus, proctalgia fugax, anal carcinoma, necrotising perineal infection.
 */
export const anorectalPainV1: HistoryTree = {
  id: "anorectal_pain",
  version: "1.0.0",
  complaint: "Anal pain / perianal swelling",
  triggers: ["anal pain", "pain in anus", "perianal swelling", "perianal pain", "painful defaecation", "pain while passing stool", "perianal abscess", "fissure", "fistula", "piles", "haemorrhoids", "pilonidal", "swelling near anus", "discharge near anus"],
  setting: "Adult surgical ward, north India",
  reviewStatus: "pending_clinician_review",
  reviewedBy: null,
  references: [MACLEODS, HUTCHISONS],
  slots: [
    ...commonHpi("anal pain"),
    val("hpi", "relation_to_defaecation", "Relation to passing stool", "Is the pain during passing stool, after it, or unrelated to it, and how long does it last?", ["during", "while passing", "after passing", "hours after", "unrelated", "constant", "all the time", "minutes", "lasts", "before"]),
    val("hpi", "character_severity", "Character and severity", "Is it a tearing or cutting pain, a throbbing pain, or a deep cramp?", ["tearing", "cutting", "knife like", "throbbing", "pulsating", "cramp", "spasm", "burning", "severe", "sharp"], { numeric: true }),
    yn("hpi", "swelling", "Swelling near the anus", "Is there a swelling near the anus, and is it tender, and has it changed in size?", ["swelling", "lump", "tender", "painful lump", "increased", "grown", "soft", "hard", "near anus", "beside"]),
    yn("hpi", "bleeding", "Bleeding", "Any bleeding, and is it bright red on the paper, dripping, or mixed with stool?", ["bleeding", "bright red", "on paper", "dripping", "in the pan", "mixed", "streaked", "clots", "after stool"]),
    yn("hpi", "discharge", "Discharge or wetness", "Any pus, discharge, or persistent wetness near the anus, and does it soil the clothes?", ["discharge", "pus", "wetness", "soiling", "stains", "foul", "intermittent", "comes and goes", "blood stained"]),
    yn("hpi", "prolapse", "Something coming out", "Does anything come out of the anus on passing stool, and does it go back on its own or need pushing?", ["comes out", "prolapse", "mass", "goes back", "pushing", "on its own", "stays out", "reduces", "lump comes out"]),
    yn("associated", "constipation_straining", "Constipation / hard stool / straining", "Any constipation, hard stool, or prolonged straining before this started?", ["constipation", "hard stool", "straining", "prolonged", "sitting long", "mobile phone", "difficulty passing"]),
    yn("associated", "diarrhoea", "Loose stools", "Any loose stools or repeated passage of stool?", ["loose stools", "diarrhoea", "frequent", "repeated", "urgency", "mucus"]),
    yn("associated", "fever", "Fever", "Any fever or chills?", ["fever", "chills", "rigors", "temperature", "febrile"]),
    yn("associated", "urinary_symptoms", "Difficulty passing urine", "Any difficulty passing urine, or inability to pass urine?", ["difficulty passing urine", "retention", "cannot pass urine", "dribbling", "burning"]),
    yn("associated", "itching", "Itching around the anus", "Any itching around the anus?", ["itching", "pruritus", "itchy", "scratching", "worms"], { tier: "detailed" }),
    yn("associated", "incontinence", "Leakage of stool or flatus", "Any leakage of stool or inability to hold flatus?", ["leakage", "incontinence", "cannot hold", "flatus", "soiling", "control"], { tier: "detailed" }),
    yn("associated", "weight_loss_habit_change", "Weight loss / change in bowel habit", "Any weight loss, or a recent change in bowel habit?", ["weight loss", "change in bowel habit", "narrow stool", "tenesmus", "lost weight", "appetite"]),
    yn("associated", "back_natal_cleft", "Swelling or sinus in the cleft of the buttocks", "Any swelling, pit, or discharging opening in the cleft between the buttocks rather than at the anus?", ["cleft", "between the buttocks", "natal cleft", "pit", "sinus", "hair", "discharging", "above the anus"], { tier: "detailed" }),
    // Red flags
    yn("red_flag", "abscess_features", "Constant throbbing pain with fever and swelling", "Is the pain constant and throbbing, with fever and a tender swelling, rather than related to passing stool?", ["constant", "throbbing", "fever", "tender swelling", "cannot sit", "sleepless", "worsening", "hot", "red"], { teach: "Constant throbbing perianal pain with fever describes a collection of pus, which will not settle with ointments and needs draining." }),
    yn("red_flag", "spreading_necrosis", "Spreading redness, blackening or severe illness", "Any rapidly spreading redness, blackening of the skin, crackling under the skin, foul discharge, or severe illness?", ["spreading", "rapidly", "blackening", "black", "crackling", "crepitus", "foul", "severe illness", "toxic", "gangrene", "necrosis"], { teach: "Rapidly spreading redness or blackening in the perineum marks a necrotising infection, where hours of delay change the extent of surgery needed." }),
    yn("red_flag", "diabetes_immunosuppression", "Diabetes or immunosuppression", "Is the patient diabetic, on steroids, on chemotherapy, or otherwise immunosuppressed?", ["diabetes", "diabetic", "sugar", "steroid", "chemotherapy", "immunosuppressed", "hiv", "transplant"], { teach: "Perianal infection in a diabetic or immunosuppressed patient spreads further and faster with fewer outward signs." }),
    yn("red_flag", "urinary_retention", "Unable to pass urine", "Has the patient become unable to pass urine?", ["cannot pass urine", "retention", "not passed urine", "full bladder", "dribbling"], { teach: "Retention of urine alongside perineal pain marks either severe pain or spread of infection, and either way it changes the urgency." }),
    yn("red_flag", "mass_weight_loss", "Hard lump at the anus with weight loss", "Is there a hard lump or ulcer at the anus, with weight loss or bleeding that has not settled?", ["hard lump", "ulcer", "growth", "weight loss", "not settled", "persistent bleeding", "irregular", "indurated"], { teach: "A hard indurated anal lesion with weight loss raises a carcinoma, which is regularly treated as piles for months first." }),
    yn("red_flag", "recurrent_fistula_tb_crohn", "Repeated abscesses or multiple openings", "Have there been repeated abscesses, multiple discharging openings, or a history of tuberculosis or chronic bowel disease?", ["repeated", "recurrent", "multiple openings", "several", "tuberculosis", "tb", "crohn", "chronic diarrhoea", "again and again"], { teach: "Repeated or multiple perianal openings point away from a simple abscess and towards tuberculosis or inflammatory bowel disease." }),
    yn("red_flag", "severe_pain_thrombosis", "Sudden severe pain with a tense blue lump", "Did a tense, blue, exquisitely painful lump appear suddenly at the anal margin?", ["sudden", "tense", "blue", "purple", "exquisitely painful", "appeared suddenly", "hard lump", "at the margin"], { tier: "detailed", teach: "A sudden tense blue perianal lump is a clotted external pile, and the window in which drainage helps is short." }),
    IMMUNOCOMPROMISE,
    yn("exposure", "occupation_sitting", "Prolonged sitting / driving / heavy work", "Does the work involve prolonged sitting, driving, or heavy lifting?", ["sitting", "driving", "heavy lifting", "labourer", "long hours", "occupation", "desk"], { tier: "detailed" }),
    yn("exposure", "anal_intercourse_sti", "Anal intercourse / sexually transmitted infection", "Any history of anal intercourse, a sexually transmitted infection, or genital warts?", ["anal intercourse", "anal sex", "sti", "warts", "hiv", "sexually transmitted", "unprotected"], { tier: "detailed" }),
    yn("exposure", "previous_anal_surgery", "Previous anal surgery or procedure", "Any previous operation, banding, or injection for piles, fissure, or fistula?", ["previous surgery", "operation", "banding", "injection", "piles", "fissure", "fistula", "sclerotherapy", "stapler"], { tier: "detailed" }),
    yn("exposure", "diet_fibre", "Diet and fluid intake", "How much water, fruit, vegetables and fibre are taken daily?", ["water", "fluids", "fruit", "vegetables", "fibre", "diet", "low fibre", "spicy"], { tier: "detailed" }),
  ],
  differentials: [
    { id: "fissure", name: "Anal fissure", pointers: ["relation_to_defaecation", "character_severity", "bleeding", "constipation_straining"], discriminators: ["relation_to_defaecation", "character_severity", "bleeding", "constipation_straining", "swelling", "fever", "discharge"] },
    { id: "abscess", name: "Perianal or ischiorectal abscess", pointers: ["abscess_features", "fever", "swelling", "diabetes_immunosuppression"], discriminators: ["abscess_features", "fever", "swelling", "relation_to_defaecation", "diabetes_immunosuppression", "urinary_retention", "discharge"] },
    { id: "fistula", name: "Fistula in ano", pointers: ["discharge", "recurrent_fistula_tb_crohn", "swelling"], discriminators: ["discharge", "recurrent_fistula_tb_crohn", "swelling", "fever", "previous_anal_surgery", "back_natal_cleft"] },
    { id: "thrombosed_pile", name: "Thrombosed external pile", pointers: ["severe_pain_thrombosis", "swelling", "onset_mode"], discriminators: ["severe_pain_thrombosis", "swelling", "onset_mode", "relation_to_defaecation", "prolapse", "fever"] },
    { id: "prolapsed_pile", name: "Prolapsed haemorrhoids", pointers: ["prolapse", "bleeding", "constipation_straining"], discriminators: ["prolapse", "bleeding", "constipation_straining", "relation_to_defaecation", "discharge", "incontinence"] },
    { id: "pilonidal", name: "Pilonidal sinus or abscess", pointers: ["back_natal_cleft", "discharge", "occupation_sitting"], discriminators: ["back_natal_cleft", "discharge", "occupation_sitting", "swelling", "relation_to_defaecation"] },
    { id: "proctalgia_fugax", name: "Proctalgia fugax", pointers: ["character_severity", "relation_to_defaecation"], discriminators: ["character_severity", "relation_to_defaecation", "swelling", "bleeding", "fever", "discharge"] },
    { id: "anal_carcinoma", name: "Anal carcinoma", pointers: ["mass_weight_loss", "weight_loss_habit_change", "anal_intercourse_sti"], discriminators: ["mass_weight_loss", "weight_loss_habit_change", "anal_intercourse_sti", "bleeding", "discharge", "incontinence"] },
    { id: "necrotising_infection", name: "Necrotising perineal infection", pointers: ["spreading_necrosis", "diabetes_immunosuppression", "fever"], discriminators: ["spreading_necrosis", "diabetes_immunosuppression", "fever", "urinary_retention", "onset_mode"] },
  ],
  output: {
    durationSlot: "duration",
    hpiOrder: ["onset", "duration", "onset_mode", "relation_to_defaecation", "character_severity", "swelling", "bleeding", "discharge", "prolapse", "progression", "prior_treatment", "prior_investigations"],
  },
};
