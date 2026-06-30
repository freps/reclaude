# Reclaude — React Claude Code Template

Batteries-included boilerplate for classic frontend/backend apps with an agent-driven development workflow.

## Stack

- `frontend/` — React 19 + TypeScript + Vite + TailwindCSS v4 + shadcn/ui (port 3000)
- `backend/` — Hono on Bun (port 3001)
- `backend/data/app.db` — SQLite (app data, e.g. the example `todos` table; created automatically on first start)
- `backend/data/auth.db` — SQLite (better-auth: users, sessions; created automatically on first start)
- Bun is the package manager and runtime everywhere.

## Commands (from repo root)

```bash
bun run dev      # frontend + backend in parallel (user only — agents never run this)
bun run build    # build frontend to frontend/dist/
bun run start    # serve API + frontend from backend on :3001
```

Lint/format/typecheck/test run per workspace: `cd frontend|backend && bun run lint|format|typecheck` / `bun test`.

## Local Dev Prerequisites

No Docker or PostgreSQL required. The backend uses SQLite — `data/app.db` and `data/auth.db` are created automatically inside `backend/data/` on first start.

Copy `backend/.env.example` to `backend/.env` and fill in secrets before running. Schema migrations and admin user creation run automatically on startup from `SEED_USER_EMAIL` / `SEED_USER_PASSWORD`.

To seed demo data manually after first start:

```bash
cd backend && bun run seed
```

## Development Workflow

- **Feature or bug fix** → user runs `/change`. Full lifecycle: requirements → branch + spec doc → architect → user approval gate → fullstack-developer (implements + self-verifies) → code-reviewer → commit.
- **Code optimization** → user runs `/improve`. Analysis → spec → fullstack-developer (implements + self-verifies) → code-reviewer → commit.
- **Direct coding** without the lifecycle is fine for small ad-hoc edits — but follow the steering docs.

Agents communicate through a spec doc in `_spec/` (copied from `_spec/_template.md`). It is the single source of truth per change: Change section (requirements), Architecture (design + API contracts), QA Report (written by the fullstack-developer), Code Review (written by the code-reviewer), Technical Writer.

## Conventions

Authoritative steering docs — read the relevant one before writing code:

- `.claude/steering/frontend.md` — React/TS conventions, folder structure, styling rules
- `.claude/steering/backend.md` — Hono patterns (inline handlers, no controllers), SQLite/better-auth, routing, error handling

## Hard Rules

- Never start the dev server (`bun run dev`/`start`) — the user runs it.
- Never push to remote — committing is fine within the workflows, pushing is the user's call.
- Work on `feat/*` or `fix/*` branches, never directly on `main`, when using the workflows.
- When introducing a new dependency / module, make a proposal to the user first. Always check for latest versions and compatibility.
