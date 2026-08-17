import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import RegisterSW from "./register-sw";
import ConnectionBar from "./connection-bar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CoreResident",
  description: "Ward rounds by voice.",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: "CoreResident", statusBarStyle: "black-translucent" },
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
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
