import type { Metadata, Viewport } from "next";
import { Geist_Mono } from "next/font/google";
import "./globals.css";
import RegisterSW from "./register-sw";
import ConnectionBar from "./connection-bar";
import PageView from "./page-view";
import EarlyTapsReplay from "./early-taps";
import { EARLY_TAPS_SCRIPT } from "./early-taps-script";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "WardMate",
  description: "Your Residency Companion",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: "WardMate", statusBarStyle: "default" },
  icons: { icon: "/icon-192.png", apple: "/apple-touch-icon.png" },
};

export const viewport: Viewport = {
  themeColor: "#f2f2f7",
  // Pinch-zoom stays on (WCAG 1.4.4); accidental double-tap zoom is stopped per button with
  // `touch-action: manipulation` in globals.css instead of by locking the whole page.
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  // Stamped at render, so a screen served from the offline cache can say when it was fetched
  // rather than pretending to be current. This is the whole reason caching pages is safe.
  const renderedAt = new Date().toISOString();

  return (
    <html lang="en" className={`${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        {/* First thing parsed: holds a tap made before the app's JavaScript is running. */}
        <script dangerouslySetInnerHTML={{ __html: EARLY_TAPS_SCRIPT }} />
        {/* Above everything: with no signal the ward still appears, and the one thing that
            must not happen is a resident trusting it as live. */}
        <ConnectionBar renderedAt={renderedAt} />
        {children}
        <PageView />
        <EarlyTapsReplay />
        <RegisterSW />
      </body>
    </html>
  );
}
