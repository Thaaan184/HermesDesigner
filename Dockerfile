# ── Stage 1: Build frontend ────────────────────────────────────────────────────
FROM node:22-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# ── Stage 2: Production (serve static + WS relay) ─────────────────────────────
FROM node:22-alpine AS runner
WORKDIR /app

# Install serve for static files
RUN npm install -g serve

# Copy built frontend
COPY --from=builder /app/dist ./dist

# Copy WS relay
COPY ws-relay ./ws-relay
RUN cd ws-relay && npm install --omit=dev 2>/dev/null || true

# Copy MCP server
COPY mcp-server ./mcp-server
RUN cd mcp-server && npm install --omit=dev

# Copy entrypoint
COPY docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh

EXPOSE 3000 8765

ENTRYPOINT ["./docker-entrypoint.sh"]
