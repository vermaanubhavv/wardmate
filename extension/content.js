/**
 * WardMate — prescription fill.
 *
 * Ticks the drugs from a WardMate discharge summary on the hospital's FUP drug list, and does
 * nothing else. It never presses Select, never presses Save, never fills a dose, and never
 * chooses a drug that a clinician has not already linked in WardMate.
 *
 * WHY TICKING AND NOT FILLING THE WHOLE FORM. Every tick is visible on screen before anything
 * is committed — the resident reads the list, sees exactly what was and was not ticked, and
 * presses Select themselves. A wrong tick is obvious and costs one click to undo. That is a
 * completely different risk from software walking a multi-step form and leaving a half-entered
 * prescription behind.
 *
 * MATCHING. The formulary text this compares against was captured from THIS page, so it is the
 * page's own wording matched to itself — not a drug name guessed into a catalogue. Where the
 * list repeats an entry (it holds 1,557 rows for 1,057 distinct medicines, the duplicates being
 * separate stock batches of the same thing) exactly ONE is ticked: ticking every match would
 * prescribe the drug several times over.
 */

const STORAGE_KEY = "wardmate_payload";
const norm = (s) => (s || "").replace(/\s+/g, " ").trim();

/* ------------------------------------------------------------------ the drug list page */

function isDrugListPage() {
  return /FUP\.aspx/i.test(location.pathname);
}

/** Every tickable row on the list, as { checkbox, text }. */
function listRows() {
  return [...document.querySelectorAll('input[type="checkbox"]')]
    .map((cb) => {
      const row = cb.closest("tr") || cb.parentElement;
      return row ? { cb, text: norm(row.innerText) } : null;
    })
    .filter((r) => r && r.text.length > 1);
}

/**
 * Tick one row per medicine.
 *
 * Returns what happened for every medicine, including the ones it could not act on — a report
 * that quietly omitted them would be how a resident ends up with a shorter prescription than
 * they wrote.
 */
function tickAll(medications) {
  const rows = listRows();
  const taken = new Set();
  const results = [];

  for (const med of medications) {
    if (!med.formulary) {
      results.push({ drug: med.drug, status: "unlinked" });
      continue;
    }

    const target = norm(med.formulary);
    // The first row with this exact text that no earlier medicine has already claimed. The
    // list repeats entries (separate stock batches of one medicine), so claiming rows keeps
    // two medicines mapped to the same entry from fighting over a single row — and stops one
    // medicine ticking all four of its duplicates, which would prescribe it four times.
    let index = -1;
    for (let i = 0; i < rows.length; i++) {
      if (!taken.has(i) && rows[i].text === target) {
        index = i;
        break;
      }
    }

    if (index === -1) {
      results.push({ drug: med.drug, status: "not-found", formulary: med.formulary });
      continue;
    }

    taken.add(index);
    const cb = rows[index].cb;
    // click() rather than setting .checked, so the page's own handlers run exactly as they
    // would for a real tick. Guarded, since clicking an already-ticked box would untick it.
    if (!cb.checked) cb.click();

    results.push({
      drug: med.drug,
      status: cb.checked ? "ticked" : "failed",
      formulary: med.formulary,
    });
  }

  return results;
}

/* --------------------------------------------------------------------- who is on screen */

/** The Case Sheet's own fields. The prescription page is a popup opened from it and shows no
 *  patient identity of its own, so identity is read from the parent window — live, not a copy
 *  taken earlier that could have gone stale against a different patient. */
const CASE_SHEET = {
  ip: "ctl00_cphpage_lblIPNO_IP",
  name: "ctl00_cphpage_lblPatientName_IP",
  admission: "ctl00_cphpage_lblAdmissionNo_IP",
};

/**
 * The document showing the Case Sheet — this page if it is the Case Sheet, otherwise the
 * window that opened this one. Null when neither can be read, which must stop the automation
 * rather than let it proceed unsure of who it is looking at.
 */
function caseSheetDocument() {
  if (document.getElementById(CASE_SHEET.ip)) return document;
  try {
    const parent = window.opener?.document;
    if (parent?.getElementById(CASE_SHEET.ip)) return parent;
  } catch {
    // Cross-origin or a closed opener. Treated the same as not found.
  }
  return null;
}

const fieldText = (doc, id) => norm(doc.getElementById(id)?.innerText);

/**
 * Whether it is safe to enter anything for this patient.
 *
 * The number is compared digit for digit, and there is deliberately NO fall-back to matching
 * the name: WardMate holds "SHYAMLAL" where the record may say "Shyam Lal", and a near-match
 * accepted here writes a prescription onto somebody else.
 *
 * The number alone is not proof of identity either, and this is the important part — an
 * insured worker and their dependants SHARE one IP number (the record carries a separate
 * SELF/FAMILY field precisely because of that). So a husband and wife admitted together both
 * match. The number is therefore checked by machine and the NAME is put on screen beside
 * WardMate's for a human to read: "SANDY" next to "Mrs.INDU DEVI" is impossible to miss.
 */
