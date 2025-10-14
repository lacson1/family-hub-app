import { WebSocket, WebSocketServer } from 'ws';
import { Server as HTTPServer } from 'http';
import { IncomingMessage } from 'http';

type AuthenticatedWebSocket = WebSocket & {
  userId?: string;
  userName?: string;
  familyId?: string;
  isAlive?: boolean;
};

interface WebSocketMessage {
  type: string;
  payload?: any;
  userId?: string;
  userName?: string;
}

class WebSocketManager {
  private wss: WebSocketServer | null = null;
  private clients: Map<string, Set<AuthenticatedWebSocket>> = new Map();
  private heartbeatInterval: NodeJS.Timeout | null = null;

  initialize(server: HTTPServer): void {
    this.wss = new WebSocketServer({ server, path: '/ws' });

    this.wss.on('connection', (ws: AuthenticatedWebSocket, request: IncomingMessage) => {
      console.log('New WebSocket connection established');

      // Mark connection as alive
      ws.isAlive = true;

      // Handle authentication from query params or initial message
      const url = new URL(request.url || '', `http://${request.headers.host}`);
      const userId = url.searchParams.get('userId');
      const userName = url.searchParams.get('userName');

      if (userId) {
        ws.userId = userId;
        ws.userName = userName || 'Unknown';
        this.addClient(userId, ws);
        console.log(`User ${ws.userName} (${userId}) connected via WebSocket`);
      }

      // Heartbeat response
      ws.on('pong', () => {
        ws.isAlive = true;
      });

      // Handle incoming messages
      ws.on('message', (data: Buffer) => {
        try {
          const message: WebSocketMessage = JSON.parse(data.toString());
          this.handleMessage(ws, message);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      });

      // Handle connection close
      ws.on('close', () => {
        if (ws.userId) {
          this.removeClient(ws.userId, ws);
          console.log(`User ${ws.userName} (${ws.userId}) disconnected`);
        }
      });

      // Handle errors
      ws.on('error', (error: Error) => {
        console.error('WebSocket error:', error);
      });

      // Send welcome message
      this.sendToClient(ws, {
        type: 'connected',
        payload: { message: 'Connected to Family Hub real-time server' }
      });
    });

    // Start heartbeat check
    this.startHeartbeat();

    console.log('WebSocket server initialized on /ws');
  }

  private handleMessage(ws: AuthenticatedWebSocket, message: WebSocketMessage): void {
    switch (message.type) {
      case 'auth':
        // Handle authentication
        if (message.payload?.userId) {
          ws.userId = message.payload.userId;
          ws.userName = message.payload.userName || 'Unknown';
          if (ws.userId) {
            this.addClient(ws.userId, ws);
          }
          this.sendToClient(ws, {
            type: 'auth_success',
            payload: { userId: ws.userId, userName: ws.userName }
          });
        }
        break;

      case 'subscribe':
        // Handle channel subscription
        if (message.payload?.channel) {
          ws.familyId = message.payload.channel;
          console.log(`User ${ws.userName} subscribed to channel: ${ws.familyId}`);
        }
        break;

      case 'ping':
        // Respond to ping
        this.sendToClient(ws, { type: 'pong' });
        break;

      default:
        console.log('Unknown message type:', message.type);
    }
  }

  private addClient(userId: string, ws: AuthenticatedWebSocket): void {
    if (!this.clients.has(userId)) {
      this.clients.set(userId, new Set());
    }
    this.clients.get(userId)?.add(ws);
  }

  private removeClient(userId: string, ws: AuthenticatedWebSocket): void {
    const userClients = this.clients.get(userId);
    if (userClients) {
      userClients.delete(ws);
      if (userClients.size === 0) {
        this.clients.delete(userId);
      }
    }
  }

  private sendToClient(ws: AuthenticatedWebSocket, message: WebSocketMessage): void {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    }
  }

  // Broadcast to all connected clients
  broadcastToAll(message: WebSocketMessage): void {
    this.clients.forEach((userClients) => {
      userClients.forEach((ws) => {
        this.sendToClient(ws, message);
      });
    });
  }

  // Broadcast to specific user (all their devices)
  broadcastToUser(userId: string, message: WebSocketMessage): void {
    const userClients = this.clients.get(userId);
    if (userClients) {
      userClients.forEach((ws) => {
        this.sendToClient(ws, message);
      });
    }
  }

  // Broadcast to all except sender
  broadcastToOthers(senderUserId: string, message: WebSocketMessage): void {
    this.clients.forEach((userClients, userId) => {
      if (userId !== senderUserId) {
        userClients.forEach((ws) => {
          this.sendToClient(ws, message);
        });
      }
    });
  }

  // Broadcast specific event types
  broadcastTaskUpdate(task: any, action: 'created' | 'updated' | 'deleted', userId?: string): void {
    const message: WebSocketMessage = {
      type: 'task_update',
      payload: { task, action },
      userId
    };

    if (userId) {
      this.broadcastToOthers(userId, message);
    } else {
      this.broadcastToAll(message);
    }
  }

  broadcastEventUpdate(event: any, action: 'created' | 'updated' | 'deleted', userId?: string): void {
    const message: WebSocketMessage = {
      type: 'event_update',
      payload: { event, action },
      userId
    };

    if (userId) {
      this.broadcastToOthers(userId, message);
    } else {
      this.broadcastToAll(message);
    }
  }

  broadcastShoppingUpdate(item: any, action: 'created' | 'updated' | 'deleted', userId?: string): void {
    const message: WebSocketMessage = {
      type: 'shopping_update',
      payload: { item, action },
      userId
    };

    if (userId) {
      this.broadcastToOthers(userId, message);
    } else {
      this.broadcastToAll(message);
    }
  }

  broadcastMealUpdate(meal: any, action: 'created' | 'updated' | 'deleted', userId?: string): void {
    const message: WebSocketMessage = {
      type: 'meal_update',
      payload: { meal, action },
      userId
    };

    if (userId) {
      this.broadcastToOthers(userId, message);
    } else {
      this.broadcastToAll(message);
    }
  }

  broadcastMessageNotification(message: any, recipientId: string): void {
    this.broadcastToUser(recipientId, {
      type: 'new_message',
      payload: { message }
    });
  }

  broadcastActivityLog(activity: any): void {
    this.broadcastToAll({
      type: 'activity_log',
      payload: { activity }
    });
  }

  // Heartbeat to detect dead connections
  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      this.clients.forEach((userClients) => {
        userClients.forEach((ws) => {
          if (ws.isAlive === false) {
            console.log(`Terminating dead connection for user ${ws.userName}`);
            ws.terminate();
            return;
          }

          ws.isAlive = false;
          ws.ping();
        });
      });
    }, 30000); // Check every 30 seconds
  }

  // Get connection stats
  getStats(): { totalConnections: number; uniqueUsers: number } {
    let totalConnections = 0;
    this.clients.forEach((userClients) => {
      totalConnections += userClients.size;
    });

    return {
      totalConnections,
      uniqueUsers: this.clients.size
    };
  }

  // Cleanup
  close(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }

    if (this.wss) {
      this.wss.close();
    }

    this.clients.clear();
    console.log('WebSocket server closed');
  }
}

// Export singleton instance
export const wsManager = new WebSocketManager();

