type QuantumMessageType = 'public-key' | 'ciphertext' | 'message';

interface QuantumSocketMessage {
  type: QuantumMessageType;
  payload: string;
}

function getWsUrl(): string {
  const configured = import.meta.env.VITE_WS_URL as string | undefined;
  if (configured) return configured;
  const backendUrl = import.meta.env.VITE_BACKEND_URL as string | undefined;
  if (backendUrl) {
    return backendUrl.replace(/^http/, 'ws').replace('/api/v1', '/ws/demo');
  }
  return 'ws://localhost:5000/ws/demo';
}

export class QuantumSocket {
  private ws: WebSocket | null = null;
  private room: string;
  private senderId: string;
  private onMessage: (msg: QuantumSocketMessage) => void;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private closed = false;

  constructor(room: string, onMessage: (msg: QuantumSocketMessage) => void) {
    this.room = room;
    this.senderId = generateRoomId();
    this.onMessage = onMessage;
    this.connect();
  }

  private connect() {
    if (this.closed || typeof window === 'undefined') return;
    try {
      this.ws = new WebSocket(getWsUrl());
      this.ws.onopen = () => {
        this.ws?.send(JSON.stringify({ type: 'subscribe', channel: this.room }));
      };
      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.channel === this.room && data.type && data.payload !== undefined) {
            if (data.senderId === this.senderId) return;
            this.onMessage({ type: data.type, payload: data.payload });
          }
        } catch {
          // ignore malformed messages
        }
      };
      this.ws.onclose = () => {
        this.scheduleReconnect();
      };
      this.ws.onerror = () => {
        this.ws?.close();
      };
    } catch {
      this.scheduleReconnect();
    }
  }

  private scheduleReconnect() {
    if (this.closed || this.reconnectTimer) return;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connect();
    }, 2000);
  }

  publish(type: QuantumMessageType, payload: string) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: 'publish', channel: this.room, payload: { type, payload, senderId: this.senderId } }));
    }
  }

  close() {
    this.closed = true;
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.ws?.close();
    this.ws = null;
  }
}

export function generateRoomId(): string {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

export default QuantumSocket;
