import type { ExamChecklist, ExamItem } from "@/lib/history-check/exam-types";
import { BATES, GHAI_PAEDIATRICS, IMNCI, MACLEODS } from "@/content/history-trees/_helpers";

/**
 * NEWBORN EXAMINATION — v1.0.0. CLINICAL CONTENT: REVIEWED (Dr Anubhav Verma).
 *
 * Gestation and weight first, then the vital state of the baby, then head to toe, then the
 * hips and reflexes, and the danger signs checked at every contact. Keep the baby warm: examine
 * under a radiant warmer or in the mother's arms, one part uncovered at a time.
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

export const newbornV1: ExamChecklist = {
  id: "newborn",
  version: "1.0.0",
  title: "Newborn examination",
  setting: "Labour room, postnatal ward and neonatal unit, north India",
  reviewStatus: "reviewed",
  reviewedBy: "Dr Anubhav Verma",
  references: [GHAI_PAEDIATRICS, IMNCI, MACLEODS, BATES],
  sections: [
    {
      id: "gestation_weight",
      title: "Gestation, weight and size",
      intro: "Wash hands, warm the hands and the room, and examine the baby quietly between feeds.",
      items: [
        item("birth_weight", "Birth weight", "Weigh the baby naked on a calibrated scale and record to the nearest ten grams.", "Low birth weight (under 2500 grams) and very low birth weight (under 1500 grams) are associated with hypothermia, hypoglycaemia, infection and feeding difficulty.", { normal: "Birth weight 2500 grams or more." }),
        item("gestational_age", "Gestational age", "Take the gestation from the dates and early scan, and assess it clinically with the New Ballard score (posture, square window, arm recoil, skin, lanugo, plantar creases, breast, ear and genitalia).", "Preterm birth is associated with respiratory distress, apnoea, hypothermia and jaundice; a clinical estimate disagreeing with the dates raises growth restriction or wrong dates.", { normal: "Term by dates and clinical assessment." }),
        item("size_for_dates", "Size for gestational age", "Plot weight, length and head circumference on an intrauterine growth chart for gestation.", "Small for gestational age is associated with placental insufficiency, congenital infection and hypoglycaemia; large for gestational age with maternal diabetes and birth injury.", { normal: "Appropriate for gestational age." }),
        item("length_hc_newborn", "Length and head circumference", "Measure crown-heel length on an infantometer and the maximum occipitofrontal circumference with a non-stretch tape.", "A small head is associated with congenital infection and brain maldevelopment; a large head with hydrocephalus.", d),
      ],
    },
    {
      id: "vital_state",
      title: "Temperature, colour and activity",
      items: [
        item("temperature_newborn", "Temperature", "Measure axillary temperature with a digital thermometer, and feel the feet: warm feet and a normal axillary reading mean the baby is in thermal comfort.", "Axillary temperature below 36.5 °C is associated with hypothermia, which is common, harmful and linked to infection and low birth weight; fever is associated with infection or overheating.", { normal: "Axillary temperature 36.5–37.5 °C, feet warm." }),
        item("colour_newborn", "Colour", "Look at the lips, tongue and trunk in daylight for central cyanosis, pallor and plethora; peripheral blueness of hands and feet in the first day is common.", "Central cyanosis is associated with cardiac or respiratory disease; pallor with blood loss or shock; plethora with polycythaemia.", { normal: "Pink, no central cyanosis." }),
        item("cry_newborn", "Cry", "Listen to the cry during handling.", "A weak, absent or high-pitched cry is associated with sepsis, encephalopathy or hypoglycaemia.", { normal: "Good lusty cry." }),
        item("tone_activity", "Tone, posture and activity", "Observe the resting posture (a term baby lies with limbs flexed), the spontaneous movements, and the response to handling; lift the baby in ventral suspension and watch the head and limbs.", "A floppy baby with an extended posture and reduced movement is associated with sepsis, asphyxia, hypoglycaemia and neuromuscular disease.", { normal: "Flexed posture, active, good tone." }),
        item("suck_feeding", "Suck and feeding", "Watch a breastfeed for attachment and effective suckling, or test the suck with a clean finger.", "A poor or absent suck is associated with sepsis, prematurity and neurological injury, and is an IMNCI sign of possible serious bacterial infection.", { normal: "Good suck, feeding well." }),
        item("respiration_newborn", "Respiratory rate and distress", "Count the breathing for a full minute with the baby quiet, and look for chest indrawing, grunting, nasal flaring and apnoea.", "A rate of 60 or more, severe chest indrawing or grunting is associated with respiratory distress and possible serious bacterial infection.", { normal: "Respiratory rate under 60, no distress." }),
        item("heart_newborn", "Heart rate and murmurs", "Count the heart rate and listen over the praecordium and back for murmurs.", "A soft murmur in the first days may be transitional; a murmur with cyanosis, poor feeding or weak femorals is associated with congenital heart disease.", d),
      ],
    },
    {
      id: "head_face",
      title: "Head, face and mouth",
      items: [
        item("fontanelle", "Anterior fontanelle", "With the baby quiet and upright, feel the anterior fontanelle for size and tension.", "A bulging tense fontanelle is associated with raised intracranial pressure from meningitis or haemorrhage; a sunken one with dehydration; a very large one with hypothyroidism or raised pressure.", { normal: "Anterior fontanelle open, soft and flat." }),
        item("sutures", "Sutures", "Run the fingers along the sagittal, coronal and lambdoid sutures, feeling for overriding, wide separation or a ridge.", "Overriding sutures are common after vaginal birth; widely separated sutures are associated with raised intracranial pressure; a fused ridge with craniosynostosis.", d),
        item("caput_cephalhaematoma", "Caput and cephalhaematoma", "Feel any scalp swelling and note whether it crosses the suture lines and whether the swelling is soft and pitting or tense.", "A soft swelling crossing sutures is associated with caput succedaneum; a tense swelling limited by a suture line with cephalhaematoma, which adds to jaundice; a boggy swelling spreading across the whole scalp with subgaleal haemorrhage, which can cause shock.", { normal: "No scalp swelling." }),
        item("red_reflex", "Eyes and red reflex", "In a dimmed room, shine an ophthalmoscope at both eyes from about thirty centimetres and look for a symmetrical red reflex; look for discharge and subconjunctival haemorrhage.", "An absent or white reflex is associated with cataract or retinoblastoma; purulent discharge in the first weeks with neonatal conjunctivitis.", { normal: "Red reflex present and symmetrical in both eyes." }),
        item("palate", "Palate", "Look at the palate with a good light and a tongue depressor, and feel along it with a clean finger to the soft palate.", "A cleft palate, particularly a posterior or submucous one, is missed on inspection alone and is associated with feeding difficulty.", { normal: "Palate intact." }),
        item("dysmorphic_features", "Face, ears and dysmorphic features", "Look at the shape of the face, the eyes, the position and form of the ears, the hands and the palmar creases.", "Clusters of dysmorphic features are associated with chromosomal syndromes such as trisomy 21; low-set malformed ears with renal anomalies.", d),
      ],
    },
    {
      id: "trunk_limbs",
      title: "Trunk, limbs, spine and genitalia",
      items: [
        item("clavicles", "Clavicles", "Run the fingers along both clavicles, feeling for a step, crepitus or tenderness, and watch the arm movements.", "A step or crepitus with reduced arm movement is associated with a clavicle fracture after a difficult delivery; a limp arm with brachial plexus injury.", { normal: "Clavicles intact." }),
        item("umbilicus_newborn", "Umbilical cord and stump", "Inspect the cord for the number of vessels at birth, and later the stump for redness spreading on to the skin, discharge or smell.", "A single umbilical artery is associated with other congenital anomalies; redness extending to the skin or pus is associated with omphalitis, an IMNCI sign of local infection.", { normal: "Cord clean and dry, three vessels." }),
        item("abdomen_newborn", "Abdomen", "Inspect for distension and palpate gently for liver, spleen, kidneys and masses.", "Abdominal distension with bilious vomiting is associated with intestinal obstruction; a flank mass with an enlarged kidney.", d),
        item("femoral_pulses", "Femoral pulses", "Palpate both femoral pulses simultaneously with the brachial pulse.", "Weak or absent femoral pulses are associated with coarctation of the aorta, which is otherwise easily missed.", { normal: "Femoral pulses palpable and equal." }),
        item("spine_newborn", "Spine", "Turn the baby prone and run a finger down the whole spine, looking for a dimple, sinus, tuft of hair, swelling or sac over the lower back.", "A sac over the spine is associated with a neural tube defect; a deep sacral dimple or tuft of hair with occult spinal dysraphism.", { normal: "Spine intact, no dimple or sac." }),
        item("anus_patency", "Anus", "Look for an anal opening in the normal position and ask whether meconium has been passed within the first day.", "An absent or displaced anus is associated with anorectal malformation; delayed passage of meconium with Hirschsprung's disease or cystic fibrosis.", { normal: "Anus patent, meconium passed." }),
        item("genitalia_newborn", "Genitalia", "In a boy, look at the position of the meatus and feel for both testes in the scrotum; in a girl, look at the labia and clitoris.", "Undescended testes, hypospadias or ambiguous genitalia are associated with endocrine and genetic conditions; ambiguous genitalia need urgent assessment for adrenal disease.", { normal: "Normal genitalia; both testes descended in a boy." }),
        item("limbs_digits", "Limbs, hands and feet", "Count the fingers and toes, look for talipes, and see whether a positional foot deformity corrects fully with gentle pressure.", "A foot deformity that does not correct passively is associated with structural talipes; extra digits and syndactyly with genetic syndromes.", d),
        item("hips", "Hips — Ortolani and Barlow", "With the baby supine and relaxed, flex the hips and knees to ninety degrees. For Barlow, adduct and push the thigh gently backwards; for Ortolani, abduct the thigh while lifting the greater trochanter forwards. Feel for a clunk, not a click.", "A clunk as the femoral head slips out (Barlow) or back in (Ortolani) is associated with developmental dysplasia of the hip; risk factors include breech, family history and female sex.", { normal: "Hips stable, Ortolani and Barlow negative." }),
      ],
    },
    {
      id: "jaundice_newborn",
      title: "Jaundice",
      items: [
        item("jaundice_zone", "Jaundice by zone", "In daylight, press the skin with a finger to blanch it and note the most distal zone showing yellow (Kramer's zones: face, upper trunk, lower trunk and thighs, legs, palms and soles). Measure bilirubin whenever jaundice is seen.", "Jaundice in the first twenty-four hours, jaundice reaching the palms and soles, or jaundice beyond two weeks in a term baby is associated with pathological causes; visual assessment underestimates bilirubin in dark skin.", { normal: "No jaundice." }),
      ],
    },
    {
      id: "reflexes_newborn",
      title: "Primitive reflexes",
      items: [
        item("moro", "Moro reflex", "Support the baby's head and back, then let the head drop back a few centimetres, and watch for abduction and extension of the arms followed by flexion.", "An absent Moro reflex is associated with depression of the nervous system; an asymmetrical one with brachial plexus injury or a fractured clavicle or humerus.", { normal: "Moro reflex complete and symmetrical." }),
        item("grasp", "Palmar and plantar grasp", "Place a finger in the palm and on the sole and feel the grip.", "An absent grasp is associated with nervous system depression; an asymmetrical grasp with a peripheral nerve or plexus lesion.", { normal: "Grasp present and symmetrical." }),
        item("rooting_sucking", "Rooting and sucking", "Stroke the cheek near the corner of the mouth and watch the baby turn towards it and open the mouth.", "Absent rooting and sucking are associated with prematurity, sedation or encephalopathy and predict feeding difficulty.", { normal: "Rooting and sucking present." }),
      ],
    },
    {
      id: "danger_signs_newborn",
      title: "Danger signs (IMNCI young infant)",
      intro: "Check at every contact. Any one of these signs puts the baby in the possible serious bacterial infection category needing urgent referral.",
      items: [
        item("danger_feeding", "Not feeding well", "Ask whether the baby is feeding and watch a feed.", "Stopping feeding well after feeding normally is associated with possible serious bacterial infection.", { normal: "Feeding well." }),
        item("danger_convulsions", "Convulsions", "Ask about and look for abnormal movements, stiffening, lip-smacking, eye deviation or apnoeic spells.", "Neonatal convulsions are associated with sepsis, meningitis, hypoglycaemia, hypocalcaemia and hypoxic-ischaemic injury.", { normal: "No convulsions." }),
        item("danger_movement", "Movement only when stimulated or no movement", "Watch the baby and note whether movement occurs spontaneously or only on stimulation.", "Movement only on stimulation is associated with possible serious bacterial infection or encephalopathy.", { normal: "Moving spontaneously." }),
        item("danger_temperature", "Temperature 37.5 °C or above, or below 35.5 °C", "Measure the axillary temperature.", "Both fever and a low temperature are associated with possible serious bacterial infection in a young infant.", { normal: "Temperature normal." }),
        item("danger_breathing", "Fast breathing or severe chest indrawing", "Count for a full minute, recount if 60 or more, and look for severe indrawing.", "Fast breathing and severe chest indrawing in a young infant are associated with possible serious bacterial infection.", { normal: "No fast breathing, no severe indrawing." }),
      ],
    },
  ],
};
