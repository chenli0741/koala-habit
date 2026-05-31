#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

SERVER_PORT="${SERVER_PORT:-8787}"
WEB_PORT="${WEB_PORT:-3000}"

stop_port() {
  local port="$1"
  local pids
  pids="$(lsof -ti "tcp:${port}" 2>/dev/null || true)"

  if [ -n "$pids" ]; then
    echo "Stopping process on port ${port}: ${pids}"
    kill $pids 2>/dev/null || true
  fi
}

stop_port "$SERVER_PORT"
stop_port "$WEB_PORT"

echo "Starting API on http://127.0.0.1:${SERVER_PORT}"
PORT="$SERVER_PORT" npm run dev -w server &
SERVER_PID=$!

echo "Starting Web on http://127.0.0.1:${WEB_PORT}"
PORT="$WEB_PORT" npm run dev -w web &
WEB_PID=$!

cleanup() {
  kill "$SERVER_PID" "$WEB_PID" 2>/dev/null || true
}

trap cleanup EXIT INT TERM

wait "$SERVER_PID" "$WEB_PID"
