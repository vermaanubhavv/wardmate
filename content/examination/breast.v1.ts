import type { ExamChecklist, ExamItem } from "@/lib/history-check/exam-types";
import { BAILEY_LOVE, BATES, HUTCHISONS, MACLEODS } from "@/content/history-trees/_helpers";

/**
 * BREAST EXAMINATION — v1.0.0. CLINICAL CONTENT: PENDING CLINICIAN REVIEW.
 *
 * Consent and a chaperone, inspection in several positions, palpation of the normal breast
 * first and then the symptomatic one, the lump described by its characteristics, and then the
 * axillary and supraclavicular nodes, the arm and the rest of the body. Women in north India
 * often present late with large lumps, so fixity, skin involvement and nodes are examined with
 * care every time.
 *
 * Each item says how to elicit the sign and what it is associated with. Nothing names a
 * treatment, and nothing tells the reader what the patient has.
 */
const item = (
  id: string,
  label: string,
  how: string,
  significance: string,
  extra: Partial<Pick<ExamItem, "normal" | "tier">> = {}
): ExamItem => ({ id, label, how, significance, ...extra });

const d = { tier: "detailed" as const };

export const breastV1: ExamChecklist = {
  id: "breast",
  version: "1.0.0",
  title: "Breast examination",
  setting: "Surgical and gynaecology wards, north India",
  reviewStatus: "pending_clinician_review",
  reviewedBy: null,
  references: [BAILEY_LOVE, MACLEODS, HUTCHISONS, BATES],
  sections: [
    {
      id: "preparation_br",
      title: "Consent, chaperone and exposure",
      intro: "Examine both breasts every time, with the woman sitting and then lying, exposed to the waist with a sheet available between stages.",
      items: [
        item("consent_chaperone_br", "Consent and chaperone", "Explain the examination, take explicit verbal consent, and ensure a chaperone is present throughout. Record the chaperone's name.", "Consent and a chaperone protect the patient's dignity and the examiner, and are required for every breast examination.", { normal: "Consent taken, chaperone present." }),
        item("exposure_br", "Exposure and position", "Sit her upright on the edge of the bed, exposed to the waist, with good light, facing you.", "Inadequate exposure hides asymmetry and skin changes in the lower half of the breast.", { normal: "Adequately exposed, sitting upright." }),
      ],
    },
    {
      id: "inspection_br",
      title: "Inspection",
      intro: "Inspect with the arms by the sides, then raised above the head, then with hands pressed on the hips to contract the pectorals, and leaning forward if the breasts are large.",
      items: [
        item("symmetry_br", "Size, shape and symmetry", "Compare the two breasts for size, shape, level and contour with the arms by the sides.", "New asymmetry, or one breast raised or distorted, is associated with an underlying mass or with tethering by a malignant process.", { normal: "Breasts symmetrical." }),
        item("arms_raised_br", "Arms raised above the head", "Ask her to raise both arms slowly above her head and watch the lower half of the breasts and the inframammary folds.", "Raising the arms shows dimpling and tethering that is hidden at rest, and lifts the inframammary fold into view.", d),
        item("hands_hips_br", "Hands pressed on the hips", "Ask her to press her hands firmly into her hips to contract the pectoralis major, and watch for movement of any lump.", "A lump that moves with pectoral contraction or a breast that lifts unequally is associated with fixity to the muscle.", d),
        item("skin_br", "Skin", "Look for dimpling, puckering, redness, peau d'orange, ulceration, nodules and dilated veins.", "Peau d'orange and skin nodules are associated with advanced malignancy involving the dermal lymphatics; redness with warmth is associated with infection and also with inflammatory carcinoma.", { normal: "Skin normal." }),
        item("nipple_inspection_br", "Nipple and areola", "Compare both nipples for level, direction, retraction, destruction, discharge and eczematous change of the areola.", "Recent nipple retraction or deviation is associated with an underlying malignancy; eczema of the nipple that spreads to the areola is associated with Paget's disease; slit-like retraction is more often associated with duct ectasia.", { normal: "Nipples normal and symmetrical." }),
        item("visible_lump_br", "Visible lump", "Note the site of any visible swelling using the quadrant and clock face.", "A visible lump is described fully on palpation and its site recorded as a clock position and distance from the nipple.", d),
      ],
    },
    {
      id: "palpation_br",
      title: "Palpation",
      intro: "Lie her at forty-five degrees with the arm on the examined side behind her head so the breast spreads over the chest wall. Examine the normal side first, with the flat of the fingers, quadrant by quadrant.",
      items: [
        item("normal_side_br", "Normal breast first", "Palpate the asymptomatic breast first to learn the normal texture for this patient.", "The texture of the normal breast is the baseline against which a lump or nodularity on the other side is judged.", d),
        item("quadrants_br", "All four quadrants", "Using the flat of the fingers with gentle rotatory pressure, palpate the upper outer, lower outer, lower inner and upper inner quadrants, then the retroareolar region.", "A discrete lump in any quadrant is described fully; the upper outer quadrant holds the most breast tissue and is where most lumps are found.", { normal: "No lump palpable." }),
        item("axillary_tail_br", "Axillary tail", "Palpate the axillary tail of Spence running from the upper outer quadrant towards the axilla.", "A lump in the axillary tail is easily mistaken for an axillary node, and the tail is the area most often missed.", d),
        item("retroareolar_br", "Retroareolar region and nipple discharge", "Palpate beneath the areola, then ask her to express the nipple herself; note the colour and whether it comes from one duct or several.", "Single-duct blood-stained discharge is associated with intraduct papilloma and with malignancy; multiduct greenish discharge with duct ectasia; milky discharge from both sides with hyperprolactinaemia.", { normal: "No discharge." }),
      ],
    },
    {
      id: "lump_br",
      title: "Characteristics of a lump",
      items: [
        item("lump_site_size", "Site and size", "Record the quadrant, the clock position and distance from the nipple, and measure both diameters with calipers or a tape.", "Size and site recorded precisely are what allow change to be judged on the next examination.", { normal: "No lump." }),
        item("lump_shape_surface", "Shape, surface and margin", "Feel whether the lump is round or irregular, smooth or nodular, and whether its edge is well defined.", "An irregular, poorly defined lump is associated with malignancy; a smooth well-defined mobile lump in a young woman with fibroadenoma.", d),
        item("lump_consistency", "Consistency and tenderness", "Judge whether the lump is soft, cystic, firm, rubbery or hard, and whether the lump is tender or warm.", "A hard lump is associated with malignancy; a rubbery lump with fibroadenoma; a tender warm fluctuant lump with abscess; a smooth tense lump with a cyst.", d),
        item("fixity_skin", "Fixity to skin", "Try to pinch the skin over the lump and move the lump beneath it.", "Skin that cannot be lifted off the lump, or that dimples when the lump is moved, is associated with malignant tethering or infiltration.", d),
        item("fixity_muscle", "Fixity to pectoralis major", "With the hands relaxed, move the lump along and across the muscle fibres; repeat with the hands pressed on the hips.", "A lump that moves freely when the muscle is relaxed but not when the muscle is contracted is associated with fixity to the pectoralis major.", d),
        item("fixity_chest_wall", "Fixity to chest wall", "With the pectoral relaxed, try to move the lump over the ribs.", "A lump that cannot be moved even with the muscle relaxed is associated with chest wall involvement, which changes the stage.", d),
        item("mobility_br", "Mobility within the breast", "Move the lump between two fingers within the breast tissue.", "A lump that slips away under the fingers is associated with fibroadenoma, classically called a breast mouse.", d),
      ],
    },
    {
      id: "nodes_br",
      title: "Lymph nodes",
      intro: "Support the patient's arm on your forearm so the axillary muscles relax, and examine each group in turn with the opposite hand.",
      items: [
        item("axilla_anterior_br", "Anterior (pectoral) nodes", "Palpate behind the lateral border of the pectoralis major.", "Enlarged, hard or matted nodes are associated with spread from a breast malignancy; soft tender nodes with infection.", { normal: "Axillary nodes not palpable." }),
        item("axilla_central_br", "Central and apical nodes", "Push the fingers high into the apex of the axilla and press against the chest wall.", "Apical nodes are the highest axillary group, and involvement is associated with more advanced spread.", d),
        item("axilla_posterior_lateral_br", "Posterior and lateral nodes", "Palpate along the anterior border of the latissimus dorsi from behind, and along the upper humerus.", "Palpating every group finds nodes that a single sweep of the axilla misses.", d),
        item("supraclavicular_br", "Supraclavicular and infraclavicular nodes", "Stand behind the seated patient and palpate both supraclavicular fossae and below the clavicle.", "A palpable supraclavicular node is associated with advanced regional spread.", { normal: "Supraclavicular nodes not palpable." }),
        item("contralateral_axilla_br", "Opposite axilla", "Examine the other axilla the same way.", "Nodes in the opposite axilla are associated with spread across the midline or with a separate process.", d),
      ],
    },
    {
      id: "completion_br",
      title: "Completing the examination",
      items: [
        item("contralateral_breast_br", "Contralateral breast", "Examine the other breast fully in the same sequence if not already done.", "A second lump in the opposite breast is found only when the opposite breast is examined as carefully as the symptomatic one.", { normal: "Contralateral breast normal." }),
        item("arm_oedema_br", "Arm oedema and venous engorgement", "Compare both arms for swelling, pitting and dilated veins, measuring the circumference at a fixed point if swollen.", "Arm oedema is associated with axillary lymphatic obstruction by nodes, and with the effects of previous axillary surgery or radiotherapy.", d),
        item("metastatic_screen_br", "Liver, spine, chest and bones", "Palpate the liver, percuss the spine for tenderness, examine the chest for an effusion, and ask about focal bone pain.", "Hepatomegaly, spinal tenderness and a pleural effusion are associated with distant spread, and each is looked for before staging.", d),
      ],
    },
  ],
};
