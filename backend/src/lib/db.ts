import { Database } from "bun:sqlite";
import { mkdirSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

mkdirSync("data", { recursive: true });

export const db = new Database("data/app.db");
db.exec("PRAGMA journal_mode = WAL;");
db.exec("PRAGMA foreign_keys = ON;");

export async function runAppMigrations(): Promise<void> {
  db.exec(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id     INTEGER PRIMARY KEY AUTOINCREMENT,
      name   TEXT NOT NULL UNIQUE,
      run_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  const migrationsDir = join(import.meta.dir, "../../migrations");
  const files = readdirSync(migrationsDir)
    .filter((f) => f.endsWith(".sql"))
    .sort();

  for (const file of files) {
    const alreadyRun = db.query("SELECT 1 FROM schema_migrations WHERE name = ?").get(file);
    if (alreadyRun) continue;

    const sql = readFileSync(join(migrationsDir, file), "utf-8");
    db.exec(sql);
    db.run("INSERT INTO schema_migrations (name) VALUES (?)", [file]);
    console.warn(`[migrate] applied: ${file}`);
  }
}
