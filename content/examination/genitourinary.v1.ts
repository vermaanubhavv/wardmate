import type { ExamChecklist, ExamItem } from "@/lib/history-check/exam-types";
import { BAILEY_LOVE, BATES, CAMPBELL_UROLOGY, HUTCHISONS, MACLEODS } from "@/content/history-trees/_helpers";

/**
 * GENITOURINARY EXAMINATION — v1.0.0. CLINICAL CONTENT: REVIEWED (Dr Anubhav Verma).
 *
 * Consent and a chaperone first. Then the kidneys and bladder, the external genitalia, the
 * scrotum and its contents, the inguinal nodes and the rectal examination for the prostate,
 * finishing with any catheter, stent or drain. Written for the urology and surgical ward.
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

export const genitourinaryV1: ExamChecklist = {
  id: "genitourinary",
  version: "1.0.0",
  title: "Genitourinary examination",
  setting: "Urology and general surgery ward, north India",
  reviewStatus: "reviewed",
  reviewedBy: "Dr Anubhav Verma",
  references: [CAMPBELL_UROLOGY, BAILEY_LOVE, MACLEODS, HUTCHISONS, BATES],
  sections: [
    {
      id: "preparation_gu",
      title: "Consent, chaperone and general look",
      intro: "Explain what you will do and why, obtain verbal consent, and have a chaperone present for every genital and rectal examination; record the chaperone's name.",
      items: [
        item("consent_chaperone_gu", "Consent and chaperone", "Explain the examination, ask permission, offer a chaperone and record who was present. Expose only the area being examined and cover it again afterwards.", "An intimate examination without documented consent and a chaperone exposes patient and doctor to harm and complaint.", { normal: "Consent obtained, chaperone present." }),
        item("general_look_gu", "General look", "Note pallor, uraemic features (sallow skin, scratch marks, drowsiness, hiccups, acidotic breathing), oedema, fluid status and blood pressure.", "Uraemic features and fluid overload are associated with advanced renal failure from obstruction or intrinsic renal disease.", { normal: "No pallor, oedema or uraemic features." }),
        item("fever_sepsis_gu", "Fever and signs of sepsis", "Record temperature, pulse, blood pressure and mental state.", "Fever with loin pain and rigors is associated with an infected obstructed kidney, which is urgent.", d),
      ],
    },
    {
      id: "kidney_bladder",
      title: "Kidneys and bladder",
      items: [
        item("renal_angle", "Renal angle tenderness", "With the patient sitting, press or tap gently with the fist over the renal angle between the twelfth rib and the erector spinae, on each side.", "Renal angle tenderness is associated with pyelonephritis, obstruction and perinephric collection.", { normal: "Renal angles non-tender." }),
        item("renal_ballot", "Kidney palpation and ballotability", "With one hand in the loin and the other anteriorly below the costal margin, ballot the kidney between the hands as the patient breathes in.", "A ballotable, bimanually palpable loin mass that moves with respiration and has a band of resonance in front is associated with a renal origin — hydronephrosis, a cyst or a tumour.", { normal: "Kidneys not palpable." }),
        item("loin_swelling", "Loin swelling and fullness", "Look at both loins from behind with the patient sitting, and feel for fullness or fluctuation.", "Loin fullness with fever and tenderness is associated with a perinephric abscess.", d),
        item("bladder_palpation", "Bladder — palpable and percussible", "Palpate from the umbilicus downwards in the midline for a smooth, dome-shaped suprapubic swelling that you cannot get below, and percuss from the umbilicus down for dullness.", "A palpable dull bladder is associated with urinary retention; a painless distended bladder with chronic retention or a neurological cause.", { normal: "Bladder not palpable or percussible." }),
        item("suprapubic_tenderness", "Suprapubic tenderness", "Palpate gently over the suprapubic region.", "Suprapubic tenderness is associated with cystitis or acute retention.", { normal: "No suprapubic tenderness." }),
      ],
    },
    {
      id: "external_genitalia",
      title: "External genitalia (male)",
      intro: "Examine standing and then lying for the scrotum, and wear gloves throughout.",
      items: [
        item("penis_skin", "Penis — skin and shaft", "Inspect the skin of the shaft for ulcers, warts, scars and plaques, and feel along the shaft for firm plaques or tenderness.", "A painless indurated ulcer is associated with primary syphilis or carcinoma; a firm plaque in the tunica with Peyronie's disease.", { normal: "Penile skin normal, no plaques." }),
        item("prepuce", "Prepuce", "Ask the patient to retract the foreskin, noting whether it retracts fully and returns, and look for ballooning, a white scarred ring or swelling of the glans.", "A tight non-retractile foreskin is associated with phimosis; a retracted foreskin that will not return, with a swollen glans, with paraphimosis, which is urgent.", { normal: "Prepuce retracts and returns freely." }),
        item("glans_meatus", "Glans and meatus", "Inspect the glans and the position, size and calibre of the external meatus, parting it gently, and note any discharge.", "A meatus on the underside of the shaft is associated with hypospadias; a pinpoint scarred meatus with meatal stenosis; a urethral discharge with urethritis.", { normal: "Meatus normal in position and calibre, no discharge." }),
        item("urethra_induration", "Urethra — induration along its course", "Feel along the ventral surface of the penis from the meatus to the perineum for induration, tenderness or a mass.", "Induration along the urethra is associated with urethral stricture, periurethral abscess or tumour.", d),
      ],
    },
    {
      id: "scrotum",
      title: "Scrotum and its contents",
      intro: "Examine the normal side first. The first question for any scrotal swelling is whether you can get above it.",
      items: [
        item("scrotum_inspection", "Scrotal skin and inspection", "With the patient standing, look at the size and symmetry of the scrotum, the skin, and whether one side hangs lower or higher.", "Scrotal redness and oedema are associated with epididymo-orchitis, torsion or Fournier's gangrene; a high-riding testis with a horizontal lie with torsion.", { normal: "Scrotum symmetrical, skin normal." }),
        item("get_above", "Getting above the swelling", "Hold the neck of the scrotum between thumb and fingers above the swelling and see whether you can feel normal cord above it.", "A swelling you cannot get above is associated with an inguinoscrotal hernia; one you can get above arises within the scrotum.", { normal: "Can get above any scrotal swelling." }),
        item("testes", "Testes", "Palpate each testis gently between thumb and fingers for size, consistency, surface, tenderness and testicular sensation, and compare with the other side.", "A hard irregular painless mass within the testis is associated with testicular tumour; an exquisitely tender swollen testis with torsion or orchitis; a small soft testis with atrophy.", { normal: "Both testes of normal size and consistency, non-tender." }),
        item("epididymis", "Epididymis", "Feel the epididymis along the posterolateral aspect of each testis from head to tail, distinguishing it from the testis.", "A tender swollen epididymis is associated with epididymitis; a craggy beaded epididymis with tuberculosis; a cystic swelling separate from the testis with an epididymal cyst.", { normal: "Epididymis normal and non-tender." }),
        item("cord", "Spermatic cord and vas", "Roll the cord between finger and thumb, feeling for the vas deferens as a firm cord, then ask the patient to stand and cough, and feel the cord.", "A bag of worms in the cord on standing, which decompresses on lying, is associated with a varicocele; a beaded vas with tuberculosis; an absent vas with congenital absence.", d),
        item("transillumination", "Transillumination", "In a darkened room, place a bright torch against the back of the scrotal swelling and look for a red glow through it.", "A brilliantly transilluminant swelling is associated with a hydrocele or cyst; an opaque swelling with a solid mass, blood or a thick-walled hydrocele.", d),
        item("cough_impulse_scrotum", "Cough impulse and reducibility", "Ask the patient to cough while feeling the swelling at the neck of the scrotum, then with the patient lying, gently attempt to reduce it.", "An expansile cough impulse and reducibility are associated with an inguinoscrotal hernia or a congenital hydrocele.", d),
        item("prehn_cremasteric", "Cremasteric reflex", "Stroke the inner thigh and watch for elevation of the ipsilateral testis.", "An absent cremasteric reflex in a boy with acute scrotal pain is associated with torsion, which is time-critical; elevation relieving pain (Prehn's sign) does not reliably separate torsion from epididymitis.", d),
      ],
    },
    {
      id: "nodes_gu",
      title: "Inguinal lymph nodes",
      items: [
        item("inguinal_nodes", "Inguinal nodes", "Palpate the horizontal and vertical groups of superficial inguinal nodes on both sides, noting size, consistency, tenderness and fixity.", "Enlarged inguinal nodes are associated with penile and scrotal skin lesions and sexually transmitted infections; testicular tumours drain to para-aortic nodes, not to the groin.", { normal: "No significant inguinal lymphadenopathy." }),
      ],
    },
    {
      id: "rectal_prostate",
      title: "Digital rectal examination — prostate",
      intro: "With consent and a chaperone, position the patient in the left lateral position with knees drawn up. Inspect the anus first, and warn the patient before inserting the finger.",
      items: [
        item("perianal_inspection_gu", "Perianal inspection and anal tone", "Inspect for fissures, fistulae, skin tags and haemorrhoids, then insert a lubricated gloved finger slowly and assess resting tone and voluntary squeeze.", "Lax anal tone with urinary retention is associated with a neurological cause such as cauda equina compression.", { normal: "Perianal skin normal, anal tone normal." }),
        item("prostate_size", "Prostate size", "Feel the posterior surface of the prostate through the anterior rectal wall and estimate its size by breadth and how far it projects into the rectum.", "Symmetrical enlargement is associated with benign prostatic enlargement; size on rectal examination correlates poorly with symptoms.", { normal: "Prostate of normal size." }),
        item("prostate_consistency_surface", "Consistency and surface", "Assess whether the gland is rubbery, firm, hard or boggy, and whether the surface is smooth or nodular.", "A rubbery smooth gland is associated with benign enlargement; a hard irregular nodule or a stony gland with carcinoma; a boggy tender gland with prostatitis or abscess.", { normal: "Smooth, rubbery, non-tender." }),
        item("median_sulcus", "Median sulcus and lateral lobes", "Feel for the central groove between the two lateral lobes and whether the lobes are symmetrical and mobile over the rectal mucosa.", "An obliterated median sulcus with a fixed irregular gland is associated with locally advanced carcinoma; a preserved sulcus with benign enlargement.", d),
        item("prostate_tenderness", "Tenderness", "Note any tenderness on palpation of the gland; do not massage a tender gland in a febrile patient.", "A very tender, warm gland in a febrile patient is associated with acute prostatitis or prostatic abscess.", d),
        item("glove_inspection_gu", "The glove", "Look at the glove after withdrawal for blood, mucus or pus.", "Blood on the glove is associated with a rectal lesion that needs its own evaluation.", d),
      ],
    },
    {
      id: "tubes_gu",
      title: "Catheters, stents and drains",
      items: [
        item("catheter_check", "Urethral or suprapubic catheter", "Record the type and size of the catheter, the date of insertion, the site (for a suprapubic catheter, look for redness or leakage), and inspect the bag for the colour, clots and volume of urine.", "Blocked or clot-filled catheters are associated with retention and bladder spasm; meatal redness and discharge with catheter-associated infection.", { normal: "Catheter draining clear urine, site clean." }),
        item("nephrostomy_drain", "Nephrostomy, drain and wound sites", "Inspect each tube's exit site for redness, leakage and security, and record the output and its character.", "A falling nephrostomy output with loin pain is associated with a blocked or displaced tube; urine-like fluid in a drain with a urinary leak.", d),
        item("stent_record", "Ureteric stent", "Record from the notes whether a ureteric stent is in place, when it was inserted, and whether a removal date has been planned; ask about stent symptoms.", "A forgotten stent is associated with encrustation, infection and obstruction, so its presence belongs on every examination record.", d),
      ],
    },
  ],
};
