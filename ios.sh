#!/usr/bin/env bash
# Start AI Proposal Generator (backend + frontend)
# Run with: bash ios.sh   OR   ./ios.sh (after chmod +x ios.sh)

set -e

ROOT="$(cd "$(dirname "$0")" && pwd)"
SERVER_PID=""
CLIENT_PID=""

cleanup() {
  echo ""
  echo "Stopping servers..."
  [ -n "$SERVER_PID" ] && kill "$SERVER_PID" 2>/dev/null || true
  [ -n "$CLIENT_PID" ] && kill "$CLIENT_PID" 2>/dev/null || true
}

trap cleanup SIGINT SIGTERM

cd "$ROOT"

if [ ! -f .env ]; then
  echo "Error: .env not found. Copy .env.example to .env and add your ANTHROPIC_API_KEY."
  exit 1
fi

if grep -q "your-api-key-here" .env 2>/dev/null; then
  echo "Warning: Set a valid ANTHROPIC_API_KEY in .env before generating proposals."
fi

# Free ports if old servers are still running
for port in 5001 5173 5174 5175; do
  pid=$(lsof -ti :"$port" 2>/dev/null || true)
  if [ -n "$pid" ]; then
    echo "Stopping process on port $port..."
    kill -9 $pid 2>/dev/null || true
  fi
done

sleep 1

# Install dependencies if missing
if [ ! -d server/node_modules ]; then
  echo "Installing server dependencies..."
  (cd server && npm install)
fi
if [ ! -d client/node_modules ]; then
  echo "Installing client dependencies..."
  (cd client && npm install)
fi

# Fix execute permission on local binaries (macOS sometimes blocks them)
chmod +x server/node_modules/.bin/* 2>/dev/null || true
chmod +x client/node_modules/.bin/* 2>/dev/null || true

echo "Starting backend on port 5001..."
(cd server && node index.js) &
SERVER_PID=$!

sleep 3

if ! curl -sf http://localhost:5001/api/health >/dev/null 2>&1; then
  echo "Error: Backend failed to start. Check .env and errors above."
  cleanup
  exit 1
fi

echo "Starting frontend..."
(cd client && node ./node_modules/vite/bin/vite.js) &
CLIENT_PID=$!

sleep 3

FRONTEND_URL="http://localhost:5173"
if ! curl -sf -o /dev/null "$FRONTEND_URL" 2>/dev/null; then
  FRONTEND_URL="http://localhost:5174"
fi
if ! curl -sf -o /dev/null "$FRONTEND_URL" 2>/dev/null; then
  FRONTEND_URL="http://localhost:5175"
fi

echo ""
echo "=========================================="
echo "  AI Proposal Generator is running"
echo "=========================================="
echo "  App:      $FRONTEND_URL"
echo "  API:      http://localhost:5001"
echo "  Health:   http://localhost:5001/api/health"
echo ""
echo "  Press Ctrl+C to stop both servers"
echo "=========================================="
echo ""

wait
