import type { FluidTopic } from "@/lib/fluids/types";
import { PANDYA, caution, formula, points, quote, steps, table } from "@/content/fluids/_helpers";

/**
 * BURNS — v1.0.0. CLINICAL CONTENT: PENDING CLINICIAN REVIEW.
 *
 * Digest of chapter 46, which the source edition carries in full. Every number below is the
 * book's; the quotes give the page it came from. The chapter has no Lund–Browder chart, no
 * Galveston formula and no paediatric urine-output target, so none appear here.
 */
export const burnsV1: FluidTopic = {
  id: "burns",
  version: "1.0.0",
  title: "Burns: resuscitation and the first 48 hours",
  group: "settings",
  summary: "Who needs IV resuscitation, the Parkland calculation and its rivals, hourly urine-output titration, and how the book avoids fluid creep.",
  setting: "Emergency, burns unit and surgical ward, adult and child",
  reviewStatus: "pending_clinician_review",
  reviewedBy: null,
  references: [PANDYA],
  source: { chapters: ["46 Burns"], pages: "259–273" },
  sections: [
    {
      id: "who_needs_iv",
      title: "Who needs intravenous resuscitation",
      intro: "Burns need larger volumes in the first hours than other trauma; a late or thin start costs tissue and lives.",
      blocks: [
        table(
          ["Population", "Threshold in the text"],
          [
            ["Adults", "more than 15–20% non-superficial burns"],
            ["Children", "more than 10% burns"],
            ["Electric burns", "haemochromogens in the urine"],
            ["Extremes of age; elderly with cardiac or pulmonary disease", "any burn — reduced compensatory response to minor hypovolaemia"],
          ],
          "Indications for IV fluids"
        ),
        points([
          "A delay of more than 2 hours after the burn is associated with higher complications and mortality.",
          "Hypotension converts viable ischaemic deep-dermal burn into non-viable full-thickness burn.",
          "Leaky capillaries lose protein, most in the first 24 hours; the hypoproteinaemia drives oedema in burned and unburned tissue alike.",
          "Goals: restore intravascular volume and perfusion, replace losses, prevent shock and organ dysfunction, correct electrolytes, preserve heat-injured viable tissue, and avoid over-resuscitation.",
        ]),
        quote("a delay of more than 2 hours post-burn injury is associated with higher complications and mortality", "260"),
        quote("Adults with more than 15–20% nonsuperficial burns", "260"),
      ],
    },
    {
      id: "rule_of_nines",
      title: "Estimating the burn: rule of nines",
      blocks: [
        table(
          ["Region", "% TBSA"],
          [
            ["Head and neck", "9"],
            ["Each upper limb, front and back", "9 each (18 in total)"],
            ["Anterior trunk", "18"],
            ["Posterior trunk", "18"],
            ["Each lower limb, front and back", "18 each (36 in total)"],
            ["Perineum", "1"],
          ],
          undefined,
          "A rough estimate; imprecise for irregular burns and for hands, feet and face."
        ),
        quote("Head and neck (9%), each upper limb (front and back) (9% each, total 18%), anterior trunk (18%)", "260"),
      ],
    },
    {
      id: "fluid_choice",
      title: "Which fluid",
      blocks: [
        table(
          ["Fluid", "Place in the text", "Why"],
          [
            ["Ringer's lactate", "first line", "Balanced; sodium 130 mEq/L replaces sodium-rich losses; glucose-free, so no hyperglycaemia with large volumes; lactate becomes bicarbonate and corrects metabolic acidosis; avoids the hyperchloraemic acidosis of large-volume saline."],
            ["Normal saline", "less favourable", "Chloride 154 mEq/L against plasma 100 mEq/L, about 50% higher, so dilutional hyperchloraemic acidosis; no potassium or calcium. Cheap, available, compatible with drugs."],
            ["PlasmaLyte", "gaining use", "Closer to plasma than Ringer's lactate; limited by cost and no evidence of superiority in burns."],
            ["Human albumin", "adjunct after 12–18 hours", "Severe burns with shock; suggested when serum albumin is below 30 g/L and the projected requirement exceeds 6 mL/kg/%TBSA in 24 hours. Reduces crystalloid volume, fluid creep, compartment syndrome and mortality."],
            ["Fresh frozen plasma", "adjunct; alternative to albumin", "Reduces crystalloid volume; matches the composition of the lost fluid; improves clotting; protects the glycocalyx. Lower mortality than albumin in the first comparative study (needs confirmation). Preferred where albumin is costly, as in India."],
            ["Hydroxyethyl starch", "avoid", "No volume-sparing effect; more mortality, acute kidney injury and coagulopathy. Recommendations strongly advise against it in burns."],
            ["Gelatin", "not recommended", "No superiority over crystalloids; safety not supported."],
            ["3% hypertonic saline", "not supported as a safe adjunct", "Sodium 513 mEq/L, osmolality 1027 mOsm/kg against serum about 285. Smaller volume and less oedema, but hypernatraemia, hyperchloraemia, renal failure and higher mortality."],
          ]
        ),
        quote("Ringer's lactate (RL) is the recommended first-line intravenous fluid for initial fluid resuscitation in burns", "261"),
        quote("the use of hypertonic saline as a safe and viable adjunct to burn resuscitation is not supported", "264"),
      ],
    },
    {
      id: "colloid_timing",
      title: "When colloid is allowed",
      blocks: [
        table(
          ["Time after the burn", "Capillary leak", "Colloid"],
          [
            ["0–8 hours", "maximum", "avoid"],
            ["8–12 hours", "high", "generally avoided — minimal intravascular retention; colloid within 12 hours may worsen alveolar exudative inflammation"],
            ["12–18 hours onward", "declining", "judicious colloid reduces total volume, fluid load, fluid creep and oedema"],
            ["24–48 hours", "persists but less", "colloid beneficial; albumin or FFP as 20–60% of the calculated plasma volume"],
          ]
        ),
        points([
          "Albumin trigger in the text: serum albumin below 30 g/L, or a projected requirement exceeding 6 mL/kg/%TBSA in 24 hours.",
        ]),
        quote("Capillary leakage is maximum within the initial 8 hours after the burn and persists for subsequent 24–48 hours", "262"),
        quote("the use of colloids for resuscitation is generally avoided during the initial 8–12 hours", "262"),
        quote("serum albumin concentrations below 30 gm/L", "262"),
      ],
    },
    {
      id: "first_24_hours",
      title: "The first 24 hours: formulas",
      intro: "The clock runs from the time of the burn, not from admission. Every formula is a starting point; the rate is adjusted hourly to the response.",
      blocks: [
        formula(
          "Parkland (Baxter, 1968)",
          "Volume required (mL) = 4 × %TBSA × body weight (kg)",
          [
            { symbol: "%TBSA", meaning: "percentage of total body surface area with non-superficial burns", unit: "%" },
            { symbol: "body weight", meaning: "patient weight", unit: "kg" },
          ],
          {
            example: "70 kg with 30% TBSA: 4 mL × 30 × 70 = 8,400 mL, or 8.4 litres of Ringer's lactate in the first 24 hours. Half within the first 8 hours after the burn, the remaining half over the next 16 hours.",
            note: "Give as a continuous infusion at a constant rate — boluses increase oedema, slower rates cause haemodynamic instability. The book warns the Parkland volume often ends up exceeding what was predicted.",
            calc: "parkland",
          }
        ),
        formula(
          "Modified Brooke",
          "Volume required (mL) = 2 × %TBSA × body weight (kg)",
          [
            { symbol: "%TBSA", meaning: "percentage of total body surface area burned", unit: "%" },
            { symbol: "body weight", meaning: "patient weight", unit: "kg" },
          ],
          { note: "A lower total volume, aimed at preventing fluid creep." }
        ),
        formula(
          "American Burn Association (2008)",
          "Initial crystalloid rate = 2–4 mL/kg/%TBSA in the first 24 hours",
          [
            { symbol: "%TBSA", meaning: "percentage of total body surface area burned", unit: "%" },
            { symbol: "kg", meaning: "patient weight", unit: "kg" },
          ],
          { note: "Derived from the modified Brooke and Parkland formulas." }
        ),
        formula(
          "WHO TWGB (2021), mass casualties and resource-limited settings",
          "Initial fluid rate = 100 mL/kg per 24 hours, oral or intravenous, for burns beyond 20% TBSA",
          [
            { symbol: "kg", meaning: "patient weight", unit: "kg" },
            { symbol: "%TBSA", meaning: "burn area; the formula applies beyond 20%", unit: "%" },
          ],
          { note: "Simple, usable and safe where resources are limited." }
        ),
        table(
          ["Need more than the formula", "Need less"],
          [["Full-thickness burns, high-voltage electric injury, inhalation injury, need for escharotomy", "Obese burn patients"]],
          "Patients whose requirement departs from the formula"
        ),
        quote("the 24 hours for resuscitation is calculated from the time of the burn accident and not from the time of admission", "264"),
        quote("Fluid Volume = 4 mL × 30% × 70 kg = 8,400 mL or 8.4 Liters", "264"),
        quote("half is administered within the first 8 hours following the burn injury, while the remaining half is given over the next 16 hours", "264"),
        quote("The Volume Required (ml) = 2 × %TBSA of Burns × Body Weight (kg)", "264"),
        quote("an initial fluid rate of 100 mL/kg/24 h, either orally or intravenously", "265"),
      ],
    },
    {
      id: "first_24_hours_steps",
      title: "The first 24 hours: what the book does",
      blocks: [
        steps([
          "Large-bore peripheral access, through burned skin if necessary; tunnelled central line or intraosseous access in an emergency.",
          "Start Ringer's lactate; calculate the 24-hour volume (Parkland 4 mL/kg/%TBSA, or 2–4 mL/kg/%TBSA per the ABA), counting from the time of the burn.",
          "Half in the first 8 hours, half over the next 16, as a constant continuous infusion.",
          "Titrate hourly to urine output. Urinary catheter in every burn of 20% TBSA or more.",
          "Add colloid (albumin or FFP) only after 12–18 hours, particularly if albumin is below 30 g/L or the projected need exceeds 6 mL/kg/%TBSA in 24 hours.",
          "No routine boluses for hypotension; consider permissive hypoperfusion and an early fluid-restriction regimen to prevent creep.",
          "Transfuse restrictively: red-cell threshold haemoglobin 7 g/dL, one unit at a time with reassessment before the next unless the patient is unstable or actively bleeding.",
        ]),
        quote("requiring a urinary catheter in all patients with burns ≥20% TBSA", "267"),
        quote("red blood cell transfusion threshold of 7 gm/dL", "265"),
      ],
    },
    {
      id: "urine_output_titration",
      title: "Hourly urine-output titration",
      intro: "Urine output is the primary indicator. Measure it hourly, express it as mL/kg/h and adjust the rate as printed.",
      blocks: [
        table(
          ["Urine output", "Action"],
          [
            ["below 0.5 mL/kg/h", "Increase the infusion rate based on the hourly urine volume; a fluid challenge of 250 mL Ringer's lactate in addition to the ongoing fluid may be considered."],
            ["0.5–1 mL/kg/h", "Adequate replacement — continue the same rate; reassess hourly."],
            ["1–2 mL/kg/h", "Reduce the infusion rate by 10%; reassess hourly."],
            ["above 2 mL/kg/h", "Reduce the infusion rate by 20%; reassess hourly."],
          ],
          undefined,
          "Urine output is unreliable after diuretics, with glycosuria, or after hypertonic saline or dextran (osmotic diuresis)."
        ),
        caution(["No resuscitation formula is a licence to put the patient on autopilot: the number is the start, the hourly urine output is the prescription."]),
        quote("If the urine output is <0.5 mL/kg/h, increase the rate of infusion based on the hourly urine volume", "267"),
        quote("between 1–2 mL/kg/h, the fluid infusion rate should be reduced by 10%", "267"),
        quote(">2 mL/kg/h, the fluid infusion rate should be reduced by 20%", "267"),
      ],
    },
    {
      id: "endpoints",
      title: "Endpoints and monitoring",
      blocks: [
        points([
          "Normalisation of sensorium — anxiety or restlessness is early hypovolaemia or hypoxia.",
          "Urine output 0.5–1 mL/kg/h without osmotic diuresis.",
          "Normal heart rate and blood pressure, mean arterial pressure above 70 mmHg.",
          "Falling lactate and base deficit; base excess, lactate and their rate of correction predict mortality.",
        ], "Endpoints of burn shock resuscitation"),
        table(
          ["Parameter", "What the text says"],
          [
            ["Heart rate", "Below 110–120 per minute in a young adult suggests adequate resuscitation; persistent rate above 140 suggests hypovolaemia (or untreated pain or agitation). More sensitive than blood pressure."],
            ["Blood pressure", "Manual cuff unreliable on oedematous or charred limbs; endpoint MAP above 70 mmHg."],
            ["Urine output", "Primary indicator; hourly; catheter if 20% TBSA or more."],
            ["Laboratory", "Blood count, electrolytes, urea, creatinine, lactate, glucose, CPK, mixed venous gas. Lactate falling with fluid means adequate resuscitation; low mixed venous saturation means inadequate perfusion."],
            ["Invasive monitoring", "Central venous pressure, arterial line, thermodilution, oesophageal echo, pulmonary artery catheter for high-risk or large burns — no proven outcome benefit."],
          ],
          "Monitoring (the ABA lists pulse, blood pressure, urine output, mental status and oxygen saturation)"
        ),
        quote("mean arterial blood pressure >70 mm Hg", "268"),
        quote("a pulse rate below 110 to 120 beats per minute in a young adult suggests adequate resuscitation", "267"),
      ],
    },
    {
      id: "second_24_hours",
      title: "24 to 48 hours",
      blocks: [
        points([
          "Body weight rises 5–15% above the pre-injury level from fluid retention.",
          "Total resuscitation fluid is reduced, usually by nearly half compared with the first 24 hours; adjust to hourly urine output.",
          "Once adequate urine output has been maintained for more than 2 hours, switch gradually to maintenance fluid: normal maintenance plus evaporative loss from burned skin, intravenously as D5/0.45 NaCl with 20 mEq potassium chloride per litre, or as enteral feeds.",
          "Colloid (albumin or FFP) as 20–60% of the calculated plasma volume is beneficial now: greater intravascular retention, less oedema.",
        ]),
        quote("reduced, usually by nearly half compared to the requirements of the first 24 hours", "266"),
        quote("D5/0.45 NaCl + 20 mEq potassium chloride per liter", "266"),
        quote("20–60% of the calculated plasma volume", "266"),
      ],
    },
    {
      id: "after_48_hours",
      title: "After 48 hours: maintenance",
      intro: "Capillary permeability falls; the aim shifts from resuscitation to balanced crystalloid maintenance. Requirement = normal maintenance + abnormal evaporative water loss + continuing plasma loss.",
      blocks: [
        formula(
          "Maintenance fluid by weight (as printed)",
          "100 mL/kg for the first 10 kg + 50 mL/kg for 10–20 kg + 20 mL/kg for over 20 kg",
          [
            { symbol: "kg", meaning: "patient weight, split into the three bands", unit: "kg" },
          ],
          {
            note: "Add the evaporative loss from burned skin; subtract oral or nasogastric intake to get the intravenous volume; adjust to response and ongoing losses.",
            calc: "holliday_segar",
          }
        ),
        quote("100 mL/kg for the first 10 kg, + 50 mL/kg for 10–20 kg, and + 20 mL/kg for >20 kg", "266"),
      ],
    },
    {
      id: "fluid_creep",
      title: "Fluid creep",
      blocks: [
        points([
          "Inadvertent accumulation of excess fluid from over-aggressive resuscitation.",
          "Complications: tissue oedema, compartment syndromes, infection, pneumonia, ARDS, respiratory failure, acute kidney injury and more renal replacement, multiorgan failure, death.",
          "Causes: overestimated burn size, inexperience, over-enthusiastic or inattentive resuscitation, failure to use colloid to spare crystalloid, inadequate urine monitoring, failure to adjust to the response.",
        ]),
        steps([
          "An early fluid-restriction regimen.",
          "Colloid (albumin or FFP) alongside crystalloid when requirements are high.",
          "No routine fluid boluses for hypotension.",
          "Permissive hypoperfusion — safe and well tolerated in studies of adults and children.",
          "Hourly urine volume and timely adjustment of the rate.",
        ], "Prevention"),
        table(
          ["Complication of large-volume resuscitation", "Features"],
          [
            ["Abdominal compartment syndrome", "Sustained intra-abdominal pressure above 20 mmHg with new organ dysfunction — oliguria, reduced pulmonary compliance."],
            ["Extremity compartment syndrome", "Swelling, tightness, muscle pain, pallor, coolness, late loss of pulses."],
            ["Pulmonary", "Pleural effusion, pulmonary oedema, respiratory failure, prolonged intubation."],
            ["Orbital compartment syndrome", "Surgical emergency: orbital pain, diplopia, acute visual loss, fixed dilated pupil, ophthalmoplegia."],
          ]
        ),
        quote("sustained intra-abdominal pressure (>20 mmHg)", "269"),
      ],
    },
    {
      id: "oliguria",
      title: "Oliguria during resuscitation",
      blocks: [
        caution([
          "In the first 48 hours oliguria is commonly inadequate resuscitation and almost never acute kidney injury: give more fluid, not fluid restriction or diuretics.",
          "Exception: high-voltage electric injury, deep muscle burns and crush cause rhabdomyolysis and myoglobinuric kidney injury (weakness, muscle pain, dark red-brown urine, very high CPK) and may need diuretics.",
          "Once a diuretic has been given, urine output is no longer a reliable guide to resuscitation.",
          "Diuretics are also needed in extensive burns that stay oliguric despite fluid far above the estimated need.",
        ]),
        quote("almost never an indicator of acute kidney injury. It should be treated with increased fluid administration, not by fluid restriction or administration of diuretics", "270"),
        quote("Urinary output is no longer a reliable indicator to monitor fluid resuscitation once a diuretic has been administered", "270"),
      ],
    },
    {
      id: "electrical_injury",
      title: "High-voltage electrical injury",
      blocks: [
        points([
          "Deep muscle injury hides under normal-looking skin; the formulas significantly underestimate the requirement. Guide by urine output and clinical, laboratory and haemodynamic endpoints.",
          "Extra fluid to reach a high urine flow to clear haem pigments and avoid diuretics and kidney injury.",
          "If oliguria persists despite adequate hydration: an osmotic diuretic (mannitol), a loop diuretic (furosemide), or urine alkalinisation by sodium bicarbonate titration. No doses are printed.",
        ]),
        table(
          ["Population", "Urine-output target as printed"],
          [
            ["Adult, standard burn", "0.5–1 mL/kg/h without osmotic diuresis"],
            ["High-voltage electric injury or haemochromogens", "0–1.5 mL per kg per hour, or 75–100 mL/hour in adults"],
            ["Child", "not given in this chapter"],
          ],
          undefined,
          "The electrical-injury figure is reproduced as printed. The analysis flags the leading 0 as a likely misprint of a higher lower bound; do not rely on 0 as a target."
        ),
        quote("0–1.5 ml per kg per hour or 75–100 ml/hour in adults", "270"),
      ],
    },
    {
      id: "nutrition",
      title: "Nutrition",
      blocks: [
        points([
          "Burns are hypermetabolic; feed early and proactively.",
          "Enteral nutrition is first line in the haemodynamically stable patient whose oral intake is insufficient; nasogastric preferred, nasoduodenal or nasojejunal for delayed gastric emptying.",
          "Start within the first 24 hours — as safe as late enteral nutrition — for gut protection, less bacterial translocation and sepsis, fewer infections, shorter stay and lower mortality.",
          "Parenteral nutrition is not routine (overfeeding, impaired immunity, liver failure, higher mortality); only when the enteral route is not feasible, not tolerated or inadequate. Detailed requirements are in the book's chapter 56.",
        ]),
        quote("early EN (within 24 hours) is as safe as late EN", "269"),
      ],
    },
  ],
};
