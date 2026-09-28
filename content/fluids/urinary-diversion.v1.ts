import type { FluidTopic } from "@/lib/fluids/types";
import { PANDYA, caution, points, quote, steps, table } from "@/content/fluids/_helpers";

/**
 * URINARY DIVERSION — v1.0.0. CLINICAL CONTENT: PENDING CLINICIAN REVIEW.
 *
 * Digest of chapter 47, which the source edition carries in full. Every number below is the
 * book's; the quotes give the page it came from.
 */
export const urinaryDiversionV1: FluidTopic = {
  id: "urinary_diversion",
  version: "1.0.0",
  title: "Urinary diversion: metabolic complications and their correction",
  group: "settings",
  summary: "Bowel in the urinary tract: which segment causes which disturbance, and the book's oral regimen for the acidosis and hypokalaemia that follow.",
  setting: "Urology, adult and paediatric ward, long-term follow-up",
  reviewStatus: "pending_clinician_review",
  reviewedBy: null,
  references: [PANDYA],
  source: { chapters: ["47 Urinary Diversion"], pages: "274–279" },
  sections: [
    {
      id: "what",
      title: "What it is and when it is done",
      blocks: [
        points([
          "A surgical procedure that reroutes urine to an alternate path for elimination when the bladder can no longer safely store it.",
          "Indications: bladder carcinoma (cystectomy); extensive trauma to bladder, urethra or pelvis; neurogenic bladder dysfunction; bladder exstrophy; severe radiation injury, intractable incontinence or vesicovaginal fistula.",
          "Incontinent diversions drain continuously into an external bag (ileal conduit). Continent diversions store urine inside the body and are emptied by self-catheterisation (catheterisable ileal pouch) or by voiding (orthotopic neobladder).",
          "Ureterosigmoidostomy — ureters joined to the sigmoid colon, urine passed with stool — is now a last resort, but is still performed in some complex paediatric cases in resource-limited settings.",
        ]),
      ],
    },
    {
      id: "methods",
      title: "The four methods",
      blocks: [
        table(
          ["Method", "Type", "How it works", "Notes in the text"],
          [
            ["Ileal conduit", "Incontinent", "Ureters to a segment of ileum; abdominal stoma drains continuously into an external bag.", "Commonest and simplest; fewest surgical complications. Drawbacks: the bag, body image, leakage or odour."],
            ["Ileal pouch urinary reservoir", "Continent, cutaneous", "Pouch made from ileum stores urine in the abdomen; self-catheterised several times a day.", "No external bag; no odour from external drainage."],
            ["Orthotopic neobladder", "Continent", "Intestinal reservoir placed where the bladder was and joined to the urethra; voided by raising intra-abdominal pressure.", "Closest to normal storage and voiding; clean intermittent catheterisation if voiding is inadequate."],
            ["Ureterosigmoidostomy", "Continent, no stoma", "Ureters to the sigmoid colon; urine eliminated with bowel movements.", "Once common, now rarely used: electrolyte imbalance, infection, worsening kidney function, colon malignancy."],
          ]
        ),
      ],
    },
    {
      id: "by_segment",
      title: "Disturbances by bowel segment",
      intro: "What decides the derangement is the type of bowel segment, the length and surface area exposed to urine, and how long urine stays in contact with it.",
      blocks: [
        table(
          ["Diversion", "Segment and behaviour", "Contact time", "Metabolic risk", "Stone incidence in the text"],
          [
            ["Ureterosigmoidostomy", "Sigmoid colon acts as a large reservoir", "Longest", "Highest: hyperchloraemic metabolic acidosis, hypokalaemia (the colon absorbs potassium poorly), hyperammonaemia, diarrhoea, urolithiasis, metabolic bone disease", "3% and 43% (as printed)"],
            ["Ileal conduit", "Ileal loop is a conduit, not a reservoir; continuous external drainage", "Shortest", "Lowest", "9% to 11%"],
            ["Kock pouch", "Continent ileal reservoir", "Intermediate", "Reduced compared with the sigmoid", "17% to 27%"],
            ["Ileal pouch reservoir, orthotopic neobladder", "Smaller-capacity ileal reservoirs", "Intermediate", "Reduced: smaller bowel surface exposed to urine", "not given"],
          ],
          "Assembled from the chapter text; the chapter prints no formal table"
        ),
        quote("The risk of renal stone formation is high (3% and 43%) in patients with ureterosigmoidostomy", "277"),
        quote("ranging from 9% to 11%, compared to 17% to 27% with the Kock pouch diversion", "277"),
      ],
    },
    {
      id: "mechanism",
      title: "How each disturbance arises",
      blocks: [
        table(
          ["Disturbance", "Mechanism in the text"],
          [
            ["Hyperchloraemic metabolic acidosis", "Urinary ammonia, hydrogen and chloride are reabsorbed in exchange for sodium and bicarbonate. The colonic anion exchange pump absorbs chloride and secretes bicarbonate. Faecal bacteria convert urinary ammonia to ammonium, absorbed as ammonium chloride. Diarrhoea from colonic irritation adds bicarbonate loss."],
            ["Hypokalaemia", "Commoner in sigmoid than ileal diversions. Colonic secretion of potassium plus renal wasting from acidosis, volume depletion and renin–angiotensin–aldosterone activation; renal wasting plays the relatively major role. Diarrhoea adds direct loss."],
            ["Metabolic bone disease", "Bone demineralisation from chronic acidosis; acidosis impairs renal activation of vitamin D; urinary magnesium loss lowers PTH release and causes PTH insensitivity; intestinal calcium and vitamin D absorption fall; CKD contributes. A late complication: osteomalacia, osteoporosis, fractures."],
            ["Urolithiasis", "Hypercalciuria from bone demineralisation; low urine citrate; increased sulfate absorption excreted with divalent cations (hypercalciuria, hypermagnesuria); concentrated urine when diarrhoea dehydrates; bacterial colonisation, stasis, mucus reflux, sutures and staples as a nidus."],
            ["Hyperammonaemia", "Urea-splitting urinary infection and obstruction raise ammonia production and colonic absorption; a liver that cannot clear the load leads to encephalopathy."],
          ]
        ),
      ],
    },
    {
      id: "treatment",
      title: "Treatment in the text",
      intro: "The abnormalities are usually chronic and persistent, so the book plans long-term oral therapy. A few patients with severe dehydration, acidosis and hypokalaemia need vigorous hydration, alkalinisation and potassium repletion.",
      blocks: [
        table(
          ["Problem", "Agent", "Dose as printed", "Notes"],
          [
            ["Hyperchloraemic acidosis", "Oral sodium bicarbonate", "1–2 gm three times a day", "First choice; may cause excessive flatulence."],
            ["Hyperchloraemic acidosis", "Sodium citrate and citric acid (Shohl's solution)", "not stated", "Effective alternative to bicarbonate."],
            ["Acidosis with hypokalaemia, or when a sodium load is a problem (cardiac disease)", "Potassium citrate", "15 mEq (approximately 1.6 gm) b.i.d. to q.i.d.", "Corrects both hypokalaemia and acidosis on prolonged oral therapy."],
            ["Persistent acidosis where sodium is undesirable (fluid retention, pulmonary oedema, hypertension)", "Chlorpromazine", "25 mg three times a day", "Impairs chloride transport; limits acidosis and reduces the alkali requirement rather than correcting the acidosis."],
            ["As above", "Nicotinic acid", "400 mg three to four times a day", "Same mechanism as chlorpromazine."],
            ["Metabolic bone disease", "Oral calcium and vitamin D3", "not stated", "Only if early, adequate correction of the acidosis does not improve bone health."],
            ["Hyperammonaemia", "Low-protein diet; oral neomycin and/or lactulose", "not stated", "Treat liver disease, obstruction and urinary infection at the same time."],
            ["Ureterosigmoidostomy, all patients", "Low sodium-chloride diet", "—", "Minimises chloride intake to prevent acidosis."],
          ]
        ),
        quote("oral sodium bicarbonate (1–2 gm three times a day)", "278"),
        quote("Chlorpromazine is usually given at a dose of 25 mg three times a day", "278"),
        quote("nicotinic acid is administered at a dose of 400 mg three to four times a day", "278"),
        quote("supplementing potassium citrate 15 mEq (approximately 1.6 gm b.i.d. to q.i.d.)", "278"),
      ],
    },
    {
      id: "sequence",
      title: "Acidosis and potassium: the order of correction",
      blocks: [
        steps([
          "Start alkali prophylactically at the stage of subclinical acidosis, before the metabolic consequences (bone loss, protein catabolism, reduced albumin synthesis, frailty, falls, fractures) appear.",
          "Hypokalaemia in these patients usually travels with hyperchloraemic acidosis: correct both simultaneously and cautiously.",
          "In severe potassium deficit, replace potassium before addressing the acidosis.",
          "For prolonged oral correction use potassium citrate, which treats both.",
        ]),
        caution([
          "Correcting the acidosis first in a severe potassium deficit risks life-threatening hypokalaemia.",
          "Correcting hypokalaemia without treating the acidosis can lead to hyperkalaemia.",
        ]),
        quote("it is crucial to replace potassium before addressing the acidosis to avoid life-threatening hypokalemia", "278"),
        quote("correcting hypokalemia without treating metabolic acidosis can lead to hyperkalemia", "278"),
      ],
    },
    {
      id: "prevention",
      title: "Choosing the method and following up",
      blocks: [
        points([
          "Prefer the ileal conduit: the loop is a conduit, not a reservoir, so contact time is short and stone incidence low.",
          "Ileal pouch reservoirs and orthotopic neobladders also reduce disturbance because their smaller capacity exposes less bowel to urine.",
          "Ureterosigmoidostomy carries the most disturbance: large reservoir, long transit, and exchange of urinary electrolytes with plasma across the colonic mucosa.",
        ], "Method selection"),
        points([
          "The chapter names the problems to watch for — metabolic acidosis, hypokalaemia, hyperammonaemia, diarrhoea, urolithiasis and metabolic bone disease — and treats the acidosis at the subclinical stage; it prints no monitoring schedule or test intervals.",
        ], "Monitoring"),
        quote("Initiating prophylactic treatment of metabolic acidosis early, at the stage of subclinical acidosis", "278"),
      ],
    },
  ],
};
