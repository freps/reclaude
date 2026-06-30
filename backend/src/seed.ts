// Demo seed — inserts a few example todos for the admin user.
// Run manually with `bun run seed`; never runs automatically on startup.

import { findUserIdByEmail } from "./lib/auth";
import { db, runAppMigrations } from "./lib/db";

await runAppMigrations();

const email = process.env.SEED_USER_EMAIL ?? "admin@example.local";
const userId = findUserIdByEmail(email);

if (!userId) {
  console.error(
    `[seed] No user found for ${email}. Start the server once so the admin user is created, then re-run the seed.`,
  );
  process.exit(1);
}

const existing = db.query("SELECT COUNT(*) AS c FROM todos WHERE user_id = ?").get(userId) as {
  c: number;
};

if (existing.c > 0) {
  console.warn(`[seed] User already has ${existing.c} todos — skipping.`);
  process.exit(0);
}

const demo = [
  { done: 1, title: "Read the README" },
  { done: 0, title: "Copy backend/.env.example to backend/.env" },
  { done: 0, title: "Build your first feature with /change" },
];

for (const t of demo) {
  db.run("INSERT INTO todos (id, user_id, title, done) VALUES (?, ?, ?, ?)", [
    crypto.randomUUID(),
    userId,
    t.title,
    t.done,
  ]);
}

console.warn(`[seed] Inserted ${demo.length} demo todos for ${email}.`);
