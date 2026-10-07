import type { SpecialtyKey } from "./types";

/**
 * What the case-history clerking asks, per department: the HOPI prompt pills for each
 * complaint, the examination cards, and the spoken-clerking format list.
 *
 * Pure data, no runtime imports — the "use client" workspace and capture components import it
 * directly (lib/specialty/index.ts pulls in discharge templates, which this must not).
 *
 * THE RULE: a department not named here gets exactly what general surgery has always had.
 *
 * HOPI pills are prompts to record what was SAID. Nothing is pre-selected; a pill is "on" only
 * when its words are already in the resident's text. No pill on a new template states a
 * negative — a denial is typed or dictated, never implied by a tap.
 */

export type HopiAttr = { label: string; options: string[] };

export const GENERIC_HOPI: HopiAttr[] = [
  { label: "Onset", options: ["Sudden", "Gradual"] },
  { label: "Duration", options: ["<1 day", "1–3 days", "<1 week", "1–4 weeks", ">1 month"] },
  { label: "Progression", options: ["Improving", "Static", "Worsening"] },
  { label: "Severity", options: ["Mild", "Moderate", "Severe"] },
  { label: "Timing", options: ["Constant", "Intermittent", "Worse at night", "After food"] },
];

type Template = { id: string; match: RegExp; attrs: HopiAttr[] };

// --- organ-specific templates, shared by every department --------------------------------
// Matched before the abdominal-pain / lump / urinary catch-alls below, which would otherwise
// hand "Chest pain" an epigastric site list and "Swelling of legs" a hernia's cough impulse.
// Wording follows the medicine history trees (content/history-trees/).

const CHEST_PAIN: Template = {
  id: "chest_pain",
  match: /chest (pain|discomfort|heaviness|tightness)|pain (in|over) (the )?chest|retrosternal|angina/i,
  attrs: [
    { label: "Site", options: ["Retrosternal", "Left side of chest", "Right side of chest", "Diffuse"] },
    { label: "Character", options: ["Pressure / tightness", "Heaviness", "Sharp / stabbing", "Burning", "Tearing"] },
    { label: "Radiation", options: ["To left arm", "To both arms", "To jaw / neck", "To back", "To epigastrium"] },
    { label: "Relation to exertion", options: ["On exertion", "At rest", "Relieved by rest"] },
    { label: "Worse with", options: ["Deep breath", "Coughing", "Lying flat", "Food"] },
    { label: "Sweating", options: ["Sweating with the pain"] },
    { label: "Each episode lasts", options: ["Seconds", "<20 minutes", ">20 minutes", "Continuous"] },
    { label: "Associated with", options: ["Breathlessness", "Palpitations", "Giddiness / fainting", "Nausea / vomiting", "Cough", "Fever"] },
  ],
};

const JOINT_PAIN: Template = {
  id: "joint_pain",
  match: /joint|arthr|\b(knee|hip|shoulder|ankle|wrist|elbow)s?\b/i,
  attrs: [
    { label: "Number of joints", options: ["One joint", "2–4 joints", "5 or more joints"] },
    { label: "Joints", options: ["Knees", "Small joints of hands", "Wrists", "Ankles", "Shoulders", "Hips", "Spine / back"] },
    { label: "Symmetry", options: ["Same joints on both sides", "One side only"] },
    { label: "Morning stiffness", options: ["Morning stiffness < 1 hour", "Morning stiffness > 1 hour"] },
    { label: "Pattern", options: ["Sudden", "Gradual", "Flitting — joint to joint", "Additive"] },
    { label: "Joint itself", options: ["Joint swelling", "Redness / warmth", "Deformity"] },
    { label: "Associated with", options: ["Fever", "Rash", "Mouth ulcers", "Red eyes", "Back stiffness", "Preceding loose stools / burning micturition"] },
  ],
};

