import type { FluidTopic } from "@/lib/fluids/types";
import { PANDYA, caution, points, quote, steps, table } from "@/content/fluids/_helpers";

/**
 * RESPIRATORY ACID–BASE DISORDERS — v1.0.0. CLINICAL CONTENT: REVIEWED (Dr Anubhav Verma).
 *
 * Digest of chapter 33 of the full edition, from a text transcription (no page images).
 * Page numbers are the printed book pages. Every number below is the book's; the quotes give
 * the page it came from.
 */
export const respiratoryAcidBaseV1: FluidTopic = {
  id: "respiratory_acid_base",
  version: "1.0.0",
  title: "Respiratory acidosis and alkalosis",
  group: "acid_base",
  summary: "Primary hypercapnia and hypocapnia: definitions, the compensation rules, causes, features, the ABG work-up, controlled oxygen, ventilatory support and why alkali is avoided.",
  setting: "Adult wards, emergency and ICU",
  reviewStatus: "reviewed",
  reviewedBy: "Dr Anubhav Verma",
  references: [PANDYA],
  source: { chapters: ["33 Respiratory Acid-Base Disorders"], pages: "391–400", pageKind: "book" },
  sections: [
    {
      id: "acidosis_definition",
      title: "Respiratory acidosis: definition and renal compensation",
      blocks: [
        points([
          "Respiratory acidosis (primary hypercapnia): a primary rise in PaCO2 above 45 mmHg, pH below 7.35, and a variable compensatory rise in plasma HCO3.",
          "It occurs when effective alveolar ventilation (CO2 excretion by the lung) fails to keep pace with CO2 production.",
          "Acute develops within 48 hours; chronic develops over days to weeks, beyond 48 hours.",
          "Renal compensation is increased urinary H+ secretion with acidic urine and a gradual rise in HCO3. Because it is slow, the rise is small in the acute form and more substantial in the chronic form.",
        ]),
        table(
          ["Form", "HCO3 rise per 10 mmHg rise in PaCO2", "pH fall per 10 mmHg rise in PaCO2"],
          [
            ["Acute respiratory acidosis", "1 mEq/L", "0.1"],
            ["Chronic respiratory acidosis", "4 mEq/L", "0.03"],
          ],
          "Expected compensation (p392)",
          "Serum HCO3 usually does not exceed 38 mEq/L through compensation; above 38 mEq/L think of a concomitant metabolic alkalosis. Table 33.2 (p394) gives the acute pH fall as approximately 0.08 per 10 mmHg, against 0.1 here; both are printed."
        ),
        points([
          "Respiratory acidosis versus metabolic alkalosis: both have a raised PaCO2 and a raised HCO3; pH is low in respiratory acidosis and high in metabolic alkalosis.",
        ]),
        quote("a primary elevation in the PaCo, (>45 mmHg) leading to a reduction in pH (<7.35)", "391"),
        quote("Acute respiratory acidosis occurs rapidly within <48 hours, while chronic respiratory acidosis develops slowly over days to weeks (>48 hours).", "391"),
        quote("Every 10 mm of Hg rise in PaCO₂ causes 1 mEq/L rise in HCO₃ and 0.1 fall in pH.", "392"),
        quote("Every 10 mm Hg rise in PaCO₂ causes a 4 mEq/L rise in HCO₃ and a 0.03 fall in pH.", "392"),
        quote("If HCO₃ is >38 mEq/L, think of concomitant metabolic alkalosis.", "392"),
      ],
    },
    {
      id: "hypercapnia_hypoxaemia",
      title: "Hypercapnia and hypoxaemia",
      blocks: [
        points([
          "In most cases hypoxaemia comes earlier and is more prominent than hypercapnia, because alveolar diffusion of CO2 is 20 times faster than that of O2.",
          "All patients with hypercapnia who are breathing room air are also hypoxic.",
          "In hypoventilation, oxygen corrects the hypoxaemia but the hypercapnia persists.",
          "In chronic hypercapnia, hypoxaemia is the primary stimulus to respiration, so rapid and excessive correction with uncontrolled oxygen can remove the hypoxic drive and cause extreme hypercapnia with neurological symptoms.",
        ]),
        quote("All patients with hypercapnia who are breathing room air are also hypoxic.", "392"),
        quote("In patients with hypoventilation, oxygen therapy corrects hypoxemia, but hypercapnia persists.", "392"),
      ],
    },
    {
      id: "acidosis_causes",
      title: "Respiratory acidosis: causes",
      intro: "CO2 accumulates from inadequate exhalation: hypoventilation, impaired lung function or iatrogenic causes.",
      blocks: [
        table(
          ["Mechanism", "Causes"],
          [
            ["A. Reduced ventilation", "CNS depression: drugs (anaesthesia, sedative), infection, stroke. Neuromuscular impairment: myopathy, myasthenia gravis, polymyositis. Muscular: hypokalaemia, hyperkalaemia. Airway obstruction: severe asthma or laryngospasm, foreign body, aspiration. Miscellaneous: chest wall disorders, severe kyphoscoliosis, obstructive sleep apnoea, obesity hypoventilation syndrome"],
            ["B. Defects in CO2 transport", "Decreased lung perfusion: pulmonary embolism or heart failure. Pulmonary diseases: abnormal gas exchange in COPD, emphysema, ARDS, interstitial lung diseases, severe pneumonitis, pneumothorax, massive pleural effusion"],
            ["C. Iatrogenic", "Hypoventilation due to improper settings of mechanical ventilation"],
            ["D. Increased CO2 production", "Rare, unless ventilation is fixed, in fever, shivering, increased physical activity"],
          ],
          "Table 33.1 Mechanism and causes of respiratory acidosis (hypercapnia)"
        ),
      ],
    },
    {
      id: "acidosis_clinical",
      title: "Respiratory acidosis: clinical features",
      blocks: [
        points([
          "Features depend on the underlying disorder and on the severity and rapidity of onset of hypercapnia; the severity of hypoxaemia also contributes.",
          "Neurological symptoms predominate: cerebral vasodilatation (raised intracranial pressure), neuronal dysfunction from acidaemia, and CNS depression from hypercapnia.",
          "Anxiety and headache early; as pCO2 rises, confusion, somnolence, obtundation and coma (\"CO2 narcosis\"). Twitching, tremors, myoclonus and seizures. Prolonged or severe acidosis may raise intracranial pressure and cause papilloedema.",
          "Lipid-soluble CO2 crosses the blood–brain barrier faster than HCO3, so CSF pH falls more, and CNS features are greater, in acute respiratory acidosis than in acute metabolic acidosis.",
          "Cardiovascular: systemic vasodilatation, reduced myocardial contractility, arrhythmias, cardiovascular instability and even death.",
        ]),
      ],
    },
    {
      id: "acidosis_diagnosis",
      title: "Respiratory acidosis: diagnosis",
      intro: "The aim is to confirm primary respiratory acidosis, find its cause, detect mixed disorders and separate acute from chronic.",
      blocks: [
        steps([
          "History: fever, shortness of breath and cough, pre-existing pulmonary or non-pulmonary conditions that may contribute, and a medication history.",
          "Examination: respiratory rate, pattern and distress; cyanosis; volume status. Auscultate for bilateral air entry, wheeze and crepitations. Neurological examination for neurological causes and for confusion, lethargy and altered sensorium.",
          "Arterial blood gas: confirms the diagnosis and severity, classifies it as acute, acute-on-chronic or chronic, detects mixed disorders (Table 33.2), guides oxygen and ventilation, and monitors the response.",
          "Other laboratory tests: CBC, serum electrolytes (including Ca2+, Mg2+ and phosphate), thyroid function tests and creatine kinase (printed \"creatinine kinase\").",
          "Radiology: chest X-ray, CT or MRI for the underlying cause; brain CT or MRI when a neurological problem is causing hypoventilation.",
          "Pulmonary function tests: to diagnose obstructive lung disease and assess its severity.",
        ]),
        table(
          ["Parameter", "Interpretation"],
          [
            ["Elevated pCO2 (>45 mmHg) and low pH (<7.35)", "Respiratory acidosis; a greater rise in pCO2 and a greater fall in pH suggest more severe acidosis"],
            ["Compensatory change in serum bicarbonate", "Acute: HCO3 rises 1 mEq/L per 10 mmHg rise in PaCO2. Chronic: 4 mEq/L per 10 mmHg, over time"],
            ["Serum bicarbonate beyond expectation", "Lower than normal (moving in the opposite direction): coexisting metabolic acidosis. Higher than expected (HCO3 >38 mEq/L): coexisting metabolic alkalosis"],
            ["Anion gap", "High AG suggests a coexisting high AG metabolic acidosis"],
            ["Serum pH", "Below 7.35 suggests respiratory acidosis; lower pH, more severe. Acute: abrupt fall of approximately 0.08 per 10 mmHg rise in PaCO2. Chronic: approximately 0.03 per 10 mmHg"],
          ],
          "Table 33.2 Interpretations of arterial blood gas analysis in respiratory acidosis",
          "The acute pH fall here (0.08) differs from the 0.1 printed in the text on p392."
        ),
        points([
          "Chronic hypercapnia with persistent hypoxaemia can cause polycythaemia (raised haemoglobin and haematocrit).",
          "Hypophosphataemia, hyperkalaemia and hypokalaemia can weaken the respiratory muscles, contributing to the acidosis or delaying recovery.",
          "Hypochloraemia reflects chronic hypercapnia: renal bicarbonate retention is accompanied by increased urinary chloride excretion.",
          "Thyroid function tests in obese patients, for hypothyroidism contributing to obstructive sleep apnoea and sleep hypoventilation.",
        ], "What the other tests show"),
        quote("approximately a 0.08 reduction for every 10 mm Hg increase in PaCO₂", "394"),
        quote("(HCO₃>38 mEq/L) suggests the presence of coexisting metabolic alkalosis", "394"),
      ],
    },
    {
      id: "acidosis_treatment",
      title: "Respiratory acidosis: treatment",
      intro: "Treatment depends on severity, rate of onset and cause. Hypoxia usually, but not always, accompanies the hypercapnia, and both need careful treatment.",
      blocks: [
        points([
          "Identify and treat the underlying cause promptly: antibiotics for respiratory infection, beta-2 agonists and other bronchodilators for severe bronchoconstriction, treatment of neuromuscular disease. The book prints \"at times, only treatment is required\", which appears to have lost a word.",
          "Establish a patent airway and restore adequate oxygenation.",
          "In chronic hypercapnia with a sudden rise in PaCO2, search for the aggravating factor; vigorous treatment of infection, bronchodilators and removal of secretions help.",
        ], "General measures"),
        points([
          "Oxygen is a \"double-edged sword\" and needs careful titration. In acute respiratory acidosis the main threat to life is hypoxia rather than hypercapnia or acidosis, so oxygen is essential.",
          "Hypoxaemia (PaO2 below 80 mmHg) is a stimulus to respiration; injudicious oxygen can suppress the hypoxic drive, reduce alveolar ventilation and worsen hypercapnia. Loss of hypoxic vasoconstriction, absorption atelectasis and the Haldane effect also contribute.",
          "In chronic hypercapnia start cautiously, at the lowest concentration, and increase gradually to SpO2 88% to 92% or PaO2 60 to 70 mmHg.",
          "Usual practice: 2 L/min by nasal cannula, increased by 1 L/min every 10 to 15 minutes, targeting saturation 88% to 92%.",
        ], "Oxygen therapy"),
        caution([
          "Oxygen should never be withheld or withdrawn in the presence of a high or rising PaCO2.",
          "Exceeding SpO2 88% to 92% is unnecessary and not recommended: liberal oxygen is associated with increased mortality.",
        ]),
        quote("it should never be withheld or withdrawn in the presence of high or rising PaCO₂", "395"),
        quote("hypoxemia (when Pao, decreases below 80mm Hg) is an essential stimulus for respiration", "395"),
        quote("achieve a Spo, of 88% to 92% or a Pao, of 60 to 70 mmHg", "395"),
        quote("at a low flow rate, such as 2 L/min via nasal cannula, with gradual increments of 1 L/min every 10 to 15 minutes", "395"),
        quote("liberal oxygen administration is associated with increased mortality", "395"),
        quote("Treatment of underlying etiology is essential; at times, only treatment is required.", "395"),
      ],
    },
    {
      id: "ventilatory_support",
      title: "Respiratory acidosis: ventilatory support",
      intro: "NIV or invasive ventilation, chosen by the severity of hypoxaemia and hypercapnia, the cause and the clinical status. Asymptomatic or stable patients with chronic respiratory acidosis tolerate hypercapnia well and may not need ventilatory support.",
      blocks: [
        points([
          "Positive pressure by mask or nasal interface reduces the work of breathing, improves oxygenation and corrects hypercapnia without intubation.",
          "Often preferred in mild to moderate respiratory acidosis in patients who are conscious, cooperative and able to protect their airway.",
          "Common indications: acute exacerbation of COPD, cardiogenic pulmonary oedema, obstructive sleep apnoea, neuromuscular disorders.",
        ], "Noninvasive ventilation (NIV)"),
        points([
          "Haemodynamically unstable, severely symptomatic patients with progressive worsening of hypoxia and hypercapnia.",
          "Profound loss of consciousness with excessive secretions in patients who cannot protect their airway.",
          "Signs of muscle fatigue, before respiratory failure becomes critical.",
          "NIV fails to correct the acidosis, or is not tolerated.",
        ], "Invasive mechanical ventilation (endotracheal or tracheostomy tube)"),
        points([
          "Ventilating chronic hypercapnia risks post-hypercapnic alkalosis: pCO2 falls fast while the raised HCO3 falls slowly, giving sudden, marked alkalaemia. Lower PaCO2 gradually, reducing minute ventilation through respiratory rate or tidal volume.",
          "Target PaCO2 on the ventilator: in chronic respiratory acidosis, the patient's prior stable level, not a \"normal\" 40 mmHg; in acute respiratory acidosis, the normal level.",
        ], "Correcting hypercapnia and the PaCO2 target"),
        quote("asymptomatic or stable patients with chronic respiratory acidosis can tolerate hypercapnia well", "396"),
        quote("lowering the PaCO₂ gradually by reducing minute ventilation", "396"),
        quote("PaCO₂ is usually the patient's prior stable level, not a \"normal\" PaCO₂ of 40 mm of Hg.", "396"),
      ],
    },
    {
      id: "alkali",
      title: "Respiratory acidosis: alkali therapy and respiratory stimulants",
      blocks: [
        points([
          "Consider alkali in certain patients with an associated metabolic acidosis (mixed respiratory and metabolic acidosis), permissive hypercapnia, or severe bronchospasm, where it restores bronchial responsiveness to beta-adrenergic agonists by reducing calcium availability to bronchial smooth muscle.",
          "Medroxyprogesterone, acetazolamide and theophylline, used in the past as respiratory stimulants, have not shown effectiveness in hypercapnic states.",
        ]),
        caution([
          "Avoid alkali therapy in simple respiratory acidosis.",
          "Sodium bicarbonate (printed \"NaHCO₂\") is stated to be contraindicated in respiratory acidosis: it generates CO2 as it reacts with hydrogen ions, and poor ventilation may not clear it, worsening hypercapnia. The same page also says to consider alkali in the mixed and bronchospasm cases above; both statements are printed.",
        ]),
        quote("Avoid administering alkali therapy in cases of simple respiratory acidosis", "396"),
        quote("it can lead to the production of carbon dioxide as sodium bicarbonate reacts with hydrogen ions", "397"),
      ],
    },
    {
      id: "alkalosis_definition",
      title: "Respiratory alkalosis: definition and renal compensation",
      intro: "Frequent in critically ill patients, but rarely with life-threatening adverse effects.",
      blocks: [
        points([
          "Respiratory alkalosis (primary hypocapnia): PaCO2 below 35 mmHg, pH above 7.45 and a compensatory fall in plasma HCO3.",
          "Hyperventilation eliminates CO2 faster than the tissues produce it.",
          "Acute develops within 48 hours; chronic develops over days, beyond 48 hours.",
          "Renal compensation starts after 2-6 hours of sustained hypocapnia and is usually complete in 36 to 72 hours: less ammonium and titratable acid excretion and less HCO3 reabsorption. It is triggered mainly by the low PaCO2 rather than the alkalosis itself.",
        ]),
        table(
          ["Form", "HCO3 fall per 10 mmHg fall in PaCO2", "pH rise per 10 mmHg fall in PaCO2"],
          [
            ["Acute respiratory alkalosis", "2 mEq/L", "0.1"],
            ["Chronic respiratory alkalosis", "4-5 mEq/L", "0.03"],
          ],
          "Expected compensation (p397)",
          "Serum bicarbonate usually does not fall below 16 mEq/L unless a concomitant metabolic acidosis is present."
        ),
        quote("characterized by a low PaCO₂ (<35mm of Hg) leading to an increase in pH (>7.45)", "397"),
        quote("after 2-6 hours of sustained hypocapnia and is usually completed in 36 to 72 hours.", "397"),
        quote("Every 10 mm Hg fall in PaCO₂ causes a 2 mEq/L fall in HCO₃ and a 0.1 rise in pH.", "397"),
        quote("10 mm of Hg fall in PaCO₂ causes a 4-5 mEq/L fall in HCO₃ and a 0.03 rise in pH.", "397"),
        quote("The serum bicarbonate usually does not fall below 16 mEq/L unless a concomitant metabolic acidosis is present.", "397"),
      ],
    },
    {
      id: "alkalosis_causes",
      title: "Respiratory alkalosis: causes",
      intro: "Often seen in normal pregnancy and at high altitude.",
      blocks: [
        table(
          ["Group", "Causes"],
          [
            ["A. Hypoxaemia", "Living at high altitude, severe anaemia, hypotension"],
            ["B. Pulmonary disorders", "Asthma, pneumonia, pulmonary embolism, pulmonary oedema, ARDS, pulmonary fibrosis, pneumothorax"],
            ["C. CNS stimulation", "Pain, anxiety, fever (printed \"anxiety fever\"); CNS disorders such as cerebrovascular accident (infarction, haemorrhage), head injury or tumour"],
            ["D. Underlying serious illness", "Liver failure, sepsis"],
            ["E. Medications and hormones", "Salicylate, nicotine, xanthines; pregnancy (increased progesterone)"],
            ["F. Iatrogenic", "Aggressive mechanical ventilation, vigorous physical activities"],
          ],
          "Table 33.3 Causes of respiratory alkalosis"
        ),
      ],
    },
    {
      id: "alkalosis_clinical",
      title: "Respiratory alkalosis: clinical features",
      blocks: [
        points([
          "Features vary with severity, rate of onset and cause: more marked when acute, mild or insignificant when chronic.",
          "Acute hypocapnia reduces oxygen delivery to brain and heart (vasoconstriction lowering cerebral and coronary flow, and a left shift of the oxygen–haemoglobin dissociation curve).",
          "It may be the only clue to underlying sepsis or hepatic failure. Mortality is high with extreme hypocapnia, PaCO2 below 20-25 mmHg.",
          "Hyperventilation: rapid deep breathing or breathlessness.",
          "CNS: dizziness, light-headedness, confusion, disorientation, seizures.",
          "Cardiovascular: palpitations, breathlessness, chest wall tightness, arrhythmias, ischaemic ECG changes, especially with ischaemic heart disease.",
          "Metabolic: more calcium bound to albumin, giving acute hypocalcaemia — tetany, perioral and distal tingling and numbness, cramps.",
          "Potassium shifts into cells: hypokalaemia with weakness or irregular rhythm.",
        ]),
        quote("with a PaCO₂ level below 20-25 mm Hg, the mortality rate is high", "398"),
      ],
    },
    {
      id: "alkalosis_diagnosis",
      title: "Respiratory alkalosis: diagnosis",
      blocks: [
        steps([
          "History: respiratory, cardiac or hepatic disorders, sepsis, drugs such as salicylates, pain and anxiety.",
          "Examination: hyperventilation is characteristic of the acute form, often with mild tachycardia, and carpopedal spasm in severe cases.",
          "ABG: pH above 7.45 and PaCO2 below 35 mmHg.",
          "Check compensation: compare the actual HCO3 with the expected value (acute 2 mEq/L, chronic 4-5 mEq/L fall per 10 mmHg fall in PaCO2). In simple respiratory alkalosis they match.",
          "Bicarbonate above expected: coexisting metabolic alkalosis. Below expected: possible coexisting metabolic acidosis. Above normal (>24 mEq/L) and rising instead of falling: coexisting metabolic alkalosis. A high anion gap: coexisting high AG metabolic acidosis.",
          "Serum chemistry: CBC (infection, anaemia), electrolytes (hypocalcaemia, hypophosphataemia, hypokalaemia), liver function, urea and creatinine, thyroid function (hyperthyroidism).",
          "Other tests by clinical picture: chest X-ray and CT, pulmonary function tests, blood or sputum cultures, theophylline and salicylate levels.",
        ]),
        quote("an increase in pH (>7.45) and a low PaCO₂ (<35 mm Hg)", "399"),
        quote("the expected decrease in HCO₃ is 2 mEq/L for every 10 mm Hg decrease in PaCO₂", "399"),
      ],
    },
    {
      id: "alkalosis_treatment",
      title: "Respiratory alkalosis: treatment",
      intro: "Depends on duration, severity of symptoms, clinical status and cause. Chronic respiratory alkalosis with few symptoms needs no active treatment.",
      blocks: [
        steps([
          "Establish the underlying cause and treat it — the first and most important step.",
          "Stop causative medicines such as salicylates.",
          "Hypoxaemia is a common cause of hyperventilation: give oxygen and treat the cause.",
          "Anxiety-induced hyperventilation may respond to reassurance; severe cases may need behavioural therapy, calming techniques, sedatives, antidepressants and sometimes beta-blockers.",
          "On a ventilator: decrease tidal volume and/or respiratory rate to reduce CO2 excretion.",
          "Before climbing to high altitude: oral acetazolamide for at least two days can reduce hyperventilation symptoms of acute mountain sickness (no dose printed).",
        ]),
        caution([
          "Avoid rapid correction of severe respiratory alkalosis: risk of cerebral and pulmonary reperfusion injury.",
          "Avoid paper-bag rebreathing: it may not correct pCO2 and can cause significant hypoxaemia.",
          "On p399 the transcript interleaves two columns (the bicarbonate paragraph and the treatment bullets on medicines and oxygen); the steps above are reassembled from it and should be checked against the printed page.",
        ]),
        quote("using a paper bag for breathing should be avoided because it may not correct pCO₂", "400"),
      ],
    },
  ],
};
