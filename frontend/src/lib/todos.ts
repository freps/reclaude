export type TodoDTO = {
  createdAt: string;
  done: boolean;
  id: string;
  title: string;
};

// ── Internal fetch helper ────────────────────────────────────────────────────
async function request<T>(input: string, init?: RequestInit): Promise<T> {
  const res = await fetch(input, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });

  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error ?? `Request failed: ${res.status}`);
  }

  // 204 (DELETE) → no body
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export async function listTodos(): Promise<TodoDTO[]> {
  const data = await request<{ todos: TodoDTO[] }>("/api/todos");
  return data.todos;
}

export async function createTodo(title: string): Promise<TodoDTO> {
  const data = await request<{ todo: TodoDTO }>("/api/todos", {
    body: JSON.stringify({ title }),
    method: "POST",
  });
  return data.todo;
}

export async function updateTodo(
  id: string,
  patch: { done?: boolean; title?: string },
): Promise<TodoDTO> {
  const data = await request<{ todo: TodoDTO }>(`/api/todos/${id}`, {
    body: JSON.stringify(patch),
    method: "PATCH",
  });
  return data.todo;
}

export async function deleteTodo(id: string): Promise<void> {
  await request<void>(`/api/todos/${id}`, { method: "DELETE" });
}
