export type MCPMessage =
  | { type: 'canvas_update'; payload: unknown }
  | { type: 'ai_response'; payload: string }
  | { type: 'error'; payload: string }
  | { type: 'ping' };

type MessageHandler = (msg: MCPMessage) => void;

class MCPClient {
  private ws: WebSocket | null = null;
  private handlers: MessageHandler[] = [];
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  public connected = false;

  connect(url = 'ws://localhost:8765') {
    try {
      this.ws = new WebSocket(url);
      this.ws.onopen = () => { this.connected = true; console.log('[MCP] Connected'); };
      this.ws.onclose = () => { this.connected = false; this.scheduleReconnect(url); };
      this.ws.onerror = () => { this.connected = false; };
      this.ws.onmessage = (e) => {
        try {
          const msg: MCPMessage = JSON.parse(e.data);
          this.handlers.forEach(h => h(msg));
        } catch {}
      };
    } catch {}
  }

  private scheduleReconnect(url: string) {
    if (this.reconnectTimer) return;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connect(url);
    }, 3000);
  }

  send(action: string, payload: unknown) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ action, payload }));
    }
  }

  onMessage(handler: MessageHandler) { this.handlers.push(handler); }
  disconnect() { this.ws?.close(); }
}

export const mcpClient = new MCPClient();
