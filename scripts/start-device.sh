#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR/app"

PORT="${PORT:-8082}"
API_PORT="${API_PORT:-8787}"
PUBLIC_API_URL="${PUBLIC_API_URL:-https://api.habit.globjoy.com}"
LAN_IP="${LAN_IP:-$(ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null || true)}"

if [ -z "$LAN_IP" ]; then
  echo "Could not detect a LAN IP. Set LAN_IP manually, for example:"
  echo "LAN_IP=192.168.0.64 npm run app:device"
  exit 1
fi

if [ "${USE_LOCAL_API:-0}" = "1" ]; then
  export EXPO_PUBLIC_API_URL="${EXPO_PUBLIC_API_URL:-http://${LAN_IP}:${API_PORT}}"
else
  export EXPO_PUBLIC_API_URL="${EXPO_PUBLIC_API_URL:-${PUBLIC_API_URL}}"
fi

echo "Starting Koala Habit for a physical device."
echo "Metro URL: http://${LAN_IP}:${PORT}"
echo "API URL: ${EXPO_PUBLIC_API_URL}"
echo "Scan the QR code with the Koala Habit development build."

npx expo start --dev-client --host lan --port "$PORT"