/** Pain somewhere that is not the abdomen — "Bone pain", "Back pain", "Neck pain". */
const OTHER_SITE_PAIN: Template = {
  id: "other_site_pain",
  match: /\b(back|bone|neck|limb|leg|arm)s?\b[^,;]*\bpain|pain (in|over) (the )?(back|bones?|neck|limbs?|legs?|arms?)\b/i,
  attrs: [
    { label: "Onset", options: ["Sudden", "Gradual", "After injury / lifting"] },
    { label: "Character", options: ["Dull ache", "Sharp / stabbing", "Burning", "Shooting"] },
    { label: "Radiation", options: ["Down the leg", "To the arm", "Around the chest"] },
    { label: "Severity", options: ["Mild", "Moderate", "Severe"] },
    { label: "Duration", options: ["<1 week", "1–4 weeks", ">1 month"] },
    { label: "Progression", options: ["Improving", "Static", "Worsening"] },
    { label: "Aggravated by", options: ["Movement", "Worse at night", "Bending / lifting"] },
    { label: "Relieved by", options: ["Rest", "Analgesics"] },
    { label: "Associated with", options: ["Fever", "Weight loss", "Weakness / numbness", "Local swelling", "Change in bladder / bowel"] },
  ],
};

const BREATHLESSNESS: Template = {
  id: "breathlessness",
  match: /breathless|dyspn|shortness of breath|difficulty (in )?breathing|\bsob\b/i,
  attrs: [
    { label: "Onset", options: ["Sudden", "Gradual"] },
    { label: "NYHA grade", options: ["Grade I — only on heavy exertion", "Grade II — on ordinary activity", "Grade III — on less than ordinary activity", "Grade IV — at rest"] },
    { label: "Progression", options: ["Improving", "Static", "Worsening"] },
    { label: "Lying flat / at night", options: ["Orthopnoea", "PND — wakes up breathless"] },
    { label: "Wheeze", options: ["Wheeze", "Seasonal / triggered episodes"] },
    { label: "Associated with", options: ["Cough", "Chest pain", "Palpitations", "Swelling of legs", "Fever", "Haemoptysis"] },
  ],
};

const COUGH: Template = {
  id: "cough",
  match: /cough|haemoptysis|hemoptysis/i,
  attrs: [
    { label: "Duration", options: ["<3 weeks", "3–8 weeks", ">8 weeks"] },
    { label: "Type", options: ["Dry", "Productive"] },
    { label: "Sputum", options: ["Mucoid", "Yellow / green", "Frothy", "Foul-smelling"] },
    { label: "Haemoptysis", options: ["Streaks of blood", "Frank blood", "Large amount of blood"] },
    { label: "Timing", options: ["Worse at night", "Early morning", "On lying down"] },
    { label: "Associated with", options: ["Fever", "Breathlessness", "Chest pain", "Weight loss", "Night sweats", "Contact with a TB patient"] },
  ],
};

const OEDEMA: Template = {
  id: "oedema",
  match: /oedema|edema|puffiness|swelling of (the )?(legs?|feet|foot|ankles?|face|body|whole body)|\b(leg|legs|feet|foot|ankle|pedal|body|facial)\s+swelling/i,
  attrs: [
    { label: "Distribution", options: ["One leg (unilateral)", "Both legs (bilateral)", "Whole body"] },
    { label: "Onset", options: ["Sudden", "Gradual"] },
    { label: "Pitting", options: ["Pits on pressure", "Does not pit"] },
    { label: "Face", options: ["Puffiness of face", "Worse in the morning"] },
    { label: "Urine", options: ["Frothy urine", "Reduced urine output", "Blood in urine"] },
    { label: "Associated with", options: ["Breathlessness", "Orthopnoea", "Abdominal distension", "Jaundice", "Calf pain", "Redness / warmth"] },
  ],
};

