import type { ExamChecklist, ExamItem } from "@/lib/history-check/exam-types";
import { ATLS, BAILEY_LOVE, GRABB_SMITH, MACLEODS } from "@/content/history-trees/_helpers";

/**
 * BURNS AND WOUND EXAMINATION — v1.0.0. CLINICAL CONTENT: REVIEWED (Dr Anubhav Verma).
 *
 * In an acute burn the airway and circulation come before the wound: inhalation signs first,
 * then perfusion, then the extent and depth of the burn, circumferential burns and the special
 * areas. The later sections cover the chronic wound, the graft and donor site, and contractures,
 * as seen on a burns and plastic surgery ward.
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

export const burnsWoundV1: ExamChecklist = {
  id: "burns_wound",
  version: "1.0.0",
  title: "Burns and wound examination",
  setting: "Burns and plastic surgery ward and casualty, north India",
  reviewStatus: "reviewed",
  reviewedBy: "Dr Anubhav Verma",
  references: [GRABB_SMITH, ATLS, BAILEY_LOVE, MACLEODS],
  sections: [
    {
      id: "airway_inhalation",
      title: "Airway and inhalation injury",
      intro: "Assess the airway before the burn. Airway swelling progresses over hours, so a normal first look does not mean a safe airway later.",
      items: [
        item("enclosed_space", "Mechanism — enclosed space and smoke", "Establish whether the burn occurred in a closed room, with smoke exposure or a period of unconsciousness.", "Burns in an enclosed space or with loss of consciousness are associated with inhalation injury and carbon monoxide poisoning.", { normal: "Open-space burn, no smoke exposure." }),
        item("facial_burns_nasal_hair", "Facial burns and singed nasal hair", "Look at the face, eyebrows, eyelashes and nostrils for burns and singeing.", "Facial burns and singed nasal hair are associated with inhalation injury and a threatened airway.", { normal: "No facial burns, nasal hair intact." }),
        item("soot", "Soot in the mouth, nose or sputum", "Look in the nostrils, mouth and oropharynx for soot, and ask whether the sputum is black.", "Carbonaceous sputum and soot in the oropharynx are associated with inhalation injury below the vocal cords.", { normal: "No soot." }),
        item("voice_stridor", "Hoarseness, stridor and oropharyngeal swelling", "Listen to the voice and breathing, and look at the oropharynx for swelling, blistering and redness.", "A hoarse voice, stridor or oropharyngeal oedema is associated with evolving upper airway obstruction, which may need early definitive airway control.", { normal: "Normal voice, no stridor, oropharynx normal." }),
        item("breathing_burns", "Breathing and chest wall", "Count the respiratory rate, measure saturation, listen to the chest and look for a circumferential chest burn limiting movement.", "Wheeze and crackles are associated with lower airway inhalation injury; a stiff circumferential chest burn with restricted ventilation. Pulse oximetry reads falsely normal with carbon monoxide.", { normal: "Breathing unlaboured, chest clear." }),
        item("carbon_monoxide", "Carbon monoxide features", "Look for headache, confusion, reduced consciousness and a cherry-red colour, and check a carboxyhaemoglobin level on a blood gas.", "Neurological features after a smoke exposure are associated with carbon monoxide or cyanide poisoning.", d),
      ],
    },
    {
      id: "circulation_burns",
      title: "Circulation and general assessment",
      items: [
        item("perfusion_burns", "Pulse, blood pressure and perfusion", "Record heart rate, blood pressure (on an unburnt limb), capillary refill and warmth of the peripheries.", "Early shock in the first hour is associated with another injury or blood loss rather than the burn itself; burn shock develops over hours.", { normal: "Haemodynamically stable, well perfused." }),
        item("urine_output_burns", "Urine output", "Record the hourly urine output from a catheter in a major burn, and look at the colour of the urine.", "Low urine output is associated with under-resuscitation; dark red or brown urine with myoglobin from deep muscle injury or electrical burns.", { normal: "Adequate urine output, clear urine." }),
        item("associated_injuries", "Associated injuries", "Perform a full primary and secondary survey for injuries from a fall, blast, jump or assault.", "Injuries from a blast or a jump are missed when the burn draws all the attention.", d),
        item("electrical_burn", "Electrical burn — entry, exit and cardiac rhythm", "Look for entry and exit wounds, and record an ECG.", "Small skin wounds from high-voltage injury are associated with extensive deep muscle damage and arrhythmias.", d),
        item("safeguarding_burns", "Pattern of the burn and consistency with the history", "Note the shape, distribution and depth of the burn, and whether it matches the account given, particularly in children, women and elderly patients.", "Burns with sharp immersion lines, glove or stocking distribution, cigarette-sized marks, or a history that does not fit the pattern are associated with non-accidental injury and need medico-legal documentation.", d),
      ],
    },
    {
      id: "extent_burns",
      title: "Extent — total body surface area",
      intro: "Count only partial-thickness and full-thickness burns; simple redness is excluded. Undress completely and log-roll to see the back.",
      items: [
        item("rule_of_nines", "Rule of nines", "Assign nine percent to the head and neck, nine to each upper limb, eighteen to the front and eighteen to the back of the trunk, eighteen to each lower limb and one to the perineum, and sum the burnt areas.", "The total burnt area is associated with fluid requirement and with mortality, and above a threshold marks a burn for specialist-unit care.", { normal: "TBSA recorded as a percentage." }),
        item("lund_browder", "Lund and Browder chart", "Shade the burn on a Lund and Browder chart, using the age-adjusted percentages for the head and lower limbs.", "The rule of nines overestimates lower-limb and underestimates head area in children, in whom the Lund and Browder chart is associated with a more accurate estimate.", d),
        item("palm_method", "Palm method for patchy burns", "Use the patient's own palm with fingers closed as roughly one percent of their body surface area to estimate scattered burns.", "The palm method estimates small or patchy burns that do not fit the regions of the rule of nines.", d),
      ],
    },
    {
      id: "depth_burns",
      title: "Depth",
      intro: "Depth evolves over the first two to three days, so reassess. Record the depth of each area separately.",
      items: [
        item("depth_appearance", "Appearance and blisters", "Look at the colour, moisture and blistering of each area.", "Moist pink blistered skin is associated with superficial partial-thickness burns; dry, mottled or white with deep partial thickness; leathery, waxy white or charred with full thickness.", { normal: "Depth recorded for each area." }),
        item("capillary_blanching", "Capillary refill in the burn", "Press on the burnt skin with a finger and watch whether colour returns.", "Brisk blanching and refill is associated with a superficial burn; sluggish refill with deep dermal; fixed staining that does not blanch with full-thickness damage.", { normal: "Blanching and refill recorded." }),
        item("pinprick_sensation", "Pin-prick sensation", "Touch the burnt skin gently with a sterile needle and ask whether the touch feels sharp, blunt or not felt.", "Painful sharp sensation is associated with a superficial burn; reduced sensation with deep dermal; an insensate burn with full-thickness destruction of nerve endings.", { normal: "Sensation recorded for each area." }),
      ],
    },
    {
      id: "circumferential_special",
      title: "Circumferential burns and special areas",
      items: [
        item("circumferential_burn", "Circumferential burns", "Look at every limb, the neck and the chest for deep burns extending all the way around.", "A deep circumferential burn is associated with a constricting eschar that impairs distal perfusion or chest movement as oedema develops.", { normal: "No circumferential burns." }),
        item("distal_perfusion_burns", "Distal perfusion beyond a circumferential burn", "Check hourly the colour, capillary refill, warmth, pulse (by Doppler if needed), pain on passive stretch and sensation distal to any circumferential burn.", "Falling perfusion, increasing pain or paraesthesia distal to a circumferential burn is associated with the need for escharotomy, a decision for the senior surgeon.", { normal: "Distal perfusion maintained." }),
        item("face_eyes_ears", "Face, eyes and ears", "Examine the eyelids, the cornea with fluorescein where possible, the lips and the ears.", "Corneal burns are associated with scarring and visual loss; burns of the ear cartilage with chondritis.", d),
        item("hands_feet", "Hands and feet", "Record the depth on the palm, dorsum and each digit, and the ability to flex and extend fingers.", "Deep burns of the hands and feet are associated with functional loss and contracture, and mark a burn for specialist care regardless of size.", { normal: "Hands and feet spared." }),
        item("perineum_joints", "Perineum, genitalia and flexures", "Examine the perineum and genitalia, and the skin over the flexor surfaces of the neck, axilla, elbow, wrist, knee and ankle.", "Perineal burns are associated with wound contamination; burns over flexor surfaces with later contracture.", d),
      ],
    },
    {
      id: "chronic_wound",
      title: "The wound — chronic wounds and ulcers",
      intro: "Describe a wound as you would an ulcer: site, size, shape, edge, floor, base, discharge and surrounding skin, then the regional nodes and distal circulation and sensation.",
      items: [
        item("wound_site_size", "Site, size and shape", "Measure the length, breadth and depth in centimetres, and photograph with a scale where the unit allows.", "Serial measurements are the only reliable way to show whether a wound is healing.", { normal: "Size recorded." }),
        item("wound_bed", "Wound bed — granulation and slough", "Look at the floor of the wound and estimate the proportion covered by healthy granulation (red, granular, bleeding on touch), slough (yellow, adherent) and necrotic tissue (black).", "Healthy red granulation is associated with a wound able to heal; pale or unhealthy granulation with poor perfusion or infection; slough and necrotic tissue delay healing.", { normal: "Healthy granulation tissue." }),
        item("wound_edge", "Edge and margin", "Look at and feel the edge: sloping, punched out, undermined, rolled or everted, and whether new epithelium is growing in from it.", "A sloping edge with a blue-white rim of epithelium is associated with healing; a punched-out edge with ischaemic or neuropathic ulcers; an undermined edge with tuberculous ulcers; a rolled or everted edge with malignancy.", d),
        item("wound_discharge_smell", "Discharge and smell", "Note the amount, colour and consistency of the discharge on the dressing and the presence of a foul smell.", "Purulent discharge and a foul smell are associated with infection; a green discharge and sweet smell with Pseudomonas.", { normal: "Minimal serous discharge, no smell." }),
        item("surrounding_skin", "Surrounding skin and cellulitis", "Look for spreading redness, warmth, swelling and tenderness around the wound; mark the edge of any redness with a pen and the time.", "Spreading redness and warmth are associated with cellulitis; crepitus or dusky skin with necrotising infection, which is time-critical.", { normal: "No surrounding cellulitis." }),
        item("wound_base_nodes", "Base, regional nodes and distal status", "Feel whether the wound is fixed to deeper structures, probe gently for bone, palpate the regional nodes, and check the distal pulses and sensation.", "A probe reaching bone is associated with osteomyelitis; absent pulses with ischaemic ulcers; loss of protective sensation with neuropathic ulcers.", d),
      ],
    },
    {
      id: "graft_contracture",
      title: "Graft, donor site and contracture",
      items: [
        item("graft_take", "Graft take", "At the first dressing, look at the colour, adherence and percentage of the graft that has taken, and for collections beneath it.", "A pink adherent graft is associated with good take; a pale, dusky or floating graft with haematoma, seroma, shear or infection beneath it.", { normal: "Graft pink and adherent, take recorded as a percentage." }),
        item("donor_site", "Donor site", "Inspect the donor site for epithelialisation, discharge, redness and pain.", "A donor site that has not healed within the expected time or is purulent is associated with infection or a deeper-than-intended harvest.", d),
        item("contracture", "Contracture", "Measure the range of movement of each joint crossed by a burn scar, and look at the scar for tightness, bands, hypertrophy and whether it blanches on stretch.", "A scar band limiting joint movement is associated with burn contracture; a raised red itchy scar confined to the wound with hypertrophic scarring; one spreading beyond it with keloid.", { normal: "Full range of movement at joints crossed by the scar." }),
        item("scar_assessment", "Scar maturity", "Record the scar's colour, height, pliability and vascularity, using a structured scale such as the Vancouver scar scale.", "A red raised scar is associated with an immature scar that is still remodelling; a pale flat pliable scar with maturity.", d),
      ],
    },
  ],
};
