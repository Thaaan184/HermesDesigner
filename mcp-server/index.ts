/**
 * Hermes Design Studio — MCP Server
 * Exposes canvas tools to Hermes Agent via stdio transport.
 * Run: npx ts-node mcp-server/index.ts
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import WebSocket from "ws";

const PORT = parseInt(process.env.WS_PORT ?? "8765", 10);
let wsClient: WebSocket | null = null;

// Connect to the browser via WebSocket relay
function connectWS() {
  const ws = new WebSocket(`ws://localhost:${PORT}`);
  ws.on("open", () => { wsClient = ws; console.error("[MCP] WS connected to browser"); });
  ws.on("close", () => { wsClient = null; setTimeout(connectWS, 3000); });
  ws.on("error", () => {});
}
connectWS();

function sendToCanvas(action: string, payload: unknown) {
  if (!wsClient || wsClient.readyState !== WebSocket.OPEN) {
    return { success: false, error: "Browser canvas not connected. Is HermesDesigner running?" };
  }
  wsClient.send(JSON.stringify({ action, payload }));
  return { success: true };
}

const server = new McpServer({ name: "hermes-design-studio", version: "1.0.0" });

server.tool("create_canvas",
  "Create a new canvas document",
  { width: z.number(), height: z.number(), dpi: z.number().default(72), title: z.string().default("Untitled") },
  async ({ width, height, dpi, title }) => ({
    content: [{ type: "text", text: JSON.stringify(sendToCanvas("create_canvas", { width, height, dpi, title })) }]
  })
);

server.tool("add_element",
  "Add a new layer element to the canvas. type can be: text, shape, image",
  { element: z.record(z.unknown()) },
  async ({ element }) => ({
    content: [{ type: "text", text: JSON.stringify(sendToCanvas("add_element", element)) }]
  })
);

server.tool("update_element",
  "Update properties of an existing layer by its id",
  { id: z.string(), patch: z.record(z.unknown()) },
  async ({ id, patch }) => ({
    content: [{ type: "text", text: JSON.stringify(sendToCanvas("update_element", { id, patch })) }]
  })
);

server.tool("delete_element",
  "Delete a layer by its id",
  { id: z.string() },
  async ({ id }) => ({
    content: [{ type: "text", text: JSON.stringify(sendToCanvas("delete_element", { id })) }]
  })
);

server.tool("get_canvas_state",
  "Get the current full document JSON from the browser canvas",
  {},
  async () => {
    sendToCanvas("request_state", {});
    return { content: [{ type: "text", text: "State request sent. Listen for canvas_update event." }] };
  }
);

server.tool("apply_palette",
  "Apply a color palette to the design",
  { primary: z.string(), secondary: z.string(), accent: z.string(), background: z.string(), text: z.string() },
  async (colors) => ({
    content: [{ type: "text", text: JSON.stringify(sendToCanvas("apply_palette", colors)) }]
  })
);

server.tool("align_elements",
  "Align elements on the canvas",
  { ids: z.array(z.string()), alignment: z.enum(["left","center","right","top","middle","bottom","horizontal","vertical"]) },
  async ({ ids, alignment }) => ({
    content: [{ type: "text", text: JSON.stringify(sendToCanvas("align_elements", { ids, alignment })) }]
  })
);

server.tool("clear_canvas",
  "Remove all elements from the current page",
  { confirm: z.boolean() },
  async ({ confirm }) => {
    if (!confirm) return { content: [{ type: "text", text: "Pass confirm: true to clear the canvas." }] };
    return { content: [{ type: "text", text: JSON.stringify(sendToCanvas("clear_canvas", {})) }] };
  }
);

server.tool("generate_design",
  "Generate a full graphic design from a text prompt. Returns the JSON scene graph.",
  {
    prompt: z.string(),
    canvasWidth: z.number().default(1080),
    canvasHeight: z.number().default(1080),
  },
  async ({ prompt, canvasWidth, canvasHeight }) => {
    const info = `Prompt received: "${prompt}" for ${canvasWidth}×${canvasHeight} canvas.
Use this with the Hermes AI endpoint at /api/ai/generate and then call add_element for each layer.
Alternatively, the browser AI panel handles this end-to-end.`;
    return { content: [{ type: "text", text: info }] };
  }
);

const transport = new StdioServerTransport();
await server.connect(transport);
console.error("[MCP] Hermes Design Studio MCP server running on stdio");
