import { betterAuth } from "better-auth";
import { admin } from "better-auth/plugins";
import { Database } from "bun:sqlite";
import { mkdirSync } from "node:fs";

import { BunSqliteDialect } from "./bun-sqlite-dialect";

mkdirSync("data", { recursive: true });
const authDb = new Database("data/auth.db");

export const auth = betterAuth({
  basePath: "/api/auth",
  baseURL: process.env.BETTER_AUTH_URL ?? "http://localhost:3001",
  database: {
    dialect: new BunSqliteDialect({ database: authDb }),
    type: "sqlite",
  },
  emailAndPassword: { enabled: true },
  plugins: [admin({ adminRoles: ["admin"], defaultRole: "user" })],
  trustedOrigins: (process.env.TRUSTED_ORIGINS ?? "http://localhost:3000,http://localhost:3001")
    .split(",")
    .map((o) => o.trim()),
});

export type AuthUser = {
  banned: boolean | null;
  createdAt: Date;
  email: string;
  emailVerified: boolean;
  id: string;
  image?: null | string;
  name: string;
  role: UserRole;
  updatedAt: Date;
};

export type UserRole = "admin" | "user";

// ── Raw-SQL helpers on authDb ────────────────────────────────────────────────
// better-auth's admin endpoints (setRole/adminUpdateUser/banUser) require an
// admin session (headers). During bootstrap there is none, and the
// self-protection checks in the routes need direct read access without the
// admin-endpoint overhead. These helpers therefore encapsulate authDb access.

type UserRow = {
  banned: null | number;
  createdAt: string;
  email: string;
  id: string;
  name: string;
  role: null | string;
};

/** Number of active (non-banned) admins. */
export function countActiveAdmins(): number {
  const row = authDb
    .prepare(
      "SELECT COUNT(*) as c FROM user WHERE role = 'admin' AND (banned = 0 OR banned IS NULL)",
    )
    .get() as { c: number };
  return row?.c ?? 0;
}

/** Loads a user by ID (raw, without the admin endpoint). */
export function findUserById(id: string): null | {
  banned: boolean;
  createdAt: string;
  email: string;
  id: string;
  name: string;
  role: UserRole;
} {
  const row = authDb
    .prepare("SELECT id, name, email, role, banned, createdAt FROM user WHERE id = ?")
    .get(id) as null | (UserRow & { createdAt: string });
  if (!row) return null;
  return { ...mapUserRow(row)!, createdAt: row.createdAt ?? "" };
}

/** Returns the user ID for an email (e.g. for the seed), or null. */
export function findUserIdByEmail(email: string): null | string {
  const row = authDb.prepare("SELECT id FROM user WHERE email = ?").get(email) as null | {
    id: string;
  };
  return row?.id ?? null;
}

/** Sets a user's role by email (bootstrap, without a session). */
export function setUserRoleByEmail(email: string, role: UserRole): void {
  authDb.prepare("UPDATE user SET role = ? WHERE email = ?").run(role, email);
}

function mapUserRow(row: null | UserRow): null | {
  banned: boolean;
  email: string;
  id: string;
  name: string;
  role: UserRole;
} {
  if (!row) return null;
  return {
    banned: Boolean(row.banned ?? 0),
    email: row.email,
    id: row.id,
    name: row.name,
    role: (row.role as UserRole) ?? "user",
  };
}
