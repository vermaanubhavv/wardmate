/**
 * Blank examination diagrams for the printed history sheet — the drawing each department
 * conventionally marks findings on by hand. Outlines only: nothing is ever drawn onto them from
 * the record, so a diagram can never show a finding nobody made.
 *
 * Plain inline SVG in black line, so they print crisply at any zoom FitPage applies. Sides are
 * labelled from the patient's point of view — on a front view the patient's right is on the
 * viewer's left.
 */

const line = { fill: "none", stroke: "black", strokeWidth: 0.8 } as const;
const faint = { fill: "none", stroke: "black", strokeWidth: 0.5, strokeDasharray: "2 1.5" } as const;
const label = { fontSize: 7, fontFamily: "sans-serif", fill: "black" } as const;
const small = { ...label, fontSize: 5 } as const;

function Figure({ caption, viewBox, children }: { caption: string; viewBox: string; children: React.ReactNode }) {
  return (
    <figure className="flex flex-col items-center">
      <svg viewBox={viewBox} className="h-[38mm] w-auto" role="img" aria-label={caption}>
        {children}
      </svg>
      <figcaption className="text-[8.5px] font-semibold uppercase">{caption}</figcaption>
    </figure>
  );
}

// ---- Human body, front and back ------------------------------------------------------------

/** Head apart; trunk and legs as one outline; each arm hanging clear of the trunk. */
const TRUNK =
  "M44 30 L44 36 Q32 38 28 44 L28 100 Q28 120 30 128 L32 200 Q32 210 40 212 L46 212 L47 204 L49 136 L50 130 L51 136 L53 204 L54 212 L60 212 Q68 210 68 200 L70 128 Q72 120 72 100 L72 44 Q68 38 56 36 L56 30";
const ARMS = [
  "M28 46 Q19 47 17 58 L11 104 Q9 112 13 116 L17 115 L20 102 L25 64 L28 60",
  "M72 46 Q81 47 83 58 L89 104 Q91 112 87 116 L83 115 L80 102 L75 64 L72 60",
];

function Body({ back }: { back?: boolean }) {
  return (
    <Figure caption={back ? "Back" : "Front"} viewBox="0 0 100 222">
      <circle cx={50} cy={18} r={12} {...line} />
      <path d={TRUNK} {...line} />
      {ARMS.map((d) => (
        <path key={d} d={d} {...line} />
      ))}
      {back && <path d="M50 38 L50 128" {...faint} />}
      <text x={0} y={40} {...label}>{back ? "L" : "R"}</text>
      <text x={94} y={40} {...label}>{back ? "R" : "L"}</text>
    </Figure>
  );
}

// ---- Abdomen -------------------------------------------------------------------------------

/** The costal margins, rising from each flank to meet at the xiphisternum. */
const COSTAL = "M12 34 Q40 12 60 4 Q80 12 108 34";
/** Torso from the costal margin to the groin, both sides. */
const ABDOMEN_OUTLINE = "M12 4 L10 112 Q60 136 110 112 L108 4";

function AbdomenRegions() {
  const names = [
    ["R hypochond.", "Epigastrium", "L hypochond."],
    ["R lumbar", "Umbilical", "L lumbar"],
    ["R iliac", "Hypogastrium", "L iliac"],
  ];
  return (
    <Figure caption="Abdomen — nine regions" viewBox="0 0 120 130">
      <path d={ABDOMEN_OUTLINE} {...line} />
      <path d={COSTAL} {...line} />
      <path d="M43 6 L43 122 M77 6 L77 122 M11 42 L109 42 M10 82 L110 82" {...faint} />
      <circle cx={60} cy={62} r={1.4} {...line} />
      {names.map((row, r) =>
        row.map((n, c) => (
          <text key={n} x={[27, 60, 93][c]} y={[39, 74, 100][r]} textAnchor="middle" {...small}>
            {n}
          </text>
        ))
      )}
      <text x={1} y={70} {...label}>R</text>
      <text x={113} y={70} {...label}>L</text>
    </Figure>
  );
}

function AbdomenLandmarks() {
  return (
    <Figure caption="Abdomen — mark fundal height, scars" viewBox="0 0 120 130">
      <path d={ABDOMEN_OUTLINE} {...line} />
      <path d={COSTAL} {...line} />
      <circle cx={60} cy={62} r={1.4} {...line} />
      <path d="M40 8 L80 8 M20 62 L100 62 M30 112 L90 112" {...faint} />
      <text x={60} y={16} textAnchor="middle" {...small}>Xiphisternum</text>
      <text x={60} y={59} textAnchor="middle" {...small}>Umbilicus</text>
      <text x={60} y={109} textAnchor="middle" {...small}>Symphysis pubis</text>
      <text x={1} y={70} {...label}>R</text>
      <text x={113} y={70} {...label}>L</text>
    </Figure>
  );
}

// ---- Chest ---------------------------------------------------------------------------------

