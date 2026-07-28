import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  // Resolves the "@/..." aliases declared in tsconfig.json.
  plugins: [tsconfigPaths()],
  // Bind by IP rather than the "localhost" hostname, which not every machine
  // resolves. Harmless in CI, and avoids an ENOTFOUND at startup locally.
  server: { host: "127.0.0.1" },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
    api: false,
  },
});
