/**
 * Renders the synthetic report photos used by the photo cases (cases.ts, set B) to PNG with
 * headless Chrome. Every report, lab and patient here is invented.
 *
 *   node scripts/eval-models/make-images.mjs
 *
 * The PNGs are committed so every run sends byte-identical images.
 */
import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync, rmSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";

const OUT = fileURLToPath(new URL("./images/", import.meta.url));
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
mkdirSync(OUT, { recursive: true });

const page = (body, extra = "") => `<!doctype html><meta charset="utf-8"><style>
body{font:15px/1.5 "Courier New",monospace;margin:28px;color:#111;background:#fdfdf8}
h1{font-size:18px;margin:0 0 4px}table{border-collapse:collapse;width:100%;margin-top:10px}
td,th{border-bottom:1px solid #bbb;padding:4px 6px;text-align:left}.blur{filter:blur(3px)}
${extra}</style><body>${body}</body>`;

const head = (title) => `<h1>SYNTHETIC TEST LABORATORY</h1><div>${title}</div>
<div>Patient: TEST PATIENT A · Age/Sex: 41/M · Sample: 14/09/2026</div>`;

const rows = (r) => `<table><tr><th>Test</th><th>Result</th><th>Unit</th><th>Reference range</th></tr>${r
  .map(([t, v, u, ref, cls]) => `<tr class="${cls ?? ""}"><td>${t}</td><td>${v}</td><td>${u}</td><td>${ref}</td></tr>`)
  .join("")}</table>`;

// Handwriting: macOS's own hand fonts on ruled paper, slightly tilted. The traps are the kinds
// lib/model.ts records from a real sheet — a blank duration, "Sx | BT", "1½ yr" — with invented
// content.
const hand = (body, font = "Noteworthy") => page(
  `<div class="sheet">${body}</div>`,
  `body{background:#f4f1e6}.sheet{font:20px/34px "${font}",cursive;color:#1b2a6b;transform:rotate(-0.8deg);
   background:repeating-linear-gradient(#f4f1e6 0 33px,#9fb4d8 33px 34px);padding:6px 18px;width:700px}
   .p{font:bold 15px "Courier New",monospace;color:#111}`
);

const PAGES = {
  "hw-case-sheet.png": hand(`<div>C/O pain abdomen since ________</div>
    <div>vomiting × 3 episodes, no fever</div>
    <div>LCB = 14 yr back · postmenopausal 1½ yr</div>
    <div>no h/o prev Sx | BT</div>
    <div>K/c/o HTN on Tab Amlo 5 mg OD</div>
    <div>O/E: P/A soft, mild tenderness epigastrium</div>`),
  "hw-register.png": hand(`<div>1. Ramkali 58/F bed 4 — Ca breast, post MRM POD 3, drain 40 ml</div>
    <div>2. Sohan 33/M bed 6 — appendicular lump</div>
    <div>3. bed 9 Farida 45/F — cholelithiasis, USG done, plan lap chole Mon</div>`, "Bradley Hand"),
  "hw-admission.png": hand(`<div class="p">ADMISSION SLIP (SYNTHETIC) — UHID/IP No: <span style="font:20px Noteworthy">2026/IP/0457</span></div>
    <div><span class="p">Name:</span> Kamlesh &nbsp; <span class="p">Age/Sex:</span> 47/F &nbsp; <span class="p">Bed:</span> SW-7</div>
    <div><span class="p">MRD No:</span> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; <span class="p">DOA:</span> 03/10/2026</div>
    <div><span class="p">Diagnosis:</span> Rt inguinal hernia</div>
    <div><span class="p">Planned:</span> hernioplasty</div>`),
  "cbc.png": page(head("COMPLETE BLOOD COUNT") + rows([
    ["Haemoglobin", "9.8", "g/dL", "13.0 - 17.0"],
    ["Total Leucocyte Count", "14,200", "/cumm", "4000 - 11000"],
    ["Platelet Count", "1.6", "lakh/cumm", "1.5 - 4.5"],
  ])),
  "rft-no-range.png": page(head("RENAL FUNCTION TEST") + rows([
    ["Serum Creatinine", "1.4", "mg/dL", "0.7 - 1.3"],
    ["Blood Urea", "48", "mg/dL", ""],
    ["Serum Potassium", "3.1", "mmol/L", "3.5 - 5.1"],
  ])),
  "gm-percent.png": page(head("HAEMATOLOGY") + rows([["Hb", "11.2", "gm%", "12 - 16"]])),
  "blurred-row.png": page(head("LIVER FUNCTION TEST") + rows([
    ["Total Bilirubin", "2.6", "mg/dL", "0.2 - 1.2"],
    ["SGPT (ALT)", "84", "U/L", "Up to 40"],
    ["Alkaline Phosphatase", "312", "U/L", "44 - 147", "blur"],
  ])),
  "monitor.png": page(
    `<div style="background:#000;color:#3f3;padding:24px;font:bold 40px monospace;width:520px">
     <div>HR <span style="font-size:64px">112</span></div>
     <div style="color:#ff5">SpO₂ <span style="font-size:64px">91</span>%</div>
     <div style="color:#f55">NIBP <span style="font-size:56px">96/58</span></div>
     <div style="color:#5cf">RR <span style="font-size:56px">26</span></div></div>`,
    "body{background:#222}"
  ),
  "case-sheet.png": page(`<h1>ADMISSION CASE SHEET (SYNTHETIC)</h1>
    <p><b>C/O:</b> pain abdomen right iliac fossa x 2 days, vomiting x 2 episodes.</p>
    <p><b>O/E:</b> Pulse 104/min. Afebrile. Tenderness RIF, guarding present.</p>
    <p><b>Provisional diagnosis:</b> acute appendicitis</p>
    <p><b>Plan:</b> NBM, IV fluids, USG abdomen, surgery reference.</p>`),
};

for (const [name, html] of Object.entries(PAGES)) {
  // Committed images stay byte-identical; delete one to re-render it.
  if (existsSync(`${OUT}${name}`)) continue;
  const src = `${OUT}${name}.html`;
  writeFileSync(src, html);
  execFileSync(CHROME, ["--headless=new", "--disable-gpu", "--hide-scrollbars", `--screenshot=${OUT}${name}`, "--window-size=760,520", `file://${src}`], { stdio: "ignore" });
  rmSync(src);
  console.log("wrote", name);
}
