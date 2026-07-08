import { useCallback, useState } from "react";

import { authClient } from "@/lib/auth-client";

export function useAuth() {
  const session = authClient.useSession();
  const [error, setError] = useState<null | string>(null);
  const [isLoading, setIsLoading] = useState(false);

  const signInWithEmail = useCallback(
    async (email: string, password: string): Promise<{ error: null | string }> => {
      setError(null);
      setIsLoading(true);

      try {
        const result = await authClient.signIn.email({ email, password });

        if (result.error) {
          const msg = result.error.message ?? "Sign-in failed.";
          setError(msg);
          return { error: msg };
        }

        return { error: null };
      } catch (e) {
        const message = e instanceof Error ? e.message : "Unknown error.";
        setError(message);
        return { error: message };
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const signOut = useCallback(async () => {
    await authClient.signOut();
  }, []);

  return { error, isLoading, session, signInWithEmail, signOut };
}
