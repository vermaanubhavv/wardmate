/**
 * Typical adult vital ranges, used only to decide which recorded vital gets a colour on the
 * trend tiles. Same discipline as lib/lab-ranges.ts and for the same reason: the number shown
 * is exactly the number recorded, the range is printed beside the flag so the judgement is
 * checkable rather than asserted, and anything this file cannot confidently parse is shown
 * unflagged rather than guessed at. A wrong guess here is not a rounding error — it is the
 * exact failure the competitor screenshot showed: a heart rate of 10 fed straight into a
 * generated "likely ACS" plan. This file flags a number. It suggests nothing about what it
 * means, and nothing downstream is allowed to either.
 */

export type VitalFlag = "high" | "low" | null;

export type VitalComponent = {
  label: string;
  value: string;
  flag: VitalFlag;
  range: string;
};

const norm = (s: string) => s.toLowerCase().replace(/\s+/g, " ").trim();

function firstNumber(s: string): number | null {
  const m = s.match(/-?\d+(?:\.\d+)?/);
  if (!m) return null;
  const n = Number(m[0]);
  return Number.isFinite(n) ? n : null;
}

function flagOf(n: number, low: number, high: number): VitalFlag {
  if (n < low) return "low";
  if (n > high) return "high";
  return null;
}

/**
 * Blood pressure is the one vital written as two numbers. Returns null when the text is not
 * recognisably "systolic/diastolic" — a form this unsure of is shown as recorded, unflagged,
 * rather than this function inventing a split that was not there.
 */
function classifyBP(value: string): VitalComponent[] | null {
  const m = value.match(/(\d{2,3})\s*\/\s*(\d{2,3})/);
  if (!m) return null;
  const sys = Number(m[1]);
  const dia = Number(m[2]);
  return [
    { label: "Systolic", value: String(sys), flag: flagOf(sys, 90, 140), range: "90–140" },
    { label: "Diastolic", value: String(dia), flag: flagOf(dia, 60, 90), range: "60–90" },
  ];
}

const VITALS: {
  key: string;
  label: string;
  aliases: string[];
  low: number;
  high: number;
  unit?: string;
}[] = [
  { key: "hr", label: "PR", aliases: ["pr", "pulse", "pulse rate", "heart rate", "hr"], low: 60, high: 100 },
  { key: "spo2", label: "SpO₂", aliases: ["spo2", "saturation", "oxygen saturation", "sats", "spo₂", "sat", "o2 saturation"], low: 94, high: 100 },
  { key: "rr", label: "RR", aliases: ["rr", "respiratory rate", "resp rate"], low: 12, high: 20 },
  { key: "temp", label: "Temp", aliases: ["temperature", "temp", "temp f", "fever"], low: 97, high: 99.5, unit: "°F" },
];

function findVital(label: string): (typeof VITALS)[number] | null {
  const l = norm(label);
  return VITALS.find((v) => v.aliases.includes(l)) ?? null;
}

/**
 * One recorded vital, in whatever components it prints as. BP returns two; everything else
 * returns one, or none at all when the label is not a vital this file recognises, or the value
 * could not be read as a number — never a guessed-at flag.
 */
export function classifyVital(label: string, value: string | null): VitalComponent[] {
  if (!value || !value.trim()) return [];
  const v = value.trim();

  if (/^bp$|blood pressure/.test(norm(label))) {
    const bp = classifyBP(v);
    if (bp) return bp;
    return [{ label: "BP", value: v, flag: null, range: "" }];
  }

  const def = findVital(label);
  if (!def) return [];

  // "afebrile" and its kin read as a plain in-range temperature; classifying that as a flagged
  // value would be worse than not flagging it, so this stays deliberately narrow rather than
  // guessing a number for a word.
  if (/^(afebrile|normal|nad|normothermic)$/i.test(v)) {
    return [{ label: def.label, value: v, flag: null, range: "" }];
  }

  const n = firstNumber(v);
  if (n === null) return [{ label: def.label, value: v, flag: null, range: "" }];

  return [
    {
      label: def.label,
      value: def.unit ? `${n}${def.unit}` : String(n),
      flag: flagOf(n, def.low, def.high),
      range: `${def.low}–${def.high}${def.unit ?? ""}`,
    },
  ];
}

/** True when this label is a vital this file can classify at all — BP included. */
export function isKnownVital(label: string): boolean {
  return /^bp$|blood pressure/.test(norm(label)) || findVital(label) !== null;
}
