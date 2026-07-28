import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useWebSocket } from "./use-websocket";

/** Minimal WebSocket double that lets tests drive the lifecycle. */
class MockWebSocket {
  static instances: MockWebSocket[] = [];

  static readonly CONNECTING = 0;
  static readonly OPEN = 1;
  static readonly CLOSING = 2;
  static readonly CLOSED = 3;

  url: string;
  readyState = MockWebSocket.CONNECTING;
  sent: string[] = [];
  closeCalls = 0;

  onopen: (() => void) | null = null;
  onmessage: ((event: { data: string }) => void) | null = null;
  onclose: (() => void) | null = null;
  onerror: (() => void) | null = null;

  constructor(url: string) {
    this.url = url;
    MockWebSocket.instances.push(this);
  }

  open() {
    this.readyState = MockWebSocket.OPEN;
    this.onopen?.();
  }

  receive(data: string) {
    this.onmessage?.({ data });
  }

  send(message: string) {
    this.sent.push(message);
  }

  close() {
    this.closeCalls += 1;
    this.readyState = MockWebSocket.CLOSED;
  }
}

beforeEach(() => {
  MockWebSocket.instances = [];
  vi.stubGlobal("WebSocket", MockWebSocket);
  if (!globalThis.crypto?.randomUUID) {
    vi.stubGlobal("crypto", { randomUUID: () => Math.random().toString(36) });
  }
});

afterEach(() => {
  vi.unstubAllGlobals();
});

const latest = () => MockWebSocket.instances[MockWebSocket.instances.length - 1];

describe("useWebSocket", () => {
  it("connects to the derived URL", () => {
    renderHook(() => useWebSocket({ path: "playground/chat" }));
    expect(latest().url).toContain("/playground/chat");
  });

  it("reports connected only once the socket opens", async () => {
    const { result } = renderHook(() => useWebSocket({ path: "playground/chat" }));

    // Constructing a socket is not the same as having a connection.
    expect(result.current.isConnected).toBe(false);

    act(() => latest().open());
    await waitFor(() => expect(result.current.isConnected).toBe(true));
  });

  it("appends incoming messages", async () => {
    const { result } = renderHook(() => useWebSocket({ path: "playground/chat" }));
    act(() => latest().open());

    act(() => latest().receive("hello from the bot"));

    await waitFor(() => expect(result.current.conversation).toHaveLength(1));
    expect(result.current.conversation[0]).toMatchObject({
      text: "hello from the bot",
      isUser: false,
    });
  });

  it("keeps every message when several arrive before a re-render", async () => {
    // The previous implementation spread a captured `conversation`, so rapid
    // messages overwrote each other and all but the last were lost.
    const { result } = renderHook(() => useWebSocket({ path: "playground/chat" }));
    act(() => latest().open());

    act(() => {
      latest().receive("first");
      latest().receive("second");
      latest().receive("third");
    });

    await waitFor(() => expect(result.current.conversation).toHaveLength(3));
    expect(result.current.conversation.map((m) => m.text)).toEqual([
      "first",
      "second",
      "third",
    ]);
  });

  it("sends and records the user's own message", async () => {
    const { result } = renderHook(() => useWebSocket({ path: "playground/chat" }));
    act(() => latest().open());

    act(() => {
      result.current.sendMessage("what are your hours?");
    });

    expect(latest().sent).toEqual(["what are your hours?"]);
    await waitFor(() => expect(result.current.conversation).toHaveLength(1));
    expect(result.current.conversation[0].isUser).toBe(true);
  });

  it("refuses to send before the socket is open", () => {
    const { result } = renderHook(() => useWebSocket({ path: "playground/chat" }));

    let sent: boolean | undefined;
    act(() => {
      sent = result.current.sendMessage("too early");
    });

    expect(sent).toBe(false);
    expect(latest().sent).toEqual([]);
  });

  it("closes the socket on unmount", () => {
    // The old cleanup closed a state value that was still null on first
    // render, so sockets leaked on every unmount.
    const { unmount } = renderHook(() => useWebSocket({ path: "playground/chat" }));
    const socket = latest();
    act(() => socket.open());

    unmount();

    expect(socket.closeCalls).toBe(1);
  });

  it("marks disconnected when the server closes the socket", async () => {
    const { result } = renderHook(() => useWebSocket({ path: "playground/chat" }));
    act(() => latest().open());
    await waitFor(() => expect(result.current.isConnected).toBe(true));

    act(() => latest().onclose?.());

    await waitFor(() => expect(result.current.isConnected).toBe(false));
  });

  it("does not open a second socket on re-render", () => {
    const { rerender } = renderHook(() => useWebSocket({ path: "playground/chat" }));
    rerender();
    rerender();

    expect(MockWebSocket.instances).toHaveLength(1);
  });
});