const DECREASED_URINE: Template = {
  id: "decreased_urine",
  match: /(decreased|reduced|less|low|scanty) urine|oligur|anuri|not passing urine/i,
  attrs: [
    { label: "Onset", options: ["Sudden", "Gradual"] },
    { label: "Amount", options: ["Reduced", "Very little", "None passed"] },
    { label: "Preceded by", options: ["Vomiting / loose stools", "Fever", "Painkiller use", "A new medicine", "Snake bite", "Contrast scan"] },
    { label: "Urine", options: ["Frothy", "Cola-coloured / blood-stained", "Burning"] },
    { label: "Associated with", options: ["Swelling of body", "Breathlessness", "Nausea", "Drowsiness", "Itching"] },
  ],
};

const POLYURIA: Template = {
  id: "polyuria",
  match: /polyur|polydips|thirst|(increased|excessive|excess) urination/i,
  attrs: [
    { label: "Duration", options: ["<1 month", "1–6 months", ">6 months"] },
    { label: "Symptoms", options: ["Excess thirst", "Large urine volumes", "Getting up at night to pass urine", "Increased appetite"] },
    { label: "Associated with", options: ["Weight loss", "Tiredness", "Blurred vision", "Tingling of feet", "Recurrent infections", "Known diabetic"] },
  ],
};

const PALPITATIONS: Template = {
  id: "palpitations",
  match: /palpitat/i,
  attrs: [
    { label: "Onset", options: ["Starts suddenly", "Builds up gradually"] },
    { label: "Offset", options: ["Stops suddenly", "Fades gradually"] },
    { label: "Rhythm", options: ["Fast and regular", "Fast and irregular", "Missed beats / thumps"] },
    { label: "Each episode lasts", options: ["Seconds", "Minutes", "Hours", "Continuous"] },
    { label: "Brought on by", options: ["Exertion", "Anxiety", "Tea / coffee"] },
    { label: "Associated with", options: ["Giddiness", "Fainting", "Chest pain", "Breathlessness", "Sweating", "Tremor / heat intolerance"] },
  ],
};

const ALTERED_SENSORIUM: Template = {
  id: "altered_sensorium",
  match: /sensorium|unconscious|drows|confus|unresponsive|altered (mental|consciousness|behaviour)|loss of consciousness/i,
  attrs: [
    { label: "Onset", options: ["Sudden", "Over hours", "Over days"] },
    { label: "As described", options: ["Drowsy but rousable", "Responds only to pain", "Unresponsive", "Confused / disoriented", "Agitated"] },
    { label: "Course", options: ["Improving", "Static", "Worsening", "Fluctuating"] },
    { label: "Seizures", options: ["Seizure before it", "Repeated seizures", "Tongue bite", "Passed urine in clothes"] },
    { label: "Focal weakness", options: ["Weakness of one side", "Deviation of face", "Slurred speech"] },
    { label: "Preceded by", options: ["Fever", "Headache", "Vomiting", "Head injury", "Poison / tablet intake", "Alcohol"] },
  ],
};

// --- the templates every department had before (unchanged wording) ------------------------

const HEADACHE: Template = {
  id: "headache",
  // Checked before the generic pain/ache template below, which would otherwise catch
  // "headache" too (it contains "ache") and ask abdominal-pain questions for it.
  match: /headache|migraine|cephalgia/i,
  attrs: [
    { label: "Site", options: ["Unilateral", "Bilateral", "Frontal", "Occipital", "Temporal", "Generalised"] },
    { label: "Onset", options: ["Sudden (thunderclap)", "Gradual"] },
    { label: "Character", options: ["Throbbing", "Pressing / tightening", "Sharp / stabbing", "Dull ache"] },
    { label: "Severity", options: ["Mild", "Moderate", "Severe — worst ever"] },
    { label: "Duration", options: ["<1 day", "1–3 days", "<1 week", "1–4 weeks", ">1 month"] },
    { label: "Pattern", options: ["First episode", "Recurrent", "Chronic daily"] },
    { label: "Aggravated by", options: ["Straining / coughing", "Bending forward", "Light", "Noise", "Movement"] },
    { label: "Relieved by", options: ["Rest", "Dark quiet room", "Analgesics", "Sleep"] },
    { label: "Associated with", options: ["Nausea / vomiting", "Photophobia", "Phonophobia", "Visual disturbance", "Neck stiffness", "Fever", "Weakness / numbness", "Loss of consciousness", "Seizure"] },
  ],
};

