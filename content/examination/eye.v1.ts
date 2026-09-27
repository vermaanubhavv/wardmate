import type { ExamChecklist, ExamItem } from "@/lib/history-check/exam-types";
import { BATES, MACLEODS, PARSONS_EYE } from "@/content/history-trees/_helpers";

/**
 * EYE EXAMINATION — v1.0.0. CLINICAL CONTENT: PENDING CLINICIAN REVIEW.
 *
 * Function before structure: visual acuity is recorded first, before any light is shone or
 * drop is put in, then fields, movements, adnexa, the anterior segment by torch light, the
 * pressure, and the fundus. Cataract, refractive error, glaucoma, corneal ulcers and diabetic
 * retinopathy make up most of the north Indian eye OPD.
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

export const eyeV1: ExamChecklist = {
  id: "eye",
  version: "1.0.0",
  title: "Eye examination",
  setting: "Ophthalmology ward and OPD, north India",
  reviewStatus: "pending_clinician_review",
  reviewedBy: null,
  references: [PARSONS_EYE, MACLEODS, BATES],
  sections: [
    {
      id: "vision",
      title: "Visual function",
      intro: "Always record the vision of each eye first, separately, with the patient's own glasses — acuity is the one finding every later visit is compared against.",
      items: [
        item("visual_acuity", "Distance visual acuity, each eye", "Seat the patient six metres from a Snellen chart (or an E chart for those who cannot read), cover one eye with the palm or an occluder, and record the smallest line read, then the other eye. If the top letter is not read, walk the patient closer, then record finger counting, hand movements, and perception and projection of light.", "Reduced acuity localises nothing by itself, but the level recorded now is the reference for the whole course; loss of light projection points to a posterior segment problem behind a dense media opacity.", { normal: "Visual acuity 6/6 in each eye." }),
        item("pinhole", "Pinhole acuity", "Where acuity is below 6/6, repeat it with the patient looking through a pinhole occluder.", "Improvement with the pinhole is associated with refractive error; no improvement points to disease of the media, retina or optic nerve.", { normal: "Not applicable when unaided acuity is 6/6." }),
        item("near_vision", "Near vision", "Test each eye with a near-vision chart held at about a third of a metre, with reading glasses if used, and record the smallest print read.", "Reduced near vision with good distance vision after the age of forty is associated with presbyopia; reduced near and distance vision together with media or macular disease.", { normal: "Reads N6 with each eye." }),
        item("colour_vision", "Colour vision", "When optic nerve disease or a congenital defect is in question, test each eye with Ishihara plates in good daylight and record the plates read correctly.", "Early loss of colour vision in one eye is associated with optic neuritis and compressive optic neuropathy, often before acuity falls; a symmetrical red-green defect in a male with a congenital defect.", d),
        item("confrontation_fields", "Visual fields by confrontation", "Sit an arm's length away at eye level. The patient covers one eye and looks at your opposite eye; bring a wiggling finger or a red hatpin in from the periphery in each quadrant, comparing with your own field. Map the blind spot with the red pin where detail is needed.", "A hemianopia or quadrantanopia localises to the visual pathway behind the chiasm; a bitemporal defect to the chiasm; constricted fields and arcuate defects are associated with advanced glaucoma and retinitis pigmentosa.", { normal: "Fields full to confrontation in each eye." }),
      ],
    },
    {
      id: "alignment_movement",
      title: "Alignment and eye movements",
      items: [
        item("hirschberg", "Corneal light reflex", "Shine a torch at the patient's eyes from about a third of a metre while the patient looks at the light, and compare the position of the reflex on each cornea.", "A reflex displaced from the centre of one pupil is associated with a manifest squint; its displacement gives a rough measure of the angle.", { normal: "Corneal reflexes central and symmetrical." }),
        item("cover_test", "Cover and uncover test", "Ask the patient to fix on a target. Cover one eye and watch the uncovered eye for a refixation movement; then uncover and watch the covered eye as the cover is removed. Repeat for the other eye, near and distance.", "Movement of the uncovered eye is associated with a manifest squint (tropia); movement only of the eye being uncovered with a latent squint (phoria).", { normal: "No movement on cover test." }),
        item("eom", "Extraocular movements", "With the head still, ask the patient to follow a target in an H pattern through the six cardinal positions, asking about double vision and watching for limitation and nystagmus. Test both eyes together, then each eye alone where limitation is seen.", "Limitation in the field of one muscle localises to that muscle or its nerve — third, fourth or sixth; restriction in several directions with proptosis is associated with thyroid eye disease and orbital lesions; nystagmus with vestibular and cerebellar disease.", { normal: "Full ocular movements, no diplopia or nystagmus." }),
        item("proptosis", "Proptosis and globe position", "Look down on the eyes from above and behind the patient, and from the side, comparing the corneal apices. Measure with an exophthalmometer where available.", "Proptosis is associated with thyroid eye disease, orbital cellulitis and orbital tumours; a pulsatile proptosis with a carotid-cavernous fistula.", d),
      ],
    },
    {
      id: "adnexa",
      title: "Lids and lacrimal apparatus",
      items: [
        item("lids", "Eyelids", "Inspect lid position, lid margins, lashes and the skin. Note ptosis and measure the palpebral aperture, lid retraction, lid lag on downgaze, entropion, ectropion, misdirected lashes, and swellings. Evert the upper lid over a cotton-tip applicator to inspect the tarsal conjunctiva.", "Ptosis is associated with third nerve palsy, Horner syndrome, myasthenia and ageing; lid retraction and lid lag with thyroid eye disease; inturned lashes and tarsal scarring with trachoma; a hard painless lid swelling with chalazion and, when recurrent, with a lid tumour.", { normal: "Lids normal in position, no lesion." }),
        item("lacrimal_sac", "Lacrimal sac and regurgitation test", "Look for swelling at the medial canthus below the medial canthal tendon. Press over the sac against the lacrimal bone and watch the puncta for regurgitation of fluid.", "Regurgitation of mucus or pus on pressure is associated with nasolacrimal duct obstruction and chronic dacryocystitis, which carries a risk to the cornea and to any eye surgery.", { normal: "Regurgitation test negative both sides." }),
        item("puncta_tear_film", "Puncta and tear meniscus", "Pull the lower lid down gently and check that the punctum sits against the globe and is patent; note the height of the tear meniscus.", "An everted or stenosed punctum is associated with watering; a reduced tear meniscus with dry eye.", d),
      ],
    },
    {
      id: "anterior_segment",
      title: "Anterior segment by torch light",
      intro: "Use a bright focused torch, and a loupe where available, examining front to back: conjunctiva, cornea, anterior chamber, iris, pupil, lens.",
      items: [
        item("conjunctiva", "Conjunctiva and sclera", "Inspect the bulbar conjunctiva with the patient looking in each direction, and the palpebral conjunctiva by pulling down the lower lid and everting the upper. Note congestion and its pattern, discharge, follicles, papillae, subconjunctival haemorrhage and growths.", "Congestion most marked away from the cornea with discharge is associated with conjunctivitis; congestion concentrated around the limbus (ciliary flush) with keratitis, iritis and acute angle closure; a wing-shaped growth onto the cornea with pterygium; pallor with anaemia.", { normal: "Conjunctiva quiet, no congestion or discharge." }),
        item("cornea", "Cornea", "Inspect for clarity, lustre and size, look for opacities, vessels and foreign bodies, and test corneal sensation with a wisp of cotton wool before any drop is instilled.", "A hazy cornea is associated with oedema from raised pressure and with scarring; reduced sensation with herpetic keratitis, leprosy and fifth nerve lesions; a greyish infiltrate with a surrounding haze with infective keratitis, which is often fungal after vegetable trauma in this setting.", { normal: "Cornea clear, sensation intact." }),
        item("fluorescein", "Fluorescein staining", "Instil fluorescein from a moistened strip into the lower fornix and inspect with a cobalt blue light. Record the size and shape of any stained area.", "Staining shows an epithelial defect: a branching dendritic pattern is associated with herpes simplex keratitis, a linear pattern on the upper cornea with a foreign body under the lid, and fine punctate staining with dry eye and exposure.", d),
        item("ac_depth", "Anterior chamber depth", "Shine the torch from the temporal side parallel to the iris plane and see whether the nasal iris is lit or in shadow. Look for pus (hypopyon) or blood (hyphaema) settled at the bottom of the chamber.", "A shadow over the nasal iris is associated with a shallow chamber and a narrow angle at risk of closure; hypopyon with severe keratitis and endophthalmitis; hyphaema with trauma.", { normal: "Anterior chamber normal depth, clear." }),
        item("iris", "Iris", "Compare the colour and pattern of the two irides, and look for nodules, new vessels on the iris surface and a tremulous iris on eye movement.", "Heterochromia and nodules are associated with chronic uveitis; new vessels on the iris with ischaemic retinal disease including diabetic and vein occlusion; a tremulous iris with a dislocated or absent lens.", d),
        item("pupils", "Pupils — size, shape and reactions", "In dim light compare pupil size and shape, then test the direct and consensual reaction to a bright torch, and the near reaction.", "Unequal pupils are associated with third nerve palsy (large) and Horner syndrome (small); an irregular pupil with synechiae after iritis; a mid-dilated fixed oval pupil with acute angle closure; a near reaction better than the light reaction with light-near dissociation.", { normal: "Pupils equal, round, reacting to light and near." }),
        item("rapd", "Relative afferent pupillary defect", "Swing the torch briskly from one eye to the other, holding about three seconds on each, and watch whether a pupil dilates when the light arrives on it.", "Dilation of a pupil when the light swings onto that eye is associated with optic nerve disease or extensive retinal disease on that side; the defect is not produced by cataract or refractive error, so it separates a nerve problem from a media problem.", { normal: "No relative afferent pupillary defect." }),
        item("lens", "Lens", "Inspect the pupil with an oblique torch light for a grey or white opacity, and note whether the iris casts a shadow on it.", "A visible lens opacity is associated with cataract; an iris shadow on the lens with an immature cataract and its absence with a mature one; a lens displaced from the pupil with trauma and Marfan syndrome.", { normal: "Lens clear." }),
      ],
    },
    {
      id: "iop",
      title: "Intraocular pressure",
      items: [
        item("digital_tension", "Digital tension", "Ask the patient to look down with eyes closed. Place both index fingers on the upper lid above the tarsal plate and press gently alternately, feeling the fluctuation; compare the two eyes and with your own.", "A stony hard eye is associated with markedly raised pressure as in acute angle closure; a soft eye with a penetrating injury and a hypotonous eye. Digital tension is crude and a normal feel does not exclude moderately raised pressure.", { normal: "Digital tension normal in each eye." }),
        item("tonometry", "Tonometry", "Measure with a Schiotz, rebound or applanation tonometer after topical anaesthetic as appropriate, recording each eye and the time.", "Raised pressure is associated with glaucoma and with steroid response, and a difference between the eyes matters more than a single borderline value.", d),
      ],
    },
    {
      id: "fundus",
      title: "Ophthalmoscopy",
      intro: "Dim the room. Use the right hand and right eye for the patient's right eye, and the left for the left.",
      items: [
        item("distant_direct", "Distant direct ophthalmoscopy and red reflex", "From about a third of a metre, look through the ophthalmoscope at the pupil with a plus lens and compare the red reflex of the two eyes. Ask the patient to move the eye up and down and watch whether opacities move with or against the movement.", "A dull or absent red reflex is associated with media opacity including cataract and vitreous haemorrhage; a white reflex in a child with retinoblastoma and congenital cataract, which need urgent review; the direction of movement of an opacity locates it in front of or behind the lens.", { normal: "Red reflex present and symmetrical." }),
        item("optic_disc", "Optic disc", "Come close to the patient, reduce the lens power to focus, find a vessel and follow it to the disc. Record colour, margins, cup-to-disc ratio and whether the cup is symmetrical.", "A swollen disc with blurred margins is associated with raised intracranial pressure, optic neuritis and ischaemic optic neuropathy; a pale disc with optic atrophy; an enlarged or asymmetrical cup with glaucoma.", { normal: "Disc pink, margins clear, cup-to-disc ratio 0.3." }),
        item("vessels_retina", "Vessels and retina", "Follow the four arcades out from the disc, noting artery calibre, arteriovenous crossings, haemorrhages, microaneurysms, exudates and cotton-wool spots. Look at the periphery in each direction.", "Microaneurysms, dot-blot haemorrhages and hard exudates are associated with diabetic retinopathy; flame haemorrhages and cotton-wool spots with hypertension and vein occlusion; Roth spots with endocarditis; tubercles in the choroid with miliary tuberculosis.", { normal: "Vessels normal, no haemorrhage or exudate." }),
        item("macula", "Macula", "Ask the patient to look straight at the light briefly and inspect the macula and foveal reflex.", "Exudates or oedema at the macula are associated with sight-threatening diabetic maculopathy; a cherry-red spot with central retinal artery occlusion.", d),
        item("dilated_exam_note", "Dilated examination", "Where the undilated view is inadequate, record the fundus as not seen and that a dilated examination is needed, noting any concern about a shallow anterior chamber first.", "A small-pupil view misses most peripheral and much macular disease, so a 'normal fundus' through an undilated pupil is weak evidence.", d),
      ],
    },
  ],
};
