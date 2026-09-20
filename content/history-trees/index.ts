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
];
