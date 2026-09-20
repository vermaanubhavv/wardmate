import type { ExamChecklist, ExamItem } from "@/lib/history-check/exam-types";
import { BATES, HUTCHISONS, MACLEODS, rce } from "@/content/history-trees/_helpers";

/**
 * NERVOUS SYSTEM EXAMINATION — v1.0.0. CLINICAL CONTENT: PENDING CLINICIAN REVIEW.
 *
 * Higher functions, cranial nerves, motor, sensory, reflexes, coordination, gait and meningeal
 * signs, in the order of the Indian long case. The purpose of this examination is to localise
 * the lesion before naming it, so each item says what its abnormality localises rather than
 * what disease it represents.
 *
 * Each item says how to elicit the sign and what it is associated with. Nothing names a
 * treatment, and nothing tells the reader what the patient has.
 */
const item = (
  id: string,
  label: string,
  how: string,
  significance: string,
  extra: Partial<Pick<ExamItem, "normal" | "tier">> = {}
): ExamItem => ({ id, label, how, significance, ...extra });

const d = { tier: "detailed" as const };

export const neurologicalV1: ExamChecklist = {
  id: "neurological",
  version: "1.0.0",
  title: "Nervous system examination",
  setting: "Adult medicine ward, north India",
  reviewStatus: "pending_clinician_review",
  reviewedBy: null,
  references: [
    rce("Is this patient having a stroke?", 2005, "15900010"),
    rce("The rational clinical examination. Does this adult patient have acute meningitis?", 1999, "10411200"),
    rce("Does this patient have carpal tunnel syndrome?", 2000, "10865306"),
    MACLEODS,
    HUTCHISONS,
    BATES,
  ],
  sections: [
    {
      id: "higher_functions",
      title: "Higher mental functions",
      intro: "Much of the assessment is gathered while taking the history. Establish handedness first, since it determines which hemisphere is dominant and therefore what a language deficit localises.",
      items: [
        item("conscious_level", "Level of consciousness", "Assess response to voice then to pain, and record the Glasgow Coma Scale as its three separate components (eye, verbal, motor) rather than the total alone.", "A falling score, particularly in the motor component, is associated with an expanding intracranial process; recording the components separately preserves the information a single total loses.", { normal: "Conscious and alert, Glasgow Coma Scale 15." }),
        item("orientation_attention", "Orientation and attention", "Ask for name, place and time. Test attention by serial subtraction, or by reciting the months of the year backwards.", "Impaired attention with a fluctuating course is the core feature of an acute confusional state, and it separates that from a dementia in which attention is preserved early.", { normal: "Oriented to time, place and person." }),
        item("memory", "Memory", "Test immediate recall with a name and address, recent memory by asking for it again after five minutes, and remote memory with verifiable personal and historical events.", "Loss of recent memory with preserved remote memory is associated with disease of the medial temporal structures; confabulation is associated with thiamine deficiency.", d),
        item("speech_language", "Speech and language", "Establish handedness. Assess spontaneous speech for fluency, then test comprehension with commands of increasing complexity, repetition of a phrase, naming of objects, reading and writing. Distinguish disordered language from slurred articulation.", "Non-fluent speech with preserved comprehension localises to the frontal language area; fluent speech with impaired comprehension to the temporal area; slurred but grammatical speech localises to the cerebellum, brainstem or muscles rather than the cortex.", { normal: "Speech normal, no aphasia or dysarthria." }),
        item("higher_cortical", "Other cortical functions", "Test calculation, right-left orientation, finger identification, ability to copy a drawing, and look for neglect of one side of space.", "Neglect of one side is associated with a lesion of the non-dominant parietal lobe, and patients rarely complain of it, so it must be sought.", d),
      ],
    },
    {
      id: "cranial_nerves",
      title: "Cranial nerves",
      items: [
        item("cn_i", "Olfactory nerve", "With the eyes closed and one nostril occluded, offer a familiar non-irritant smell to the other.", "Loss of smell is associated with head injury, frontal lesions and local nasal disease; irritant substances stimulate the trigeminal nerve and therefore do not test this nerve.", d),
        item("cn_ii_acuity_fields", "Optic nerve: acuity, fields and colour", "Test acuity in each eye separately with correction. Test fields by confrontation, quadrant by quadrant, comparing with your own. Test colour vision where optic nerve disease is suspected.", "A field defect respecting the vertical midline localises behind the optic chiasm; one respecting the horizontal midline localises to the retina; early loss of colour vision is associated with optic nerve disease.", { normal: "Visual acuity and fields normal to confrontation." }),
        item("pupils", "Pupils", "Note size, shape and symmetry in dim light. Test the direct and consensual response to light, then the swinging torch test, then accommodation.", "A dilated unreactive pupil with ptosis and an eye turned down and out is associated with a third nerve palsy and raises compression; a relative afferent defect on the swinging torch test is associated with optic nerve disease; small pupils reacting to accommodation but not light have their own associations.", { normal: "Pupils equal and reactive to light and accommodation." }),
        item("fundus", "Fundus", "Darken the room, use an ophthalmoscope, and examine the disc, vessels, background and macula in each eye.", "Blurred disc margins with loss of venous pulsation are associated with raised intracranial pressure; a pale disc with optic atrophy; and the retina records hypertension and diabetes.", { normal: "Fundi normal, discs well defined." }),
        item("cn_iii_iv_vi", "Ocular movement nerves", "Test movement in the H pattern, asking about double vision at the extremes and observing for nystagmus. Look for ptosis and for the resting position of each eye.", "Failure of downward and inward movement is associated with a fourth nerve palsy; failure of abduction with a sixth nerve palsy, which is a poor localiser because of the long intracranial course; combined defects with ptosis and a dilated pupil suggest the third nerve.", { normal: "Full range of eye movements, no diplopia or nystagmus." }),
        item("cn_v", "Trigeminal nerve", "Test light touch and pinprick in all three divisions on both sides. Palpate masseter and temporalis while the patient clenches, and test jaw opening against resistance. Test the corneal reflex with a wisp of cotton where indicated.", "Sensory loss in an onion-skin distribution is associated with a brainstem lesion; loss of the corneal reflex is an early and sensitive sign of trigeminal involvement.", { normal: "Facial sensation intact, muscles of mastication normal." }),
        item("cn_vii", "Facial nerve", "Ask the patient to raise the eyebrows, close the eyes tightly against resistance, show the teeth, blow out the cheeks and purse the lips. Compare the nasolabial folds at rest. Test taste on the anterior tongue where indicated.", "Weakness sparing the forehead localises above the facial nucleus; weakness including the forehead localises to the nucleus or the nerve itself, and that single distinction is the most useful in the whole cranial nerve examination.", { normal: "Facial movements symmetrical, forehead spared." }),
        item("cn_viii", "Vestibulocochlear nerve", "Test hearing by whispering a number beside each ear while masking the other. Use tuning fork tests to separate conductive from sensorineural loss. Look for nystagmus and assess balance.", "Conductive and sensorineural losses are distinguished at the bedside by the tuning fork tests, which direct the rest of the assessment.", { normal: "Hearing normal, no nystagmus." }),
        item("cn_ix_x", "Glossopharyngeal and vagus nerves", "Ask the patient to open the mouth and say a sustained vowel, watching the palate and uvula. Listen to the voice and the quality of a cough. Test the gag reflex only where clinically necessary.", "A palate deviating away from the weak side, a nasal voice and a weak cough are associated with lower cranial nerve involvement, and they mark a patient at risk from aspiration.", { normal: "Palate moves symmetrically, voice and cough normal." }),
        item("cn_xi_xii", "Accessory and hypoglossal nerves", "Test shoulder shrug and head turning against resistance. Inspect the tongue in the floor of the mouth for wasting and fasciculation before asking for protrusion, then note any deviation.", "The protruded tongue deviates towards the weak side; fasciculation with wasting is associated with lower motor neurone involvement of the nerve or its nucleus.", { normal: "Tongue midline, no wasting or fasciculation." }),
      ],
    },
    {
      id: "motor",
      title: "Motor system",
      intro: "Inspection, tone, power, then coordination and reflexes. Compare side with side at every step, and always examine the upper and lower limbs separately.",
      items: [
        item("bulk_fasciculation", "Bulk and fasciculation", "Inspect and measure limb circumference at a fixed distance from a bony landmark on both sides. Observe the relaxed muscle in good light for fasciculation, tapping it gently if needed.", "Wasting with fasciculation is associated with lower motor neurone disease; wasting without it with disuse, with myopathy and with long-standing upper motor neurone lesions.", { normal: "Normal bulk, no fasciculation." }),
        item("tone", "Tone", "With the patient fully relaxed, move each joint passively at varying speeds. In the legs, roll the thigh and lift the knee briskly, watching the heel.", "Increased tone that is velocity-dependent and catches then gives way is associated with upper motor neurone lesions; increased tone equal throughout the range is associated with extrapyramidal disease; reduced tone with lower motor neurone and with cerebellar lesions.", { normal: "Tone normal in all four limbs." }),
        item("power", "Power", "Test each muscle group against resistance, comparing sides, and grade on the Medical Research Council scale from zero to five. Test proximal and distal groups separately in each limb.", "A pyramidal pattern of weakness (extensors weaker in the arm, flexors weaker in the leg) is associated with upper motor neurone lesions; symmetrical proximal weakness with myopathy; distal weakness with neuropathy.", { normal: "Power grade 5 in all groups." }),
        item("reflexes", "Deep tendon reflexes", "With the patient relaxed and the limb in a neutral position, strike the tendon with the weight of the hammer. Grade as absent, present with reinforcement, normal, brisk, or with clonus. Use reinforcement before calling a reflex absent.", "Exaggerated reflexes with clonus are associated with upper motor neurone lesions; absent reflexes with lower motor neurone lesions and with neuropathy; a delayed relaxation phase is associated with thyroid deficiency.", { normal: "Reflexes normal and symmetrical." }),
        item("plantar", "Plantar response", "Warn the patient. Draw a blunt point along the lateral border of the sole from the heel towards the little toe and then medially across the ball, watching the first movement of the great toe.", "An upgoing great toe is associated with an upper motor neurone lesion; the response is unreliable in a withdrawing or ticklish patient, and watching only the first movement is what makes it interpretable.", { normal: "Plantars flexor on both sides." }),
        item("superficial_reflexes", "Superficial and primitive reflexes", "Test the abdominal reflexes in all four quadrants and the cremasteric reflex where relevant. Look for grasp and pout reflexes where a frontal lesion is suspected.", "Lost abdominal reflexes are associated with upper motor neurone lesions above their segmental level; re-emergent primitive reflexes with diffuse frontal disease.", d),
      ],
    },
    {
      id: "sensory",
      title: "Sensory system",
      intro: "Explain and demonstrate on the sternum first, then test with the eyes closed. Map any abnormality from the abnormal area towards the normal, and decide whether the pattern is a nerve, a root, a level, or a glove and stocking.",
      items: [
        item("light_touch", "Light touch", "Use a wisp of cotton, dabbing rather than stroking, comparing both sides in each dermatome of the limbs and trunk.", "A pattern following a single nerve localises to that nerve; a dermatomal band to a root; a level on the trunk to the spinal cord.", { normal: "Light touch intact throughout." }),
        item("pain_temperature", "Pain and temperature", "Use a fresh neurological pin, and a cold object for temperature, comparing sides and working towards any area of change.", "Loss of pain and temperature with preserved touch and position sense is associated with lesions of the spinothalamic tracts, including a central cord lesion.", { normal: "Pain and temperature sensation intact." }),
        item("vibration_position", "Vibration and joint position", "Place a vibrating 128 hertz fork on a distal bony prominence and move proximally until felt. For position, hold the sides of the distal phalanx and move it a few degrees with the eyes closed.", "Loss of vibration and position sense with preserved pain and temperature is associated with disease of the posterior columns and of large fibres, as in vitamin deficiency and diabetes.", { normal: "Vibration and joint position sense intact." }),
        item("cortical_sensation", "Cortical sensory function", "With primary sensation intact, test two-point discrimination, stereognosis, graphaesthesia and sensory inattention with simultaneous stimulation.", "Loss of these with intact primary sensation localises to the sensory cortex rather than to the peripheral pathway.", d),
        item("sensory_level", "Sensory level", "Where a cord lesion is suspected, test pinprick from the lower trunk upwards on both sides and front and back to define a level, and test perianal sensation and anal tone.", "A sensory level on the trunk is the single most localising finding for a spinal cord lesion; saddle sensory loss with reduced anal tone is associated with a cauda equina lesion.", { normal: "No sensory level." }),
      ],
    },
    {
      id: "coordination_gait",
      title: "Coordination, gait and meningeal signs",
      items: [
        item("coordination", "Coordination", "Test finger-to-nose with the target at full reach, rapid alternating movements, and heel-to-shin. Look for intention tremor, past-pointing and dysdiadochokinesia.", "Intention tremor with past-pointing and clumsy rapid movements is associated with cerebellar hemisphere disease on the same side as the findings.", { normal: "Coordination normal." }),
        item("gait", "Gait", "If safe, and with someone standing by, watch the patient walk a distance, turn, and walk heel-to-toe. Observe from behind as well as from the front.", "A broad-based gait is associated with cerebellar disease; a high-stepping gait with foot drop; a waddling gait with proximal weakness; a shuffling gait with reduced arm swing with extrapyramidal disease; a circumducting gait with a hemiparesis.", { normal: "Gait normal, tandem walking steady." }),
        item("romberg", "Romberg's test", "With the patient standing feet together and you positioned to catch them, ask them to close the eyes and observe for thirty seconds.", "Marked unsteadiness appearing only when the eyes close is associated with loss of position sense; unsteadiness with the eyes open points instead to the cerebellum.", { normal: "Romberg's test negative." }),
        item("meningeal_signs", "Signs of meningeal irritation", "Test neck stiffness by gently flexing the neck with the patient supine and the head unsupported. Test Kernig's sign by flexing the hip and extending the knee. In a patient with fever and headache, test for jolt accentuation by asking them to rotate the head horizontally two to three times per second.", "Fever, neck stiffness and altered mental status together are highly sensitive for acute meningitis, so their complete absence makes it unlikely; individual symptoms taken alone perform poorly.", { normal: "No neck stiffness, Kernig's sign negative." }),
        item("spine_skull", "Spine, skull and skin", "Inspect and palpate the spine for tenderness, deformity and a gibbus. Examine the skin for neurocutaneous markings and the scalp for injury.", "A gibbus with spinal tenderness is associated with tuberculous spondylitis, which remains a common cause of a spastic paraparesis in this setting.", d),
        item("autonomic_bladder", "Bladder, bowel and autonomic function", "Ask directly about urinary retention, incontinence, constipation and postural giddiness, and measure lying and standing blood pressure where autonomic involvement is suspected.", "Bladder involvement with a sensory level is associated with cord compression and changes the urgency; postural hypotension is associated with autonomic neuropathy.", { normal: "Bladder and bowel function normal." }),
      ],
    },
  ],
};
