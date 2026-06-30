import { adminClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

// No explicit baseURL: better-auth would call `new URL(baseURL)` on it, and a
// relative path like "/api/auth" has no protocol, so it throws at module load
// (blanking any page that imports the client). Omitting it makes the client use
// `window.location.origin` + the default basePath "/api/auth" — matching the
// backend handler and the Vite dev proxy.
//
// `adminClient` ergänzt die Session-Typen um `role`/`banned` (Server-seitig via
// admin-Plugin) und stellt die Admin-Client-Actions bereit.
export const authClient = createAuthClient({
  plugins: [adminClient()],
});

export const { signIn, signOut, signUp, useSession } = authClient;
