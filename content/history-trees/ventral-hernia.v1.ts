import type { HistoryTree } from "@/lib/history-check/types";
import { BAILEY_LOVE, BROWSE, commonHpi, DAS_CLINICAL_SURGERY, HAMILTON_BAILEY, surgicalBackground, val, yn } from "@/content/history-trees/_helpers";

/**
 * SWELLING OF THE ABDOMINAL WALL (UMBILICAL / EPIGASTRIC / INCISIONAL HERNIA) — v1.0.0.
 * CLINICAL CONTENT: PENDING REVIEW. Adult surgical ward and OPD, north India.
 * Built from S. Das, A Manual on Clinical Surgery, 13th ed., ch. 38 pp. 609–610: the varieties
 * are separated by site (at the navel, beside it, in the upper midline, in a scar), the
 * para-umbilical hernia of the obese middle-aged woman gives intermittent pain because its
 * neck is tight, the epigastric hernia hurts after meals and is mistaken for an ulcer, an
 * acquired umbilical hernia sends the history looking for raised abdominal pressure, and an
 * incisional hernia follows a wound that became infected. docs/surgical-history.md §10.
 *
 * `groin_swelling` keeps the groin; its bare "hernia" trigger means both trees are suggested
 * for an undifferentiated "hernia", which `suggestTrees` is built to allow. Differentials:
 * para-umbilical hernia, acquired umbilical hernia, epigastric hernia, incisional hernia,
 * divarication of the recti, lipoma of the abdominal wall.
 */
