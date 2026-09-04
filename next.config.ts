import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Formats and letterheads arrive as photographs of paper, and a phone photograph is
    // routinely two to four megabytes. Next caps a Server Action body at 1 MB by default,
    // which uploadFormat contradicts by accepting up to 10 MB: the file passed the app's own
    // check, then the framework refused the request before any of that code ran, and the
    // resident got an unexplained black "server error" page. Raised to match the limit the
    // app states. The 10 MB check in app/formats/actions.ts is still the one that reports a
    // too-large file in words.
    serverActions: { bodySizeLimit: "10mb" },

    // Keep already-fetched pages in the client cache for a short window so tapping "Ward"
    // and then "back" into a patient — or moving between patients — reuses what was just
    // shown instead of re-rendering the whole screen from the database. Next 15 changed
    // this default to 0 (every navigation refetches); on a ward round over hospital wifi
    // that reads as a lag on every tap. 20s is short enough that a value someone else just
    // wrote still shows up on the next real visit, and any write from THIS device
    // revalidates its own paths immediately regardless.
    staleTimes: { dynamic: 20, static: 180 },
  },
};

export default nextConfig;
