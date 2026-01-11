/**
 * WebSocket Service
 * Handles real-time connection to the backend.
 */
type MessageHandler = (data: any) => void;

class WebSocketService {
  private ws: WebSocket | null = null;
  private url: string;
  private reconnectInterval: number = 3000;
  private handlers: Map<string, MessageHandler[]> = new Map();
  private isConnected: boolean = false;

  constructor() {
    // Determine WS URL based on API URL or default
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    const wsUrl = apiUrl.replace(/^http/, 'ws') + '/ws';
    this.url = wsUrl;
  }

  connect() {
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      return;
    }

    console.log('Connecting to WebSocket:', this.url);
    this.ws = new WebSocket(this.url);

    this.ws.onopen = () => {
      console.log('WebSocket Connected');
      this.isConnected = true;
      this.emit('connection', { status: 'connected' });
    };

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        // Handle specific message types
        if (data.type) {
          this.emit(data.type, data);
        }
        // Emit generic 'message' event
        this.emit('message', data);
      } catch (e) {
        console.error('Failed to parse WebSocket message:', e);
      }
    };

    this.ws.onclose = () => {
      console.log('WebSocket Disconnected. Reconnecting in', this.reconnectInterval, 'ms...');
      this.isConnected = false;
      this.emit('connection', { status: 'disconnected' });
      this.ws = null;
      setTimeout(() => this.connect(), this.reconnectInterval);
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket Error:', error);
      this.ws?.close();
    };
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  send(data: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    } else {
      console.warn('WebSocket not connected, cannot send message');
    }
  }

  // Event Subscription
  on(event: string, handler: MessageHandler) {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, []);
    }
    this.handlers.get(event)?.push(handler);
    
    // Return unsubscribe function
    return () => this.off(event, handler);
  }

  off(event: string, handler: MessageHandler) {
    if (this.handlers.has(event)) {
      const currentHandlers = this.handlers.get(event) || [];
      this.handlers.set(event, currentHandlers.filter(h => h !== handler));
    }
  }

  private emit(event: string, data: any) {
    const eventHandlers = this.handlers.get(event);
    if (eventHandlers) {
      eventHandlers.forEach(handler => handler(data));
    }
  }
}

export const websocketService = new WebSocketService();
export default websocketService;
