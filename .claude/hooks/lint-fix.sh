#!/usr/bin/env bash
# PostToolUse hook: runs after Write/Edit/MultiEdit.
# Detects from the edited file path whether the file lives in frontend/ or
# backend/ and runs `bun run lint:fix` there (auto-fix).
# Code files only (ts/tsx/js/jsx/mjs/cjs). Other paths -> no-op.

set -uo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

# Extract the file path from the stdin JSON (PostToolUse provides
# tool_response.filePath or tool_input.file_path depending on the tool).
FILE="$(jq -r '.tool_response.filePath // .tool_input.file_path // empty')"
[ -z "$FILE" ] && exit 0

# Handle code files only.
case "$FILE" in
  *.ts | *.tsx | *.js | *.jsx | *.mjs | *.cjs) ;;
  *) exit 0 ;;
esac

# Determine the workspace from the path.
case "$FILE" in
  */frontend/* | frontend/*) WS="frontend" ;;
  */backend/* | backend/*) WS="backend" ;;
  *) exit 0 ;;
esac

WS_DIR="$REPO_ROOT/$WS"
[ -d "$WS_DIR" ] || exit 0

# Run lint:fix (auto-fix), collect output.
OUT="$(cd "$WS_DIR" && bun run lint:fix 2>&1)"
STATUS=$?

if [ $STATUS -ne 0 ]; then
  # Exit 2 -> error output is fed back to the model (PostToolUse).
  echo "[$WS] lint:fix failed for $FILE:" >&2
  echo "$OUT" >&2
  exit 2
fi

exit 0
