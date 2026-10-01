import type { SlotState } from "@/lib/history-check/types";
import type { SourceEntry } from "@/lib/history-check/sources";

/**
 * Synthetic dictations with known answers, for scripts/eval-history-check.ts.
 *
 * EVERY PATIENT HERE IS INVENTED. Names are not used; beds, ages and stories are made up.
 * Nothing in this file may be copied from a real record.
 *
 * Each case says what a subset of slots MUST come out as after validation. Slots not listed
 * are not scored. The important expectations are the "unasked" ones — a symptom never
 * mentioned must not become a negative, whatever the model is inclined to write.
 *
 * All dictations are English, as this ward dictates. Attendant-narrated ones say so in the
 * words, the way a resident does.
 */

export type EvalCase = {
  id: string;
  title: string;
  /** Which tree to run this case against. Defaults to "fever", which most cases use. */
  treeId?: string;
  patient: { bed: string | null; age_years: number | null; sex: string | null };
  entries: SourceEntry[];
  expect: Partial<Record<string, SlotState>>;
  /** Slots that must carry a conflict after validation. */
  expectConflict?: string[];
  expectWrongPatient?: boolean;
  /** Why this case exists — printed with the result. */
  note: string;
};

const voice = (id: string, text: string, day = 10): SourceEntry => ({
  id,
  source: "voice",
  transcript: text,
  recorded_at: `2026-09-${String(day).padStart(2, "0")}T03:00:00Z`,
  observations: [],
});

const manual = (id: string, lines: [string, string][], day = 10): SourceEntry => ({
  id,
  source: "manual",
  transcript: null,
  recorded_at: `2026-09-${String(day).padStart(2, "0")}T04:00:00Z`,
  observations: lines.map(([label, value_text]) => ({ label, value_text })),
});

