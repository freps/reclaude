import { createMiddleware } from "hono/factory";

import type { AuthUser, UserRole } from "../lib/auth";

import { auth } from "../lib/auth";

export const requireAuth = createMiddleware(async (c, next) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });

  if (!session) {
    return c.json({ error: "Unauthorized", status: 401 }, 401);
  }

  c.set("user", session.user as AuthUser);
  c.set("session", session.session);
  await next();
});

export const requireAdmin = createMiddleware(async (c, next) => {
  const user = c.get("user") as AuthUser | undefined;

  if (!user || (user.role as UserRole) !== "admin") {
    return c.json({ error: "Forbidden", status: 403 }, 403);
  }

  await next();
});
