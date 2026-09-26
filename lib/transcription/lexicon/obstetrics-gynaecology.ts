import type { MedicalLexiconEntry } from "./types";
import { PRIORITY } from "./types";

/**
 * The obstetrics & gynaecology keyterm core.
 *
 * WHY THESE WORDS. An O&G ward's own shorthand — gravida/para notation spoken as a run of
 * letters ("G3P2L2A0"), LMP/EDD/POG, the abbreviations for a caesarean and its indications
 * ("LSCS", "VBAC", "CPD", "fetal distress"), the hypertensive and haemorrhagic emergencies of
 * pregnancy ("PIH", "pre-eclampsia", "eclampsia", "PPH", "APH"), and the gynaecological
 * procedure names ("MTP", "D&C", "TAH", "colposcopy") — is exactly the vocabulary a general
 * medical model has least reason to know and is likeliest to mishear as an ordinary phrase.
 *
 * Where the surgical core is procedure- and anatomy-heavy and the medicine core is drug- and
 * serology-heavy, this one is OBSTETRIC-DATING- and DELIVERY-heavy: gestational age, the
 * gravidity/parity record, and the specific emergencies this ward is built around.
 *
 * Dictation vocabulary only — recognising a term here is not the same as WardMate having a
 * scoring pathway, a checklist or a discharge template for it. See
 * lib/specialty/obstetrics-gynaecology.ts for what the pack actually ships versus what is
 * deliberately deferred, the same "say what is not built yet" discipline the medicine and
 * oncology packs follow.
 *
 * Everything here is tagged `obstetrics-gynaecology`, so it is only ever boosted for a unit
 * whose pack asks for it — a surgical or medicine unit's keyterm budget is never spent on
 * "partograph".
 */

const OBG = "obstetrics-gynaecology" as const;

/**
 * `triggers` drives the selector's loose "context trigger" score path (lib/transcription/
 * selectMedicalKeyterms.ts `tokenIn`), which matches as a PLAIN SUBSTRING, not a whole word —
 * the same mechanism the "RA"/"ALA" bug (docs/specialty-packs.md §9) and the deliberately
 * excluded "RT" both come from. A short token here can silently fire on an unrelated word
 * ("ANC" inside "pancreatitis", "NST" inside "NSTEMI", "GA" inside "organ damage" — all found
 * by scanning this file's own triggers against the rest of the master lexicon before this rule
 * was added). Auto-derived triggers below 5 characters are dropped for that reason; `term` and
 * `aliases` are UNCHANGED and unaffected — exact-fact matching (a charted value equalling the
 * term or alias as a whole phrase) still works for every short form, it is only the substring
 * boost that is withheld from anything too short to be safe.
 */
function entry(
  term: string,
  categories: MedicalLexiconEntry["categories"],
  aliases: string[] = [],
  triggers: string[] = [],
  priority: number = PRIORITY.SPECIALTY
): MedicalLexiconEntry {
  return {
    term,
    aliases,
    categories,
    specialties: [OBG],
    triggers: [term, ...aliases, ...triggers]
      .map((t) => t.toLowerCase())
      .filter((t) => t.length >= 5),
    priority,
  };
}

// "diagnosis" doubles as the general clinical-documentation bucket here — the same broad use
// internal-medicine.ts makes of it for a non-pathological state like "altered sensorium".
const dx = (t: string, a: string[] = [], tr: string[] = []) =>
  entry(t, ["diagnosis"], a, tr, PRIORITY.EXACT_PATIENT);
// Documentation/dating terms (LMP, EDD, gravida/para, antenatal/postnatal) — a fact about the
// pregnancy, not a pathology, so kept at the lower default priority rather than EXACT_PATIENT.
const doc = (t: string, a: string[] = [], tr: string[] = []) =>
  entry(t, ["diagnosis"], a, tr, PRIORITY.SPECIALTY);
const proc = (t: string, a: string[] = [], tr: string[] = []) =>
  entry(t, ["procedure"], a, tr, PRIORITY.RELATED);
const drug = (t: string, a: string[] = [], tr: string[] = []) =>
  entry(t, ["medication"], a, tr, PRIORITY.RELATED);
const test = (t: string, a: string[] = [], tr: string[] = []) =>
  entry(t, ["investigation"], a, tr, PRIORITY.SCORING_OR_INVESTIGATION);

