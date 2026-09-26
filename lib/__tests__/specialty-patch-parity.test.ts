import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { SPECIALTY_KEYS } from "@/lib/specialty";

/**
 * The code and the database must offer the same departments.
 *
 * WHY THIS TEST EXISTS. `create_ward_for_current_user` clamps an unrecognised specialty to
 * `general_surgery` rather than raising — the right call, because a client running yesterday's
 * JavaScript must not crash. The cost is that a department present in the picker but missing from
 * the database's list is SILENT: the resident chooses Paediatrics, the insert succeeds, and they
 * get a general surgery unit with no error anywhere. A doctor would find that out weeks later,
 * from a day counter that says POD.
 *
 * So the two lists are pinned to each other here. Adding a pack to SPECIALTY_KEYS without adding
 * it to the newest seam patch fails this test, in the suite, before it can reach a ward.
 *
 * It reads the HIGHEST-numbered patch that widens the constraint, because each one restates the
 * whole list — that file is the current truth about what the database accepts.
 */
describe("the picker and the database agree on which departments exist", () => {
  const dir = path.join(process.cwd(), "supabase/patches");

  const widening = readdirSync(dir)
    .filter((f) => f.endsWith(".sql"))
    .filter((f) => readFileSync(path.join(dir, f), "utf8").includes("wards_specialty_check"))
    .sort();
  const newest = widening[widening.length - 1];

  it("finds a patch that sets the constraint", () => {
    expect(newest).toBeTruthy();
  });

  it("every department in the code is accepted by the database", () => {
    const sql = readFileSync(path.join(dir, newest), "utf8");
    // The check-constraint list, which is the first of the two the patch restates.
    const block = sql.slice(sql.indexOf("add constraint wards_specialty_check"));
    const allowed = new Set([...block.slice(0, block.indexOf("));")).matchAll(/'([a-z_]+)'/g)].map((m) => m[1]));

    for (const key of SPECIALTY_KEYS) expect([...allowed]).toContain(key);
  });

  it("the create-unit guard accepts exactly the same list as the constraint", () => {
    const sql = readFileSync(path.join(dir, newest), "utf8");
    const guard = sql.slice(sql.indexOf("clean_specialty not in ("));
    const inGuard = new Set([...guard.slice(0, guard.indexOf(") then")).matchAll(/'([a-z_]+)'/g)].map((m) => m[1]));

    for (const key of SPECIALTY_KEYS) expect([...inGuard]).toContain(key);
  });
});
