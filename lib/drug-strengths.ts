import { drugKey } from "@/lib/drug-key";

/**
 * The strengths common ward drugs are actually sold in, for the confirm card's dose dropdown.
 *
 * These are OPTIONS a resident picks from, never a value the app fills in: the dropdown opens on
 * whatever was dictated, and a drug missing from this list (or a strength missing from its row)
 * is typed by hand. Keyed by drugKey so "T. Pan", "pan" and "Pantoprazole" all land on one row.
 *
 * The ward's own formulary comes first (strengthsFromFormulary below); this list is the
 * fallback for a ward that has not imported one, and resolves short names ("pan") to the drug
 * name the formulary is searched by.
 */
type DrugRow = { name: string; aliases?: string[]; tab?: string[]; inj?: string[] };

const DRUGS: DrugRow[] = [
  { name: "Paracetamol", aliases: ["pcm", "acetaminophen"], tab: ["500 mg", "650 mg"], inj: ["1 g"] },
  { name: "Pantoprazole", aliases: ["pan"], tab: ["40 mg"], inj: ["40 mg"] },
  { name: "Rabeprazole", tab: ["20 mg"] },
  { name: "Ondansetron", aliases: ["emeset"], tab: ["4 mg", "8 mg"], inj: ["4 mg", "8 mg"] },
  { name: "Metoclopramide", aliases: ["perinorm"], tab: ["10 mg"], inj: ["10 mg"] },
  { name: "Domperidone", tab: ["10 mg"] },
  { name: "Ceftriaxone", aliases: ["monocef"], inj: ["250 mg", "500 mg", "1 g", "2 g"] },
  { name: "Cefuroxime", tab: ["250 mg", "500 mg"], inj: ["750 mg", "1.5 g"] },
  { name: "Cefixime", tab: ["200 mg", "400 mg"] },
  { name: "Cefoperazone-sulbactam", aliases: ["magnex"], inj: ["1.5 g", "3 g"] },
  { name: "Amoxicillin-clavulanate", aliases: ["augmentin", "amoxyclav", "co-amoxiclav"], tab: ["375 mg", "625 mg", "1 g"], inj: ["600 mg", "1.2 g"] },
  { name: "Piperacillin-tazobactam", aliases: ["piptaz", "pip taz", "tazact"], inj: ["2.25 g", "4.5 g"] },
  { name: "Meropenem", inj: ["500 mg", "1 g"] },
  { name: "Vancomycin", inj: ["500 mg", "1 g"] },
  { name: "Linezolid", tab: ["600 mg"], inj: ["600 mg"] },
  { name: "Metronidazole", aliases: ["metrogyl", "flagyl"], tab: ["200 mg", "400 mg"], inj: ["500 mg"] },
  { name: "Ciprofloxacin", aliases: ["cipro"], tab: ["250 mg", "500 mg", "750 mg"], inj: ["200 mg"] },
  { name: "Azithromycin", tab: ["250 mg", "500 mg"], inj: ["500 mg"] },
  { name: "Doxycycline", tab: ["100 mg"] },
  { name: "Amikacin", inj: ["100 mg", "250 mg", "500 mg"] },
  { name: "Gentamicin", inj: ["40 mg", "80 mg"] },
  { name: "Fluconazole", tab: ["150 mg"], inj: ["200 mg"] },
  { name: "Diclofenac", aliases: ["voveran"], tab: ["50 mg", "100 mg"], inj: ["75 mg"] },
  { name: "Tramadol", tab: ["50 mg", "100 mg"], inj: ["50 mg", "100 mg"] },
  { name: "Ketorolac", tab: ["10 mg"], inj: ["30 mg"] },
  { name: "Morphine", inj: ["10 mg"] },
  { name: "Tranexamic acid", aliases: ["txa"], tab: ["500 mg"], inj: ["500 mg"] },
  { name: "Heparin", inj: ["5000 U"] },
  { name: "Enoxaparin", aliases: ["clexane"], inj: ["40 mg", "60 mg"] },
  { name: "Furosemide", aliases: ["lasix", "frusemide"], tab: ["40 mg"], inj: ["20 mg"] },
  { name: "Hydrocortisone", inj: ["100 mg"] },
  { name: "Dexamethasone", aliases: ["dexa"], tab: ["0.5 mg", "4 mg"], inj: ["4 mg", "8 mg"] },
  { name: "Prednisolone", tab: ["5 mg", "10 mg", "20 mg", "40 mg"] },
  { name: "Levetiracetam", aliases: ["levipil"], tab: ["250 mg", "500 mg", "750 mg", "1000 mg"], inj: ["500 mg"] },
  { name: "Metformin", tab: ["500 mg", "850 mg", "1000 mg"] },
  { name: "Glimepiride", tab: ["1 mg", "2 mg"] },
  { name: "Insulin regular", aliases: ["actrapid", "insulin"], inj: [] },
  { name: "Amlodipine", tab: ["2.5 mg", "5 mg", "10 mg"] },
  { name: "Telmisartan", tab: ["20 mg", "40 mg", "80 mg"] },
  { name: "Nifedipine", tab: ["10 mg", "20 mg"] },
  { name: "Labetalol", tab: ["100 mg"], inj: ["20 mg"] },
  { name: "Atorvastatin", tab: ["10 mg", "20 mg", "40 mg", "80 mg"] },
  { name: "Aspirin", aliases: ["ecosprin"], tab: ["75 mg", "150 mg"] },
  { name: "Clopidogrel", tab: ["75 mg"] },
  { name: "Levothyroxine", aliases: ["thyroxine", "eltroxin"], tab: ["25 mcg", "50 mcg", "75 mcg", "100 mcg"] },
  { name: "Iron sucrose", inj: ["100 mg"] },
];

