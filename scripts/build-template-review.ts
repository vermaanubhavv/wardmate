/**
 * Renders the template seed SQL as a readable page for clinical review.
 *
 * Generated from the SQL rather than written by hand, so the page can never drift from what
 * the database will actually contain — a review document that disagrees with the thing being
 * reviewed is worse than no review document.
 *
 *   node scripts/build-template-review.ts
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

type Item = {
  label: string;
  aliases?: string[];
  kind?: string;
  importance?: string;
  hint?: string;
};
type Template = {
  family: string;
  variant: string | null;
  phase: string;
  name: string;
  items: Item[];
};

const here = dirname(fileURLToPath(import.meta.url));
const sql = readFileSync(join(here, "..", "supabase", "patches", "0005_template_seed.sql"), "utf8");

const CALL =
  /select seed_template\(\s*'([^']+)'\s*,\s*(null|'[^']*')\s*,\s*'([^']+)'\s*,\s*'([^']*)'\s*,\s*\$j\$([\s\S]*?)\$j\$::jsonb\)/g;

const templates: Template[] = [];
for (const m of sql.matchAll(CALL)) {
  templates.push({
    family: m[1],
    variant: m[2] === "null" ? null : m[2].slice(1, -1),
    phase: m[3],
    name: m[4],
    items: JSON.parse(m[5]),
  });
}

const FAMILY_NAMES: Record<string, string> = {
  lap_chole: "Laparoscopic cholecystectomy",
  appendicectomy: "Appendicectomy",
  hernia: "Hernia",
  perianal: "Perianal surgery",
};
const FAMILY_ORDER = ["lap_chole", "appendicectomy", "hernia", "perianal"];

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const coreCount = templates.reduce(
  (n, t) => n + t.items.filter((i) => (i.importance ?? "core") === "core").length,
  0
);
const itemCount = templates.reduce((n, t) => n + t.items.length, 0);

function renderItems(items: Item[]): string {
  return items
    .map((item) => {
      const optional = (item.importance ?? "core") === "optional";
      return `<li class="item${optional ? " item--optional" : ""}">
        <div class="item__head">
          <span class="item__label">${esc(item.label)}</span>
          ${optional ? '<span class="tag">optional</span>' : ""}
          <span class="item__kind">${esc(item.kind ?? "note")}</span>
        </div>
        ${
          item.hint
            ? `<p class="item__hint">Reminder shown before you speak: “${esc(item.hint)}”</p>`
            : ""
        }
        ${
          item.aliases?.length
            ? `<p class="item__aliases">${item.aliases.map((a) => `<span>${esc(a)}</span>`).join("")}</p>`
            : ""
        }
      </li>`;
    })
    .join("\n");
}

function renderFamily(family: string): string {
  const inFamily = templates.filter((t) => t.family === family);
  const variants = [...new Set(inFamily.map((t) => t.variant))];

  const blocks = variants
    .map((variant) => {
      const pair = inFamily.filter((t) => t.variant === variant);
      const before = pair.find((t) => t.phase === "before_surgery");
      const after = pair.find((t) => t.phase === "after_surgery");

      return `<section class="variant">
        ${variant ? `<h3 class="variant__name">${esc(variant)}</h3>` : ""}
        <div class="phases">
          ${[before, after]
            .filter((t): t is Template => Boolean(t))
            .map(
              (t) => `<div class="phase">
                <h4 class="phase__name">
                  ${t.phase === "before_surgery" ? "Before surgery" : "After surgery"}
                  <span class="phase__count">${
                    t.items.filter((i) => (i.importance ?? "core") === "core").length
                  } core · ${t.items.length} total</span>
                </h4>
                <ul class="items">${renderItems(t.items)}</ul>
              </div>`
            )
            .join("\n")}
        </div>
      </section>`;
    })
    .join("\n");

  return `<section class="family" id="${esc(family)}">
    <h2 class="family__name">${esc(FAMILY_NAMES[family] ?? family)}</h2>
    ${blocks}
  </section>`;
}

const html = `<title>CoreResident — template review</title>
<style>
:root {
  /* Neutrals biased green rather than a default grey — the accent is surgical drape green,
     and the greys are mixed toward it so the page reads as one decision. */
  --paper: #f6f8f5;
  --ink: #17211c;
  --ink-soft: #55635b;
  --ink-faint: #7d8a82;
  --rule: #d5ddd4;
  --rule-soft: #e6ebe4;
  --accent: #0f6b52;
  --optional: #8a6a17;
  --mark: #e8f0ea;
}
@media (prefers-color-scheme: dark) {
  :root {
    --paper: #0f1613;
    --ink: #e2e9e3;
    --ink-soft: #9aa8a0;
    --ink-faint: #74827a;
    --rule: #253029;
    --rule-soft: #1c2520;
    --accent: #57b592;
    --optional: #c2a256;
    --mark: #17241e;
  }
}
:root[data-theme="dark"] {
  --paper: #0f1613; --ink: #e2e9e3; --ink-soft: #9aa8a0; --ink-faint: #74827a;
  --rule: #253029; --rule-soft: #1c2520; --accent: #57b592; --optional: #c2a256; --mark: #17241e;
}
:root[data-theme="light"] {
  --paper: #f6f8f5; --ink: #17211c; --ink-soft: #55635b; --ink-faint: #7d8a82;
  --rule: #d5ddd4; --rule-soft: #e6ebe4; --accent: #0f6b52; --optional: #8a6a17; --mark: #e8f0ea;
}

