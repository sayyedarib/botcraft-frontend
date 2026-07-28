import { useCallback, useEffect, useRef, useState } from "react";

import { resolveWebSocketUrl } from "@/lib/api/ws-url";

export interface Conversation {
    id: string
    text: string
    isUser: boolean
    timestamp: Date
}

export function useWebSocket({ path }: { path: string }) {
    const [conversation, setConversation] = useState<Conversation[]>([]);
    const [isConnected, setIsConnected] = useState(false);

    // The socket lives in a ref rather than state: handlers need the current
    // instance without re-running effects, and the unmount cleanup must close
    // the socket it actually opened.
    const socketRef = useRef<WebSocket | null>(null);

    const appendMessage = useCallback((text: string, isUser: boolean) => {
        // Functional update: two messages arriving before a re-render would
        // otherwise both spread the same stale array and the first would be lost.
        setConversation((previous) => [
            ...previous,
            { id: crypto.randomUUID(), text, isUser, timestamp: new Date() },
        ]);
    }, []);

    useEffect(() => {
        const socket = new WebSocket(resolveWebSocketUrl(path));
        socketRef.current = socket;

        // Only report connected once the handshake completes; setting it at
        // construction time claimed a connection that might never open.
        socket.onopen = () => setIsConnected(true);
        socket.onmessage = (event) => appendMessage(event.data, false);
        socket.onclose = () => setIsConnected(false);
        socket.onerror = () => setIsConnected(false);

        return () => {
            // Close this socket. The previous cleanup closed a `socket` state
            // value that was still null on the first render, so nothing was
            // ever closed and connections leaked on unmount.
            socket.onopen = null;
            socket.onmessage = null;
            socket.onclose = null;
            socket.onerror = null;
            socket.close();
            socketRef.current = null;
            setIsConnected(false);
        };
    }, [path, appendMessage]);

    const sendMessage = useCallback(
        (message: string) => {
            const socket = socketRef.current;
            if (!socket || socket.readyState !== WebSocket.OPEN) {
                console.error("Socket not connected");
                return false;
            }

            socket.send(message);
            appendMessage(message, true);
            return true;
        },
        [appendMessage]
    );

    const disconnect = useCallback(() => {
        socketRef.current?.close();
        setIsConnected(false);
    }, []);

    return { isConnected, disconnect, sendMessage, conversation };
}
