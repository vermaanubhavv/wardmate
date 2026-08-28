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
  body.innerHTML = `
    <p class="wm-patient">${escapeHtml(payload.patient || "—")}</p>
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
