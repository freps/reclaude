import type { ContentfulStatusCode } from "hono/utils/http-status";

import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";

import type { AuthUser, UserRole } from "../lib/auth";

import { auth, countActiveAdmins, findUserById } from "../lib/auth";

type AuthVariables = { session: unknown; user: AuthUser };

const app = new Hono<{ Variables: AuthVariables }>();

type AdminApiError = {
  body?: undefined | { code?: string; message?: string };
  statusCode?: number | undefined;
};

type UserDTO = {
  banned: boolean;
  createdAt: string;
  email: string;
  id: string;
  name: string;
  role: UserRole;
};

function requireRole(value: string): UserRole {
  if (value !== "admin" && value !== "user") {
    throw new HTTPException(400, { message: "Role must be 'admin' or 'user'." });
  }
  return value;
}

/** Translates a better-auth APIError into an HTTPException with a matching status. */
function throwFromBetterAuthError(e: unknown, fallback: string): never {
  const err = e as AdminApiError;
  const code = err?.body?.code ?? "";
  const message = err?.body?.message;

  if (code.includes("USER_ALREADY_EXISTS")) {
    throw new HTTPException(409, { message: "A user with this email already exists." });
  }
  if (code.includes("USER_NOT_FOUND")) {
    throw new HTTPException(404, { message: "User not found." });
  }
  if (code.includes("PASSWORD_CANNOT_BE_UPDATED")) {
    throw new HTTPException(400, {
      message: "Password cannot be set via this endpoint.",
    });
  }

  const status = err?.statusCode ?? 500;
  const statusCode = (status >= 400 && status < 600 ? status : 500) as ContentfulStatusCode;
  throw new HTTPException(statusCode, { message: message ?? fallback });
}

/** Maps a better-auth user (from listUsers) to the frontend DTO. */
function toUserDTO(user: {
  banned: boolean | null;
  createdAt: Date | string;
  email: string;
  id: string;
  name: string;
  role?: string | undefined;
}): UserDTO {
  return {
    banned: Boolean(user.banned ?? false),
    createdAt:
      user.createdAt instanceof Date ? user.createdAt.toISOString() : String(user.createdAt ?? ""),
    email: user.email,
    id: user.id,
    name: user.name,
    role: (user.role as UserRole) ?? "user",
  };
}

// ── GET /  — list all users ──────────────────────────────────────────────────
app.get("/", async (c) => {
  const result = await auth.api.listUsers({
    headers: c.req.raw.headers,
    query: { limit: 1000 },
  });
  const users = (result?.users ?? []) as Parameters<typeof toUserDTO>[0][];
  return c.json({ users: users.map(toUserDTO) });
});

// ── POST /  — create a user ──────────────────────────────────────────────────
app.post("/", async (c) => {
  const body = await c.req.json<{
    email: string;
    name: string;
    password: string;
    role: string;
  }>();

  if (!body.email || !body.name || !body.password) {
    throw new HTTPException(400, { message: "name, email, and password are required." });
  }
  const role = requireRole(body.role ?? "user");

  try {
    const res = (await auth.api.createUser({
      body: { email: body.email, name: body.name, password: body.password, role },
      headers: c.req.raw.headers,
    })) as { user: Parameters<typeof toUserDTO>[0] };
    return c.json({ user: toUserDTO(res.user) }, 201);
  } catch (e) {
    throwFromBetterAuthError(e, "User could not be created.");
  }
});

// ── PATCH /:id  — update a user ──────────────────────────────────────────────
app.patch("/:id", async (c) => {
  const targetId = c.req.param("id");
  const actor = c.get("user") as AuthUser;

  // Rule 1: no self-modification (forbids self-ban, self-delete, self-demotion).
  if (targetId === actor.id) {
    throw new HTTPException(403, { message: "You cannot modify your own account." });
  }

  const target = findUserById(targetId);
  if (!target) throw new HTTPException(404, { message: "User not found." });

  const body = await c.req.json<{
    banned?: boolean | undefined;
    email?: string | undefined;
    name?: string | undefined;
    resetPassword?: string | undefined;
    role?: string | undefined;
  }>();

  const newRole = body.role !== undefined ? requireRole(body.role) : target.role;
  const willBan = body.banned === true;
  const willDemote = target.role === "admin" && newRole === "user";

  // Rule 2: at least 1 active admin must remain. Only banning or demoting an
  // admin reduces the number of active admins — a regular user may be
  // deactivated even in a single-admin setup.
  if (target.role === "admin" && (willBan || willDemote) && countActiveAdmins() <= 1) {
    throw new HTTPException(403, { message: "At least one admin must remain active." });
  }

  const headers = c.req.raw.headers;

  // 1) name / email
  const data: { email?: string; image?: string; name?: string } = {};
  if (body.name !== undefined) data.name = body.name;
  if (body.email !== undefined) data.email = body.email;
  if (Object.keys(data).length > 0) {
    try {
      await auth.api.adminUpdateUser({ body: { data, userId: targetId }, headers });
    } catch (e) {
      throwFromBetterAuthError(e, "User could not be updated.");
    }
  }

  // 2) role
  if (body.role !== undefined && newRole !== target.role) {
    try {
      await auth.api.setRole({ body: { role: newRole, userId: targetId }, headers });
    } catch (e) {
      throwFromBetterAuthError(e, "Role could not be set.");
    }
  }

  // 3) resetPassword
  if (body.resetPassword) {
    try {
      await auth.api.setUserPassword({
        body: { newPassword: body.resetPassword, userId: targetId },
        headers,
      });
    } catch (e) {
      throwFromBetterAuthError(e, "Password could not be set.");
    }
  }

  // 4) banned (toggle status)
  if (body.banned !== undefined) {
    try {
      if (willBan) {
        await auth.api.banUser({ body: { userId: targetId }, headers });
      } else {
        await auth.api.unbanUser({ body: { userId: targetId }, headers });
      }
    } catch (e) {
      throwFromBetterAuthError(e, "Status could not be changed.");
    }
  }

  const updated = findUserById(targetId);
  if (!updated) throw new HTTPException(500, { message: "User not found after update." });
  return c.json({ user: toUserDTO(updated) });
});

// ── DELETE /:id  — deactivate (ban), no hard delete ──────────────────────────
app.delete("/:id", async (c) => {
  const targetId = c.req.param("id");
  const actor = c.get("user") as AuthUser;

  if (targetId === actor.id) {
    throw new HTTPException(403, { message: "You cannot deactivate your own account." });
  }

  const target = findUserById(targetId);
  if (!target) throw new HTTPException(404, { message: "User not found." });

  if (target.role === "admin" && countActiveAdmins() <= 1) {
    throw new HTTPException(403, { message: "At least one admin must remain active." });
  }

  try {
    await auth.api.banUser({ body: { userId: targetId }, headers: c.req.raw.headers });
  } catch (e) {
    throwFromBetterAuthError(e, "User could not be deactivated.");
  }

  return c.body(null, 204);
});

export default app;
