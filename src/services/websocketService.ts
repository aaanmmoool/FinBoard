type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error';

interface WebSocketCallbacks {
    onMessage: (data: unknown) => void;
    onStatusChange: (status: ConnectionStatus) => void;
    onError?: (error: Event) => void;
}

interface SocketConnection {
    socket: WebSocket;
    status: ConnectionStatus;
    reconnectAttempts: number;
}

const MAX_RECONNECT_ATTEMPTS = 5;
const RECONNECT_DELAY = 3000;

class WebSocketManager {
    private connections: Map<string, SocketConnection> = new Map();
    private callbacks: Map<string, WebSocketCallbacks> = new Map();

    connect(widgetId: string, url: string, callbacks: WebSocketCallbacks): void {
        this.disconnect(widgetId);

        this.callbacks.set(widgetId, callbacks);
        this.createConnection(widgetId, url, 0);
    }

    private createConnection(widgetId: string, url: string, attempts: number): void {
        const callbacks = this.callbacks.get(widgetId);
        if (!callbacks) return;

        callbacks.onStatusChange('connecting');

        try {
            const socket = new WebSocket(url);

            const connection: SocketConnection = {
                socket,
                status: 'connecting',
                reconnectAttempts: attempts,
            };

            this.connections.set(widgetId, connection);

            socket.onopen = () => {
                connection.status = 'connected';
                connection.reconnectAttempts = 0;
                callbacks.onStatusChange('connected');
            };

            socket.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    callbacks.onMessage(data);
                } catch {
                    callbacks.onMessage(event.data);
                }
            };

            socket.onerror = (error) => {
                connection.status = 'error';
                callbacks.onStatusChange('error');
                callbacks.onError?.(error);
            };

            socket.onclose = () => {
                connection.status = 'disconnected';
                callbacks.onStatusChange('disconnected');

                if (connection.reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
                    setTimeout(() => {
                        if (this.callbacks.has(widgetId)) {
                            this.createConnection(widgetId, url, connection.reconnectAttempts + 1);
                        }
                    }, RECONNECT_DELAY);
                }
            };
        } catch (error) {
            callbacks.onStatusChange('error');
            console.error('WebSocket connection error:', error);
        }
    }

    disconnect(widgetId: string): void {
        const connection = this.connections.get(widgetId);
        if (connection) {
            connection.socket.close();
            this.connections.delete(widgetId);
        }
        this.callbacks.delete(widgetId);
    }

    getStatus(widgetId: string): ConnectionStatus | null {
        const connection = this.connections.get(widgetId);
        return connection?.status ?? null;
    }

    send(widgetId: string, data: unknown): boolean {
        const connection = this.connections.get(widgetId);
        if (connection && connection.status === 'connected') {
            try {
                const message = typeof data === 'string' ? data : JSON.stringify(data);
                connection.socket.send(message);
                return true;
            } catch {
                return false;
            }
        }
        return false;
    }

    disconnectAll(): void {
        for (const widgetId of this.connections.keys()) {
            this.disconnect(widgetId);
        }
    }
}

export const websocketManager = new WebSocketManager();

export type { ConnectionStatus, WebSocketCallbacks };
