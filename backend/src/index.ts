import { Hono } from "hono";
import { serveStatic } from "hono/bun";
import { HTTPException } from "hono/http-exception";
import { logger } from "hono/logger";

import { auth, setUserRoleByEmail } from "./lib/auth";
import { runAppMigrations } from "./lib/db";
import { runMigrations } from "./lib/migrate";
import { requireAdmin, requireAuth } from "./middleware/auth";
import health from "./routes/health";
import hello from "./routes/hello";
import todos from "./routes/todos";
import users from "./routes/users";

// ── Startup sequence (do not reorder) ────────────────────────────────────────
// 1) app schema migrations (data/app.db)  2) better-auth migrations (data/auth.db)
await runAppMigrations();
await runMigrations(auth);

// 3) Bootstrap an admin user on first start if env vars are set.
const adminEmail = process.env.SEED_USER_EMAIL;
const adminPassword = process.env.SEED_USER_PASSWORD;
if (adminEmail && adminPassword) {
  try {
    await auth.api.signUpEmail({
      body: { email: adminEmail, name: "Admin", password: adminPassword },
    });
    // The seed user is created with defaultRole "user" → promote to admin
    // (only runs when the user was newly created; otherwise signUpEmail throws).
    setUserRoleByEmail(adminEmail, "admin");
    console.warn(`[bootstrap] admin user created: ${adminEmail}`);
  } catch {
    // Already exists — fine.
  }
}

const app = new Hono();

app.use(logger());

app.onError((err, c) => {
  if (err instanceof HTTPException) {
    return c.json({ error: err.message, status: err.status }, err.status);
  }
  console.error(err);
  return c.json({ error: "Internal server error", status: 500 }, 500);
});

// better-auth handler — must be registered before the serveStatic catch-all.
app.on(["GET", "POST"], "/api/auth/*", (c) => auth.handler(c.req.raw));

// ── Public routes ─────────────────────────────────────────────────────────────
app.route("/api/health", health);
app.route("/api/hello", hello);

// ── Protected: todos (example app.db resource, per-user) ──────────────────────
app.use("/api/todos", requireAuth);
app.use("/api/todos/*", requireAuth);
app.route("/api/todos", todos);

// ── Admin-only: user management. Guard both the exact and the sub-path so the
// list endpoint (/api/users) is not bypassed ("/api/users/*" only matches paths
// with a segment after /api/users).
app.use("/api/users", requireAuth);
app.use("/api/users/*", requireAuth);
app.use("/api/users", requireAdmin);
app.use("/api/users/*", requireAdmin);
app.route("/api/users", users);

// ── Serve the built frontend in production ────────────────────────────────────
app.use("/*", serveStatic({ root: "../frontend/dist" }));
app.use("/*", serveStatic({ path: "../frontend/dist/index.html" }));

export default {
  fetch: app.fetch,
  port: 3001,
};
