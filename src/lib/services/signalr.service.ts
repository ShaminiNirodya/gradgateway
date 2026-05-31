import * as signalR from '@microsoft/signalr';
import { AuthService } from './auth.service';

class SignalRService {
  private connection: signalR.HubConnection | null = null;
  private messageCallbacks: ((message: any) => void)[] = [];
  private conversationCallbacks: ((data: any) => void)[] = [];

  async start() {
    if (this.connection?.state === signalR.HubConnectionState.Connected) {
      return;
    }

    try {
      const token = await AuthService.getIdToken();
      if (!token) {
        console.warn('[SignalR] No auth token, skipping connection');
        return;
      }

      this.connection = new signalR.HubConnectionBuilder()
        .withUrl('http://localhost:5160/hubs/chat', {
          accessTokenFactory: () => token,
        })
        .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
        .configureLogging(signalR.LogLevel.None) // Completely suppress all SignalR logs
        .build();

      this.connection.on('ReceiveMessage', (message) => {
        console.log('[SignalR] Received message:', message);
        this.messageCallbacks.forEach((cb) => cb(message));
      });

      this.connection.on('ConversationUpdated', (data) => {
        console.log('[SignalR] Conversation updated:', data);
        this.conversationCallbacks.forEach((cb) => cb(data));
      });

      this.connection.onclose(() => {
        console.log('[SignalR] Connection closed');
      });

      await this.connection.start();
      console.log('[SignalR] Connected successfully');
    } catch (error) {
      // Silently fail - real-time features will be disabled but app continues working
      console.warn('[SignalR] Real-time messaging unavailable. Chat will work in polling mode.');
    }
  }

  async stop() {
    if (this.connection) {
      await this.connection.stop();
      console.log('[SignalR] Disconnected');
    }
  }

  onMessage(callback: (message: any) => void) {
    this.messageCallbacks.push(callback);
    return () => {
      this.messageCallbacks = this.messageCallbacks.filter((cb) => cb !== callback);
    };
  }

  onConversationUpdate(callback: (data: any) => void) {
    this.conversationCallbacks.push(callback);
    return () => {
      this.conversationCallbacks = this.conversationCallbacks.filter((cb) => cb !== callback);
    };
  }
}

export const signalRService = new SignalRService();
