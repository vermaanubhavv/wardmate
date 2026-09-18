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
import { palpitationsV1 } from "@/content/history-trees/palpitations.v1";
import { syncopeV1 } from "@/content/history-trees/syncope.v1";
import { giBleedV1 } from "@/content/history-trees/gi-bleed.v1";
import { haemoptysisV1 } from "@/content/history-trees/haemoptysis.v1";
import { jointPainV1 } from "@/content/history-trees/joint-pain.v1";
import { weaknessFatigueV1 } from "@/content/history-trees/weakness-fatigue.v1";
import { urinarySymptomsV1 } from "@/content/history-trees/urinary-symptoms.v1";
import { abdominalDistensionV1 } from "@/content/history-trees/abdominal-distension.v1";
import { poisoningV1 } from "@/content/history-trees/poisoning.v1";
import { snakeBiteV1 } from "@/content/history-trees/snake-bite.v1";
import { vertigoV1 } from "@/content/history-trees/vertigo.v1";
import { weightLossV1 } from "@/content/history-trees/weight-loss.v1";
import { diabetesPolyuriaV1 } from "@/content/history-trees/diabetes-polyuria.v1";
import { neckSwellingV1 } from "@/content/history-trees/neck-swelling.v1";

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
  palpitationsV1,
  syncopeV1,
  giBleedV1,
  haemoptysisV1,
  jointPainV1,
  weaknessFatigueV1,
  urinarySymptomsV1,
  abdominalDistensionV1,
  poisoningV1,
  snakeBiteV1,
  vertigoV1,
  weightLossV1,
  diabetesPolyuriaV1,
  neckSwellingV1,
];
