import type { FluidTopic } from "@/lib/fluids/types";
import { PANDYA, caution, formula, points, quote, steps, table } from "@/content/fluids/_helpers";

/**
 * MAGNESIUM SULFATE — v1.0.0. CLINICAL CONTENT: REVIEWED (Dr Anubhav Verma).
 *
 * Digest of chapter 12 of the full edition. Page numbers are the printed book pages. Every
 * number below is the book's; the quotes give the page it came from.
 */
export const magnesiumSulfateV1: FluidTopic = {
  id: "magnesium_sulfate",
  version: "1.0.0",
  title: "Magnesium sulfate: indications, dosing and monitoring",
  group: "fluids",
  summary: "Injection magnesium sulfate: strengths, the doses by indication (hypomagnesaemia, pre-eclampsia, fetal neuroprotection, asthma, tetanus and others), dilution, monitoring, contraindications and the antidote.",
  setting: "Adult wards, ICU and obstetric units",
  reviewStatus: "reviewed",
  reviewedBy: "Dr Anubhav Verma",
  references: [PANDYA],
  source: { chapters: ["12 Magnesium Sulfate"], pages: "131–143", pageKind: "book" },
  sections: [
    {
      id: "composition",
      title: "Composition",
      intro: "Injection magnesium sulfate is the most common parenterally used magnesium salt, available in several concentrations.",
      blocks: [
        table(
          ["Preparation", "Contents"],
          [
            ["50% magnesium sulfate, each mL", "Magnesium sulfate USP 500 mg; 4.06 mEq or 2.03 mmol magnesium ions; osmolarity 4060 mOsm/L"],
            ["50% magnesium sulfate, per ampoule", "1 g in 2 mL and 5 g in 10 mL"],
            ["20% magnesium sulfate", "Magnesium sulfate USP 2 g in 10 mL"],
            ["10% magnesium sulfate", "Magnesium sulfate USP 1 g in 10 mL"],
          ],
          "Strengths"
        ),
        formula(
          "Magnesium sulfate conversion",
          "1 g MgSO4 = 4 mmol Mg = 8 mEq Mg; 50% magnesium sulfate 2 mL = 1 g",
          [
            { symbol: "g MgSO4", meaning: "mass of magnesium sulfate salt", unit: "g" },
            { symbol: "mmol Mg", meaning: "millimoles of magnesium ion", unit: "mmol" },
            { symbol: "mEq Mg", meaning: "milliequivalents of magnesium ion", unit: "mEq" },
          ]
        ),
        quote("Magnesium Sulfate USP 500 mg", "131"),
        quote("4.06 mEq or 2.03 mmol Magnesium ions", "131"),
        quote("Conversion relationships: Magnesium Sulfate 1 gm = 4 mmol mg = 8 mEq mg", "131"),
        quote("50% magnesium sulfate 2 ml = 1 gm = 4 mmol Mg2+ = 8 mEq Mg2+", "134"),
      ],
    },
    {
      id: "pharmacology",
      title: "Pharmacological basis",
      intro: "Magnesium is the second most common intracellular cation, a co-factor in many biochemical reactions, and takes part in nerve and neurochemical transmission, cardiac and muscular excitability and vasomotor tone; it also affects calcium and potassium regulation.",
      blocks: [
        points([
          "Pre-eclampsia and eclampsia: the exact mechanism is unclear and probably multifactorial. Calcium antagonism causes cerebral and peripheral vasodilatation, lowering cerebral vascular resistance and relieving vasospasm; it protects the blood-brain barrier and reduces cerebral oedema; and it blocks calcium entry at the nerve terminal, reducing acetylcholine release, so preventing or controlling seizures.",
          "Low to moderate doses can cause flushing and sweating; a high dose may cause hypotension.",
          "Preterm labour: probably blocks intracellular calcium channels and relaxes uterine muscle; the mechanism is not well understood.",
          "Asthma: inhibits calcium influx through voltage-dependent calcium channels, relaxing bronchial smooth muscle.",
          "Arrhythmias: magnesium is not an antiarrhythmic drug and should be used as adjuvant therapy. It regulates the Na⁺-K⁺-ATPase pump; giving it raises intracellular potassium, delays AV node conduction and prolongs the atrial refractory period. Arrhythmias resist antiarrhythmics and cardioversion while magnesium is deficient, so correcting it is essential.",
          "Hypokalaemia: low intracellular magnesium removes the block on renal outer medullary potassium (ROMK) channels, increasing urinary potassium excretion.",
          "Tetanus: a pre-synaptic neuromuscular blocker; it inhibits catecholamine release and reduces receptor responsiveness, controlling spasms and the effects of autonomic dysfunction.",
        ]),
      ],
    },
    {
      id: "hypomagnesaemia",
      title: "Indication: hypomagnesaemia",
      intro: "Hypomagnesaemia is common in hospitalised patients (ICU prevalence 20 to 61%) and harmful. IV magnesium sulfate is indicated in severe (serum magnesium 1 mg/dL or less) and symptomatic (seizures, tetany, life-threatening arrhythmias, severe neuromuscular irritability) hypomagnesaemia. Dose and rate depend on the degree of hypomagnesaemia, the symptoms and the indication.",
      blocks: [
        table(
          ["Clinical setting", "Suggested dose of magnesium"],
          [
            ["Severe symptomatic hypomagnesaemia, haemodynamically unstable", "2 g MgSO4 as a bolus over 2–15 min followed by a continuous infusion"],
            ["Severe symptomatic hypomagnesaemia, haemodynamically stable", "Initial dose: 1 to 2 g infused over one hour. Subsequent dose: 4 to 8 g as a continuous infusion over 12 to 24 hours"],
            ["Moderate hypomagnesaemia", "2 to 4 g infused over 4 to 12 hours"],
            ["Mild hypomagnesaemia", "1 to 2 g given over 1 to 2 hours (if the patient is unable to tolerate oral magnesium and mild symptoms are present)"],
            ["Pre-eclampsia", "4–6 g IV over 20 to 30 min followed by a maintenance dose of 1–2 g/hr as a continuous infusion"],
            ["Fetal neuroprotection", "4 g IV over 30 min followed by 1 g/hr infusion for 24 hours or until birth, whichever occurs earlier"],
            ["Asthma (severe exacerbations)", "A single dose of 2 g infused over 20 min"],
            ["Tetanus", "5 g infused over 20 min followed by a 2–3 g/hr infusion until spasm control is achieved"],
          ],
          "Table 12.1 Administration of IV magnesium in clinical practice",
          "50% magnesium sulfate 2 mL = 1 g = 4 mmol Mg²⁺ = 8 mEq Mg²⁺. The fetal neuroprotection row says over 30 min; the text on p136 says over 20 minutes."
        ),
        steps([
          "Severe, haemodynamically unstable and symptomatic (e.g. torsade de pointes with a long QT): 1 to 2 g (8 to 16 mEq) bolus diluted in 10 mL D5W over 2 to 15 minutes, then a continuous infusion.",
          "Severe, haemodynamically stable (plasma magnesium <1 mg/dL): 1 to 2 g diluted in 50 to 100 mL D5W over one hour, then 4 to 8 g (32 to 64 mEq) slowly over 12 to 24 hours. Repeat doses may be needed for 3–7 days.",
          "Moderate (plasma magnesium 1 to 1.5 mg/dL): 2 to 4 g (16 to 32 mEq) slowly over 4 to 12 hours, at a maximum rate of 1 g/hr.",
          "Mild (plasma magnesium 1.6 to 1.9 mg/dL), unable to take or tolerate oral magnesium: 1 to 2 g (8 to 16 mEq) slowly over one to two hours.",
        ], "By severity"),
        points([
          "Rule of thumb: in critically ill patients with mild to moderate hypomagnesaemia, 1 g IV Mg²⁺ roughly raises serum Mg²⁺ by 0.15 mEq/L within 18 to 30 h.",
          "Renal failure: assess renal function before starting; in renal insufficiency give 50% or less of the suggested empirical dose to reduce the risk of hypermagnesaemia.",
          "Duration: cellular uptake is slow but renal elimination rapid (up to 50% of a dose is excreted in the urine). Give slowly (over 8 to 24 hours) and continue for at least 1 to 2 days after serum magnesium is normal.",
          "The book gives the target after repeat doses as a plasma magnesium of 1.5 mEq/kg or higher (unit as printed).",
        ]),
        quote("severe (serum magnesium concentration 1 mg/dL [0.4 mmol/L or 0.8 mEq/L] or less)", "133"),
        quote("initially 1 to 2 gm (8 to 16 mEq) magnesium sulfate bolus (diluted in 10 mL D5W) is infused over 2 to 15 minutes", "133"),
        quote("Subsequently, 4 to 8 gm (32 to 64 mEq) of magnesium sulfate infusion is administered slowly over 12 to 24 hours", "133"),
        quote("infused slowly over 4 to 12 hours (at a maximum rate of 1 gm/hr)", "134"),
        quote("1 gm of intravenous (IV) Mg2+ will roughly increase the serum Mg2+ concentration by 0.15 mEq/L within 18 to 30 h", "134"),
        quote("administer 50% or less of the suggested empirical magnesium dose to reduce the risk of hypermagnesemia", "134"),
        quote("at least for 1 to 2 days after achieving the normal serum magnesium concentration", "135"),
      ],
    },
    {
      id: "obstetric",
      title: "Indication: obstetric practice",
      intro: "Used to prevent and treat seizures in severe pre-eclampsia or eclampsia, for fetal neuroprotection before early preterm delivery, and for short-term prolongation of pregnancy in women at risk of preterm labour within 7 days.",
      blocks: [
        points([
          "First-line therapy for preventing and treating seizures in pre-eclampsia with severe features and eclampsia. The Magpie trial showed a more than 50% reduction in seizure rate.",
          "In pre-eclampsia without severe features there is no consensus; the clinician or institution decides, considering patient preference and risk-benefit.",
          "Safer and more effective than phenytoin, diazepam, nimodipine or lithic cocktail (chlorpromazine, promethazine and pethidine) for preventing recurrent seizures in eclampsia.",
          "Timing: usually started before onset or induction of labour; for caesarean delivery, start before surgery.",
          "Route: usually IV, preferably by infusion pump; IM is used where venous access is lacking and is as effective.",
        ]),
        steps([
          "IV regimen (ACOG): loading dose 4–6 g diluted in 100 mL IV fluid over 20 to 30 minutes, then maintenance 1–2 g/hour as a continuous infusion.",
          "IM regimen: loading dose 5 g of 50% magnesium sulfate deep IM into each buttock (total 10 g), then 5 g IM every four hours (may be mixed with 1 mL of 2% xylocaine to reduce pain).",
          "Recurrent seizures: an additional 2–4 g bolus over 5 to 15 minutes.",
          "Duration: throughout delivery, and for at least 24 hours after delivery or the last convulsion, whichever is later.",
          "Toxicity watch: urine output hourly; deep tendon reflexes every 10 minutes for the first 2 hours, then every 30 minutes; respiratory rate and O₂ saturation closely. Loss of patellar reflex is the earliest sign of toxicity.",
        ], "Pre-eclampsia and eclampsia"),
        caution([
          "Magnesium sulfate is not used to treat hypertension.",
          "Stop or delay the infusion if patellar reflexes are absent, respiratory rate <16 breaths/minute, oxygen saturation <90%, or urine output <30 mL per hour over the preceding four hours.",
          "Antidote for respiratory depression: 10% calcium gluconate 10 mL IV slowly over 3 minutes.",
          "Contraindicated in myasthenia gravis (may precipitate a severe myasthenic crisis).",
          "Renal dysfunction: adjust the maintenance dose (but not the loading dose) and monitor serum magnesium closely.",
        ]),
        points([
          "Fetal neuroprotection: for women under 32 weeks' gestation at risk of preterm delivery within 24 hours; reduces the risk of cerebral palsy. Loading dose 4 g IV slowly over 20 minutes, then 1 g/hr for 24 hours or until birth, whichever is earlier.",
          "Preterm labour: recommended for short-term (up to 48 hours only) prolongation of pregnancy as a tocolytic, and in women between 24 and 34 weeks at risk of preterm delivery within 7 days, to allow time for antenatal corticosteroids.",
          "FDA safety alert: avoid continuous maternal IV magnesium sulfate beyond 5 to 7 days (fetal hypocalcaemia, bone abnormalities, neonatal fracture risk).",
        ], "Fetal neuroprotection and preterm labour"),
        quote("demonstrated a more than 50% reduction in the seizure rate in preeclampsia with this treatment", "135"),
        quote("A loading dose of 4–6 gm of magnesium sulfate diluted in 100 mL of IV fluid administered intravenously over 20 to 30 minutes", "135"),
        quote("followed by a maintenance dose of 1–2 gm/hour as a continuous infusion (ACOG recommended dosing)", "135"),
        quote("A loading dose of 5 gm of 50% magnesium sulfate is injected deeply intramuscularly into each buttock (total of 10 gm)", "135"),
        quote("Recurrent seizures: Treated with an additional 2–4 gm bolus infused over 5 to 15 minutes", "135"),
        quote("continued for at least 24 hours after delivery or the last convulsion, whichever occurs later", "136"),
        quote("respiratory rate <16 breaths/minute, oxygen saturation <90%, or urine output <30 ml per hour in the preceding four hours", "136"),
        quote("Administer 10% Calcium gluconate 10 ml IV slowly over 3 minutes if respiratory depression", "136"),
        quote("Loading dose of 4 gm intravenously slowly over 20 minutes, followed by a 1 gm/hr infusion", "136"),
        quote("beyond 5 to 7 days, as it may cause fetal hypocalcemia, bone abnormalities", "136"),
      ],
    },
    {
      id: "other_indications",
      title: "Other indications",
      blocks: [
        table(
          ["Indication", "What the book says", "Dose"],
          [
            ["Severe exacerbation of acute asthma", "Not used routinely; recommended with inadequate response to standard intensive initial treatment. As an adjunct it improves respiratory function, reduces hospitalisation, length of stay and need for ventilation. Nebulised magnesium showed no significant benefit.", "Single dose of 2 g infused over 20 min"],
            ["Cardiac arrhythmia", "Deficiency raises the risk of atrial fibrillation, ventricular arrhythmias and sudden death. IV magnesium helps prevent AF after coronary artery bypass or cardiac surgery and, as an adjuvant, controls the ventricular rate in acute-onset rapid AF. ESC (2015) and ACLS (2018) recommend it as treatment of choice for torsades de pointes; routine use in cardiac arrest is not recommended.", "Not printed for this indication"],
            ["Refractory hypokalaemia", "Magnesium deficiency is present in about 40% of hypokalaemic patients; serum magnesium may be normal despite deficiency, so consider depletion in refractory hypokalaemia (e.g. severe diarrhoea, obvious malnutrition) and treat it adequately.", "Symptomatic patients usually need about 3 to 6 g/day for 3–5 days"],
            ["Refractory hypocalcaemia", "Magnesium deficiency lowers PTH secretion and causes end-organ PTH resistance; hypocalcaemia stays refractory to calcium and vitamin D until magnesium is given.", "Not printed"],
            ["Tetanus", "First-line, as an adjunct to sedation, for spasms and autonomic dysfunction.", "Loading 5 g (or 75 mg/kg) over 20 minutes, then 2–3 g per hour until spasm control is achieved"],
            ["Migraine", "Evidence inadequate and not recommended in recent guidelines, though literature supports pain control beyond 1 hour, shorter aura and less rescue analgesia.", "Usually 1–2 g IV slowly over 10 to 20 minutes"],
            ["Aneurysmal subarachnoid haemorrhage", "Proposed to reduce vasospasm, but studies and meta-analyses failed to show better neurological outcomes; routine use is not recommended.", "Not printed"],
            ["COPD", "Hypomagnesaemia is common; may be useful as an adjunct in acute exacerbations not improving on inhaled bronchodilators.", "2 g infused over 20 minutes as a single dose"],
          ],
          "Indications beyond hypomagnesaemia and obstetrics"
        ),
        quote("administration of a single dose of magnesium sulfate (2 gm infused over 20 min) is recommended in severe exacerbations of acute asthma", "136"),
        quote("Magnesium deficiency is common in hypokalemia (in about 40% of hypokalemic patients)", "137"),
        quote("Symptomatic patients usually need about 3 to 6 gm of magnesium/day for 3–5 days", "137"),
        quote("A loading dose of 5 gm (or 75 mg/kg) of magnesium is given over 20 minutes", "137"),
        quote("followed by a 2–3 gm per hour infusion until spasm control is achieved", "137"),
        quote("Usually, 1–2 gm of magnesium is infused IV slowly over 10 to 20 minutes in the treatment of migraine", "138"),
        quote("(2 gm infused over 20 minutes as a single dose)", "138"),
      ],
    },
    {
      id: "contraindications",
      title: "Contraindications and precautions",
      intro: "Avoided or used with caution in severe renal failure, myasthenia gravis, cardiac ischaemia and heart block.",
      blocks: [
        caution([
          "Renal failure (e.g. GFR <30 mL/min): risk of accumulation and toxicity; use cautiously, reduce the dose by 25% to 50%, and monitor serum level closely.",
          "Myasthenia gravis: potentiates neuromuscular weakness and can precipitate a severe myasthenic crisis.",
          "Heart block: contraindicated, as hypermagnesaemia (>4 mEq/L) may cause conduction defects and bradycardia.",
        ]),
        quote("in patients with renal failure (e.g., GFR <30 ml/min), there is a risk of accumulation of magnesium and resultant toxicity", "138"),
        quote("magnesium should be used cautiously with a reduction of dose by 25% to 50%", "138"),
        quote("As hypermagnesemia (>4 mEq/L) may cause conduction defects and bradycardia", "138"),
      ],
    },
    {
      id: "adverse_effects",
      title: "Adverse effects",
      blocks: [
        table(
          ["Level", "mg/dL", "mEq/L", "mmol/L", "Clinical effects"],
          [
            ["Low", "<1.2", "<1.0", "<0.5", "Arrhythmias, tetany, or seizures"],
            ["Low", "1.2–1.8", "1.0–1.5", "0.5–0.75", "Hypokalaemia, hypocalcaemia, neuromuscular irritability"],
            ["Normal", "1.8–2.5", "1.5–2.1", "0.75–1.05", "No clinical effect"],
            ["High", "2.5–5.0", "2.1–4.2", "1.05–2.1", "Clinically asymptomatic"],
            ["High", "5.0–7.0", "4.2–5.8", "2.1–2.9", "Nausea, lethargy, drowsiness, impaired patellar reflexes"],
            ["High", "7.0–12", "5.8–10", "2.9–5.0", "Loss of deep tendon reflexes, bradycardia, hypotension, hypoventilation, ECG changes (P-Q interval prolongation, widened QRS)"],
            ["High", ">12", ">10", ">5.0", "Complete heart block, respiratory failure, cardiac arrest"],
          ],
          "Table 12.2 Plasma concentration of magnesium and clinical effects"
        ),
        quote("Complete heart block, respiratory failure, cardiac arrest", "139"),
      ],
    },
    {
      id: "administration",
      title: "Administration and dilution",
      blocks: [
        points([
          "Intramuscular: 50% magnesium sulfate for deep IM injection; may be mixed with 1 mL of 2% xylocaine to reduce pain.",
          "To make a 10% or 20% solution: add 20 mL (10 g) of 50% magnesium sulfate to 80 mL or 40 mL of diluent respectively.",
          "Diluent: 5% dextrose and 0.9% sodium chloride.",
          "A smaller bag (e.g. 250 to 500 mL) limits the magnesium delivered if infused too fast by accident and is easy to tell from one-litre hydrating bags.",
        ]),
        caution([
          "Never use undiluted 50% magnesium sulfate IV. Dilute to a concentration of 20% or less before IV infusion.",
        ]),
        quote("Never use undiluted 50% magnesium sulfate for IV administration.", "138"),
        quote("dilute magnesium sulfate to a concentration of at least 20% or less before administration", "138"),
        quote("add 20 ml (10 gm) of 50% magnesium to 80 ml or 40 ml of diluent, respectively", "139"),
      ],
    },
    {
      id: "monitoring",
      title: "Monitoring and antidote",
      intro: "While giving IV magnesium, closely monitor heart rate, blood pressure, respiratory rate, patellar reflex, urine output and SpO₂.",
      blocks: [
        caution([
          "Discontinue IV magnesium if respiratory rate is less than 12 breaths/minute.",
          "Discontinue if knee jerks are absent.",
          "Discontinue if urine output is less than 25 mL/hour or less than 100 mL over 4 hours.",
          "Discontinue if diastolic blood pressure falls more than 15 mmHg below baseline.",
        ], "Stop IV magnesium if"),
        points([
          "Check serum magnesium at least once daily during IV administration.",
          "Usually stopped once serum magnesium is 1.5 mg/dL (1.25 mEq/L or 0.625 mmol/L) or higher. A higher level may benefit patients with eclampsia or pre-eclampsia, recent cardiac surgery, arrhythmias or digitalis toxicity.",
          "Antidote: in hypermagnesaemia, IV calcium chloride or calcium gluconate, with the magnesium infusion stopped.",
        ]),
        quote("Respiratory rate of less than 12 breaths/minute.", "139"),
        quote("Urine output of less than 25 mL/hour or less than 100 mL over 4 hours.", "139"),
        quote("Diastolic blood pressure decreases more than 15 mmHg below the baseline.", "139"),
        quote("discontinued once serum magnesium levels are 1.5 mg/dL (1.25 mEq/L or 0.625 mmol/L) or higher", "139"),
      ],
    },
  ],
};
