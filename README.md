# Reclaude — React Claude Code Template

Batteries-included boilerplate for classic frontend/backend apps, wired for agent-driven development with [Claude Code](https://claude.com/claude-code).

- **Frontend**: React 19 + TypeScript + Vite + TailwindCSS v4 + shadcn/ui
- **Backend**: Hono + Bun
- **Database**: SQLite (file-based — no Docker, no PostgreSQL)
- **Auth**: better-auth (email/password) with protected routes and admin-only user management
- **Example**: a per-user `todos` resource (backend route + frontend page) to copy from
- **Workflow**: spec-driven multi-agent pipeline (architect → developer → code review → docs)

## Quick Start (5 minutes)

**Prerequisite**: [Bun](https://bun.sh) installed (`curl -fsSL https://bun.sh/install | bash`).

**1. Install** — one command, installs all workspaces:

```bash
bun install
```

**2. Configure** — copy the env file and set three values:

```bash
cp backend/.env.example backend/.env
```

Open `backend/.env` and set `SEED_USER_EMAIL`, `SEED_USER_PASSWORD`, and a random `BETTER_AUTH_SECRET`. The defaults work for a quick local test.

**3. Start**:

```bash
bun run dev
```

You should see the frontend on **http://localhost:3000** and the backend on **:3001**. On first start the backend creates the SQLite files (`backend/data/`), runs migrations, and creates the admin user from your env vars.

**4. Try it**: open http://localhost:3000/login, log in with `SEED_USER_EMAIL` / `SEED_USER_PASSWORD`, then open `/todos` and add a todo. Optional demo data: `cd backend && bun run seed`.

**5. Build your first feature** (needs [Claude Code](https://claude.com/claude-code)): open Claude Code in the repo root and type:

```
/change Add a priority field (low/medium/high) to todos
```

Claude asks a few clarifying questions, designs the change, waits for **your approval**, implements it on a branch, reviews it, and commits. You review with `git diff main..HEAD` and merge when happy. That's the whole loop.

## Using This as a Template

Everything after step 1 is done by prompting — no manual renaming, no hand-written SQL.

1. Copy the repo (or `git clone` + remove `.git`, then `git init`).
2. Rebrand by prompt — ask Claude directly, e.g.:
   ```
   Rebrand this template to "Acme Portal": package names, page titles,
   the brand mark in the navbar/logo, and the imprint placeholder.
   ```
3. Replace the example data model by prompt:
   ```
   /change Replace the todos example with a "projects" resource
   (name, status, due date) including list/create/edit pages
   ```
   The pipeline writes the SQL migration, backend route, and frontend pages for you — migrations run automatically on the next start, so you never create a table by hand.
4. If your stack diverges, tell Claude to update `.claude/steering/*.md` — the agents follow whatever is written there.
5. Keep building with `/change`.

## Agent Workflow

Open Claude Code in the repo root and use:

| Command | Use when | What happens |
|---------|----------|--------------|
| `/change <description>` | New feature or bug fix | Clarifying questions → branch + spec doc → architect → **your approval** → implementation + self-check → independent code review → commit |
| `/improve [focus area]` | Optimize existing code | Analysis → proposal → same implementation pipeline |
| `/verify-ui <what>` | Check a UI feature in the running app | Claude drives the browser (Chrome DevTools MCP) and verifies the feature end-to-end |

Both workflows end with a commit on a `feat/*` or `fix/*` branch — review with `git diff main..HEAD`, merge when satisfied. They never push and never start the dev server.

### How agents communicate

Every change gets a spec doc in `_spec/` (from `_spec/_template.md`). Each pipeline stage owns one section:

```
/change writes:             Change (requirements)
architect writes:           Architecture (design, API contracts)
fullstack-developer reads:  Architecture → writes code, then the QA Report (pass/fail)
code-reviewer writes:       Code Review (diff-only correctness review)
technical-writer writes:    Technical Writer (doc changes, only when needed)
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

## Hooks

Three hooks (wired up in `.claude/settings.json`, scripts in `.claude/hooks/`) run automatically so code style and docs never drift:

| Hook | Runs | What it does |
|------|------|--------------|
| `lint-fix.sh` | after every file edit | Runs `bun run lint:fix` in the affected workspace (frontend/backend); remaining errors are fed back to the agent |
| `steering-dirty.sh` | after every file edit | Marks the affected side as changed (lightweight dirty flag) |
| `update-steering.sh` | when a task finishes | Regenerates the auto-managed sections in `.claude/steering/*.md`: the folder tree deterministically (`steering-tree.ts`), the reusable-component catalogs via a small headless Claude run (Haiku, debounced to every 10 min) |

The auto-managed sections are wrapped in `<!-- BEGIN: … -->` / `<!-- END: … -->` markers — never edit inside them by hand; everything outside the markers is yours.

## FAQ / Troubleshooting

**Do I need Docker or PostgreSQL?**
No. The backend uses SQLite; the database files are created automatically in `backend/data/` on first start.

**Login fails / no admin user exists.**
The admin user is created on first start from `SEED_USER_EMAIL` / `SEED_USER_PASSWORD` in `backend/.env`. If you set them *after* the first start, stop the server, delete `backend/data/auth.db`, and start again.

**Port 3000 or 3001 is already in use.**
`bun run dev` kills stale processes on both ports before starting (`predev` script). If it still fails, find the blocker with `lsof -ti:3000,3001`.

**When should I use `/change` vs. just asking Claude to code?**
`/change` for anything feature-sized — it forces a spec, an approval gate, and an independent review. Direct edits are fine for small ad-hoc fixes; the steering docs still apply.

**How do I add a new database table?**
Prompt it: `/change Add a persisted <resource> with fields …`. The pipeline writes the SQL migration (`backend/migrations/00X_*.sql`), the backend route, and the frontend pages following the `todos` example. Migrations run automatically on startup — no table is ever created by hand.

**What is the `_spec/` folder?**
One markdown doc per change — the shared workspace of the agent pipeline (requirements, architecture, QA, review). It's the audit trail of how each feature was built.

**What runs automatically in the background?**
See the [Hooks](#hooks) chapter: auto-lint after every edit, steering-doc regeneration after each task.

**Why is there a `bunfig.toml` with `linker = "hoisted"`?**
The shadcn/ui components import `@radix-ui/react-*` packages that come in transitively via the `radix-ui` umbrella package. Bun's default isolated linker for workspaces would hide them.

## Production

```bash
bun run build   # Build frontend to frontend/dist/
bun run start   # Serve API + frontend from backend on :3001
```

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
│   ├── commands/          # /change, /improve, /verify-ui
│   ├── agents/            # Subagent definitions
│   ├── steering/          # Architecture & convention docs
│   ├── hooks/             # Auto-lint + steering-doc regeneration
│   └── settings.json      # Pre-approved permissions for the pipeline
└── package.json           # Root scripts (dev, build, start) + workspaces
```