export const OBSTETRICS_GYNAECOLOGY: MedicalLexiconEntry[] = [
  // --- Dating and the gravidity/parity record ---------------------------------------
  doc("gravida", ["G1", "G2", "G3", "primigravida", "multigravida"], ["gravidity"]),
  doc("para", ["P1", "P2", "primipara", "multipara", "nullipara"], ["parity"]),
  doc("LMP", ["last menstrual period"]),
  doc("EDD", ["expected date of delivery", "expected date of confinement", "EDC"]),
  doc("POG", ["period of gestation", "period of amenorrhoea", "POA", "weeks of gestation"]),
  doc("gestational age", ["GA"]),
  doc("booked case", ["unbooked case", "unbooked"]),
  doc("antenatal", ["ANC", "antenatal checkup", "antenatal care"]),
  doc("postnatal", ["PNC", "postnatal period", "puerperium"]),
  doc("partograph", ["partogram"]),

  // --- Delivery and mode --------------------------------------------------------------
  proc("LSCS", ["lower segment caesarean section", "caesarean section", "cesarean section", "C-section"]),
  proc("emergency LSCS", ["emergency caesarean", "emergency section"]),
  proc("elective LSCS", ["elective caesarean", "elective section"]),
  doc("VBAC", ["vaginal birth after caesarean"]),
  doc("previous LSCS", ["previous caesarean", "prior LSCS", "P/LSCS", "scarred uterus"]),
  dx("CPD", ["cephalopelvic disproportion"]),
  dx("fetal distress", ["foetal distress"]),
  test("NST", ["non-stress test", "non stress test"]),
  test("CTG", ["cardiotocography", "cardiotocograph"]),
  proc("instrumental delivery", ["forceps delivery", "vacuum delivery", "vacuum extraction"]),
  proc("episiotomy", ["episiotomy given"]),
  dx("PROM", ["premature rupture of membranes", "prelabour rupture of membranes"]),
  dx("PPROM", ["preterm premature rupture of membranes"]),
  // "induced" dropped as an alias — collides with "alcohol induced pancreatitis",
  // "chemotherapy-induced ...", the same generic-word collision risk as "induction" itself.
  proc("induction of labour", ["IOL"]),
  proc("augmentation of labour", ["augmented"]),
  drug("oxytocin", ["pitocin", "syntocinon"]),
  drug("misoprostol", ["cytotec"]),

  // --- Hypertensive and haemorrhagic emergencies --------------------------------------
  dx("pregnancy-induced hypertension", ["PIH", "gestational hypertension"]),
  // "PE" is deliberately absent as a bare alias — it substring-matches inside "operative" (and
  // so fires as a false "context trigger" on any post-op patient), the same collision class as
  // the "RA"/"ALA" bug documented in docs/specialty-packs.md §9. The longer, safe forms carry
  // the term instead; also ambiguous with pulmonary embolism on a ward that sees both.
  dx("pre-eclampsia", ["preeclampsia", "severe pre-eclampsia"]),
  dx("eclampsia", ["eclamptic fit"]),
  // "eclampsia"/"pre-eclampsia" as explicit triggers here are legitimate — they pull this drug
  // in from a DIFFERENT entry's diagnosis text, not a duplicate of magnesium sulfate's own name.
  drug("magnesium sulfate", ["MgSO4", "Mag sulf", "magsulf"], ["eclampsia", "pre-eclampsia"]),
  dx("antepartum haemorrhage", ["APH", "antepartum hemorrhage"]),
  dx("postpartum haemorrhage", ["PPH", "postpartum hemorrhage"]),
  dx("placenta praevia", ["placenta previa"]),
  dx("abruptio placentae", ["placental abruption", "abruption"]),
  dx("uterine atony", ["atonic PPH", "atonic uterus"], ["atony"]),
  dx("retained placenta", ["retained products of conception", "RPOC"]),
  dx("PPH drill", ["obstetric emergency drill", "code obstetric"]),

  // --- Diabetes, Rh status and fetal wellbeing ----------------------------------------
  dx("gestational diabetes mellitus", ["GDM"]),
  test("OGTT", ["oral glucose tolerance test"]),
  dx("Rh negative", ["Rh-negative", "rhesus negative"]),
  // "anti-D" (the bare hyphenated form) dropped — collides with "anti-dsDNA"/"anti-ds-DNA",
  // the lupus autoantibody test already in the medicine lexicon.
  drug("anti-D injection", ["Rhogam"]),
  dx("IUGR", ["intrauterine growth restriction", "fetal growth restriction", "FGR"]),
  dx("oligohydramnios", ["reduced liquor", "decreased AFI"]),
  dx("polyhydramnios", ["increased liquor", "increased AFI"]),
  test("AFI", ["amniotic fluid index"]),
  dx("fetal heart sound", ["FHS", "FHR", "fetal heart rate"]),
  dx("intrauterine death", ["IUD", "IUFD", "intrauterine fetal death"]),

  // --- Early pregnancy and gynaecology -------------------------------------------------
  dx("ectopic pregnancy", ["tubal pregnancy", "ruptured ectopic"], ["ectopic"]),
  dx("missed abortion", ["missed miscarriage"]),
  dx("incomplete abortion", ["incomplete miscarriage"]),
  dx("threatened abortion", ["threatened miscarriage"]),
  proc("MTP", ["medical termination of pregnancy", "termination of pregnancy"]),
  proc("D&C", ["dilatation and curettage", "D and C"]),
  proc("evacuation", ["suction evacuation", "MVA", "manual vacuum aspiration"]),
  dx("molar pregnancy", ["hydatidiform mole", "H mole"]),
  dx("PCOD", ["PCOS", "polycystic ovarian disease", "polycystic ovary syndrome"]),
  dx("fibroid uterus", ["uterine fibroid", "leiomyoma"], ["fibroid"]),
  dx("ovarian cyst", ["adnexal cyst", "ovarian mass"]),
  // "torsion" alone was the trigger, which fired inside "testicular torsion" once urology
  // shipped — a gynaecological keyterm pulled into a scrotal dictation. Narrowed rather than
  // the test loosened, the same fix the pulmonary collisions took.
  dx("adnexal torsion", ["ovarian torsion"], ["torsion of ovary", "adnexal torsion"]),
  proc("TAH", ["total abdominal hysterectomy"]),
  proc("VH", ["vaginal hysterectomy"]),
  proc("laparoscopic hysterectomy", ["TLH", "total laparoscopic hysterectomy"]),
  proc("tubal ligation", ["bilateral tubal ligation", "BTL", "sterilisation", "sterilization"]),
  proc("laparoscopic tubal ligation", ["LTL"]),
  proc("colposcopy", ["colposcopy done"]),
  test("Pap smear", ["Papanicolaou smear", "pap test"]),
  dx("PID", ["pelvic inflammatory disease"]),
  dx("abnormal uterine bleeding", ["AUB", "dysfunctional uterine bleeding", "DUB"]),
];
