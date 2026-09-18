/**
 * Builds the clinician review pack: one self-contained HTML page with every complaint tree
 * and examination checklist, laid out for a senior clinician to read and mark up. No app,
 * no login, no patient data — content only.
 *
 *   node --import ./scripts/alias-register.mjs scripts/review-pack.ts [out.html]
 *
 * Default output: docs/review-pack.html. The same file is what gets published as a
 * shareable page. Regenerate after any content change; the page states the tree versions.
 */
import { writeFileSync } from "node:fs";
import { listTrees } from "@/lib/history-check/trees";
import { listExamChecklists } from "@/lib/history-check/exams";
import { SLOT_GROUPS, type Reference, type SlotGroup } from "@/lib/history-check/types";

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const GROUP_TITLE: Record<SlotGroup, string> = {
  informant: "Informant",
  hpi: "History of the presenting illness",
  associated: "Associated symptoms and pertinent negatives",
  red_flag: "Must-not-miss (asked of every patient, both modes)",
  exposure: "Exposures and background",
};

function refs(list: Reference[]) {
  return `<ol class="refs">${list
    .map((r) => {
      const link = r.pmid
        ? ` <a href="https://pubmed.ncbi.nlm.nih.gov/${r.pmid}/" target="_blank" rel="noreferrer">PMID ${r.pmid}</a>`
        : r.url
          ? ` <a href="${esc(r.url)}" target="_blank" rel="noreferrer">link</a>`
          : "";
      return `<li>${esc(r.title)}. <i>${esc(r.source)}</i>${r.year ? ` ${r.year}` : ""}.${link}</li>`;
    })
    .join("")}</ol>`;
}

function verdict(id: string) {
  return `<div class="verdict" id="verdict-${id}">
  <p class="verdict-title">Reviewer's verdict</p>
  <p class="boxes"><span>☐ Approve as written</span><span>☐ Approve with the changes noted</span><span>☐ Needs revision before use</span></p>
  <p class="lines" aria-hidden="true"></p>
  <p class="sign">Reviewer ______________________ &nbsp; Designation ____________________ &nbsp; Date ____________</p>
</div>`;
}

const trees = listTrees();
const exams = listExamChecklists();
const totalQuestions = trees.reduce((n, t) => n + t.slots.length, 0);
const totalExamPoints = exams.reduce((n, e) => n + e.sections.reduce((m, s) => m + s.items.length, 0), 0);
const today = new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });

const treeSections = trees
  .map((t, ti) => {
    const label = new Map(t.slots.map((s) => [s.id, s.label]));
    let n = 0;
    const groups = SLOT_GROUPS.map((g) => {
      const slots = t.slots.filter((s) => s.group === g);
      if (!slots.length) return "";
      return `<h4 class="${g === "red_flag" ? "rf" : ""}">${GROUP_TITLE[g]}</h4>
<ol class="qs" start="${n + 1}">${slots
        .map((s) => {
          n++;
          const chips = [
            s.tier === "detailed" ? `<span class="chip">academic only</span>` : `<span class="chip core">core</span>`,
            s.kind === "value" ? `<span class="chip">records the patient's words</span>` : `<span class="chip">present / explicitly absent / not asked</span>`,
            s.numeric ? `<span class="chip amber">number — stays unconfirmed</span>` : "",
          ].join("");
          return `<li id="${t.id}-${s.id}"><div class="q">${esc(s.question)}</div><div class="meta"><span class="lbl">${esc(s.label)}</span>${chips}</div>${
            s.teach ? `<p class="teach"><span>Why it is asked</span> ${esc(s.teach)}</p>` : ""
          }</li>`;
        })
        .join("")}</ol>`;
    }).join("");

    const diffs = `<div class="tablewrap"><table class="diffs"><thead><tr><th>Differential</th><th>Raised by (pointers)</th><th>Separated by (discriminators)</th></tr></thead><tbody>${t.differentials
      .map(
        (d) =>
          `<tr><td>${esc(d.name)}${d.appliesWhen === "post_op" ? ` <span class="chip">after surgery only</span>` : ""}</td><td>${d.pointers
            .map((p) => esc(label.get(p) ?? p))
            .join(", ")}</td><td>${d.discriminators.map((p) => esc(label.get(p) ?? p)).join(", ")}</td></tr>`
      )
      .join("")}</tbody></table></div>`;

    return `<section class="tree" id="tree-${t.id}">
