/**
 * Derive the playground WebSocket URL from the HTTP API base URL.
 *
 * Extracted from `use-websocket` so the scheme upgrade can be tested directly —
 * getting this wrong only shows up in a TLS deployment, where a `ws://` URL on
 * an `https://` page is blocked as mixed content.
 */
export function resolveWebSocketUrl(path: string, apiUrl?: string): string {
  const base = apiUrl ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";

  const wsBase = base
    .replace(/^https:/, "wss:")
    .replace(/^http:/, "ws:")
    .replace(/\/+$/, "");

  const suffix = path.replace(/^\/+/, "");

  return `${wsBase}/${suffix}`;
}
