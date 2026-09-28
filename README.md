# HermesDesigner

> AI-powered web graphic design studio. Hermes AI generates editable parametric designs (not flat images). Every element stays fully interactive.

![HermesDesigner](https://img.shields.io/badge/status-active-brightgreen) ![License](https://img.shields.io/badge/license-MIT-blue)

---

## What Makes This Different

| Traditional AI Image Gen | HermesDesigner |
|---|---|
| Outputs flat raster PNG | Outputs editable JSON scene graph |
| Text often hallucinated/broken | Text rendered by browser fonts (pixel-perfect) |
| Cannot edit elements after generation | Every element: click, drag, resize, recolor |
| Requires GPU server for generation | Server only sends/receives text JSON (ultra-lightweight) |

---

## Architecture

```
User prompt (Discord/Web)
        │
        ▼
Hermes Agent (LLM Reasoning)
  - Applies design rules (60-30-10, golden ratio, typography)
  - Outputs structured JSON scene graph
        │ WebSocket / MCP Tools
        ▼
Browser Canvas (Konva.js + React)
  - Renders each layer as interactive Konva node
  - User can click, drag, resize, edit text inline
  - Export to PNG / SVG / PDF
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend Framework | React 19 + Vite + TypeScript |
| Styling | Tailwind CSS v4 (dark theme) |
| 2D Canvas Engine | Konva.js + react-konva |
| State & History | Zustand + Immer (50-step undo/redo) |
| Local Persistence | Dexie.js (IndexedDB) |
| AI Schema Validation | Zod |
| AI Integration | MCP (Model Context Protocol) via WebSocket relay |
| Icons | Lucide React |

---

## Prerequisites

- Node.js >= 18
- npm >= 9

---

## Installation & Setup

### 1. Clone the repository
```bash
git clone https://github.com/Thaaan184/HermesDesigner.git
cd HermesDesigner
```

### 2. Install frontend dependencies
```bash
npm install
```

### 3. Install MCP server dependencies
```bash
cd mcp-server && npm install && cd ..
```

---

## Running the Application

### Option A: Frontend only (no AI tools via MCP)
```bash
npm run dev
```
Open http://localhost:5173 in your browser.
The in-browser AI panel still works if you configure an API endpoint.

### Option B: Full stack with Hermes AI (MCP + WebSocket)

**Terminal 1 — Start the WebSocket relay:**
```bash
node ws-relay/server.mjs
```

**Terminal 2 — Start the frontend:**
```bash
npm run dev
```

**Terminal 3 — Start the MCP server (for Hermes Agent):**
```bash
cd mcp-server && npx tsx index.ts
```

**Hermes Agent MCP config** (add to your `~/.hermes/config.yaml` or Claude Desktop `mcp.json`):
```json
{
  "mcpServers": {
    "hermes-design-studio": {
      "command": "npx",
      "args": ["tsx", "/absolute/path/to/HermesDesigner/mcp-server/index.ts"],
      "env": {
        "WS_PORT": "8765"
      }
    }
  }
}
```

---

## Usage

### In the Browser
1. Open http://localhost:5173
2. Click **New Project** and select a canvas preset (Instagram, A4, YouTube, etc.)
3. Use the **✦ Hermes AI** panel (bottom-right) to describe your design
4. All generated elements are editable: click to select, drag to move, double-click text to edit
5. Export: **File → Export PNG** or **File → Export SVG**

### Keyboard Shortcuts

| Key | Action |
|---|---|
| `V` | Move / Select |
| `T` | Text tool |
| `R` | Rectangle |
| `E` | Ellipse |
| `H` | Hand (Pan) |
| `Ctrl+Z` | Undo |
| `Ctrl+Y` | Redo |
| `Ctrl+D` | Duplicate |
| `Ctrl+G` | Group |
| `Delete` | Delete selected |
| `Ctrl+0` | Fit to screen |
| `Ctrl+1` | Zoom 100% |
| `[` / `]` | Send backward / bring forward |

---

## Canvas Presets Included

| Category | Presets |
|---|---|
| Social Media | Instagram Post/Story/Carousel, Facebook Cover, LinkedIn Banner, YouTube Thumbnail, Twitter/X, TikTok |
| Print | A4/A3 Portrait & Landscape (300 DPI), Business Card, Poster 18×24in |
| Presentation | 16:9 HD (1920×1080) |
| Custom | Any width × height |

---

## Project Structure

```
HermesDesigner/
├── src/
│   ├── app/              # App root + keyboard shortcut wiring
│   ├── components/
│   │   ├── menubar/      # Top menu (File, Edit, View, AI)
│   │   ├── toolbar/      # Left vertical tool rail
│   │   ├── canvas/       # Konva viewport + AI chat panel
│   │   ├── panels/       # Layers, Properties, History, PageTabs
│   │   └── modals/       # New Project modal
│   ├── engine/           # Document CRUD, history, shortcuts
│   ├── store/            # Zustand stores + IndexedDB
│   ├── ai/               # Prompt builder, schema validator, MCP client
│   ├── data/             # Canvas presets
│   └── types/            # TypeScript interfaces
├── mcp-server/           # MCP server (Hermes Agent integration)
├── ws-relay/             # WebSocket relay (MCP ↔ Browser)
└── README.md
```

---

## AI Design Rules (Applied Automatically by Hermes)

- **Color**: 60% dominant background, 30% secondary, 10% accent. WCAG AA contrast enforced.
- **Typography**: Max 2 font families. Headline tight tracking (-1.5px), body relaxed leading (1.4-1.6).
- **Layout**: 5-8% canvas margins, 8px grid spacing system, hierarchy by scale + contrast.
- **Output**: Valid JSON scene graph only. Zero flat raster images for UI elements.

---

## License

MIT — © 2026 Thaaan184
