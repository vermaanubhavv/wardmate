import type { HistoryTree } from "@/lib/history-check/types";
import { commonHpi, GHAI_PAEDIATRICS, HUTCHISONS, IMNCI, MACLEODS, paedBackground, val, yn } from "@/content/history-trees/_helpers";

/**
 * SICK NEWBORN / NOT FEEDING WELL — v1.0.0. CLINICAL CONTENT: PENDING CLINICIAN REVIEW.
 * Paediatric ward and newborn unit, north India. A newborn has few ways of being ill: it stops
 * feeding, goes quiet, gets cold, turns yellow or blue, or vomits. The same complaint covers
 * infection, a low sugar, a failing heart and a blocked gut, so the history leans on the
 * IMNCI danger signs, the story of the pregnancy and birth, and the timing of each symptom
 * against the baby's age in hours and days. Informant is usually the mother.
 * Differentials: neonatal sepsis (including meningitis), hypothermia, hypoglycaemia,
 * pathological neonatal jaundice, birth asphyxia, congenital heart disease, and surgical
 * causes such as intestinal obstruction presenting with bilious vomiting.
 */
export const sickNewbornV1: HistoryTree = {
  id: "sick_newborn",
  version: "1.0.0",
  complaint: "Sick newborn / not feeding well",
  triggers: ["sick newborn", "sick neonate", "newborn not feeding", "baby not feeding", "not sucking", "poor suck", "neonatal sepsis", "neonatal jaundice", "newborn jaundice", "hypothermia", "hypoglycaemia", "birth asphyxia", "doodh nahi pee raha", "lethargic newborn"],
  setting: "Paediatric ward and newborn unit, north India",
  reviewStatus: "pending_clinician_review",
  reviewedBy: null,
  references: [GHAI_PAEDIATRICS, IMNCI, MACLEODS, HUTCHISONS],
  slots: [
    ...commonHpi("illness"),
    ...paedBackground(),
    val("hpi", "suck_feeding_change", "Sucking and feeding", "How has the baby's feeding changed — sucking weakly, taking less, tiring or sweating during feeds, or stopped altogether?", ["sucking", "suck", "weak suck", "taking less", "tires during feeds", "sweating during feeds", "stopped feeding", "not latching", "latch", "feeding well"]),
    val("hpi", "activity_tone", "Activity and cry", "Is the baby as active as before, with a normal cry, or quieter, floppy, or with a weak or high-pitched cry?", ["active", "less active", "quiet", "floppy", "weak cry", "high pitched cry", "shrill cry", "normal cry", "sleepy", "irritable"]),
    val("hpi", "temperature_felt", "Temperature", "Has the baby felt hot or cold to touch, and was the temperature measured?", ["hot", "cold", "cold to touch", "feet cold", "measured", "thermometer", "fever", "temperature", "warm"], { numeric: true }),
    val("hpi", "meconium_urine", "Meconium and urine", "When did the baby first pass meconium and urine after birth, and how many wet nappies in the past day?", ["meconium", "first stool", "passed stool", "urine", "wet nappies", "nappies", "within twenty four hours", "not passed", "hours"], { numeric: true }),
    yn("associated", "yellow_skin", "Yellow skin or eyes", "Has the baby turned yellow, on which day of life did it start, and how far down the body has it spread?", ["yellow", "jaundice", "peeli", "day of life", "face", "chest", "abdomen", "legs", "spreading"]),
    yn("associated", "vomiting", "Vomiting", "Is the baby vomiting or bringing up feeds, and how often?", ["vomiting", "vomits", "spitting up", "bringing up feeds", "posseting", "after every feed", "milky vomit"]),
    yn("associated", "fast_breathing", "Fast or difficult breathing", "Is the baby breathing fast, grunting, or pulling in at the chest?", ["fast breathing", "grunting", "chest indrawing", "breathing difficulty", "flaring", "noisy breathing", "rapid breathing"]),
    yn("associated", "cord_skin_infection", "Cord or skin infection", "Is the cord stump red, swollen or discharging, or are there pus-filled spots on the skin?", ["cord", "umbilicus", "navel", "red cord", "discharge from cord", "pus", "pustules", "boils", "skin spots"]),
    yn("associated", "abdominal_distension", "Swollen abdomen", "Has the abdomen become swollen or tight?", ["distension", "distended", "swollen abdomen", "tight abdomen", "bloated", "pet phula"]),
    yn("associated", "loose_stools", "Loose stools", "Any loose or watery stools, or blood in the stool?", ["loose stools", "watery stools", "diarrhoea", "blood in stool", "frequent stools"], { tier: "detailed" }),
    // Red flags
    yn("red_flag", "not_feeding_at_all", "Not able to feed", "Has the baby stopped feeding altogether, or is unable to suck at all?", ["not feeding", "stopped feeding", "unable to suck", "not sucking at all", "refusing all feeds", "cannot feed"], { teach: "A newborn who has stopped feeding is an IMNCI danger sign, and in the first weeks of life stopping feeds may be the only sign of serious infection or a low sugar." }),
    yn("red_flag", "convulsions", "Fits", "Has the baby had any fits — jerking, stiffening, lip smacking, cycling movements, or staring spells?", ["fits", "convulsion", "seizure", "jerking", "stiffening", "lip smacking", "cycling", "staring", "twitching", "daura"], { teach: "Fits in a newborn are often subtle, and they raise a low sugar, a low calcium, meningitis and injury around birth, each of which needs its own answer." }),
    yn("red_flag", "moves_only_on_stimulation", "Moves only when stimulated", "Does the baby move only when stimulated, or not move even then?", ["moves only when stimulated", "no movement", "not moving", "unresponsive", "lethargic", "limp", "difficult to wake"], { teach: "Movement only on stimulation is an IMNCI danger sign that marks a baby who needs urgent assessment, whatever the cause turns out to be." }),
    yn("red_flag", "cold_to_touch", "Cold to touch", "Is the baby cold to touch, especially the trunk and not just the hands and feet?", ["cold", "cold to touch", "cold trunk", "cold abdomen", "hypothermia", "low temperature", "thanda"], { teach: "A cold newborn is at risk in its own right and cold is also a way sepsis and a low sugar show themselves, so its cause is worth asking about." }),
    yn("red_flag", "apnoea_severe_breathing", "Pauses in breathing or severe chest indrawing", "Has the baby stopped breathing for spells, turned blue during them, or had severe pulling in of the chest?", ["apnoea", "stops breathing", "pauses in breathing", "severe chest indrawing", "gasping", "blue spells", "grunting"], { teach: "Pauses in breathing and severe indrawing are danger signs that point to sepsis, prematurity or a heart or lung problem, and they change how closely the baby needs watching." }),
    yn("red_flag", "blue_colour", "Blue colour", "Has the baby looked blue around the lips or tongue, at rest or on crying or feeding?", ["blue", "bluish", "cyanosis", "blue lips", "blue tongue", "on crying", "on feeding", "neela"], { teach: "Blueness of the lips and tongue, especially one that worsens on crying, raises congenital heart disease as well as lung disease, and the timing matters to both." }),
    yn("red_flag", "bilious_vomiting", "Green vomiting or no meconium", "Is the vomit green or yellow-green, or has the baby not passed meconium in the first day?", ["green vomit", "bilious", "yellow green vomit", "no meconium", "not passed meconium", "not passed stool", "distended"], { teach: "Green vomiting in a newborn raises intestinal obstruction, including twisting of the gut, and is treated as a surgical question until shown otherwise." }),
    yn("red_flag", "early_or_deep_jaundice", "Jaundice on the first day or reaching palms and soles", "Did the yellow colour appear within the first twenty-four hours, or has it reached the palms and soles?", ["first day", "within twenty four hours", "day one", "palms", "soles", "deep yellow", "very yellow", "yellow stools pale", "pale stools"], { teach: "Jaundice on the first day or spreading to the palms and soles is not the usual physiological pattern, and raises blood group incompatibility, infection and levels that can harm the brain." }),
    yn("red_flag", "bleeding", "Bleeding", "Any bleeding from the cord, in the stool or vomit, or unusual bruising?", ["bleeding", "blood from cord", "blood in vomit", "blood in stool", "bruising", "oozing", "vitamin k not given"], { teach: "Bleeding in a newborn raises sepsis with a clotting problem and vitamin K deficiency, particularly after a home birth." }),
    // Pregnancy, birth and care after birth
    yn("exposure", "maternal_infection_risk", "Infection risk around birth", "Did the mother have fever in labour, leaking of water long before delivery, foul-smelling liquor, or many vaginal examinations?", ["maternal fever", "fever in labour", "leaking", "prom", "waters broke", "foul smelling liquor", "foul liquor", "prolonged labour", "vaginal examinations"], { teach: "Maternal fever, prolonged rupture of membranes and foul liquor are the classic risk factors for early-onset sepsis in the first days of life." }),
    val("exposure", "resuscitation_at_birth", "Resuscitation at birth", "Did the baby need help to breathe at birth — rubbing, bag and mask, or oxygen — and for how long?", ["resuscitation", "bag and mask", "ambu", "oxygen", "did not cry", "delayed cry", "stimulated", "nicu", "meconium stained"], { tier: "detailed" }),
    val("exposure", "maternal_background", "Mother's illnesses in pregnancy", "Did the mother have diabetes, high blood pressure, thyroid disease, or a known blood group problem, and has a previous baby needed treatment for jaundice?", ["diabetes", "gestational diabetes", "high blood pressure", "thyroid", "blood group", "rh negative", "negative blood group", "previous baby jaundice", "sibling jaundice"]),
    val("exposure", "prelacteal_feeds_care", "Prelacteal feeds and cord care", "Was anything other than breast milk given — ghutti, honey, water, animal milk — and was anything applied to the cord?", ["ghutti", "honey", "water", "animal milk", "cow milk", "prelacteal", "bottle", "applied to cord", "ghee", "oil", "cow dung", "nothing applied"]),
    yn("exposure", "sibling_deaths", "Previous newborn deaths", "Has any earlier baby in the family died or been seriously ill in the newborn period?", ["sibling died", "previous baby died", "neonatal death", "earlier child died", "sick in nicu"], { tier: "detailed" }),
  ],
  differentials: [
    { id: "sepsis", name: "Neonatal sepsis (including meningitis)", pointers: ["maternal_infection_risk", "not_feeding_at_all", "moves_only_on_stimulation", "cord_skin_infection", "temperature_felt"], discriminators: ["maternal_infection_risk", "temperature_felt", "cord_skin_infection", "convulsions", "fast_breathing", "prelacteal_feeds_care"] },
    { id: "hypothermia", name: "Hypothermia", pointers: ["cold_to_touch", "temperature_felt"], discriminators: ["cold_to_touch", "temperature_felt", "birth_history", "maternal_infection_risk"] },
    { id: "hypoglycaemia", name: "Hypoglycaemia", pointers: ["not_feeding_at_all", "convulsions", "activity_tone"], discriminators: ["maternal_background", "birth_history", "suck_feeding_change", "convulsions", "cold_to_touch"] },
    { id: "jaundice", name: "Pathological neonatal jaundice", pointers: ["yellow_skin", "early_or_deep_jaundice"], discriminators: ["early_or_deep_jaundice", "yellow_skin", "maternal_background", "suck_feeding_change", "meconium_urine"] },
    { id: "asphyxia", name: "Birth asphyxia (hypoxic brain injury)", pointers: ["resuscitation_at_birth", "convulsions", "activity_tone"], discriminators: ["resuscitation_at_birth", "birth_history", "convulsions", "onset"] },
    { id: "chd", name: "Congenital heart disease", pointers: ["blue_colour", "fast_breathing", "suck_feeding_change"], discriminators: ["blue_colour", "suck_feeding_change", "fast_breathing", "maternal_background", "onset"] },
    { id: "surgical", name: "Surgical cause (intestinal obstruction)", pointers: ["bilious_vomiting", "abdominal_distension", "vomiting"], discriminators: ["bilious_vomiting", "meconium_urine", "abdominal_distension", "vomiting"] },
  ],
  output: {
    durationSlot: "duration",
    hpiOrder: ["onset", "duration", "suck_feeding_change", "activity_tone", "temperature_felt", "meconium_urine", "birth_history", "feeding_nutrition", "progression", "prior_treatment", "prior_investigations"],
  },
};
