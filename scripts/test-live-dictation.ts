/**
 * Pure-logic checks for the live case-history dictation flow — no microphone, no socket, no
 * model. Run with:
 *
 *   node --import ./scripts/alias-register.mjs scripts/test-live-dictation.ts
 *
 * Covers the one thing that must not drift: every section the router can emit has somewhere to
 * go — a stored observation label, the HOPI special case, or the "held for the resident to
 * place" set. The Deepgram streaming query is covered in lib/transcription/__tests__.
 */
import {
  ROUTABLE_SECTIONS,
  HISTORY_SECTION_LABEL,
  EXAM_SECTION_LABEL,
  HELD_SECTIONS,
} from "../lib/case-history-sections.ts";

let failures = 0;
function ok(name: string, cond: boolean, detail = "") {
  console.log(`${cond ? "  ok  " : "FAIL  "}${name}${cond || !detail ? "" : `  — ${detail}`}`);
  if (!cond) failures++;
}

console.log("\nsection routing map:");
for (const section of ROUTABLE_SECTIONS) {
  const placed =
    section === "hopi" ||
    Boolean(HISTORY_SECTION_LABEL[section]) ||
    Boolean(EXAM_SECTION_LABEL[section]) ||
    HELD_SECTIONS.has(section);
  ok(`"${section}" is either stored or explicitly held`, placed);
}

ok("complaints is stored under 'chief complaints'", HISTORY_SECTION_LABEL.complaints === "chief complaints");
ok("abdomen is stored under 'per abdomen'", EXAM_SECTION_LABEL.abdomen === "per abdomen");
ok(
  "diagnosis and plan are held, not auto-written",
  HELD_SECTIONS.has("diagnosis") && HELD_SECTIONS.has("plan") && !HISTORY_SECTION_LABEL.diagnosis
);
ok(
  "history and exam label sets do not overlap",
  Object.keys(HISTORY_SECTION_LABEL).every((k) => !(k in EXAM_SECTION_LABEL))
);
ok(
  "the general-examination narrative is held, not written to a card",
  HELD_SECTIONS.has("examination")
);

console.log(`\n${failures === 0 ? "ALL PASS" : `${failures} FAILURE(S)`}\n`);
process.exit(failures === 0 ? 0 : 1);
