import type { ExamChecklist, ExamItem } from "@/lib/history-check/exam-types";
import { BATES, GHAI_PAEDIATRICS, HUTCHISONS, IMNCI, MACLEODS } from "@/content/history-trees/_helpers";

/**
 * PAEDIATRIC EXAMINATION — v1.0.0. CLINICAL CONTENT: PENDING CLINICIAN REVIEW.
 *
 * The child is examined opportunistically: observe and count first while the child is calm,
 * on the mother's lap, and leave the distressing parts (throat, ears, anything painful) to
 * the end. Anthropometry is plotted on a chart, the IMNCI danger signs are checked in every
 * sick child, and development is screened against age.
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

export const paediatricV1: ExamChecklist = {
  id: "paediatric",
  version: "1.0.0",
  title: "Paediatric examination",
  setting: "Paediatrics ward and emergency, north India",
  reviewStatus: "pending_clinician_review",
  reviewedBy: null,
  references: [GHAI_PAEDIATRICS, IMNCI, MACLEODS, HUTCHISONS, BATES],
  sections: [
    {
      id: "approach_paed",
      title: "Approach and observation",
      intro: "Observe before you touch. Count the breathing and look at the child while calm, ideally asleep or on the mother's lap, and do not wake a sleeping child to count the respiratory rate.",
      items: [
        item("approach_by_age", "Approach by age", "Examine an infant or toddler on the mother's lap, warm your hands and stethoscope, use toys to distract, and adapt the order to what the child allows; examine an older child on the couch with a parent present and explain each step.", "A crying struggling child gives an unreliable respiratory rate, chest findings and abdominal examination, so the order of the examination decides how much of it can be trusted.", { normal: "Child settled and cooperative." }),
        item("general_look_paed", "General look — alertness and interaction", "Watch how the child looks at you, plays, feeds, cries and responds to the parent, before any handling.", "A child who is lethargic, not interested in surroundings or has a weak or high-pitched cry is associated with serious illness; a playful child who smiles is reassuring.", { normal: "Alert, active, playful, interacting." }),
        item("rr_full_minute", "Respiratory rate for a full minute", "Count the breaths for a full sixty seconds while the child is calm or asleep, by watching the abdomen or chest, before anything distressing is done.", "Fast breathing by the IMNCI age cut-offs (60 or more below two months, 50 or more from two to twelve months, 40 or more from one to five years) is associated with pneumonia; counting for shorter periods misclassifies because infant breathing is irregular.", { normal: "Respiratory rate within the normal range for age." }),
        item("chest_indrawing", "Chest indrawing and work of breathing", "With the child calm, look at the lower chest wall during inspiration for inward movement, and for nasal flaring, grunting, head bobbing and use of accessory muscles.", "Lower chest wall indrawing is associated with severe pneumonia by IMNCI criteria; grunting and head bobbing with impending respiratory failure.", { normal: "No chest indrawing, no grunting or flaring." }),
      ],
    },
    {
      id: "danger_signs_paed",
      title: "IMNCI general danger signs",
      intro: "Check these in every sick child from two months to five years. Any one of them places the child in the most urgent category.",
      items: [
        item("unable_to_feed", "Unable to drink or breastfeed", "Ask the mother to offer a breastfeed or a drink and watch whether the child can suck or swallow.", "Inability to drink or feed is a general danger sign associated with severe illness.", { normal: "Able to drink and breastfeed." }),
        item("vomits_everything", "Vomits everything", "Ask whether the child keeps anything down, and watch a drink being given.", "Vomiting everything is a general danger sign associated with severe illness and with the risk of rapid dehydration.", { normal: "Not vomiting everything." }),
        item("convulsions_paed", "Convulsions — now or during this illness", "Ask about fits during this illness and look for a convulsion in progress (rhythmic movements, eye deviation, unresponsiveness).", "Convulsions during the current illness are a general danger sign associated with meningitis, cerebral malaria, severe electrolyte disturbance and hypoglycaemia.", { normal: "No convulsions." }),
        item("lethargic_unconscious", "Lethargic or unconscious", "Try to wake the child by talking and gentle touch, and note whether the child stays awake and looks at the mother.", "A child who cannot be woken or is abnormally sleepy is associated with severe illness and needs urgent assessment.", { normal: "Awake and alert." }),
        item("stridor_calm", "Stridor in a calm child", "Listen, with the child calm, for a harsh noise on inspiration.", "Stridor in a calm child is associated with severe upper airway obstruction.", { normal: "No stridor." }),
      ],
    },
    {
      id: "anthropometry_paed",
      title: "Anthropometry",
      intro: "Measure, then plot on the WHO growth chart for age and sex. A single measurement tells little; the position on the chart and its change over time tell much more.",
      items: [
        item("weight_paed", "Weight", "Weigh the child undressed (or with a known light garment) on a calibrated scale, and record to the nearest ten grams in an infant, a hundred grams in an older child.", "Weight-for-age below minus two standard deviations is associated with underweight; a falling centile over time with faltering growth.", { normal: "Weight plotted between minus two and plus two SD for age." }),
        item("length_height", "Length or height", "Measure recumbent length on an infantometer below two years, and standing height on a stadiometer above two years, with heels, buttocks and occiput against the board.", "Length or height-for-age below minus two standard deviations is associated with stunting from chronic undernutrition or chronic illness.", { normal: "Height plotted between minus two and plus two SD for age." }),
        item("weight_for_height", "Weight-for-height", "Plot weight against length or height on the WHO chart and read the Z-score.", "Weight-for-height below minus three standard deviations is associated with severe acute malnutrition; below minus two with moderate wasting.", { normal: "Weight-for-height between minus two and plus two SD." }),
        item("head_circumference", "Head circumference", "Measure the maximum occipitofrontal circumference with a non-stretch tape over the glabella and occipital protuberance, taking the largest of three readings, and plot on the chart.", "A head circumference crossing centiles upwards is associated with hydrocephalus; below minus two standard deviations with microcephaly.", { normal: "Head circumference within normal centiles for age." }),
        item("muac", "Mid-upper arm circumference", "In a child from six months to five years, measure the circumference of the left upper arm midway between the acromion and olecranon with the arm hanging relaxed, using a MUAC tape.", "A MUAC below 11.5 centimetres (the red zone) is associated with severe acute malnutrition; 11.5 to 12.5 centimetres with moderate malnutrition.", { normal: "MUAC in the green zone." }),
        item("pedal_oedema_paed", "Bilateral pitting oedema of the feet", "Press both thumbs on the dorsum of both feet for three seconds and look for a persisting pit.", "Bilateral pitting oedema of nutritional origin is associated with severe acute malnutrition regardless of weight, and is also seen with nephrotic syndrome and heart failure.", { normal: "No pedal oedema." }),
      ],
    },
    {
      id: "hydration_general_paed",
      title: "Hydration and general physical signs",
      items: [
        item("hydration_status", "Hydration — IMNCI signs", "Assess the general condition (restless and irritable or lethargic), look for sunken eyes, offer a drink to see whether the child drinks eagerly or poorly, and pinch the abdominal skin to see how quickly it returns.", "Two or more of lethargy, sunken eyes, drinking poorly and a very slow skin pinch are associated with severe dehydration; restlessness, eager thirst and a slow skin pinch with some dehydration.", { normal: "No signs of dehydration." }),
        item("perfusion_paed", "Perfusion — capillary refill and peripheries", "Press on the sternum or a fingertip for five seconds and time the return of colour; feel the temperature of the hands and feet and the volume of the pulse.", "Cold extremities, capillary refill over three seconds and a weak fast pulse are associated with shock.", { normal: "Warm peripheries, capillary refill under two seconds." }),
        item("temperature_paed", "Temperature", "Measure axillary temperature with a digital thermometer held for the full time.", "Fever is associated with infection; a low temperature in a young infant is associated with serious illness as often as fever.", { normal: "Afebrile." }),
        item("pallor_paed", "Pallor", "Look at the palms, nail beds, conjunctivae and tongue, comparing the child's palm with your own or the mother's.", "Severe palmar pallor is associated with severe anaemia; some palmar pallor with anaemia, common with nutritional deficiency, malaria and hookworm in India.", { normal: "No pallor." }),
        item("jaundice_paed", "Jaundice", "Look at the sclerae and skin in daylight.", "Jaundice in a child is associated with hepatitis, haemolysis and, in the newborn period, with physiological or pathological hyperbilirubinaemia.", { normal: "No icterus." }),
        item("rash_paed", "Rash and skin", "Examine the whole skin, blanching any spots with a glass, and look for signs of vitamin deficiency, scabies and skin infections.", "A non-blanching petechial or purpuric rash in a febrile child is associated with meningococcal sepsis and other serious infection; flaky-paint dermatosis with severe malnutrition.", { normal: "No rash." }),
        item("lymph_nodes_paed", "Lymph nodes", "Palpate the cervical, axillary and inguinal groups.", "Small mobile cervical nodes are common in healthy children; large, matted or generalised nodes are associated with tuberculosis, HIV and malignancy.", d),
        item("vaccination_scar", "BCG scar and immunisation card", "Look at the left upper arm for the BCG scar and check the immunisation card against the national schedule.", "Missed vaccinations are associated with preventable disease such as measles and diphtheria, and the missed doses become a question to raise with the family.", d),
        item("signs_deficiency", "Signs of micronutrient deficiency", "Look for Bitot's spots and conjunctival xerosis, angular cheilitis, bowing of the legs, rachitic rosary, widened wrists and hair changes.", "Bitot's spots are associated with vitamin A deficiency; a rachitic rosary and widened wrists with rickets.", d),
      ],
    },
    {
      id: "development_paed",
      title: "Development screen",
      intro: "Screen against age in all four domains and correct for prematurity up to two years.",
      items: [
        item("gross_motor", "Gross motor", "Observe head control, sitting, standing and walking against expected ages (head holding by about three months, sitting without support by about eight months, walking by about fifteen months).", "Failure to reach a milestone by its upper age limit is associated with developmental delay and warrants a formal assessment.", { normal: "Gross motor milestones appropriate for age." }),
        item("fine_motor", "Fine motor and vision", "Offer a small object and watch reach, grasp, transfer and pincer grip; in older children, scribbling and building blocks.", "Persistent fisting or a hand preference before one year is associated with a motor deficit on the other side.", { normal: "Fine motor milestones appropriate for age." }),
        item("language_hearing", "Language and hearing", "Ask about and observe babbling, words and sentences, and whether the child turns to sound.", "Delayed speech is associated with hearing loss, autism and global delay, and hearing should be assessed in every child with speech delay.", { normal: "Language appropriate for age." }),
        item("social_adaptive", "Social and adaptive", "Look for a social smile, stranger anxiety, waving, feeding self and play, according to age.", "Absent social smile, poor eye contact or loss of acquired skills is associated with autism spectrum disorder and neurodegenerative conditions.", { normal: "Social milestones appropriate for age." }),
      ],
    },
    {
      id: "systemic_paed",
      title: "Systemic examination adapted to the child",
      intro: "Auscultate when the child is quiet, examine the abdomen with the child relaxed on the lap, and leave the throat and ears for last.",
      items: [
        item("respiratory_paed", "Respiratory system", "Auscultate over both sides of the chest front and back with a small diaphragm while the child is quiet, listening for crackles, wheeze and bronchial breathing.", "Transmitted upper-airway sounds are common in infants; focal crackles or bronchial breathing are associated with consolidation.", { normal: "Air entry equal, no added sounds." }),
        item("cardiovascular_paed", "Cardiovascular system", "Count the heart rate, feel the femoral pulses, palpate the apex and listen for murmurs in all areas and at the back.", "Absent or weak femoral pulses are associated with coarctation; a murmur with poor feeding, sweating and failure to thrive with congenital heart disease.", { normal: "Heart sounds normal, no murmur, femorals palpable." }),
        item("abdomen_paed", "Abdomen", "Palpate gently with a warm hand while distracting the child, feeling for liver, spleen, kidneys and masses; the liver edge may be felt normally in infants.", "Hepatosplenomegaly is associated with malaria, kala-azar, haemolytic anaemia and malignancy; a flank mass with Wilms' tumour or neuroblastoma.", { normal: "Soft, non-tender, no organomegaly beyond the normal for age." }),
        item("cns_paed", "Nervous system and meningeal signs", "Assess consciousness with the AVPU scale, the anterior fontanelle in an infant, tone, posture and neck stiffness; in an older child, Kernig's and Brudzinski's signs.", "A bulging fontanelle or neck stiffness is associated with meningitis; neck stiffness is unreliable below eighteen months.", { normal: "Alert, fontanelle flat, no neck stiffness." }),
        item("ent_last", "Ears and throat — last", "With the child held firmly on the parent's lap, examine the ears with an otoscope and the throat with a spatula at the end of the examination. Do not examine the throat when there is stridor with drooling.", "A red bulging tympanic membrane is associated with otitis media; a grey membrane on the tonsils with diphtheria; examining the throat in a child with drooling and stridor risks complete airway obstruction.", d),
      ],
    },
  ],
};
