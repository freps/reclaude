# Backend Architecture

## Tech Stack

- Hono (web framework)
- Bun (runtime + package manager)
- TypeScript (strict mode)
- ESLint (typescript-eslint, perfectionist, prettier)
- Prettier (formatting)
- better-auth (authentication framework)
- bun:sqlite (built-in SQLite driver — no extra package)
- Kysely (only for better-auth's BunSqliteDialect — not used in app routes)

## Folder Structure

```
backend/
├── migrations/           # Plain-SQL migrations (001_initial_schema.sql, etc.) — outside src/
├── data/                 # SQLite files (gitignored, created automatically on first start)
│   ├── app.db            # App data (todos, … — your own tables)
│   └── auth.db           # better-auth (users, sessions, accounts)
├── src/
│   ├── index.ts          # App entry point — creates Hono instance, mounts routes, exports server
│   ├── lib/              # Shared configuration and utilities (auth.ts, db.ts, bun-sqlite-dialect.ts, …)
│   ├── routes/           # Route modules (each exports a Hono instance)
│   └── middleware/       # Custom middleware
├── .env                  # Local environment (copy from .env.example)
├── .env.example          # Example environment file
├── package.json
└── tsconfig.json
```

## Code Style

### General

- Use double quotes for strings.
- Use semicolons.
- Use `const` by default; `let` only when reassignment is needed.
- Prefer early returns over nested conditionals.
- Use `type` keyword instead of `interface` for TypeScript type definitions.
- Use type imports (`import type { X } from "y"`) separated from value imports.
- Imports sorted alphabetically (eslint-plugin-perfectionist, natural sort).
- Object keys sorted alphabetically.
- Unused variables prefixed with `_` are allowed; others trigger warnings.
- `console.log` is warned; use `console.warn` or `console.error` instead.

### Routing (Hono Best Practices)

- Do NOT create "controller" classes or functions. Write handlers inline after path definitions for proper type inference.
- Each route domain gets its own file in `src/routes/` that exports a `Hono` instance.
- Mount route modules in `index.ts` via `app.route("/path", routeModule)`.
- For larger apps, chain methods for RPC type inference: `const app = new Hono().get(...).post(...)`.

```ts
// ✅ Correct — inline handler, types inferred
app.get("/users/:id", (c) => {
  const id = c.req.param("id"); // type-safe
  return c.json({ id });
});

// ❌ Wrong — separate controller function loses type inference
const getUser = (c: Context) => { ... };
app.get("/users/:id", getUser);
```

### Middleware

- Use Hono's built-in middleware where available (logger, cors, etc.).
- Custom middleware goes in `src/middleware/`.
- Apply global middleware in `index.ts` before route mounting.

### Shared Configuration & Libraries

- Put shared configuration (e.g., auth setup, database instances) in `src/lib/`.
- `src/lib/db.ts` exports the `bun:sqlite` `Database` instance (`db`) for `data/app.db` and `runAppMigrations()`. App routes import `db` directly and use synchronous prepared statements — no `await` on DB calls.
- `src/lib/auth.ts` exports the betterAuth instance, backed by its own `Database("data/auth.db")` via `BunSqliteDialect`.
- `src/lib/bun-sqlite-dialect.ts` — custom Kysely dialect adapter for bun:sqlite (used only by better-auth).
- External API clients (e.g., payment gateways, mail providers) belong in `src/lib/` as well. Each client should be a focused, pure function or class that encapsulates the API call and error handling (throw `HTTPException` for predictable errors). Keep clients stateless and testable.

### Database Migrations

- App migration files live in `backend/migrations/` (outside `src/`) and are plain SQL: `001_initial_schema.sql`, `002_feature_name.sql`, etc.
- `runAppMigrations()` (exported from `src/lib/db.ts`) reads and applies pending `.sql` files on startup; progress is tracked in the `schema_migrations` table in `data/app.db`.
- better-auth runs its own migrations separately via `runMigrations(auth)` (`src/lib/migrate.ts`), which creates and maintains `user`, `session`, `account`, `verification` tables in `data/auth.db`. Do not touch these tables manually.
- `bun run seed` inserts demo data manually and never runs automatically.

### DB Query Patterns

`bun:sqlite` is **synchronous** — no `await` on DB calls. Handlers remain `async` for `c.req.json()` etc., but DB access is sync:

```ts
// SELECT one row
const row = db.query("SELECT * FROM todos WHERE id = ?").get(id) as TodoRow | null;

// SELECT multiple rows
const rows = db.query("SELECT * FROM todos WHERE user_id = ? ORDER BY created_at DESC").all(userId) as TodoRow[];

// INSERT / UPDATE / DELETE
db.run("INSERT INTO todos (id, user_id, title) VALUES (?, ?, ?)", [id, userId, title]);

// Dynamic IN — guard for empty array first
if (ids.length > 0) {
  db.query(`SELECT * FROM t WHERE id IN (${ids.map(() => "?").join(",")})`).all(...ids);
}
```

Store JSON fields as `TEXT`: parse on read with `JSON.parse(row.field ?? "{}")`, write with `JSON.stringify(value)`. Boolean columns (e.g. `done`) are stored as `INTEGER` 0/1; cast with `!!row.done`.

### Startup Sequence

`index.ts` runs in this order on every start — do not reorder:

1. `runAppMigrations()` (from `./lib/db`) — applies pending SQL migrations from `backend/migrations/*.sql`; creates `data/app.db` if absent
2. `runMigrations(auth)` — applies better-auth table migrations to `data/auth.db`
3. Admin user bootstrap — creates user from `SEED_USER_EMAIL` / `SEED_USER_PASSWORD` if not exists (silent no-op if already present)
4. Serve HTTP on port 3001

No `DATABASE_URL` required — SQLite files are created automatically in `backend/data/`.

### Naming

- Route files: kebab-case (`user-profiles.ts`).
- Middleware files: kebab-case (`auth-guard.ts`).
- Types: PascalCase, co-located or in a `types/` directory when shared.

## Server Configuration

- Port: 3001 (frontend runs on 3000).
- Dev mode: `bun run --hot src/index.ts` (hot reload without restart).
- Export format: `export default { port, fetch: app.fetch }`.

## Inline Comments

- Do not add obvious comments.
- Add comments only for non-obvious logic, workarounds, or business rules.
- Use `// TODO:` for planned improvements.
- Use `// HACK:` for temporary workarounds.

## Error Handling

- Use Hono's `HTTPException` for expected errors.
- Use a global `app.onError()` handler for unexpected errors.
- Return consistent JSON error responses: `{ error: string, status: number }`.

## Testing

- Use `bun:test` with Hono's request helper (`app.request()`).
- Test files co-located: `src/routes/health.test.ts`.
