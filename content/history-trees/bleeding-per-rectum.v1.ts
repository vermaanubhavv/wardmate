import type { HistoryTree } from "@/lib/history-check/types";
import { commonHpi, HUTCHISONS, MACLEODS, PREGNANCY, val, yn } from "@/content/history-trees/_helpers";

/**
 * BLEEDING PER RECTUM — v1.0.0. CLINICAL CONTENT: REVIEWED.
 * Adult surgical ward, north India. Separates anorectal bleeding (bright red, on the paper or
 * pan, after stool) from colonic bleeding (mixed, dark) and from upper-gastrointestinal
 * bleeding (black, tarry). Differentials: haemorrhoids, anal fissure, rectal or colonic cancer,
 * colitis (infective, ulcerative), diverticular bleeding, polyps, angiodysplasia, upper GI source.
 */
export const bleedingPerRectumV1: HistoryTree = {
  id: "bleeding_per_rectum",
  version: "1.0.0",
  complaint: "Bleeding per rectum",
  triggers: ["bleeding per rectum", "bleeding pr", "rectal bleeding", "blood per rectum", "passing blood", "bloody stools", "hematochezia", "haematochezia", "melaena", "melena", "black stools", "bright red blood"],
  setting: "Adult surgical ward, north India",
  reviewStatus: "reviewed",
  reviewedBy: "Dr. Anubhav, General Surgery — 2026-09-26",
  references: [MACLEODS, HUTCHISONS],
  slots: [
    ...commonHpi("bleeding per rectum"),
    val("hpi", "colour", "Colour of blood", "Is the blood bright red, dark, maroon, or black and tarry?", ["bright red", "dark", "maroon", "black", "tarry", "melaena", "malena", "red", "fresh blood"]),
    val("hpi", "relation_to_stool", "Relation to stool", "Is the blood on the paper, dripping in the pan, streaked on the stool, or mixed in?", ["on paper", "on the pan", "dripping", "streaked", "mixed", "coating", "after stool", "before stool", "with stool"]),
    val("hpi", "amount", "Amount", "How much blood — streaks, a few drops, a cupful, or clots?", ["streaks", "drops", "cupful", "clots", "large amount", "small amount", "profuse", "amount"], { numeric: true }),
    val("hpi", "pattern", "Frequency", "Does it come every stool, now and then, or is it a single episode?", ["every stool", "now and then", "single episode", "intermittent", "daily", "on and off", "recurrent"]),
    yn("hpi", "pain", "Pain on passing stool", "Is there pain on passing stool, and how long does it last?", ["pain on passing", "painful defaecation", "pain during stool", "burning", "cutting", "tearing", "painless"]),
    yn("hpi", "prolapse", "Lump / prolapse at the anus", "Any lump coming out at the anus, and does it go back on its own?", ["lump", "prolapse", "coming out", "mass at anus", "swelling", "piles", "goes back"]),
    yn("associated", "bowel_habit", "Change in bowel habit", "Any recent change in bowel habit, constipation, or loose stools?", ["constipation", "loose stools", "change in bowel habit", "diarrhoea", "alternating", "narrow stool", "pencil"]),
    yn("associated", "mucus_tenesmus", "Mucus / tenesmus", "Any mucus, urgency, or a sense of incomplete emptying?", ["mucus", "urgency", "tenesmus", "incomplete", "frequent stool"]),
    yn("associated", "abdominal_pain", "Abdominal pain", "Any abdominal pain or cramps?", ["abdominal pain", "cramps", "colicky", "pain abdomen"]),
    yn("associated", "appetite_weight", "Appetite / weight", "Any loss of appetite or weight loss?", ["appetite", "weight loss", "lost weight", "loss of weight"]),
    yn("associated", "fever", "Fever", "Any fever?", ["fever", "chills", "night sweats"]),
    yn("associated", "upper_gi", "Vomiting blood / epigastric pain", "Any vomiting of blood, epigastric pain, or indigestion?", ["vomiting blood", "haematemesis", "epigastric pain", "indigestion", "burning", "coffee ground"], { tier: "detailed" }),
    yn("associated", "bleeding_elsewhere", "Bleeding elsewhere", "Any bleeding from the gums, nose, urine, or easy bruising?", ["gums", "nose", "haematuria", "bruising", "bleeding elsewhere", "easy bruising"], { tier: "detailed" }),
    // Red flags
    yn("red_flag", "haemodynamic", "Giddiness / fainting / palpitations", "Any giddiness, fainting, palpitations, or cold sweats with the bleeding?", ["giddiness", "fainting", "palpitations", "cold sweats", "dizzy", "syncope", "weakness"], { teach: "Giddiness or fainting with bleeding suggests the volume lost is enough to matter, which changes how quickly to look." }),
    yn("red_flag", "large_volume", "Large-volume or repeated bleeding", "Has there been a large amount of blood, clots, or repeated episodes in the same day?", ["large amount", "clots", "profuse", "repeated", "several times", "cupful", "buckets"], { teach: "Large or repeated bleeding is the part of the story that sets the pace of everything else." }),
    yn("red_flag", "melaena", "Black tarry stools / vomiting blood", "Are the stools black and tarry, or has the patient vomited blood?", ["black stools", "melaena", "tarry", "vomiting blood", "haematemesis"], { teach: "Black tarry stools point higher in the gut than bright red blood on the paper." }),
    yn("red_flag", "weight_loss_habit_change", "Weight loss / change in habit", "Any weight loss with a new change in bowel habit?", ["weight loss", "change in bowel habit", "new constipation", "narrow stool", "pencil", "tenesmus"], { teach: "Bleeding with weight loss or a new change in habit is the story that raises a bowel lesion." }),
    yn("red_flag", "anticoagulants", "Blood thinners / NSAIDs", "Is the patient on blood thinners, aspirin, or NSAIDs?", ["blood thinner", "warfarin", "aspirin", "clopidogrel", "nsaid", "painkillers", "diclofenac", "anticoagulant"], { teach: "Drugs that thin the blood or irritate the gut change both the source and the risk of bleeding." }),
    yn("red_flag", "liver_disease", "Known liver disease / varices", "Any known liver disease, alcohol use, or varices?", ["liver disease", "cirrhosis", "alcohol", "varices", "portal hypertension", "hepatitis"], { tier: "detailed", teach: "In a patient with liver disease, bleeding can come from varices or piles of portal origin, which are managed very differently." }),
    PREGNANCY,
    yn("exposure", "family_bowel", "Family history of bowel cancer / IBD", "Any family history of bowel cancer, polyps, or inflammatory bowel disease?", ["family history", "bowel cancer", "polyps", "ibd", "colitis", "crohn"], { tier: "detailed" }),
    yn("exposure", "recent_infection_travel", "Recent gastroenteritis / travel / antibiotics", "Any recent gastroenteritis, travel, or antibiotic course?", ["gastroenteritis", "travel", "antibiotics", "diarrhoea", "food poisoning"], { tier: "detailed" }),
    yn("exposure", "anal_intercourse_hiv", "Anal sex / sexually transmitted infection / HIV", "Any history of anal intercourse, a sexually transmitted infection, or HIV?", ["anal sex", "anal intercourse", "sti", "hiv", "sexually transmitted"], { tier: "detailed" }),
  ],
  differentials: [
    { id: "haemorrhoids", name: "Haemorrhoids", pointers: ["colour", "relation_to_stool", "prolapse"], discriminators: ["colour", "relation_to_stool", "prolapse", "pain", "amount", "pattern"] },
    { id: "fissure", name: "Anal fissure", pointers: ["pain", "relation_to_stool"], discriminators: ["pain", "relation_to_stool", "amount", "prolapse"] },
    { id: "colorectal_cancer", name: "Colorectal cancer / polyp", pointers: ["weight_loss_habit_change", "bowel_habit", "family_bowel", "appetite_weight"], discriminators: ["weight_loss_habit_change", "bowel_habit", "family_bowel", "appetite_weight", "mucus_tenesmus", "colour"] },
    { id: "colitis", name: "Colitis (infective / inflammatory)", pointers: ["mucus_tenesmus", "fever", "recent_infection_travel", "abdominal_pain"], discriminators: ["mucus_tenesmus", "fever", "recent_infection_travel", "abdominal_pain", "bowel_habit", "anal_intercourse_hiv"] },
    { id: "diverticular_angiodysplasia", name: "Diverticular / vascular bleeding", pointers: ["large_volume", "anticoagulants", "haemodynamic"], discriminators: ["large_volume", "anticoagulants", "haemodynamic", "pain", "abdominal_pain"] },
    { id: "upper_gi", name: "Upper gastrointestinal source", pointers: ["melaena", "upper_gi", "liver_disease"], discriminators: ["melaena", "upper_gi", "liver_disease", "anticoagulants", "colour"] },
  ],
  output: {
    durationSlot: "duration",
    hpiOrder: ["onset", "duration", "onset_mode", "colour", "relation_to_stool", "amount", "pattern", "pain", "prolapse", "progression", "prior_treatment", "prior_investigations"],
  },
};
