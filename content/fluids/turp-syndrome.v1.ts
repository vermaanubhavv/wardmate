import type { FluidTopic } from "@/lib/fluids/types";
import { PANDYA, caution, points, quote, steps, table } from "@/content/fluids/_helpers";

/**
 * TURP SYNDROME — v1.0.0. CLINICAL CONTENT: PENDING CLINICIAN REVIEW.
 *
 * Digest of chapter 45, which the source edition carries in full. Every number below is the
 * book's; the quotes give the page it came from.
 */
export const turpSyndromeV1: FluidTopic = {
  id: "turp_syndrome",
  version: "1.0.0",
  title: "TURP syndrome",
  group: "settings",
  summary: "Irrigant absorption during prostate resection: who is at risk, what to watch for, what the book does when it happens.",
  setting: "Urology and anaesthesia, adult ward and theatre",
  reviewStatus: "pending_clinician_review",
  reviewedBy: null,
  references: [PANDYA],
  source: { chapters: ["45 TURP Syndrome"], pages: "252–258" },
  sections: [
    {
      id: "what",
      title: "What it is",
      blocks: [
        points([
          "A constellation of neurological, cardiovascular and electrolyte signs resulting from absorption of irrigation fluid through the prostatic venous sinusoids or breaches in the capsule.",
          "Incidence was 2–12%; with bipolar resection and saline irrigation it is now 1% or less.",
          "Irrigant is absorbed at about 10–30 mL per minute of operating time — roughly a litre in an hour.",
          "Under general anaesthesia the diagnosis is often delayed. Unexplained hypertension with refractory bradycardia is the warning sign the book stresses.",
        ]),
        quote("Unexplained hypertension and refractory bradycardia are the very important warning signs", "255"),
      ],
    },
    {
      id: "risk",
      title: "Risk factors",
      blocks: [
        table(
          ["Factor", "Threshold in the text"],
          [
            ["Age", "over 80 years"],
            ["Prostate weight", "over 75 g"],
            ["Resected weight", "over 45 g"],
            ["Pre-existing hyponatraemia (salt restriction, diuretics)", "correct before surgery"],
            ["Resection time, monopolar", "over 90 minutes"],
            ["Irrigation volume", "over 30 litres"],
            ["Irrigation bag height", "over 70 cm above the patient"],
            ["Irrigant", "hypotonic (glycine, sterile water) rather than saline"],
            ["Drainage", "intermittent rather than continuous; inadequate effluent"],
          ],
          "Patient and technique factors"
        ),
        quote("age over 80 years, prostate weight exceeding 75 gm, and resected prostate weight over 45 gm", "252"),
      ],
    },
    {
      id: "irrigants",
      title: "Irrigation fluids",
      blocks: [
        table(
          ["Fluid", "Osmolality / composition", "Notes"],
          [
            ["Sterile distilled water", "extremely hypotonic", "Best view, cheapest; highest risk of haemolysis, dilutional hyponatraemia, shock and renal failure. Most centres no longer use it."],
            ["Glycine 1.5%", "200 mOsm/L", "Non-conducting, non-haemolytic. Large absorption dilutes sodium; glycine itself raises ammonia, depresses the heart and causes visual disturbance."],
            ["Normal saline 0.9%", "Na 154 mEq/L, 308 mOsm/L", "Isotonic and safest for sodium; needs bipolar electrosurgery. Large absorption still causes volume overload, heart failure and hyperchloraemic acidosis."],
            ["5% dextrose, sorbitol, mannitol", "non-electrolyte", "Used less often; sorbitol causes gastrointestinal disturbance."],
          ]
        ),
        caution(["Do not use normal saline with monopolar electrosurgery — the current diffuses and the cautery fails. Saline irrigation is for bipolar resection only."]),
        quote("Do not use normal saline while using monopolar electrosurgery for TURP", "253"),
      ],
    },
    {
      id: "mechanism",
      title: "How it harms",
      blocks: [
        table(
          ["Disturbance", "Mechanism"],
          [
            ["Circulatory overload", "About a litre absorbed per hour raises systolic and diastolic pressure and can precipitate heart failure and pulmonary oedema."],
            ["Dilutional hyponatraemia", "Hypotonic irrigant dilutes serum sodium; brain water rises and neurological signs follow."],
            ["Haemolysis", "Large volumes of hypotonic fluid rupture red cells; free haemoglobin injures the kidney and disturbs coagulation."],
            ["Hypothermia", "Rapid absorption of large volumes of room-temperature irrigant."],
            ["Solute toxicity", "Glycine causes visual abnormalities; sorbitol causes gastrointestinal upset."],
          ]
        ),
      ],
    },
    {
      id: "prevention",
      title: "Prevention",
      blocks: [
        steps([
          "Correct pre-existing hyponatraemia before surgery and stop unnecessary diuretics.",
          "Prefer bipolar resection with normal saline irrigation.",
          "Limit resection time to one hour; stage large prostates; preserve the capsule.",
          "Keep the patient horizontal, not head-down.",
          "Keep the irrigation bag no higher than 60 cm above the patient — the lowest pressure that gives a view.",
          "Keep bladder pressure low: continuous flow irrigation, suprapubic drainage, large-bore catheter.",
          "Prefer regional anaesthesia so the awake patient reports symptoms early.",
          "Monitor continuously; measure absorbed volume and stop at a predetermined threshold.",
        ]),
        quote("avoid setting the fluid bag height greater than 60 cm above the patient", "255"),
      ],
    },
    {
      id: "management",
      title: "Management in the text",
      intro: "Asymptomatic mild hyponatraemia needs no specific therapy; treatment follows the severity of symptoms.",
      blocks: [
        steps([
          "Stop the surgery as early as the diagnosis is made.",
          "Stop intravenous fluids. Furosemide 1 mg/kg intravenously.",
          "Severe neurological symptoms (severe headache, confusion, altered sensorium, convulsions, coma): 100 mL of 3% sodium chloride over 20 minutes with the furosemide, as a rapid intermittent bolus rather than a continuous infusion. Check sodium and the rate of correction frequently and continue until the neurological symptoms improve.",
          "Haemodialysis when marked hyponatraemia, volume overload and acute kidney injury coexist and diuretics are not working — it also removes glycine, sorbitol or mannitol.",
          "Supportive care: oxygen for pulmonary oedema, anticonvulsants for seizures, inotropes for hypotension, correction of hypocalcaemia, cautious red-cell transfusion for anaemia.",
        ]),
        points([
          "Continuous blood pressure, heart rate and oxygen saturation; neurological status.",
          "Strict intake–output chart and daily weight to judge the volume overload and adjust the diuretic.",
          "Serum electrolytes (sodium above all), osmolality, renal function, blood count and coagulation.",
        ], "Monitoring"),
        quote("administer 100 ml of 3% hypertonic saline rapidly (to be given over 20 minutes)", "256"),
        quote("rapid intermittent bolus (RIB) is preferred over slow continuous infusion", "256"),
      ],
    },
  ],
};
