# Reclaude — Backend

Hono on Bun, with SQLite (`bun:sqlite`) and better-auth.

## Setup

```sh
bun install
cp .env.example .env   # then fill in the secrets
```

On first start the backend creates `data/app.db` and `data/auth.db`, runs the SQL migrations in `migrations/`, and bootstraps the admin user from `SEED_USER_EMAIL` / `SEED_USER_PASSWORD`.

## Development

```sh
bun run dev
```

Open http://localhost:3001

```sh
bun run seed        # Insert demo todos for the admin user (manual, dev only)
```

## Linting, Formatting & Tests

```sh
bun run lint        # Check for issues
bun run lint:fix    # Auto-fix issues
bun run format      # Format with Prettier
bun run typecheck   # Type check
bun test            # Run tests
```
