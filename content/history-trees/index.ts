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
import { earDischargeV1 } from "@/content/history-trees/ear-discharge.v1";
import { epistaxisV1 } from "@/content/history-trees/epistaxis.v1";
import { hoarsenessV1 } from "@/content/history-trees/hoarseness.v1";
import { redEyeV1 } from "@/content/history-trees/red-eye.v1";
import { visionLossV1 } from "@/content/history-trees/vision-loss.v1";
import { skinLesionV1 } from "@/content/history-trees/skin-lesion.v1";
import { lowMoodV1 } from "@/content/history-trees/low-mood.v1";
import { alteredBehaviourV1 } from "@/content/history-trees/altered-behaviour.v1";
import { burnsV1 } from "@/content/history-trees/burns.v1";
import { limbIschaemiaV1 } from "@/content/history-trees/limb-ischaemia.v1";
import { toothacheV1 } from "@/content/history-trees/toothache.v1";
import { haemoptysisV1 } from "@/content/history-trees/haemoptysis.v1";
import { snoringSleepinessV1 } from "@/content/history-trees/snoring-sleepiness.v1";
import { thyroidSwellingV1 } from "@/content/history-trees/thyroid-swelling.v1";
import { postOpProblemV1 } from "@/content/history-trees/post-op-problem.v1";
import { reducedFetalMovementsV1 } from "@/content/history-trees/reduced-fetal-movements.v1";
import { vomitingInPregnancyV1 } from "@/content/history-trees/vomiting-in-pregnancy.v1";
import { massPerVaginumV1 } from "@/content/history-trees/mass-per-vaginum.v1";
import { sickNewbornV1 } from "@/content/history-trees/sick-newborn.v1";
import { poorWeightGainV1 } from "@/content/history-trees/poor-weight-gain.v1";
import { paediatricAbdominalPainV1 } from "@/content/history-trees/paediatric-abdominal-pain.v1";
import { nasalObstructionV1 } from "@/content/history-trees/nasal-obstruction.v1";
import { earacheV1 } from "@/content/history-trees/earache.v1";
import { foreignBodyEntV1 } from "@/content/history-trees/foreign-body-ent.v1";
import { doubleVisionV1 } from "@/content/history-trees/double-vision.v1";
import { eyelidSwellingV1 } from "@/content/history-trees/eyelid-swelling.v1";
import { eyeInjuryV1 } from "@/content/history-trees/eye-injury.v1";
import { substanceUseV1 } from "@/content/history-trees/substance-use.v1";
import { anxietyV1 } from "@/content/history-trees/anxiety.v1";
import { memoryLossV1 } from "@/content/history-trees/memory-loss.v1";
import { blisteringRashV1 } from "@/content/history-trees/blistering-rash.v1";
import { erythrodermaV1 } from "@/content/history-trees/erythroderma.v1";
import { hypopigmentedPatchV1 } from "@/content/history-trees/hypopigmented-patch.v1";
import { handInjuryV1 } from "@/content/history-trees/hand-injury.v1";
import { pressureSoreV1 } from "@/content/history-trees/pressure-sore.v1";
import { postBurnContractureV1 } from "@/content/history-trees/post-burn-contracture.v1";
import { neckPainV1 } from "@/content/history-trees/neck-pain.v1";
import { limpV1 } from "@/content/history-trees/limp.v1";
import { boneSwellingV1 } from "@/content/history-trees/bone-swelling.v1";
import { difficultyPassingUrineV1 } from "@/content/history-trees/difficulty-passing-urine.v1";
import { loinPainV1 } from "@/content/history-trees/loin-pain.v1";
import { urinaryIncontinenceV1 } from "@/content/history-trees/urinary-incontinence.v1";
import { spinalInjuryV1 } from "@/content/history-trees/spinal-injury.v1";
import { shuntProblemV1 } from "@/content/history-trees/shunt-problem.v1";
import { neuralTubeSwellingV1 } from "@/content/history-trees/swelling-on-back-newborn.v1";
import { wheezeV1 } from "@/content/history-trees/wheeze.v1";
import { progressiveBreathlessnessV1 } from "@/content/history-trees/progressive-breathlessness.v1";
import { tbTreatmentProblemV1 } from "@/content/history-trees/tb-treatment-problem.v1";
import { roadTrafficAccidentV1 } from "@/content/history-trees/road-traffic-accident.v1";
import { heatIllnessV1 } from "@/content/history-trees/heat-illness.v1";
import { animalBiteV1 } from "@/content/history-trees/animal-bite.v1";
import { wateringEyeV1 } from "@/content/history-trees/watering-eye.v1";
import { squintV1 } from "@/content/history-trees/squint.v1";
import { ptosisV1 } from "@/content/history-trees/ptosis.v1";
import { flashesFloatersV1 } from "@/content/history-trees/flashes-floaters.v1";
import { proptosisV1 } from "@/content/history-trees/proptosis.v1";

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
  earDischargeV1,
  epistaxisV1,
  hoarsenessV1,
  redEyeV1,
  visionLossV1,
  skinLesionV1,
  lowMoodV1,
  alteredBehaviourV1,
  burnsV1,
  limbIschaemiaV1,
  toothacheV1,
  haemoptysisV1,
  snoringSleepinessV1,
  thyroidSwellingV1,
  postOpProblemV1,
  reducedFetalMovementsV1,
  vomitingInPregnancyV1,
  massPerVaginumV1,
  sickNewbornV1,
  poorWeightGainV1,
  paediatricAbdominalPainV1,
  nasalObstructionV1,
  earacheV1,
  foreignBodyEntV1,
  doubleVisionV1,
  eyelidSwellingV1,
  eyeInjuryV1,
  substanceUseV1,
  anxietyV1,
  memoryLossV1,
  blisteringRashV1,
  erythrodermaV1,
  hypopigmentedPatchV1,
  handInjuryV1,
  pressureSoreV1,
  postBurnContractureV1,
  neckPainV1,
  limpV1,
  boneSwellingV1,
  difficultyPassingUrineV1,
  loinPainV1,
  urinaryIncontinenceV1,
  spinalInjuryV1,
  shuntProblemV1,
  neuralTubeSwellingV1,
  wheezeV1,
  progressiveBreathlessnessV1,
  tbTreatmentProblemV1,
  roadTrafficAccidentV1,
  heatIllnessV1,
  animalBiteV1,
  wateringEyeV1,
  squintV1,
  ptosisV1,
  flashesFloatersV1,
  proptosisV1,
];
