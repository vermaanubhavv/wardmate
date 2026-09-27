import type { ExamChecklist, ExamItem } from "@/lib/history-check/exam-types";
import { APLEY, ATLS, BATES, MACLEODS, YOUMANS } from "@/content/history-trees/_helpers";

/**
 * SPINE EXAMINATION — v1.0.0. CLINICAL CONTENT: PENDING CLINICIAN REVIEW.
 *
 * Inspection, palpation, movements, the nerve-root tension signs and a full neurological
 * examination to a level, with the perianal and bladder assessment that residents skip.
 * In trauma the spine is protected throughout and examined by log-roll.
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

export const spineV1: ExamChecklist = {
  id: "spine",
  version: "1.0.0",
  title: "Spine examination",
  setting: "Orthopaedics and neurosurgery ward and casualty, north India",
  reviewStatus: "pending_clinician_review",
  reviewedBy: null,
  references: [APLEY, YOUMANS, ATLS, MACLEODS, BATES],
  sections: [
    {
      id: "trauma_spine",
      title: "Trauma first",
      intro: "In a trauma patient the spine is protected and the airway, breathing and circulation come first. The back is examined by log-roll, never by sitting the patient up.",
      items: [
        item("spinal_protection", "Spinal protection", "Keep the head and neck in line with manual stabilisation or a collar and blocks, and move the patient only as a unit until the spine has been assessed.", "Uncontrolled movement of an unstable spinal injury is associated with new or worsening cord damage.", { normal: "Spine protected throughout." }),
        item("log_roll", "Log-roll", "With one person holding the head in line and enough helpers to turn the body as a single unit, roll the patient on to the side, inspect the whole back, palpate each spinous process, and examine the perineum.", "Tenderness, a step, a gap between spinous processes or boggy swelling on the log-roll is associated with a spinal injury at that level.", { normal: "No tenderness, step or swelling along the spine on log-roll." }),
        item("neurogenic_shock", "Neurogenic shock and priapism", "Look for low blood pressure with a slow pulse and warm peripheries, a flaccid areflexic body below a level, diaphragmatic breathing and priapism.", "Hypotension with bradycardia and warm peripheries is associated with loss of sympathetic tone after a high cord injury, unlike the cold tachycardia of haemorrhage.", d),
      ],
    },
    {
      id: "inspection_spine",
      title: "Inspection",
      intro: "Undress the patient to the underwear and look from behind, from the side and from the front, standing if possible.",
      items: [
        item("posture_spine", "Posture and the normal curves", "From the side, note the cervical and lumbar lordosis and the thoracic kyphosis; from behind, whether the shoulders and pelvis are level.", "Loss of lumbar lordosis is associated with paraspinal spasm; a pelvis that is not level raises leg-length inequality as a cause of an apparent curve.", { normal: "Normal curves, shoulders and pelvis level." }),
        item("scoliosis", "Scoliosis and the forward-bend test", "Look from behind for a lateral curve and asymmetry of the shoulders, scapulae and waist creases. Then ask the patient to bend forwards and look tangentially along the back for a rib hump.", "A rib hump on forward bending is associated with a structural curve; a curve that straightens on bending or sitting is associated with a postural or compensatory one.", { normal: "No scoliosis; no rib hump on forward bending." }),
        item("kyphosis_gibbus", "Kyphosis and gibbus", "From the side, look for a smooth increased rounding of the thoracic spine or a sharp angular prominence of one or two spinous processes.", "A smooth kyphosis is associated with postural or developmental causes; an angular gibbus with collapse of one or two vertebrae, classically from tuberculosis in India, or from a fracture or tumour.", { normal: "No kyphosis or gibbus." }),
        item("swelling_sinus_spine", "Swelling, sinus and skin markers", "Look along the spine, the loins, the groins and the iliac fossae for swelling or a discharging sinus, and over the lower back for a hairy patch, dimple, naevus or lipoma.", "A fluctuant swelling in the loin or groin is associated with a cold abscess tracking from the spine; a hairy patch or dimple over the lumbosacral spine with an underlying spinal dysraphism.", { normal: "No swelling, sinus or cutaneous marker." }),
        item("muscle_wasting_spine", "Muscle wasting in the limbs", "Inspect the arms and legs for wasting and fasciculation, comparing both sides.", "Segmental wasting is associated with a root or anterior horn lesion at the corresponding level.", d),
      ],
    },
    {
      id: "palpation_spine",
      title: "Palpation",
      items: [
        item("spinous_tenderness", "Spinous process and paraspinal tenderness", "Palpate each spinous process from the occiput to the sacrum, then the paraspinal muscles and the sacroiliac joints, watching the face.", "Localised bony tenderness is associated with infection, fracture or tumour at that level; diffuse paraspinal tenderness with muscular strain.", { normal: "No tenderness." }),
        item("step_gap", "Step or gap", "Run the fingers down the spinous processes feeling for a step between adjacent processes or an abnormal gap.", "A step in the lumbar spine is associated with spondylolisthesis; a gap after injury with disruption of the posterior ligaments.", { normal: "No step or gap." }),
        item("percussion_spine", "Percussion tenderness", "Tap gently over each spinous process with the ulnar border of the fist.", "Sharp pain at one level on percussion is associated with an infective or destructive lesion at that vertebra.", d),
        item("cold_abscess", "Cold abscess", "Palpate the paraspinal region, loins, iliac fossae, groins and upper thigh for a fluctuant, non-tender, non-warm swelling.", "A fluctuant swelling without warmth or redness is associated with a tuberculous cold abscess tracking along the psoas or paraspinal planes.", d),
      ],
    },
    {
      id: "movements_spine",
      title: "Movements",
      intro: "Skip active movements in suspected trauma until imaging has cleared the spine.",
      items: [
        item("cervical_movements", "Cervical movements", "Ask the patient to flex (chin to chest), extend, rotate to each side and bend laterally, recording the range and any pain or radiation into the arm.", "Pain radiating into the arm on extension and rotation towards the side (Spurling's manoeuvre) is associated with cervical root compression.", { normal: "Full painless cervical movements." }),
        item("lumbar_flexion", "Thoracolumbar flexion and Schober's test", "Mark the skin over the lumbosacral junction and a point ten centimetres above it, ask the patient to bend forward fully, and measure the increase in distance.", "An increase of less than five centimetres is associated with restricted lumbar flexion, seen in ankylosing spondylitis and with painful spasm.", d),
        item("extension_lateral_rotation", "Extension, lateral flexion and rotation", "Ask the patient to lean back, bend to each side sliding the hand down the thigh, and rotate the trunk with the pelvis fixed (sitting).", "Pain on extension is associated with facet joint or posterior element pathology; rotation occurs mainly in the thoracic spine.", { normal: "Full range in all directions." }),
        item("chest_expansion_spine", "Chest expansion", "Measure the chest circumference at the fourth intercostal space in full expiration and full inspiration.", "Reduced chest expansion is associated with costovertebral involvement in ankylosing spondylitis.", d),
      ],
    },
    {
      id: "tension_signs",
      title: "Nerve-root tension signs",
      items: [
        item("slr", "Straight leg raise", "With the patient supine and the knee straight, raise the leg slowly and note the angle at which pain radiates below the knee. At that point lower slightly and dorsiflex the ankle (Bragard's test).", "Leg pain radiating below the knee between about thirty and seventy degrees, reproduced by ankle dorsiflexion, is associated with irritation of the L5 or S1 root; back pain alone or hamstring tightness does not count.", { normal: "Straight leg raise to ninety degrees on both sides without radicular pain." }),
        item("crossed_slr", "Crossed straight leg raise", "Raise the unaffected leg and ask whether pain is felt in the affected leg.", "Pain in the affected leg on raising the other is associated with a large or central disc prolapse and is more specific than the ordinary straight leg raise.", d),
        item("femoral_stretch", "Femoral stretch test", "With the patient prone, flex the knee and extend the hip, and ask about pain in the front of the thigh.", "Anterior thigh pain on femoral stretch is associated with irritation of the L2, L3 or L4 roots.", d),
        item("sacroiliac_tests", "Sacroiliac joint stress", "Compress the pelvis from the sides and push down on the iliac crests, or perform the FABER test, asking where pain is felt.", "Pain localised to the sacroiliac joint is associated with sacroiliitis.", d),
      ],
    },
    {
      id: "neuro_level",
      title: "Neurological level",
      intro: "Examine both limbs fully and record a level. Mark the sensory level on the skin with the time so that change can be tracked.",
      items: [
        item("tone_spine", "Tone and clonus", "Assess tone in all four limbs and test for ankle clonus.", "Increased tone with clonus is associated with an upper motor neuron lesion (cord); reduced tone with a root, cauda equina or acute spinal shock.", { normal: "Tone normal, no clonus." }),
        item("power_myotome", "Power by myotome", "Grade on the MRC scale the key muscles for each root: C5 elbow flexion, C6 wrist extension, C7 elbow extension, C8 finger flexion, T1 finger abduction; L2 hip flexion, L3 knee extension, L4 ankle dorsiflexion, L5 great toe extension, S1 ankle plantar flexion.", "The lowest myotome with normal power defines the motor level; weakness in a single root pattern is associated with root compression at that level.", { normal: "Power grade 5 in all myotomes." }),
        item("sensation_dermatome", "Sensation by dermatome", "Test light touch and pinprick in each dermatome on both sides, including the key points (C6 thumb, C7 middle finger, C8 little finger, T4 nipple, T10 umbilicus, L4 medial leg, L5 dorsum of foot, S1 lateral foot).", "Loss in one dermatome is associated with a root lesion; loss of both modalities below a level with a cord lesion; dissociated loss with an anterior or central cord pattern.", { normal: "Sensation intact in all dermatomes." }),
        item("sensory_level", "Sensory level", "Move the pin up the trunk from below on both sides until the sensation changes, and mark the level on the skin.", "A sensory level on the trunk is associated with a spinal cord lesion; the vertebral level of the lesion is usually above the sensory level.", { normal: "No sensory level." }),
        item("reflexes_spine", "Deep tendon reflexes and plantar response", "Test the biceps (C5), supinator (C6), triceps (C7), knee (L3–L4) and ankle (S1) reflexes on both sides, and the plantar response.", "A reduced reflex at one level is associated with a root lesion there; brisk reflexes below with an extensor plantar are associated with cord compression above.", { normal: "Reflexes normal and symmetrical, plantars flexor." }),
        item("abdominal_reflexes", "Superficial abdominal reflexes and Beevor's sign", "Stroke each quadrant of the abdomen towards the umbilicus, and watch the umbilicus as the supine patient lifts the head.", "Loss of the abdominal reflexes is associated with an upper motor neuron lesion above T7–T12; upward movement of the umbilicus with weakness of the lower abdominal muscles around T10.", d),
        item("perianal_sensation", "Perianal (saddle) sensation", "When any cauda equina or cord lesion is possible, test pinprick in the perianal and saddle area on both sides with a chaperone.", "Reduced saddle sensation is associated with cauda equina compression, which is time-critical.", { normal: "Perianal sensation intact." }),
        item("anal_tone", "Anal tone, squeeze and bulbocavernosus reflex", "On rectal examination with a chaperone, assess resting tone and voluntary squeeze; in spinal injury, test the bulbocavernosus reflex.", "Lax tone and absent voluntary squeeze are associated with cauda equina or sacral cord involvement; preserved sacral function in a cord injury is associated with an incomplete lesion and a better outlook.", d),
        item("bladder_spine", "Bladder", "Palpate and percuss for a distended bladder, and record a post-void residual by scan where available.", "A painless distended bladder is associated with retention from cauda equina or cord compression.", { normal: "Bladder not palpable." }),
        item("asia_grade", "Record the completeness of the lesion", "In spinal injury record the motor and sensory levels on each side and whether sacral sensation and voluntary anal contraction are preserved, using the ASIA chart.", "Recording sacral sparing distinguishes an incomplete from a complete lesion, which shapes the prognosis.", d),
      ],
    },
    {
      id: "complete_spine",
      title: "Completing the examination",
      items: [
        item("hips_abdomen_spine", "Hips, abdomen and peripheral pulses", "Examine both hips, palpate the abdomen, and feel the peripheral pulses.", "Hip disease, an aortic aneurysm and vascular claudication each mimic back and leg pain.", d),
        item("gait_spine", "Gait", "When safe, watch the patient walk, then on heels and on toes.", "Inability to walk on the heels is associated with L4–L5 weakness, on the toes with S1 weakness; a broad-based spastic gait with cord compression.", { normal: "Normal gait, heel and toe walking intact." }),
      ],
    },
  ],
};