function Chest({ back }: { back?: boolean }) {
  // Two plain lungs; on the front view the left lung (viewer's right) carries the cardiac notch.
  const viewerLeft = "M42 18 Q30 20 24 44 Q18 70 18 96 Q30 100 44 96 L46 24 Q45 18 42 18 Z";
  const viewerRight = back
    ? "M78 18 Q90 20 96 44 Q102 70 102 96 Q90 100 76 96 L74 24 Q75 18 78 18 Z"
    : "M78 18 Q90 20 96 44 Q102 70 102 96 Q92 100 80 98 Q72 84 66 80 Q72 70 74 60 L74 24 Q75 18 78 18 Z";
  return (
    <Figure caption={back ? "Chest — back" : "Chest — front"} viewBox="0 0 120 112">
      <path d="M36 4 Q20 8 10 14 L8 108 L112 108 L110 14 Q100 8 84 4" {...line} />
      <path d={viewerLeft} {...line} />
      <path d={viewerRight} {...line} />
      {back && <path d="M60 6 L60 106" {...faint} />}
      <path d="M14 44 L106 44 M14 72 L106 72" {...faint} />
      <text x={2} y={40} {...small}>Upper</text>
      <text x={2} y={68} {...small}>Mid</text>
      <text x={2} y={94} {...small}>Lower</text>
      <text x={112} y={30} {...label}>{back ? "R" : "L"}</text>
      <text x={3} y={30} {...label}>{back ? "L" : "R"}</text>
    </Figure>
  );
}

// ---- Ear, eye ------------------------------------------------------------------------------

function TympanicMembrane({ side }: { side: "Right" | "Left" }) {
  // Handle of malleus runs from the umbo up and forward — toward the face, which is the
  // viewer's left for the right ear seen through an otoscope, the right for the left ear.
  const up = side === "Right" ? "M50 50 L42 18" : "M50 50 L58 18";
  return (
    <Figure caption={`${side} ear — TM`} viewBox="0 0 100 100">
      <circle cx={50} cy={50} r={40} {...line} />
      <path d="M10 50 L90 50 M50 10 L50 90" {...faint} />
      <path d={up} {...line} />
      <circle cx={50} cy={50} r={1.5} {...line} />
    </Figure>
  );
}

function Eye({ side }: { side: "Right" | "Left" }) {
  return (
    <Figure caption={`${side} eye`} viewBox="0 0 100 108">
      <path d="M8 34 Q50 4 92 34 Q50 64 8 34 Z" {...line} />
      <circle cx={50} cy={34} r={15} {...line} />
      <circle cx={50} cy={34} r={5} {...line} />
      <circle cx={50} cy={78} r={20} {...line} />
      {/* The optic disc sits nasal to the macula: toward the viewer's left for the right eye. */}
      <circle cx={side === "Right" ? 42 : 58} cy={78} r={4} {...line} />
      <text x={50} y={106} textAnchor="middle" {...small}>Fundus</text>
    </Figure>
  );
}

// ---- Which department draws what ------------------------------------------------------------

const BODY_BOTH = [<Body key="f" />, <Body key="b" back />];

const DIAGRAMS: Record<string, { figures: React.ReactNode[]; note?: string }> = {
  // General surgery takes the trauma admissions here, so it gets the body chart beside the abdomen.
  general_surgery: { figures: [<AbdomenRegions key="a" />, ...BODY_BOTH] },
  obstetrics_gynaecology: { figures: [<AbdomenLandmarks key="a" />] },
  burns_plastic_surgery: { figures: BODY_BOTH, note: "TBSA %: ________   Depth: ________" },
  dermatology: { figures: BODY_BOTH },
  medical_oncology: { figures: BODY_BOTH },
  pulmonary_medicine: { figures: [<Chest key="f" />, <Chest key="b" back />] },
  ent: { figures: [<TympanicMembrane key="r" side="Right" />, <TympanicMembrane key="l" side="Left" />] },
  ophthalmology: { figures: [<Eye key="r" side="Right" />, <Eye key="l" side="Left" />] },
  // Not departments yet — no pack exists for either (lib/specialty). Keyed here so the sheet
  // draws them the day a unit is created under one.
  emergency_medicine: {
    figures: BODY_BOTH,
    note: "Mechanism of injury: ____________________   GCS: E__ V__ M__",
  },
  orthopaedics: {
    figures: BODY_BOTH,
    note: "Mark swelling, deformity, wounds.   Distal pulses / sensation: ____________________",
  },
};

/** The department's diagram block, or nothing for a department that does not draw one. */
export function ExamDiagrams({ specialty }: { specialty: string }) {
  const d = DIAGRAMS[specialty];
  if (!d) return null;
  return (
    <div className="mt-1.5 break-inside-avoid">
      <p className="border-b border-black/40 text-[9.5px] font-bold uppercase tracking-wide">Diagram — mark findings</p>
      <div className="mt-1 flex items-end justify-center gap-8">{d.figures}</div>
      {d.note && <p className="mt-1 text-center text-[10.5px]">{d.note}</p>}
    </div>
  );
}
