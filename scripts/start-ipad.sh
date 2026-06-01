#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR/app"

PORT="${PORT:-8082}"
API_PORT="${API_PORT:-8787}"
PREFERRED_IPAD="${PREFERRED_IPAD:-iPad (10th generation)}"
LAN_IP="${LAN_IP:-$(ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null || true)}"

if [ -n "$LAN_IP" ]; then
  export EXPO_PUBLIC_API_URL="${EXPO_PUBLIC_API_URL:-http://${LAN_IP}:${API_PORT}}"
else
  export EXPO_PUBLIC_API_URL="${EXPO_PUBLIC_API_URL:-http://localhost:${API_PORT}}"
fi

DEVICE_ID="$(
  PREFERRED_IPAD="$PREFERRED_IPAD" xcrun simctl list devices available -j | node -e '
    const input = require("fs").readFileSync(0, "utf8");
    const devices = Object.values(JSON.parse(input).devices).flat().filter((device) => device.isAvailable && device.name.includes("iPad"));
    const preferred = devices.find((device) => device.name === process.env.PREFERRED_IPAD);
    const device = preferred ?? devices[0];

    if (!device) {
      process.exit(1);
    }

    process.stdout.write(device.udid);
  '
)"

if [ -z "$DEVICE_ID" ]; then
  echo "No available iPad simulator was found. Install an iPad simulator in Xcode first."
  exit 1
fi

xcrun simctl boot "$DEVICE_ID" 2>/dev/null || true
open -a Simulator

echo "Starting Koala Habit on iPad simulator (${PREFERRED_IPAD}) via Expo."
echo "API URL: ${EXPO_PUBLIC_API_URL}"
npx expo run:ios --device "$DEVICE_ID" --port "$PORT"
