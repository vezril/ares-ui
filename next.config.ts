import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Don't auto-generate AGENTS.md/CLAUDE.md — this repo's agent context lives in
  // its README and the codex design doc, not Next's scaffolding.
  agentRules: false,
  // Self-contained server bundle for a small production Docker image. The
  // standalone server also hosts the Node-runtime BFF routes (/api/ares/*),
  // which read the Ares service's survey stream + /health server-side. The
  // browser never talks to a backend directly.
  output: "standalone",
};

export default nextConfig;