const ABDOMINAL_PAIN: Template = {
  id: "abdominal_pain",
  match: /pain|ache/i,
  attrs: [
    { label: "Site", options: ["Epigastric", "RUQ", "LUQ", "RIF", "LIF", "Periumbilical", "Suprapubic", "Loin", "Generalised", "Shifting"] },
    { label: "Onset", options: ["Sudden", "Gradual", "After meals", "At night"] },
    { label: "Character", options: ["Colicky", "Dull ache", "Burning", "Cramping", "Sharp / stabbing", "Constant"] },
    { label: "Radiation", options: ["To back", "To right shoulder", "To groin", "To tip of shoulder", "None"] },
    { label: "Severity", options: ["Mild", "Moderate", "Severe"] },
    { label: "Duration", options: ["<1 day", "1–3 days", "<1 week", "1–4 weeks", ">1 month"] },
    { label: "Progression", options: ["Improving", "Static", "Worsening"] },
    { label: "Aggravated by", options: ["Movement", "Food", "Fatty food", "Coughing", "Deep breath"] },
    { label: "Relieved by", options: ["Rest", "Vomiting", "Leaning forward", "Antacids", "Passing stool / flatus"] },
    { label: "Associated with", options: ["Vomiting", "Fever", "Distension", "Constipation", "Loose stools", "Anorexia", "Jaundice", "Dysuria", "Haematuria"] },
  ],
};

const VOMITING: Template = {
  id: "vomiting",
  match: /vomit|emesis/i,
  attrs: [
    { label: "Onset", options: ["Sudden", "Gradual"] },
    { label: "Duration", options: ["<1 day", "1–3 days", "<1 week", ">1 week"] },
    { label: "Frequency", options: ["1–2 / day", "3–5 / day", ">5 / day"] },
    { label: "Content", options: ["Food particles", "Bilious", "Blood / coffee-ground", "Feculent", "Watery"] },
    { label: "Relation to food", options: ["Soon after eating", "Delayed", "Unrelated"] },
    { label: "Nature", options: ["Projectile", "Effortless", "Preceded by nausea"] },
    { label: "Progression", options: ["Improving", "Static", "Worsening"] },
    { label: "Associated with", options: ["Pain abdomen", "Distension", "Constipation", "Obstipation", "Fever", "Weight loss"] },
  ],
};

const FEVER: Template = {
  id: "fever",
  match: /fever|pyrexia/i,
  attrs: [
    { label: "Onset", options: ["Sudden", "Gradual"] },
    { label: "Duration", options: ["<3 days", "<1 week", "1–4 weeks", ">1 month"] },
    { label: "Grade", options: ["Low-grade", "High-grade", "Documented >101°F"] },
    { label: "Pattern", options: ["Continuous", "Intermittent", "Remittent", "Evening rise"] },
    { label: "Chills / rigors", options: ["With rigors", "With chills only", "No chills"] },
    { label: "Progression", options: ["Improving", "Static", "Worsening"] },
    { label: "Associated with", options: ["Night sweats", "Weight loss", "Cough", "Dysuria", "Pain abdomen", "Loose stools", "Rash"] },
  ],
};

const JAUNDICE: Template = {
  id: "jaundice",
  match: /jaundice|icterus|yellow/i,
  attrs: [
    { label: "Onset", options: ["Sudden", "Gradual"] },
    { label: "Duration", options: ["<1 week", "1–4 weeks", ">1 month"] },
    { label: "Progression", options: ["Increasing", "Decreasing", "Fluctuating"] },
    { label: "Pain", options: ["Painful", "Painless"] },
    { label: "Urine", options: ["High-coloured", "Normal"] },
    { label: "Stools", options: ["Clay-coloured", "Pale", "Normal"] },
    { label: "Pruritus", options: ["Present", "Absent"] },
    { label: "Associated with", options: ["Fever", "Weight loss", "Anorexia", "Vomiting", "Abdominal lump"] },
  ],
};

