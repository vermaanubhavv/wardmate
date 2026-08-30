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

export interface SttProvider {
  readonly provider: string;
  readonly model: string;
  transcribe(audio: Blob, hint: string): Promise<Transcription>;
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
