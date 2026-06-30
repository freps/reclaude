---
description: Copy a UI design from an Open Design file to a frontend page — visual parity without 1:1 code copy
argument-hint: <from-file-or-description> <to-route-or-description> [what-to-copy]
---

Transfer the UI design as instructed: $ARGUMENTS

## Argument Parsing

Split `$ARGUMENTS` into three parts:
- **from** — first token(s) up to the second argument: the Open Design source (filename, description, or "active file")
- **to** — second token(s): a route (`./todos`, `./benutzer/[id]/edit`) or free-text description of the target page
- **what** _(optional)_ — everything after the second argument: specific element(s) to copy; if absent, copy the entire design look & feel

If any of `from` or `to` is missing or ambiguous, stop and ask the user before doing anything else.

---

## Open Design Project

Set the Open Design project name for this app here (rename when you fork the template). Pass it explicitly as the `project` parameter whenever an MCP tool accepts one, unless the user specifies a different source. If no project is configured yet, ask the user which Open Design project to use.

---

## Phase 0 — MCP Health Check (hard gate)

Before anything else, verify both MCP servers are reachable:

1. **Open Design** — call `mcp__open-design__get_active_context` (no args). If it errors or returns nothing, stop immediately and tell the user:
   > "Open Design MCP is not reachable. Please make sure the Open Design daemon is running and the MCP server is configured, then retry."

2. **Chrome DevTools** — call `mcp__chrome-devtools__list_pages`. If it errors, stop immediately and tell the user:
   > "Chrome DevTools MCP is not reachable. Please make sure the browser is open with remote debugging enabled, then retry."

Only proceed if both checks pass.

---

## Phase 1 — Understand the Source Design (`from`)

Goal: build a complete mental model of what the source looks like and how it is structured.

1. **Locate the file** in Open Design:
   - If `from` is "active file" or very vague, call `mcp__open-design__get_active_context` to resolve it.
   - Otherwise call `mcp__open-design__search_files` with the `from` description to find the best match.
   - Confirm the resolved filename to yourself before continuing.

2. **Read the design code** — call `mcp__open-design__get_artifact` (omit `project` to use active context, or pass the resolved project). This returns the entry file plus all referenced siblings in one call — prefer it over multiple `get_file` calls.

3. **Take a visual screenshot** — navigate Chrome DevTools to the Open Design preview URL for this file (ask Open Design for the URL if needed; otherwise derive it from the active context) and call `mcp__chrome-devtools__take_screenshot`. Study the screenshot carefully — note layout, spacing, colors, typography, component hierarchy, interactions.

4. Build a mental model that covers:
   - Overall layout and grid
   - Color palette and typography used
   - Key components and their visual roles
   - Any states (hover, active, empty, loading)
   - Data displayed (remember: this is demo/click-dummy data, not real)

---

## Phase 2 — Understand the Target (`to`)

Goal: understand what the target page currently looks like and how it is built.

1. **Map `to` to a file**:
   - Run `find frontend/src/pages -name "*.tsx" | sort` and read `frontend/src/router.tsx` to see the route structure (routes are defined manually in `router.tsx`; pages mirror the URL: `pages/foo/[id]/bar.tsx` → `/foo/:id/bar`).
   - Match `to` to the closest route file. If ambiguous, ask the user.

2. **Read the target page** and its direct child components (follow `import` statements one level deep; don't spiral into the whole codebase).

3. **Take a live screenshot** of the target in the running app:
   - Read `backend/.env` for `SEED_USER_EMAIL` / `SEED_USER_PASSWORD`.
   - Navigate Chrome DevTools to the correct route (log in if needed).
   - Call `mcp__chrome-devtools__take_screenshot`.

4. Note which parts of the target already match the source and which need to change.

---

## Phase 3 — Plan the Changes

Before writing any code:

1. List the concrete changes needed (layout, colors, components, copy, structure).
2. Check for reusable existing components in `frontend/src/components/` — grep for likely names before creating new ones.
3. Identify whether backend or seed data changes are required:
   - If the source design shows data that the target's API does not yet return → **stop and ask the user for approval** before touching backend or `seed.ts`. Describe exactly what you'd add.
   - If only frontend visual changes are needed → proceed without asking.
4. Note if `theme-preview` needs extension for new design tokens / components → flag it to the user but proceed (no approval needed for additive theme-preview changes unless they affect other pages significantly).
5. If changes to shared components could visually affect other pages → **inform the user and ask for approval** before proceeding.

---

## Phase 4 — Implement

Rules for implementation:
- **Do not copy source code 1:1.** The source is a click-dummy and may not follow project conventions. Re-implement the look and feel using the project's stack (React 19, TypeScript, TailwindCSS v4, shadcn/ui).
- Use TailwindCSS utility classes; never add inline styles unless unavoidable.
- Prefer CSS Grid and Flexbox; match spacing and sizing to the design.
- Reuse existing components wherever possible; only create new ones when no suitable component exists.
- Keep data bindings real and functional — no hardcoded demo strings in production code.
- Follow `.claude/steering/frontend.md` conventions at all times.
- If backend changes were approved: follow `.claude/steering/backend.md`; extend `backend/src/seed.ts` with realistic seed entries for new data.

Implement changes in this order:
1. Backend / migrations / seed (if approved)
2. New shared components (if any)
3. Target page and its direct components
4. `theme-preview` extensions (if needed)

---

## Phase 5 — Verify

1. Call `mcp__chrome-devtools__take_screenshot` of the updated target page.
2. Compare visually against the Phase 1 source screenshot.
3. Check the browser console for errors: `mcp__chrome-devtools__list_console_messages`.
4. If `what` was specified, confirm only that element was changed and the rest of the page is unaffected.
5. If there are visual gaps or console errors, fix them before reporting done.

---

## Phase 6 — Report

Tell the user:
- What was copied and from which source file
- Which target file(s) were changed
- Any backend / seed changes made (or skipped and why)
- Any deviations from the source design (intentional simplifications, conventions enforced)
- Any follow-up items the user should know about (e.g. pending approval gates that were skipped)

Do **not** commit — leave that to the user or to `/change`.