const LUMP: Template = {
  id: "lump",
  match: /lump|swelling|mass/i,
  attrs: [
    { label: "Site", options: ["Groin", "Umbilical", "Epigastric", "Scrotal", "Neck", "Breast", "Abdominal wall", "Other"] },
    { label: "Duration", options: ["<1 month", "1–6 months", "6–12 months", ">1 year"] },
    { label: "Onset", options: ["Noticed incidentally", "After straining / lifting"] },
    { label: "Progression", options: ["Increasing in size", "Static", "Decreasing"] },
    { label: "Pain", options: ["Painful", "Painless"] },
    { label: "Reducibility", options: ["Reducible", "Irreducible", "Reducible on lying down"] },
    { label: "Cough impulse", options: ["Present", "Absent"] },
    { label: "Associated with", options: ["Pain abdomen", "Vomiting", "Constipation", "Skin changes", "Other lumps", "Weight loss"] },
  ],
};

const DISTENSION: Template = {
  id: "distension",
  match: /distension|distention|bloat/i,
  attrs: [
    { label: "Onset", options: ["Sudden", "Gradual"] },
    { label: "Duration", options: ["<1 day", "1–3 days", "<1 week", ">1 week"] },
    { label: "Extent", options: ["Localised", "Generalised"] },
    { label: "Progression", options: ["Increasing", "Static", "Decreasing"] },
    { label: "Flatus / stool", options: ["Passing normally", "Reduced", "Absent (obstipation)"] },
    { label: "Associated with", options: ["Pain abdomen", "Vomiting", "Constipation", "Breathlessness", "Visible peristalsis"] },
  ],
};

const CONSTIPATION: Template = {
  id: "constipation",
  match: /constipat/i,
  attrs: [
    { label: "Duration", options: ["<1 week", "1–4 weeks", ">1 month", "Long-standing"] },
    { label: "Bowel frequency", options: ["Once in 2–3 days", "Once in 4–7 days", "<Once a week"] },
    { label: "Stool", options: ["Hard", "Pellet-like", "Narrow calibre"] },
    { label: "Pattern", options: ["Progressive", "Alternating with diarrhoea"] },
    { label: "Blood / mucus", options: ["Blood in stool", "Mucus", "Neither"] },
    { label: "Associated with", options: ["Pain abdomen", "Distension", "Tenesmus", "Weight loss", "Anorexia"] },
  ],
};

const LOOSE_STOOLS: Template = {
  id: "loose_stools",
  match: /loose stool|diarrh|motions/i,
  attrs: [
    { label: "Onset", options: ["Sudden", "Gradual"] },
    { label: "Duration", options: ["<3 days", "<1 week", "1–4 weeks", ">1 month"] },
    { label: "Frequency", options: ["3–5 / day", "6–10 / day", ">10 / day"] },
    { label: "Consistency", options: ["Watery", "Semi-formed", "Mucoid"] },
    { label: "Blood / mucus", options: ["Blood present", "Mucus present", "Neither"] },
    { label: "Timing", options: ["Nocturnal", "Post-prandial", "Tenesmus"] },
    { label: "Associated with", options: ["Fever", "Pain abdomen", "Vomiting", "Dehydration", "Weight loss"] },
  ],
};

