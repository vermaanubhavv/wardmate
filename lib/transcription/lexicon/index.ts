import type { MedicalLexiconEntry } from "./types";
import { CORE } from "./core";
import { INDIA } from "./india";
import { DEVICES } from "./devices";
import { INVESTIGATIONS } from "./investigations";
import { RADIOLOGY } from "./radiology";
import { DIAGNOSES } from "./diagnoses";
import { PROCEDURES } from "./procedures";
import { SURGICAL_ANATOMY } from "./surgery";
import { MEDICATIONS } from "./medications";
import { SCORES } from "./scores";
import { ONCOLOGY } from "./oncology";
import { INTERNAL_MEDICINE } from "./internal-medicine";
import { OBSTETRICS_GYNAECOLOGY } from "./obstetrics-gynaecology";
import { PULMONARY_MEDICINE } from "./pulmonary-medicine";
import { ENT_LEXICON } from "./ent";
import { PSYCHIATRY } from "./psychiatry";
import { OPHTHALMOLOGY } from "./ophthalmology";
import { DERMATOLOGY } from "./dermatology";
import { BURNS_PLASTIC_SURGERY } from "./burns-plastic-surgery";
import { ORTHOPAEDICS } from "./orthopaedics";
import { UROLOGY } from "./urology";
import { NEUROSURGERY } from "./neurosurgery";
import { PAEDIATRICS } from "./paediatrics";
import { EMERGENCY_MEDICINE } from "./emergency-medicine";

export * from "./types";

/**
 * The WardMate master medical lexicon — every category merged into one list.
 *
 * This is large by design and is NEVER sent whole to Deepgram. `selectMedicalKeyterms` reads
 * it and returns the 20–50 terms that matter for one patient. Adding vocabulary means editing
 * one category file; nothing else changes. See docs/medical-dictation-keyterms.md.
 */
export const MASTER_LEXICON: readonly MedicalLexiconEntry[] = Object.freeze([
  ...CORE,
  ...INDIA,
  ...DEVICES,
  ...INVESTIGATIONS,
  ...RADIOLOGY,
  ...DIAGNOSES,
  ...PROCEDURES,
  ...SURGICAL_ANATOMY,
  ...MEDICATIONS,
  ...SCORES,
  ...ONCOLOGY,
  ...INTERNAL_MEDICINE,
  ...OBSTETRICS_GYNAECOLOGY,
  ...PULMONARY_MEDICINE,
  ...ENT_LEXICON,
  ...PSYCHIATRY,
  ...OPHTHALMOLOGY,
  ...DERMATOLOGY,
  ...BURNS_PLASTIC_SURGERY,
  ...ORTHOPAEDICS,
  ...UROLOGY,
  ...NEUROSURGERY,
  ...PAEDIATRICS,
  ...EMERGENCY_MEDICINE,
]);
