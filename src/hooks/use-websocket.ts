import { useEffect, useState, useCallback } from "react";

interface Conversation {
    id: string
    text: string
    isUser: boolean
    timestamp: Date
}

export function useWebSocket({path}: {path: string}) {
    const [conversation, setConversation] = useState<Conversation[]>([]);
    const [isConnected, setIsConnected] = useState(false);
    const [socket, setSocket] = useState<WebSocket | null>(null);

    const connect = useCallback(() => {
        setIsConnected(true);
        // Derive the ws:// base from the HTTP API URL (which already includes
        // the /api/v1 prefix) so this works in deployment — https:// becomes
        // wss:// automatically.
        const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";
        const wsBase = apiUrl.replace(/^http/, "ws").replace(/\/$/, "");
        return new WebSocket(`${wsBase}/${path}`)
    }, [path]);


    const disconnect = useCallback((socket: WebSocket) => {
        socket.close();
        setIsConnected(false);
    }, []);

    const sendMessage = useCallback((message: string) => {
        const newMessage: Conversation = {id: crypto.randomUUID(), text: message, isUser: true, timestamp: new Date()};

        if (socket) {
            setConversation([...conversation, newMessage]);
            socket.send(message);
        } else {
            console.error("Socket not connected");
        }
    }, [socket, conversation]);

    useEffect(() => {
        const connection = connect();
        setSocket(connection);

        return () => socket?.close();
    }, []);

    useEffect(() => {

        if(!socket) {
            return;
        }

        socket.onmessage = async (event) => {
            const newMessage: Conversation = {id: crypto.randomUUID(), text: event.data, isUser: false, timestamp: new Date()};
            setConversation([...conversation, newMessage]);
        }
        socket.onclose = (event) => {
            setIsConnected(false);
            console.log("close", event);
        }
        socket.onerror = (event) => {
            console.log("error", event);
        }
    }, [conversation]);

    return { isConnected, disconnect, sendMessage, conversation };
}