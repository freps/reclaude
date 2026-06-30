import { getMigrations } from "better-auth/db/migration";

import type { auth as AuthInstance } from "./auth";

export async function runMigrations(authInstance: typeof AuthInstance): Promise<void> {
  const { runMigrations: run } = await getMigrations(authInstance.options);
  await run();
}
