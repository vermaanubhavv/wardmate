import type { HistoryTree } from "@/lib/history-check/types";
import { BAILEY_LOVE, BROWSE, commonHpi, DAS_CLINICAL_SURGERY, HAMILTON_BAILEY, IMMUNOCOMPROMISE, surgicalBackground, val, yn } from "@/content/history-trees/_helpers";

/**
 * DISCHARGING SINUS / FISTULA — v1.0.0. CLINICAL CONTENT: PENDING REVIEW.
 * Adult surgical ward, north India. Built from S. Das, A Manual on Clinical Surgery, 13th ed.,
 * ch. 5 (history: since birth, abscess that burst or was opened, bone chips, earlier gland
 * swelling, previous operation, TB / Crohn's / colitis, family history, number and position of
 * openings, what comes out). docs/surgical-history.md §10.
 *
 * Partial homes already exist — `bone_swelling` (osteomyelitic sinus), `anorectal_pain`
 * (fistula in ano, pilonidal) — but none takes the opening itself as the complaint. Differentials:
 * congenital (preauricular, branchial), osteomyelitic, tuberculous, fistula in ano, pilonidal,
 * Crohn's / colitis, actinomycosis, foreign-body or stitch sinus, fistula into a hollow organ,
 * chronic empyema, fistula with an underlying growth.
 */
