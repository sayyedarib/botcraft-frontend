import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Emits a self-contained server bundle with only the traced dependencies,
  // which keeps the Docker runtime image small (no full node_modules copy).
  output: "standalone",

  // Fail the production build on type errors rather than shipping them.
  typescript: { ignoreBuildErrors: false },
  eslint: { ignoreDuringBuilds: false },
};

export default nextConfig;
