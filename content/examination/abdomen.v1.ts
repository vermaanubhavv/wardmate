import type { ExamChecklist, ExamItem } from "@/lib/history-check/exam-types";
import { BATES, ebem, HUTCHISONS, MACLEODS, rce } from "@/content/history-trees/_helpers";

/**
 * ABDOMINAL EXAMINATION — v1.0.0. CLINICAL CONTENT: REVIEWED (Dr Anubhav Verma).
 *
 * Inspection, palpation (superficial then deep then organs), percussion, auscultation, and then
 * the parts residents skip: hernial orifices, external genitalia and the rectal examination.
 * Written for both the medical abdomen (organomegaly, ascites, liver disease) and the surgical
 * one (peritonitis, obstruction, lumps).
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

export const abdomenV1: ExamChecklist = {
  id: "abdomen",
  version: "1.0.0",
  title: "Abdominal examination",
  setting: "Adult medicine and surgical ward, north India",
  reviewStatus: "reviewed",
  reviewedBy: "Dr Anubhav Verma",
  references: [
    rce("Does this patient have ascites? How to divine fluid in the abdomen", 1992, "1573754"),
    rce("Physical examination of the liver", 1994, "8196144"),
    rce("Does this patient have splenomegaly?", 1993, "8411607"),
    ebem("Does this adult patient have appendicitis?", 2008, "18763359"),
    ebem("The use of paracentesis in the assessment of the patient with ascites", 2008, "18926597"),
    MACLEODS,
    HUTCHISONS,
    BATES,
  ],
  sections: [
    {
      id: "preparation",
      title: "Preparation and position",
      intro: "Lie the patient flat with one pillow, arms by the sides, exposed from nipples to mid-thigh with the genitalia covered until needed. Ensure a chaperone, warm hands, an empty bladder, and ask where the pain is before touching. Kneel or sit so your forearm is level with the abdomen.",
      items: [
        item("consent_position", "Consent, exposure and position", "Explain, take consent, arrange a chaperone, and expose adequately while preserving dignity. Ask the patient to point to the site of pain, and examine that area last.", "Palpating the painful area first guards the whole abdomen and makes every subsequent finding unreliable.", { normal: "Patient comfortable and adequately exposed." }),
        item("general_look_abd", "General look", "Note whether the patient lies still or restless, the presence of jaundice, pallor, wasting, and whether breathing moves the abdomen.", "Lying absolutely still is seen with peritoneal irritation; restlessness with colic; an abdomen that does not move with respiration is associated with generalised peritonitis.", { normal: "Comfortable, abdomen moves with respiration." }),
        item("peripheral_stigmata_cld", "Peripheral signs of chronic liver disease", "Inspect the hands for palmar erythema, leuconychia, Dupuytren's contracture and flap; the face and chest for spider naevi, jaundice and loss of body hair; and the chest for gynaecomastia.", "More than five spider naevi above the nipple line, palmar erythema and gynaecomastia are associated with chronic liver disease; a coarse flap is associated with hepatic encephalopathy.", d),
      ],
    },
    {
      id: "inspection_abd",
      title: "Inspection",
      items: [
        item("contour", "Contour and symmetry", "Look from the foot of the bed and then tangentially at eye level across the abdomen. Note whether the abdomen is flat, scaphoid, or distended, and whether distension is generalised or localised.", "Generalised distension is classically attributed to fluid, flatus, faeces, fat, a foetus or a mass; localised bulging points to an underlying organ or lump.", { normal: "Abdomen flat and symmetrical, moves with respiration." }),
        item("umbilicus", "Umbilicus", "Note its position, whether the umbilicus is inverted or everted, and any discharge or nodule.", "An everted umbilicus is seen with raised intra-abdominal pressure from ascites or a mass; a hard umbilical nodule is associated with intra-abdominal malignancy.", d),
        item("movement_abd", "Movement with respiration and visible peristalsis", "Watch through several breaths, then look tangentially for visible peristaltic waves and their direction.", "Absent movement with respiration is associated with peritonitis; visible peristalsis with intestinal obstruction, particularly in a thin abdominal wall.", { normal: "No visible peristalsis." }),
        item("scars_stoma", "Scars, stomas and drains", "Identify every scar by name and age, and record stomas, drains, fistulae and sinuses.", "Old scars name previous operations and raise adhesions as a cause of obstruction, which the history often fails to mention.", { normal: "No scars." }),
        item("dilated_veins", "Dilated veins and their direction of flow", "Look for distended veins on the abdominal wall. Empty a segment between two fingers and release one end at a time to establish the direction of flow.", "Veins radiating from the umbilicus with flow away from it are associated with portal hypertension; flow upward over the flanks with inferior vena caval obstruction.", d),
        item("hernial_sites_inspection", "Hernial orifices and cough impulse", "Inspect both groins, the umbilicus and any scar while the patient coughs.", "A bulge appearing on coughing is associated with a hernia, and inspecting during a cough finds hernias that are impalpable at rest.", { normal: "No hernial bulge on coughing." }),
      ],
    },
    {
      id: "palpation_abd",
      title: "Palpation",
      intro: "Kneel to the level of the abdomen, watch the patient's face rather than your hand, and begin furthest from the pain. Superficial palpation in all nine regions, then deep, then the organs.",
      items: [
        item("superficial_palpation", "Superficial palpation", "Using the flat of the hand with gentle flexion at the metacarpophalangeal joints, palpate all nine regions lightly, watching the face for pain. Note tenderness, guarding and any mass.", "Localised tenderness with guarding is associated with inflammation of the underlying organ or of the peritoneum over it.", { normal: "Soft, non-tender, no guarding." }),
        item("deep_palpation", "Deep palpation", "Repeat in all nine regions with firmer pressure, defining any mass by site, size, shape, surface, edge, consistency, mobility, and whether it moves with respiration.", "A mass that moves with respiration arises from an upper abdominal organ; one that does not is more likely retroperitoneal or fixed.", { normal: "No mass palpable." }),
        item("guarding_rigidity", "Guarding, rigidity and rebound", "Distinguish voluntary guarding (which relaxes with distraction) from true involuntary rigidity. Test for peritoneal irritation by percussion tenderness, or by asking the patient to cough, rather than by deep rebound.", "Board-like rigidity is associated with generalised peritonitis; percussion tenderness and pain on coughing detect peritoneal irritation as reliably as rebound while causing far less distress.", { normal: "No guarding, rigidity or percussion tenderness." }),
        item("liver_palpation", "Liver", "Start in the right iliac fossa with the radial border of the index finger parallel to the costal margin. Ask the patient to breathe deeply through the mouth, advancing two centimetres between breaths. Record the span below the costal margin in the mid-clavicular line, the edge, surface, consistency, tenderness and any pulsation or bruit.", "A smooth tender enlarged liver is associated with congestion and with hepatitis; a hard irregular liver with malignant deposits; a pulsatile liver with tricuspid regurgitation; percussion of the upper border is needed because a pushed-down liver can be felt without being enlarged.", { normal: "Liver not palpable, upper border of dullness in the fifth intercostal space." }),
        item("spleen_palpation", "Spleen", "Start in the right iliac fossa and work towards the left costal margin, feeling on inspiration. If not felt, turn the patient towards you into the right lateral position with the left arm across the chest and palpate again, hooking the fingers under the costal margin.", "A mass that enlarges towards the right iliac fossa, moves with respiration, has a notch, is dull to percussion and cannot be felt above is associated with splenomegaly; the left lateral position finds a spleen the supine position misses.", { normal: "Spleen not palpable." }),
        item("kidneys", "Kidneys", "Place one hand in the loin posteriorly and the other anteriorly below the costal margin, and ballot the kidney between them as the patient breathes.", "A ballotable mass that is bimanually palpable and resonant to percussion (because of overlying bowel) is associated with a renal origin, which is how a kidney is distinguished from an enlarged spleen.", { normal: "Kidneys not palpable." }),
        item("aorta_bladder", "Aorta and bladder", "Palpate above the umbilicus in the midline with two hands to assess aortic width and whether pulsation is expansile. Palpate and percuss suprapubically for a distended bladder.", "An expansile rather than transmitted pulsation is associated with an aortic aneurysm; a suprapubic mass that is dull and disappears after catheterisation is a distended bladder.", d),
        item("specific_signs", "Named signs where relevant", "Where appendicitis is suspected, test for tenderness at McBurney's point, Rovsing's sign, and the psoas and obturator tests. Where gallbladder disease is suspected, test for arrest of inspiration on palpation below the right costal margin.", "These signs add to the assessment of right iliac fossa and right upper quadrant pain, but no single one performs well enough alone to decide the question.", d),
      ],
    },
    {
      id: "percussion_abd",
      title: "Percussion",
      items: [
        item("general_percussion", "General percussion note", "Percuss lightly over all regions, noting resonance and any area of dullness.", "A tympanitic abdomen is associated with gaseous distension and obstruction; areas of dullness map organs, masses and fluid.", { normal: "Resonant throughout." }),
        item("shifting_dullness", "Shifting dullness", "Percuss from the midline towards the flank until the note becomes dull, keeping the finger in place. Roll the patient onto the opposite side, wait ten to fifteen seconds for the fluid to move, and percuss again.", "Dullness that becomes resonant after rolling is associated with free fluid in the peritoneal cavity; the pause before re-percussing is what makes the sign reliable.", { normal: "No shifting dullness." }),
        item("fluid_thrill", "Fluid thrill", "With an assistant or the patient's own hand placed edge-on in the midline to damp the abdominal wall, flick one flank and feel for the impulse on the other.", "A fluid thrill is associated with tense ascites, and it appears only with a large volume, so its absence means little.", d),
        item("liver_span_percussion", "Liver span by percussion", "Percuss down the right mid-clavicular line from the chest to find the upper border of dullness, and up from the abdomen to find the lower border. Record the span between them.", "A liver span measured by percussion distinguishes true enlargement from a liver displaced downward by hyperinflation, which is the commonest reason a normal liver is reported as enlarged.", { normal: "Liver span within the expected range." }),
        item("traube_space", "Traube's space", "Percuss the lowest left anterior intercostal space in the anterior axillary line.", "Dullness over an area normally resonant from the gastric bubble is associated with splenic enlargement and with a left pleural effusion.", d),
      ],
    },
    {
      id: "auscultation_abd",
      title: "Auscultation",
      items: [
        item("bowel_sounds", "Bowel sounds", "Listen with the diaphragm just below and to the right of the umbilicus for up to two minutes before calling them absent.", "High-pitched tinkling sounds are associated with mechanical obstruction; absent sounds after adequate listening with paralytic ileus and with peritonitis.", { normal: "Bowel sounds present and normal." }),
        item("bruits", "Bruits", "Listen over the aorta, both renal areas lateral to the midline above the umbilicus, and the femoral arteries.", "A renal bruit is associated with renal artery stenosis; an aortic bruit with aneurysm or atherosclerotic disease.", d),
        item("hepatic_venous_hum", "Hepatic rub and venous hum", "Listen over the liver and around the umbilicus.", "A rub over the liver is associated with tumour, infarct and perihepatitis; a venous hum around the umbilicus with portal hypertension.", d),
        item("succussion_splash", "Succussion splash", "With the patient having taken nothing by mouth for several hours, grasp the hips and shake the abdomen briskly while listening or with the ear close by.", "A splash heard several hours after the last meal is associated with gastric outlet obstruction.", d),
      ],
    },
    {
      id: "completion_abd",
      title: "Completing the examination",
      intro: "These are the parts most often omitted, and each of them regularly changes the answer. Record explicitly whether each was done or deferred, and why.",
      items: [
        item("hernial_orifices", "Hernial orifices", "Examine both groins with the patient standing as well as lying, asking for a cough, and determine whether any swelling is reducible and whether a cough impulse is present.", "A groin hernia that is irreducible and tender is associated with obstruction and with compromise of its contents, which changes the urgency entirely.", { normal: "Hernial orifices free." }),
        item("external_genitalia", "External genitalia", "With a chaperone and consent, examine the external genitalia, including the testes in men.", "Testicular torsion, epididymo-orchitis and an inguinoscrotal hernia all present with abdominal pain, and are missed when the genitalia are not examined.", { normal: "External genitalia normal." }),
        item("rectal_examination", "Digital rectal examination", "With consent and a chaperone, in the left lateral position with knees drawn up, inspect the perianal skin first, then examine gently with a lubricated gloved finger. Record tone, tenderness, masses, the prostate in men, and the colour of stool and any blood on the glove.", "Rectal examination detects an impacted rectum, a low rectal mass, blood, and tenderness in the pouch, and inspecting the perianal skin first finds the fissure that makes the examination intolerable.", { normal: "Rectal examination deferred, or normal with no mass and no blood." }),
        item("lymph_nodes_abd", "Lymph nodes", "Palpate the supraclavicular fossae and the inguinal nodes.", "A hard left supraclavicular node is associated with intra-abdominal malignancy, and the node is palpated from the abdomen rather than the neck for that reason.", d),
        item("urine_and_charts", "Urine and charts", "Test the urine, and review the temperature, pulse, blood pressure and fluid balance charts before drawing the findings together.", "The charts carry the trend that a single examination cannot show, and in an acute abdomen the trend often matters more than any one finding.", d),
      ],
    },
  ],
};
