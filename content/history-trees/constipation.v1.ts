import type { HistoryTree } from "@/lib/history-check/types";
import { BAILEY_LOVE, commonHpi, DAS_CLINICAL_SURGERY, HAMILTON_BAILEY, HUTCHISONS, MACLEODS, PREGNANCY, SABISTON, surgicalBackground, val, yn } from "@/content/history-trees/_helpers";

/**
 * CONSTIPATION — v1.0.0. CLINICAL CONTENT: PENDING REVIEW (Sabiston background added, docs/surgical-history.md §9).
 * Adult surgical / medicine ward, north India. Separates the constipation of a functional or
 * dietary cause from obstruction and from a colorectal lesion. Differentials: functional /
 * low-fibre, drug-induced, hypothyroidism and hypercalcaemia, colorectal cancer, large-bowel
 * obstruction, anorectal disease (fissure, piles), pelvic-floor dysfunction.
 */
export const constipationV1: HistoryTree = {
  id: "constipation",
  version: "1.2.0",
  complaint: "Constipation",
  triggers: ["constipation", "not passing stools", "hard stools", "difficulty passing stools", "unable to pass stools", "infrequent stools", "obstipation"],
  setting: "Adult surgical / medicine ward, north India",
  reviewStatus: "pending_clinician_review",
  reviewedBy: null,
  references: [DAS_CLINICAL_SURGERY, HAMILTON_BAILEY, MACLEODS, HUTCHISONS, BAILEY_LOVE, SABISTON],
  slots: [
    ...commonHpi("constipation"),
    val("hpi", "frequency", "Frequency", "How often are stools passed now, and how often were they passed before?", ["once in", "every", "times a week", "days", "daily", "usual", "earlier", "before", "frequency"]),
    val("hpi", "consistency", "Consistency / size", "Are the stools hard and pellet-like, or thin and pencil-like?", ["hard", "pellet", "pencil", "thin", "narrow", "ribbon", "soft", "watery", "consistency", "pipe stem", "tooth paste"]),
    yn("hpi", "straining", "Straining / incomplete emptying", "Any straining, a feeling of incomplete emptying, or need to use fingers?", ["straining", "incomplete", "incomplete emptying", "tenesmus", "fingers", "digital"]),
    yn("associated", "abdominal_pain", "Abdominal pain / distension", "Any abdominal pain, colicky pain, or distension?", ["pain", "colicky", "distension", "bloating", "cramps", "swollen abdomen"]),
    yn("associated", "vomiting", "Vomiting", "Any vomiting, and is it bilious or faeculent?", ["vomiting", "vomit", "bilious", "faeculent", "green vomit"]),
    yn("associated", "painful_defaecation", "Pain on passing stool", "Is passing stool painful, so that the patient holds it back?", ["painful stool", "pain on passing stool", "pain while passing motion", "holds back", "afraid to pass stool", "fissure", "no pain on passing stool"]),
    yn("associated", "alternating", "Alternating with loose stools", "Does constipation alternate with loose stools or a sense of spurious diarrhoea?", ["alternating", "alternate", "loose stools", "spurious", "overflow"]),
    yn("associated", "fluid_diet", "Fluid and fibre intake", "Is the diet low in water, vegetables and fibre?", ["water", "fluids", "fibre", "vegetables", "diet", "roti", "low fibre", "intake"]),
    yn("associated", "thyroid_features", "Cold intolerance / weight gain / dry skin", "Any cold intolerance, weight gain, dry skin, or hair loss?", ["cold intolerance", "weight gain", "dry skin", "hair loss", "hoarse", "puffiness"], { tier: "detailed" }),
    yn("associated", "hypercalcaemia", "Thirst / excess urine / bone pain", "Any excess thirst, passing urine often, or bone pain?", ["thirst", "polyuria", "bone pain", "stones", "excess urine"], { tier: "detailed" }),
    // Red flags
    yn("red_flag", "obstruction", "Absolute constipation with vomiting and distension", "Has the patient stopped passing both stool and flatus?", ["no stool", "no flatus", "absolute constipation", "vomiting", "distension", "distended", "obstipation"], { teach: "Neither stool nor flatus, with vomiting and distension, is the pattern of a bowel blockage and changes how quickly the question needs answering." }),
    yn("red_flag", "rectal_bleeding", "Blood per rectum", "Any blood mixed with stool or passed per rectum?", ["blood", "bleeding per rectum", "blood mixed", "melaena", "maroon", "bright red blood"], { teach: "New constipation with rectal bleeding asks about a lesion in the colon or rectum." }),
    yn("red_flag", "weight_loss", "Weight loss", "Any unintentional weight loss?", ["weight loss", "lost weight", "loss of weight", "clothes loose"], { teach: "New constipation with weight loss, especially past middle age, raises a slow-growing bowel lesion." }),
    yn("red_flag", "change_in_habit", "New change in bowel habit after 50", "Is this a recent, persistent change from the patient's usual bowel habit?", ["new change", "over 50", "recent change", "change in bowel habit", "first time", "age"], { teach: "A recent persistent change in bowel habit, above all after fifty, is a recognised reason to look for a colorectal lesion." }),
    yn("exposure", "family_bowel_cancer", "Family history of bowel cancer", "Any family history of bowel cancer or polyps?", ["family history", "bowel cancer", "colon cancer", "polyps", "father", "mother", "sibling"], { teach: "A first-degree relative with bowel cancer raises the pre-test question for a colonic cause." }),
    yn("associated", "anaemia_symptoms", "Fatigue / breathlessness (iron loss)", "Any tiredness or breathlessness suggesting slow blood loss?", ["fatigue", "tiredness", "breathless", "pallor", "weakness"], { tier: "detailed", teach: "Slow blood loss from a bowel lesion often shows first as tiredness rather than bleeding." }),
    PREGNANCY,
    yn("exposure", "constipating_drugs", "Constipating drugs", "Any opioids, iron, calcium, antacids, anticholinergics, or antidepressants?", ["opioid", "tramadol", "iron", "calcium", "antacid", "anticholinergic", "antidepressant", "verapamil", "codeine", "morphine"]),
    yn("exposure", "neuro_immobility", "Immobility / neurological disease", "Any immobility, spinal problem, stroke, diabetes, or Parkinson's disease?", ["immobile", "bedridden", "spinal", "stroke", "diabetes", "parkinson", "neuropathy", "paraplegia"], { tier: "detailed" }),
    // S. Das, A Manual on Clinical Surgery, 13th ed. (docs/surgical-history.md §10)
    yn("hpi", "laxative_escalation", "Needing more and more laxatives", "Has the patient needed more and more laxative to open the bowels?", ["more laxatives", "increasing laxatives", "purgatives", "needs laxative daily", "laxative not working", "no laxatives"], {  teach: "Das names constipation needing ever more purgatives as the presenting symptom of a narrowing growth in the left colon." }),
    val("hpi", "stool_colour", "Colour of the stool", "What colour are the stools — normal, black and tarry, or pale and clay-coloured?", ["black stools", "tarry", "pale stools", "clay coloured", "white stools", "offensive", "normal colour"], { tier: "detailed", teach: "Das asks stool colour because black, pale or bulky offensive stools each point to a different part of the gut." }),
    yn("red_flag", "pain_became_constant", "Colicky pain turned constant", "Has colicky pain changed to a constant, burning pain?", ["became constant", "now constant", "continuous pain", "burning pain", "was colicky", "no longer comes and goes"], { teach: "Das warns that colic of obstruction turning constant is the change seen when the blood supply of the gut is threatened." }),
    // Hamilton Bailey's Demonstrations of Physical Signs, 19th ed. (docs/surgical-history.md §11)
    yn("hpi", "previous_attacks", "Earlier attacks that settled", "Has there been an earlier attack of constipation with a swollen belly that settled on its own?", ["similar attacks", "happened before", "previous episodes", "settled on its own", "first time", "no previous attacks"], { tier: "detailed", teach: "Hamilton Bailey reads earlier attacks of pain, swelling and constipation that went away as earlier twists of the sigmoid colon that untwisted." }),
    // Schwartz's Principles of Surgery, 11th ed. (docs/surgical-history.md §12)
    yn("hpi", "since_childhood", "Constipation since early childhood", "Has the patient been constipated since infancy or early childhood?", ["since childhood", "since birth", "since infancy", "always constipated", "lifelong"], { tier: "detailed", teach: "Schwartz notes Hirschsprung's disease can first be recognised in an adult; lifelong constipation from infancy is the history that raises it." }),
    ...surgicalBackground({ omit: ["surg_weight_loss"], detailed: ["surg_anaesthetic_problem", "surg_transfusion", "surg_exercise_tolerance", "surg_bleeding_tendency"] }),
  ],
  differentials: [
    { id: "functional", name: "Functional / low-fibre constipation", pointers: ["fluid_diet", "straining"], discriminators: ["fluid_diet", "straining", "consistency", "frequency", "onset_mode", "since_childhood"] },
    { id: "drug", name: "Drug-induced constipation", pointers: ["constipating_drugs"], discriminators: ["constipating_drugs", "onset", "neuro_immobility"] },
    { id: "metabolic", name: "Hypothyroidism / hypercalcaemia / dehydration", pointers: ["thyroid_features", "hypercalcaemia"], discriminators: ["thyroid_features", "hypercalcaemia", "weight_loss", "fluid_diet", "stool_colour"] },
    { id: "colorectal_lesion", name: "Colorectal lesion", pointers: ["rectal_bleeding", "weight_loss", "change_in_habit", "family_bowel_cancer"], discriminators: ["rectal_bleeding", "weight_loss", "change_in_habit", "family_bowel_cancer", "consistency", "alternating", "anaemia_symptoms", "laxative_escalation", "stool_colour"] },
    { id: "obstruction", name: "Large-bowel obstruction", pointers: ["obstruction", "abdominal_pain", "vomiting"], discriminators: ["obstruction", "vomiting", "abdominal_pain", "surg_previous_operations", "pain_became_constant", "previous_attacks"] },
    { id: "anorectal", name: "Anorectal disease (fissure, piles)", pointers: ["painful_defaecation", "straining"], discriminators: ["painful_defaecation", "straining", "consistency"] },
  ],
  output: {
    durationSlot: "duration",
    hpiOrder: ["onset", "duration", "onset_mode", "frequency", "consistency", "straining", "obstruction", "progression", "prior_treatment", "prior_investigations"],
  },
};
