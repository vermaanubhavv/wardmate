import type { ExamChecklist, ExamItem } from "@/lib/history-check/exam-types";
import { BATES, DHINGRA, HUTCHISONS } from "@/content/history-trees/_helpers";

/**
 * ENT EXAMINATION — v1.0.0. CLINICAL CONTENT: REVIEWED (Dr Anubhav Verma).
 *
 * Ear, nose, throat and neck, with a head mirror or headlamp and light reflected from behind
 * the patient's shoulder. The normal ear is examined first so the abnormal side has a reference.
 * Chronic suppurative otitis media, allergic and infective rhinosinusitis and tobacco-related
 * oral and laryngeal lesions dominate the north Indian OPD, and the checklist is weighted to them.
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

export const entV1: ExamChecklist = {
  id: "ent",
  version: "1.0.0",
  title: "ENT examination",
  setting: "ENT ward and OPD, north India",
  reviewStatus: "reviewed",
  reviewedBy: "Dr Anubhav Verma",
  references: [DHINGRA, HUTCHISONS, BATES],
  sections: [
    {
      id: "ear",
      title: "Ear",
      intro: "Seat the patient facing you with the light from behind their shoulder. Examine the better ear first, then the affected ear, and end with hearing and the facial nerve.",
      items: [
        item("pinna", "Pinna", "Inspect the pinna from the front and behind for shape, swelling, redness, scars, sinuses and skin lesions. Gently pull the pinna and press the tragus, watching for pain.", "Pain on moving the pinna or pressing the tragus is associated with otitis externa and furunculosis; a boggy swelling with perichondritis and haematoma; a pre-auricular pit with a congenital sinus.", { normal: "Pinna normal in shape, no tenderness." }),
        item("pre_post_auricular", "Pre- and post-auricular region", "Look and feel in front of the tragus and over the mastoid for swelling, scars, sinuses and tenderness. Press over the mastoid antrum and the tip, and check whether the post-aural sulcus is preserved.", "Mastoid tenderness with a swelling that obliterates the post-aural sulcus is associated with acute mastoiditis and subperiosteal abscess; a post-aural scar marks earlier ear surgery.", { normal: "No pre- or post-auricular swelling, scar or tenderness." }),
        item("external_canal", "External auditory canal", "Pull the pinna up and back in an adult (down and back in a child) and inspect the canal with the otoscope, using the largest speculum that fits. Note wax, discharge, debris, swelling, polyps and narrowing.", "Discharge in the canal is traced to its source: mucoid discharge is associated with a middle ear cause, and a scanty foul discharge with cholesteatoma; fungal debris with otomycosis; a polyp in the canal raises chronic middle ear disease beneath it.", { normal: "Canal clear, no discharge." }),
        item("tympanic_membrane", "Tympanic membrane", "Identify the cone of light, handle of malleus and lateral process. Record colour, position (retracted or bulging), mobility, and any perforation by site — central, marginal or attic — and size, and what is seen through it.", "A central perforation is associated with the tubotympanic type of chronic otitis media; a marginal or attic perforation or retraction pocket with cholesteatoma and the unsafe type; a dull bulging membrane with acute otitis media; a retracted membrane with fluid behind it with eustachian tube dysfunction.", { normal: "Tympanic membrane intact, pearly grey, cone of light present." }),
        item("siegle_mobility", "Mobility of the tympanic membrane", "Use a pneumatic otoscope or Siegle's speculum, squeezing the bulb gently while watching the membrane move.", "Reduced mobility is associated with fluid in the middle ear and with adhesions; a hypermobile segment with an atrophic scar.", d),
        item("rinne", "Rinne test", "Strike a 512 Hz tuning fork and hold it on the mastoid until the patient no longer hears it, then place the prongs beside the ear canal; alternatively compare loudness at the two positions. Record for each ear.", "A negative Rinne (bone louder than air) is associated with a conductive loss of roughly fifteen decibels or more; a false negative with a severe sensorineural loss in that ear, where the sound is heard by the opposite cochlea.", { normal: "Rinne positive both ears." }),
        item("weber", "Weber test", "Place the vibrating fork on the vertex or forehead in the midline and ask where the sound is heard — in the middle or in one ear.", "Lateralisation to the worse ear is associated with a conductive loss in that ear; lateralisation to the better ear with a sensorineural loss in the worse ear.", { normal: "Weber central." }),
        item("abc_test", "Absolute bone conduction", "Occlude the patient's ear canal and place the vibrating fork on the mastoid; when the patient stops hearing it, transfer it to your own mastoid with your canal occluded.", "A shortened absolute bone conduction is associated with sensorineural loss; it stays normal in a purely conductive loss.", d),
        item("free_field_voice", "Free field voice test", "Stand behind the patient at arm's length, mask the other ear by rubbing the tragus, and whisper then speak numbers, recording the distance at which they are repeated correctly.", "A reduced distance gives a rough bedside measure of the degree of hearing loss, to be read with the tuning fork findings and an audiogram.", d),
        item("fistula_test", "Fistula test", "When chronic ear disease with cholesteatoma or vertigo is present, apply intermittent pressure to the canal with the tragus or Siegle's speculum, watching the eyes for nystagmus and asking about vertigo.", "A positive test is associated with erosion of the bony labyrinth, usually the lateral semicircular canal, by cholesteatoma; a negative test does not exclude a fistula.", d),
        item("facial_nerve_ear", "Facial nerve", "Ask the patient to raise the eyebrows, close the eyes tightly, show the teeth and puff out the cheeks, comparing the two sides. Grade the weakness and note whether the forehead is spared.", "Facial weakness with ear disease is associated with involvement of the facial canal by infection or cholesteatoma and needs early attention; forehead sparing points to an upper motor neuron lesion instead.", { normal: "Facial nerve intact bilaterally." }),
      ],
    },
    {
      id: "nose",
      title: "Nose and paranasal sinuses",
      intro: "Inspect the external nose first, then the vestibule by tilting the tip up, then anterior rhinoscopy with a Thudichum speculum held in the left hand.",
      items: [
        item("external_nose", "External nose", "Inspect from the front, side and above for deviation, depression of the bridge, swelling, skin changes and scars; palpate the nasal bones for tenderness and crepitus.", "A deviated or depressed dorsum is associated with trauma and with destruction of the septum; swelling of the tip and redness with vestibulitis and furunculosis; a broadened nose with nasal polyps in the young.", { normal: "External nose normal." }),
        item("vestibule", "Nasal vestibule", "Push the tip of the nose up with the thumb and inspect the vestibule in good light before inserting the speculum.", "Crusting and fissuring are associated with vestibulitis; a furuncle of the vestibule is a source of spreading infection from the danger area of the face.", d),
        item("anterior_rhinoscopy", "Anterior rhinoscopy", "Insert the speculum gently into the vestibule with the blades vertical, not touching the septum, and inspect in two positions: head upright for the floor and inferior turbinate, head tilted back for the middle turbinate and meatus. Note mucosa colour, discharge and masses.", "Pale boggy mucosa is associated with allergic rhinitis; pus in the middle meatus with maxillary, frontal and anterior ethmoid sinusitis; pale grape-like masses with polyps; crusting with atrophic rhinitis and granulomatous disease.", { normal: "Mucosa pink and moist, no discharge or mass." }),
        item("septum", "Nasal septum", "On rhinoscopy follow the septum from front to back, noting deviation, spurs, perforation, haematoma and prominent vessels at Little's area.", "A deviated septum or spur is associated with nasal obstruction on one side and with sinus drainage problems; a septal perforation with previous surgery, trauma, tuberculosis and other granulomatous disease; prominent vessels in Little's area with anterior bleeding.", { normal: "Septum central." }),
        item("turbinates", "Turbinates", "Note the size and colour of the inferior and middle turbinates. Where they look swollen, touch the mucosa gently with a probe to judge whether the mucosa is soft and compressible.", "Hypertrophied inferior turbinates are associated with chronic rhinitis; soft swollen turbinates with allergic and vasomotor rhinitis; a polyp is insensitive and mobile, whereas a turbinate is sensitive and fixed.", { normal: "Turbinates normal in size." }),
        item("nasal_patency", "Patency — cold spatula test", "Hold a cold metal tongue depressor under the nostrils and ask the patient to breathe out through the nose; compare the areas of misting on each side. Occlude each nostril in turn and ask the patient to sniff as a second check.", "A smaller misting area on one side is associated with obstruction on that side, from septal deviation, turbinate hypertrophy, polyp or mass.", { normal: "Both nasal passages patent." }),
        item("sinus_tenderness", "Sinus tenderness", "Press over the cheeks for the maxillary sinuses, under the medial end of the eyebrow on the floor of the frontal sinus, and at the medial canthus for the ethmoids, comparing sides.", "Localised tenderness is associated with acute sinusitis of that sinus; a swelling of the cheek or the palate with a maxillary mass needs further assessment.", { normal: "No sinus tenderness." }),
        item("posterior_rhinoscopy", "Posterior rhinoscopy", "Depress the tongue, ask the patient to breathe through the nose, and introduce a warmed postnasal mirror behind the soft palate without touching it. Inspect the choanae, the posterior ends of the turbinates, the eustachian tube openings, the fossa of Rosenmüller and the vault.", "A mass in the nasopharynx is associated with adenoids in children, angiofibroma in adolescent males and carcinoma in adults; pus in the choana with posterior sinus disease; an antrochoanal polyp is seen hanging into the nasopharynx.", d),
        item("smell", "Sense of smell", "Test each nostril separately with familiar non-irritant smells, the other nostril occluded and the eyes closed.", "Loss of smell is associated with nasal obstruction by polyps, with post-viral olfactory loss, and with head injury and frontal lobe masses.", d),
      ],
    },
    {
      id: "throat",
      title: "Oral cavity, oropharynx and larynx",
      intro: "Remove dentures. Use a tongue depressor on the anterior two-thirds of the tongue only, and a headlamp so both hands are free.",
      items: [
        item("oral_cavity", "Lips, teeth, gums, tongue and floor of mouth", "Inspect lips, buccal mucosa including the retromolar area, teeth and gums, the tongue on protrusion and lifted, the floor of the mouth and the hard palate. Palpate any lesion with a gloved finger, and bimanually for the floor of the mouth.", "White or red patches, an ulcer with raised edges, and trismus are associated with tobacco-related premalignant change and oral cancer, common in this population; oral submucous fibrosis produces pale blanched bands and limited opening.", { normal: "Oral cavity normal, no ulcer or patch." }),
        item("mouth_opening", "Mouth opening", "Ask the patient to open as wide as possible and measure the interincisal distance, or count how many of the patient's fingers fit.", "Restricted opening is associated with oral submucous fibrosis, peritonsillar abscess, tumour invading the pterygoid muscles and temporomandibular joint disease.", d),
        item("tonsils", "Tonsils and pillars", "Depress the tongue and inspect the tonsils for size, surface, crypts, exudate and asymmetry, and the anterior pillars for congestion. Press on the anterior pillar to express the crypts where chronic tonsillitis is in question.", "Congested pillars and pus from the crypts are associated with chronic tonsillitis; a bulge above and lateral to the tonsil pushing the uvula across with peritonsillar abscess; a unilateral enlarged or ulcerated tonsil with lymphoma and carcinoma.", { normal: "Tonsils normal in size, pillars not congested." }),
        item("oropharynx", "Posterior pharyngeal wall, soft palate and uvula", "Inspect the posterior wall for granules, bulging and discharge, and ask the patient to say 'aah' while watching the palate rise.", "Hypertrophied lymphoid granules are associated with chronic pharyngitis; a bulge of the posterior wall with retropharyngeal abscess; a palate that deviates to one side with a vagal lesion on the other.", { normal: "Oropharynx normal, palate moves symmetrically." }),
        item("indirect_laryngoscopy", "Indirect laryngoscopy", "Hold the patient's protruded tongue in gauze, introduce a warmed laryngeal mirror against the soft palate, and ask the patient to breathe quietly and then say 'eee'. Inspect the base of tongue, valleculae, epiglottis, aryepiglottic folds, pyriform fossae, false and true cords, and cord movement.", "A cord that does not move on phonation is associated with recurrent laryngeal nerve palsy, including from thyroid, oesophageal and lung disease; nodules at the junction of the anterior and middle third with voice misuse; a mass, ulcer or pooling of saliva in the pyriform fossa with malignancy.", { normal: "Both vocal cords mobile, no lesion seen." }),
        item("endoscopy_note", "Endoscopic assessment", "Where the mirror view is inadequate, record that a flexible or rigid endoscopic examination is needed rather than recording the larynx as normal.", "A poor mirror view is common with a strong gag reflex, an overhanging epiglottis and an uncooperative patient, and a missed lesion is the usual consequence of recording it as normal.", d),
      ],
    },
    {
      id: "neck",
      title: "Neck",
      intro: "Examine from behind with the neck slightly flexed, level by level, then the thyroid and larynx from the front.",
      items: [
        item("neck_nodes", "Cervical lymph nodes by level", "Palpate systematically: level I (submental, submandibular), II, III and IV along the sternocleidomastoid, V in the posterior triangle, VI in the central compartment, and the supraclavicular fossae. Record level, size, number, consistency, tenderness, fixity and matting.", "The level of a hard node points to where its primary may lie — upper levels drain the oral cavity, pharynx and larynx; firm matted nodes with or without a cold abscess are associated with tuberculosis; hard fixed nodes with metastatic squamous carcinoma.", { normal: "No palpable cervical lymph nodes." }),
        item("thyroid", "Thyroid", "Inspect as the patient swallows a sip of water, then palpate from behind, each lobe and the isthmus, noting size, surface, consistency, nodules and whether the lower border can be reached.", "A swelling moving on swallowing is associated with the thyroid; a hard fixed nodule with a hoarse voice raises malignancy with nerve involvement; an impalpable lower border with retrosternal extension.", { normal: "Thyroid not enlarged." }),
        item("larynx_crepitus", "Laryngeal framework and crepitus", "Hold the thyroid cartilage between finger and thumb and move it gently from side to side over the vertebral column, feeling for the normal click.", "Loss of the normal laryngeal click is associated with a postcricoid or retropharyngeal mass filling the space behind the larynx; widening of the framework with laryngeal tumours.", d),
        item("other_neck_swellings", "Other neck swellings", "For any swelling record site by triangle, size, surface, consistency, whether it moves on swallowing or on protrusion of the tongue, pulsation, and transillumination.", "Movement on tongue protrusion is associated with a thyroglossal cyst; a swelling at the anterior border of the sternocleidomastoid with a branchial cyst; a pulsatile swelling at the carotid bifurcation with a carotid body tumour.", d),
      ],
    },
  ],
};
