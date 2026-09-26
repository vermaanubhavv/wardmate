import type { HistoryTree } from "@/lib/history-check/types";
import { feverV1 } from "@/content/history-trees/fever.v1";
import { chestPainV1 } from "@/content/history-trees/chest-pain.v1";
import { breathlessnessV1 } from "@/content/history-trees/breathlessness.v1";
import { abdominalPainV1 } from "@/content/history-trees/abdominal-pain.v1";
import { jaundiceV1 } from "@/content/history-trees/jaundice.v1";
import { coughV1 } from "@/content/history-trees/cough.v1";
import { oedemaV1 } from "@/content/history-trees/oedema.v1";
import { headacheV1 } from "@/content/history-trees/headache.v1";
import { alteredSensoriumV1 } from "@/content/history-trees/altered-sensorium.v1";
import { limbWeaknessV1 } from "@/content/history-trees/limb-weakness.v1";
import { diarrhoeaV1 } from "@/content/history-trees/diarrhoea.v1";
import { generalisedWeaknessV1 } from "@/content/history-trees/generalised-weakness.v1";
import { giddinessV1 } from "@/content/history-trees/giddiness.v1";
import { decreasedUrineOutputV1 } from "@/content/history-trees/decreased-urine-output.v1";
import { constipationV1 } from "@/content/history-trees/constipation.v1";
import { abdominalDistensionV1 } from "@/content/history-trees/abdominal-distension.v1";
import { lumpV1 } from "@/content/history-trees/lump.v1";
import { bleedingPerRectumV1 } from "@/content/history-trees/bleeding-per-rectum.v1";
import { burningMicturitionV1 } from "@/content/history-trees/burning-micturition.v1";
import { lossOfWeightAppetiteV1 } from "@/content/history-trees/loss-of-weight-appetite.v1";
import { palpitationsV1 } from "@/content/history-trees/palpitations.v1";
import { jointPainV1 } from "@/content/history-trees/joint-pain.v1";
import { haematemesisV1 } from "@/content/history-trees/haematemesis.v1";
import { polyuriaV1 } from "@/content/history-trees/polyuria.v1";
import { lowBackPainV1 } from "@/content/history-trees/low-back-pain.v1";
import { soreThroatV1 } from "@/content/history-trees/sore-throat.v1";
import { feverWithRashV1 } from "@/content/history-trees/fever-with-rash.v1";
import { poisoningSnakebiteV1 } from "@/content/history-trees/poisoning-snakebite.v1";
import { dysphagiaV1 } from "@/content/history-trees/dysphagia.v1";
import { groinSwellingV1 } from "@/content/history-trees/groin-swelling.v1";
import { breastLumpV1 } from "@/content/history-trees/breast-lump.v1";
import { anorectalPainV1 } from "@/content/history-trees/anorectal-pain.v1";
import { legUlcerV1 } from "@/content/history-trees/leg-ulcer.v1";
import { scrotalSwellingV1 } from "@/content/history-trees/scrotal-swelling.v1";
import { headInjuryV1 } from "@/content/history-trees/head-injury.v1";
import { shockV1 } from "@/content/history-trees/shock.v1";
import { paediatricFeverV1 } from "@/content/history-trees/paediatric-fever.v1";
import { paediatricDiarrhoeaV1 } from "@/content/history-trees/paediatric-diarrhoea.v1";
import { paediatricBreathingV1 } from "@/content/history-trees/paediatric-breathing.v1";
import { paediatricSeizureV1 } from "@/content/history-trees/paediatric-seizure.v1";
import { bleedingPvV1 } from "@/content/history-trees/bleeding-pv.v1";
import { vaginalDischargeV1 } from "@/content/history-trees/vaginal-discharge.v1";
import { labourPainsV1 } from "@/content/history-trees/labour-pains.v1";
import { febrileNeutropeniaV1 } from "@/content/history-trees/febrile-neutropenia.v1";
import { haematuriaV1 } from "@/content/history-trees/haematuria.v1";
import { limbInjuryV1 } from "@/content/history-trees/limb-injury.v1";

/**
 * Every complaint tree the app ships, every version. Adding a complaint is a new file beside
 * this one and one line here — nothing under lib/history-check/ changes.
 *
 * Old versions stay listed: a stored result names the version it was run against, and the
 * card renders it with that version's labels and order rather than the newest one's.
 */
export const HISTORY_TREES: readonly HistoryTree[] = [
  feverV1,
  chestPainV1,
  breathlessnessV1,
  abdominalPainV1,
  jaundiceV1,
  coughV1,
  oedemaV1,
  headacheV1,
  alteredSensoriumV1,
  limbWeaknessV1,
  diarrhoeaV1,
  generalisedWeaknessV1,
  giddinessV1,
  decreasedUrineOutputV1,
  constipationV1,
  abdominalDistensionV1,
  lumpV1,
  bleedingPerRectumV1,
  burningMicturitionV1,
  lossOfWeightAppetiteV1,
  palpitationsV1,
  jointPainV1,
  haematemesisV1,
  polyuriaV1,
  lowBackPainV1,
  soreThroatV1,
  feverWithRashV1,
  poisoningSnakebiteV1,
  dysphagiaV1,
  groinSwellingV1,
  breastLumpV1,
  anorectalPainV1,
  legUlcerV1,
  scrotalSwellingV1,
  headInjuryV1,
  shockV1,
  paediatricFeverV1,
  paediatricDiarrhoeaV1,
  paediatricBreathingV1,
  paediatricSeizureV1,
  bleedingPvV1,
  vaginalDischargeV1,
  labourPainsV1,
  febrileNeutropeniaV1,
  haematuriaV1,
  limbInjuryV1,
];
