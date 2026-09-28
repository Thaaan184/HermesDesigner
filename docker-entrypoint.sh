#!/bin/sh
set -e

echo "[HermesDesigner] Starting WebSocket relay on port 8765..."
node ws-relay/server.mjs &

echo "[HermesDesigner] Starting frontend on port 3000..."
serve -s dist -l 3000
