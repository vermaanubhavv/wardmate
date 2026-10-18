import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";
import * as gs from "@/lib/discharge-templates";
import * as burns from "@/lib/discharge-templates-burns-plastic-surgery";
import * as derm from "@/lib/discharge-templates-dermatology";
import * as emergency from "@/lib/discharge-templates-emergency";
import * as ent from "@/lib/discharge-templates-ent";
import * as medicine from "@/lib/discharge-templates-medicine";
import * as neuro from "@/lib/discharge-templates-neurosurgery";
import * as obgyn from "@/lib/discharge-templates-obgyn";
import * as onco from "@/lib/discharge-templates-oncology";
import * as ophth from "@/lib/discharge-templates-ophthalmology";
import * as ortho from "@/lib/discharge-templates-orthopaedics";
import * as paeds from "@/lib/discharge-templates-paediatrics";
import * as psych from "@/lib/discharge-templates-psychiatry";
import * as pulm from "@/lib/discharge-templates-pulmonary";
import * as uro from "@/lib/discharge-templates-urology";

/** Key-order-independent serialisation: what a template prints, not how its literal is written. */
function stable(v: unknown): string {
  if (v instanceof RegExp) return JSON.stringify(v.toString());
  if (Array.isArray(v)) return `[${v.map(stable).join(",")}]`;
  if (v && typeof v === "object") {
    return `{${Object.keys(v)
      .sort()
      .map((k) => `${JSON.stringify(k)}:${stable((v as Record<string, unknown>)[k])}`)
      .join(",")}}`;
  }
  return JSON.stringify(v);
}

describe("discharge template content", () => {
  it("is unchanged — every template in every specialty, byte for byte", () => {
    const modules = { gs, burns, derm, emergency, ent, medicine, neuro, obgyn, onco, ophth, ortho, paeds, psych, pulm, uro };
    const data = Object.fromEntries(
      Object.entries(modules).map(([name, mod]) => [
        name,
        Object.fromEntries(Object.entries(mod).filter(([k, v]) => /TEMPLATES?$/.test(k) && typeof v === "object")),
      ]),
    );
    // A deliberate content change updates this hash; a refactor must not.
    expect(createHash("sha256").update(stable(data)).digest("hex")).toBe("d3a0547e634b02577c59ccb4997b5447f05590a4df7a6c9c00a085370ee708f1");
  });
});
