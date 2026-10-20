import type { NextConfig } from "next";
import { PHASE_DEVELOPMENT_SERVER } from "next/constants";

// Static export: no serverless functions, no image optimizer (Talkerstein Vercel cost SOP).
const base: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  poweredByHeader: false,
};

// `next dev` keeps its cache in .next-dev, so a `next build` (which owns .next and out/) can run
// at the same time without corrupting the dev server.
export default function config(phase: string): NextConfig {
  return { ...base, distDir: phase === PHASE_DEVELOPMENT_SERVER ? ".next-dev" : ".next" };
}
