import { describe, expect, it } from "vitest";

import { resolveWebSocketUrl } from "./ws-url";

describe("resolveWebSocketUrl", () => {
  it("maps http to ws for local development", () => {
    expect(resolveWebSocketUrl("playground/chat", "http://localhost:8000/api/v1")).toBe(
      "ws://localhost:8000/api/v1/playground/chat"
    );
  });

  it("maps https to wss so TLS deployments are not blocked as mixed content", () => {
    expect(resolveWebSocketUrl("playground/chat", "https://api.botcraft.dev/api/v1")).toBe(
      "wss://api.botcraft.dev/api/v1/playground/chat"
    );
  });

  it("does not leave a bare ws:// on an https origin", () => {
    const url = resolveWebSocketUrl("playground/chat", "https://api.botcraft.dev/api/v1");
    expect(url.startsWith("ws://")).toBe(false);
  });

  it("tolerates a trailing slash on the base URL", () => {
    expect(resolveWebSocketUrl("playground/chat", "http://localhost:8000/api/v1/")).toBe(
      "ws://localhost:8000/api/v1/playground/chat"
    );
  });

  it("tolerates a leading slash on the path", () => {
    expect(resolveWebSocketUrl("/playground/chat", "http://localhost:8000/api/v1")).toBe(
      "ws://localhost:8000/api/v1/playground/chat"
    );
  });

  it("never produces a doubled slash", () => {
    const url = resolveWebSocketUrl("/playground/chat", "http://localhost:8000/api/v1/");
    expect(url).not.toMatch(/[^:]\/\//);
  });

  it("preserves the /api/v1 prefix rather than dropping it", () => {
    // The backend mounts the socket under the versioned prefix; dropping it
    // yields a 404 handshake.
    expect(resolveWebSocketUrl("playground/chat", "http://localhost:8000/api/v1")).toContain(
      "/api/v1/"
    );
  });
});
