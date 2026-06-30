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

// ── Raw-SQL Helpers auf authDb ───────────────────────────────────────────────
// Die Admin-Endpoints von better-auth (setRole/adminUpdateUser/banUser) verlangen
// eine Admin-Session (Headers). Beim Bootstrap fehlt diese, und für die
// Selbst-Schutz-Checks in den Routen brauchen wir direkten Lesezugriff ohne den
// Admin-Endpoint-Overhead. Daher kapseln diese Helper den Zugriff auf authDb.

type UserRow = {
  banned: null | number;
  createdAt: string;
  email: string;
  id: string;
  name: string;
  role: null | string;
};

/** Anzahl der aktiven (nicht gebannten) Admins. */
export function countActiveAdmins(): number {
  const row = authDb
    .prepare(
      "SELECT COUNT(*) as c FROM user WHERE role = 'admin' AND (banned = 0 OR banned IS NULL)",
    )
    .get() as { c: number };
  return row?.c ?? 0;
}

/** Lädt einen User anhand seiner ID (raw, ohne Admin-Endpoint). */
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

/** Liefert die User-ID zu einer E-Mail (z. B. für den Seed), oder null. */
export function findUserIdByEmail(email: string): null | string {
  const row = authDb.prepare("SELECT id FROM user WHERE email = ?").get(email) as null | {
    id: string;
  };
  return row?.id ?? null;
}

/** Setzt die Rolle eines Users anhand der E-Mail (Bootstrap, ohne Session). */
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
