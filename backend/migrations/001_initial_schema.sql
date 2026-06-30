-- App schema (data/app.db). better-auth manages its own tables in data/auth.db.
-- This is the example "todos" resource — per-user, stored in app.db.

CREATE TABLE todos (
  id         TEXT PRIMARY KEY,
  user_id    TEXT NOT NULL,
  title      TEXT NOT NULL,
  done       INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_todos_user ON todos (user_id, created_at DESC);