export const EVAL_CASES: EvalCase[] = [
  {
    id: "plain-english",
    title: "Plain English, mostly positives, two explicit negatives",
    patient: { bed: "MW-4", age_years: 34, sex: "male" },
    entries: [
      voice(
        "e1",
        "Chief complaints fever since 5 days. History of presenting illness: fever is high grade, continuous, associated with chills and rigors, comes down with paracetamol for a few hours. Headache present, retro-orbital pain present, body ache present. No vomiting, no rash. Took some tablets from a local doctor for two days."
      ),
    ],
    expect: {
      duration: "positive",
      grade: "positive",
      pattern: "positive",
      chills_rigors: "positive",
      relieving: "positive",
      headache: "positive",
      retro_orbital_pain: "positive",
      body_ache: "positive",
      vomiting: "negative",
      rash: "negative",
      prior_treatment: "positive",
      // Never mentioned — must stay unasked.
      bleeding: "unasked",
      cough: "unasked",
      neck_stiffness: "unasked",
      altered_sensorium: "unasked",
      urine_output: "unasked",
      mosquito_exposure: "unasked",
      jaundice: "unasked",
      diarrhoea: "unasked",
    },
    note: "Baseline. Watch that nothing not mentioned becomes negative.",
  },
  {
    id: "attendant",
    title: "Attendant-narrated, sparse, with an explicit informant line",
    patient: { bed: "MW-9", age_years: 68, sex: "female" },
    entries: [
      voice(
        "e1",
        "History given by the son, patient is drowsy. Fever for about a week, on and off. Son says she has not been eating well and has been confused since yesterday. Not able to say about headache. No loose stools."
      ),
    ],
    expect: {
      informant: "positive",
      duration: "positive",
      pattern: "positive",
      altered_sensorium: "positive",
      appetite: "positive",
      diarrhoea: "negative",
      // "Not able to say about headache" is not a denial of headache.
      headache: "unasked",
      neck_stiffness: "unasked",
      seizures: "unasked",
      vomiting: "unasked",
      rash: "unasked",
    },
    note: "'Not able to say about headache' contains 'not' and 'headache' but is not a negative. The validator's clause rule should not rescue a wrong model answer here, so this tests the model.",
  },
  {
    id: "silence-only",
    title: "Adversarial: a diagnosed case with almost no history",
    patient: { bed: "SW-2", age_years: 45, sex: "male" },
    entries: [voice("e1", "Known case of dengue, admitted for monitoring. Fever since 3 days. Platelets 80 thousand outside.")],
    expect: {
      duration: "positive",
      prior_investigations: "positive",
      // A dengue label must not seed dengue-shaped answers.
      retro_orbital_pain: "unasked",
      rash: "unasked",
      bleeding: "unasked",
      headache: "unasked",
      body_ache: "unasked",
      vomiting: "unasked",
      mosquito_exposure: "unasked",
      urine_output: "unasked",
      severe_abdominal_pain: "unasked",
    },
    note: "The diagnosis on record invites the model to fill in the classic picture. Everything must stay unasked.",
  },
  {
    id: "ambiguous-negation",
    title: "Adversarial: negation words that do not deny the item",
    patient: { bed: "MW-1", age_years: 29, sex: "male" },
    entries: [
      voice(
        "e1",
        "Fever since 4 days. No fever earlier this month, but fever now every evening. Vomiting not much, once or twice a day. Not sure about rash, could not see properly. No history of travel."
      ),
    ],
    expect: {
      duration: "positive",
      diurnal: "positive",
      // "Vomiting not much, once or twice a day" is vomiting PRESENT.
      vomiting: "positive",
      // "Not sure about rash" is not a denial.
      rash: "unasked",
      travel: "negative",
      headache: "unasked",
    },
    note: "Three traps: a negated past fever, 'not much' meaning present, and 'not sure'. Vomiting must not become negative.",
  },
  {
    id: "contradiction",
    title: "Patient and attendant contradict each other in one dictation",
    patient: { bed: "MW-6", age_years: 52, sex: "male" },
    entries: [
      voice(
        "e1",
        "Fever since one week with chills. Patient says no vomiting. Wife says he vomited twice last night. No cough. Passing urine normally."
      ),
    ],
    expect: {
      duration: "positive",
      chills_rigors: "positive",
      cough: "negative",
      urine_output: "negative",
      rash: "unasked",
    },
    expectConflict: ["vomiting"],
    note: "Vomiting must carry a conflict rather than a chosen side. Its state may be either; the conflict is what is scored.",
  },
  {
    id: "two-entries-contradict",
    title: "Two entries on different days disagree",
    patient: { bed: "MW-6", age_years: 52, sex: "male" },
    entries: [
      voice("e1", "Fever since 3 days, no headache, no body ache.", 9),
      manual("e2", [["history of presenting illness", "fever: headache present since admission, throbbing, frontal"]], 10),
    ],
    expect: { duration: "positive", body_ache: "negative" },
    expectConflict: ["headache"],
    note: "The first statement's state stands and the later one is the conflict. Scored on the conflict only.",
  },
  {
    id: "wrong-patient",
    title: "Adversarial: the dictation says it is about a different bed",
    patient: { bed: "SW-12", age_years: 60, sex: "female" },
    entries: [voice("e1", "Sorry, this is bed 7's history, not this patient. Fever since 2 days with rigors, no vomiting, no rash.")],
    expect: { duration: "unasked", chills_rigors: "unasked", vomiting: "unasked", rash: "unasked" },
    expectWrongPatient: true,
    note: "Everything must be unasked and the wrong-patient flag set with a verbatim quote.",
  },
  {
    id: "manual-workspace",
    title: "Typed in the review workspace, one line per section",
    patient: { bed: "MW-3", age_years: 40, sex: "female" },
    entries: [
      manual("e1", [
        ["chief complaints", "fever x 10 days"],
        ["history of presenting illness", "fever: low grade, evening rise, with night sweats and loss of appetite. no cough. lost about 3 kg."],
        ["past history", "no h/o DM, HTN, TB"],
      ]),
    ],
    expect: {
      duration: "positive",
      grade: "positive",
      diurnal: "positive",
      night_sweats: "positive",
      appetite: "positive",
      weight_loss: "positive",
      cough: "negative",
      // "no h/o DM, HTN, TB" denies past TB — the tb_contact slot's terms include "tb".
      tb_contact: "negative",
      headache: "unasked",
      rash: "unasked",
      breathlessness: "unasked",
    },
    note: "Manual entries are line-per-line sources. Also checks a denial list is read as a denial.",
  },
  {
    id: "post-op",
    title: "Post-operative fever, surgical ward",
    patient: { bed: "SW-8", age_years: 55, sex: "male" },
    entries: [
      voice(
        "e1",
        "Post op day 3 lap chole, fever since last night, 101 documented, single spike. Complains of pain at the port site, no discharge from the wound. No cough, no breathlessness. Urine output adequate, catheter removed yesterday. No calf pain."
      ),
    ],
    expect: {
      duration: "positive",
      grade: "positive",
      recent_surgery: "positive",
      local_infection: "positive",
      cough: "negative",
      breathlessness: "negative",
      calf_pain: "negative",
      urine_output: "negative",
      urinary: "unasked",
      rash: "unasked",
    },
    note: "'No discharge from the wound' is a negative for a sub-item but port-site pain makes local_infection positive; either positive or negative for that slot is defensible, only positive is scored here.",
  },
  {
    id: "thyroid-swelling",
    title: "Neck swelling, surgical ward",
    treeId: "thyroid_swelling",
    patient: { bed: "SW-3", age_years: 38, sex: "female" },
    entries: [
      voice(
        "e1",
        "Chief complaint swelling in front of the neck since 2 years. Swelling moves up on swallowing. Gradually increasing, no sudden increase. No pain. No difficulty in swallowing, no difficulty in breathing, voice is normal. Complains of palpitations and weight loss despite eating well, cannot tolerate heat. No radiation to the neck ever."
      ),
    ],
    expect: {
      duration: "positive",
      moves_on_swallowing: "positive",
      size_change: "positive",
      pain: "negative",
      pressure_symptoms: "negative",
      voice_change: "negative",
      overactive_features: "positive",
      neck_radiation: "negative",
      underactive_features: "unasked",
      eye_symptoms: "unasked",
      family_thyroid_cancer: "unasked",
      surg_previous_operations: "unasked",
    },
    note: "Checks that the thyroid-specific questions are read (movement on swallowing, pressure symptoms) and that the surgical background stays unasked rather than being assumed absent.",
  },
  {
    id: "post-op-leak",
    title: "Problem after an operation, day five",
    treeId: "post_op_problem",
    patient: { bed: "SW-11", age_years: 48, sex: "male" },
    entries: [
      voice(
        "e1",
        "Post operative day 5 of emergency laparotomy with resection anastomosis for perforation. Since yesterday fever with chills. Abdomen distended and painful all over, worse than the wound. Drain output has become greenish and increased. Has not passed flatus since the operation. Vomited twice, bilious. No cough, no breathlessness. Urine output reduced since morning. Not on any blood thinners."
      ),
    ],
    expect: {
      which_operation: "positive",
      day_of_onset: "positive",
      fever: "positive",
      drain_change: "positive",
      flatus_stool: "positive",
      abdominal_pain_distension: "positive",
      vomiting: "positive",
      bilious_faeculent_discharge: "positive",
      fever_with_rigors_late: "positive",
      urine_output_fall: "positive",
      breathing_cough: "negative",
      surg_blood_thinners: "negative",
      calf_leg: "unasked",
      wound_gaping_gush: "unasked",
      confusion_drowsiness: "unasked",
    },
    note: "The post-operative day and the operation carry half the history. 'No cough, no breathlessness' is a negative; the wound and the calf were never mentioned and must stay unasked.",
  },
  {
    id: "burns-inhalation",
    title: "Flame burn in a closed room",
    treeId: "burns",
    patient: { bed: "BW-2", age_years: 27, sex: "female" },
    entries: [
      voice(
        "e1",
        "Brought with flame burns sustained about 4 hours back, stove burst inside a closed kitchen, clothes caught fire, rolled on the ground. Burns over face, neck, chest and both arms. Voice is hoarse, soot present in the mouth, nasal hair singed. Was not unconscious at the scene. Only cold water was poured at home, nothing else applied. Has not passed urine since the burn. Attendant says it was accidental, account is the same from the patient."
      ),
    ],
    expect: {
      time_of_injury: "positive",
      agent: "positive",
      circumstances: "positive",
      body_areas: "positive",
      closed_space: "positive",
      duration_contact: "positive",
      first_aid: "positive",
      airway_symptoms: "positive",
      // "was not unconscious at the scene" is an explicit denial of one of this slot's terms.
      other_injuries: "negative",
      // "has not passed urine since the burn" reads as a negative for the slot ("passing urine")
      // and is the most alarming line in the dictation. The state is right; what it means is not
      // this module's to say.
      urine_output: "negative",
      breathing_difficulty: "unasked",
      circumferential_burn: "unasked",
      electrical_high_voltage: "unasked",
      chemical_ongoing: "unasked",
      // large_area_extremes_of_age is deliberately unscored: since the Schwartz review it asks the
      // area alone, and "face, neck, chest and both arms" reads either way to the model.
      pain_sensation: "unasked",
      tetanus_status: "unasked",
      comorbidity: "unasked",
      // "account is the same from the patient" carries no negation word before a term, so the
      // validator cannot turn it into a negative and must leave the slot unasked.
      inconsistent_account: "unasked",
    },
    note: "The airway questions must come out of the words that carry them (hoarse, soot, singed) and the chemical and electrical branches must stay unasked for a flame burn.",
  },
  {
    id: "preop-elderly-cholecystectomy",
    title: "Older patient posted for an elective gallbladder operation",
    treeId: "preop_assessment",
    patient: { bed: "SW-4", age_years: 68, sex: "female" },
    entries: [
      voice(
        "e1",
        "Posted for laparoscopic cholecystectomy, elective, for gallstones since 2 years. History given by patient and her son. Diabetic for 10 years on tablets. Had a stent put in the heart last year in March, on blood thinners since. Climbs two flights of stairs with breathlessness. No chest pain at rest. Snores loudly per son. Son says she has become forgetful over the past year. No bleeding after tooth extraction. Lives with son."
      ),
    ],
    expect: {
      planned_operation: "positive",
      diabetes: "positive",
      recent_mi_or_stent: "positive",
      angina_exertion: "positive",
      unstable_cardiac: "negative",
      surg_blood_thinners: "positive",
      surg_snoring_apnoea: "positive",
      memory_cognition: "positive",
      surg_bleeding_tendency: "negative",
      previous_clot: "unasked",
      surg_steroid_past_year: "unasked",
      surg_weight_loss: "unasked",
      alcohol: "unasked",
    },
    note: "The stent and its date are a red flag that must come out positive; the son's report of forgetfulness counts. Breathless on two flights is exertional (positive); 'no chest pain at rest' belongs to the at-rest red flag, not the exertional question. Clots, steroids, weight and alcohol were never mentioned and must stay unasked.",
  },
  {
    id: "varicose-standing-job",
    title: "Prominent leg veins in a man who stands all day",
    treeId: "varicose_veins",
    patient: { bed: "OPD-7", age_years: 42, sex: "male" },
    entries: [
      voice(
        "e1",
        "Prominent veins over left calf and inner thigh since 5 years. Heaviness of the leg, worse in the evening after standing, better on raising the leg. Works as a traffic constable, stands 8 hours a day. Itching above the ankle. No ulcer. No bleeding from vein. Father had varicose veins."
      ),
    ],
    expect: {
      side_extent: "positive",
      aching_heaviness: "positive",
      worse_standing_evening: "positive",
      occupation_standing: "positive",
      skin_change: "positive",
      family_history: "positive",
      venous_ulcer: "negative",
      variceal_bleed: "negative",
      tender_cord: "unasked",
      sudden_leg_swelling: "unasked",
      previous_dvt_injury: "unasked",
      arterial_symptoms: "unasked",
    },
    note: "Ulcer and bleeding were explicitly denied; thrombophlebitis, DVT history and arterial symptoms were never asked and must not become negatives.",
  },
  {
    id: "ventral-paraumbilical",
    title: "Swelling above the navel in a middle-aged woman",
    treeId: "ventral_hernia",
    patient: { bed: "SW-9", age_years: 52, sex: "female" },
    entries: [
      voice(
        "e1",
        "Swelling just above the navel since 3 years, goes back on lying down, comes out on coughing. Gets bouts of pain abdomen on and off. Has put on weight over the years. Three normal deliveries. Previous operation: none. No vomiting, passing stool and flatus normally."
      ),
    ],
    expect: {
      site_on_abdomen: "positive",
      reducibility: "positive",
      cough_impulse_strain: "positive",
      intermittent_abdominal_pain: "positive",
      weight_gain: "positive",
      obstruction_features: "negative",
      irreducible_painful: "unasked",
      skin_changes_over_swelling: "unasked",
      scar_wound_infection: "unasked",
      raised_abdominal_pressure: "unasked",
    },
    note: "Das's para-umbilical picture. Obstruction is explicitly denied; an irreducible painful swelling and skin change were never mentioned and must stay unasked.",
  },
  {
    id: "sinus-neck-tb",
    title: "Discharging opening in the neck after a gland",
    treeId: "sinus_fistula",
    patient: { bed: "SW-14", age_years: 24, sex: "male" },
    entries: [
      voice(
        "e1",
        "Discharging sinus on the right side of the neck since 1 month. Before that a painless lump in the neck for 1 year which slowly softened and burst. Thin watery discharge. Evening fever and loss of weight. Brother was on ATT last year. No stool or urine from the opening."
      ),
    ],
    expect: {
      sinus_site: "positive",
      previous_gland_swelling: "positive",
      how_it_began: "positive",
      discharge_nature: "positive",
      weight_loss_sinus: "positive",
      tb_history: "positive",
      viscus_discharge: "negative",
      bone_pieces_out: "unasked",
      since_birth: "unasked",
      operation_at_site: "unasked",
    },
    note: "Das's tuberculous sinus story: gland, cold abscess, burst. Stool or urine is explicitly denied; bone chips, birth and operation were never mentioned.",
  },
  {
    id: "abdominal-lump-rif",
    title: "Lump in the right iliac fossa with altered bowel habit",
    treeId: "abdominal_lump",
    patient: { bed: "SW-21", age_years: 61, sex: "male" },
    entries: [
      voice(
        "e1",
        "Lump in right lower abdomen noticed by chance while bathing 2 months back, slowly growing, painless. Constipation alternating with loose stools. Feels tired, looks pale. Lost about 6 kg. No vomiting. No jaundice."
      ),
    ],
    expect: {
      site: "positive",
      first_noticed: "positive",
      bowel_change: "positive",
      pallor: "positive",
      weight_loss: "positive",
      stale_food_vomiting: "negative",
      jaundice: "negative",
      blood_mucus_stool: "unasked",
      fever_rigor: "unasked",
      worms: "unasked",
    },
    note: "Das's caecal growth picture. Vomiting and jaundice are explicitly denied; blood in stool, rigors and worms were never mentioned and must stay unasked.",
  },
  {
    id: "empty-ish",
    title: "Nothing clinical",
    patient: { bed: "MW-2", age_years: 30, sex: "male" },
    entries: [voice("e1", "Case history to be taken tomorrow, patient sleeping.")],
    expect: { duration: "unasked", headache: "unasked", vomiting: "unasked", rash: "unasked", bleeding: "unasked" },
    note: "Everything unasked, nothing rejected would be ideal.",
  },
];
