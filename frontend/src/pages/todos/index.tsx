import { ListChecks, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

import AppBreadcrumb from "@/components/AppBreadcrumb";
import DList from "@/components/DList";
import DListRow from "@/components/DListRow";
import Navbar from "@/components/Navbar";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button/button";
import { Checkbox } from "@/components/ui/checkbox/checkbox";
import { Input } from "@/components/ui/input/input";
import { useToast } from "@/hooks/useToast";
import { createTodo, deleteTodo, listTodos, updateTodo, type TodoDTO } from "@/lib/todos";

export default function TodosPage() {
  const { showToast } = useToast();

  const [todos, setTodos] = useState<TodoDTO[]>([]);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    listTodos()
      .then(setTodos)
      .catch((e: Error) => showToast(e.message))
      .finally(() => setLoading(false));
  }, [showToast]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const value = title.trim();
    if (!value || busy) return;
    setBusy(true);
    try {
      const todo = await createTodo(value);
      setTodos((prev) => [todo, ...prev]);
      setTitle("");
    } catch (err) {
      showToast((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function handleToggle(todo: TodoDTO) {
    try {
      const updated = await updateTodo(todo.id, { done: !todo.done });
      setTodos((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    } catch (err) {
      showToast((err as Error).message);
    }
  }

  async function handleDelete(todo: TodoDTO) {
    try {
      await deleteTodo(todo.id);
      setTodos((prev) => prev.filter((t) => t.id !== todo.id));
    } catch (err) {
      showToast((err as Error).message);
    }
  }

  const openCount = todos.filter((t) => !t.done).length;

  return (
    <div className="bg-background min-h-screen">
      <Navbar />

      <main className="mx-auto max-w-3xl px-6 py-10">
        <AppBreadcrumb crumbs={[{ label: "Todos" }]} />

        <div className="mt-4">
          <PageHeader
            leading={
              <span className="bg-card border-border flex size-11 items-center justify-center rounded-xl border">
                <ListChecks className="text-primary size-5" />
              </span>
            }
            title="Todos"
            subtitle={loading ? "Loading…" : `${openCount} open · ${todos.length} total`}
          />
        </div>

        <form className="mt-6 flex gap-2" onSubmit={handleAdd}>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What needs to be done?"
            aria-label="New todo"
          />
          <Button type="submit" disabled={busy || !title.trim()}>
            <Plus className="size-4" />
            Add
          </Button>
        </form>

        <div className="mt-6">
          {!loading && todos.length === 0 ? (
            <p className="text-muted-foreground border-border rounded-xl border border-dashed px-4 py-10 text-center text-sm">
              No todos yet. Add your first one above.
            </p>
          ) : (
            <DList>
              {todos.map((todo) => (
                <DListRow key={todo.id} className="gap-3">
                  <Checkbox checked={todo.done} onCheckedChange={() => handleToggle(todo)} />
                  <span
                    className={todo.done ? "text-muted-foreground flex-1 line-through" : "flex-1"}
                  >
                    {todo.title}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Delete"
                    onClick={() => handleDelete(todo)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </DListRow>
              ))}
            </DList>
          )}
        </div>
      </main>
    </div>
  );
}
