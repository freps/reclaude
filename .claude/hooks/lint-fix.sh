#!/usr/bin/env bash
# PostToolUse-Hook: läuft nach Write/Edit/MultiEdit.
# Erkennt am bearbeiteten Dateipfad, ob die Datei in frontend/ oder backend/
# liegt, und führt dort `bun run lint:fix` aus (auto-fix).
# Nur für Code-Dateien (ts/tsx/js/jsx/mjs/cjs). Andere Pfade -> No-Op.

set -uo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

# Dateipfad aus dem stdin-JSON ziehen (PostToolUse liefert je nach Tool
# tool_response.filePath oder tool_input.file_path).
FILE="$(jq -r '.tool_response.filePath // .tool_input.file_path // empty')"
[ -z "$FILE" ] && exit 0

# Nur Code-Dateien behandeln.
case "$FILE" in
  *.ts | *.tsx | *.js | *.jsx | *.mjs | *.cjs) ;;
  *) exit 0 ;;
esac

# Workspace anhand des Pfads bestimmen.
case "$FILE" in
  */frontend/* | frontend/*) WS="frontend" ;;
  */backend/* | backend/*) WS="backend" ;;
  *) exit 0 ;;
esac

WS_DIR="$REPO_ROOT/$WS"
[ -d "$WS_DIR" ] || exit 0

# lint:fix (auto-fix) ausführen, Ausgabe sammeln.
OUT="$(cd "$WS_DIR" && bun run lint:fix 2>&1)"
STATUS=$?

if [ $STATUS -ne 0 ]; then
  # Exit 2 -> Fehlerausgabe geht zurück an das Modell (PostToolUse).
  echo "[$WS] lint:fix fehlgeschlagen für $FILE:" >&2
  echo "$OUT" >&2
  exit 2
fi

exit 0
