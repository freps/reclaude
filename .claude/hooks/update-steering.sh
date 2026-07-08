#!/usr/bin/env bash
# Stop hook: runs ONCE per completed task (not per edit).
# For each side (frontend, backend): if a file was changed since the last run
# (dirty flag from steering-dirty.sh), regenerate the auto-managed chapter in
# the respective steering doc.
# A per-side debounce prevents overly frequent runs.
#
# Wired up as "async": true -> does not block task completion.

set -uo pipefail

# --- Recursion guard --------------------------------------------------------
# The headless `claude -p` below is itself a Claude session and fires Stop
# hooks when it finishes. This env variable breaks the recursion.
[ -n "${STEERING_HOOK_CHILD:-}" ] && exit 0

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
CACHE_DIR="$REPO_ROOT/.claude/.cache"
HOOK_DIR="$REPO_ROOT/.claude/hooks"
DEBOUNCE_SECONDS="${STEERING_DEBOUNCE_SECONDS:-600}" # 10 min default

mkdir -p "$CACHE_DIR"

# Portable timeout: use timeout/gtimeout if available (often not installed on
# macOS). Without them, the `timeout` from the hook config applies.
TIMEOUT=""
if command -v timeout >/dev/null 2>&1; then
  TIMEOUT="timeout 300"
elif command -v gtimeout >/dev/null 2>&1; then
  TIMEOUT="gtimeout 300"
fi

# Prompt per side. Each prompt edits only the marker region in the respective
# steering doc and uses only Read/Grep/Glob/Edit.
prompt_for() {
  case "$1" in
    frontend)
      cat <<'EOF'
Update ONLY the components chapter in the frontend steering doc
.claude/steering/frontend.md.

Task:
1. Read the shared components in frontend/src/components/ (only the top-level
   .tsx files directly in that folder; ignore the generated ui/ subfolder).
   For each file, get an impression from its props/JSX of what the component does.
2. In .claude/steering/frontend.md, replace ONLY the content between the lines
       <!-- BEGIN: reusable-components (auto-generated — do not edit by hand) -->
   and
       <!-- END: reusable-components (auto-generated — do not edit by hand) -->
   The marker lines themselves must remain unchanged. Do not touch anything
   outside the markers.
3. Between the markers, write a Markdown table with the columns
   | Component | Purpose (1 sentence) | Reuse for |
   One sentence per component, in English, concrete. Goal: these components
   should be reused for new features instead of being rebuilt.

Important: if a description already exists for a component and only differs
insignificantly, do NOT change it.

Use only the tools Read, Grep, Glob, and Edit. Do not create new files.
EOF
      ;;
    backend)
      cat <<'EOF'
Update ONLY the building-blocks chapter in the backend steering doc
.claude/steering/backend.md.

Task:
1. Read the reusable helpers in backend/src/lib/ (excluding *.test.ts) and the
   middleware in backend/src/middleware/. For each file, get an impression from
   its exports of what it provides.
2. In .claude/steering/backend.md, replace ONLY the content between the lines
       <!-- BEGIN: reusable-backend (auto-generated — do not edit by hand) -->
   and
       <!-- END: reusable-backend (auto-generated — do not edit by hand) -->
   The marker lines themselves must remain unchanged. Do not touch anything
   outside the markers.
3. Between the markers, write a Markdown table with the columns
   | Building block | Purpose (1 sentence) | Reuse for |
   One sentence per file/export, in English, concrete. Goal: these helpers
   should be reused for new routes/features instead of being rebuilt.

Important: if a description already exists for an entry and only differs
insignificantly, do NOT change it.

Use only the tools Read, Grep, Glob, and Edit. Do not create new files.
EOF
      ;;
  esac
}

NOW="$(date +%s)"

for SIDE in frontend backend; do
  MARKER="$CACHE_DIR/$SIDE-steering.dirty"
  LAST_RUN="$CACHE_DIR/$SIDE-steering.last-run"

  # Only run if a file on this side changed since the last run.
  [ -f "$MARKER" ] || continue

  # (1) Update the folder structure deterministically — no LLM, no debounce,
  # idempotent (writes only on real changes). Also runs without the claude CLI.
  if command -v bun >/dev/null 2>&1; then
    bun "$HOOK_DIR/steering-tree.ts" "$SIDE" >/dev/null 2>&1 || true
  fi

  # (2) The LLM catalog needs the claude CLI; without it the flag stays set
  # (only the tree ran). It is then retried at the end of every task.
  command -v claude >/dev/null 2>&1 || continue

  # Debounce: too soon since the last run? -> keep the flag, retry later.
  if [ -f "$LAST_RUN" ]; then
    PREV="$(cat "$LAST_RUN" 2>/dev/null || echo 0)"
    if [ $((NOW - PREV)) -lt "$DEBOUNCE_SECONDS" ]; then
      continue
    fi
  fi

  # Before the run: clear the flag and set the timestamp (prevents double runs
  # if another task finishes in the meantime).
  rm -f "$MARKER"
  echo "$NOW" > "$LAST_RUN"

  # Haiku, to keep the cost of the automatic run low.
  # --dangerously-skip-permissions is needed so the headless run can edit
  # without interactive confirmation. The blast radius stays small because only
  # Read/Grep/Glob/Edit are allowed (no Bash, no Write).
  # stdin from /dev/null, otherwise claude -p waits for input.
  STEERING_HOOK_CHILD=1 $TIMEOUT claude -p "$(prompt_for "$SIDE")" \
    --model claude-haiku-4-5 \
    --dangerously-skip-permissions \
    --allowedTools "Read" "Grep" "Glob" "Edit" \
    </dev/null >/dev/null 2>&1 || true
done

exit 0
