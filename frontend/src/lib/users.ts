export type Role = "admin" | "user";

export type UserDTO = {
  banned: boolean;
  createdAt: string;
  email: string;
  id: string;
  name: string;
  role: Role;
};

export type UserCreateBody = {
  email: string;
  name: string;
  password: string;
  role: Role;
};

export type UserUpdateBody = {
  banned?: boolean;
  email?: string;
  name?: string;
  resetPassword?: string;
  role?: Role;
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

export async function listUsers(): Promise<UserDTO[]> {
  const data = await request<{ users: UserDTO[] }>("/api/users");
  return data.users;
}

/** Loads the user list and picks a single user (no dedicated backend endpoint needed). */
export async function findUser(id: string): Promise<UserDTO> {
  const users = await listUsers();
  const user = users.find((u) => u.id === id);
  if (!user) throw new Error("User not found.");
  return user;
}

export async function createUser(body: UserCreateBody): Promise<UserDTO> {
  const data = await request<{ user: UserDTO }>("/api/users", {
    body: JSON.stringify(body),
    method: "POST",
  });
  return data.user;
}

export async function updateUser(id: string, body: UserUpdateBody): Promise<UserDTO> {
  const data = await request<{ user: UserDTO }>(`/api/users/${id}`, {
    body: JSON.stringify(body),
    method: "PATCH",
  });
  return data.user;
}

/** Deactivate = ban (DELETE, 204 No Content). */
export async function banUser(id: string): Promise<void> {
  await request<void>(`/api/users/${id}`, { method: "DELETE" });
}

/** Reactivate = unban (PATCH banned:false, returns the updated user). */
export async function reactivateUser(id: string): Promise<UserDTO> {
  return updateUser(id, { banned: false });
}

export function formatDate(iso: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" });
}
