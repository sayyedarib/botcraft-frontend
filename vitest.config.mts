import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  // Resolves the "@/..." aliases declared in tsconfig.json.
  plugins: [tsconfigPaths()],
  // Bind by IP rather than the "localhost" hostname, which not every machine
  // resolves. Harmless in CI, and avoids an ENOTFOUND at startup locally.
  server: { host: "127.0.0.1" },
  test: {
    // happy-dom for hook tests. jsdom pulls a CSS stack that fails to load
    // under the forks pool on Node 20 (ERR_REQUIRE_ESM).
    environment: "happy-dom",
    include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
    api: false,
  },
});
