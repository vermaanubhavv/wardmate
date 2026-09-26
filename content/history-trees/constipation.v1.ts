import type { HistoryTree } from "@/lib/history-check/types";
import { commonHpi, BAILEY_LOVE, HUTCHISONS, MACLEODS, PREGNANCY, SABISTON, surgicalBackground, val, yn } from "@/content/history-trees/_helpers";

/**
 * CONSTIPATION — v1.0.0. CLINICAL CONTENT: REVIEWED (Dr Anubhav Verma).
 * Adult surgical / medicine ward, north India. Separates the constipation of a functional or
 * dietary cause from obstruction and from a colorectal lesion. Differentials: functional /
 * low-fibre, drug-induced, hypothyroidism and hypercalcaemia, colorectal cancer, large-bowel
 * obstruction, anorectal disease (fissure, piles), pelvic-floor dysfunction.
 */
export const constipationV1: HistoryTree = {
  id: "constipation",
  version: "1.1.0",
  complaint: "Constipation",
  triggers: ["constipation", "not passing stools", "hard stools", "difficulty passing stools", "unable to pass stools", "infrequent stools", "obstipation"],
  setting: "Adult surgical / medicine ward, north India",
  reviewStatus: "reviewed",
  reviewedBy: "Dr Anubhav Verma",
  references: [MACLEODS, HUTCHISONS, BAILEY_LOVE, SABISTON],
  slots: [
    ...commonHpi("constipation"),
    val("hpi", "frequency", "Frequency", "How often are stools passed now, and how often were they passed before?", ["once in", "every", "times a week", "days", "daily", "usual", "earlier", "before", "frequency"]),
    val("hpi", "consistency", "Consistency / size", "Are the stools hard and pellet-like, or thin and pencil-like?", ["hard", "pellet", "pencil", "thin", "narrow", "ribbon", "soft", "watery", "consistency"]),
    yn("hpi", "straining", "Straining / incomplete emptying", "Any straining, a feeling of incomplete emptying, or need to use fingers?", ["straining", "incomplete", "incomplete emptying", "tenesmus", "fingers", "digital"]),
    yn("hpi", "flatus", "Passage of flatus", "Is flatus being passed?", ["flatus", "gas", "passing gas", "not passing flatus"]),
    yn("associated", "abdominal_pain", "Abdominal pain / distension", "Any abdominal pain, colicky pain, or distension?", ["pain", "colicky", "distension", "bloating", "cramps", "swollen abdomen"]),
    yn("associated", "vomiting", "Vomiting", "Any vomiting, and is it bilious or faeculent?", ["vomiting", "vomit", "bilious", "faeculent", "green vomit"]),
    yn("associated", "blood_mucus", "Blood or mucus in stool", "Any blood or mucus with the stool, or pain on passing?", ["blood", "mucus", "bleeding", "pain on passing", "fissure", "piles", "bright red"]),
    yn("associated", "alternating", "Alternating with loose stools", "Does constipation alternate with loose stools or a sense of spurious diarrhoea?", ["alternating", "alternate", "loose stools", "spurious", "overflow"]),
    yn("associated", "appetite_weight", "Appetite / weight", "Any loss of appetite or weight loss?", ["appetite", "weight loss", "lost weight", "loss of weight"]),
    yn("associated", "fluid_diet", "Fluid and fibre intake", "How much water, vegetables and fibre is the patient eating?", ["water", "fluids", "fibre", "vegetables", "diet", "roti", "low fibre", "intake"]),
    yn("associated", "thyroid_features", "Cold intolerance / weight gain / dry skin", "Any cold intolerance, weight gain, dry skin, or hair loss?", ["cold intolerance", "weight gain", "dry skin", "hair loss", "hoarse", "puffiness"], { tier: "detailed" }),
    yn("associated", "hypercalcaemia", "Thirst / excess urine / bone pain", "Any excess thirst, passing urine often, or bone pain?", ["thirst", "polyuria", "bone pain", "stones", "excess urine"], { tier: "detailed" }),
    // Red flags
    yn("red_flag", "obstruction", "Absolute constipation with vomiting and distension", "Has the patient passed neither stool nor flatus, with vomiting or a swollen abdomen?", ["no stool", "no flatus", "absolute constipation", "vomiting", "distension", "distended", "obstipation"], { teach: "Neither stool nor flatus, with vomiting and distension, is the pattern of a bowel blockage and changes how quickly the question needs answering." }),
    yn("red_flag", "rectal_bleeding", "Blood per rectum", "Any blood mixed with stool or passed per rectum?", ["blood", "bleeding per rectum", "blood mixed", "melaena", "maroon", "bright red blood"], { teach: "New constipation with rectal bleeding asks about a lesion in the colon or rectum." }),
    yn("red_flag", "weight_loss", "Weight loss", "Any unintentional weight loss?", ["weight loss", "lost weight", "loss of weight", "clothes loose"], { teach: "New constipation with weight loss, especially past middle age, raises a slow-growing bowel lesion." }),
    yn("red_flag", "change_in_habit", "New change in bowel habit after 50", "Is this a new change in bowel habit in someone over fifty?", ["new change", "over 50", "recent change", "change in bowel habit", "first time", "age"], { teach: "A recent, persistent change in bowel habit after fifty is a recognised reason to look further." }),
    yn("red_flag", "family_bowel_cancer", "Family history of bowel cancer", "Any family history of bowel cancer or polyps?", ["family history", "bowel cancer", "colon cancer", "polyps", "father", "mother", "sibling"], { teach: "A first-degree relative with bowel cancer raises the pre-test question for a colonic cause." }),
    yn("red_flag", "anaemia_symptoms", "Fatigue / breathlessness (iron loss)", "Any tiredness or breathlessness suggesting slow blood loss?", ["fatigue", "tiredness", "breathless", "pallor", "weakness"], { tier: "detailed", teach: "Slow blood loss from a bowel lesion often shows first as tiredness rather than bleeding." }),
    PREGNANCY,
    yn("exposure", "constipating_drugs", "Constipating drugs", "Any opioids, iron, calcium, antacids, anticholinergics, or antidepressants?", ["opioid", "tramadol", "iron", "calcium", "antacid", "anticholinergic", "antidepressant", "verapamil", "codeine", "morphine"]),
    yn("exposure", "neuro_immobility", "Immobility / neurological disease", "Any immobility, spinal problem, stroke, diabetes, or Parkinson's disease?", ["immobile", "bedridden", "spinal", "stroke", "diabetes", "parkinson", "neuropathy", "paraplegia"], { tier: "detailed" }),
    yn("exposure", "abdominal_surgery", "Previous abdominal surgery", "Any previous abdominal or pelvic surgery, or hernia?", ["surgery", "operation", "laparotomy", "hernia", "adhesions", "hysterectomy"], { tier: "detailed" }),
    ...surgicalBackground(),
  ],
  differentials: [
    { id: "functional", name: "Functional / low-fibre constipation", pointers: ["fluid_diet", "straining"], discriminators: ["fluid_diet", "straining", "consistency", "frequency", "onset_mode"] },
    { id: "drug", name: "Drug-induced constipation", pointers: ["constipating_drugs"], discriminators: ["constipating_drugs", "onset", "neuro_immobility"] },
    { id: "metabolic", name: "Hypothyroidism / hypercalcaemia / dehydration", pointers: ["thyroid_features", "hypercalcaemia"], discriminators: ["thyroid_features", "hypercalcaemia", "appetite_weight", "fluid_diet"] },
    { id: "colorectal_lesion", name: "Colorectal lesion", pointers: ["rectal_bleeding", "weight_loss", "change_in_habit", "family_bowel_cancer"], discriminators: ["rectal_bleeding", "weight_loss", "change_in_habit", "family_bowel_cancer", "consistency", "alternating", "anaemia_symptoms"] },
    { id: "obstruction", name: "Large-bowel obstruction", pointers: ["obstruction", "abdominal_pain", "vomiting", "flatus"], discriminators: ["obstruction", "flatus", "vomiting", "abdominal_pain", "abdominal_surgery"] },
    { id: "anorectal", name: "Anorectal disease (fissure, piles)", pointers: ["blood_mucus", "straining"], discriminators: ["blood_mucus", "straining", "consistency"] },
  ],
  output: {
    durationSlot: "duration",
    hpiOrder: ["onset", "duration", "onset_mode", "frequency", "consistency", "straining", "flatus", "progression", "prior_treatment", "prior_investigations"],
  },
};