const PR_BLEED: Template = {
  id: "pr_bleed",
  match: /bleeding per rectum|per rectal bleed|pr bleed|blood in stool|melena|melaena/i,
  attrs: [
    { label: "Duration", options: ["<1 week", "1–4 weeks", ">1 month", "Recurrent"] },
    { label: "Colour", options: ["Bright red", "Dark red", "Altered / maroon", "Melena (black tarry)"] },
    { label: "Amount", options: ["Streaks on stool", "Mixed with stool", "Splash in the pan", "Dripping after stool"] },
    { label: "Relation to defecation", options: ["During", "After", "Unrelated"] },
    { label: "Pain", options: ["Painful", "Painless"] },
    { label: "Associated with", options: ["Mucus", "Mass / prolapse", "Change in bowel habit", "Weight loss", "Pallor / giddiness"] },
  ],
};

const DYSURIA: Template = {
  id: "dysuria",
  match: /burning micturition|dysuria|urin/i,
  attrs: [
    { label: "Onset", options: ["Sudden", "Gradual"] },
    { label: "Duration", options: ["<3 days", "<1 week", "1–4 weeks", ">1 month"] },
    { label: "Voiding", options: ["Increased frequency", "Urgency", "Poor stream", "Incomplete emptying", "Terminal dribbling"] },
    { label: "Urine", options: ["Haematuria", "Cloudy / turbid", "Foul-smelling", "Clear"] },
    { label: "Pain site", options: ["Suprapubic", "Loin", "Urethral"] },
    { label: "Associated with", options: ["Fever", "Rigors", "Loin pain", "Nausea / vomiting"] },
  ],
};

const APPETITE: Template = {
  id: "appetite",
  match: /appetite/i,
  attrs: [
    { label: "Duration", options: ["<1 month", "1–3 months", ">3 months"] },
    { label: "Severity", options: ["Mild", "Marked", "Aversion to food"] },
    { label: "Progression", options: ["Improving", "Static", "Worsening"] },
    { label: "Associated with", options: ["Weight loss", "Nausea", "Early satiety", "Pain abdomen", "Altered taste"] },
  ],
};

const WEIGHT: Template = {
  id: "weight",
  match: /weight/i,
  attrs: [
    { label: "Amount", options: ["2–5 kg", "5–10 kg", ">10 kg", "Not quantified"] },
    { label: "Over", options: ["<1 month", "1–3 months", "3–6 months", ">6 months"] },
    { label: "Appetite", options: ["Preserved", "Reduced"] },
    { label: "Associated with", options: ["Fever", "Night sweats", "Cough", "Bowel change", "Lump", "Anorexia"] },
  ],
};

/** First match wins, so every specific organ sits above the catch-all it would fall into. */
const SHARED: Template[] = [
  HEADACHE,
  CHEST_PAIN,
  JOINT_PAIN,
  OTHER_SITE_PAIN,
  ABDOMINAL_PAIN, // any other "pain" — the surgical default, as before
  BREATHLESSNESS,
  COUGH,
  PALPITATIONS,
  ALTERED_SENSORIUM,
  VOMITING,
  FEVER,
  JAUNDICE,
  OEDEMA, // before LUMP: "Swelling of legs" is not a hernia
  LUMP,
  DISTENSION,
  CONSTIPATION,
  LOOSE_STOOLS,
  PR_BLEED,
  DECREASED_URINE, // both before DYSURIA, whose /urin/ would catch them
  POLYURIA,
  DYSURIA,
  APPETITE,
  WEIGHT,
];

// --- medicine overrides --------------------------------------------------------------------

/** A medicine fever history asks about the rash and the bleeding that point to dengue,
 *  scrub typhus or sepsis. No "No chills" pill: a denial is typed, not tapped. */
const MEDICINE_FEVER: Template = {
  id: "fever_medicine",
  match: /fever|pyrexia/i,
  attrs: [
    { label: "Onset", options: ["Sudden", "Gradual"] },
    { label: "Duration", options: ["<3 days", "<1 week", "1–4 weeks", ">1 month"] },
    { label: "Grade", options: ["Low-grade", "High-grade", "Documented >101°F"] },
    { label: "Pattern", options: ["Continuous", "Intermittent", "Remittent", "Evening rise"] },
    { label: "Chills / rigors", options: ["With rigors", "With chills only"] },
    { label: "Rash", options: ["Red spots / rash", "Petechiae", "Eschar"] },
    { label: "Bleeding", options: ["Gum bleeding", "Nose bleed", "Blood in urine", "Black stools", "Vomiting blood"] },
    { label: "Associated with", options: ["Headache", "Body aches", "Cough", "Burning micturition", "Loose stools", "Pain abdomen", "Altered sensorium", "Jaundice"] },
  ],
};

