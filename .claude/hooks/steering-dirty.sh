#!/usr/bin/env bash
# PostToolUse-Hook (leichtgewichtig): setzt ein "dirty"-Flag pro Seite, sobald
# eine Datei unter frontend/src/ bzw. backend/src/ geschrieben wurde. Das
# eigentliche Steering-Update macht der Stop-Hook (update-steering.sh) — nur
# EINMAL pro Task, nicht pro Edit.

set -uo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
CACHE_DIR="$REPO_ROOT/.claude/.cache"

FILE="$(jq -r '.tool_response.filePath // .tool_input.file_path // empty')"
[ -z "$FILE" ] && exit 0

case "$FILE" in
  */frontend/src/*.ts | */frontend/src/*.tsx | */frontend/src/*.js | */frontend/src/*.jsx | \
  frontend/src/*.ts | frontend/src/*.tsx | frontend/src/*.js | frontend/src/*.jsx)
    SIDE="frontend" ;;
  */backend/src/*.ts | backend/src/*.ts)
    SIDE="backend" ;;
  *) exit 0 ;;
esac

mkdir -p "$CACHE_DIR"
touch "$CACHE_DIR/$SIDE-steering.dirty"
exit 0