body {
  background: var(--paper);
  color: var(--ink);
  font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
  line-height: 1.5;
  margin: 0;
}
.wrap { max-width: 62rem; margin: 0 auto; padding: 3rem 1.5rem 6rem; }

.masthead { border-bottom: 2px solid var(--ink); padding-bottom: 1.25rem; }
.masthead h1 {
  font-size: clamp(1.75rem, 4vw, 2.5rem);
  line-height: 1.1; margin: 0; letter-spacing: -0.02em; text-wrap: balance;
}
.masthead p { color: var(--ink-soft); margin: 0.5rem 0 0; max-width: 60ch; }
.counts {
  display: flex; flex-wrap: wrap; gap: 1.5rem; margin-top: 1.25rem;
  font-variant-numeric: tabular-nums;
}
.count strong { display: block; font-size: 1.5rem; line-height: 1; }
.count span { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.08em; color: var(--ink-faint); }

.notice {
  border-left: 3px solid var(--optional);
  background: var(--rule-soft);
  padding: 1rem 1.25rem; margin: 2rem 0;
}
.notice h2 { font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.09em; margin: 0 0 0.5rem; color: var(--optional); }
.notice p { margin: 0 0 0.6rem; max-width: 62ch; }
.notice p:last-child { margin-bottom: 0; }

.controls {
  position: sticky; top: 0; z-index: 5;
  display: flex; flex-wrap: wrap; gap: 0.5rem 1rem; align-items: center;
  background: var(--paper); border-bottom: 1px solid var(--rule);
  padding: 0.85rem 0; margin-bottom: 2rem;
}
.controls a { color: var(--ink-soft); text-decoration: none; font-size: 0.85rem; border-bottom: 1px solid transparent; }
.controls a:hover, .controls a:focus-visible { color: var(--accent); border-bottom-color: var(--accent); }
.toggle { margin-left: auto; display: flex; align-items: center; gap: 0.5rem; font-size: 0.85rem; color: var(--ink-soft); cursor: pointer; }

.family { margin-top: 3.5rem; }
.family__name {
  font-size: 1.35rem; margin: 0 0 0.25rem; letter-spacing: -0.01em;
  padding-bottom: 0.5rem; border-bottom: 1px solid var(--ink);
}
.variant { margin-top: 2rem; }
.variant__name {
  font-size: 0.78rem; text-transform: uppercase; letter-spacing: 0.11em;
  color: var(--accent); margin: 0 0 0.75rem;
}
.phases { display: grid; gap: 2rem; }
@media (min-width: 56rem) { .phases { grid-template-columns: 1fr 1fr; gap: 2.5rem; } }