function identityCheck(payload) {
  const want = (payload.ipNumber || "").replace(/\D+/g, "");
  if (!want) return { ok: false, reason: "WardMate has no IP number for this patient." };

  const doc = caseSheetDocument();
  if (!doc) {
    return {
      ok: false,
      reason: "Cannot see the Case Sheet. Open this prescription page from the patient's Case Sheet.",
    };
  }

  const have = fieldText(doc, CASE_SHEET.ip).replace(/\D+/g, "");
  if (!have) return { ok: false, reason: "No IP number on the Case Sheet." };

  if (want !== have) {
    return { ok: false, reason: `Different patient: Case Sheet is IP ${have}, WardMate has IP ${want}.` };
  }

  return {
    ok: true,
    ip: have,
    // Shown, never matched on — see above.
    recordName: fieldText(doc, CASE_SHEET.name) || "(no name on record)",
    admission: fieldText(doc, CASE_SHEET.admission) || null,
  };
}

/* ------------------------------------------------------------------------------ the panel */

function buildPanel() {
  const panel = document.createElement("div");
  panel.className = "wm-panel";
  panel.innerHTML = `
    <div class="wm-head">
      <span class="wm-title">WardMate</span>
      <button class="wm-x" title="Hide">×</button>
    </div>
    <div class="wm-body"></div>
  `;
  document.body.appendChild(panel);
  panel.querySelector(".wm-x").addEventListener("click", () => panel.remove());
  return panel;
}

function render(panel, payload) {
  const body = panel.querySelector(".wm-body");

  if (!payload) {
    body.innerHTML = `
      <p class="wm-note">Paste the discharge medications copied from WardMate.</p>
      <textarea class="wm-paste" rows="3" placeholder="Paste here"></textarea>
      <button class="wm-btn wm-save">Load</button>
    `;
    body.querySelector(".wm-save").addEventListener("click", () => {
      const raw = body.querySelector(".wm-paste").value.trim();
      let parsed;
      try {
        parsed = JSON.parse(raw);
      } catch {
        return note(body, "That does not look like what WardMate copied.", true);
      }
      if (!parsed || !Array.isArray(parsed.medications)) {
        return note(body, "That does not look like what WardMate copied.", true);
      }
      chrome.storage.local.set({ [STORAGE_KEY]: parsed }, () => render(panel, parsed));
    });
    return;
  }

  const linked = payload.medications.filter((m) => m.formulary).length;
  // Only meaningful on the prescription page; the drug list shows no patient.
  const check = isDrugListPage() ? null : identityCheck(payload);

  body.innerHTML = `
    <p class="wm-patient">${escapeHtml(payload.patient || "—")}</p>
    ${
      check
        ? check.ok
          ? `<p class="wm-ok">IP ${escapeHtml(check.ip)} matches.</p>
             <p class="wm-confirm">Record says: <b>${escapeHtml(check.recordName)}</b><br>
             Check this is the same person — one IP number covers a whole family.</p>`
          : `<p class="wm-bad wm-strong">${escapeHtml(check.reason)}</p>`
        : ""
    }
    <p class="wm-note">${linked} of ${payload.medications.length} linked to the formulary.</p>
    <button class="wm-btn wm-tick">Tick ${linked} drug${linked === 1 ? "" : "s"}</button>
    <button class="wm-btn wm-ghost wm-clear">Clear</button>
    <div class="wm-results"></div>
  `;

  body.querySelector(".wm-clear").addEventListener("click", () => {
    chrome.storage.local.remove(STORAGE_KEY, () => render(panel, null));
  });

  body.querySelector(".wm-tick").addEventListener("click", () => {
    if (!isDrugListPage()) {
      return note(body, "Open the drug list first (Add, under Medications).", true);
    }
    // The drug list is a separate page and carries no patient identity of its own, so the
    // check runs where it can — see the banner rendered on the prescription page.
    const results = tickAll(payload.medications);
    showResults(body.querySelector(".wm-results"), results);
  });
}

function showResults(host, results) {
  const ticked = results.filter((r) => r.status === "ticked");
  const missing = results.filter((r) => r.status !== "ticked");

  host.innerHTML =
    `<p class="wm-ok">Ticked ${ticked.length}. Check the list, then press Select yourself.</p>` +
    (missing.length
      ? `<ul class="wm-miss">${missing
          .map((m) => {
            const why =
              m.status === "unlinked"
                ? "not linked in WardMate"
                : m.status === "not-found"
                  ? "not on this list"
                  : "could not tick";
            return `<li><b>${escapeHtml(m.drug)}</b> — ${why}. Enter by hand.</li>`;
          })
          .join("")}</ul>`
      : "");
}

function note(host, message, bad) {
  let el = host.querySelector(".wm-inline-note");
  if (!el) {
    el = document.createElement("p");
    el.className = "wm-inline-note";
    host.appendChild(el);
  }
  el.textContent = message;
  el.classList.toggle("wm-bad", !!bad);
}

const escapeHtml = (s) =>
  String(s).replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]
  );

/* ------------------------------------------------------------------------------- start up */

chrome.storage.local.get(STORAGE_KEY, (stored) => {
  const panel = buildPanel();
  render(panel, stored?.[STORAGE_KEY] ?? null);
});
