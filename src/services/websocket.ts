const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:3001/ws';

type MessageHandler = (data: unknown) => void;

interface WebSocketMessage {
    type: string;
    payload?: unknown;
    userId?: string;
    userName?: string;
}

class WebSocketClient {
    private ws: WebSocket | null = null;
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 10;
    private reconnectDelay = 1000; // Start with 1 second
    private maxReconnectDelay = 30000; // Max 30 seconds
    private messageHandlers: Map<string, Set<MessageHandler>> = new Map();
    private userId: string | null = null;
    private userName: string | null = null;
    private isConnecting = false;
    private pingInterval: number | null = null;

    connect(userId: string, userName: string): void {
        if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
            console.log('WebSocket already connected or connecting');
            return;
        }

        if (this.isConnecting) {
            console.log('Already attempting to connect');
            return;
        }

        this.userId = userId;
        this.userName = userName;
        this.isConnecting = true;

        try {
            const url = `${WS_URL}?userId=${encodeURIComponent(userId)}&userName=${encodeURIComponent(userName)}`;
            this.ws = new WebSocket(url);

            this.ws.onopen = () => {
                console.log('✅ WebSocket connected');
                this.isConnecting = false;
                this.reconnectAttempts = 0;
                this.reconnectDelay = 1000;

                // Start ping to keep connection alive
                this.startPing();
            };

            this.ws.onmessage = (event) => {
                try {
                    const message: WebSocketMessage = JSON.parse(event.data);
                    this.handleMessage(message);
                } catch (error) {
                    console.error('Error parsing WebSocket message:', error);
                }
            };

            this.ws.onerror = (error) => {
                console.error('WebSocket error:', error);
                this.isConnecting = false;
            };

            this.ws.onclose = () => {
                console.log('WebSocket disconnected');
                this.isConnecting = false;
                this.stopPing();
                this.attemptReconnect();
            };
        } catch (error) {
            console.error('Error creating WebSocket:', error);
            this.isConnecting = false;
            this.attemptReconnect();
        }
    }

    disconnect(): void {
        this.stopPing();

        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }

        this.reconnectAttempts = this.maxReconnectAttempts; // Prevent auto-reconnect
        this.isConnecting = false;
    }

    private attemptReconnect(): void {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.error('Max reconnection attempts reached');
            return;
        }

        this.reconnectAttempts++;

        // Exponential backoff
        const delay = Math.min(
            this.reconnectDelay * Math.pow(1.5, this.reconnectAttempts - 1),
            this.maxReconnectDelay
        );

        console.log(`Attempting to reconnect in ${Math.round(delay / 1000)}s (attempt ${this.reconnectAttempts})`);

        setTimeout(() => {
            if (this.userId && this.userName) {
                this.connect(this.userId, this.userName);
            }
        }, delay);
    }

    private startPing(): void {
        this.stopPing();

        // Send ping every 25 seconds
        this.pingInterval = window.setInterval(() => {
            this.send({ type: 'ping' });
        }, 25000);
    }

    private stopPing(): void {
        if (this.pingInterval !== null) {
            clearInterval(this.pingInterval);
            this.pingInterval = null;
        }
    }

    send(message: WebSocketMessage): void {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(message));
        } else {
            console.warn('WebSocket not connected, message not sent:', message);
        }
    }

    subscribe(eventType: string, handler: MessageHandler): () => void {
        if (!this.messageHandlers.has(eventType)) {
            this.messageHandlers.set(eventType, new Set());
        }

        this.messageHandlers.get(eventType)!.add(handler);

        // Return unsubscribe function
        return () => {
            const handlers = this.messageHandlers.get(eventType);
            if (handlers) {
                handlers.delete(handler);
            }
        };
    }

    private handleMessage(message: WebSocketMessage): void {
        const handlers = this.messageHandlers.get(message.type);

        if (handlers && handlers.size > 0) {
            handlers.forEach(handler => handler(message.payload));
        }

        // Also call wildcard handlers
        const wildcardHandlers = this.messageHandlers.get('*');
        if (wildcardHandlers && wildcardHandlers.size > 0) {
            wildcardHandlers.forEach(handler => handler(message));
        }
    }

    isConnected(): boolean {
        return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
    }

    getConnectionState(): string {
        if (!this.ws) return 'CLOSED';

        switch (this.ws.readyState) {
            case WebSocket.CONNECTING: return 'CONNECTING';
            case WebSocket.OPEN: return 'OPEN';
            case WebSocket.CLOSING: return 'CLOSING';
            case WebSocket.CLOSED: return 'CLOSED';
            default: return 'UNKNOWN';
        }
    }
}

// Export singleton instance
export const wsClient = new WebSocketClient();

// Convenience hooks for React components
export const useWebSocketSubscription = (
    eventType: string,
    handler: MessageHandler
): void => {
    React.useEffect(() => {
        const unsubscribe = wsClient.subscribe(eventType, handler);
        return unsubscribe;
    }, [eventType, handler]);
};

// Note: Import React at the top when using the hook
import React from 'react';

