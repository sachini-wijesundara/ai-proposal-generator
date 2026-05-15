#!/usr/bin/env bash
# Start AI Proposal Generator (backend + frontend)

set -e

ROOT="$(cd "$(dirname "$0")" && pwd)"
SERVER_PID=""
CLIENT_PID=""

cleanup() {
  echo ""
  echo "Stopping servers..."
  [ -n "$SERVER_PID" ] && kill "$SERVER_PID" 2>/dev/null || true
  [ -n "$CLIENT_PID" ] && kill "$CLIENT_PID" 2>/dev/null || true
  exit 0
}

trap cleanup SIGINT SIGTERM EXIT

cd "$ROOT"

if [ ! -f .env ]; then
  echo "Error: .env not found. Copy .env.example to .env and add your ANTHROPIC_API_KEY."
  exit 1
fi

if ! grep -q "ANTHROPIC_API_KEY=." .env 2>/dev/null || grep -q "your-api-key-here" .env 2>/dev/null; then
  echo "Warning: Set a valid ANTHROPIC_API_KEY in .env before generating proposals."
fi

# Install dependencies if missing
if [ ! -d server/node_modules ]; then
  echo "Installing server dependencies..."
  (cd server && npm install)
fi
if [ ! -d client/node_modules ]; then
  echo "Installing client dependencies..."
  (cd client && npm install)
fi

echo "Starting backend on port 5001..."
(cd server && node index.js) &
SERVER_PID=$!

sleep 2

if ! curl -sf http://localhost:5001/api/health >/dev/null 2>&1; then
  echo "Error: Backend failed to start. Check .env and server logs above."
  exit 1
fi

echo "Starting frontend on http://localhost:5173 ..."
(cd client && node ./node_modules/vite/bin/vite.js) &
CLIENT_PID=$!

sleep 2

echo ""
echo "=========================================="
echo "  AI Proposal Generator is running"
echo "=========================================="
echo "  App:      http://localhost:5173"
echo "  API:      http://localhost:5001"
echo "  Health:   http://localhost:5001/api/health"
echo ""
echo "  Press Ctrl+C to stop both servers"
echo "=========================================="
echo ""

wait
