import type { ExamChecklist, ExamItem } from "@/lib/history-check/exam-types";
import { BATES, ebem, HUTCHISONS, MACLEODS, rce } from "@/content/history-trees/_helpers";

/**
 * RESPIRATORY SYSTEM EXAMINATION — v1.0.0. CLINICAL CONTENT: REVIEWED (Dr Anubhav Verma).
 *
 * Inspection, palpation, percussion, auscultation, done front and back and always comparing
 * side with side at the same level. Tuberculosis is the background against which every chronic
 * respiratory finding is read in north India, so apical signs and old fibrotic change carry
 * more weight here than in the Anglo-American textbooks.
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

export const respiratoryV1: ExamChecklist = {
  id: "respiratory",
  version: "1.0.0",
  title: "Respiratory system examination",
  setting: "Adult medicine ward, north India",
  reviewStatus: "reviewed",
  reviewedBy: "Dr Anubhav Verma",
  references: [
    ebem("Diagnosing pneumonia by medical history and physical examination", 2005, "16278969"),
    rce("Does this patient have an exudative pleural effusion? The Rational Clinical Examination systematic review", 2014, "24938565"),
    rce("Does this patient have clubbing?", 2001, "11466101"),
    MACLEODS,
    HUTCHISONS,
    BATES,
  ],
  sections: [
    {
      id: "general",
      title: "General observation",
      intro: "Sit the patient at 45 degrees with the chest fully exposed, in good light. Much of this examination is decided at the foot of the bed, before any hand touches the chest.",
      items: [
        item("respiratory_rate", "Respiratory rate and pattern", "Count for a full sixty seconds while appearing to feel the pulse, so the patient does not alter the breathing. Note whether breathing is regular, periodic, deep and sighing, or shallow.", "A raised rate is among the earliest signs of respiratory and systemic illness; deep sighing breathing is seen with metabolic acidosis; periodic breathing with severe cardiac failure and with brainstem lesions.", { normal: "Respiratory rate 16 per minute, regular." }),
        item("work_of_breathing", "Work of breathing", "Look for use of sternocleidomastoid and other accessory muscles, intercostal and supraclavicular indrawing, nasal flaring, pursed-lip breathing, and whether the patient can complete a sentence in one breath.", "Increased work of breathing is a more reliable marker of severity than the rate alone, and an inability to complete a sentence marks severe airflow limitation or severe breathlessness of any cause.", { normal: "No increased work of breathing, speaks in full sentences." }),
        item("cyanosis_clubbing", "Central cyanosis and clubbing", "Inspect the tongue and buccal mucosa in natural light for central cyanosis. Assess clubbing by the profile angle, nail-bed fluctuation and the window test.", "Central cyanosis is seen with significant hypoxaemia; clubbing in a respiratory context is associated with bronchiectasis, lung abscess, empyema, interstitial fibrosis and lung cancer, and notably not with uncomplicated airway disease.", { normal: "No central cyanosis, no clubbing." }),
        item("co2_retention", "Flap and peripheral signs of carbon dioxide retention", "Ask the patient to extend the arms with wrists dorsiflexed and fingers spread, and hold for thirty seconds. Feel the hands for warmth and note a bounding pulse.", "A coarse irregular flap with warm hands and a bounding pulse is associated with carbon dioxide retention; a similar flap is seen in liver and kidney failure, so the finding is read with the rest of the picture.", d),
        item("sputum_bedside", "Sputum and the bedside", "Look in the sputum cup and record volume, colour, consistency, whether it layers on standing, and whether blood is present. Note oxygen delivery, inhalers, nebulisers and a chest drain.", "Copious purulent sputum that layers is associated with bronchiectasis and lung abscess; rusty sputum with pneumococcal pneumonia; frothy pink sputum with pulmonary oedema; blood-streaked sputum requires its own history.", d),
        item("lymph_nodes", "Cervical and supraclavicular nodes", "Palpate from behind through all cervical groups and both supraclavicular fossae, recording size, consistency, tenderness, matting and fixity.", "Hard or matted supraclavicular nodes are associated with malignancy including lung primary; firm matted tender cervical nodes with tuberculosis.", { normal: "No palpable cervical or supraclavicular lymph nodes." }),
      ],
    },
    {
      id: "inspection",
      title: "Inspection of the chest",
      items: [
        item("chest_shape", "Shape and symmetry", "View the chest from the front, the sides and from above and behind. Note the anteroposterior to transverse diameter, and look for barrel shape, pectus deformity, kyphoscoliosis, and flattening or indrawing of one side.", "A barrel-shaped chest is seen with hyperinflation; flattening with underlying fibrosis or collapse; kyphoscoliosis restricts ventilation mechanically and alters every other finding.", { normal: "Chest bilaterally symmetrical, normal shape." }),
        item("movement_inspection", "Respiratory movement", "Watch both sides through several breaths from the foot of the bed and from the side, comparing upper, middle and lower zones.", "Reduced movement on one side is seen with effusion, collapse, consolidation, pneumothorax and fibrosis on that side, and it localises the abnormality before the hands are used.", { normal: "Chest moves equally on both sides." }),
        item("scars_veins_sinuses", "Scars, dilated veins and sinuses", "Inspect for surgical scars, chest drain sites, dilated veins over the chest wall, and discharging sinuses.", "Dilated veins over the chest wall with a fixed direction of flow are associated with superior vena caval obstruction; a chest wall sinus is associated with chronic empyema and tuberculosis.", d),
        item("trachea_inspection", "Position of the trachea by inspection", "Look at the suprasternal notch to see whether the trachea appears central before palpating.", "A visibly deviated trachea localises mediastinal shift, and looking first makes the palpation gentler and more accurate.", d),
      ],
    },
    {
      id: "palpation",
      title: "Palpation",
      items: [
        item("trachea_palpation", "Tracheal position", "Warn the patient. With the neck slightly flexed and relaxed, place the index and ring fingers on each sternoclavicular joint and the middle finger in the suprasternal notch, feeling the space on each side of the trachea. Be gentle — the manoeuvre is uncomfortable.", "The trachea is pulled towards collapse and fibrosis, and pushed away by a large effusion, tension pneumothorax and a mediastinal mass; it reflects the upper mediastinum.", { normal: "Trachea central." }),
        item("apex_position", "Apex beat", "Locate the apex beat as the lowermost outermost point of the cardiac impulse.", "The apex reflects the lower mediastinum, and together with the trachea it tells whether the mediastinum has shifted and in which direction.", { normal: "Apex beat in the fifth intercostal space, medial to the mid-clavicular line." }),
        item("chest_expansion", "Chest expansion", "Grip the chest with fingers around the sides and thumbs lifted off the skin near the midline, front then back, upper then lower. Ask for a deep breath and watch how far each thumb moves from the midline. Measure with a tape at the level of the nipples if quantifying.", "Reduced expansion on one side localises disease to that side; symmetrically reduced expansion is seen with hyperinflation, fibrosis and neuromuscular weakness.", { normal: "Chest expansion equal and adequate on both sides." }),
        item("vocal_fremitus", "Tactile vocal fremitus", "Place the ulnar border or the flat of the hand on the chest wall and ask the patient to say a resonant phrase repeatedly. Compare the same point on both sides, working down the chest front and back.", "Fremitus is increased over consolidation, and decreased or absent over effusion, pneumothorax, collapse with a blocked bronchus, and a thick chest wall.", { normal: "Vocal fremitus equal on both sides." }),
        item("chest_wall_tenderness", "Chest wall tenderness and crepitus", "Press systematically over the ribs, costochondral junctions and sternum, and feel for crackling under the skin.", "Localised tenderness is associated with rib fracture, costochondritis and chest wall infiltration; subcutaneous crepitus with pneumothorax and with air tracking from the airway.", d),
      ],
    },
    {
      id: "percussion",
      title: "Percussion",
      intro: "Percuss with the middle finger of the left hand flat on the chest, striking its middle phalanx with the right middle finger from the wrist. Always compare the same level on the two sides before moving down, and include the axillae, the clavicles and the back.",
      items: [
        item("percussion_note", "Percussion note", "Work from apex to base, comparing side with side at each level, then the axillae. Percuss the clavicle directly. Classify the note as resonant, dull, stony dull, or hyperresonant.", "A stony dull note is associated with pleural effusion; a dull note with consolidation, collapse and fibrosis; a hyperresonant note with pneumothorax and with hyperinflation.", { normal: "Resonant note in all areas, equal on both sides." }),
        item("liver_dullness", "Upper border of liver dullness", "Percuss down the right mid-clavicular line and note the level at which resonance becomes dull.", "A liver dullness pushed down is seen with hyperinflation; obliterated liver dullness is associated with free gas under the diaphragm.", d),
        item("cardiac_dullness", "Cardiac dullness", "Percuss from the left axilla towards the sternum in the third, fourth and fifth spaces.", "Obliterated cardiac dullness is seen with hyperinflation and with a left-sided pneumothorax; increased dullness with cardiac enlargement and pericardial effusion.", d),
        item("diaphragmatic_excursion", "Diaphragmatic excursion", "Percuss the lower border of resonance posteriorly in full expiration and again in full inspiration, and measure the difference.", "Reduced excursion is seen with hyperinflation, effusion, diaphragmatic palsy and abdominal distension.", d),
        item("tidal_shift", "Shifting dullness of the chest", "Where an effusion is suspected, percuss the upper limit of dullness with the patient sitting, then lying on the opposite side, and compare.", "A dullness that shifts with position is associated with free pleural fluid, as opposed to a loculated collection or a solid mass.", d),
      ],
    },
    {
      id: "auscultation",
      title: "Auscultation",
      items: [
        item("breath_sounds", "Breath sounds: intensity and character", "Use the diaphragm, asking the patient to breathe deeply through an open mouth. Compare the same point on both sides, front, axillae and back, including the apices. Decide whether breath sounds are vesicular or bronchial, and whether they are normal, reduced or absent.", "Bronchial breathing is associated with consolidation and with the top of an effusion; reduced or absent breath sounds with effusion, pneumothorax, collapse, and with severe airflow limitation.", { normal: "Normal vesicular breath sounds heard equally on both sides." }),
        item("added_sounds_crackles", "Crackles", "Note their timing in the respiratory cycle, whether they are fine or coarse, whether they clear on coughing, and their distribution.", "Fine late-inspiratory crackles at the bases are associated with pulmonary oedema and interstitial fibrosis; coarse crackles that change with coughing with retained secretions and bronchiectasis; localised crackles with consolidation.", { normal: "No added sounds." }),
        item("added_sounds_wheeze", "Wheeze and rhonchi", "Note whether the wheeze is inspiratory or expiratory, high or low pitched, and whether the wheeze is heard over the whole chest or in one area.", "Widespread expiratory wheeze is associated with airflow obstruction; a fixed localised monophonic wheeze with a single narrowed airway, including a tumour or a foreign body; inspiratory stridor points to the upper airway and is an airway emergency rather than a chest sign.", { normal: "No wheeze." }),
        item("pleural_rub", "Pleural rub", "Listen over an area of pleuritic pain through the respiratory cycle for a creaking sound present in both phases that does not clear with coughing.", "A pleural rub is associated with pleural inflammation from pneumonia, pulmonary infarction, tuberculosis and connective-tissue disease.", d),
        item("vocal_resonance", "Vocal resonance, whispering pectoriloquy and aegophony", "Auscultate while the patient repeats a resonant phrase, then whispers it, comparing both sides.", "Increased vocal resonance with clearly audible whispered speech is associated with consolidation; reduced resonance with effusion and pneumothorax; a bleating quality at the upper level of an effusion is aegophony.", d),
        item("post_tussive", "Post-tussive findings", "Auscultate a suspicious area, ask the patient to cough, and listen again.", "Crackles appearing or clearing after coughing are associated with retained secretions and with cavitating apical disease, which is where tuberculosis is found.", d),
      ],
    },
    {
      id: "completion_resp",
      title: "Completing the examination",
      items: [
        item("apices_back", "Apices and the back", "Never finish without sitting the patient forward and examining the back and both apices, including percussion of the clavicles and the supraspinous fossae.", "Apical disease, including tuberculosis, and small basal effusions are missed when only the front of the chest is examined.", { normal: "Posterior chest and apices clear." }),
        item("peak_flow_saturation", "Bedside measurements", "Record oxygen saturation with the delivered oxygen noted, and peak expiratory flow rate where airflow obstruction is in question.", "Saturation recorded without stating the inspired oxygen is uninterpretable, and a normal saturation on high-flow oxygen can conceal severe disease.", { normal: "Saturation within the expected range on room air." }),
        item("cardiac_abdomen", "Heart and abdomen", "Examine the cardiovascular system, and palpate the abdomen for liver enlargement.", "Cardiac and respiratory causes of breathlessness coexist often enough that examining only one system regularly produces the wrong answer.", d),
      ],
    },
  ],
};
