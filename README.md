# Reclaude — React Claude Code Template

Batteries-included boilerplate for classic frontend/backend apps, wired for agent-driven development with [Claude Code](https://claude.com/claude-code).

- **Frontend**: React 19 + TypeScript + Vite + TailwindCSS v4 + shadcn/ui
- **Backend**: Hono + Bun
- **Database**: SQLite (file-based, no Docker required)
- **Auth**: better-auth (email/password) with protected routes and admin-only user management
- **Example**: a per-user `todos` resource stored in `app.db` (backend route + frontend page)
- **Workflow**: spec-driven multi-agent pipeline (architect → fullstack-developer → code-review → docs)

## Prerequisites

- [Bun](https://bun.sh) (runtime + package manager)
- [Claude Code](https://claude.com/claude-code) (for the agent workflow — optional, the app works without it)

No Docker or PostgreSQL required — the backend uses SQLite and creates its database files automatically.

## Install

```bash
bun install
cd frontend && bun install
cd ../backend && bun install
```

## Getting started

**1. Configure environment**

```bash
cp backend/.env.example backend/.env
# Edit backend/.env — set SEED_USER_EMAIL, SEED_USER_PASSWORD, BETTER_AUTH_SECRET
```

**2. Start the app**

```bash
bun run dev           # Start frontend (:3000) + backend (:3001) in parallel
bun run dev:frontend  # Frontend only
bun run dev:backend   # Backend only
```

On first start, the backend automatically creates the SQLite database files (`backend/data/app.db` and `backend/data/auth.db`), runs schema migrations, and creates the admin user from the env vars. Log in at `/login`, then open `/todos`.

To seed a few demo todos for the admin user:

```bash
cd backend && bun run seed
```

## Production

```bash
bun run build   # Build frontend to frontend/dist/
bun run start   # Serve API + frontend from backend on :3001
```

## Agent Workflow

Open Claude Code in the repo root and use:

| Command | Use when | What happens |
|---------|----------|--------------|
| `/change <description>` | New feature or bug fix | Asks clarifying questions, creates a `feat/*` or `fix/*` branch and a spec doc, then runs architect → **user approval gate** → fullstack-developer (implements + self-verifies) → code-reviewer → optional doc update → commit |
| `/improve [focus area]` | Optimize existing code | Analyzes the codebase, proposes changes, then runs the same implementation pipeline |

Both workflows end with a commit on a branch — review with `git diff main..HEAD`, merge when satisfied. They never push and never start the dev server.

### How agents communicate

Every change gets a spec doc in `_spec/` (from `_spec/_template.md`). Each pipeline stage owns one section:

```
/change writes:             Change (requirements)
architect writes:           Architecture (design, API contracts)
fullstack-developer reads:  Architecture → write code, then writes QA Report (pass/fail)
code-reviewer writes:       Code Review (diff-only correctness review)
technical-writer writes:    Technical Writer (doc changes)
```

### Subagents

Defined in `.claude/agents/`:

| Agent | Model | Role |
|-------|-------|------|
| architect | Opus | Designs the solution, defines API contracts |
| fullstack-developer | Sonnet | Implements React/TS + Hono/Bun changes in one pass, self-verifies (lint, format, typecheck, tests), writes the QA Report |
| code-reviewer | Opus | Independent review of the branch diff for correctness blockers — does not modify code |
| technical-writer | Haiku | Updates docs — only when truly necessary |

Conventions live in `.claude/steering/` (frontend.md, backend.md) — both humans and agents follow them.

## Project Structure

```
reclaude/
├── frontend/              # React 19 + Vite + TailwindCSS + shadcn/ui
├── backend/               # Hono + Bun
│   ├── migrations/        # Plain-SQL migrations (001_initial_schema.sql, …)
│   ├── data/              # SQLite files (created on first start, gitignored)
│   └── src/
├── _spec/                 # Spec docs (one per change) + template
├── CLAUDE.md              # Project context for Claude Code
├── .claude/
│   ├── commands/          # /change, /improve, /verify-ui, /ui-copy
│   ├── agents/            # Subagent definitions
│   ├── steering/          # Architecture & convention docs
│   └── settings.json      # Pre-approved permissions for the pipeline
└── package.json           # Root scripts (dev, build, start)
```

## Using this as a template

1. Copy the repo (or `git clone` + remove `.git`, then `git init`).
2. Rename in `package.json`, `index.html`, `CLAUDE.md` and the frontend/backend READMEs; replace the brand mark in `Navbar.tsx` / `AppLogo.tsx` and the `Impressum` placeholder.
3. Adjust `.claude/steering/*.md` if your stack diverges — the agents follow whatever is written there.
4. Add your own tables as `backend/migrations/00X_*.sql` and follow the `todos` example for routes + frontend pages.
5. Start building with `/change`.