export const ventralHerniaV1: HistoryTree = {
  id: "ventral_hernia",
  version: "1.0.0",
  complaint: "Swelling of the abdominal wall (umbilical / epigastric / incisional hernia)",
  triggers: ["umbilical hernia", "paraumbilical hernia", "para umbilical hernia", "para-umbilical hernia", "incisional hernia", "epigastric hernia", "ventral hernia", "swelling at the navel", "swelling near the navel", "swelling at umbilicus", "umbilical swelling", "bulge in scar", "swelling in scar", "swelling at the scar"],
  setting: "Adult surgical ward and OPD, north India",
  reviewStatus: "pending_clinician_review",
  reviewedBy: null,
  references: [DAS_CLINICAL_SURGERY, HAMILTON_BAILEY, BROWSE, BAILEY_LOVE],
  slots: [
    ...commonHpi("swelling"),
    val("hpi", "site_on_abdomen", "Where on the abdomen", "Is the swelling at the navel, just above or beside it, in the upper midline, or in an old operation scar?", ["navel", "umbilicus", "above the navel", "beside the navel", "upper midline", "epigastrium", "in the scar", "old wound", "stitch line"], { teach: "Das separates the abdominal-wall hernias by where they sit, so the site is the first thing the history records." }),
    val("hpi", "size_and_growth", "Size and change over time", "How big is it, and has it grown since it was first noticed?", ["size", "small", "large", "grown", "increased", "same", "lemon", "orange", "gradually", "over years"], { numeric: true }),
    yn("hpi", "reducibility", "Whether it goes back", "Does the swelling go back on lying down or on pushing it, and has that changed recently?", ["goes back", "reduces", "disappears", "on lying down", "on pushing", "no longer goes back", "irreducible", "stays out", "changed recently"]),
    yn("hpi", "cough_impulse_strain", "Appears on coughing or straining", "Does it appear or get bigger on coughing, straining, lifting, or standing?", ["coughing", "straining", "lifting", "standing", "gets bigger", "appears", "bearing down"]),
    yn("hpi", "previously_stuck", "Has been stuck before and gone back", "Has the swelling ever failed to go back for a while and then gone back on its own or with help?", ["stuck", "did not go back", "would not reduce", "went back later", "pushed back", "reduced with help", "never got stuck"]),
    yn("hpi", "intermittent_abdominal_pain", "Bouts of abdominal pain", "Does it bring on bouts of abdominal pain, even when the swelling itself is small or goes back?", ["bouts of pain", "colicky", "comes and goes", "pain abdomen", "intermittent pain", "discomfort", "no pain"], { teach: "Das notes a para-umbilical hernia gives intermittent pain because the defect in the midline is firm and does not widen as the hernia grows; a small one may be noticed only as pain." }),
    yn("associated", "pain_after_meals", "Pain over the swelling after eating", "Does pain over the swelling start after eating?", ["after meals", "after food", "after eating", "epigastric pain", "thought it was ulcer", "gastritis", "acidity", "no relation to food"], { tier: "detailed", teach: "Das describes epigastric hernia pain beginning after meals, which patients often take for an ulcer; the history is what sends the hand to the abdominal wall." }),
    yn("associated", "weight_gain", "Weight gain", "Has the patient put on a lot of weight over the years?", ["weight gain", "put on weight", "obese", "overweight", "heavy", "fat", "weight stable"], { tier: "detailed" }),

    // Red flags — the same three that decide timing in any hernia
    yn("red_flag", "irreducible_painful", "No longer reducible, painful and tense", "Has a swelling that used to go back become painful, tense, and impossible to push back?", ["no longer goes back", "irreducible", "cannot push back", "painful", "tense", "hard", "suddenly", "stuck"], { teach: "A hernia that used to reduce and now will not, with pain, marks trapped contents, and the blood supply is the thing at risk." }),
    yn("red_flag", "obstruction_features", "Vomiting with absolute constipation and distension", "Along with the swelling, has the patient stopped passing stool and flatus, with vomiting and a distended abdomen?", ["vomiting", "no stool", "no flatus", "absolute constipation", "distension", "obstipation", "colicky pain", "bilious", "faecal vomiting"], { teach: "An abdominal-wall swelling with vomiting and no stool or flatus describes bowel obstructed inside the sac, which is a theatre problem rather than a clinic one." }),
    yn("red_flag", "skin_changes_over_swelling", "Redness, warmth, blackening or thinning of the skin over it", "Is the skin over the swelling red, warm, blackened, very tender, or thin and shiny?", ["redness", "warm", "blackening", "black", "severe tenderness", "discolouration", "thin skin", "shiny", "ulcerated"], { teach: "Skin changes over an irreducible swelling suggest the contents have been compromised; thin, ulcerating skin over a large hernia can give way." }),

    // What sits behind it (Das)
    yn("exposure", "raised_abdominal_pressure", "Raised pressure inside the abdomen", "Is there a recent pregnancy, fluid in the abdomen, a distended abdomen, or a known ovarian cyst or fibroid?", ["pregnancy", "pregnant", "ascites", "fluid in abdomen", "distension", "ovarian cyst", "fibroid", "liver disease", "none of these"], { teach: "Das says an acquired umbilical hernia is almost always pushed through by raised pressure inside the abdomen, and the history has to find the cause." }),
    yn("exposure", "occupation_straining", "Heavy work / chronic cough / straining", "Any heavy lifting at work, chronic cough, constipation, or straining to pass urine?", ["heavy lifting", "labourer", "chronic cough", "constipation", "straining", "prostate", "weight lifting", "load"]),
    val("exposure", "scar_origin", "What left the scar", "If the swelling is in a scar, what operation or injury left it, and when?", ["operation", "caesarean", "lscs", "laparotomy", "appendicectomy", "hysterectomy", "injury", "stab", "years ago"]),
    yn("exposure", "scar_wound_infection", "Infection of the earlier wound", "Did the wound of that earlier operation or injury get infected, discharge pus, or open up?", ["wound infection", "pus from wound", "wound opened", "stitches gave way", "burst abdomen", "resutured", "healed well", "no infection"], { teach: "Das names infection of the original wound as the usual predisposing cause of an incisional hernia." }),
    yn("exposure", "previous_hernia_repair", "Previous repair of this hernia", "Has this hernia been repaired before, with or without a mesh, and did it come back?", ["repaired before", "previous repair", "mesh", "recurrence", "came back", "recurrent", "first time"]),

    // Hamilton Bailey's Demonstrations of Physical Signs, 19th ed. (docs/surgical-history.md §11)
    yn("hpi", "swelling_with_periods", "Pain or bleeding from the swelling with periods", "In a woman, does the swelling become painful or bleed with each menstrual period?", ["with periods", "during menses", "every month", "cyclical", "bleeds monthly", "no relation to periods"], { tier: "detailed", teach: "Hamilton Bailey describes endometrial deposits in the navel or an old incision giving pain, swelling and bloody discharge that follow the menstrual cycle, which a hernia does not." }),
    yn("associated", "umbilical_discharge", "Discharge from the navel", "Is there any discharge from the navel?", ["discharge from navel", "umbilical discharge", "pus from navel", "wet navel", "bloody discharge", "urine from navel", "smelly", "no discharge"], { tier: "detailed", teach: "Hamilton Bailey lists concretions, infection, urachal and vitelline remnants, pilonidal disease and fistulas as causes of umbilical discharge, so a discharging navel needs its own question." }),
    yn("exposure", "stoma", "Stoma and fitting the bag", "Does the patient have a stoma, and has a bulge beside it made the bag hard to fit?", ["stoma", "colostomy", "ileostomy", "urostomy", "bag", "appliance", "leaks", "bulge beside stoma", "no stoma"], { tier: "detailed", teach: "Hamilton Bailey treats a parastomal hernia as an incisional hernia whose first complaint is often trouble fitting the stoma appliance." }),
    ...surgicalBackground({ acute: true }),
  ],
  differentials: [
    { id: "paraumbilical", name: "Para-umbilical hernia", pointers: ["site_on_abdomen", "intermittent_abdominal_pain", "weight_gain"], discriminators: ["site_on_abdomen", "intermittent_abdominal_pain", "reducibility", "weight_gain", "surg_menstrual_obstetric", "previously_stuck", "swelling_with_periods", "umbilical_discharge"] },
    { id: "acquired_umbilical", name: "Acquired umbilical hernia", pointers: ["raised_abdominal_pressure", "site_on_abdomen"], discriminators: ["raised_abdominal_pressure", "site_on_abdomen", "reducibility", "cough_impulse_strain", "umbilical_discharge"] },
    { id: "epigastric", name: "Epigastric hernia", pointers: ["pain_after_meals", "site_on_abdomen"], discriminators: ["pain_after_meals", "site_on_abdomen", "reducibility", "cough_impulse_strain", "size_and_growth"] },
    { id: "incisional", name: "Incisional hernia", pointers: ["scar_origin", "scar_wound_infection"], discriminators: ["scar_origin", "scar_wound_infection", "site_on_abdomen", "previous_hernia_repair", "weight_gain", "occupation_straining", "swelling_with_periods", "stoma"] },
    { id: "divarication", name: "Divarication of the recti", pointers: ["surg_menstrual_obstetric", "cough_impulse_strain"], discriminators: ["surg_menstrual_obstetric", "site_on_abdomen", "previously_stuck", "intermittent_abdominal_pain"] },
    { id: "lipoma", name: "Lipoma of the abdominal wall", pointers: ["size_and_growth"], discriminators: ["size_and_growth", "reducibility", "cough_impulse_strain", "pain_after_meals", "swelling_with_periods"] },
  ],
  output: {
    durationSlot: "duration",
    hpiOrder: ["onset", "duration", "onset_mode", "site_on_abdomen", "size_and_growth", "reducibility", "cough_impulse_strain", "previously_stuck", "intermittent_abdominal_pain", "progression", "prior_treatment", "prior_investigations"],
  },
};
