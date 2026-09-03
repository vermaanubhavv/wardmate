/**
 * WardMate's Indian clinical vocabulary + Deepgram Nova-3 Medical keyterm system.
 *
 * Flow:  MASTER_LEXICON → deriveDictationContext(patient) → selectMedicalKeyterms → buildDeepgramUrl
 *
 * See docs/medical-dictation-keyterms.md for the why and how.
 */
export {
  MASTER_LEXICON,
  MASTER_LEXICON_SIZE,
  mergeLexicon,
  PRIORITY,
} from "./lexicon";
export type {
  MedicalLexiconEntry,
  LexiconCategory,
  LexiconProvider,
  DictationContext,
  SelectedKeyterm,
  SelectKeytermOptions,
  Specialty,
  NoteType,
} from "./lexicon";

export {
  selectMedicalKeyterms,
  getDeepgramKeyterms,
  describeSelection,
  estimateKeytermTokens,
  estimateTotalTokens,
} from "./selectMedicalKeyterms";

export {
  buildDeepgramUrl,
  buildDeepgramParams,
  keytermBudget,
  DEEPGRAM_LISTEN_URL,
  WARDMATE_TOKEN_CEILING,
  DEEPGRAM_TOKEN_LIMIT,
  MAX_KEYTERMS,
} from "./buildDeepgramUrl";

export {
  deriveDictationContext,
  getPatientDictationKeyterms,
  DEFAULT_SPECIALTY,
} from "./patient-context";