<header class="tree-head">
  <p class="eyebrow">Tree ${ti + 1} of ${trees.length} · <code>${t.id}</code> v${t.version}</p>
  <h2>${esc(t.complaint)}</h2>
  <p class="status"><span class="chip amber">${t.reviewStatus === "reviewed" ? `Reviewed by ${esc(t.reviewedBy ?? "")}` : "Pending clinician review"}</span> <span class="muted">${esc(t.setting)} · ${t.slots.length} questions · ${t.differentials.length} differentials</span></p>
  <p class="muted small">Suggested to the resident when the chief complaint contains: ${t.triggers.map(esc).join(" · ")}</p>
</header>
${groups}
<h4>What separates the differentials</h4>
<p class="muted small">The app never shows a diagnosis. It counts positive pointers only to order the gap list, and words the result as "questions that would help separate X / Y".</p>
${diffs}
<h4>Sources</h4>
${refs(t.references)}
${verdict(t.id)}
</section>`;
  })
  .join("");

const examSections = exams
  .map(
    (e) => `<section class="tree" id="exam-${e.id}">
<header class="tree-head">
  <p class="eyebrow">Examination checklist · <code>${e.id}</code> v${e.version}</p>
  <h2>${esc(e.title)}</h2>
  <p class="status"><span class="chip amber">${e.reviewStatus === "reviewed" ? `Reviewed by ${esc(e.reviewedBy ?? "")}` : "Pending clinician review"}</span> <span class="muted">${esc(e.setting)} · ${e.sections.reduce((n, s) => n + s.items.length, 0)} points in ${e.sections.length} sections</span></p>
  <p class="muted small">In the app each point has an (i) button that opens "How to check" and "Seen in". Both texts are printed here in full.</p>
</header>
${e.sections
  .map(
    (s) => `<h4>${esc(s.title)}</h4>${s.intro ? `<p class="muted small">${esc(s.intro)}</p>` : ""}
<ol class="qs exam">${s.items
      .map(
        (it) => `<li id="${e.id}-${it.id}"><div class="q">${esc(it.label)} ${it.tier === "detailed" ? `<span class="chip">academic only</span>` : ""}</div>
<p class="how"><span>How to check</span> ${esc(it.how)}</p>
<p class="how"><span>Seen in</span> ${esc(it.significance)}</p>
${it.normal ? `<p class="how"><span>Record as normal</span> ${esc(it.normal)}</p>` : ""}</li>`
      )
      .join("")}</ol>`
  )
  .join("")}
