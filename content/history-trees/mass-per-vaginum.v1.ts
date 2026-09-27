import type { HistoryTree } from "@/lib/history-check/types";
import { commonHpi, HUTCHISONS, MACLEODS, SHAW_GYNAECOLOGY, val, yn } from "@/content/history-trees/_helpers";

/**
 * SOMETHING COMING OUT PER VAGINUM — v1.0.0. CLINICAL CONTENT: PENDING CLINICIAN REVIEW.
 * Obstetrics and gynaecology ward, north India. Whether the mass goes back, what brings it
 * down, and whether it followed a delivery split the differential early; bladder and bowel
 * symptoms and the obstetric history fill in the rest. Differentials: uterovaginal prolapse
 * (with cystocele or rectocele), vault prolapse after hysterectomy, a cervical or fibroid
 * polyp, uterine inversion (acute after delivery, or chronic), a vaginal wall cyst, and a
 * cervical or vaginal growth.
 */
export const massPerVaginumV1: HistoryTree = {
  id: "mass_per_vaginum",
  version: "1.0.0",
  complaint: "Something coming out per vaginum",
  triggers: ["something coming out per vaginum", "something coming out pv", "mass per vaginum", "mass coming out per vaginum", "mass pv", "something coming down", "uterine prolapse", "prolapse uterus", "utero vaginal prolapse", "procidentia", "bulge in vagina", "bachedani bahar aana", "bachedani nikalna"],
  setting: "Obstetrics and gynaecology ward, north India",
  reviewStatus: "pending_clinician_review",
  reviewedBy: null,
  references: [SHAW_GYNAECOLOGY, MACLEODS, HUTCHISONS],
  slots: [
    ...commonHpi("something coming out per vaginum"),
    val("hpi", "mass_description", "What the mass is like", "How big is the mass, what does it look and feel like, and is it always out or only at times?", ["size", "small", "big", "fist", "lemon", "fleshy", "smooth", "always out", "at times", "comes and goes", "lump", "ball"]),
    val("hpi", "reducibility", "Does it go back", "Does the mass go back on its own on lying down, does it have to be pushed back, or does it stay out?", ["goes back", "on lying down", "pushed back", "pushes it back", "stays out", "cannot push", "irreducible", "reducible"]),
    val("hpi", "aggravating_mass", "What brings it down", "Does it come down on coughing, straining, lifting, or standing for long?", ["coughing", "straining", "lifting", "standing", "walking", "heavy work", "squatting", "end of day"]),
    val("hpi", "menstrual_status", "Periods or menopause", "Is she still having periods, and are they heavy or irregular, or when did they stop?", ["periods", "lmp", "menopause", "periods stopped", "heavy periods", "irregular", "regular", "years ago"]),
    yn("hpi", "dragging_backache", "Dragging or backache", "Any dragging sensation, heaviness low in the pelvis, or low backache that eases on lying down?", ["dragging", "heaviness", "something falling", "backache", "back pain", "eases lying down", "pelvic pressure"]),
    yn("hpi", "crampy_pain_mass", "Cramping pain", "Is there cramping lower abdominal pain, as if something is being pushed out?", ["cramping", "colicky", "pain", "being pushed out", "labour like", "lower abdominal pain"], { tier: "detailed" }),
    yn("associated", "urinary_symptoms_mass", "Urinary symptoms", "Any frequency, incomplete emptying, needing to push the mass back to pass urine, or leaking of urine on coughing?", ["frequency", "incomplete emptying", "push back to pass urine", "poor stream", "leaking urine", "on coughing", "stress incontinence", "urgency", "burning"]),
    yn("associated", "bowel_symptoms_mass", "Bowel symptoms", "Any difficulty passing stool, or needing to press on the vagina or perineum to pass it?", ["difficulty passing stool", "constipation", "press to pass stool", "incomplete evacuation", "straining at stool"]),
    yn("associated", "discharge_mass", "Discharge from the mass", "Any discharge, bleeding, or an ulcer on the part that comes out?", ["discharge", "bleeding", "ulcer", "sore", "rubbing", "blood stained", "wet"]),
    yn("associated", "side_swelling_mass", "Swelling at the side of the opening", "Is the swelling at the side of the vaginal opening rather than coming down from inside?", ["side", "labia", "lip", "opening", "one side", "cyst", "bartholin"], { tier: "detailed" }),
    // Red flags
    yn("red_flag", "urinary_retention_mass", "Unable to pass urine", "Is she unable to pass urine at all, or passing only small amounts with a full, painful lower abdomen?", ["unable to pass urine", "not passed urine", "retention", "full bladder", "painful lower abdomen", "dribbling"], { teach: "A large prolapse can kink the urethra and ureters, so retention and falling urine output are asked about, not assumed." }),
    yn("red_flag", "irreducible_painful", "Stuck out and painful", "Is the mass now stuck out, swollen, painful, or dark in colour?", ["stuck", "cannot push back", "swollen", "painful", "dark", "black", "blue", "congested"], { teach: "A prolapse that cannot be pushed back can become congested and ulcerated, and a dark painful mass raises concern for its blood supply." }),
    yn("red_flag", "after_delivery_mass", "Mass appearing after delivery", "Did the mass appear during or soon after a delivery, with heavy bleeding, severe pain, or fainting?", ["after delivery", "during delivery", "after placenta", "heavy bleeding", "severe pain", "fainted", "collapse", "home delivery", "dai"], { teach: "A mass appearing just after delivery with shock out of proportion to the bleeding raises acute uterine inversion, which is time critical." }),
    yn("red_flag", "postmenopausal_bleed_mass", "Bleeding after menopause or foul discharge", "Any bleeding after the menopause, bleeding after intercourse, or foul blood-stained discharge?", ["postmenopausal bleeding", "after menopause", "after intercourse", "post coital", "foul", "blood stained", "offensive"], { teach: "A growth rather than a prolapse is suggested by bleeding after the menopause or intercourse, and a cervix is looked at rather than assumed benign." }),
    yn("red_flag", "weight_loss_mass", "Weight loss", "Any weight loss or loss of appetite?", ["weight loss", "lost weight", "appetite", "loss of appetite", "weak"], { tier: "detailed", teach: "Weight loss alongside a mass per vaginum widens the question towards a malignant growth." }),
    yn("exposure", "obstetric_history_mass", "Obstetric history", "What is the gravida and para, where did the deliveries take place, and were any labours long, assisted with instruments, or of large babies?", ["gravida", "para", "deliveries", "home delivery", "dai", "prolonged labour", "long labour", "forceps", "vacuum", "big baby", "lscs", "early resumption of work"]),
    yn("exposure", "previous_surgery_mass", "Previous pelvic surgery", "Has she had a hysterectomy or an operation for prolapse before?", ["hysterectomy", "uterus removed", "operation for prolapse", "repair", "previous surgery", "vault", "sling"]),
    yn("exposure", "raised_pressure_mass", "Chronic cough, constipation or heavy work", "Any long-standing cough, constipation, or daily heavy lifting such as field work or carrying water?", ["chronic cough", "cough", "constipation", "heavy lifting", "field work", "carrying water", "heavy work", "asthma", "copd"]),
    yn("exposure", "pessary_ring_mass", "Ring pessary or local treatment", "Has a ring pessary been fitted, or any local application used?", ["ring", "pessary", "ring pessary", "local application", "cream", "desi"], { tier: "detailed" }),
  ],
  differentials: [
    { id: "uv_prolapse", name: "Uterovaginal prolapse (with cystocele or rectocele)", pointers: ["reducibility", "aggravating_mass", "dragging_backache", "urinary_symptoms_mass"], discriminators: ["reducibility", "aggravating_mass", "dragging_backache", "urinary_symptoms_mass", "bowel_symptoms_mass", "obstetric_history_mass", "raised_pressure_mass", "menstrual_status"] },
    { id: "vault_prolapse", name: "Vault prolapse after hysterectomy", pointers: ["previous_surgery_mass", "reducibility"], discriminators: ["previous_surgery_mass", "reducibility", "urinary_symptoms_mass", "bowel_symptoms_mass"] },
    { id: "polyp", name: "Cervical or fibroid polyp", pointers: ["crampy_pain_mass", "discharge_mass", "menstrual_status"], discriminators: ["crampy_pain_mass", "discharge_mass", "menstrual_status", "reducibility", "aggravating_mass"] },
    { id: "inversion", name: "Uterine inversion", pointers: ["after_delivery_mass", "discharge_mass"], discriminators: ["after_delivery_mass", "obstetric_history_mass", "crampy_pain_mass", "discharge_mass"] },
    { id: "vaginal_cyst", name: "Vaginal wall or Bartholin cyst", pointers: ["side_swelling_mass"], discriminators: ["side_swelling_mass", "reducibility", "aggravating_mass", "mass_description"] },
    { id: "growth", name: "Cervical or vaginal growth", pointers: ["postmenopausal_bleed_mass", "weight_loss_mass", "discharge_mass"], discriminators: ["postmenopausal_bleed_mass", "weight_loss_mass", "discharge_mass", "reducibility", "mass_description"] },
  ],
  output: {
    durationSlot: "duration",
    hpiOrder: ["onset", "duration", "mass_description", "reducibility", "aggravating_mass", "dragging_backache", "menstrual_status", "progression", "prior_treatment", "prior_investigations"],
  },
};
