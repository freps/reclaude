#!/usr/bin/env bash
# PostToolUse hook (lightweight): sets a "dirty" flag per side as soon as a
# file under frontend/src/ or backend/src/ was written. The actual steering
# update is done by the Stop hook (update-steering.sh) — only ONCE per task,
# not per edit.

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
