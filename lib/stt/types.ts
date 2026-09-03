/**
 * The seam for swapping speech engines.
 *
 * You will be comparing engines on Indian-accented medical speech, so nothing outside this
 * folder knows which one is in use. Adding a competitor means adding one file here and one
 * line in index.ts — no change to the recording UI, the database, or the extraction step.
 * Each entry records which engine produced it, so old recordings can be re-run and compared.
 */
export type Transcription = {
  text: string;
  provider: string;
  model: string;
};

/**
 * Optional per-call tuning. Today it carries the patient-selected Deepgram keyterm list — see
 * lib/transcription/selectMedicalKeyterms.ts. An engine that cannot use a field ignores it,
 * exactly as Sarvam and OpenAI already ignore each other's hint shapes.
 */
export type TranscribeOptions = {
  /**
   * A pre-selected, budget-checked keyterm list for this recording. When absent, an engine
   * that boosts keyterms falls back to the static ward list (MEDICAL_KEYTERMS).
   */
  keyterms?: string[];
};

export interface SttProvider {
  readonly provider: string;
  readonly model: string;
  transcribe(audio: Blob, hint: string, options?: TranscribeOptions): Promise<Transcription>;
}

/**
 * Passed to the engine as a vocabulary hint. General-purpose speech models mangle exactly
 * these words, and every engine worth testing accepts a hint like this, so it lives here
 * rather than inside any one provider.
 */
export const MEDICAL_VOCABULARY_HINT = [
  "Surgical ward round dictation in Indian English.",
  "Expect terms such as: lap chole, laparoscopic cholecystectomy, appendicectomy,",
  "laparotomy, hernioplasty, Ryle's tube, drain, serous, serosanguinous, bilious,",
  "afebrile, febrile, tachycardia, abdomen soft, distended, bowel sounds, flatus,",
  "tolerating orals, nil by mouth, NBM, suture line, wound healthy, dehiscence,",
  "post-op day, POD, ceftriaxone, metronidazole, ondansetron, pantoprazole,",
  "paracetamol, tramadol, enoxaparin, insulin, saline, Ringer lactate,",
  "haemoglobin, total count, TLC, creatinine, urea, bilirubin, potassium, sodium,",
  // Named because the engine reliably gets these wrong: PAC comes back as "PAS" or "pack",
  // and the ward's own shorthand comes back spelled out letter by letter. Prevention is
  // better than the correction pass in lib/corrections.ts, which only exists for what
  // still slips through.
  "PAC, pre-anaesthetic checkup, OT list, USG, CBC, LFT, RFT, ECG, NBM, ICD,",
  "stitch removal, per abdomen, catheter, Foley's, stoma, colostomy, ileostomy,",
  // The ward's own words, as an Indian resident actually says them on the round. A general
  // model has met none of these and writes an ordinary English word for each.
  "P/A soft, NVBS, S1 S2 normal, K/C/O, H/O, Koch's, GRBS, RBS, DLC, KFT, PT/INR, HPE,",
  "attender, casualty, OPD, IPD, MRD number, UHID, LAMA, DAMA, sister, OT, PAC fitness,",
  "DNS, RL, NS, PCV, blood transfusion, sugars, one-zero-one, one-one-one, SOS, stat,",
  // Prescribed by brand on every Indian chart; the generic name is rarely what is said.
  "Monocef, Taxim, Metrogyl, Emeset, Pan 40, Perinorm, Tramazac, Chymoral Forte, Voveran,",
  "Digene, Clexane, Lasix, PCM, Augmentin, Zosyn, Meropenem, Neomol.",
].join(" ");

/**
 * The same vocabulary as MEDICAL_VOCABULARY_HINT, but as a flat list of discrete terms.
 *
 * Some engines (Deepgram Nova-3) do not take a free-text prompt — they take a keyterm list,
 * where each entry is boosted individually. A prose paragraph is the wrong shape for that, so
 * the terms live here separately. Keep this in step with the hint above; the two are the same
 * knowledge in the two shapes engines ask for it.
 *
 * Deepgram recommends staying under ~100 keyterms, so this is the mishearings that actually
 * matter — surgical procedures, the ward's own shorthand, and the brand drug names an Indian
 * chart uses — not every ordinary English word a model already knows.
 *
 * THIS IS THE FALLBACK ONLY. The patient-scoped dictation routes (voice, case-history, round)
 * now build a ~20–50 term list tailored to the specific patient — their diagnoses, operation,
 * drains and drugs first — via lib/transcription. See docs/medical-dictation-keyterms.md. This
 * static list is what Deepgram gets when there is no patient context (the add-patient and
 * engine-comparison routes), held to the 80-term application cap by buildDeepgramUrl.
 */
export const MEDICAL_KEYTERMS: string[] = [
  // Procedures and operative terms
  "lap chole", "laparoscopic cholecystectomy", "appendicectomy", "laparotomy",
  "hernioplasty", "herniorrhaphy", "exploratory laparotomy", "Ryle's tube", "Foley's catheter",
  "suture line", "wound dehiscence", "burst abdomen", "stoma", "colostomy", "ileostomy",
  "stitch removal", "drain output", "serosanguinous", "bilious", "feculent",
  // Examination shorthand, said aloud on the round
  "per abdomen", "P/A soft", "abdomen soft", "NVBS", "normal vesicular breath sounds",
  "S1 S2 normal", "bowel sounds present", "passing flatus", "tolerating orals",
  "nil by mouth", "NBM", "afebrile", "febrile", "tachycardia", "post-op day", "POD",
  // Investigations and abbreviations
  "PAC", "pre-anaesthetic checkup", "PAC fitness", "OT list", "USG abdomen", "CBC", "LFT",
  "RFT", "KFT", "PT INR", "GRBS", "RBS", "DLC", "TLC", "HPE", "ECG", "ICD tube",
  "K/C/O", "H/O", "Koch's", "LAMA", "DAMA", "UHID", "MRD number", "casualty", "OPD", "IPD",
  // Fluids
  "Ringer lactate", "RL", "normal saline", "NS", "DNS", "isolyte",
  // Brand drugs an Indian chart actually lists
  "Monocef", "Taxim", "Magnex", "Metrogyl", "Emeset", "Pan 40", "Perinorm", "Tramazac",
  "Chymoral Forte", "Voveran", "Digene", "Clexane", "Lasix", "Augmentin", "Zosyn",
  "Meropenem", "Neomol", "Optineuron", "Rantac", "Zofer", "Piptaz",
  // Generic names that get mangled
  "ceftriaxone", "metronidazole", "ondansetron", "pantoprazole", "enoxaparin", "tramadol",
  "paracetamol", "piperacillin tazobactam", "amoxicillin clavulanate",
];