<h4>Sources</h4>
${refs(e.references)}
${verdict(`exam-${e.id}`)}
</section>`
  )
  .join("");

const toc = `<nav class="toc" aria-label="Contents"><h3>Contents</h3><ol>${trees
  .map((t) => `<li><a href="#tree-${t.id}">${esc(t.complaint)}</a> <span class="muted">${t.slots.length} q</span></li>`)
  .join("")}${exams.map((e) => `<li><a href="#exam-${e.id}">${esc(e.title)}</a> <span class="muted">${e.sections.reduce((n, s) => n + s.items.length, 0)} points</span></li>`).join("")}</ol></nav>`;

const html = `<title>WardMate History Review Pack</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Source+Serif+4:opsz,wght@8..60,500;8..60,600&display=swap">
<style>
:root{--ground:#fbfcfb;--paper:#ffffff;--ink:#1c2b2a;--muted:#5f6b6a;--line:#d5dedb;--accent:#0f9e96;--accent-ink:#ffffff;--amber:#b45309;--amber-bg:#fdf3e4;--rf:#9a3412;--chip:#eef3f2;--teach:#f3f8f7}
@media (prefers-color-scheme: dark){:root:not([data-theme="light"]){--ground:#0f1716;--paper:#151f1e;--ink:#e4eeec;--muted:#9fb1ae;--line:#2a3836;--accent:#3fc4bb;--accent-ink:#06211f;--amber:#f0b36a;--amber-bg:#3a2a12;--rf:#f3a27e;--chip:#1f2c2a;--teach:#172422}}
:root[data-theme="dark"]{--ground:#0f1716;--paper:#151f1e;--ink:#e4eeec;--muted:#9fb1ae;--line:#2a3836;--accent:#3fc4bb;--accent-ink:#06211f;--amber:#f0b36a;--amber-bg:#3a2a12;--rf:#f3a27e;--chip:#1f2c2a;--teach:#172422}
body{background:var(--ground);color:var(--ink);font:15px/1.5 -apple-system,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif;padding-inline:16px;padding-block:24px 64px;font-variant-numeric:tabular-nums}
.wrap{max-width:760px;margin:0 auto}
h1,h2,h3{font-family:"Source Serif 4",Georgia,"Times New Roman",serif;text-wrap:balance;line-height:1.15;margin:0}
h1{font-size:2.1rem;font-weight:600}
h2{font-size:1.65rem;font-weight:600;margin-top:.15rem}
h3{font-size:1.15rem;font-weight:600;margin:1.6rem 0 .5rem}
h4{font-size:.78rem;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);margin:1.8rem 0 .5rem;font-weight:700}
h4.rf{color:var(--rf)}
p{margin:.35rem 0}
.muted{color:var(--muted)}.small{font-size:.86rem}
.eyebrow{font-size:.78rem;letter-spacing:.06em;text-transform:uppercase;color:var(--muted);margin:0}
code{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:.85em;background:var(--chip);padding:0 .3em;border-radius:4px}
a{color:var(--accent)}
.cover{background:var(--paper);border:1px solid var(--line);border-radius:12px;padding:24px 22px;margin-bottom:28px}
.cover .kv{display:grid;grid-template-columns:auto 1fr;gap:.25rem 1rem;margin:14px 0;font-size:.92rem}
.cover .kv dt{color:var(--muted)}.cover .kv dd{margin:0}
.rules{padding-left:1.2rem;margin:.5rem 0}.rules li{margin:.3rem 0}
.toc{background:var(--paper);border:1px solid var(--line);border-radius:12px;padding:16px 20px;margin-bottom:28px}
.toc ol{columns:2;column-gap:2rem;padding-left:1.4rem;margin:.4rem 0 0}.toc li{break-inside:avoid;margin:.15rem 0}
@media (max-width:520px){.toc ol{columns:1}}
.tree{background:var(--paper);border:1px solid var(--line);border-radius:12px;padding:22px 22px 18px;margin-bottom:28px;break-before:page}
.tree-head{border-bottom:1px solid var(--line);padding-bottom:12px}
.status{display:flex;flex-wrap:wrap;gap:.5rem;align-items:center;margin-top:.5rem}
.chip{display:inline-block;font-size:.72rem;padding:.1rem .5rem;border-radius:999px;background:var(--chip);color:var(--muted);white-space:nowrap;vertical-align:middle}
.chip.core{background:var(--accent);color:var(--accent-ink)}
.chip.amber{background:var(--amber-bg);color:var(--amber)}
.qs{padding-left:1.6rem;margin:0}
.qs li{margin:0 0 .9rem;padding-bottom:.9rem;border-bottom:1px dashed var(--line)}
.qs li:last-child{border-bottom:0}
.q{font-size:1rem;font-weight:500}
.meta{display:flex;flex-wrap:wrap;gap:.35rem;align-items:center;margin-top:.25rem;font-size:.8rem;color:var(--muted)}
.lbl{font-weight:600;color:var(--muted)}
.teach,.how{background:var(--teach);border-left:3px solid var(--accent);padding:.4rem .7rem;border-radius:0 6px 6px 0;margin:.45rem 0 0;font-size:.9rem}
.teach span,.how span{display:block;font-size:.7rem;letter-spacing:.07em;text-transform:uppercase;color:var(--muted);font-weight:700}
.exam .q{font-size:1.02rem}
.tablewrap{overflow-x:auto;margin:.5rem 0}
table.diffs{border-collapse:collapse;width:100%;font-size:.88rem}
table.diffs th,table.diffs td{text-align:left;vertical-align:top;padding:.45rem .6rem;border-bottom:1px solid var(--line)}
table.diffs th{font-size:.72rem;letter-spacing:.06em;text-transform:uppercase;color:var(--muted)}
.refs{padding-left:1.4rem;font-size:.86rem;color:var(--muted)}.refs li{margin:.2rem 0}
.verdict{margin-top:1.6rem;border:1.5px solid var(--amber);border-radius:10px;padding:12px 16px;background:var(--amber-bg)}
.verdict-title{font-weight:700;color:var(--amber);margin:0 0 .3rem;font-size:.85rem;letter-spacing:.06em;text-transform:uppercase}
.boxes{display:flex;flex-wrap:wrap;gap:.4rem 1.4rem;margin:.2rem 0 .6rem;font-size:.95rem}
.lines{height:5.5rem;background:repeating-linear-gradient(to bottom,transparent 0,transparent 1.35rem,var(--line) 1.35rem,var(--line) calc(1.35rem + 1px));margin:.4rem 0}
.sign{font-size:.85rem;color:var(--muted);margin:.4rem 0 0}
footer{text-align:center;color:var(--muted);font-size:.82rem;margin-top:2rem}
@media print{body{background:#fff;color:#000;padding:0}.tree,.cover,.toc{border:0;border-radius:0;padding:0 0 12px;box-shadow:none;background:#fff}.teach,.how{background:#f4f4f4;border-left-color:#666}.verdict{background:#fff;border-color:#000}.chip.core{background:#ddd;color:#000}a{color:#000;text-decoration:none}}
@media (prefers-reduced-motion: reduce){*{scroll-behavior:auto}}
</style>
<div class="wrap">
<header class="cover">
  <p class="eyebrow">WardMate · case-history teaching content · for clinical review</p>
  <h1>WardMate History Review Pack</h1>
  <dl class="kv">
    <dt>Prepared</dt><dd>${today}</dd>
    <dt>Contents</dt><dd>${trees.length} complaint trees (${totalQuestions} questions) and ${exams.length} examination checklist (${totalExamPoints} points)</dd>
    <dt>Status</dt><dd>Every item is marked <b>pending clinician review</b>. Nothing here is shown to a patient or used to decide treatment.</dd>
    <dt>Setting</dt><dd>Adult general medicine ward, north India; MBBS students, interns and residents taking a history</dd>
  </dl>
  <h3>What you are reviewing</h3>
  <p>WardMate is a ward app in which a resident dictates a case history. For a chosen presenting complaint, the app checks the dictation against the question list below and shows the resident which questions were <b>not asked</b>, with the red-flag questions always first. In the <b>Academic</b> mode, students also see the full list, the "why it is asked" line, the differentials as "what separates them", and the examination checklist with a how-to note for every point.</p>
  <p>The app never generates a clinical value, never labels silence as a negative, and never states a diagnosis or a treatment; the content below is checked by a validator for dose, instruction and diagnosis wording before it can ship. Your review is of the <b>clinical content</b>: are these the right questions, in the right order, with the right red flags and the right differentials for this setting?</p>
  <h3>How to review</h3>
  <ol class="rules">
    <li>Read one complaint at a time. Mark a question wrong, missing, badly worded, or in the wrong group directly on the page or in the lined box at the end of each tree.</li>
    <li>Red flags matter most: is anything missing that must never be missed on a ward in this setting?</li>
    <li>Check the "why it is asked" lines. They are teaching text for students; they must not read as a diagnosis.</li>
    <li>Tick one verdict per tree and sign. A tree marked "Approve" will be switched from <i>pending clinician review</i> to <i>reviewed</i> with your name in the app.</li>
  </ol>
  <p class="muted small">Meaning of the labels: <span class="chip core">core</span> asked on every ward patient · <span class="chip">academic only</span> asked in the long case and shown to students · <span class="chip amber">number — stays unconfirmed</span> a numeric answer that the app shows in amber until a clinician confirms it.</p>
</header>
${toc}
${treeSections}
${examSections}
<footer>Generated from the WardMate content files by <code>scripts/review-pack.ts</code>. Tree versions are printed in each section header.</footer>
</div>
`;

const out = process.argv[2] ?? "docs/review-pack.html";
writeFileSync(out, html);
console.log(`wrote ${out}: ${trees.length} trees, ${totalQuestions} questions, ${exams.length} checklists, ${(html.length / 1024).toFixed(0)} KB`);
