#!/bin/bash
# ui-debug-launch.sh — One-shot: dev server + Chrome + iPhone emulation + screenshot
# Usage: ./scripts/ui-debug-launch.sh [port]

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
PORT="${1:-2222}"
CDP_PORT=9222
PROFILE_DIR="/tmp/chrome-ui-debug-profile"
APP_URL="https://localhost:${PORT}/Y-j-/"
SCREENSHOT="/tmp/ui-debug-screenshot.png"

# ── 1. Dev server ──────────────────────────────────────────────
if curl -sk "$APP_URL" > /dev/null 2>&1; then
    echo "✓ Dev server running on port ${PORT}"
else
    echo "Starting dev server on port ${PORT}..."
    cd "$PROJECT_DIR" && npx vite --port "$PORT" &
    # Wait for server
    for i in $(seq 1 15); do
        curl -sk "$APP_URL" > /dev/null 2>&1 && break
        sleep 1
    done
    echo "✓ Dev server started"
fi

# ── 2. Debug Chrome ────────────────────────────────────────────
NEEDS_EMULATION=false
if curl -s "http://localhost:${CDP_PORT}/json/version" > /dev/null 2>&1; then
    echo "✓ Debug Chrome already running"
else
    echo "Launching debug Chrome..."
    mkdir -p "$PROFILE_DIR"
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
        --remote-debugging-port="${CDP_PORT}" \
        --user-data-dir="$PROFILE_DIR" \
        --window-size=393,900 \
        --no-first-run \
        --no-default-browser-check \
        "$APP_URL" &
    # Wait for CDP
    for i in $(seq 1 10); do
        curl -s "http://localhost:${CDP_PORT}/json/version" > /dev/null 2>&1 && break
        sleep 1
    done
    NEEDS_EMULATION=true
    echo "✓ Debug Chrome launched"
fi

# ── 3. Get CDP target ──────────────────────────────────────────
TARGET_WS=$(curl -s "http://localhost:${CDP_PORT}/json" | node -e "
const c=[]; process.stdin.on('data',d=>c.push(d));
process.stdin.on('end',()=>{
    const t=JSON.parse(c.join(''));
    const p=t.find(x=>x.type==='page');
    if(p) console.log(p.webSocketDebuggerUrl);
    else process.exit(1);
});
")

if [ -z "$TARGET_WS" ]; then
    echo "ERROR: No CDP page target" >&2
    exit 1
fi

# ── 4. Apply iPhone 14 Pro emulation (always — survives refreshes) ──
node -e "
const ws = new WebSocket('${TARGET_WS}');
let id = 0;
function send(m, p = {}) {
  return new Promise(r => {
    const i = ++id;
    const h = e => { const d = JSON.parse(e.data); if (d.id === i) { ws.removeEventListener('message', h); r(d); } };
    ws.addEventListener('message', h);
    ws.send(JSON.stringify({ id: i, method: m, params: p }));
  });
}
ws.addEventListener('open', async () => {
  await send('Security.enable');
  await send('Security.setIgnoreCertificateErrors', { ignore: true });
  await send('Emulation.setDeviceMetricsOverride', {
    width: 393, height: 852, deviceScaleFactor: 3, mobile: true,
    screenWidth: 393, screenHeight: 852
  });
  await send('Emulation.setUserAgentOverride', {
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
    platform: 'iPhone'
  });
  await send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
  await send('Page.navigate', { url: '${APP_URL}' });
  setTimeout(() => process.exit(0), 1500);
});
ws.addEventListener('error', () => { console.error('CDP failed'); process.exit(1); });
"
echo "✓ iPhone 14 Pro emulation active (393x852 @3x)"

# ── 5. Position window ────────────────────────────────────────
osascript <<'APPLESCRIPT'
tell application "Google Chrome"
    repeat with w in windows
        if URL of active tab of w contains "localhost:2222" then
            set bounds of w to {100, 44, 493, 944}
            exit repeat
        end if
    end repeat
    activate
end tell
APPLESCRIPT

# ── 6. Screenshot ──────────────────────────────────────────────
sleep 1
"$SCRIPT_DIR/ui-screenshot.sh" "$SCREENSHOT"
echo "✓ Screenshot saved to ${SCREENSHOT}"
