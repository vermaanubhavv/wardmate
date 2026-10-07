"use client";

import { useRef } from "react";
import LiveDictation, { type LiveSection } from "../live-dictation";
import { HELD_SECTIONS, sectionsForSpecialty, type RoutedSegment } from "@/lib/case-history-sections";

/**
 * "Dictate the whole clerking" — the shared live panel (../live-dictation.tsx) with the case
 * sheet's sections. Each pause is sorted AND filed (route-dictation appends it to the case
 * history), so the tables show what is now on record. Diagnosis, plan and general examination
 * are sorted but held for the resident to place. On close the workspace reloads so every card
 * reseeds from what was filed.
 */

const LABEL: Record<string, string> = {
  complaints: "Chief complaints",
  hopi: "History of presenting illness",
  past: "Past history",
  personal: "Personal history",
  family: "Family history",
  medication: "Medication history",
  surgical: "Surgical history",
  obstetric: "Menstrual & obstetric",
  dietary: "Dietary history",
  environmental: "Environmental history",
  onco_disease: "Oncological history",
  onco_treatment: "Treatment received",
  onco_cycle: "Current cycle",
  onco_toxicity: "Toxicity since last cycle",
  performance: "Performance status",
  onco_nodes: "Lymph node survey",
  onco_mucosa_line: "Mucosa, skin & line",
  examination: "General examination & vitals",
  abdomen: "Per abdomen",
  chest: "Chest",
  local: "Local examination",
  cvs: "Cardiovascular system",
  cns: "Central nervous system",
  diagnosis: "Provisional diagnosis",
  plan: "Plan",
};

export default function DictationOverlay({
  patientId,
  initialText,
  initialComplaints,
  specialty = "general_surgery",
  onClose,
}: {
  patientId: string;
  /** What each card already holds. */
  initialText: Record<string, string>;
  initialComplaints: string[];
  /** The unit's department — decides which sections exist. */
  specialty?: string;
  onClose: () => void;
}) {
  const complaintsRef = useRef<string[]>([...initialComplaints]);
  const sections: LiveSection[] = sectionsForSpecialty(specialty).map((key) => ({
    key,
    label: LABEL[key] ?? key,
    existing: initialText[key],
    held: HELD_SECTIONS.has(key),
    drug: key === "medication",
  }));

  async function route(text: string) {
    const r = await fetch(`/api/patients/${patientId}/case-history/route-dictation`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, knownComplaints: complaintsRef.current }),
    });
    const data = (await r.json()) as { segments?: RoutedSegment[]; error?: string };
    const segments = data.segments ?? [];
    for (const s of segments) {
      if (s.section === "complaints" && !complaintsRef.current.some((c) => c.toLowerCase() === s.text.toLowerCase())) {
        complaintsRef.current = [...complaintsRef.current, s.text];
      }
    }
    return {
      lines: segments.map((s) => ({ section: s.section, text: s.complaint ? `${s.complaint}: ${s.text}` : s.text })),
      error: data.error,
    };
  }

  return (
    <LiveDictation
      patientId={patientId}
      title="Dictating the clerking"
      example="e.g. “pain right iliac fossa two days… diabetic for ten years… abdomen soft, tender in the RIF…”"
      sections={sections}
      route={route}
      onClose={onClose}
    />
  );
}
