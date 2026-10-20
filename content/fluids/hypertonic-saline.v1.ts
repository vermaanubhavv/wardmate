import type { FluidTopic } from "@/lib/fluids/types";
import { PANDYA, caution, points, quote, steps, table } from "@/content/fluids/_helpers";

/**
 * HYPERTONIC SALINE — v1.0.0. CLINICAL CONTENT: PENDING CLINICIAN REVIEW.
 *
 * Digest of chapter 11 of the full edition. Page numbers are the printed book pages. Every
 * number below is the book's; the quotes give the page it came from.
 */
export const hypertonicSalineV1: FluidTopic = {
  id: "hypertonic_saline",
  version: "1.0.0",
  title: "Hypertonic saline",
  group: "fluids",
  summary: "3% and 5% saline: composition, why it works, and its uses in symptomatic hyponatraemia, cerebral oedema, volume expansion, heart failure and cystic fibrosis, with the book's boluses, rates and cautions.",
  setting: "Adult medical, surgical and critical care",
  reviewStatus: "pending_clinician_review",
  reviewedBy: null,
  references: [PANDYA],
  source: { chapters: ["11 Hypertonic Saline"], pages: "123–130", pageKind: "book" },
  sections: [
    {
      id: "composition",
      title: "Composition",
      intro: "Hypertonic saline is concentrated sodium chloride in water; 3% and 5% are the solutions commonly used.",
      blocks: [
        table(
          ["Per 100 mL", "3% hypertonic saline", "5% hypertonic saline"],
          [
            ["Sodium", "51.3 mEq", "85.5 mEq"],
            ["Chloride", "51.3 mEq", "85.5 mEq"],
            ["Osmolality", "1026.0 mOsm/L", "1710.0 mOsm/L"],
            ["Sodium chloride", "3 g", "5 g"],
            ["Sodium concentration (per litre)", "513 mEq/L", "855 mEq/L"],
          ],
          "Inj. 3% and 5% hypertonic saline"
        ),
        quote("Sodium 51.3 mEq", "123"),
        quote("Osmolality 1710.0 mOsm/L", "123"),
        quote("Sodium concentration of 3% and 5% hypertonic saline is 513 mEq/L and 855 mEq/L respectively", "123"),
      ],
    },
    {
      id: "pharmacology",
      title: "Pharmacological basis",
      blocks: [
        points([
          "High sodium corrects hyponatraemia promptly: 513 and 855 mEq/L against a normal plasma 140 mEq/L. It is recommended for life-threatening hyponatraemia, and gives a large amount of sodium in a small volume (euvolaemic or hypervolaemic hyponatraemia needing salt but fluid restriction).",
          "High osmolality reduces cerebral oedema and ICP: 1026 and 1710 mOsm/L against normal plasma 285 mOsm/L. The osmotic gradient pulls water from the intracellular and extravascular spaces into the vessels and out of the cranial vault.",
          "Greater plasma volume expansion with a smaller infused volume, without interstitial expansion or oedema. It stimulates vasopressin release, reducing renal water loss. Volume expansion raises blood pressure and improves cerebral microcirculation.",
        ]),
        quote("compared to normal plasma concentration of 140 mEq/L.", "123"),
        quote("compared to the osmolality of normal plasma (285 mOsm/L).", "124"),
      ],
    },
    {
      id: "hyponatraemia",
      title: "Severe symptomatic hyponatraemia",
      intro: "First-line therapy and the only rapidly effective treatment in the emergency management of acute symptomatic hyponatraemia; it reduces cerebral oedema and prevents fatal brain herniation.",
      blocks: [
        points([
          "No formula is perfect: none accounts for ongoing renal loss of water or sodium. Serial sodium measurement is mandatory to set the infusion rate.",
          "Simple initial therapy: 1 mL/kg/h of 3% saline raises serum sodium by roughly 1 mEq/L/h.",
          "A 4–6 mEq/L rise is adequate to reverse the manifestations; stop 3% saline once that goal is reached.",
          "Anasarca: furosemide is added to prevent worsening hypervolaemia.",
        ]),
        table(
          ["Approach", "Bolus", "Repeat"],
          [
            ["United States guidelines", "100 mL of 3% over 10 minutes", "If symptoms persist, up to two more 100 mL boluses (total 300 mL)"],
            ["European recommendations", "150 mL of 3% over 20 minutes", "If sodium has not risen by 4 to 6 mEq/L, a second 150 mL bolus"],
          ],
          "Two common bolus approaches"
        ),
        caution([
          "Avoid rapid correction and the risk of osmotic demyelination syndrome: keep the rise under 10 mEq/L in the first 24 hours and under 18 mEq/L in the first 48 hours.",
        ]),
        quote("administer 1 mL/kg/h of 3% hypertonic saline which increases serum sodium roughly by 1 mEq/L/h", "124"),
        quote("a 100 mL bolus of 3% hypertonic saline is infused over 10 minutes.", "124"),
        quote("150 mL of 3% hypertonic saline is infused over 20 minutes.", "124"),
        quote("3% hypertonic saline once the correction goal of 4 to 6 mEq/L is achieved.", "125"),
        quote("increase in serum sodium less than 10 mEq/L in the first 24 hours and less than 18 mEq/L in the first 48 hours", "125"),
      ],
    },
    {
      id: "cerebral_oedema",
      title: "Cerebral oedema and raised intracranial pressure",
      intro: "Mannitol was the gold standard; data over two decades show hypertonic saline to be a safe, effective and superior initial treatment of intracranial hypertension.",
      blocks: [
        points([
          "Haemodynamic stability: it expands volume where mannitol depletes it by diuresis, so it is preferred with blood loss or hypotension from trauma.",
          "ICP falls more quickly, further and for longer than with mannitol at an equimolar dose, and it works in refractory hypertension or after mannitol failure; a few studies find them equal.",
          "Stronger effect on cerebral perfusion and a significant increase in brain oxygenation compared with mannitol.",
          "Reflection coefficient 1.0 against mannitol's 0.9: less leak into brain tissue and a greater osmotic gradient at equimolar dosage.",
          "Mortality and outcome benefits over mannitol are not documented, so it cannot be recommended as first-line treatment of cerebral oedema and severe traumatic brain injury.",
          "Symptom-based boluses are currently preferred over sodium-target continuous infusion.",
        ], "Compared with mannitol"),
        table(
          ["Use", "Solution and dose", "Rate and target"],
          [
            ["Cerebral oedema", "3% hypertonic saline, continuous infusion", "1 mL/kg/hr; initial sodium goal about 145 to 155 mEq/L"],
            ["Severe cerebral oedema with signs of herniation (emergency)", "30 mL bolus of 23.4% hypertonic saline IV through a central line", "Slowly over 10 minutes"],
          ],
          "Administration"
        ),
        quote("the reflection coefficient of hypertonic saline is higher than that of mannitol (1.0 vs 0.9, respectively)", "125"),
        quote("administered at the rate of 1 mL/kg/hr as a continuous infusion with the initial sodium goal of approximately 145 to 155 mEq/L", "125"),
        quote("infusion of 30 ml bolus of 23.4% hypertonic saline intravenous (IV) slowly over 10 minutes through a central line", "126"),
      ],
    },
    {
      id: "volume_expansion",
      title: "Plasma volume expansion",
      blocks: [
        points([
          "Expands intravascular volume considerably more than the volume infused by drawing water from interstitial and intracellular space.",
          "Lower volumes meet haemodynamic goals, so total fluid requirement and accumulation fall: an advantage in oedematous patients with volume depletion.",
          "No mortality benefit over isotonic fluids, so routine use for \"small-volume\" resuscitation cannot be recommended.",
        ]),
      ],
    },
    {
      id: "heart_failure",
      title: "Acute decompensated heart failure",
      intro: "With intravenous furosemide in diuretic-resistant, refractory ADHF. Reported benefits: better diuretic efficiency, more fluid and weight loss, better sodium, chloride and creatinine, shorter stay, fewer readmissions and lower all-cause mortality.",
      blocks: [
        points([
          "There are no fixed guidelines for hyperdiuresis. The SMAC-HF study protocol: 150 mL of 3% hypertonic saline with 250 mg IV furosemide over 30 minutes.",
          "Evidence is moderate; data supporting routine use in diuretic-resistant ADHF are insufficient.",
        ]),
        steps([
          "The osmotic gradient pulls fluid into the vessels; the expanded volume promotes the diuretic effect of furosemide.",
          "Raising chloride reverses the sodium-retaining effect of hypochloraemia and facilitates diuresis.",
          "Volume expansion temporarily suppresses the renin–angiotensin–aldosterone system and permits diuresis.",
        ], "Proposed mechanisms with loop diuretics"),
        quote("administration of 150 ml of 3% hypertonic saline along with 250 mg IV furosemide infused over 30 minutes", "126"),
      ],
    },
    {
      id: "cystic_fibrosis",
      title: "Cystic fibrosis",
      blocks: [
        points([
          "Inhaled hypertonic saline is an effective, safe, inexpensive adjunct for all children with cystic fibrosis older than six years; recommended twice daily.",
          "It draws water into the airway lumen, hydrating mucus so it is easier to cough out; airway irritation and cough also help clear mucus.",
        ]),
        quote("therapy for all children with cystic fibrosis older than six years of age", "127"),
        quote("The recommended timing of hypertonic saline inhalation for cystic fibrosis is twice a daily", "127"),
      ],
    },
    {
      id: "contraindications",
      title: "Contraindications and adverse effects",
      blocks: [
        caution([
          "No absolute contraindications. Because of the high sodium content, avoid or use cautiously in hypernatraemia, congestive heart failure, or renal insufficiency with volume overload.",
          "Overly rapid correction of hyponatraemia may cause osmotic demyelination syndrome, especially with serum sodium 105 mEq/L or less at presentation, female gender, hypokalaemia, alcoholism, malnutrition or advanced liver disease.",
        ]),
        points([
          "Common adverse effects of 3% saline: infection at the injection site, thrombophlebitis, hypernatraemia and hypervolaemia.",
        ]),
        quote("higher-risk patients with serum sodium 105 mEq/L or less at presentation", "127"),
      ],
    },
  ],
};
