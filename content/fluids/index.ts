import type { FluidTopic } from "@/lib/fluids/types";
import { acidBaseAndGiLossesV1 } from "@/content/fluids/acid-base-and-gi-losses.v1";
import { bodyWaterAndUnitsV1 } from "@/content/fluids/body-water-and-units.v1";
import { burnsV1 } from "@/content/fluids/burns.v1";
import { colloidsPlanningMaintenanceV1 } from "@/content/fluids/colloids-planning-maintenance.v1";
import { electrolyteDisordersOverviewV1 } from "@/content/fluids/electrolyte-disorders-overview.v1";
import { fluidResponsivenessV1 } from "@/content/fluids/fluid-responsiveness.v1";
import { fluidsInTheElderlyV1 } from "@/content/fluids/fluids-in-the-elderly.v1";
import { hepatorenalSyndromeV1 } from "@/content/fluids/hepatorenal-syndrome.v1";
import { ivFluidsOverviewV1 } from "@/content/fluids/iv-fluids-overview.v1";
import { liverPancreasLungDkaV1 } from "@/content/fluids/liver-pancreas-lung-dka.v1";
import { obstetricFluidsV1 } from "@/content/fluids/obstetric-fluids.v1";
import { paediatricFluidsV1 } from "@/content/fluids/paediatric-fluids.v1";
import { parenteralAdditivesV1 } from "@/content/fluids/parenteral-additives.v1";
import { parenteralNutritionDiseasesV1 } from "@/content/fluids/parenteral-nutrition-diseases.v1";
import { parenteralNutritionPrinciplesV1 } from "@/content/fluids/parenteral-nutrition-principles.v1";
import { perioperativeAndNeuroV1 } from "@/content/fluids/perioperative-and-neuro.v1";
import { resuscitationFluidsV1 } from "@/content/fluids/resuscitation-fluids.v1";
import { turpSyndromeV1 } from "@/content/fluids/turp-syndrome.v1";
import { urinaryDiversionV1 } from "@/content/fluids/urinary-diversion.v1";
import { volumeAssessmentV1 } from "@/content/fluids/volume-assessment.v1";

/** Every IV Fluid and Electrolyte Correction topic the Learn shelf can show. Add a file, add a line. */
export const FLUID_TOPICS: readonly FluidTopic[] = [
  acidBaseAndGiLossesV1,
  bodyWaterAndUnitsV1,
  burnsV1,
  colloidsPlanningMaintenanceV1,
  electrolyteDisordersOverviewV1,
  fluidResponsivenessV1,
  fluidsInTheElderlyV1,
  hepatorenalSyndromeV1,
  ivFluidsOverviewV1,
  liverPancreasLungDkaV1,
  obstetricFluidsV1,
  paediatricFluidsV1,
  parenteralAdditivesV1,
  parenteralNutritionDiseasesV1,
  parenteralNutritionPrinciplesV1,
  perioperativeAndNeuroV1,
  resuscitationFluidsV1,
  turpSyndromeV1,
  urinaryDiversionV1,
  volumeAssessmentV1,
];
