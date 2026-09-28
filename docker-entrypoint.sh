#!/bin/sh
set -e

echo "[HermesDesigner] Starting WebSocket relay on port 8765..."
node ws-relay/server.mjs &

echo "[HermesDesigner] Starting API server on port 4000..."
NINEROUTER_URL="${NINEROUTER_URL:-http://100.96.207.8:20128}" node api-server/server.mjs &

echo "[HermesDesigner] Starting nginx on port 3000..."
nginx -g 'daemon off;'