const MEDICINE_OVERRIDES: Template[] = [MEDICINE_FEVER];

const OVERRIDES: Partial<Record<SpecialtyKey, Template[]>> = {
  internal_medicine: MEDICINE_OVERRIDES,
  emergency_medicine: MEDICINE_OVERRIDES,
  pulmonary_medicine: MEDICINE_OVERRIDES,
};

/** The template id a complaint gets on this unit — exported for the test. */
export function hopiTemplateIdFor(complaint: string, specialty?: string | null): string {
  const list = [...(OVERRIDES[(specialty ?? "") as SpecialtyKey] ?? []), ...SHARED];
  return list.find((t) => t.match.test(complaint))?.id ?? "generic";
}

export function hopiAttrsFor(complaint: string, specialty?: string | null): HopiAttr[] {
  const list = [...(OVERRIDES[(specialty ?? "") as SpecialtyKey] ?? []), ...SHARED];
  return list.find((t) => t.match.test(complaint))?.attrs ?? GENERIC_HOPI;
}

// --- examination cards ---------------------------------------------------------------------

export type ExamCardId = "piccle" | "vitals" | "abdomen" | "chest" | "cvs" | "cns" | "local";

/** Each systemic card: its title, the label it is stored under, and the labels it is seeded from. */
export const EXAM_CARD: Record<Exclude<ExamCardId, "piccle" | "vitals">, { title: string; label: string; aliases: string[] }> = {
  abdomen: { title: "Per abdomen", label: "per abdomen", aliases: ["per abdomen", "abdomen", "p/a", "pa"] },
  chest: { title: "Chest", label: "chest", aliases: ["chest", "respiratory system", "rs"] },
  cvs: { title: "Cardiovascular system", label: "cardiovascular system", aliases: ["cardiovascular system", "cvs", "s1 s2", "s1s2", "heart sounds"] },
  cns: { title: "Central nervous system", label: "central nervous system", aliases: ["central nervous system", "cns", "neurological examination", "neuro"] },
  local: { title: "Local examination", label: "local examination", aliases: ["local examination", "local exam"] },
};

export const CVS_PILLS = ["S1 S2 heard", "Murmur", "JVP raised", "Pedal oedema", "Apex displaced", "Gallop / S3", "Pericardial rub"];
export const CNS_PILLS = [
  "Conscious, oriented", "Drowsy", "Confused", "Higher functions intact",
  "Power reduced", "Tone increased", "Tone decreased", "Reflexes brisk", "Reflexes diminished",
  "Plantar flexor", "Plantar extensor", "Neck stiffness", "Kernig's sign",
];

const SURGICAL_EXAM: ExamCardId[] = ["piccle", "vitals", "abdomen", "chest", "local"];
const MEDICINE_EXAM: ExamCardId[] = ["piccle", "vitals", "cvs", "chest", "abdomen", "cns"];

const EXAM_STEPS: Partial<Record<SpecialtyKey, ExamCardId[]>> = {
  internal_medicine: MEDICINE_EXAM,
  paediatrics: MEDICINE_EXAM,
  // These two keep Local examination: the chest diagram and the trauma body chart hang off it.
  pulmonary_medicine: ["piccle", "vitals", "chest", "cvs", "abdomen", "cns", "local"],
  emergency_medicine: ["piccle", "vitals", "cvs", "chest", "abdomen", "cns", "local"],
};

