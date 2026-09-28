# ── Stage 1: Build frontend ────────────────────────────────────────────────────
FROM node:22-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# ── Stage 2: Production (nginx + node services) ───────────────────────────────
FROM node:22-alpine AS runner
WORKDIR /app

# Install nginx
RUN apk add --no-cache nginx

# Copy built frontend to nginx root
COPY --from=builder /app/dist /usr/share/nginx/html

# Nginx config: serve frontend + proxy /api/* to API server on 4000
RUN printf 'server {\n\
  listen 3000;\n\
  root /usr/share/nginx/html;\n\
  index index.html;\n\
  location /api/ {\n\
    proxy_pass http://127.0.0.1:4000;\n\
    proxy_set_header Host $host;\n\
    proxy_read_timeout 120s;\n\
  }\n\
  location / {\n\
    try_files $uri $uri/ /index.html;\n\
  }\n\
}\n' > /etc/nginx/http.d/default.conf

# Copy WS relay
COPY ws-relay ./ws-relay
RUN cd ws-relay && npm install --omit=dev 2>/dev/null || true

# Copy API server
COPY api-server ./api-server
RUN cd api-server && npm install --omit=dev

# Copy MCP server
COPY mcp-server ./mcp-server
RUN cd mcp-server && npm install --omit=dev

# Copy entrypoint
COPY docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh

EXPOSE 3000 4000 8765

ENTRYPOINT ["./docker-entrypoint.sh"]
