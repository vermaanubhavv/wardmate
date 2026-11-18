import { IBM_Plex_Sans } from "next/font/google";

/**
 * The brand face for documents that leave the app on paper — the discharge summary, the case
 * history sheet, the handover and the progress note. Put `printFont.variable` and `brand-doc`
 * (globals.css) on the document itself, not the page, so the screen controls around it stay in
 * the system font. It applies on screen as well as in print: the case history sheet measures
 * itself on screen to fit one page, so what is measured has to be what prints.
 */
export const printFont = IBM_Plex_Sans({
  variable: "--font-print",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});
export const brandDoc = `${printFont.variable} brand-doc`;