/**
 * The examination cards a unit walks, in order. A card the department does not walk is still
 * shown when the record already holds a value for it, so nothing recorded is hidden.
 */
export function examStepsFor(specialty?: string | null, recorded: (id: ExamCardId) => boolean = () => false): ExamCardId[] {
  const steps = EXAM_STEPS[(specialty ?? "") as SpecialtyKey] ?? SURGICAL_EXAM;
  const extra = (["local"] as ExamCardId[]).filter((id) => !steps.includes(id) && recorded(id));
  return [...steps, ...extra];
}

// --- the spoken-clerking format list -------------------------------------------------------

type FormatStep = { title: string; hint: string };

const HISTORY_FORMAT: FormatStep[] = [
  { title: "Chief complaints", hint: "each problem and how long it has been there — worst first" },
  {
    title: "History of present illness",
    hint: "for each complaint: onset, duration, progression, character, what makes it better or worse, associated symptoms",
  },
  { title: "Past history", hint: "diabetes, hypertension, TB, asthma, heart disease, similar episodes before" },
  { title: "Family history", hint: "relevant illnesses running in the family" },
  { title: "Medication history", hint: "current medicines and doses, any drug allergy" },
  { title: "Surgical history", hint: "previous operations, any anaesthetic trouble" },
  { title: "Menstrual & obstetric history", hint: "if applicable — last period, cycle, pregnancies and deliveries" },
  { title: "Personal history", hint: "diet, appetite, bowel and bladder, sleep, smoking, alcohol" },
];

const CLOSING_FORMAT: FormatStep[] = [
  { title: "Provisional diagnosis", hint: "what you think this is" },
  { title: "Plan", hint: "investigations, treatment, consent, referrals" },
];

const EXAM_FORMAT: Record<ExamCardId, FormatStep> = {
  piccle: { title: "General examination", hint: "build and nutrition, pallor, icterus, cyanosis, clubbing, lymph nodes, oedema" },
  vitals: { title: "Vitals", hint: "pulse, blood pressure, temperature, respiratory rate, SpO₂" },
  abdomen: { title: "Per abdomen", hint: "inspection, palpation, percussion, auscultation" },
  chest: { title: "Respiratory system", hint: "air entry, breath sounds, added sounds" },
  cvs: { title: "Cardiovascular system", hint: "S1 S2, murmurs, JVP, pedal oedema" },
  cns: { title: "Central nervous system", hint: "sensorium / GCS, higher functions, power, tone, reflexes, plantars, meningeal signs" },
  local: { title: "Local examination", hint: "the lump, wound or affected part in detail" },
};

/** The surgical list exactly as it has always read — CVS and CNS folded into "Other systems". */
const SURGICAL_FORMAT: FormatStep[] = [
  ...HISTORY_FORMAT,
  EXAM_FORMAT.piccle,
  EXAM_FORMAT.vitals,
  EXAM_FORMAT.abdomen,
  { title: "Other systems", hint: "chest, cardiovascular, neurological — whatever is relevant" },
  EXAM_FORMAT.local,
  ...CLOSING_FORMAT,
];

/**
 * What a full clerking covers on this unit, in the order it is taken. Mirrors the card walk.
 * On every unit a recorded male drops the menstrual & obstetric step;
 * a female or an unrecorded sex keeps it.
 */
export function clerkingFormatFor(specialty?: string | null, sex?: string | null): FormatStep[] {
  // A recorded male is never asked a menstrual history, on any unit — the card-by-card workspace
  // already hides that card for him; the spoken list matches it.
  const forSex = (list: FormatStep[]) =>
    sex === "M" ? list.filter((s) => s.title !== "Menstrual & obstetric history") : list;
  const steps = EXAM_STEPS[(specialty ?? "") as SpecialtyKey];
  if (!steps) return forSex(SURGICAL_FORMAT);
  return [...forSex(HISTORY_FORMAT), ...steps.map((id) => EXAM_FORMAT[id]), ...CLOSING_FORMAT];
}
