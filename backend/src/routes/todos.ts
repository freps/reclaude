import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";

import type { AuthUser } from "../lib/auth";

import { db } from "../lib/db";

type AuthVariables = { session: unknown; user: AuthUser };

const app = new Hono<{ Variables: AuthVariables }>();

type TodoDTO = {
  createdAt: string;
  done: boolean;
  id: string;
  title: string;
};

type TodoRow = {
  created_at: string;
  done: number;
  id: string;
  title: string;
  user_id: string;
};

/** Loads a todo and asserts it belongs to the current user. */
function findOwnTodo(id: string, userId: string): TodoRow {
  const row = db.query("SELECT * FROM todos WHERE id = ?").get(id) as null | TodoRow;
  if (!row || row.user_id !== userId) {
    throw new HTTPException(404, { message: "Todo not found." });
  }
  return row;
}

function toDTO(row: TodoRow): TodoDTO {
  return {
    createdAt: row.created_at,
    done: !!row.done,
    id: row.id,
    title: row.title,
  };
}

// ── GET /  — list the current user's todos ───────────────────────────────────
app.get("/", (c) => {
  const user = c.get("user");
  const rows = db
    .query("SELECT * FROM todos WHERE user_id = ? ORDER BY created_at DESC")
    .all(user.id) as TodoRow[];
  return c.json({ todos: rows.map(toDTO) });
});

// ── POST /  — create a todo ──────────────────────────────────────────────────
app.post("/", async (c) => {
  const user = c.get("user");
  const body = await c.req.json<{ title?: string }>();
  const title = body.title?.trim();
  if (!title) {
    throw new HTTPException(400, { message: "title is required." });
  }

  const id = crypto.randomUUID();
  db.run("INSERT INTO todos (id, user_id, title) VALUES (?, ?, ?)", [id, user.id, title]);
  const row = db.query("SELECT * FROM todos WHERE id = ?").get(id) as TodoRow;
  return c.json({ todo: toDTO(row) }, 201);
});

// ── PATCH /:id  — toggle done / rename ────────────────────────────────────────
app.patch("/:id", async (c) => {
  const user = c.get("user");
  const todo = findOwnTodo(c.req.param("id"), user.id);

  const body = await c.req.json<{ done?: boolean; title?: string }>();
  const done = body.done === undefined ? todo.done : body.done ? 1 : 0;
  const title = body.title === undefined ? todo.title : body.title.trim();
  if (!title) {
    throw new HTTPException(400, { message: "title must not be empty." });
  }

  db.run("UPDATE todos SET done = ?, title = ? WHERE id = ?", [done, title, todo.id]);
  const row = db.query("SELECT * FROM todos WHERE id = ?").get(todo.id) as TodoRow;
  return c.json({ todo: toDTO(row) });
});

// ── DELETE /:id  — delete a todo ──────────────────────────────────────────────
app.delete("/:id", (c) => {
  const user = c.get("user");
  const todo = findOwnTodo(c.req.param("id"), user.id);
  db.run("DELETE FROM todos WHERE id = ?", [todo.id]);
  return c.body(null, 204);
});

export default app;
