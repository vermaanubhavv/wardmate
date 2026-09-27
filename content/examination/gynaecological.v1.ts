import type { ExamChecklist, ExamItem } from "@/lib/history-check/exam-types";
import { BATES, HUTCHISONS, MACLEODS, SHAW_GYNAECOLOGY } from "@/content/history-trees/_helpers";

/**
 * GYNAECOLOGICAL EXAMINATION — v1.0.0. CLINICAL CONTENT: REVIEWED (Dr Anubhav Verma).
 *
 * Consent and a chaperone first, then the general and breast examination, the abdomen, the
 * external genitalia, the speculum, the bimanual examination and, when indicated, the rectal
 * examination. Prolapse, cervical lesions and pelvic masses are the common reasons a woman is on
 * a gynaecology ward in north India, so the speculum and the straining test get full attention.
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

export const gynaecologicalV1: ExamChecklist = {
  id: "gynaecological",
  version: "1.0.0",
  title: "Gynaecological examination",
  setting: "Obstetrics and gynaecology ward, north India",
  reviewStatus: "reviewed",
  reviewedBy: "Dr Anubhav Verma",
  references: [SHAW_GYNAECOLOGY, MACLEODS, HUTCHISONS, BATES],
  sections: [
    {
      id: "preparation_gyn",
      title: "Consent, chaperone and preparation",
      intro: "An intimate examination is done only with explicit consent and a female chaperone, in privacy, with the woman told she may stop it at any point.",
      items: [
        item("consent_chaperone_gyn", "Consent and chaperone", "Explain what each part involves and why, take explicit verbal consent, and ensure a female chaperone is present throughout. Record the chaperone's name. Ask about sexual activity before a speculum or vaginal examination.", "Consent and a chaperone protect the woman's dignity and the examiner; in a woman who has never been sexually active the vaginal and speculum examination is usually replaced by a rectal or imaging assessment.", { normal: "Consent taken, chaperone present." }),
        item("bladder_position_gyn", "Bladder and position", "Ask her to empty her bladder, except when stress incontinence is to be tested. Position her in the dorsal position with knees flexed and apart, or in the left lateral position for a Sims speculum.", "A full bladder is felt as a suprapubic mass and makes bimanual palpation of the uterus unreliable.", { normal: "Bladder empty, dorsal position." }),
      ],
    },
    {
      id: "general_gyn",
      title: "General and breast examination",
      items: [
        item("general_look_gyn", "Build, nutrition and secondary sexual characters", "Note height, weight, body mass index, hair distribution and the development of the breasts and pubic hair.", "Obesity, hirsutism and acne are associated with polycystic ovary syndrome; absent secondary sexual characters with primary amenorrhoea of ovarian or central origin; weight loss with malignancy.", { normal: "Average build, secondary sexual characters normal." }),
        item("pallor_gyn", "Pallor", "Look at the conjunctiva, tongue, nail beds and palms.", "Pallor is associated with anaemia from heavy menstrual bleeding, which is often under-reported in the history.", { normal: "No pallor." }),
        item("vitals_gyn", "Pulse, blood pressure and temperature", "Record the pulse, blood pressure and temperature.", "Tachycardia with hypotension in a woman of reproductive age with abdominal pain raises a ruptured ectopic pregnancy; fever with pelvic pain raises pelvic inflammatory disease.", { normal: "Vitals within normal limits." }),
        item("thyroid_gyn", "Thyroid", "Inspect as she swallows and palpate from behind.", "Thyroid enlargement is associated with menstrual disturbance from both hypothyroidism and hyperthyroidism.", d),
        item("nodes_gyn", "Lymph nodes", "Palpate the supraclavicular fossae, particularly the left, and both inguinal regions.", "Enlarged inguinal nodes are associated with vulval infection and malignancy; a left supraclavicular node with pelvic and abdominal malignancy.", d),
        item("breast_gyn", "Breasts", "With consent, inspect and palpate both breasts and the axillae, and gently check for galactorrhoea.", "Galactorrhoea is associated with hyperprolactinaemia, a cause of amenorrhoea and infertility; a breast lump is evaluated in its own right.", d),
        item("oedema_gyn", "Pedal oedema", "Press over the shin and ankle for pitting.", "Pedal oedema with a pelvic mass is associated with venous compression by a large mass and with hypoproteinaemia from malignancy.", d),
      ],
    },
    {
      id: "abdomen_gyn",
      title: "Abdominal examination",
      items: [
        item("inspection_gyn", "Inspection", "Expose from the xiphisternum to the symphysis and look for distension, a visible mass, scars, striae and dilated veins.", "A midline lower abdominal swelling is associated with a pelvic mass arising from the uterus or ovary; previous scars raise adhesions and past pelvic surgery.", { normal: "Abdomen flat, no visible mass, no scars." }),
        item("palpation_gyn", "Palpation and tenderness", "Palpate all regions gently, beginning away from the pain, for tenderness, guarding and rigidity.", "Lower abdominal tenderness with guarding is associated with pelvic inflammatory disease, ectopic pregnancy and a twisted or ruptured ovarian cyst.", { normal: "Soft, non-tender." }),
        item("mass_gyn", "Pelvic mass", "If a mass is felt, try to get below it: a mass arising from the pelvis has no lower border. Record size in weeks of a gravid uterus, surface, consistency, mobility and tenderness.", "A mass whose lower border cannot be reached is associated with a pelvic origin; a firm irregular mass with uterine fibroids; a cystic mass with an ovarian cyst; a hard fixed mass with ascites raises ovarian malignancy.", { normal: "No mass palpable." }),
        item("ascites_gyn", "Ascites", "Percuss the flanks and test for shifting dullness.", "Ascites with a pelvic mass is associated with ovarian malignancy and, less often, with benign ovarian fibroma.", d),
        item("liver_gyn", "Liver and spleen", "Palpate the liver and spleen.", "An enlarged nodular liver with a pelvic mass is associated with metastatic spread.", d),
      ],
    },
    {
      id: "external_gyn",
      title: "External genitalia",
      items: [
        item("vulva_gyn", "Vulva and pubic hair", "Separate the labia and inspect the mons, labia, clitoris, urethral meatus and introitus for hair distribution, lesions, ulcers, warts, discolouration and swelling.", "A white patch or chronic itch with skin changes is associated with lichen sclerosus; an ulcer or growth in an older woman raises vulval malignancy; clitoromegaly with androgen excess.", { normal: "External genitalia normal." }),
        item("bartholin_gyn", "Bartholin's glands", "Palpate the posterolateral introitus between finger and thumb.", "A tender swelling is associated with a Bartholin's abscess; a painless swelling with a cyst.", d),
        item("perineum_gyn", "Perineum", "Inspect for old tears, scars, a gaping introitus and perineal body deficiency.", "A deficient perineum and gaping introitus are associated with previous obstetric trauma and with prolapse.", d),
        item("straining_gyn", "Prolapse and leak on straining", "Ask her to cough and bear down while you watch the introitus, and note whether the anterior wall, cervix or posterior wall descends, and whether urine leaks.", "Descent on straining is associated with pelvic organ prolapse; a leak of urine on coughing with stress urinary incontinence.", { normal: "No descent or leak on straining." }),
      ],
    },
    {
      id: "speculum_gyn",
      title: "Per speculum examination",
      intro: "Warm and lubricate the speculum, insert it gently, and inspect before any bimanual examination so blood from the examination does not obscure the cervix. Take smears before the bimanual.",
      items: [
        item("cusco_gyn", "Speculum insertion", "Insert a Cusco's bivalve speculum closed, directed backwards, then rotate and open it gently to bring the cervix into view. Use a Sims speculum in the left lateral position to assess the vaginal walls.", "The Cusco speculum is used for the cervix; the Sims speculum shows the vaginal walls and is the better instrument for assessing prolapse and fistula.", d),
        item("cervix_gyn", "Cervix", "Note the size, shape of the os (circular or slit-like), colour, erosion or ectropion, polyps, growth, and contact bleeding on gentle touch with a swab.", "Contact bleeding or an irregular friable growth is associated with cervical malignancy; a polyp with intermenstrual bleeding; a slit-like os with previous vaginal delivery.", { normal: "Cervix healthy, no growth, no contact bleeding." }),
        item("discharge_gyn", "Discharge", "Note the colour, consistency, odour and quantity of any discharge and where it arises.", "A curdy white discharge is associated with candidiasis; a thin grey fishy discharge with bacterial vaginosis; frothy green discharge with trichomoniasis; mucopurulent discharge from the os with cervicitis.", { normal: "No abnormal discharge." }),
        item("vagina_gyn", "Vaginal walls", "Inspect the vaginal walls as the speculum is withdrawn for redness, atrophy, ulcers, growths and fistulae.", "Pale thin dry walls are associated with atrophy after menopause; an opening in the anterior wall with a vesicovaginal fistula after obstructed labour or surgery.", d),
        item("prolapse_speculum", "Prolapse on straining with speculum", "With the Sims speculum retracting the posterior wall, ask her to strain and watch the anterior wall and cervix; then retract the anterior wall and watch the posterior wall.", "This separates anterior compartment, apical and posterior compartment prolapse, which the naked-eye straining test often cannot.", d),
        item("smear_gyn", "Pap smear and swabs", "Take a cervical cytology sample and high vaginal or endocervical swabs as indicated, before the bimanual examination.", "Cytology screens for cervical intraepithelial neoplasia; swabs identify infection that the appearance of the discharge only suggests.", d),
      ],
    },
    {
      id: "bimanual_gyn",
      title: "Per vaginum bimanual examination",
      items: [
        item("bimanual_technique", "Technique", "With a lubricated gloved hand, introduce two fingers (one in a nulliparous or older woman) into the vagina, and place the other hand on the abdomen above the symphysis, pressing the pelvic organs down onto the vaginal fingers.", "Adequate relaxation and an empty bladder decide whether the bimanual examination is informative; an obese or tense abdomen limits it.", d),
        item("cervix_pv", "Cervix on palpation", "Feel the cervix for consistency, length, direction, whether the os is open, and for any growth.", "A hard irregular cervix is associated with cervical malignancy; a soft cervix with pregnancy; an open os with bleeding in pregnancy with miscarriage in progress.", { normal: "Cervix firm, os closed." }),
        item("cmt", "Cervical motion tenderness", "Move the cervix gently from side to side and watch her face.", "Pain on moving the cervix is associated with pelvic inflammatory disease and with ectopic pregnancy.", { normal: "No cervical motion tenderness." }),
        item("uterus_size_gyn", "Uterine size", "Palpate the uterus between the two hands and estimate its size in weeks of a gravid uterus.", "An enlarged uterus is associated with pregnancy, fibroids and adenomyosis; a uterus larger than expected for the stated gestation raises molar pregnancy and multiple pregnancy.", { normal: "Uterus normal in size." }),
        item("uterus_position_gyn", "Position of the uterus", "Determine whether the body of the uterus is felt by the abdominal hand (anteverted) or in the posterior fornix (retroverted).", "A fixed retroverted uterus is associated with endometriosis and pelvic adhesions; a mobile retroverted uterus is usually a normal variant.", { normal: "Uterus anteverted." }),
        item("uterus_mobility_gyn", "Mobility, surface and consistency", "Move the uterus and note whether it moves freely, whether the surface is smooth or irregular, and whether the consistency is firm or soft.", "An irregular firm uterus is associated with fibroids; a uniformly enlarged boggy tender uterus with adenomyosis; a fixed uterus with endometriosis, infection or malignant infiltration.", { normal: "Uterus mobile, firm, smooth." }),
        item("adnexa_gyn", "Adnexa", "Place the vaginal fingers in each lateral fornix and the abdominal hand in the corresponding iliac fossa, and feel for a mass or tenderness.", "An adnexal mass is associated with ovarian cyst, tubo-ovarian abscess, hydrosalpinx and ectopic pregnancy; whether it moves separately from the cervix helps separate an adnexal from a uterine origin.", { normal: "Adnexa free, no mass or tenderness." }),
        item("fornices_gyn", "Fornices and pouch of Douglas", "Feel all four fornices for fullness, and the posterior fornix for nodules and tenderness.", "Fullness of the fornices is associated with a pelvic collection or mass; tender nodules in the posterior fornix and uterosacral ligaments with endometriosis.", { normal: "Fornices free." }),
        item("pelvic_floor_gyn", "Pelvic floor tone", "Ask her to squeeze around the vaginal fingers and grade the contraction.", "A weak pelvic floor contraction is associated with prolapse and stress incontinence.", d),
      ],
    },
    {
      id: "completion_gyn",
      title: "Rectal examination and prolapse grading",
      items: [
        item("pr_gyn", "Per rectal examination when indicated", "With consent and a chaperone, in the left lateral position, examine the rectum, and where indicated perform a rectovaginal examination with the index finger in the vagina and the middle finger in the rectum.", "The rectal examination assesses the parametrium and the pouch of Douglas, and is used in place of the vaginal examination in a woman who has not been sexually active; parametrial thickening is associated with the spread of cervical malignancy.", d),
        item("prolapse_grading", "Prolapse grading", "Record the most distal point of each compartment during maximal straining, relative to the hymen, using a named system such as POP-Q or the Shaw degrees.", "Grading records severity reproducibly between examiners and over time, and whether the cervix reaches or passes the introitus is associated with how much the prolapse affects her.", d),
        item("decubitus_ulcer_gyn", "Surface of the prolapse", "Inspect the exposed cervix and vaginal wall for keratinisation and ulceration.", "An ulcer on a long-standing prolapse is usually associated with friction and venous congestion, but an irregular ulcer raises malignancy, which appearance alone cannot exclude.", d),
      ],
    },
  ],
};