export const sinusFistulaV1: HistoryTree = {
  id: "sinus_fistula",
  version: "1.0.0",
  complaint: "Discharging sinus / fistula",
  triggers: ["discharging sinus", "sinus tract", "fistula", "discharging opening", "pus from opening", "opening discharging", "non healing opening", "stitch sinus", "preauricular sinus", "branchial fistula", "faecal fistula", "urinary fistula", "nasoor", "nasur"],
  setting: "Adult surgical ward, north India",
  reviewStatus: "pending_clinician_review",
  reviewedBy: null,
  references: [DAS_CLINICAL_SURGERY, HAMILTON_BAILEY, BAILEY_LOVE, BROWSE],
  slots: [
    ...commonHpi("discharge"),
    val("hpi", "sinus_site", "Site of the opening", "Where is the opening — in front of the ear, the side of the neck, the jaw, the armpit, the groin, around the anus, the cleft of the buttocks, over a bone, the loin, or in an old scar?", ["in front of ear", "ear", "neck", "jaw", "armpit", "axilla", "groin", "around anus", "perianal", "buttock cleft", "over the bone", "loin", "chest wall", "scar", "abdomen"], { teach: "Das notes that many sinuses and fistulae are recognised from their position alone — preauricular, branchial, pilonidal, jaw, groin." }),
    yn("hpi", "since_birth", "Present since birth", "Has the opening been there since birth or early childhood?", ["since birth", "from birth", "since childhood", "born with", "always there", "congenital", "appeared later", "not since birth"], { teach: "Das gives the preauricular sinus and branchial fistula as openings present from birth, though often noticed only in early adult life." }),
    val("hpi", "how_it_began", "How it began", "Did it begin as a painful swelling or abscess that burst or was cut open, after an operation or injury, or on its own?", ["abscess", "boil", "swelling burst", "burst", "incised", "cut open", "drained", "after operation", "after injury", "on its own", "painless swelling", "cold abscess", "softened", "lump burst", "slowly softened"], { teach: "Das traces most sinuses to an abscess that burst or was opened; a hot painful abscess and a cold painless one lead to different causes." }),
    yn("hpi", "bone_fever_before", "High fever with bone pain before the opening", "Before the opening appeared, was there high fever followed by pain and swelling in the bone beneath?", ["high fever", "bone pain", "bone swelling", "fever then swelling", "osteomyelitis", "no bone pain"], { tier: "detailed", teach: "Das gives high fever, then bone pain and swelling, then an abscess that bursts, as the story of an osteomyelitic sinus." }),
    val("hpi", "discharge_nature", "What comes out", "What comes out of the opening — thick pus, thin watery or blood-stained fluid, or yellow grains, and does it smell?", ["pus", "thick pus", "watery", "blood stained", "serosanguinous", "yellow grains", "granules", "foul smell"], { teach: "Das reads the discharge: pus in osteomyelitis, blood-stained fluid in tuberculosis, sulphur granules in actinomycosis, and urine, faeces or bile from a fistula into a hollow organ." }),
    val("hpi", "opening_count", "Number of openings", "How many openings are there, and have new ones appeared nearby?", ["one opening", "single", "two openings", "many openings", "multiple", "new opening", "more openings"], { tier: "detailed", teach: "Das notes most sinuses are single, while multiple openings are typical of actinomycosis, Crohn's disease and the watering-can perineum." }),
    yn("hpi", "heals_and_reopens", "Heals and reopens", "Does the opening close for a while and then open and discharge again?", ["heals", "closes", "reopens", "opens again", "on and off", "recurs", "never closes", "keeps discharging"], { teach: "Das lists why a sinus will not stay closed — a foreign body or dead tissue in the depth, poor drainage, a specific infection, or a track that has become lined with skin." }),
    yn("hpi", "bone_pieces_out", "Pieces of bone have come out", "Have small pieces of bone ever come out of the opening?", ["bone pieces", "bone chips", "piece of bone", "sequestrum", "bone came out", "no bone pieces"], { teach: "Das records the passage of bone chips as pointing to dead bone kept at the depth of an osteomyelitic sinus." }),
    yn("hpi", "operation_at_site", "Operation at the same site", "Was there an operation, stitches, a drain or a mesh at or near the site of the opening?", ["operation", "operated", "stitches", "suture", "drain", "mesh", "after surgery", "surgical scar", "no operation here", "joint replacement", "prosthesis", "graft"], { teach: "Das lists a sinus or fistula as a complication of an earlier operation, kept open by a buried stitch or other foreign body." }),
    yn("associated", "sinus_pain", "Pain", "Is the opening or the area around it painful?", ["pain", "painful", "throbbing", "tender", "painless", "no pain"], { tier: "detailed", teach: "Das reads pain with a sinus as fresh inflammation or a blocked opening." }),
    yn("associated", "sinus_fever", "Fever", "Any fever with the discharge?", ["fever", "chills", "rigors", "evening fever", "no fever"]),
    yn("associated", "skin_redness", "Redness of the surrounding skin", "Is the skin around the opening red, warm or swollen?", ["red", "redness", "warm", "swollen", "inflamed", "no redness"], { tier: "detailed" }),
    yn("associated", "previous_gland_swelling", "Gland swelling before the opening", "Before the opening appeared, was there a lump or gland in the neck, armpit or groin at the same place?", ["gland", "glands", "lymph node", "lump in neck", "lump in groin", "lump in armpit", "swelling before", "no lump before"], { teach: "Das records a previous lymph node enlargement, or bone or joint tuberculosis, before a tuberculous sinus formed from a cold abscess." }),
    // Red flags
    yn("red_flag", "viscus_discharge", "Stool, urine or bile from the opening", "Is stool, urine or bile coming out of the opening?", ["stool", "faeces", "urine", "bile", "green fluid", "smells of stool", "no stool or urine"], { teach: "Das defines a fistula as a track into a hollow organ; urine, faeces or bile through the skin keeps the track open and, soon after an operation, changes how quickly the patient needs review." }),
    yn("red_flag", "blocked_collection", "Painful tense swelling with fever around the opening", "Has the discharge stopped while a painful tense swelling builds up around the opening, with fever?", ["discharge stopped", "blocked", "tense swelling", "pus collecting", "throbbing", "fever", "swelling increasing", "no swelling"], { teach: "Das reads pain, fever and redness around a sinus as inflammation or a blocked opening, where pus may be collecting behind it." }),
    yn("red_flag", "bowel_bleeding_change", "Blood in stool or change in bowel habit with an anal opening", "With an opening near the anus, has there been blood or mucus in the stool, or a change in bowel habit?", ["blood in stool", "mucus", "change in bowel habit", "loose stools", "constipation", "bleeding per rectum", "no bowel change"], { teach: "Das notes that colloid carcinoma of the rectum can produce an anal fistula late in its course, and Crohn's disease and ulcerative colitis present with fistulae too." }),
    yn("associated", "weight_loss_sinus", "Weight loss / night sweats", "Any loss of weight, appetite, or night sweats?", ["weight loss", "lost weight", "loss of appetite", "night sweats", "no weight loss"], { teach: "Das links weight loss with a swelling or discharge to a growth or to a cold abscess with generalised tuberculosis." }),
    IMMUNOCOMPROMISE,
    yn("exposure", "tb_history", "Past TB / TB contact", "Has the patient had tuberculosis, or been in contact with someone who had it?", ["tb", "tuberculosis", "koch", "att", "akt", "tb contact", "no tb"], { teach: "Das puts tuberculosis first among the past illnesses that lead to a sinus later in life." }),
    yn("exposure", "bowel_disease_history", "Crohn's disease or ulcerative colitis", "Has the patient been told of Crohn's disease or ulcerative colitis?", ["crohn", "crohns", "ulcerative colitis", "colitis", "inflammatory bowel disease", "ibd", "no bowel disease"], { teach: "Das lists Crohn's disease and ulcerative colitis among the past illnesses prone to produce fistulae, often multiple." }),
    yn("exposure", "family_history_sinus", "Family history", "Has anyone in the family had tuberculosis, Crohn's disease, ulcerative colitis, or a fistula near the anus?", ["family history", "father", "mother", "brother", "sister", "tb in family", "crohn in family", "fistula in family", "no family history"], { tier: "detailed", teach: "Das notes tuberculosis, Crohn's disease, ulcerative colitis and even fistula in ano are often seen in more than one family member." }),
    yn("exposure", "chest_infection_empyema", "Previous pus in the chest", "For an opening on the chest wall, was there earlier pus in the chest or a chest tube?", ["pus in chest", "empyema", "chest tube", "icd", "chest drain", "long chest infection", "no chest infection"], { tier: "detailed", teach: "Das names chronic empyema as a sinus kept open by a thick fibrous wall, which is why the chest is examined with it." }),
    // Hamilton Bailey's Demonstrations of Physical Signs, 19th ed. (docs/surgical-history.md §11)
    yn("associated", "gas_from_opening", "Wind or bubbles from the opening", "Does wind or gas bubble out of the opening?", ["wind", "gas", "air", "bubbles", "passes wind", "no gas"], { tier: "detailed", teach: "Hamilton Bailey treats gas bubbling from an abdominal-wall or perianal opening as a sign of connection with the bowel, so the patient is asked whether wind escapes from it." }),
    yn("hpi", "retained_material", "Something driven in at the site", "Before the opening appeared, did a thorn, splinter, glass, or piece of cloth go into the skin at that place?", ["thorn", "splinter", "glass", "wood", "cloth", "foreign body", "something went in", "pricked", "no injury"], { tier: "detailed", teach: "Hamilton Bailey lists foreign material carried in by an injury, such as clothing, among the causes that keep an abscess cavity discharging through a sinus, so a penetrating injury at the site is asked for." }),
    // Schwartz's Principles of Surgery, 11th ed. (docs/surgical-history.md §12)
    yn("exposure", "radiotherapy_sinus", "Radiotherapy to the area", "Has the area of the opening ever been treated with radiotherapy?", ["radiotherapy", "radiation", "sikai", "cancer treatment", "no radiotherapy"], { tier: "detailed", teach: "Browse lists previous radiation with tuberculosis and Crohn's disease behind a sinus that will not close, and Schwartz lists ionising radiation among the local factors that impair healing." }),
    ...surgicalBackground({ omit: ["surg_weight_loss", "surg_family_illness"] }),
  ],
  differentials: [
    { id: "congenital", name: "Congenital sinus or fistula (preauricular, branchial)", pointers: ["since_birth", "sinus_site"], discriminators: ["since_birth", "sinus_site", "discharge_nature", "heals_and_reopens"] },
    { id: "osteomyelitic", name: "Osteomyelitic sinus", pointers: ["bone_pieces_out", "bone_fever_before"], discriminators: ["bone_pieces_out", "bone_fever_before", "sinus_site", "heals_and_reopens", "discharge_nature"] },
    { id: "tuberculous", name: "Tuberculous sinus", pointers: ["previous_gland_swelling", "tb_history", "weight_loss_sinus"], discriminators: ["previous_gland_swelling", "tb_history", "weight_loss_sinus", "discharge_nature", "how_it_began", "family_history_sinus"] },
    { id: "fistula_in_ano", name: "Fistula in ano", pointers: ["sinus_site", "how_it_began"], discriminators: ["sinus_site", "how_it_began", "opening_count", "bowel_disease_history", "bowel_bleeding_change", "gas_from_opening"] },
    { id: "pilonidal", name: "Pilonidal sinus", pointers: ["sinus_site"], discriminators: ["sinus_site", "heals_and_reopens", "how_it_began", "discharge_nature"] },
    { id: "ibd_fistula", name: "Fistula with Crohn's disease or ulcerative colitis", pointers: ["bowel_disease_history", "opening_count"], discriminators: ["bowel_disease_history", "opening_count", "family_history_sinus", "bowel_bleeding_change", "weight_loss_sinus"] },
    { id: "actinomycosis", name: "Actinomycosis", pointers: ["discharge_nature", "opening_count"], discriminators: ["discharge_nature", "opening_count", "sinus_site"] },
    { id: "foreign_body", name: "Foreign-body or stitch sinus", pointers: ["operation_at_site", "heals_and_reopens"], discriminators: ["operation_at_site", "heals_and_reopens", "discharge_nature", "sinus_pain", "retained_material"] },
    { id: "viscus_fistula", name: "Fistula into a hollow organ (bowel, bladder, biliary)", pointers: ["viscus_discharge", "operation_at_site"], discriminators: ["viscus_discharge", "operation_at_site", "discharge_nature", "how_it_began", "gas_from_opening", "radiotherapy_sinus"] },
    { id: "chronic_empyema", name: "Sinus from chronic empyema", pointers: ["chest_infection_empyema"], discriminators: ["chest_infection_empyema", "tb_history", "sinus_site"] },
    { id: "malignant", name: "Fistula with an underlying growth", pointers: ["bowel_bleeding_change", "weight_loss_sinus"], discriminators: ["bowel_bleeding_change", "weight_loss_sinus", "sinus_site", "opening_count", "radiotherapy_sinus"] },
  ],
  output: {
    durationSlot: "duration",
    hpiOrder: ["onset", "duration", "how_it_began", "sinus_site", "since_birth", "bone_fever_before", "discharge_nature", "opening_count", "heals_and_reopens", "bone_pieces_out", "operation_at_site", "progression", "prior_treatment", "prior_investigations"],
  },
};
