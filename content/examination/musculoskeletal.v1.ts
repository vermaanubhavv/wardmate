import type { ExamChecklist, ExamItem } from "@/lib/history-check/exam-types";
import { APLEY, BAILEY_LOVE, BATES, HUTCHISONS, MACLEODS } from "@/content/history-trees/_helpers";

/**
 * MUSCULOSKELETAL (LIMB AND JOINT) EXAMINATION — v1.0.0. CLINICAL CONTENT: REVIEWED (Dr Anubhav Verma).
 *
 * Look, feel, move, special tests and the distal neurovascular status, always comparing with the
 * normal side and always examining the joint above and the joint below. Written for the
 * orthopaedic ward and casualty, where the same sequence serves a swollen knee and a fresh
 * fracture.
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

export const musculoskeletalV1: ExamChecklist = {
  id: "musculoskeletal",
  version: "1.0.0",
  title: "Musculoskeletal (limb and joint) examination",
  setting: "Orthopaedics ward and casualty, north India",
  reviewStatus: "reviewed",
  reviewedBy: "Dr Anubhav Verma",
  references: [APLEY, BAILEY_LOVE, MACLEODS, HUTCHISONS, BATES],
  sections: [
    {
      id: "preparation_msk",
      title: "Preparation and exposure",
      intro: "Expose both limbs fully so the affected side can be compared with the normal one, ask where it hurts before touching, and in trauma check the distal circulation before anything else.",
      items: [
        item("consent_exposure_msk", "Consent, exposure and comparison", "Explain, take consent, and expose both limbs from the joint above to the joint below, with a chaperone where the groin or chest is exposed. Ask the patient to point to the painful spot.", "Examining only the injured limb loses the comparison that makes subtle swelling, wasting and shortening visible.", { normal: "Both limbs exposed and compared." }),
        item("general_look_msk", "General look and pain", "Note whether the patient is comfortable, how they hold the limb, splints or traction in place, and any other injuries in a trauma patient.", "A patient protecting a limb in a fixed position is associated with an irritable joint or an unstable fracture; distracting injuries elsewhere make pain a poor guide.", { normal: "Comfortable at rest." }),
      ],
    },
    {
      id: "look_msk",
      title: "Look",
      intro: "Look before touching: from the front, the side and the back, and always compare with the normal side.",
      items: [
        item("attitude", "Attitude of the limb", "Describe the position in which the limb lies at rest — flexion, extension, abduction, adduction and rotation — before moving anything.", "A hip held flexed, adducted and internally rotated is associated with posterior dislocation; external rotation with shortening is seen with fractures of the femoral neck; a joint held in mid-flexion is associated with an effusion, the position of greatest capsular volume.", { normal: "Limb lies in neutral attitude." }),
        item("deformity", "Deformity", "Look for angulation, rotation or shortening, naming any angular deformity by the direction the distal part points (varus or valgus).", "Visible angulation or rotation in trauma is associated with a displaced fracture or dislocation; fixed deformity in a chronic joint raises contracture or bony destruction.", { normal: "No deformity." }),
        item("swelling_look", "Swelling", "Note whether swelling is confined to the joint (following the capsule outline) or diffuse along the limb, and whether it obliterates the normal hollows beside the patella or the malleoli.", "Swelling that follows the capsule is associated with effusion or synovial thickening; diffuse swelling along the limb raises soft-tissue injury, cellulitis or fracture haematoma.", { normal: "No swelling." }),
        item("skin_wounds", "Skin, wounds and scars", "Inspect the skin over the injury for wounds, blisters, bruising, tenting, sinuses and scars. Any wound near a fracture is measured and its relation to the bone noted.", "A wound over or near a fracture raises an open fracture until shown otherwise; tented blanched skin is associated with impending skin breakdown; a discharging sinus is associated with chronic bone infection.", { normal: "Skin intact, no wounds, sinuses or scars." }),
        item("muscle_wasting", "Muscle wasting", "Compare the bulk of the thigh, calf, arm and forearm with the other side, and measure the girth at a fixed distance from a bony landmark on both sides.", "Wasting is associated with disuse from a chronic painful joint or with a nerve lesion; quadriceps wasting appears early with knee pathology.", { normal: "No wasting; girth equal on both sides.", ...d }),
        item("colour_look", "Colour", "Look at the colour of the limb distal to the injury and compare with the other side.", "Pallor or mottling distal to an injury is associated with arterial compromise; a dusky swollen limb with venous obstruction; redness over a joint with infection or crystal inflammation.", { normal: "Colour normal and symmetrical." }),
      ],
    },
    {
      id: "feel_msk",
      title: "Feel",
      intro: "Watch the patient's face, not your hand. Start away from the painful point and move towards it.",
      items: [
        item("warmth", "Temperature", "Feel with the back of the fingers over the joint or injury and compare with the same site on the other side and with the limb above and below.", "Local warmth is associated with inflammation, infection or a healing fracture; a cold limb distal to an injury with arterial compromise.", { normal: "Temperature equal on both sides." }),
        item("tenderness", "Tenderness", "Palpate systematically along the bone, joint line and soft tissues, localising the point of maximal tenderness.", "Point tenderness over bone after injury is associated with fracture; joint-line tenderness at the knee with meniscal injury; diffuse tenderness with soft-tissue injury or infection.", { normal: "Non-tender." }),
        item("bony_landmarks", "Bony landmarks and their relation", "Palpate the named landmarks of the joint (for example the olecranon and both epicondyles at the elbow) and compare their relationship with the other side.", "A disturbed relationship of the three bony points at the elbow is associated with dislocation rather than a supracondylar fracture, in which the triangle is preserved.", d),
        item("patellar_tap", "Effusion — patellar tap", "With the knee extended and the quadriceps relaxed, empty the suprapatellar pouch by sliding one hand down the thigh, then press the patella sharply backwards with the fingers of the other hand.", "A patella that taps against the femur is associated with a moderate or large effusion; a tense effusion may not tap.", { normal: "Patellar tap negative." }),
        item("bulge_test", "Effusion — bulge (sweep) test", "Stroke the medial side of the knee upwards to empty it, then stroke down the lateral side and watch the medial hollow.", "A bulge refilling the medial hollow is associated with a small effusion that the patellar tap misses.", { normal: "No fluid bulge.", ...d }),
        item("synovial_thickening", "Synovial thickening and soft-tissue swelling", "Feel the joint margins for a boggy, doughy thickening distinct from fluid and from bone.", "Boggy synovial thickening is associated with chronic synovitis — inflammatory arthritis or tuberculosis of the joint.", d),
        item("crepitus_feel", "Crepitus and abnormal mobility", "In a chronic joint, feel over the joint during movement. Do not deliberately elicit bony crepitus or abnormal mobility at a suspected fracture.", "Fine crepitus over a moving joint is associated with degenerative change; coarse grating at a fracture site is associated with a fracture and deliberately eliciting it causes pain and further injury.", d),
      ],
    },
    {
      id: "move_msk",
      title: "Move",
      intro: "Active movement first, then passive, then against resistance. Record the range in degrees from the neutral zero position and compare with the other side.",
      items: [
        item("active_rom", "Active range of movement", "Ask the patient to move the joint through each plane themselves, and record the range reached and any pain.", "Loss of active movement with a full passive range is associated with a tendon rupture or a nerve lesion rather than a joint problem.", { normal: "Full active range, pain-free." }),
        item("passive_rom", "Passive range of movement", "Move the joint gently through each plane, feeling for the end-point and watching the face. Record the arc in degrees.", "Restriction in all directions is associated with arthritis; a springy block with a mechanical cause such as a torn meniscus; a painful arc with impingement.", { normal: "Full passive range." }),
        item("fixed_deformity", "Fixed deformity and hidden flexion", "At the hip, flex the opposite hip fully to flatten the lumbar lordosis (Thomas test) and note whether the thigh on the examined side lifts off the couch.", "A thigh that rises when the lordosis is abolished is associated with a fixed flexion deformity of the hip that an exaggerated lumbar curve had been concealing.", d),
        item("stability", "Stability and ligament tests", "Stress the joint in each plane against the normal side, for example varus and valgus stress, the anterior drawer and the Lachman test at the knee.", "Excess laxity compared with the other side is associated with ligament injury; a soft end-point suggests a complete tear.", d),
        item("power_msk", "Power of the muscles acting on the joint", "Test the main groups against resistance and grade on the MRC scale.", "Weakness out of proportion to pain is associated with a nerve or tendon lesion.", { normal: "Power grade 5 throughout." }),
      ],
    },
    {
      id: "measure_msk",
      title: "Measure",
      intro: "Square the pelvis first — both anterior superior iliac spines level and the limbs in the same position — or the measurement is meaningless.",
      items: [
        item("true_length", "True limb length", "With the pelvis square and both limbs in identical positions, measure from the anterior superior iliac spine to the medial malleolus on each side.", "True shortening is associated with loss of bone length or with upward displacement at the hip; a difference is localised by Galeazzi's test and by measuring the thigh and leg segments separately.", { normal: "True lengths equal." }),
        item("apparent_length", "Apparent limb length", "Measure from a fixed midline point such as the xiphisternum or umbilicus to each medial malleolus with the limbs lying parallel.", "Apparent shortening with equal true lengths is associated with pelvic tilt from a fixed adduction deformity or a spinal curve.", d),
        item("segment_length", "Segment lengths and the hip above the trochanter", "Measure the thigh and leg separately, and at the hip assess the height of the greater trochanter by Bryant's triangle or Nélaton's line.", "Shortening above the trochanter is associated with pathology at the hip; below it, with the shaft of femur or tibia.", d),
      ],
    },
    {
      id: "neurovascular_msk",
      title: "Distal neurovascular status and compartments",
      intro: "Record before and after any manipulation, splint or cast, with the time. Missing a vascular or compartment problem costs the limb.",
      items: [
        item("distal_pulses", "Distal pulses", "Palpate the pulses distal to the injury (radial and ulnar, or dorsalis pedis and posterior tibial) and compare with the other side. Use a handheld Doppler if they cannot be felt.", "An absent or weak distal pulse after injury is associated with arterial injury or kinking at the fracture, which is time-critical.", { normal: "Distal pulses palpable and equal." }),
        item("capillary_refill_msk", "Capillary refill and warmth of the digits", "Press the nail bed for five seconds and time the return of colour; compare the warmth of the digits.", "Delayed refill with cold pale digits is associated with arterial compromise; a palpable pulse does not exclude compartment syndrome.", { normal: "Capillary refill under two seconds." }),
        item("distal_sensation", "Distal sensation in named nerve territories", "Test light touch in the autonomous zone of each nerve crossing the injury — for example the first web space for the radial nerve, the index tip for the median, the little finger for the ulnar, the dorsum of the first web of the foot for the deep peroneal.", "Loss in a single territory is associated with injury to that nerve; recording it before any manipulation matters medico-legally.", { normal: "Sensation intact in all nerve territories." }),
        item("distal_motor", "Distal motor function by nerve", "Test a movement for each nerve: thumb extension (radial), thumb opposition (median), finger abduction (ulnar), ankle and toe dorsiflexion (deep peroneal), plantar flexion (tibial).", "Wrist drop after a humeral shaft fracture is associated with radial nerve injury; foot drop after a knee injury with common peroneal nerve injury.", { normal: "Motor function intact in all nerve distributions." }),
        item("compartment_signs", "Compartment signs", "Feel the tension of each compartment, ask about pain out of proportion to the injury, and passively stretch the muscles of the compartment (extending the fingers or toes) while watching the face.", "Pain on passive stretch, a tense compartment and pain out of proportion are the early features associated with compartment syndrome; pulselessness and paralysis are late.", { normal: "Compartments soft, no pain on passive stretch." }),
      ],
    },
    {
      id: "complete_msk",
      title: "Gait and completing the examination",
      items: [
        item("gait_msk", "Gait", "When the patient can bear weight, watch them walk to and fro, noting the stance and swing phases, stride length, arm swing and any aid.", "An antalgic gait with a shortened stance phase is associated with a painful limb; a Trendelenburg lurch with hip abductor weakness or hip pathology; a high-stepping gait with foot drop.", { normal: "Normal gait without aid." }),
        item("trendelenburg", "Trendelenburg test", "Ask the patient to stand on one leg and watch the pelvis on the opposite side, supporting them lightly.", "A pelvis that drops on the unsupported side is associated with weakness of the abductors of the stance hip or a loss of the fulcrum at that hip.", d),
        item("joint_above_below", "Joint above and joint below", "Examine the joint proximal and distal to the injured or painful joint.", "Hip pathology commonly presents as knee pain, and a second fracture or dislocation is easily missed when attention stays on the obvious injury.", { normal: "Joints above and below normal." }),
        item("spine_other_limb", "Spine, regional nodes and the other limb", "Examine the spine when a limb problem may be referred, palpate the regional lymph nodes when infection or a tumour is considered, and examine the other limb fully.", "Radicular pain mimics hip and knee disease; enlarged regional nodes are associated with infection or malignancy of the limb.", d),
      ],
    },
  ],
};
