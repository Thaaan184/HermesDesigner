/**
 * WebSocket relay server — bridges MCP server ↔ browser
 * Run: node ws-relay/server.mjs
 */
import { WebSocketServer } from "ws";

const PORT = parseInt(process.env.WS_PORT ?? "8765", 10);
const wss = new WebSocketServer({ port: PORT });
const clients = new Set();

wss.on("connection", (ws) => {
  clients.add(ws);
  console.log(`[WS] Client connected. Total: ${clients.size}`);
  ws.on("close", () => { clients.delete(ws); });
  ws.on("message", (data) => {
    // Broadcast to all OTHER clients (MCP <-> browser relay)
    for (const client of clients) {
      if (client !== ws && client.readyState === 1) {
        client.send(data.toString());
      }
    }
  });
});

console.log(`[WS] Relay server listening on ws://localhost:${PORT}`);
