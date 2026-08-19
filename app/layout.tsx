import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { Geist_Mono } from "next/font/google";
import "./globals.css";
import RegisterSW from "./register-sw";
import ConnectionBar from "./connection-bar";

/**
 * The brand typeface, replacing the system font (SF Pro on an iPhone) everywhere.
 *
 * That is a real trade made on purpose, not an oversight: the system font cost nothing to
 * load and felt native next to Settings and Health. Sora is self-hosted through next/font
 * specifically to keep as much of that as possible — it is subset to only the characters the
 * app uses, served from this domain rather than Google's, cached by the service worker like
 * any other static asset, and painted with `font-display: swap` so the page is never blank
 * waiting for it. The cost is paid once, on the first visit, not on every screen after.
 *
 * One variable file rather than eight static weights: Sora ships 100–800 in a single
 * variable-width TTF, and next/font/local reads the weight range directly out of it.
 */
const sora = localFont({
  src: "./fonts/Sora-VariableFont.ttf",
  variable: "--font-sora",
  weight: "100 800",
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "WardMate",
  description: "Ward rounds by voice.",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: "WardMate", statusBarStyle: "black-translucent" },
  icons: { icon: "/icon-192.png", apple: "/apple-touch-icon.png" },
};

export const viewport: Viewport = {
  themeColor: "#f2f2f7",
  // The app is a one-handed phone tool; letting it zoom on a double-tap loses the round.
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  // Stamped at render, so a screen served from the offline cache can say when it was fetched
  // rather than pretending to be current. This is the whole reason caching pages is safe.
  const renderedAt = new Date().toISOString();

  return (
    <html
      lang="en"
      className={`${sora.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {/* Above everything: with no signal the ward still appears, and the one thing that
            must not happen is a resident trusting it as live. */}
        <ConnectionBar renderedAt={renderedAt} />
        {children}
        <RegisterSW />
      </body>
    </html>
  );
}
