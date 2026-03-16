#!/bin/bash
# ui-screenshot.sh — Capture the UI debug Chrome window
# Usage: ./scripts/ui-screenshot.sh [output_path]
#
# Captures the Chrome window running localhost:2222 (the debug instance).
# The window bounds are read dynamically from Chrome via AppleScript.

OUTPUT="${1:-/tmp/ui-debug-screenshot.png}"

BOUNDS=$(osascript <<'EOF'
tell application "Google Chrome"
    repeat with w in windows
        if URL of active tab of w contains "localhost:2222" then
            set b to bounds of w
            set x to item 1 of b
            set y to item 2 of b
            set w_ to (item 3 of b) - x
            set h to (item 4 of b) - y
            return (x as text) & "," & (y as text) & "," & (w_ as text) & "," & (h as text)
        end if
    end repeat
end tell
EOF
)

if [ -z "$BOUNDS" ]; then
    echo "ERROR: No Chrome window found with localhost:2222" >&2
    exit 1
fi

screencapture -R"$BOUNDS" "$OUTPUT"
echo "$OUTPUT"
