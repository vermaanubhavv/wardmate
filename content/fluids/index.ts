import type { FluidTopic } from "@/lib/fluids/types";
import { bodyWaterAndUnitsV1 } from "@/content/fluids/body-water-and-units.v1";
import { burnsV1 } from "@/content/fluids/burns.v1";
import { colloidsPlanningMaintenanceV1 } from "@/content/fluids/colloids-planning-maintenance.v1";
import { fluidResponsivenessV1 } from "@/content/fluids/fluid-responsiveness.v1";
import { fluidsInTheElderlyV1 } from "@/content/fluids/fluids-in-the-elderly.v1";
import { hepatorenalSyndromeV1 } from "@/content/fluids/hepatorenal-syndrome.v1";
import { hypercalcaemiaV1 } from "@/content/fluids/hypercalcaemia.v1";
import { hyperkalaemiaV1 } from "@/content/fluids/hyperkalaemia.v1";
import { hypernatraemiaV1 } from "@/content/fluids/hypernatraemia.v1";
import { hypocalcaemiaV1 } from "@/content/fluids/hypocalcaemia.v1";
import { hypokalaemiaV1 } from "@/content/fluids/hypokalaemia.v1";
import { hyponatraemiaV1 } from "@/content/fluids/hyponatraemia.v1";
import { ivFluidsOverviewV1 } from "@/content/fluids/iv-fluids-overview.v1";
import { liverPancreasLungDkaV1 } from "@/content/fluids/liver-pancreas-lung-dka.v1";
import { obstetricFluidsV1 } from "@/content/fluids/obstetric-fluids.v1";
import { paediatricFluidsV1 } from "@/content/fluids/paediatric-fluids.v1";
import { parenteralNutritionAdministrationV1 } from "@/content/fluids/parenteral-nutrition-administration.v1";
import { parenteralNutritionDiseasesV1 } from "@/content/fluids/parenteral-nutrition-diseases.v1";
import { parenteralNutritionPrinciplesV1 } from "@/content/fluids/parenteral-nutrition-principles.v1";
import { perioperativeAndNeuroV1 } from "@/content/fluids/perioperative-and-neuro.v1";
import { resuscitationFluidsV1 } from "@/content/fluids/resuscitation-fluids.v1";
import { turpSyndromeV1 } from "@/content/fluids/turp-syndrome.v1";
import { urinaryDiversionV1 } from "@/content/fluids/urinary-diversion.v1";
import { calciumAndHypertonicDextroseV1 } from "@/content/fluids/calcium-and-hypertonic-dextrose.v1";
import { hypertonicSalineV1 } from "@/content/fluids/hypertonic-saline.v1";
import { magnesiumSulfateV1 } from "@/content/fluids/magnesium-sulfate.v1";
import { potassiumChlorideAndPhosphateV1 } from "@/content/fluids/potassium-chloride-and-phosphate.v1";
import { sodiumBicarbonateV1 } from "@/content/fluids/sodium-bicarbonate.v1";
import { hypophosphataemiaV1 } from "@/content/fluids/hypophosphataemia.v1";
import { hyperphosphataemiaV1 } from "@/content/fluids/hyperphosphataemia.v1";
import { hypomagnesaemiaV1 } from "@/content/fluids/hypomagnesaemia.v1";
import { hypermagnesaemiaV1 } from "@/content/fluids/hypermagnesaemia.v1";
import { acidBaseBasicsV1 } from "@/content/fluids/acid-base-basics.v1";
import { metabolicAcidosisV1 } from "@/content/fluids/metabolic-acidosis.v1";
import { metabolicAlkalosisV1 } from "@/content/fluids/metabolic-alkalosis.v1";
import { respiratoryAcidBaseV1 } from "@/content/fluids/respiratory-acid-base.v1";
import { giLossesAndUpperGiBleedingV1 } from "@/content/fluids/gi-losses-and-upper-gi-bleeding.v1";
import { volumeAssessmentV1 } from "@/content/fluids/volume-assessment.v1";

/** Every IV Fluid and Electrolyte Correction topic the Learn shelf can show. Add a file, add a line. */
export const FLUID_TOPICS: readonly FluidTopic[] = [
  bodyWaterAndUnitsV1,
  burnsV1,
  colloidsPlanningMaintenanceV1,
  fluidResponsivenessV1,
  fluidsInTheElderlyV1,
  hepatorenalSyndromeV1,
  hypercalcaemiaV1,
  hyperkalaemiaV1,
  hypernatraemiaV1,
  hypocalcaemiaV1,
  hypokalaemiaV1,
  hyponatraemiaV1,
  ivFluidsOverviewV1,
  liverPancreasLungDkaV1,
  obstetricFluidsV1,
  paediatricFluidsV1,
  parenteralNutritionAdministrationV1,
  parenteralNutritionDiseasesV1,
  parenteralNutritionPrinciplesV1,
  perioperativeAndNeuroV1,
  resuscitationFluidsV1,
  turpSyndromeV1,
  urinaryDiversionV1,
  volumeAssessmentV1,
  // Chapters 10–14 from the full edition, replacing the opening-only parenteral-additives topic.
  calciumAndHypertonicDextroseV1,
  hypertonicSalineV1,
  magnesiumSulfateV1,
  potassiumChlorideAndPhosphateV1,
  sodiumBicarbonateV1,
  // Chapters 26–29 from the full edition, replacing the opening-only phosphate/magnesium overview.
  hypophosphataemiaV1,
  hyperphosphataemiaV1,
  hypomagnesaemiaV1,
  hypermagnesaemiaV1,
  // Chapters 30–34 from the full edition (text transcription), replacing the opening-only acid–base topic.
  acidBaseBasicsV1,
  metabolicAcidosisV1,
  metabolicAlkalosisV1,
  respiratoryAcidBaseV1,
  giLossesAndUpperGiBleedingV1,
];
