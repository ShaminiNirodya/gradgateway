import * as signalR from '@microsoft/signalr';
import { API_ENDPOINTS, API_URL } from '@/lib/config';
import { AuthService } from './auth.service';

const RETRY_MS_WHEN_API_DOWN = 15_000;
const RECONNECT_DELAYS = [0, 2000, 5000, 10000, 30000];

const globalForSignalR = globalThis as typeof globalThis & {
  __gradgatewaySignalRService?: SignalRService;
};

function getSignalRHubUrl(): string {
  if (typeof window === 'undefined') {
    return `${API_URL}/hubs/chat`;
  }

  // Local dev: proxy /hubs/* via next.config rewrites (same origin as :3000).
  if (window.location.hostname === 'localhost' && window.location.port === '3000') {
    return '/hubs/chat';
  }

  return `${API_URL}/hubs/chat`;
}

async function isApiReachable(): Promise<boolean> {
  try {
    const response = await fetch(API_ENDPOINTS.AUTH.HEALTH, {
      method: 'GET',
      cache: 'no-store',
    });
    return response.ok;
  } catch {
    return false;
  }
}

class SignalRService {
  private connection: signalR.HubConnection | null = null;
  private startPromise: Promise<void> | null = null;
  private retryTimer: ReturnType<typeof setTimeout> | null = null;
  private hasConnectedOnce = false;
  private intentionalStop = false;
  private messageCallbacks: ((message: unknown) => void)[] = [];
  private conversationCallbacks: ((data: unknown) => void)[] = [];
  private notificationCallbacks: ((notification: unknown) => void)[] = [];

  private async getAccessToken(): Promise<string> {
    const token = await AuthService.getIdToken();
    return token ?? '';
  }

  private buildConnection(): signalR.HubConnection {
    const builder = new signalR.HubConnectionBuilder()
      .withUrl(getSignalRHubUrl(), {
        accessTokenFactory: () => this.getAccessToken(),
        transport: signalR.HttpTransportType.WebSockets,
        skipNegotiation: false,
      })
      .configureLogging(signalR.LogLevel.None);

    if (this.hasConnectedOnce) {
      builder.withAutomaticReconnect(RECONNECT_DELAYS);
    }

    return builder.build();
  }

  private wireHandlers(connection: signalR.HubConnection) {
    connection.off('ReceiveMessage');
    connection.off('ConversationUpdated');
    connection.off('ReceiveNotification');

    connection.on('ReceiveMessage', (message) => {
      this.messageCallbacks.forEach((cb) => cb(message));
    });

    connection.on('ConversationUpdated', (data) => {
      this.conversationCallbacks.forEach((cb) => cb(data));
    });

    connection.on('ReceiveNotification', (notification) => {
      this.notificationCallbacks.forEach((cb) => cb(notification));
    });

    connection.onclose(() => {
      if (this.intentionalStop) {
        return;
      }

      if (this.connection === connection) {
        this.connection = null;
      }

      this.scheduleRetryWhenApiDown();
    });
  }

  private clearRetryTimer() {
    if (this.retryTimer) {
      clearTimeout(this.retryTimer);
      this.retryTimer = null;
    }
  }

  private scheduleRetryWhenApiDown() {
    if (this.retryTimer) return;

    this.retryTimer = setTimeout(() => {
      this.retryTimer = null;
      void this.start();
    }, RETRY_MS_WHEN_API_DOWN);
  }

  async start() {
    if (this.connection?.state === signalR.HubConnectionState.Connected) {
      return;
    }

    if (this.connection?.state === signalR.HubConnectionState.Connecting) {
      return this.startPromise ?? undefined;
    }

    if (this.startPromise) {
      return this.startPromise;
    }

    this.startPromise = this.connectInternal();
    try {
      await this.startPromise;
    } finally {
      this.startPromise = null;
    }
  }

  private async connectInternal() {
    const token = await this.getAccessToken();
    if (!token) {
      return;
    }

    if (!(await isApiReachable())) {
      this.scheduleRetryWhenApiDown();
      return;
    }

    this.clearRetryTimer();

    if (this.connection) {
      this.intentionalStop = true;
      try {
        await this.connection.stop();
      } catch {
        // Ignore stop errors while recycling the connection.
      } finally {
        this.intentionalStop = false;
      }
      this.connection = null;
    }

    const connection = this.buildConnection();
    this.wireHandlers(connection);
    this.connection = connection;

    try {
      await connection.start();
      this.hasConnectedOnce = true;
    } catch {
      this.connection = null;
      this.scheduleRetryWhenApiDown();
    }
  }

  async stop() {
    this.clearRetryTimer();
    this.startPromise = null;
    this.hasConnectedOnce = false;

    if (!this.connection) {
      return;
    }

    this.intentionalStop = true;
    try {
      await this.connection.stop();
    } catch {
      // Ignore disconnect errors during sign-out.
    } finally {
      this.intentionalStop = false;
      this.connection = null;
    }
  }

  onMessage(callback: (message: unknown) => void) {
    this.messageCallbacks.push(callback);
    return () => {
      this.messageCallbacks = this.messageCallbacks.filter((cb) => cb !== callback);
    };
  }

  onConversationUpdate(callback: (data: unknown) => void) {
    this.conversationCallbacks.push(callback);
    return () => {
      this.conversationCallbacks = this.conversationCallbacks.filter((cb) => cb !== callback);
    };
  }

  onNotification(callback: (notification: unknown) => void) {
    this.notificationCallbacks.push(callback);
    return () => {
      this.notificationCallbacks = this.notificationCallbacks.filter((cb) => cb !== callback);
    };
  }
}

function getSignalRService(): SignalRService {
  if (!globalForSignalR.__gradgatewaySignalRService) {
    globalForSignalR.__gradgatewaySignalRService = new SignalRService();
  }
  return globalForSignalR.__gradgatewaySignalRService;
}

export const signalRService = getSignalRService();
