/**
 * Suspected deep vein thrombosis — pathway definition v1.0.0. ONE score: the (two-tier)
 * Wells DVT score.
 *
 * One point each for nine clinical features, minus two if an alternative diagnosis is at
 * least as likely. Score ≥ 2 → DVT likely (proceed to compression ultrasound); < 2 → DVT
 * unlikely (a D-dimer can rule it out without imaging).
 *
 * STATUS: active — reviewed and signed off for pilot use by Dr. Anubhav on 2026-09-07;
 * departmental governance review still due (reviewDueAt). Sources: Wells PS et al., Lancet
 * 1997;350:1795–8; Wells PS et al., NEJM 2003;349:1227–35 (two-tier simplification).
 */

import type { CardDefinition, PathwayDefinition, TimeWindow } from "../types";

const W: TimeWindow = { anchor: "admission", startHours: -24, label: "at assessment" };

const yesNo = [
  { label: "No", record: "absent", satisfied: false, normal: true },
  { label: "Yes", record: "present", satisfied: true },
];

const clin = (componentId: string, label: string, inputKey: string, question: string, recordLabel: string, points: number = 1) => ({
  componentId,
  label,
  inputKey,
  canonicalUnit: null,
  window: W,
  selector: "first" as const,
  points,
  rule: { op: "present" as const },
  required: true,
  noAutoTask: true,
  clinicianAssessed: true,
  assess: { question, recordLabel, options: yesNo },
});

const card: CardDefinition = {
  cardId: "wells_dvt",
  title: "Wells score — deep vein thrombosis",
  shortName: "Wells DVT",
  citation:
    "Wells DVT (two-tier) — Wells PS et al., Lancet 1997;350:1795–8; NEJM 2003;349:1227–35. Score ≥ 2: DVT likely — proceed to compression ultrasound. Score < 2: DVT unlikely — a negative D-dimer can rule it out without imaging. The classic score subtracts 2 points when an alternative diagnosis is at least as likely; this card keeps that as an explicit override instead (see the last criterion) rather than a negative point value, so the number itself only ever counts up. Not validated in pregnancy or suspected recurrent DVT without adjustment.",
  type: "calculator",
  timingLabel: "at assessment",
  calculation: { kind: "sum_points" },
  recomputeOn: ["new_observation", "manual"],
  interpretationBands: [
    { min: 0, max: 1, text: "Wells DVT < 2 — DVT unlikely. A negative D-dimer can rule it out without imaging. If an alternative diagnosis was marked at least as likely, DVT is unlikely regardless of this number.", tone: "neutral" },
    { min: 2, max: 9, text: "Wells DVT ≥ 2 — DVT likely. Proceed to compression ultrasound. If an alternative diagnosis was marked at least as likely, treat as unlikely instead and reassess.", tone: "attention" },
  ],
  inputs: [
    clin("wells_dvt.cancer", "Active cancer (treatment ongoing, or within 6 months, or palliative)", "cancer_active", "Active cancer (treated within 6 months, or palliative)?", "Active cancer"),
    clin("wells_dvt.paralysis", "Paralysis, paresis, or recent plaster immobilisation of the lower extremity", "paralysis_or_cast", "Paralysis, paresis, or a recent cast on the leg?", "Paralysis / recent cast"),
    clin("wells_dvt.bedridden", "Recently bedridden > 3 days, or major surgery within 12 weeks", "recently_bedridden", "Bedridden > 3 days recently, or major surgery within 12 weeks?", "Recently bedridden / recent surgery"),
    clin("wells_dvt.tenderness", "Localised tenderness along the deep venous system", "deep_vein_tenderness", "Localised tenderness along the deep veins?", "Deep vein tenderness"),
    clin("wells_dvt.leg_swollen", "Entire leg swollen", "entire_leg_swollen", "Entire leg swollen?", "Entire leg swollen"),
    clin("wells_dvt.calf_swelling", "Calf swelling > 3 cm compared with the other leg (measured 10 cm below the tibial tuberosity)", "calf_swelling_3cm", "Calf swelling > 3 cm vs the other side?", "Calf swelling > 3 cm"),
    clin("wells_dvt.pitting_edema", "Pitting oedema confined to the symptomatic leg", "unilateral_pitting_edema", "Pitting oedema confined to the symptomatic leg?", "Unilateral pitting oedema"),
    clin("wells_dvt.collateral_veins", "Collateral superficial (non-varicose) veins", "collateral_superficial_veins", "Collateral superficial veins (non-varicose)?", "Collateral superficial veins"),
    clin("wells_dvt.prior_dvt", "Previously documented DVT", "prior_dvt", "Previously documented DVT?", "Prior DVT"),
    // The classic Wells item subtracts 2 points here. Points cannot go negative in this
    // engine, so this component contributes 0 either way and is answered for the record —
    // the override lives in the interpretation text above, not in the arithmetic. A "Yes"
    // here means: treat as DVT unlikely regardless of what the number above reads.
    clin("wells_dvt.alt_diagnosis", "An alternative diagnosis is at least as likely as DVT — overrides the score above to \"unlikely\" if Yes", "alt_diagnosis_as_likely", "Is an alternative diagnosis at least as likely as DVT (e.g. cellulitis, ruptured Baker's cyst)?", "Alternative diagnosis at least as likely", 0),
  ],
};

export const wellsDvtV1: PathwayDefinition = {
  pathwayId: "wells_dvt",
  pathwayVersion: "1.0.0",
  title: "Suspected deep vein thrombosis",
  status: "active",
  clinicalOwner: "Reviewed against the cited sources and signed off for pilot use by Dr. Anubhav — 2026-09-07. Single-clinician sign-off; Internal Medicine departmental review due 2027-09-01.",
  sourceReferences: [
    { label: "Wells PS et al., Lancet 1997", citation: "Value of assessment of pretest probability of deep-vein thrombosis in clinical management. Lancet 1997;350:1795–8." },
    { label: "Wells PS et al., NEJM 2003", citation: "Evaluation of D-dimer in the diagnosis of suspected deep-vein thrombosis. N Engl J Med 2003;349:1227–35." },
  ],
  reviewDueAt: "2027-09-01",
  diagnosisTriggers: {
    codes: ["I80", "I82.4"],
    textPatterns: [
      "deep vein thrombosis",
      "dvt",
      "? dvt",
      "suspected dvt",
      "calf swelling",
      "leg swelling for evaluation",
      "unilateral limb swelling",
    ],
    excludePatterns: ["dvt prophylaxis", "on dvt prophylaxis", "post dvt", "old dvt", "known dvt on treatment"],
  },
  eligibility: { minAgeYears: 16, notes: ["Not validated in pregnancy, or for a suspected recurrent DVT, without adjustment — use clinical judgement."] },
  exclusions: ["A patient already anticoagulated for a confirmed clot — this is a pre-test screen, not a monitoring tool."],
  cards: [card],
  tasks: [
    {
      key: "wells_dvt_next_step",
      cardId: "wells_dvt",
      componentId: null,
      action: "Order compression ultrasound (score ≥ 2) or a D-dimer (score < 2) per the result",
      reason: "The score exists to decide which test comes next, not to replace it.",
      priority: "soon",
      responsibleRole: "resident",
      institutionalToggle: null,
    },
  ],
  checkpoints: [],
  recomputePolicy: ["new_observation", "manual"],
  institutionalToggles: {},
};
