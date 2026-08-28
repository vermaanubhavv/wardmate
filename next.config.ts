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
  },
};

export default nextConfig;