.phase__name {
  font-size: 0.95rem; margin: 0 0 0.75rem; padding-bottom: 0.4rem;
  border-bottom: 1px solid var(--rule);
  display: flex; justify-content: space-between; align-items: baseline; gap: 1rem;
}
.phase__count {
  font-size: 0.7rem; font-weight: 400; color: var(--ink-faint);
  font-variant-numeric: tabular-nums; white-space: nowrap;
}

.items { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 0.85rem; }
.item--optional { opacity: 0.62; }
.item__head { display: flex; align-items: baseline; gap: 0.5rem; flex-wrap: wrap; }
/* Monospace because these are literal strings the app matches speech against — the face
   is telling you they are exact, not prose. */
.item__label { font-family: ui-monospace, "SF Mono", Menlo, monospace; font-size: 0.9rem; font-weight: 600; }
.item__kind { font-size: 0.68rem; color: var(--ink-faint); text-transform: uppercase; letter-spacing: 0.07em; }
.tag {
  font-size: 0.62rem; text-transform: uppercase; letter-spacing: 0.08em;
  color: var(--optional); border: 1px solid var(--optional); border-radius: 2px; padding: 0.05rem 0.3rem;
}
.item__hint { margin: 0.3rem 0 0; font-size: 0.78rem; color: var(--ink-soft); font-style: italic; }
.item__aliases { margin: 0.3rem 0 0; display: flex; flex-wrap: wrap; gap: 0.25rem; }
.item__aliases span {
  font-family: ui-monospace, "SF Mono", Menlo, monospace;
  font-size: 0.7rem; color: var(--ink-soft);
  background: var(--mark); padding: 0.05rem 0.35rem; border-radius: 2px;
}

body.hide-optional .item--optional { display: none; }
:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
</style>

<div class="wrap">
  <header class="masthead">
    <h1>Ward round templates — draft for review</h1>
    <p>What CoreResident will expect you to mention for each operation, before and after surgery. Read it as a strawman and tell me what is wrong.</p>
    <div class="counts">
      <div class="count"><strong>${templates.length}</strong><span>Templates</span></div>
      <div class="count"><strong>${itemCount}</strong><span>Items</span></div>
      <div class="count"><strong>${coreCount}</strong><span>Core items</span></div>
      <div class="count"><strong>4</strong><span>Operations</span></div>
    </div>
  </header>

  <div class="notice">
    <h2>Two things before you read it</h2>
    <p><strong>This was drafted by someone who is not a surgeon.</strong> It comes from general surgical practice, not from your unit&rsquo;s protocol, your consultants&rsquo; preferences, or what your hospital actually monitors. Assume parts of it are wrong and tell me which.</p>
    <p><strong>A template never supplies a value.</strong> It only says what would normally be mentioned. If you do not say it, the app shows the item as not recorded &mdash; it never fills in a plausible number. Absent stays absent; it just becomes visible instead of silent.</p>
    <p><strong>Core</strong> items are shown as gaps when you do not mention them. <strong>Optional</strong> items appear as reminders only, so the screen does not fill with warnings on every patient.</p>
  </div>

  <nav class="controls">
    ${FAMILY_ORDER.map((f) => `<a href="#${f}">${esc(FAMILY_NAMES[f])}</a>`).join("\n    ")}
    <label class="toggle">
      <input type="checkbox" id="hideOptional" />
      Core items only
    </label>
  </nav>

  ${FAMILY_ORDER.map(renderFamily).join("\n")}
</div>

<script>
  document.getElementById("hideOptional").addEventListener("change", (e) => {
    document.body.classList.toggle("hide-optional", e.target.checked);
  });
</script>
`;

const out = join(here, "..", "..", "template-review.html");
writeFileSync(out, html, "utf8");
console.log(`wrote ${out}`);
console.log(`${templates.length} templates, ${itemCount} items (${coreCount} core)`);
