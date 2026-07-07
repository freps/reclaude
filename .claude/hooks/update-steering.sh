#!/usr/bin/env bash
# Stop-Hook: läuft EINMAL pro abgeschlossenem Task (nicht pro Edit).
# Für jede Seite (frontend, backend) gilt: wenn seit dem letzten Lauf eine Datei
# geändert wurde (dirty-Flag von steering-dirty.sh), regeneriert er das
# auto-verwaltete Kapitel im jeweiligen Steering-Doc per headless `claude -p`.
# Ein Debounce pro Seite verhindert zu häufige Läufe.
#
# Als "async": true eingebunden -> blockiert das Task-Ende nicht.

set -uo pipefail

# --- Recursion-Guard -------------------------------------------------------
# Das headless `claude -p` unten ist selbst eine Claude-Session und feuert am
# Ende wieder Stop-Hooks. Diese Env-Variable bricht die Rekursion ab.
[ -n "${STEERING_HOOK_CHILD:-}" ] && exit 0

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
CACHE_DIR="$REPO_ROOT/.claude/.cache"
HOOK_DIR="$REPO_ROOT/.claude/hooks"
DEBOUNCE_SECONDS="${STEERING_DEBOUNCE_SECONDS:-600}" # 10 min Default

mkdir -p "$CACHE_DIR"

# Portabler Timeout: timeout/gtimeout nutzen falls vorhanden (auf macOS oft
# nicht installiert). Ohne sie greift der `timeout` aus der Hook-Config.
TIMEOUT=""
if command -v timeout >/dev/null 2>&1; then
  TIMEOUT="timeout 300"
elif command -v gtimeout >/dev/null 2>&1; then
  TIMEOUT="gtimeout 300"
fi

# Prompt je Seite. Jeder Prompt editiert nur den Marker-Bereich im jeweiligen
# Steering-Doc und benutzt nur Read/Grep/Glob/Edit.
prompt_for() {
  case "$1" in
    frontend)
      cat <<'EOF'
Aktualisiere ausschließlich das Component-Kapitel im Frontend-Steering-Dokument
.claude/steering/frontend.md.

Aufgabe:
1. Lies die Shared Components in frontend/src/components/ (nur die Top-Level-.tsx
   direkt in diesem Ordner; den generierten Unterordner ui/ ignorieren).
   Verschaffe dir je Datei über Props/JSX einen Eindruck, was die Component tut.
2. Ersetze in .claude/steering/frontend.md AUSSCHLIESSLICH den Inhalt zwischen
   den Zeilen
       <!-- BEGIN: reusable-components (auto-generiert – nicht von Hand editieren) -->
   und
       <!-- END: reusable-components (auto-generiert – nicht von Hand editieren) -->
   Die Marker-Zeilen selbst bleiben unverändert erhalten. Nichts außerhalb der
   Marker anfassen.
3. Schreibe zwischen die Marker eine Markdown-Tabelle mit Spalten
   | Component | Zweck (1 Satz) | Wiederverwenden für |
   Ein Satz pro Component, deutsch, konkret. Ziel: dass diese Components bei neuen
   Features bevorzugt wiederverwendet statt neu gebaut werden.

Wichtig: Ist bereits ein Text für die jeweilige Komponente vorhanden, und weicht
inhaltich unwesentlich ab, dann NICHT ändern.

Benutze nur die Tools Read, Grep, Glob und Edit. Erzeuge keine neuen Dateien.
EOF
      ;;
    backend)
      cat <<'EOF'
Aktualisiere ausschließlich das Bausteine-Kapitel im Backend-Steering-Dokument
.claude/steering/backend.md.

Aufgabe:
1. Lies die wiederverwendbaren Helfer in backend/src/lib/ (ohne *.test.ts) und
   die Middleware in backend/src/middleware/. Verschaffe dir je Datei über die
   Exporte einen Eindruck, was sie bereitstellt.
2. Ersetze in .claude/steering/backend.md AUSSCHLIESSLICH den Inhalt zwischen
   den Zeilen
       <!-- BEGIN: reusable-backend (auto-generiert – nicht von Hand editieren) -->
   und
       <!-- END: reusable-backend (auto-generiert – nicht von Hand editieren) -->
   Die Marker-Zeilen selbst bleiben unverändert erhalten. Nichts außerhalb der
   Marker anfassen.
3. Schreibe zwischen die Marker eine Markdown-Tabelle mit Spalten
   | Baustein | Zweck (1 Satz) | Wiederverwenden für |
   Ein Satz pro Datei/Export, deutsch, konkret. Ziel: dass diese Helfer bei neuen
   Routen/Features bevorzugt wiederverwendet statt neu gebaut werden.

Wichtig: Ist bereits ein Text für die jeweilige Komponente vorhanden, und weicht
inhaltich unwesentlich ab, dann NICHT ändern.

Benutze nur die Tools Read, Grep, Glob und Edit. Erzeuge keine neuen Dateien.
EOF
      ;;
  esac
}

NOW="$(date +%s)"

for SIDE in frontend backend; do
  MARKER="$CACHE_DIR/$SIDE-steering.dirty"
  LAST_RUN="$CACHE_DIR/$SIDE-steering.last-run"

  # Nur laufen, wenn seit dem letzten Lauf eine Datei dieser Seite geändert wurde.
  [ -f "$MARKER" ] || continue

  # (1) Folder-Structure deterministisch aktualisieren — kein LLM, kein Debounce,
  # idempotent (schreibt nur bei echter Änderung). Läuft auch ohne claude-CLI.
  if command -v bun >/dev/null 2>&1; then
    bun "$HOOK_DIR/steering-tree.ts" "$SIDE" >/dev/null 2>&1 || true
  fi

  # (2) LLM-Katalog braucht claude-CLI; ohne bleibt das Flag stehen (nur der
  # Tree lief). Bei jedem Task-Ende wird es dann erneut versucht.
  command -v claude >/dev/null 2>&1 || continue

  # Debounce: zu kurz seit letztem Lauf? -> Flag behalten, später erneut versuchen.
  if [ -f "$LAST_RUN" ]; then
    PREV="$(cat "$LAST_RUN" 2>/dev/null || echo 0)"
    if [ $((NOW - PREV)) -lt "$DEBOUNCE_SECONDS" ]; then
      continue
    fi
  fi

  # Vor dem Lauf: Flag löschen und Zeitstempel setzen (verhindert Doppel-Läufe,
  # falls in der Zwischenzeit ein weiterer Task endet).
  rm -f "$MARKER"
  echo "$NOW" > "$LAST_RUN"

  # Haiku, um die Kosten des automatischen Laufs gering zu halten.
  # --dangerously-skip-permissions ist nötig, damit der headless Lauf ohne
  # interaktive Bestätigung editieren kann. Der Blast-Radius bleibt klein, weil
  # nur Read/Grep/Glob/Edit erlaubt sind (kein Bash, kein Write).
  # stdin von /dev/null, sonst wartet claude -p auf Eingabe.
  STEERING_HOOK_CHILD=1 $TIMEOUT claude -p "$(prompt_for "$SIDE")" \
    --model claude-haiku-4-5 \
    --dangerously-skip-permissions \
    --allowedTools "Read" "Grep" "Glob" "Edit" \
    </dev/null >/dev/null 2>&1 || true
done

exit 0