const BY_KEY = new Map<string, DrugRow>();
for (const d of DRUGS) for (const n of [d.name, ...(d.aliases ?? [])]) BY_KEY.set(drugKey(n), d);

export const DRUG_NAMES = DRUGS.map((d) => d.name);

/** The full drug name for a short or brand name ("pan" → "Pantoprazole"), or the name as given. */
export function canonicalDrug(name: string): string {
  return BY_KEY.get(drugKey(name))?.name ?? name.trim();
}

const STRENGTH = /(\d+(?:\.\d+)?)\s*(mg|mcg|µg|gm|g|iu|units?|u)\b\.?/gi;
const UNIT: Record<string, string> = { mg: "mg", mcg: "mcg", µg: "mcg", gm: "g", g: "g", iu: "U", unit: "U", units: "U", u: "U" };

/**
 * Strengths read off the ward's formulary entries for a drug, filtered to the form.
 *
 * Only entries naming exactly one strength count: "Domperidone 30mg., Pantoprazole 40mg." is a
 * combination product, and taking either number from it as a pantoprazole strength is exactly
 * the plausible wrong answer lib/formulary.ts warns about. An entry whose form cannot be told
 * from its text is offered under every form rather than dropped.
 */
export function strengthsFromFormulary(items: string[], form: string): string[] {
  const out: string[] = [];
  for (const item of items) {
    const found = [...item.matchAll(STRENGTH)];
    if (found.length !== 1) continue;
    const isTab = /\b(tabs?|tablets?|caps?|capsules?)\b/i.test(item);
    const isInj = /\b(inj|injection|vials?|amps?|ampoules?|infusion)\b/i.test(item);
    if (form === "Tab" && isInj && !isTab) continue;
    if (form === "Inj" && isTab && !isInj) continue;
    const [, n, u] = found[0];
    out.push(`${n} ${UNIT[u.toLowerCase()]}`);
  }
  return [...new Set(out)].sort((a, b) => parseDose(a) - parseDose(b));
}

/** Milligrams, for ordering only, so "500 mg" sits before "1 g". */
function parseDose(s: string): number {
  const [n, u] = s.split(" ");
  return Number(n) * (u === "g" ? 1000 : u === "mcg" ? 0.001 : 1);
}

/** The built-in strengths for a form ("Tab"/"Inj"), or every strength when no form is set.
 *  Empty for a drug not on the list — the dose is then typed. */
export function drugStrengths(name: string, form: string): string[] {
  const d = BY_KEY.get(drugKey(name));
  if (!d) return [];
  if (form === "Tab") return d.tab ?? [];
  if (form === "Inj") return d.inj ?? [];
  return [...new Set([...(d.tab ?? []), ...(d.inj ?? [])])];
}
