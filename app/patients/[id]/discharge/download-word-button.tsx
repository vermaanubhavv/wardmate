"use client";

/** A plain link to the .docx route does the whole job — the browser handles the download from
 *  the Content-Disposition header, no client-side blob juggling needed. */
export default function DownloadWordButton({ patientId }: { patientId: string }) {
  return (
    <a
      href={`/api/patients/${patientId}/discharge-docx`}
      className="w-full rounded-xl bg-card px-4 py-3 text-center text-[17px] font-semibold text-accent active:opacity-70 print:hidden"
    >
      Download as Word
    </a>
  );
}
