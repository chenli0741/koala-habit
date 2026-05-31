#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

export PORT="${PORT:-8787}"

if [ ! -f "$ROOT_DIR/server/.env" ]; then
  echo "Warning: server/.env was not found. Copy server/.env.example to server/.env and set DATABASE_URL if you need Postgres."
fi

echo "Starting Koala Habit API on http://localhost:${PORT}"
echo "Press Ctrl+C to stop."

npm run dev -w server
